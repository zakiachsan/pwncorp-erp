#!/usr/bin/env python3
"""Generate AP and AR report pages with 30 rows per tab, pagination, no Show button."""

import os

# ── Shared data ──────────────────────────────────────────────────────────────

INVOICE_DATES = [
    "25 Jun 2026", "22 Jun 2026", "18 Jun 2026", "15 Jun 2026", "12 Jun 2026",
    "08 Jun 2026", "05 Jun 2026", "01 Jun 2026", "28 May 2026", "25 May 2026",
    "20 May 2026", "15 May 2026", "10 May 2026", "05 May 2026", "01 May 2026",
    "28 Apr 2026", "22 Apr 2026", "18 Apr 2026", "15 Apr 2026", "10 Apr 2026",
    "05 Apr 2026", "01 Apr 2026", "28 Mar 2026", "22 Mar 2026", "18 Mar 2026",
    "15 Mar 2026", "10 Mar 2026", "05 Mar 2026", "01 Mar 2026", "15 Jan 2026",
]

DUE_DATES_30 = [
    "25 Jul 2026", "22 Jul 2026", "18 Jul 2026", "15 Jul 2026", "12 Jul 2026",
    "08 Jul 2026", "05 Jul 2026", "01 Jul 2026", "27 Jun 2026", "24 Jun 2026",
    "19 Jun 2026", "14 Jun 2026", "09 Jun 2026", "04 Jun 2026", "31 May 2026",
    "28 May 2026", "22 May 2026", "18 May 2026", "15 May 2026", "10 May 2026",
    "05 May 2026", "01 May 2026", "27 Apr 2026", "21 Apr 2026", "17 Apr 2026",
    "14 Apr 2026", "09 Apr 2026", "04 Apr 2026", "31 Mar 2026", "14 Feb 2026",
]

SUPPLIERS = ["PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya", "PT Suku Cadang Jaya", "PT Maju Jaya", "CV Berkah Abadi"]
CUSTOMERS = ["PT Maju Jaya", "Budi Santoso", "Siti Rahmawati", "CV Berkah Abadi", "Ahmad Fauzi", "PT Transport Jaya"]
ENTITIES = ["PT Pencorp Motor", "PT Pencorp Spare"]

SUPPLIER_CODES = ["SUP-001", "SUP-002", "SUP-003", "SUP-004", "SUP-005", "SUP-006"]

SUBTOTALS = [
    3450000, 6100000, 2600000, 1800000, 4250000, 5200000, 3100000, 7500000,
    2850000, 8100000, 1500000, 3750000, 4900000, 6500000, 2200000, 5800000,
    3300000, 7200000, 1950000, 4600000, 850000, 3900000, 5500000, 2400000,
    6800000, 1200000, 4100000, 7800000, 3000000, 5600000,
]

AP_STATUSES = [
    "Paid", "Paid", "Approved", "Approved", "Paid", "Approved", "Paid", "Paid",
    "Approved", "Paid", "Unpaid", "Approved", "Paid", "Paid", "Partial", "Paid",
    "Paid", "Approved", "Approved", "Paid", "Unpaid", "Approved", "Paid", "Paid",
    "Partial", "Approved", "Paid", "Approved", "Paid", "Paid",
]

AR_STATUSES = [
    "Paid", "Paid", "Unpaid", "Unpaid", "Paid", "Partial", "Paid", "Paid",
    "Unpaid", "Paid", "Unpaid", "Partial", "Paid", "Paid", "Unpaid", "Paid",
    "Paid", "Unpaid", "Unpaid", "Paid", "Unpaid", "Partial", "Paid", "Paid",
    "Unpaid", "Partial", "Paid", "Unpaid", "Paid", "Paid",
]

PAID_FRACTIONS = [1.0, 1.0, 0.0, 0.0, 1.0, 0.4, 1.0, 1.0, 0.0, 1.0, 0.0, 0.4, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.6, 1.0, 1.0, 0.0, 0.0, 1.0, 0.4, 1.0, 1.0]

ITEM_DESCRIPTIONS = [
    "Kampas Rem Depan - Honda Brio", "Oli Mesin 5W-40 SN Plus", "Filter Udara Toyota Avanza",
    "Ban Michelin Pilot Sport 4", "V-Belt Drive Toyota Kijang", "Bearing Roda Depan",
    "Filter Oli Mobil - Toyota Avanza", "Aki GS Astra 60L", "Busi NGK Iridium",
    "Radiator Coolant 4L", "Shock Breaker Depan", "Master Rem Hydraulic",
    "Clutch Plate Set", "Timing Belt Kit", "Alternator Rebuilt",
    "Starter Motor Toyota", "Power Steering Pump", "Kompresor AC Mobil",
    "Spion Elektrik Toyota", "Knalpot Racing Stainless", "Gear Set Transmisi",
    "Lampu LED Headlamp", "Wiper Blade Universal", "Head Unit Double DIN",
    "Seat Cover Kulit", "Karpet Dashboard", "Cover Jok Premium",
    "Spoiler Belakang", "Talang Air Set", "Pedal Set Racing",
]

