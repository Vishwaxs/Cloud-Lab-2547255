"""
CIA-3 / ML for Social Good Ensemble Challenge
Stage 1 - extract flood labels from ASDMA DRIMS Daily Flood Report PDFs.

Source : https://sdrf.assam.gov.in/dfr/  (ASDMA, Government of Assam)
Input  : data/raw/drims_daily_flood/Daily_Flood_Report_YYYY-MM-DD.pdf
Output : data/interim/drims_affected_long.csv     one row per (date, district) reported affected
         data/interim/drims_daily_summary.csv     one row per date
         data/interim/drims_parse_issues.csv      anything that did not parse cleanly

DESIGN - why it is written this way
-----------------------------------
The reports are a single tall table whose *row labels* live in column 0 and whose
column count varies between PDFs (8-13 observed). Parsing by column index is therefore
unsafe; parsing by row label is stable. A section runs from a non-empty column-0 label
until the next non-empty column-0 label.

Only TWO sections are authoritative for "which districts were flood-affected":

  1. 'District Affected'             -> a count plus a comma-separated district list
  2. 'Name Of Revenue Circle Affected' -> one row per affected district

Later sections (Population And Crop Area, Relief Camps, Inmates, ...) MUST NOT be used:
they list districts with all-zero rows that were NOT reported affected. For example
2026-06-20 lists Bongaigaon with zeros under 'Population And Crop Area Submerged' while
the affected districts are only Dhemaji, Dibrugarh and Charaideo. Reading those sections
manufactures false positives.

The two authoritative sections are extracted independently and cross-checked. Any
disagreement is recorded in drims_parse_issues.csv rather than silently resolved.

Nothing is imputed, interpolated or repaired.
"""
from __future__ import annotations

import glob
import os
import re
import sys

import pandas as pd
import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "data", "raw", "drims_daily_flood")
INTERIM = os.path.join(ROOT, "data", "interim")

SEC_DISTRICT_LIST = "district affected"
SEC_REVENUE_CIRCLE = "name of revenue circle affected"
SEC_RIVERS = "rivers flowing above danger level"

# Column-0 labels that terminate the blocks we care about.
NOT_A_DISTRICT = {"", "district", "total", "nil", "na", "n/a", "-"}


def clean(c) -> str:
    return "" if c is None else re.sub(r"\s+", " ", str(c)).strip()


def normalise_spacing(s: str) -> str:
    """Collapse whitespace only. Raw spelling is preserved for auditability."""
    return re.sub(r"\s+", " ", s).strip()


def canon_key(s: str) -> str:
    """Letters-only comparison key.

    PDF text extraction wraps long cells mid-word, so the same district appears as
    'Lakhimpur', 'Lakhimp ur' and 'Lakhimpu r'; 'Dima-Hasao' also appears as
    'Dima- Hasao', and 'Kamrup (M)' as 'Kamr up M'. Stripping every non-letter makes
    those collapse to one key without fuzzy matching.
    """
    return re.sub(r"[^a-z]", "", s.lower())


def iter_rows(pdf):
    """Yield cleaned cell-lists for every table row in the document, in order."""
    for page in pdf.pages:
        for tbl in page.extract_tables() or []:
            for row in tbl:
                yield [clean(c) for c in row]


def read_header(pdf) -> tuple[str, str]:
    """Return (report_type, internal_date_iso) read from the report's own title.

    The portal cannot be trusted to return the report that was requested:
      - some dates return an 'Assam Urban Flood Report' or 'Assam Storm Report'
        instead of the riverine 'Assam Flood Report';
      - some dates return a DIFFERENT date's report entirely (e.g. the file
        requested for 2025-05-24 contains the report for 22-05-2025).
    So the title line is authoritative and the filename is only a hint.
    """
    txt = pdf.pages[0].extract_text() or ""
    m = re.search(r"(Assam[ A-Za-z]*?Report)\s+as on\s+(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})", txt)
    if not m:
        return "UNKNOWN", ""
    rtype = re.sub(r"\s+", " ", m.group(1)).strip()
    raw = m.group(2)
    if re.fullmatch(r"\d{2}-\d{2}-\d{4}", raw):      # dd-mm-yyyy
        d, mth, y = raw.split("-")
        iso = f"{y}-{mth}-{d}"
    else:                                             # already yyyy-mm-dd
        iso = raw
    return rtype, iso


