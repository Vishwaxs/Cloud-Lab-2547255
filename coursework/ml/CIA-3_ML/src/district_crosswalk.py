"""
CIA-3 - canonical Assam district crosswalk.

Two independent sources spell districts differently:
  DRIMS (ASDMA)  : 'Morigaon', 'Sivasagar', 'Kamrup (M)', 'Sribhumi', 'Dima-Hasao'
  CWC (NWDP)     : 'Marigaon', 'Sivsagar',  'Kamrup',     'Karimganj'

Matching is done on a letters-only key (see canon_key) so that PDF line-wrap
artifacts collapse automatically. Everything else is an EXPLICIT mapping - no fuzzy
matching, because a wrong auto-match would silently mislabel a district.

Administrative notes that matter here:
  * Karimganj district was renamed **Sribhumi** in 2024. CWC files (older) still say
    Karimganj; DRIMS (current) says Sribhumi. They are the same district.
  * 'Kamrup (M)' is Kamrup Metropolitan - a SEPARATE district from Kamrup (Rural).
    CWC publishes only 'Kamrup'; it is NOT merged with Kamrup Metropolitan here.
  * Bajali (2021), Tamulpur (2022) and Biswanath/Hojai were created/split from parent
    districts. They are kept distinct.
"""
from __future__ import annotations

import re

# ---------------------------------------------------------------- canonical set
# The 35 districts of Assam (post-2023 restoration), using DRIMS-style spelling.
ASSAM_DISTRICTS = [
    "Baksa", "Bajali", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
    "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan",
    "Karbi Anglong", "West Karbi Anglong", "Kokrajhar", "Lakhimpur", "Majuli",
    "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
    "Sribhumi", "Tamulpur", "Tinsukia", "Udalguri",
]


def canon_key(s: str) -> str:
    """Letters-only comparison key (mirrors parse_drims_reports.canon_key)."""
    return re.sub(r"[^a-z]", "", str(s).lower())


# Auto-map every canonical name to itself via its key.
_KEY_TO_CANON: dict[str, str] = {canon_key(d): d for d in ASSAM_DISTRICTS}

# ------------------------------------------------------- explicit variant mapping
# key (letters-only, lowercase)  ->  canonical district
_EXPLICIT = {
    # --- DRIMS variants ---
    "kamrupm": "Kamrup Metropolitan",
    "kamrupmetro": "Kamrup Metropolitan",
    "kamrupmetropolitan": "Kamrup Metropolitan",
    "dimahasao": "Dima Hasao",
    "karbianglongwest": "West Karbi Anglong",
    "westkarbianglong": "West Karbi Anglong",
    "southsalmara": "South Salmara-Mankachar",
    "southsalmaramankachar": "South Salmara-Mankachar",
    # --- CWC / NWDP variants ---
    "marigaon": "Morigaon",       # CWC spelling
    "sivsagar": "Sivasagar",      # CWC spelling
    "sibsagar": "Sivasagar",      # older spelling
    "karimganj": "Sribhumi",      # renamed 2024 - same district
    "northlakhimpur": "Lakhimpur",
    "kamrupr": "Kamrup",
    "kamruprural": "Kamrup",
}
_KEY_TO_CANON.update(_EXPLICIT)


def to_canonical(name: str) -> str | None:
    """Map any observed spelling to a canonical district, or None if unrecognised.

    Returning None is deliberate: an unrecognised name must surface in the audit
    rather than be guessed at.
    """
    return _KEY_TO_CANON.get(canon_key(name))


def audit(names) -> tuple[dict, list]:
    """Return ({name: canonical}, [unmapped names])."""
    mapped, unmapped = {}, []
    for n in sorted(set(names)):
        c = to_canonical(n)
        if c is None:
            unmapped.append(n)
        else:
            mapped[n] = c
    return mapped, unmapped


if __name__ == "__main__":
    print(f"{len(ASSAM_DISTRICTS)} canonical districts")
    print(f"{len(_KEY_TO_CANON)} keys recognised ({len(_EXPLICIT)} explicit variants)")