ITEM_DESCS_IR = [
    "Service Ringan + Ganti Oli", "Ban Michelin Pilot Sport 4", "Kampas Rem Depan - Toyota Avanza",
    "Mesin Alternator Rebuilt", "Filter Oli Mobil - Toyota Avanza", "Oli Mesin 5W-40 SN Plus",
    "Bearing Roda Depan", "Aki GS Astra 60L", "Busi NGK Iridium",
    "Radiator Coolant 4L", "Shock Breaker Depan", "Master Rem Hydraulic",
    "Clutch Plate Set", "Timing Belt Kit", "Power Steering Pump",
    "Kompresor AC Mobil", "Spion Elektrik Toyota", "V-Belt Drive Toyota Kijang",
    "Gear Set Transmisi", "Lampu LED Headlamp", "Wiper Blade Universal",
    "Head Unit Double DIN", "Seat Cover Kulit", "Karpet Dashboard",
    "Cover Jok Premium", "Spoiler Belakang", "Talang Air Set",
    "Pedal Set Racing", "Knalpot Racing Stainless", "Starter Motor Toyota",
]

ACCOUNTS = ["BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"]

CREDIT_TERMS = [30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45, 30, 30, 45]

OVERDUE_DAYS = [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 15, 25, 35, 45, 55, 65]

def fmt(n):
    """Format number to Indonesian style: 1.000.000"""
    s = str(int(n))
    parts = []
    while len(s) > 3:
        parts.append(s[-3:])
        s = s[:-3]
    parts.append(s)
    return ".".join(reversed(parts))

def doc_num_ap(i):
    """AP doc number: i is 0-based index (0=earliest, 29=latest), doc number = 30-i"""
    return f"AP-INV-2026/{30-i:04d}"

def doc_num_inv_ap(i):
    """Invoice AP doc number"""
    return f"INV-AP/2026/{30-i:03d}"

def doc_num_ir(i):
    """IR doc number"""
    return f"IR/SO/2026/{30-i:04d}"

def doc_num_inv_ir(i):
    """Invoice IR doc number"""
    return f"INV/{30-i:04d}"

def pay_ref_ap(i):
    return f"TRF-{['BCA','MDR','BRI'][i%3]}-{30-i:03d}"

def pay_ref_ar(i):
    return f"TRF-{['BCA','MDR','BRI'][i%3]}-{30-i:03d}"

def pay_doc_ap(i):
    return f"PAY-2026/{30-i:03d}"

def pay_doc_ar(i):
    return f"RCT-2026/{30-i:03d}"

def cn_doc_ar(i):
    return f"CN-AR/2026/{30-i:02d}"

def pay_date(i):
    """Payment date = invoice date + 5-15 days"""
    base_dates = [
        "30 Jun 2026", "27 Jun 2026", "23 Jun 2026", "20 Jun 2026", "17 Jun 2026",
        "13 Jun 2026", "10 Jun 2026", "06 Jun 2026", "03 Jun 2026", "30 May 2026",
        "25 May 2026", "20 May 2026", "15 May 2026", "10 May 2026", "06 May 2026",
        "03 May 2026", "27 Apr 2026", "23 Apr 2026", "20 Apr 2026", "15 Apr 2026",
        "10 Apr 2026", "06 Apr 2026", "03 May 2026", "27 Mar 2026", "23 Mar 2026",
        "20 Mar 2026", "15 Mar 2026", "10 Mar 2026", "06 Mar 2026", "20 Jan 2026",
    ]
    return base_dates[i]

def cheque_date(i):
    """Issued date = payment date - 2-5 days"""
    base_dates = [
        "28 Jun 2026", "25 Jun 2026", "21 Jun 2026", "18 Jun 2026", "15 Jun 2026",
        "11 Jun 2026", "08 Jun 2026", "04 Jun 2026", "01 Jun 2026", "28 May 2026",
        "23 May 2026", "18 May 2026", "13 May 2026", "08 May 2026", "04 May 2026",
        "01 May 2026", "25 Apr 2026", "21 Apr 2026", "18 Apr 2026", "13 Apr 2026",
        "08 Apr 2026", "04 Apr 2026", "01 May 2026", "25 Mar 2026", "21 Mar 2026",
        "18 Mar 2026", "13 Mar 2026", "08 Mar 2026", "04 Mar 2026", "18 Jan 2026",
    ]
    return base_dates[i]

def cheque_no(i):
    prefix = ["CK", "BG"][i % 2]
    return f"{prefix}-{100000 + i*12345:06d}"