def parse_pdf(path: str) -> dict:
    """Return the two independent district readings plus context for one report."""
    file_date = re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(path)).group(1)

    section = ""
    declared_count = None
    listed: list[str] = []          # from 'District Affected'
    circle_districts: list[str] = []  # from 'Name Of Revenue Circle Affected'
    rivers_above_dl = ""

    with pdfplumber.open(path) as pdf:
        report_type, internal_date = read_header(pdf)
        for cells in iter_rows(pdf):
            if not cells:
                continue
            head = cells[0]
            if head:
                section = head.lower()

            rest = cells[1:]

            # --- rivers above danger level (context, not a label) -----------------
            if section.startswith(SEC_RIVERS) and not rivers_above_dl:
                for i, c in enumerate(rest):
                    if c.lower().startswith("rivers flowing above danger level"):
                        tail = [x for x in rest[i + 1:] if x]
                        if tail:
                            rivers_above_dl = tail[0]
                        break

            # --- section 1: 'District Affected' ----------------------------------
            if section.startswith(SEC_DISTRICT_LIST):
                # the payload row is: <count> , <comma separated district list>
                for i, c in enumerate(rest):
                    if re.fullmatch(r"\d{1,3}", c):
                        tail = [x for x in rest[i + 1:] if x]
                        if tail:
                            # separator is normally ',' but at least one report
                            # (2025-05-30: 'Cachar. Kamrup M') uses a full stop
                            names = [n.strip() for n in re.split(r"[,;]|\.\s+", tail[0])]
                            names = [n for n in names if n and n.lower() not in NOT_A_DISTRICT]
                            if names:
                                declared_count = int(c)
                                listed = names
                        break

            # --- section 2: 'Name Of Revenue Circle Affected' --------------------
            elif section.startswith(SEC_REVENUE_CIRCLE):
                # rows look like:  <district> ~ <n circles> ~ <circle list>
                if len(rest) >= 2:
                    name, nxt = rest[0], rest[1]
                    if (name.lower() not in NOT_A_DISTRICT
                            and re.fullmatch(r"\d{1,3}", nxt)
                            and re.fullmatch(r"[A-Za-z][A-Za-z .()'\-]{1,40}", name)):
                        circle_districts.append(name)

    return {
        "file_date": file_date,
        "report_type": report_type,
        "internal_date": internal_date,
        "declared_count": declared_count,
        "listed": listed,
        "circle_districts": circle_districts,
        "rivers_above_dl": rivers_above_dl,
    }


