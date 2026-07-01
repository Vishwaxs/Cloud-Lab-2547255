"""
make_sample_data.py
-------------------
Utility that (re)generates the two sample spreadsheets used by the CIA-1
practical: ``userfile.xlsx`` and ``employeefile.xlsx``.

These stand in for the "users" and "employees" datasets described in the
question paper. Run it once before Question 1:

    python make_sample_data.py
"""
from pathlib import Path

from openpyxl import Workbook

HERE = Path(__file__).resolve().parent

USER_ROWS = [
    ("UserID", "Full Name", "Email", "City", "Plan"),
    (1, "Aarav Sharma", "aarav.sharma@example.com", "Bengaluru", "Premium"),
    (2, "Diya Patel", "diya.patel@example.com", "Mumbai", "Standard"),
    (3, "Kabir Nair", "kabir.nair@example.com", "Kochi", "Premium"),
    (4, "Ananya Rao", "ananya.rao@example.com", "Hyderabad", "Basic"),
    (5, "Vivaan Gupta", "vivaan.gupta@example.com", "Delhi", "Standard"),
]

EMPLOYEE_ROWS = [
    ("EmpID", "Full Name", "Department", "Designation", "Salary"),
    (101, "Rohan Mehta", "Engineering", "Senior Developer", 1450000),
    (102, "Isha Verma", "Human Resources", "HR Manager", 1200000),
    (103, "Arjun Reddy", "Finance", "Financial Analyst", 980000),
    (104, "Sara Khan", "Engineering", "DevOps Engineer", 1350000),
    (105, "Neha Joshi", "Marketing", "Marketing Lead", 1100000),
]


def write_workbook(path: Path, sheet_title: str, rows: list) -> None:
    """Write ``rows`` (first row = header) to a single-sheet .xlsx file."""
    wb = Workbook()
    ws = wb.active
    ws.title = sheet_title
    for row in rows:
        ws.append(row)
    # Widen columns a little so the files look tidy when opened.
    for column_cells in ws.columns:
        width = max(len(str(c.value)) for c in column_cells) + 2
        ws.column_dimensions[column_cells[0].column_letter].width = width
    wb.save(path)
    print(f"  created {path.name} ({path.stat().st_size} bytes)")


def main() -> None:
    print("Generating sample datasets:")
    write_workbook(HERE / "userfile.xlsx", "Users", USER_ROWS)
    write_workbook(HERE / "employeefile.xlsx", "Employees", EMPLOYEE_ROWS)
    print("Done.")


if __name__ == "__main__":
    main()