def disbursement_date(i):
    """Disbursement = issued + 2-3 days"""
    base_dates = [
        "30 Jun 2026", "27 Jun 2026", "23 Jun 2026", "20 Jun 2026", "17 Jun 2026",
        "13 Jun 2026", "10 Jun 2026", "06 Jun 2026", "03 Jun 2026", "30 May 2026",
        "25 May 2026", "20 May 2026", "15 May 2026", "10 May 2026", "06 May 2026",
        "03 May 2026", "27 Apr 2026", "23 Apr 2026", "20 Apr 2026", "15 Apr 2026",
        "10 Apr 2026", "06 Apr 2026", "03 May 2026", "27 Mar 2026", "23 Mar 2026",
        "20 Mar 2026", "15 Mar 2026", "10 Mar 2026", "06 Mar 2026", "20 Jan 2026",
    ]
    return base_dates[i]

# ── AP Data Generation ──────────────────────────────────────────────────────

def gen_ap_account_payables():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        due = total - paid
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", dueDate: "{DUE_DATES_30[i]}", '
            f'supplier: "{SUPPLIERS[i%6]}", docNo: "{doc_num_ap(i)}", '
            f'refNo: "REF-AP{30-i:03d}", taxRefNo: "TAX-{30-i:03d}", '
            f'status: "{AP_STATUSES[i]}", subtotal: "{fmt(sub)}", credited: "0", '
            f'netSubtotal: "{fmt(sub)}", tax: "{fmt(tax)}", total: "{fmt(total)}", '
            f'paid: "{fmt(paid)}", due: "{fmt(due)}" }},'
        )
    return "\n".join(rows)

def gen_ap_invoice_payables():
    rows = []
    for i in range(30):
        qty = (i % 10) + 2
        unit = SUBTOTALS[i] // qty
        tax = int(unit * qty * 0.11)
        total = unit * qty + tax
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", entity: "{ENTITIES[i%2]}", '
            f'supplier: "{SUPPLIERS[i%6]}", docNo: "{doc_num_inv_ap(i)}", '
            f'refNo: "REF-{30-i:03d}", sourceRefCode: "SRC-{30-i:03d}", '
            f'itemDesc: "{ITEM_DESCRIPTIONS[i]}", qty: {qty}, '
            f'unitPrice: "{fmt(unit)}", subTotal: "{fmt(unit*qty)}", '
            f'tax: "{fmt(tax)}", total: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ap_aging():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        # Distribute balance across aging buckets
        bucket = i % 5
        vals = {"current": 0, "d1_30": 0, "d31_60": 0, "d61_90": 0, "over90": 0}
        key = ["current", "d1_30", "d31_60", "d61_90", "over90"][bucket]
        vals[key] = total
        rows.append(
            f'      {{ entity: "{ENTITIES[i%2]}", supplierCode: "{SUPPLIER_CODES[i%6]}", '
            f'supplierName: "{SUPPLIERS[i%6]}", docNo: "{doc_num_ap(i)}", '
            f'refNo: "REF-AP{30-i:03d}", sourceRefCode: "SRC-{30-i:03d}", '
            f'invoiceDate: "{INVOICE_DATES[i]}", dueDate: "{DUE_DATES_30[i]}", '
            f'current: "{fmt(vals["current"])}", d1_30: "{fmt(vals["d1_30"])}", '
            f'd31_60: "{fmt(vals["d31_60"])}", d61_90: "{fmt(vals["d61_90"])}", '
            f'over90: "{fmt(vals["over90"])}", balance: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ap_payments():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        status = "Cleared" if frac == 1.0 else "Pending" if frac > 0 else "Cleared"
        rows.append(
            f'      {{ paymentDate: "{pay_date(i)}", docNo: "{pay_doc_ap(i)}", '
            f'payRef: "{pay_ref_ap(i)}", invoiceReturn: "{doc_num_ap(i)}", '
            f'invoiceRef: "REF-AP{30-i:03d}", invoiceSrcRefCode: "SRC-{30-i:03d}", '
            f'supplier: "{SUPPLIERS[i%6]}", status: "{status}", '
            f'payment: "{fmt(paid)}", account: "{ACCOUNTS[i%3]}" }},'
        )
    return "\n".join(rows)

def gen_ap_credit():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i] // 2  # Credit notes are typically smaller
        tax = int(sub * 0.11)
        wht = int(sub * 0.05)
        total = sub + tax - wht
        status = "Approved" if i % 3 != 0 else "Draft"
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", entity: "{ENTITIES[i%2]}", '
            f'supplier: "{SUPPLIERS[i%6]}", supplierTax: "01.123.456.7-{30-i:01d}.000", '
            f'docNo: "{doc_num_ap(i).replace("AP-INV","CN-AP")}", status: "{status}", '
            f'subtotal: "{fmt(sub)}", tax: "{fmt(tax)}", wht: "{fmt(wht)}", '
            f'total: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ap_overdue():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        od = OVERDUE_DAYS[i]
        rows.append(
            f'      {{ supplier: "{SUPPLIERS[i%6]}", docNo: "{doc_num_ap(i)}", '
            f'entity: "{ENTITIES[i%2]}", refNo: "REF-AP{30-i:03d}", '
            f'sourceRefCode: "SRC-{30-i:03d}", creditTerm: {CREDIT_TERMS[i]}, '
            f'overdueDays: {od}, date: "{INVOICE_DATES[i]}", '
            f'dueDate: "{DUE_DATES_30[i]}", creditBalance: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ap_overlimit():
    rows = []
    for i in range(30):
        limit = SUBTOTALS[i]
        purchase = int(limit * 1.2 + i * 100000)
        inv_pay = int(limit * 0.6 + i * 50000)
        balance = purchase - inv_pay
        rows.append(
            f'      {{ supplier: "{SUPPLIERS[i%6]}", creditLimit: "{fmt(limit)}", '
            f'purchaseInvoices: "{fmt(purchase)}", invoicePayables: "{fmt(inv_pay)}", '
            f'balance: "{fmt(balance)}" }},'
        )
    return "\n".join(rows)

def gen_ap_subledger():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        due = total - paid
        paid_date = pay_date(i) if frac == 1.0 else "-"
        rows.append(
            f'      {{ entity: "{ENTITIES[i%2]}", supplier: "{SUPPLIERS[i%6]}", '
            f'invoiceNo: "{doc_num_ap(i)}", invoiceDate: "{INVOICE_DATES[i]}", '
            f'netSubtotal: "{fmt(total)}", credited: "0", paid: "{fmt(paid)}", '
            f'dueAmount: "{fmt(due)}", paidDate: "{paid_date}" }},'
        )
    return "\n".join(rows)

def gen_ap_cheque():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        statuses = ["Cleared", "Pending", "Bounced"]
        status = statuses[i % 3]
        rows.append(
            f'      {{ supplier: "{SUPPLIERS[i%6]}", '
            f'apPayment: "{pay_doc_ap(i)}", entity: "{ENTITIES[i%2]}", '
            f'paymentDate: "{pay_date(i)}", status: "{status}", '
            f'issuedDate: "{cheque_date(i)}", disbursementDate: "{disbursement_date(i)}", '
            f'chequeNo: "{cheque_no(i)}", amountPaid: "{fmt(paid)}" }},'
        )
    return "\n".join(rows)


# ── AR Data Generation ──────────────────────────────────────────────────────

def gen_ar_account_receivables():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        due = total - paid
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", dueDate: "{DUE_DATES_30[i]}", '
            f'customer: "{CUSTOMERS[i%6]}", docNo: "{doc_num_ir(i)}", '
            f'refNo: "REF-IR{30-i:03d}", status: "{AR_STATUSES[i]}", '
            f'subtotal: "{fmt(sub)}", tax: "{fmt(tax)}", total: "{fmt(total)}", '
            f'paid: "{fmt(paid)}", due: "{fmt(due)}" }},'
        )
    return "\n".join(rows)