def main() -> int:
    os.makedirs(INTERIM, exist_ok=True)
    files = sorted(glob.glob(os.path.join(RAW, "*.pdf")))
    if not files:
        print(f"No PDFs in {RAW}", file=sys.stderr)
        return 1
    print(f"parsing {len(files)} DRIMS reports ...")

    long_rows, summary_rows, issues = [], [], []

    for n, f in enumerate(files, 1):
        try:
            r = parse_pdf(f)
        except Exception as e:  # noqa: BLE001 - record and continue, never silently drop
            issues.append({"date": os.path.basename(f), "issue": "parse_exception", "detail": str(e)[:200]})
            continue

        # --- gate 1: only the riverine 'Assam Flood Report' is in scope --------
        if r["report_type"] != "Assam Flood Report":
            issues.append({"date": r["file_date"], "issue": "wrong_report_type",
                           "detail": f"report_type='{r['report_type']}' - EXCLUDED"})
            continue

        # --- gate 2: the report's own date wins over the filename -------------
        if not r["internal_date"]:
            issues.append({"date": r["file_date"], "issue": "no_internal_date", "detail": "EXCLUDED"})
            continue
        if r["internal_date"] != r["file_date"]:
            issues.append({"date": r["file_date"], "issue": "date_mismatch",
                           "detail": f"portal served {r['internal_date']} - re-keyed to that date"})
        date = r["internal_date"]

        # De-duplicate on the letters-only key so PDF line-wrap variants collapse,
        # but keep the 'District Affected' spelling as the representative because
        # that cell is short and therefore never wrapped.
        def dedup(names):
            out = {}
            for x in names:
                k = canon_key(normalise_spacing(x))
                if k and k not in out:
                    out[k] = normalise_spacing(x)
            return out

        listed_u = dedup(r["listed"])       # {key: spelling}
        circle_u = dedup(r["circle_districts"])

        # Union is the reported set; agreement is tracked so it can be audited.
        union_keys = list(dict.fromkeys(list(listed_u) + list(circle_u)))
        only_listed = sorted(set(listed_u) - set(circle_u))
        only_circle = sorted(set(circle_u) - set(listed_u))

        if r["declared_count"] is not None and len(listed_u) != r["declared_count"]:
            issues.append({"date": date, "issue": "count_mismatch",
                           "detail": f"declared={r['declared_count']} parsed_list={len(listed_u)} ({listed_u})"})
        if only_listed or only_circle:
            issues.append({"date": date, "issue": "section_disagreement",
                           "detail": f"only_in_district_list={only_listed} only_in_revenue_circle={only_circle}"})
        if not union_keys:
            # a genuine no-flood day: 'No. of Districts Affected 0' and 'Nil' rows.
            # Recorded so it can be audited, but it is DATA, not an error.
            issues.append({"date": date, "issue": "zero_districts_affected",
                           "detail": "verified pattern: declared count 0 / Nil rows"})

        for k in union_keys:
            long_rows.append({
                "date": date,
                "district_raw": listed_u.get(k) or circle_u.get(k),
                "district_key": k,
                "in_district_list": k in listed_u,
                "in_revenue_circle": k in circle_u,
            })

        summary_rows.append({
            "date": date,
            "file_date": r["file_date"],
            "report_type": r["report_type"],
            "declared_count": r["declared_count"],
            "n_from_district_list": len(listed_u),
            "n_from_revenue_circle": len(circle_u),
            "n_union": len(union_keys),
            "sections_agree": set(listed_u) == set(circle_u),
            "rivers_above_danger_level": r["rivers_above_dl"],
        })

        if n % 40 == 0:
            print(f"  {n}/{len(files)}")

    s = pd.DataFrame(summary_rows)
    lon = pd.DataFrame(long_rows)

    # --- gate 3: two files may resolve to the same internal date --------------
    dups = s[s.duplicated("date", keep=False)].sort_values("date")
    if len(dups):
        for _, row in dups.iterrows():
            issues.append({"date": row["date"], "issue": "duplicate_internal_date",
                           "detail": f"from file_date={row['file_date']}, n_union={row['n_union']}"})
        # keep the copy whose filename matched its own internal date; else the first
        s["_self"] = (s["date"] == s["file_date"]).astype(int)
        s = (s.sort_values(["date", "_self"], ascending=[True, False])
               .drop_duplicates("date", keep="first")
               .drop(columns="_self"))
        lon = lon[lon["date"].isin(set(s["date"]))]
        lon = lon.drop_duplicates(["date", "district_key"], keep="first")

    lon.to_csv(os.path.join(INTERIM, "drims_affected_long.csv"), index=False)
    s.to_csv(os.path.join(INTERIM, "drims_daily_summary.csv"), index=False)
    pd.DataFrame(issues).to_csv(os.path.join(INTERIM, "drims_parse_issues.csv"), index=False)

    print(f"\nPDF files read               : {len(files)}")
    print(f"kept as 'Assam Flood Report' : {len(s)} distinct dates")
    print(f"affected (date,district) rows: {len(lon)}")
    print(f"days with zero affected      : {int((s['n_union'] == 0).sum())}")
    print(f"sections agree               : {int(s['sections_agree'].sum())} / {len(s)}")
    print(f"duplicate internal dates     : {len(dups)}")
    print(f"issues logged                : {len(issues)}")
    print(f"distinct raw district names  : {lon['district_raw'].nunique() if len(lon) else 0}")
    print(f"distinct district keys       : {lon['district_key'].nunique() if len(lon) else 0}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
