"""
Silta — Demo Document Generator
Generates realistic mortgage demo documents for Dylan Verhoeven.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

OUT = "/home/claude/demo_docs"
os.makedirs(OUT, exist_ok=True)

W, H = A4  # 595.27 x 841.89 pt

# ── Brand colours ──────────────────────────────────────────────────────────────
NAVY    = colors.HexColor("#0E2238")
BLUE    = colors.HexColor("#4A7CA8")
GREEN   = colors.HexColor("#3FA876")
AMBER   = colors.HexColor("#B9762A")
LGRAY   = colors.HexColor("#F6F8FA")
MGRAY   = colors.HexColor("#CBD3DC")
DGRAY   = colors.HexColor("#5C6773")
WHITE   = colors.white
BLACK   = colors.HexColor("#16202B")

# ── Customer data ──────────────────────────────────────────────────────────────
CUSTOMER = {
    "name":        "Dylan Verhoeven",
    "address":     "Keizersgracht 158, 1016 EZ Amsterdam",
    "dob":         "15-04-1993",
    "bsn":         "123.456.789",
    "iban":        "NL91 ABNA 0417 1643 00",
    "email":       "dylan.verhoeven@example.nl",
    "phone":       "+31 6 87 65 43 21",
}

EMPLOYER = {
    "name":       "Tech Company BV",
    "address":    "Prins Hendrikkade 212, 1011 TD Amsterdam",
    "kvk":        "68 23 45 91",
    "contact":    "Sophie Janssen — HR Manager",
    "email":      "hr@techcompanybv.nl",
}

GROSS_MONTHLY   = 4_250
NET_MONTHLY     = 3_182
PENSION_MONTHLY = 212
TAX_MONTHLY     = 856

# ── Reusable drawing helpers ───────────────────────────────────────────────────

def header_band(c, title, subtitle, logo_text, logo_color=NAVY, line_color=NAVY):
    """Full-width dark header band with logo text + document title."""
    c.setFillColor(logo_color)
    c.rect(0, H - 72, W, 72, fill=1, stroke=0)
    # Logo wordmark
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(30, H - 38, logo_text)
    # Subtitle line under logo
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#A0B8CC"))
    c.drawString(30, H - 52, subtitle)
    # Document title (right-aligned)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 13)
    c.drawRightString(W - 30, H - 38, title)
    # Accent line
    c.setStrokeColor(line_color)
    c.setLineWidth(3)
    c.line(0, H - 73, W, H - 73)

def footer(c, page_num=None, note=None):
    """Footer with reference text and optional page number."""
    c.setFillColor(LGRAY)
    c.rect(0, 0, W, 26, fill=1, stroke=0)
    c.setFillColor(DGRAY)
    c.setFont("Helvetica", 7)
    text = note or "This is a demonstration document generated for the Silta mortgage MVP. Not a real financial document."
    c.drawString(20, 9, text)
    if page_num:
        c.drawRightString(W - 20, 9, f"Page {page_num}")

def section_rule(c, y, label=None, color=BLUE):
    c.setStrokeColor(color)
    c.setLineWidth(0.8)
    c.line(30, y, W - 30, y)
    if label:
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(30, y + 4, label.upper())

def kv_row(c, y, label, value, label_x=30, value_x=220, bold_value=False):
    c.setFont("Helvetica", 9)
    c.setFillColor(DGRAY)
    c.drawString(label_x, y, label)
    c.setFont("Helvetica-Bold" if bold_value else "Helvetica", 9)
    c.setFillColor(BLACK)
    c.drawString(value_x, y, value)

def money(n):
    return f"€ {n:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

# ══════════════════════════════════════════════════════════════════════════════
# 1. SALARY SLIPS (3 months)
# ══════════════════════════════════════════════════════════════════════════════

SLIP_MONTHS = [
    ("Maart 2025", "March 2025",  "2025-03-28", "2025-03-01", "2025-03-31"),
    ("April 2025", "April 2025",  "2025-04-28", "2025-04-01", "2025-04-30"),
    ("Mei 2025",   "May 2025",    "2025-05-28", "2025-05-01", "2025-05-31"),
]

for nl_month, en_month, pay_date, period_start, period_end in SLIP_MONTHS:
    fname = f"{OUT}/salary_slip_{en_month.lower().replace(' ','_')}.pdf"
    c = canvas.Canvas(fname, pagesize=A4)

    header_band(c, "Loonstrook / Salary Slip", "Tech Company BV · Amsterdam", "Tech Company BV")

    # Period info block
    y = H - 100
    c.setFillColor(LGRAY)
    c.roundRect(30, y - 34, W - 60, 42, 4, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(NAVY)
    c.drawString(42, y - 8,  "Medewerker / Employee")
    c.drawString(220, y - 8, "Periode / Period")
    c.drawString(380, y - 8, "Betaaldatum / Pay Date")
    c.setFont("Helvetica", 9)
    c.setFillColor(BLACK)
    c.drawString(42, y - 22,  CUSTOMER["name"])
    c.drawString(220, y - 22, f"{period_start}  –  {period_end}")
    c.drawString(380, y - 22, pay_date)

    # Earnings table
    y -= 58
    section_rule(c, y, "Verdiensten / Earnings", GREEN)
    y -= 14

    rows_earnings = [
        ("Basissalaris / Base salary",       f"{GROSS_MONTHLY:,} × 1,0000", money(GROSS_MONTHLY)),
        ("Vakantiegeld opbouw / Holiday pay (8%)", f"{GROSS_MONTHLY:,} × 0,0800", money(int(GROSS_MONTHLY * 0.08))),
    ]
    for label, calc, val in rows_earnings:
        c.setFont("Helvetica", 9);  c.setFillColor(DGRAY);   c.drawString(42, y, label)
        c.setFont("Helvetica", 9);  c.setFillColor(DGRAY);   c.drawString(300, y, calc)
        c.setFont("Helvetica-Bold", 9); c.setFillColor(BLACK); c.drawRightString(W - 30, y, val)
        y -= 14

    # Gross total
    y -= 4
    c.setFillColor(LGRAY)
    c.rect(30, y - 5, W - 60, 18, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 9); c.setFillColor(NAVY)
    c.drawString(42, y + 5, "Bruto salaris / Gross salary")
    c.drawRightString(W - 30, y + 5, money(GROSS_MONTHLY))
    y -= 24

    # Deductions
    section_rule(c, y, "Inhoudingen / Deductions", AMBER)
    y -= 14

    rows_ded = [
        ("Loonheffing / Income tax",            money(TAX_MONTHLY)),
        ("Pensioenpremie / Pension contribution", money(PENSION_MONTHLY)),
        ("ZVW bijdrage / Health insurance",      money(GROSS_MONTHLY - NET_MONTHLY - TAX_MONTHLY - PENSION_MONTHLY)),
    ]
    for label, val in rows_ded:
        c.setFont("Helvetica", 9); c.setFillColor(DGRAY);   c.drawString(42, y, label)
        c.setFont("Helvetica", 9); c.setFillColor(BLACK);    c.drawRightString(W - 30, y, f"- {val}")
        y -= 14

    # Net total
    y -= 4
    c.setFillColor(colors.HexColor("#E5F6ED"))
    c.roundRect(30, y - 6, W - 60, 22, 4, fill=1, stroke=0)
    c.setStrokeColor(GREEN); c.setLineWidth(1)
    c.roundRect(30, y - 6, W - 60, 22, 4, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 11); c.setFillColor(colors.HexColor("#256E4C"))
    c.drawString(42, y + 6, "Netto te betalen / Net pay")
    c.drawRightString(W - 30, y + 6, money(NET_MONTHLY))
    y -= 34

    # Payment info
    section_rule(c, y, "Betalingsinformatie / Payment details", BLUE)
    y -= 16
    kv_row(c, y, "IBAN",           CUSTOMER["iban"]);                y -= 13
    kv_row(c, y, "Omschrijving",   f"Salaris {nl_month} — {CUSTOMER['name']}"); y -= 13
    kv_row(c, y, "BSN",            CUSTOMER["bsn"]);                 y -= 13
    kv_row(c, y, "Functie / Role", "Software Engineer — Grade 4");   y -= 13
    kv_row(c, y, "Contract",       "Onbepaalde tijd / Permanent");   y -= 26

    # Employer signature block
    c.setFillColor(LGRAY); c.rect(30, y - 30, W - 60, 38, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
    c.drawString(42, y + 2, "Werkgever / Employer")
    c.setFont("Helvetica", 8); c.setFillColor(BLACK)
    c.drawString(42, y - 10, EMPLOYER["name"])
    c.drawString(42, y - 21, EMPLOYER["address"])
    c.drawString(42, y - 32, f"KvK: {EMPLOYER['kvk']}   |   Contact: {EMPLOYER['contact']}")
    c.drawString(W // 2, y + 2, "Medewerker / Employee signature")
    c.setStrokeColor(MGRAY); c.setLineWidth(0.5)
    c.line(W // 2, y - 20, W - 30, y - 20)

    footer(c, "1/1", f"Loonstrook {nl_month} · {CUSTOMER['name']} · BSN {CUSTOMER['bsn']}")
    c.save()
    print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 2. EMPLOYMENT CONTRACT
# ══════════════════════════════════════════════════════════════════════════════

fname = f"{OUT}/employment_contract_techcompany.pdf"
c = canvas.Canvas(fname, pagesize=A4)

header_band(c, "Employment Contract", "Permanent Employment Agreement", "Tech Company BV")

y = H - 105
c.setFont("Helvetica-Bold", 14); c.setFillColor(NAVY)
c.drawString(30, y, "EMPLOYMENT AGREEMENT — PERMANENT CONTRACT")
y -= 6
c.setStrokeColor(GREEN); c.setLineWidth(2); c.line(30, y, W - 30, y)
y -= 18

c.setFont("Helvetica", 9); c.setFillColor(DGRAY)
c.drawString(30, y, "This agreement is entered into between the Employer and the Employee named below.")
y -= 20

# Parties block
for title, name, addr in [
    ("EMPLOYER", EMPLOYER["name"], EMPLOYER["address"]),
    ("EMPLOYEE", CUSTOMER["name"], CUSTOMER["address"]),
]:
    c.setFillColor(LGRAY); c.rect(30, y - 28, W - 60, 36, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
    c.drawString(42, y + 2, title)
    c.setFont("Helvetica-Bold", 9); c.setFillColor(BLACK)
    c.drawString(42, y - 10, name)
    c.setFont("Helvetica", 8); c.setFillColor(DGRAY)
    c.drawString(42, y - 20, addr)
    y -= 44

y -= 4
section_rule(c, y, "Article 1 — Position & Start Date", NAVY)
y -= 16
kv_row(c, y, "Job title:",         "Software Engineer — Grade 4");          y -= 13
kv_row(c, y, "Department:",        "Product Engineering");                   y -= 13
kv_row(c, y, "Start date:",        "01 March 2023");                        y -= 13
kv_row(c, y, "Contract type:",     "Permanent (onbepaalde tijd)");           y -= 13
kv_row(c, y, "Probation period:",  "Completed (2 months — ended May 2023)"); y -= 22

section_rule(c, y, "Article 2 — Working Hours & Location", NAVY)
y -= 16
kv_row(c, y, "Hours per week:",   "40 hours (full-time)");                  y -= 13
kv_row(c, y, "Work location:",    "Amsterdam (hybrid — 3 days on-site)");   y -= 13
kv_row(c, y, "Work schedule:",    "Monday – Friday");                        y -= 22

section_rule(c, y, "Article 3 — Remuneration", NAVY)
y -= 16
kv_row(c, y, "Gross monthly salary:", money(GROSS_MONTHLY), bold_value=True); y -= 13
kv_row(c, y, "Holiday allowance:",    "8% of gross annual salary (paid in May)"); y -= 13
kv_row(c, y, "Salary review:",        "Annual — each March 1st");            y -= 13
kv_row(c, y, "Payment method:",       f"Monthly via IBAN {CUSTOMER['iban']}"); y -= 22

section_rule(c, y, "Article 4 — Benefits", NAVY)
y -= 16
kv_row(c, y, "Pension:",         f"Collective scheme — {money(PENSION_MONTHLY)}/month employer contribution"); y -= 13
kv_row(c, y, "Holiday days:",    "26 days per calendar year");              y -= 13
kv_row(c, y, "Travel allowance:", "€0.23/km (max 40 km one-way)");          y -= 22

section_rule(c, y, "Article 5 — Notice Period", NAVY)
y -= 16
kv_row(c, y, "Employee notice:", "1 month");                                y -= 13
kv_row(c, y, "Employer notice:", "2 months (permanent contract)");          y -= 22

section_rule(c, y, "Article 6 — Confidentiality & IP", NAVY)
y -= 16
c.setFont("Helvetica", 8.5); c.setFillColor(BLACK)
c.drawString(42, y, "The Employee agrees to maintain strict confidentiality regarding all proprietary information, client data,")
y -= 11
c.drawString(42, y, "source code, and business strategies. All intellectual property created during employment remains the")
y -= 11
c.drawString(42, y, "property of Tech Company BV.")
y -= 20

# Signatures
section_rule(c, y, "Signatures", NAVY)
y -= 20
sig_cols = [(42, "On behalf of Tech Company BV", EMPLOYER["contact"], "Amsterdam, 01 March 2023"),
            (W//2 + 10, "Employee", CUSTOMER["name"], f"Amsterdam, 01 March 2023")]
for x, role, name, date in sig_cols:
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY); c.drawString(x, y, role)
    c.setStrokeColor(MGRAY); c.setLineWidth(0.5); c.line(x, y - 22, x + 190, y - 22)
    c.setFont("Helvetica", 8); c.setFillColor(DGRAY)
    c.drawString(x, y - 30, name)
    c.drawString(x, y - 40, date)

footer(c, "1/1", f"Employment Agreement · {CUSTOMER['name']} · Tech Company BV · KvK {EMPLOYER['kvk']}")
c.save()
print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 3. BANK STATEMENTS (3 months)
# ══════════════════════════════════════════════════════════════════════════════

BANK_MONTHS = [
    ("March 2025", "2025-03-01", "2025-03-31", 5_840, 6_120),
    ("April 2025", "2025-04-01", "2025-04-30", 6_120, 6_480),
    ("May 2025",   "2025-05-01", "2025-05-31", 6_480, 6_822),
]

TRANSACTIONS = {
    "March 2025": [
        ("2025-03-01", "Opening balance",                         "",         5_840.00),
        ("2025-03-03", "Albert Heijn — Groceries",               "- 78.45",     None),
        ("2025-03-05", "NS Abonnement — Train subscription",     "- 89.00",     None),
        ("2025-03-07", "Netflix B.V.",                           "- 13.99",     None),
        ("2025-03-08", "Huur betaling — Rent",                   "- 950.00",    None),
        ("2025-03-10", "Ziggo B.V. — Internet",                  "- 44.95",     None),
        ("2025-03-12", "Jumbo Supermarkt",                       "- 62.30",     None),
        ("2025-03-15", "Gym subscription",                       "- 29.99",     None),
        ("2025-03-17", "Albert Heijn — Groceries",               "- 55.10",     None),
        ("2025-03-20", "Thuisbezorgd.nl",                        "- 24.80",     None),
        ("2025-03-25", "Spotify Premium",                        "- 9.99",      None),
        ("2025-03-28", "Tech Company BV — Salaris maart 2025",   "+ 3,182.00",  None),
        ("2025-03-29", "Spaarrekening overboeking",              "- 300.00",    None),
        ("2025-03-31", "Closing balance",                        "",         6_120.00),
    ],
    "April 2025": [
        ("2025-04-01", "Opening balance",                         "",         6_120.00),
        ("2025-04-02", "Albert Heijn — Groceries",               "- 91.20",     None),
        ("2025-04-03", "Huur betaling — Rent",                   "- 950.00",    None),
        ("2025-04-05", "NS Abonnement",                          "- 89.00",     None),
        ("2025-04-07", "Bol.com",                                "- 47.95",     None),
        ("2025-04-09", "Ziggo B.V.",                             "- 44.95",     None),
        ("2025-04-12", "Jumbo Supermarkt",                       "- 58.75",     None),
        ("2025-04-14", "Netflix B.V.",                           "- 13.99",     None),
        ("2025-04-16", "Albert Heijn — Groceries",               "- 66.40",     None),
        ("2025-04-20", "Gym subscription",                       "- 29.99",     None),
        ("2025-04-22", "Dinner — Restaurant de Kas",             "- 88.50",     None),
        ("2025-04-25", "Spotify Premium",                        "- 9.99",      None),
        ("2025-04-28", "Tech Company BV — Salaris april 2025",  "+ 3,182.00",  None),
        ("2025-04-29", "Spaarrekening overboeking",              "- 300.00",    None),
        ("2025-04-30", "Closing balance",                         "",         6_480.00),
    ],
    "May 2025": [
        ("2025-05-01", "Opening balance",                         "",         6_480.00),
        ("2025-05-02", "Huur betaling — Rent",                   "- 950.00",    None),
        ("2025-05-03", "Albert Heijn — Groceries",               "- 84.15",     None),
        ("2025-05-05", "NS Abonnement",                          "- 89.00",     None),
        ("2025-05-08", "Tech Company BV — Vakantiegeld",        "+ 4,080.00",  None),
        ("2025-05-09", "Ziggo B.V.",                             "- 44.95",     None),
        ("2025-05-10", "Spaarrekening — vakantiegeld",          "- 4,000.00",  None),
        ("2025-05-12", "Jumbo Supermarkt",                       "- 71.30",     None),
        ("2025-05-14", "Netflix B.V.",                           "- 13.99",     None),
        ("2025-05-16", "Bol.com — aankoop",                     "- 129.00",    None),
        ("2025-05-18", "Gym subscription",                       "- 29.99",     None),
        ("2025-05-20", "Albert Heijn — Groceries",               "- 59.80",     None),
        ("2025-05-24", "Spotify Premium",                        "- 9.99",      None),
        ("2025-05-28", "Tech Company BV — Salaris mei 2025",    "+ 3,182.00",  None),
        ("2025-05-29", "Spaarrekening overboeking",              "- 300.00",    None),
        ("2025-05-31", "Closing balance",                        "",         6_822.00),
    ],
}

for month_label, period_start, period_end, open_bal, close_bal in BANK_MONTHS:
    fname = f"{OUT}/bank_statement_{month_label.lower().replace(' ','_')}.pdf"
    c = canvas.Canvas(fname, pagesize=A4)
    header_band(c, "Bank Statement", "ABN AMRO Bank N.V. · Rekeningafschrift", "ABN AMRO", NAVY, GREEN)

    y = H - 100
    # Account info strip
    c.setFillColor(LGRAY); c.rect(30, y - 38, W - 60, 46, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
    for lbl, val, lx in [
        ("Account holder", CUSTOMER["name"], 42),
        ("IBAN",           CUSTOMER["iban"], 230),
        ("Period",         f"{period_start}  –  {period_end}", 390),
    ]:
        c.drawString(lx, y + 2, lbl)
        c.setFont("Helvetica", 9); c.setFillColor(BLACK); c.drawString(lx, y - 10, val)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
    kv_row(c, y - 24, "Address:", CUSTOMER["address"], 42, 120)

    y -= 58
    # Transactions header
    c.setFillColor(NAVY); c.rect(30, y - 12, W - 60, 18, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(WHITE)
    c.drawString(38, y - 4, "DATE")
    c.drawString(105, y - 4, "DESCRIPTION")
    c.drawString(410, y - 4, "AMOUNT")
    c.drawRightString(W - 32, y - 4, "BALANCE")
    y -= 20

    txns = TRANSACTIONS[month_label]
    running = open_bal
    for i, (date, desc, amount, fixed_bal) in enumerate(txns):
        if fixed_bal is not None:
            bal = fixed_bal
        else:
            delta = float(amount.replace(",", "").replace("+ ", "").replace("- ", "").strip())
            if amount.startswith("+"):
                running += delta
            else:
                running -= delta
            bal = running

        # Alternate row shading
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#F9FAFB"))
            c.rect(30, y - 9, W - 60, 16, fill=1, stroke=0)

        c.setFont("Helvetica", 8); c.setFillColor(DGRAY); c.drawString(38, y - 2, date)
        c.setFont("Helvetica", 8.5)
        if date in ("2025-03-01", "2025-04-01", "2025-05-01", "2025-03-31", "2025-04-30", "2025-05-31"):
            c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8.5)
        else:
            c.setFillColor(BLACK)
        c.drawString(105, y - 2, desc)

        if amount:
            col = colors.HexColor("#256E4C") if amount.startswith("+") else colors.HexColor("#C0443F")
            c.setFont("Helvetica-Bold", 8.5); c.setFillColor(col)
            c.drawString(410, y - 2, amount)

        c.setFont("Helvetica", 8.5); c.setFillColor(BLACK)
        c.drawRightString(W - 32, y - 2, money(bal))
        y -= 16

        if date in ("2025-03-31", "2025-04-30", "2025-05-31"):
            running = bal

    # Summary box
    y -= 8
    c.setFillColor(colors.HexColor("#E5F6ED")); c.roundRect(30, y - 32, W - 60, 38, 4, fill=1, stroke=0)
    c.setStrokeColor(GREEN); c.setLineWidth(1); c.roundRect(30, y - 32, W - 60, 38, 4, fill=0, stroke=1)
    c.setFont("Helvetica-Bold", 9); c.setFillColor(colors.HexColor("#256E4C"))
    c.drawString(42, y, "Statement Summary")
    c.setFont("Helvetica", 9); c.setFillColor(BLACK)
    c.drawString(42, y - 14, f"Opening balance:  {money(open_bal)}")
    c.drawString(230, y - 14, f"Closing balance:  {money(close_bal)}")
    c.drawString(42, y - 25, f"Total credits:  see transactions above")
    c.drawString(230, y - 25, "Account type:  Betaalrekening (current)")

    footer(c, "1/1", f"ABN AMRO · Statement {month_label} · IBAN {CUSTOMER['iban']}")
    c.save()
    print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 4. SAVINGS STATEMENT
# ══════════════════════════════════════════════════════════════════════════════

fname = f"{OUT}/savings_statement_june_2025.pdf"
c = canvas.Canvas(fname, pagesize=A4)
header_band(c, "Savings Account Statement", "ABN AMRO Bank N.V. · Spaarrekening Overzicht", "ABN AMRO", NAVY, GREEN)

y = H - 105
c.setFillColor(LGRAY); c.rect(30, y - 38, W - 60, 46, fill=1, stroke=0)
c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
for lbl, val, lx in [
    ("Account holder", CUSTOMER["name"], 42),
    ("Savings IBAN",   "NL44 ABNA 0656 7890 12", 230),
    ("Statement date", "2025-06-01", 420),
]:
    c.drawString(lx, y + 2, lbl)
    c.setFont("Helvetica", 9); c.setFillColor(BLACK); c.drawString(lx, y - 10, val)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)

y -= 62
section_rule(c, y, "Account Overview — Spaarrekening Vrij", GREEN)
y -= 18

# Big balance display
c.setFillColor(colors.HexColor("#E5F6ED")); c.roundRect(30, y - 48, W - 60, 56, 6, fill=1, stroke=0)
c.setStrokeColor(GREEN); c.setLineWidth(1.5); c.roundRect(30, y - 48, W - 60, 56, 6, fill=0, stroke=1)
c.setFont("Helvetica-Bold", 11); c.setFillColor(NAVY)
c.drawString(42, y - 8, "Current savings balance")
c.setFont("Helvetica-Bold", 28); c.setFillColor(colors.HexColor("#256E4C"))
c.drawString(42, y - 38, money(28_000))
c.setFont("Helvetica", 9); c.setFillColor(DGRAY)
c.drawRightString(W - 42, y - 8, "As at 1 June 2025")
c.drawRightString(W - 42, y - 20, "Interest rate: 1.75% p.a.")
y -= 68

section_rule(c, y, "Recent Movements (last 6 months)", NAVY)
y -= 16

savings_txns = [
    ("2025-01-29", "Monthly transfer from current account",      "+ 300.00",  24_220.00),
    ("2025-02-27", "Monthly transfer from current account",      "+ 300.00",  24_520.00),
    ("2025-03-29", "Monthly transfer from current account",      "+ 300.00",  24_820.00),
    ("2025-04-01", "Interest credited — Q1 2025",               "+  98.50",  24_918.50),
    ("2025-04-29", "Monthly transfer from current account",      "+ 300.00",  25_218.50),
    ("2025-05-10", "Transfer from current account — vakantiegeld", "+ 4,000.00", 29_218.50),
    ("2025-05-29", "Monthly transfer from current account",      "+ 300.00",  29_518.50),
    ("2025-05-31", "Withdrawal — furniture purchase",            "- 1,518.50", 28_000.00),
]
for i, (date, desc, amount, bal) in enumerate(savings_txns):
    if i % 2 == 0:
        c.setFillColor(colors.HexColor("#F9FAFB"))
        c.rect(30, y - 9, W - 60, 16, fill=1, stroke=0)
    c.setFont("Helvetica", 8); c.setFillColor(DGRAY); c.drawString(38, y - 2, date)
    c.setFont("Helvetica", 8.5); c.setFillColor(BLACK); c.drawString(115, y - 2, desc)
    col = colors.HexColor("#256E4C") if amount.startswith("+") else colors.HexColor("#C0443F")
    c.setFont("Helvetica-Bold", 8.5); c.setFillColor(col); c.drawString(390, y - 2, amount)
    c.setFont("Helvetica", 8.5); c.setFillColor(BLACK); c.drawRightString(W - 32, y - 2, money(bal))
    y -= 16

y -= 20
kv_row(c, y, "Account type:",       "Vrije spaarrekening (no-notice savings)");  y -= 13
kv_row(c, y, "Linked account:",     f"Betaalrekening · {CUSTOMER['iban']}");    y -= 13
kv_row(c, y, "Account holder BSN:", CUSTOMER["bsn"]);                            y -= 13
kv_row(c, y, "Deposit guarantee:",  "Covered under Dutch Deposit Guarantee Scheme (DGS) up to €100,000"); y -= 20

c.setFont("Helvetica", 7.5); c.setFillColor(DGRAY)
c.drawString(30, y, "ABN AMRO Bank N.V. is registered with the Dutch Central Bank (DNB) and the Netherlands Authority for the Financial Markets (AFM).")
y -= 10
c.drawString(30, y, "Gustav Mahlerlaan 10, 1082 PP Amsterdam · www.abnamro.nl")

footer(c, "1/1", f"Spaaroverzicht · {CUSTOMER['name']} · Statement 01-06-2025")
c.save()
print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 5. PASSPORT (Dutch-style ID card)
# ══════════════════════════════════════════════════════════════════════════════

fname = f"{OUT}/passport_dylan_verhoeven.pdf"
c = canvas.Canvas(fname, pagesize=A4)

# Background
c.setFillColor(LGRAY); c.rect(0, 0, W, H, fill=1, stroke=0)

# ID card (A7-ish sized, centered)
card_w, card_h = 420, 260
card_x = (W - card_w) / 2
card_y = (H - card_h) / 2 + 60

# Card body
c.setFillColor(WHITE); c.roundRect(card_x, card_y, card_w, card_h, 8, fill=1, stroke=0)
c.setStrokeColor(NAVY); c.setLineWidth(2); c.roundRect(card_x, card_y, card_w, card_h, 8, fill=0, stroke=1)

# Header stripe
c.setFillColor(NAVY); c.roundRect(card_x, card_y + card_h - 50, card_w, 50, 8, fill=1, stroke=0)
c.rect(card_x, card_y + card_h - 50, card_w, 25, fill=1, stroke=0)  # flatten bottom corners

# Flag accent
c.setFillColor(colors.HexColor("#AE1C28")); c.rect(card_x, card_y + card_h - 50, 12, 50, fill=1, stroke=0)
c.setFillColor(WHITE); c.rect(card_x + 12, card_y + card_h - 50, 12, 50, fill=1, stroke=0)
c.setFillColor(colors.HexColor("#21468B")); c.rect(card_x + 24, card_y + card_h - 50, 12, 50, fill=1, stroke=0)
c.roundRect(card_x, card_y + card_h - 50, 36, 50, 8, fill=0, stroke=0)

c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 14)
c.drawString(card_x + 48, card_y + card_h - 24, "KONINKRIJK DER NEDERLANDEN")
c.setFont("Helvetica", 8)
c.drawString(card_x + 48, card_y + card_h - 36, "Kingdom of the Netherlands — Identity Card / Identiteitskaart")

# Photo placeholder
photo_x, photo_y = card_x + 16, card_y + 54
c.setFillColor(colors.HexColor("#C8D6E0")); c.rect(photo_x, photo_y, 80, 100, fill=1, stroke=0)
c.setFillColor(DGRAY); c.setFont("Helvetica", 7)
c.drawCentredString(photo_x + 40, photo_y + 48, "PHOTO")
c.drawCentredString(photo_x + 40, card_y + 40, "PASFOTO")

# Data fields
fx = card_x + 112; fy = card_y + card_h - 72
fields = [
    ("Surname / Achternaam",    "VERHOEVEN"),
    ("Given names / Voornamen", "DYLAN"),
    ("Nationality",             "NETHERLANDS / NEDERLAND"),
    ("Date of birth / Geboortedatum", "15 APR 1993"),
    ("Sex / Geslacht",          "M"),
    ("Place of birth",          "Amsterdam, Netherlands"),
    ("Expiry date / Vervaldatum", "14 APR 2033"),
    ("Document No. / Nummer",   "NL9XD4K28"),
    ("BSN",                     CUSTOMER["bsn"]),
]
for label, value in fields:
    c.setFont("Helvetica", 6.5); c.setFillColor(DGRAY); c.drawString(fx, fy, label)
    c.setFont("Helvetica-Bold", 9); c.setFillColor(BLACK); c.drawString(fx, fy - 11, value)
    fy -= 24

# MRZ (machine-readable zone mock)
mrz_y = card_y + 12
c.setFillColor(LGRAY); c.rect(card_x + 8, mrz_y - 2, card_w - 16, 36, fill=1, stroke=0)
c.setFont("Courier-Bold", 7); c.setFillColor(NAVY)
c.drawString(card_x + 12, mrz_y + 22, "ID<NLD9XD4K28<<<<<<<<<<<<<<<<<<")
c.drawString(card_x + 12, mrz_y + 12, "9304154M3304149NLD<<<<<<<<<<<4")
c.drawString(card_x + 12, mrz_y + 2,  "VERHOEVEN<<DYLAN<<<<<<<<<<<<<<<")

# Document title
c.setFont("Helvetica", 10); c.setFillColor(NAVY)
c.drawCentredString(W / 2, card_y - 24, "Dutch National Identity Card — Demo Document")
c.setFont("Helvetica", 8); c.setFillColor(DGRAY)
c.drawCentredString(W / 2, card_y - 38, "For Silta mortgage demo use only. Not a real government document.")

footer(c, note="Identity document demo · Silta Mortgage MVP · For demonstration purposes only")
c.save()
print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 6. STUDENT DEBT STATEMENT (DUO)
# ══════════════════════════════════════════════════════════════════════════════

fname = f"{OUT}/student_debt_duo_statement.pdf"
c = canvas.Canvas(fname, pagesize=A4)
header_band(c, "Overzicht Studieschuld", "Dienst Uitvoering Onderwijs (DUO) · Student Finance Overview",
            "DUO", colors.HexColor("#1A5276"), colors.HexColor("#1A5276"))

y = H - 105
c.setFillColor(LGRAY); c.rect(30, y - 38, W - 60, 46, fill=1, stroke=0)
c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)
for lbl, val, lx in [
    ("Student",           CUSTOMER["name"], 42),
    ("BSN",               CUSTOMER["bsn"], 230),
    ("Statement date",    "01 June 2025", 390),
]:
    c.drawString(lx, y + 2, lbl)
    c.setFont("Helvetica", 9); c.setFillColor(BLACK); c.drawString(lx, y - 10, val)
    c.setFont("Helvetica-Bold", 8); c.setFillColor(NAVY)

y -= 62
section_rule(c, y, "Study Loan Overview / Leenoverzicht", colors.HexColor("#1A5276"))
y -= 18

c.setFillColor(colors.HexColor("#EBF5FB")); c.roundRect(30, y - 50, W - 60, 58, 4, fill=1, stroke=0)
c.setFont("Helvetica-Bold", 9); c.setFillColor(colors.HexColor("#1A5276"))
c.drawString(42, y, "Outstanding student debt / Openstaande studieschuld")
c.setFont("Helvetica-Bold", 26); c.setFillColor(NAVY)
c.drawString(42, y - 32, money(7_500))
c.setFont("Helvetica", 8); c.setFillColor(DGRAY)
c.drawRightString(W - 42, y - 8, "Interest rate: 0.46% p.a.")
c.drawRightString(W - 42, y - 20, "OV-debt: €0.00")
y -= 70

section_rule(c, y, "Loan Details / Leendetails", NAVY)
y -= 16
details = [
    ("Type of loan:",           "DUO Studielening — Hoger Onderwijs"),
    ("Loan period:",            "September 2012 – June 2016"),
    ("Institution:",            "Universiteit van Amsterdam (UvA)"),
    ("Original loan amount:",   money(29_450)),
    ("Total repaid to date:",   money(21_950)),
    ("Outstanding balance:",    money(7_500)),
    ("Current repayment:",      "Suspended (income below repayment threshold)"),
    ("Next review date:",       "January 2026"),
    ("Repayment term left:",    "8 years 4 months"),
]
for label, val in details:
    kv_row(c, y, label, val); y -= 14
y -= 10

section_rule(c, y, "Recent Transactions", NAVY)
y -= 16
duo_txns = [
    ("2025-01-01", "Interest charge Q4 2024",       "- 8.65",   7_518.40),
    ("2025-02-01", "Interest charge",                "- 2.87",   7_515.53),
    ("2025-03-01", "Interest charge",                "- 2.87",   7_512.66),
    ("2025-04-01", "Interest charge",                "- 2.87",   7_509.79),
    ("2025-05-01", "Interest charge",                "- 2.87",   7_506.92),
    ("2025-05-15", "Voluntary partial repayment",   "- 6.92",   7_500.00),
    ("2025-06-01", "Current outstanding balance",   "",          7_500.00),
]
for i, (date, desc, amount, bal) in enumerate(duo_txns):
    if i % 2 == 0:
        c.setFillColor(colors.HexColor("#F4F8FB"))
        c.rect(30, y - 9, W - 60, 16, fill=1, stroke=0)
    c.setFont("Helvetica", 8); c.setFillColor(DGRAY); c.drawString(38, y - 2, date)
    c.setFont("Helvetica", 8.5 if not desc.startswith("Current") else 8.5)
    c.setFillColor(NAVY if desc.startswith("Current") else BLACK)
    if desc.startswith("Current"): c.setFont("Helvetica-Bold", 8.5)
    c.drawString(115, y - 2, desc)
    if amount:
        col = colors.HexColor("#C0443F") if amount.startswith("-") else colors.HexColor("#256E4C")
        c.setFont("Helvetica-Bold", 8.5); c.setFillColor(col); c.drawString(390, y - 2, amount)
    c.setFont("Helvetica-Bold" if desc.startswith("Current") else "Helvetica", 8.5)
    c.setFillColor(NAVY if desc.startswith("Current") else BLACK)
    c.drawRightString(W - 32, y - 2, money(bal))
    y -= 16

y -= 16
c.setFillColor(colors.HexColor("#FEF9E7")); c.roundRect(30, y - 24, W - 60, 30, 4, fill=1, stroke=0)
c.setFont("Helvetica-Bold", 8); c.setFillColor(AMBER)
c.drawString(42, y - 4, "Note for mortgage application:")
c.setFont("Helvetica", 8); c.setFillColor(BLACK)
c.drawString(42, y - 15, f"This statement confirms a remaining DUO study debt of {money(7_500)}. Monthly impact on affordability calculation: approx. {money(7_500 * 0.0045)}/month.")

y -= 44
c.setFont("Helvetica", 7.5); c.setFillColor(DGRAY)
c.drawString(30, y, "DUO — Dienst Uitvoering Onderwijs | Kempkensberg 12 | 9722 TB Groningen | www.duo.nl")
y -= 11
c.drawString(30, y, "This statement can be used as proof of outstanding student debt in mortgage or credit applications.")

footer(c, "1/1", f"DUO Leenoverzicht · {CUSTOMER['name']} · BSN {CUSTOMER['bsn']} · 01-06-2025")
c.save()
print(f"  ✓ {os.path.basename(fname)}")


# ══════════════════════════════════════════════════════════════════════════════
# 7. WRONG DOCUMENT (vacation booking — for demo edge case)
# ══════════════════════════════════════════════════════════════════════════════

fname = f"{OUT}/WRONG_vacation_booking_ibiza.pdf"
c = canvas.Canvas(fname, pagesize=A4)
header_band(c, "Booking Confirmation", "TravelDirect B.V. · Online Booking Platform", "TravelDirect", colors.HexColor("#E67E22"), colors.HexColor("#F39C12"))

y = H - 105
c.setFont("Helvetica-Bold", 16); c.setFillColor(colors.HexColor("#E67E22"))
c.drawString(30, y, "BOOKING CONFIRMED!")
y -= 10; c.setStrokeColor(colors.HexColor("#F39C12")); c.setLineWidth(2); c.line(30, y, W - 30, y)
y -= 24

kv_row(c, y, "Booking ref:",   "TD-2025-IBZ-00874");   y -= 14
kv_row(c, y, "Traveller:",     CUSTOMER["name"]);        y -= 14
kv_row(c, y, "Destination:",   "Ibiza, Spain — Club Hotel Tropicana"); y -= 14
kv_row(c, y, "Departure:",     "12 August 2025 · AMS → IBZ · 09:45"); y -= 14
kv_row(c, y, "Return:",        "19 August 2025 · IBZ → AMS · 17:20"); y -= 14
kv_row(c, y, "Duration:",      "7 nights (8 days)");    y -= 14
kv_row(c, y, "Travellers:",    "2 adults");             y -= 14
kv_row(c, y, "Room type:",     "Double Superior — All Inclusive"); y -= 14
kv_row(c, y, "Total paid:",    money(1_680));           y -= 14
kv_row(c, y, "Payment method:", "iDEAL — NL91 ABNA 0417 1643 00"); y -= 30

c.setFillColor(colors.HexColor("#FEF9E7")); c.roundRect(30, y - 28, W - 60, 34, 4, fill=1, stroke=0)
c.setFont("Helvetica", 9); c.setFillColor(BLACK)
c.drawString(42, y - 10, "Have a wonderful holiday! Your booking details have been emailed to:")
c.setFont("Helvetica-Bold", 9); c.drawString(42, y - 22, CUSTOMER["email"])

footer(c, note="TravelDirect B.V. · Booking Confirmation · This is NOT a mortgage document")
c.save()
print(f"  ✓ {os.path.basename(fname)}")

print("\n✅  All 9 demo documents generated in:", OUT)