def gen_ar_invoice_receivables():
    rows = []
    for i in range(30):
        qty = (i % 8) + 1
        unit = SUBTOTALS[i] // qty
        tax = int(unit * qty * 0.11)
        total = unit * qty + tax
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", entity: "{ENTITIES[i%2]}", '
            f'customer: "{CUSTOMERS[i%6]}", docNo: "{doc_num_inv_ir(i)}", '
            f'refNo: "REF-IR{30-i:03d}", itemDesc: "{ITEM_DESCS_IR[i]}", '
            f'qty: {qty}, unitPrice: "{fmt(unit)}", subTotal: "{fmt(unit*qty)}", '
            f'tax: "{fmt(tax)}", total: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ar_aging():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        bucket = i % 5
        vals = {"current": 0, "d1_30": 0, "d31_60": 0, "d61_90": 0, "over90": 0}
        key = ["current", "d1_30", "d31_60", "d61_90", "over90"][bucket]
        vals[key] = total
        rows.append(
            f'      {{ entity: "{ENTITIES[i%2]}", customer: "{CUSTOMERS[i%6]}", '
            f'docNo: "{doc_num_ir(i)}", refNo: "REF-IR{30-i:03d}", '
            f'invoiceDate: "{INVOICE_DATES[i]}", dueDate: "{DUE_DATES_30[i]}", '
            f'current: "{fmt(vals["current"])}", d1_30: "{fmt(vals["d1_30"])}", '
            f'd31_60: "{fmt(vals["d31_60"])}", d61_90: "{fmt(vals["d61_90"])}", '
            f'over90: "{fmt(vals["over90"])}", balance: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ar_payments():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        status = "Cleared" if frac == 1.0 else "Pending" if frac > 0 else "Cleared"
        rows.append(
            f'      {{ paymentDate: "{pay_date(i)}", docNo: "{pay_doc_ar(i)}", '
            f'payRef: "{pay_ref_ar(i)}", invoiceRef: "{doc_num_ir(i)}", '
            f'customer: "{CUSTOMERS[i%6]}", status: "{status}", '
            f'payment: "{fmt(paid)}", account: "{ACCOUNTS[i%3]}" }},'
        )
    return "\n".join(rows)

def gen_ar_credit():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i] // 3  # Credit notes smaller
        tax = int(sub * 0.11)
        wht = int(sub * 0.05)
        total = sub + tax - wht
        status = "Approved" if i % 3 != 0 else "Draft"
        rows.append(
            f'      {{ invoiceDate: "{INVOICE_DATES[i]}", entity: "{ENTITIES[i%2]}", '
            f'customer: "{CUSTOMERS[i%6]}", docNo: "{cn_doc_ar(i)}", status: "{status}", '
            f'subtotal: "{fmt(sub)}", tax: "{fmt(tax)}", wht: "{fmt(wht)}", '
            f'total: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ar_overdue():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        od = OVERDUE_DAYS[i]
        rows.append(
            f'      {{ customer: "{CUSTOMERS[i%6]}", docNo: "{doc_num_ir(i)}", '
            f'entity: "{ENTITIES[i%2]}", refNo: "REF-IR{30-i:03d}", '
            f'creditTerm: {CREDIT_TERMS[i]}, overdueDays: {od}, '
            f'date: "{INVOICE_DATES[i]}", dueDate: "{DUE_DATES_30[i]}", '
            f'balance: "{fmt(total)}" }},'
        )
    return "\n".join(rows)

def gen_ar_overlimit():
    rows = []
    for i in range(30):
        limit = SUBTOTALS[i]
        sales = int(limit * 1.3 + i * 120000)
        inv_rec = int(limit * 0.7 + i * 60000)
        balance = sales - inv_rec
        rows.append(
            f'      {{ customer: "{CUSTOMERS[i%6]}", creditLimit: "{fmt(limit)}", '
            f'salesInvoices: "{fmt(sales)}", invoiceReceivables: "{fmt(inv_rec)}", '
            f'balance: "{fmt(balance)}" }},'
        )
    return "\n".join(rows)

def gen_ar_subledger():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        due = total - paid
        paid_date = pay_date(i) if frac == 1.0 else "-"
        rows.append(
            f'      {{ entity: "{ENTITIES[i%2]}", customer: "{CUSTOMERS[i%6]}", '
            f'invoiceNo: "{doc_num_ir(i)}", invoiceDate: "{INVOICE_DATES[i]}", '
            f'netSubtotal: "{fmt(total)}", paid: "{fmt(paid)}", '
            f'dueAmount: "{fmt(due)}", paidDate: "{paid_date}" }},'
        )
    return "\n".join(rows)

def gen_ar_cheque():
    rows = []
    for i in range(30):
        sub = SUBTOTALS[i]
        tax = int(sub * 0.11)
        total = sub + tax
        frac = PAID_FRACTIONS[i]
        paid = int(total * frac) if frac > 0 else 0
        statuses = ["Cleared", "Pending", "Bounced"]
        status = statuses[i % 3]
        rows.append(
            f'      {{ customer: "{CUSTOMERS[i%6]}", '
            f'docNo: "{pay_doc_ar(i)}", entity: "{ENTITIES[i%2]}", '
            f'paymentDate: "{pay_date(i)}", status: "{status}", '
            f'issuedDate: "{cheque_date(i)}", '
            f'chequeNo: "{cheque_no(i)}", amount: "{fmt(paid)}" }},'
        )
    return "\n".join(rows)


# ── AP Page Template ────────────────────────────────────────────────────────

AP_PAGE = '''"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
/* ── helpers ──────────────────────────────────────────────────────── */
function fmtRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

const statusPillColor = (s: string): string => {
  const map: Record<string, string> = {
    Paid: "#2e844a",
    Approved: "#2e844a",
    Unpaid: "#ea001e",
    Cancelled: "#ea001e",
    Draft: "#6b7280",
    Partial: "#f59e0b",
    Cleared: "#2e844a",
    Pending: "#f59e0b",
    Bounced: "#ea001e",
  };
  return map[s] || "#6b7280";
};

/* ── filter / column config per tab ───────────────────────────────── */
type FilterField = {
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
  width?: string;
};

type ColDef = { header: string; key: string; align?: "left" | "right"; render?: (v: any, row: any) => React.ReactNode };

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const TABS: TabConfig[] = [
  /* ── A  Account Payables ──────────────────────────── */
  {
    id: "account-payables",
    label: "Account Payables",
    filters: [
      { label: "Date Option", type: "select", options: ["Invoice Date", "Due Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya", "PT Suku Cadang Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Paid"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Tax Ref No.", key: "taxRefNo" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Credited", key: "credited", align: "right" },
      { header: "Net Subtotal", key: "netSubtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due", key: "due", align: "right" },
    ],
    data: [
''' + gen_ap_account_payables() + '''
    ],
  },

  /* ── B  Invoice Payables ──────────────────────────── */
  {
    id: "invoice-payables",
    label: "Invoice Payables",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Paid"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
      { header: "Item Description", key: "itemDesc" },
      { header: "Qty", key: "qty", align: "right" },
      { header: "Unit Price", key: "unitPrice", align: "right" },
      { header: "Sub Total", key: "subTotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [
''' + gen_ap_invoice_payables() + '''
    ],
  },

  /* ── C  AP Aging ──────────────────────────────────── */
  {
    id: "ap-aging",
    label: "AP Aging",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "Report Date", type: "date", width: "140px" },
      { label: "Group By", type: "select", options: ["Due Date", "Invoice Date"], width: "130px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Supplier Code", key: "supplierCode" },
      { header: "Supplier Name", key: "supplierName" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Current", key: "current", align: "right" },
      { header: "1-30", key: "d1_30", align: "right" },
      { header: "31-60", key: "d31_60", align: "right" },
      { header: "61-90", key: "d61_90", align: "right" },
      { header: "Over 90", key: "over90", align: "right" },
      { header: "Balance", key: "balance", align: "right" },
    ],
    data: [
''' + gen_ap_aging() + '''
    ],
  },

  /* ── D  AP Payments ───────────────────────────────── */
  {
    id: "ap-payments",
    label: "AP Payments",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending"], width: "120px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"], width: "170px" },
    ],
    columns: [
      { header: "Payment Date", key: "paymentDate" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Payment Reference", key: "payRef" },
      { header: "Invoice/Return", key: "invoiceReturn" },
      { header: "Invoice Reference", key: "invoiceRef" },
      { header: "Invoice Source Ref Code", key: "invoiceSrcRefCode" },
      { header: "Supplier", key: "supplier" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Payment", key: "payment", align: "right" },
      { header: "Account", key: "account" },
    ],
    data: [
''' + gen_ap_payments() + '''
    ],
  },

  /* ── E  AP Credit ─────────────────────────────────── */
  {
    id: "ap-credit",
    label: "AP Credit",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Supplier Tax", key: "supplierTax" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Withholding Tax", key: "wht", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [
''' + gen_ap_credit() + '''
    ],
  },

  /* ── F  AP Overdue ────────────────────────────────── */
  {
    id: "ap-overdue",
    label: "AP Overdue",
    filters: [
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Sort By", type: "select", options: ["Supplier", "Document No"], width: "140px" },
      { label: "Show due date older than 6 months", type: "select", options: ["No", "Yes"], width: "140px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
      { header: "Credit Term (days)", key: "creditTerm", align: "right" },
      { header: "Overdue Days", key: "overdueDays", align: "right" },
      { header: "Date", key: "date" },
      { header: "Due Date", key: "dueDate" },
      { header: "Credit Balance (Rp)", key: "creditBalance", align: "right" },
    ],
    data: [
''' + gen_ap_overdue() + '''
    ],
  },

  /* ── G  AP Overlimit ──────────────────────────────── */
  {
    id: "ap-overlimit",
    label: "AP Overlimit",
    filters: [
      { label: "Sort By", type: "select", options: ["Supplier", "Credit Limit", "Balance"], width: "140px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "Credit Limit (Rp)", key: "creditLimit", align: "right" },
      { header: "Purchase Invoices (Rp)", key: "purchaseInvoices", align: "right" },
      { header: "Invoice Payables (Rp)", key: "invoicePayables", align: "right" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [
''' + gen_ap_overlimit() + '''
    ],
  },

  /* ── H  AP Subledger ──────────────────────────────── */
  {
    id: "ap-subledger",
    label: "AP Subledger",
    filters: [
      { label: "Invoice Date From", type: "date", width: "140px" },
      { label: "Invoice Date To", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Invoice No", key: "invoiceNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Net Subtotal (Inc Tax)", key: "netSubtotal", align: "right" },
      { header: "Credited (Inc Tax)", key: "credited", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due Amount", key: "dueAmount", align: "right" },
      { header: "Paid Date", key: "paidDate" },
    ],
    data: [
''' + gen_ap_subledger() + '''
    ],
  },

  /* ── I  AP Cheque/BG ──────────────────────────────── */
  {
    id: "ap-cheque",
    label: "AP Cheque/BG",
    filters: [
      { label: "Date Option", type: "select", options: ["Issued Date", "Payment Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending", "Bounced"], width: "120px" },
      { label: "Cheque/BG Number", type: "text", width: "140px" },
      { label: "AP Payment", type: "text", width: "120px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "AP Payment", key: "apPayment", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Payment Date", key: "paymentDate" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Issued Date", key: "issuedDate" },
      { header: "Disbursement Date", key: "disbursementDate" },
      { header: "Cheque/BG No.", key: "chequeNo" },
      { header: "Amount Paid", key: "amountPaid", align: "right" },
    ],
    data: [
''' + gen_ap_cheque() + '''
    ],
  },
];

/* ── component ───────────────────────────────────────────────────── */
export default function APReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const cfg = TABS[activeTab];

  const ROWS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(cfg.data.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ROWS_PER_PAGE;
  const pageData = cfg.data.slice(startIdx, startIdx + ROWS_PER_PAGE);

  const handleTabChange = (i: number) => {
    setActiveTab(i);
    setCurrentPage(1);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
        <BarChart3 size={24} color="#0176d3" />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Account Payables</h1>
      </div>

      {/* ── tab bar ── */}
      <div style={{ display: "flex", gap: 0, padding: "16px 24px 0", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(i)}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "#444746",
                background: isActive ? "#0176d3" : "#ecebea",
                border: "none",
                borderRadius: i === 0 ? "6px 0 0 6px" : i === TABS.length - 1 ? "0 6px 6px 0" : "0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── filter section ── */}
      <div style={{ margin: "16px 24px", padding: "16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input
                  type={f.type}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${f.label}`}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── action buttons ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#444746",
              background: "#fff",
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── data table ── */}
      <div style={{ margin: "0 24px 24px", overflowX: "auto" }}>
        {cfg.data.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#444746", background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
            No data available
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#001526" }}>
              <thead>
                <tr>
                  {cfg.columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#444746",
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.3,
                        background: "#f9f9f9",
                        border: "1px solid #ecebea",
                        textAlign: col.align === "right" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      background: ri % 2 === 1 ? "#fafafa" : "#fff",
                    }}
                  >
                    {cfg.columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #ecebea",
                          textAlign: col.align === "right" ? "right" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 0" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: safePage <= 1 ? "#999" : "#444746",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    cursor: safePage <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 13, color: "#444746", padding: "0 12px" }}>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: safePage >= totalPages ? "#999" : "#444746",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
'''


# ── AR Page Template ────────────────────────────────────────────────────────

AR_PAGE = '''"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
/* ── helpers ──────────────────────────────────────────────────────── */
function fmtRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

const statusPillColor = (s: string): string => {
  const map: Record<string, string> = {
    Paid: "#2e844a",
    Approved: "#2e844a",
    Unpaid: "#ea001e",
    Cancelled: "#ea001e",
    Draft: "#6b7280",
    Partial: "#f59e0b",
    Cleared: "#2e844a",
    Pending: "#f59e0b",
    Bounced: "#ea001e",
    Overdue: "#ea001e",
  };
  return map[s] || "#6b7280";
};

/* ── filter / column config per tab ───────────────────────────────── */
type FilterField = {
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
  width?: string;
};

type ColDef = {
  header: string;
  key: string;
  align?: "left" | "right";
  render?: (v: any, row: any) => React.ReactNode;
};

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const CUSTOMERS = [
  "All Customers",
  "PT Maju Jaya",
  "Budi Santoso",
  "Siti Rahmawati",
  "CV Berkah Abadi",
  "Ahmad Fauzi",
  "PT Transport Jaya",
];

const ENTITIES = ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"];

const TABS: TabConfig[] = [
  /* ── A  Account Receivables ──────────────────────────── */
  {
    id: "account-receivables",
    label: "Account Receivables",
    filters: [
      { label: "Date Option", type: "select", options: ["Invoice Date", "Due Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Paid", "Unpaid", "Partial"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due", key: "due", align: "right" },
    ],
    data: [
''' + gen_ar_account_receivables() + '''
    ],
  },

  /* ── B  Invoice Receivables ──────────────────────────── */
  {
    id: "invoice-receivables",
    label: "Invoice Receivables",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Paid", "Unpaid", "Partial"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Item Description", key: "itemDesc" },
      { header: "Qty", key: "qty", align: "right" },
      { header: "Unit Price", key: "unitPrice", align: "right" },
      { header: "Sub Total", key: "subTotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [
''' + gen_ar_invoice_receivables() + '''
    ],
  },

  /* ── C  AR Aging ─────────────────────────────────────── */
  {
    id: "ar-aging",
    label: "AR Aging",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "Report Date", type: "date", width: "140px" },
      { label: "Group By", type: "select", options: ["Due Date", "Invoice Date"], width: "130px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Current", key: "current", align: "right" },
      { header: "1-30", key: "d1_30", align: "right" },
      { header: "31-60", key: "d31_60", align: "right" },
      { header: "61-90", key: "d61_90", align: "right" },
      { header: "Over 90", key: "over90", align: "right" },
      { header: "Balance", key: "balance", align: "right" },
    ],
    data: [
''' + gen_ar_aging() + '''
    ],
  },

  /* ── D  AR Payments ──────────────────────────────────── */
  {
    id: "ar-payments",
    label: "AR Payments",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending"], width: "120px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"], width: "170px" },
    ],
    columns: [
      { header: "Payment Date", key: "paymentDate" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Payment Reference", key: "payRef" },
      { header: "Invoice Reference", key: "invoiceRef" },
      { header: "Customer", key: "customer" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Payment", key: "payment", align: "right" },
      { header: "Account", key: "account" },
    ],
    data: [
''' + gen_ar_payments() + '''
    ],
  },

  /* ── E  AR Credit ────────────────────────────────────── */
  {
    id: "ar-credit",
    label: "AR Credit",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Withholding Tax", key: "wht", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [
''' + gen_ar_credit() + '''
    ],
  },

  /* ── F  AR Overdue ───────────────────────────────────── */
  {
    id: "ar-overdue",
    label: "AR Overdue",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Sort By", type: "select", options: ["Customer", "Document No", "Overdue Days"], width: "140px" },
      { label: "Show due date older than 6 months", type: "select", options: ["No", "Yes"], width: "140px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Reference No.", key: "refNo" },
      { header: "Credit Term (days)", key: "creditTerm", align: "right" },
      { header: "Overdue Days", key: "overdueDays", align: "right" },
      { header: "Date", key: "date" },
      { header: "Due Date", key: "dueDate" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [
''' + gen_ar_overdue() + '''
    ],
  },

  /* ── G  AR Overlimit ─────────────────────────────────── */
  {
    id: "ar-overlimit",
    label: "AR Overlimit",
    filters: [
      { label: "Sort By", type: "select", options: ["Customer", "Credit Limit", "Balance"], width: "140px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Credit Limit (Rp)", key: "creditLimit", align: "right" },
      { header: "Sales Invoices (Rp)", key: "salesInvoices", align: "right" },
      { header: "Invoice Receivables (Rp)", key: "invoiceReceivables", align: "right" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [
''' + gen_ar_overlimit() + '''
    ],
  },

  /* ── H  AR Subledger ─────────────────────────────────── */
  {
    id: "ar-subledger",
    label: "AR Subledger",
    filters: [
      { label: "Invoice Date From", type: "date", width: "140px" },
      { label: "Invoice Date To", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Invoice No", key: "invoiceNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Net Subtotal", key: "netSubtotal", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due Amount", key: "dueAmount", align: "right" },
      { header: "Paid Date", key: "paidDate" },
    ],
    data: [
''' + gen_ar_subledger() + '''
    ],
  },

  /* ── I  AR Cheque/BG ─────────────────────────────────── */
  {
    id: "ar-cheque",
    label: "AR Cheque/BG",
    filters: [
      { label: "Date Option", type: "select", options: ["Issued Date", "Payment Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending", "Bounced"], width: "120px" },
      { label: "Cheque/BG Number", type: "text", width: "140px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Payment Date", key: "paymentDate" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Issued Date", key: "issuedDate" },
      { header: "Cheque/BG No.", key: "chequeNo" },
      { header: "Amount", key: "amount", align: "right" },
    ],
    data: [
''' + gen_ar_cheque() + '''
    ],
  },
];

/* ── component ───────────────────────────────────────────────────── */
export default function ARReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const cfg = TABS[activeTab];

  const ROWS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(cfg.data.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ROWS_PER_PAGE;
  const pageData = cfg.data.slice(startIdx, startIdx + ROWS_PER_PAGE);

  const handleTabChange = (i: number) => {
    setActiveTab(i);
    setCurrentPage(1);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
        <BarChart3 size={24} color="#0176d3" />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Account Receivables</h1>
      </div>

      {/* ── tab bar ── */}
      <div style={{ display: "flex", gap: 0, padding: "16px 24px 0", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(i)}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "#444746",
                background: isActive ? "#0176d3" : "#ecebea",
                border: "none",
                borderRadius: i === 0 ? "6px 0 0 6px" : i === TABS.length - 1 ? "0 6px 6px 0" : "0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── filter section ── */}
      <div style={{ margin: "16px 24px", padding: "16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input
                  type={f.type}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${f.label}`}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── action buttons ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#444746",
              background: "#fff",
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── data table ── */}
      <div style={{ margin: "0 24px 24px", overflowX: "auto" }}>
        {cfg.data.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#444746", background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
            No data available
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#001526" }}>
              <thead>
                <tr>
                  {cfg.columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "10px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#444746",
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.3,
                        background: "#f9f9f9",
                        border: "1px solid #ecebea",
                        textAlign: col.align === "right" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      background: ri % 2 === 1 ? "#fafafa" : "#fff",
                    }}
                  >
                    {cfg.columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #ecebea",
                          textAlign: col.align === "right" ? "right" : "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 0" }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: safePage <= 1 ? "#999" : "#444746",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    cursor: safePage <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 13, color: "#444746", padding: "0 12px" }}>
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  style={{
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: safePage >= totalPages ? "#999" : "#444746",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
'''

# ── Write files ──────────────────────────────────────────────────────────────

ap_path = r"C:\Projects\pwncorp\src\app\finance\reports\ap\page.tsx"
ar_path = r"C:\Projects\pwncorp\src\app\finance\reports\ar\page.tsx"

with open(ap_path, "w", encoding="utf-8") as f:
    f.write(AP_PAGE)
print(f"Written AP page: {ap_path}")

with open(ar_path, "w", encoding="utf-8") as f:
    f.write(AR_PAGE)
print(f"Written AR page: {ar_path}")

# Verify data counts
for tab_name, content in [("AP", AP_PAGE), ("AR", AR_PAGE)]:
    # Count data entries per tab by counting "data: [" sections and entries
    import re
    data_blocks = re.findall(r'data: \[\n(.*?)\n    \]', content, re.DOTALL)
    print(f"\n{tab_name} data row counts:")
    for i, block in enumerate(data_blocks):
        rows = len([l for l in block.strip().split('\n') if l.strip().startswith('{')])
        print(f"  Tab {i}: {rows} rows")
