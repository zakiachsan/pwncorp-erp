#!/usr/bin/env python3
"""Expand data arrays to 30 rows in AP and AR page.tsx files."""

import re

# --- AP TAB DATA GENERATORS ---

ap_suppliers = [
    ("PT Auto Parts", "SUP-001"),
    ("CV Ban Sehat", "SUP-002"),
    ("UD Oli Jaya", "SUP-003"),
    ("PT Suku Cadang Jaya", "SUP-004"),
    ("PT Maju Jaya", "SUP-005"),
    ("CV Berkah Abadi", "SUP-006"),
]

ap_supplier_taxes = {
    "PT Auto Parts": "01.234.567.8-901.000",
    "CV Ban Sehat": "02.345.678.9-012.000",
    "UD Oli Jaya": "03.456.789.0-123.000",
    "PT Suku Cadang Jaya": "04.567.890.1-234.000",
    "PT Maju Jaya": "05.678.901.2-345.000",
    "CV Berkah Abadi": "06.789.012.3-456.000",
}

ap_entities = ["PT Pencorp Motor", "PT Pencorp Spare"]
ap_payment_accounts = ["BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"]

# --- AR DATA ---

ar_customers = [
    "PT Maju Jaya",
    "Budi Santoso",
    "Siti Rahmawati",
    "CV Berkah Abadi",
    "Ahmad Fauzi",
    "PT Transport Jaya",
]

ar_entities = ["PT Pencorp Motor", "PT Pencorp Spare"]
ar_payment_accounts = ["BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"]


def make_date(day, month, year=2026):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{day:02d} {months[month-1]} {year}"


def fmt_rp(n):
    s = f"{n:,.0f}".replace(",", ".")
    return s


# --- AP TAB GENERATORS ---

def gen_ap_account_payables():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)

        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        subtotal_n = 500000 + (i * 137000) % 10000000
        credited_n = 500000 if i % 7 == 0 else (1000000 if i % 5 == 0 else 0)
        net_n = subtotal_n - credited_n
        tax_n = int(net_n * 0.11)
        total_n = net_n + tax_n
        statuses = ["Approved", "Paid", "Approved", "Paid", "Approved"]
        status = statuses[i % 5]
        paid_n = total_n if status == "Paid" else (total_n // 2 if i % 4 == 0 else 0)
        due_n = total_n - paid_n

        rows.append(
            '      { invoiceDate: "%s", dueDate: "%s", supplier: "%s", docNo: "AP-INV-2026/%04d", refNo: "REF-AP%03d", taxRefNo: "TAX-%03d", status: "%s", subtotal: "%s", credited: "%s", netSubtotal: "%s", tax: "%s", total: "%s", paid: "%s", due: "%s" }'
            % (inv_date, due_date, supplier, idx, idx, idx, status,
               fmt_rp(subtotal_n), fmt_rp(credited_n), fmt_rp(net_n),
               fmt_rp(tax_n), fmt_rp(total_n), fmt_rp(paid_n), fmt_rp(due_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_invoice_payables():
    items = [
        "Kampas Rem Depan - Honda Brio",
        "Filter Oli Mobil - Toyota Avanza",
        "Ban Michelin Pilot Sport 4",
        "Oli Mesin 5W-40 SN Plus",
        "Busi NGK Iridium",
        "V-Belt Honda Vario",
        "Master Rem Depan - Yamaha Mio",
        "Filter Udara - Suzuki Ertiga",
        "Lampu LED H4 Philips",
        "Kampas Rem Belakang - Toyota Avanza",
        "Bearing Roda Depan - Honda Jazz",
        "Alternator Rebuilt - Toyota Kijang",
        "Shock Breaker Depan - Honda Beat",
        "Spion Universal Honda Civic",
        "Radiator Coolant - Toyota Innova",
    ]
    unit_prices = [220000, 75000, 2800000, 185000, 45000, 85000, 320000, 95000, 150000, 180000, 275000, 1250000, 410000, 175000, 65000]
    qtys = [8, 10, 4, 20, 15, 12, 6, 9, 10, 8, 7, 2, 5, 4, 14]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        entity = ap_entities[i % 2]
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        item = items[i % len(items)]
        qty = qtys[i % len(qtys)]
        up = unit_prices[i % len(unit_prices)]
        sub_n = qty * up
        tax_n = int(sub_n * 0.11)
        total_n = sub_n + tax_n

        rows.append(
            '      { invoiceDate: "%s", entity: "%s", supplier: "%s", docNo: "INV-AP/2026/%03d", refNo: "REF-%03d", sourceRefCode: "SRC-%03d", itemDesc: "%s", qty: %d, unitPrice: "%s", subTotal: "%s", tax: "%s", total: "%s" }'
            % (inv_date, entity, supplier, idx, idx, idx, item, qty,
               fmt_rp(up), fmt_rp(sub_n), fmt_rp(tax_n), fmt_rp(total_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_aging():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)
        supplier, supp_code = ap_suppliers[i % len(ap_suppliers)]
        entity = ap_entities[i % 2]
        balance_n = 500000 + (i * 217000) % 8000000
        balance_s = fmt_rp(balance_n)
        current = d1_30 = d31_60 = d61_90 = over90 = "0"
        if i < 8: current = balance_s
        elif i < 14: d1_30 = balance_s
        elif i < 20: d31_60 = balance_s
        elif i < 26: d61_90 = balance_s
        else: over90 = balance_s

        rows.append(
            '      { entity: "%s", supplierCode: "%s", supplierName: "%s", docNo: "AP-INV-2026/%04d", refNo: "REF-AP%03d", sourceRefCode: "SRC-%03d", invoiceDate: "%s", dueDate: "%s", current: "%s", d1_30: "%s", d31_60: "%s", d61_90: "%s", over90: "%s", balance: "%s" }'
            % (entity, supp_code, supplier, idx, idx, idx, inv_date, due_date,
               current, d1_30, d31_60, d61_90, over90, balance_s)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_payments():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 7 - (month_offset % 7)
        if month < 1: month = 1
        if month > 7: month = 7
        pay_date = make_date(day, month)
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        account = ap_payment_accounts[i % 3]
        bank_code = ["BCA", "MDR", "BRI"][i % 3]
        statuses = ["Cleared", "Cleared", "Pending", "Cleared", "Pending"]
        status = statuses[i % 5]
        pay_n = 500000 + (i * 337000) % 7000000
        inv_idx = idx - 1 if idx > 1 else 1

        rows.append(
            '      { paymentDate: "%s", docNo: "PAY-2026/%04d", payRef: "TRF-%s-%04d", invoiceReturn: "AP-INV-2026/%04d", invoiceRef: "REF-AP%03d", invoiceSrcRefCode: "SRC-%03d", supplier: "%s", status: "%s", payment: "%s", account: "%s" }'
            % (pay_date, idx, bank_code, idx, inv_idx, inv_idx, inv_idx,
               supplier, status, fmt_rp(pay_n), account)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_credit():
    statuses = ["Approved", "Draft", "Approved", "Approved", "Draft"]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        entity = ap_entities[i % 2]
        tax_id = ap_supplier_taxes[supplier]
        status = statuses[i % 5]
        subtotal_n = 500000 + (i * 173000) % 5000000
        tax_n = int(subtotal_n * 0.11)
        wht_n = int(subtotal_n * 0.02)
        total_n = subtotal_n + tax_n - wht_n

        rows.append(
            '      { invoiceDate: "%s", entity: "%s", supplier: "%s", supplierTax: "%s", docNo: "CN-AP/2026/%03d", status: "%s", subtotal: "%s", tax: "%s", wht: "%s", total: "%s" }'
            % (inv_date, entity, supplier, tax_id, idx, status,
               fmt_rp(subtotal_n), fmt_rp(tax_n), fmt_rp(wht_n), fmt_rp(total_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_overdue():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        entity = ap_entities[i % 2]
        credit_term = 30 if i % 3 != 0 else 45
        overdue_days = 15 + (i * 7) % 120
        credit_bal_n = 1000000 + (i * 317000) % 9000000

        rows.append(
            '      { supplier: "%s", docNo: "AP-INV-2026/%04d", entity: "%s", refNo: "REF-AP%03d", sourceRefCode: "SRC-%03d", creditTerm: %d, overdueDays: %d, date: "%s", dueDate: "%s", creditBalance: "%s" }'
            % (supplier, idx, entity, idx, idx, credit_term, overdue_days,
               inv_date, due_date, fmt_rp(credit_bal_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_overlimit():
    rows = []
    for i in range(30):
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        credit_lim_n = 5000000 + (i * 500000) % 20000000
        purchase_inv_n = credit_lim_n + 1000000 + (i * 300000) % 5000000
        inv_pay_n = credit_lim_n + (i * 200000) % 3000000
        bal_n = purchase_inv_n - inv_pay_n

        rows.append(
            '      { supplier: "%s", creditLimit: "%s", purchaseInvoices: "%s", invoicePayables: "%s", balance: "%s" }'
            % (supplier, fmt_rp(credit_lim_n), fmt_rp(purchase_inv_n),
               fmt_rp(inv_pay_n), fmt_rp(bal_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_subledger():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        entity = ap_entities[i % 2]
        net_n = 500000 + (i * 237000) % 8000000
        paid_n = 0
        paid_date_s = "-"
        if i % 3 == 0:
            paid_n = net_n
            paid_day = min(day + 10, 28)
            paid_date_s = make_date(paid_day, min(month + 1, 12))
        elif i % 4 == 0:
            paid_n = net_n // 2
        due_n = net_n - paid_n

        rows.append(
            '      { entity: "%s", supplier: "%s", invoiceNo: "AP-INV-2026/%04d", invoiceDate: "%s", netSubtotal: "%s", credited: "0", paid: "%s", dueAmount: "%s", paidDate: "%s" }'
            % (entity, supplier, idx, inv_date, fmt_rp(net_n),
               fmt_rp(paid_n), fmt_rp(due_n), paid_date_s)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ap_cheque():
    statuses = ["Cleared", "Cleared", "Pending", "Cleared", "Bounced"]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 7 - (month_offset % 7)
        if month < 1: month = 1
        if month > 7: month = 7
        pay_date = make_date(day, month)
        supplier, _ = ap_suppliers[i % len(ap_suppliers)]
        entity = ap_entities[i % 2]
        status = statuses[i % 5]
        issued_day = max(day - 5, 1)
        issued_date = make_date(issued_day, month)
        cheque_type = "CK" if i % 3 != 0 else "BG"
        cheque_no = "%s-%06d" % (cheque_type, 100000 + i * 1234)
        amt_n = 500000 + (i * 437000) % 6000000

        rows.append(
            '      { supplier: "%s", apPayment: "PAY-2026/%04d", entity: "%s", paymentDate: "%s", status: "%s", issuedDate: "%s", disbursementDate: "%s", chequeNo: "%s", amountPaid: "%s" }'
            % (supplier, idx, entity, pay_date, status, issued_date,
               pay_date, cheque_no, fmt_rp(amt_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


# --- AR TAB GENERATORS ---

def gen_ar_account_receivables():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)
        customer = ar_customers[i % len(ar_customers)]
        subtotal_n = 500000 + (i * 437000) % 15000000
        tax_n = int(subtotal_n * 0.11)
        total_n = subtotal_n + tax_n
        statuses = ["Paid", "Unpaid", "Partial", "Paid", "Unpaid"]
        status = statuses[i % 5]
        paid_n = total_n if status == "Paid" else (total_n // 2 if status == "Partial" else 0)
        due_n = total_n - paid_n

        rows.append(
            '      { invoiceDate: "%s", dueDate: "%s", customer: "%s", docNo: "IR/SO/2026/%04d", refNo: "REF-IR%03d", status: "%s", subtotal: "%s", tax: "%s", total: "%s", paid: "%s", due: "%s" }'
            % (inv_date, due_date, customer, idx, idx, status,
               fmt_rp(subtotal_n), fmt_rp(tax_n), fmt_rp(total_n),
               fmt_rp(paid_n), fmt_rp(due_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_invoice_receivables():
    items = [
        "Mesin Alternator Rebuilt",
        "Kampas Rem Depan - Toyota Avanza",
        "Ban Michelin Pilot Sport 4",
        "Service Ringan + Ganti Oli",
        "Filter Oli Mobil - Toyota Avanza",
        "Busi NGK Iridium",
        "V-Belt Honda Vario",
        "Master Rem Depan - Yamaha Mio",
        "Filter Udara - Suzuki Ertiga",
        "Lampu LED H4 Philips",
        "Kampas Rem Belakang - Toyota Avanza",
        "Bearing Roda Depan - Honda Jazz",
        "Shock Breaker Depan - Honda Beat",
        "Radiator Coolant - Toyota Innova",
        "Oli Mesin 5W-40 SN Plus",
    ]
    unit_prices = [3500000, 450000, 2800000, 850000, 75000, 45000, 85000, 320000, 95000, 150000, 180000, 275000, 410000, 65000, 185000]
    qtys = [1, 2, 4, 3, 10, 15, 12, 6, 9, 10, 8, 7, 5, 14, 20]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        entity = ar_entities[i % 2]
        customer = ar_customers[i % len(ar_customers)]
        item = items[i % len(items)]
        qty = qtys[i % len(qtys)]
        up = unit_prices[i % len(unit_prices)]
        sub_n = qty * up
        tax_n = int(sub_n * 0.11)
        total_n = sub_n + tax_n

        rows.append(
            '      { invoiceDate: "%s", entity: "%s", customer: "%s", docNo: "INV-%04d", refNo: "REF-IR%03d", itemDesc: "%s", qty: %d, unitPrice: "%s", subTotal: "%s", tax: "%s", total: "%s" }'
            % (inv_date, entity, customer, idx, idx, item, qty,
               fmt_rp(up), fmt_rp(sub_n), fmt_rp(tax_n), fmt_rp(total_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_aging():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)
        customer = ar_customers[i % len(ar_customers)]
        entity = ar_entities[i % 2]
        balance_n = 500000 + (i * 217000) % 8000000
        balance_s = fmt_rp(balance_n)
        current = d1_30 = d31_60 = d61_90 = over90 = "0"
        if i < 8: current = balance_s
        elif i < 14: d1_30 = balance_s
        elif i < 20: d31_60 = balance_s
        elif i < 26: d61_90 = balance_s
        else: over90 = balance_s

        rows.append(
            '      { entity: "%s", customer: "%s", docNo: "IR/SO/2026/%04d", refNo: "REF-IR%03d", invoiceDate: "%s", dueDate: "%s", current: "%s", d1_30: "%s", d31_60: "%s", d61_90: "%s", over90: "%s", balance: "%s" }'
            % (entity, customer, idx, idx, inv_date, due_date,
               current, d1_30, d31_60, d61_90, over90, balance_s)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_payments():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 7 - (month_offset % 7)
        if month < 1: month = 1
        if month > 7: month = 7
        pay_date = make_date(day, month)
        customer = ar_customers[i % len(ar_customers)]
        account = ar_payment_accounts[i % 3]
        bank_code = ["BCA", "MDR", "BRI"][i % 3]
        statuses = ["Cleared", "Cleared", "Pending", "Cleared", "Pending"]
        status = statuses[i % 5]
        pay_n = 500000 + (i * 337000) % 9000000
        inv_idx = idx - 1 if idx > 1 else 1

        rows.append(
            '      { paymentDate: "%s", docNo: "RCT-2026/%04d", payRef: "TRF-%s-%04d", invoiceRef: "IR/SO/2026/%04d", customer: "%s", status: "%s", payment: "%s", account: "%s" }'
            % (pay_date, idx, bank_code, idx, inv_idx,
               customer, status, fmt_rp(pay_n), account)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_credit():
    statuses = ["Approved", "Draft", "Approved", "Approved", "Draft"]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        customer = ar_customers[i % len(ar_customers)]
        entity = ar_entities[i % 2]
        status = statuses[i % 5]
        subtotal_n = 500000 + (i * 173000) % 5000000
        tax_n = int(subtotal_n * 0.11)
        wht_n = int(subtotal_n * 0.02)
        total_n = subtotal_n + tax_n - wht_n

        rows.append(
            '      { invoiceDate: "%s", entity: "%s", customer: "%s", docNo: "CN-AR/2026/%03d", status: "%s", subtotal: "%s", tax: "%s", wht: "%s", total: "%s" }'
            % (inv_date, entity, customer, idx, status,
               fmt_rp(subtotal_n), fmt_rp(tax_n), fmt_rp(wht_n), fmt_rp(total_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_overdue():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        due_month = month + 1
        if due_month > 12: due_month = 12
        due_date = make_date(day, due_month)
        customer = ar_customers[i % len(ar_customers)]
        entity = ar_entities[i % 2]
        credit_term = 30 if i % 3 != 0 else 45
        overdue_days = 15 + (i * 7) % 120
        bal_n = 1000000 + (i * 317000) % 9000000

        rows.append(
            '      { customer: "%s", docNo: "IR/SO/2026/%04d", entity: "%s", refNo: "REF-IR%03d", creditTerm: %d, overdueDays: %d, date: "%s", dueDate: "%s", balance: "%s" }'
            % (customer, idx, entity, idx, credit_term, overdue_days,
               inv_date, due_date, fmt_rp(bal_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_overlimit():
    rows = []
    for i in range(30):
        customer = ar_customers[i % len(ar_customers)]
        credit_lim_n = 5000000 + (i * 500000) % 20000000
        sales_inv_n = credit_lim_n + 1000000 + (i * 300000) % 5000000
        inv_recv_n = credit_lim_n + (i * 200000) % 3000000
        bal_n = sales_inv_n - inv_recv_n

        rows.append(
            '      { customer: "%s", creditLimit: "%s", salesInvoices: "%s", invoiceReceivables: "%s", balance: "%s" }'
            % (customer, fmt_rp(credit_lim_n), fmt_rp(sales_inv_n),
               fmt_rp(inv_recv_n), fmt_rp(bal_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_subledger():
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 6 - (month_offset % 6)
        if month < 1: month = 1
        inv_date = make_date(day, month)
        customer = ar_customers[i % len(ar_customers)]
        entity = ar_entities[i % 2]
        net_n = 500000 + (i * 237000) % 8000000
        paid_n = 0
        paid_date_s = "-"
        if i % 3 == 0:
            paid_n = net_n
            paid_day = min(day + 10, 28)
            paid_date_s = make_date(paid_day, min(month + 1, 12))
        elif i % 4 == 0:
            paid_n = net_n // 2
        due_n = net_n - paid_n

        rows.append(
            '      { entity: "%s", customer: "%s", invoiceNo: "IR/SO/2026/%04d", invoiceDate: "%s", netSubtotal: "%s", paid: "%s", dueAmount: "%s", paidDate: "%s" }'
            % (entity, customer, idx, inv_date, fmt_rp(net_n),
               fmt_rp(paid_n), fmt_rp(due_n), paid_date_s)
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def gen_ar_cheque():
    statuses = ["Cleared", "Cleared", "Pending", "Cleared", "Bounced"]
    rows = []
    for i in range(30):
        idx = 30 - i
        day = ((30 - i) % 28) + 1
        month_offset = i // 5
        month = 7 - (month_offset % 7)
        if month < 1: month = 1
        if month > 7: month = 7
        pay_date = make_date(day, month)
        customer = ar_customers[i % len(ar_customers)]
        entity = ar_entities[i % 2]
        status = statuses[i % 5]
        issued_day = max(day - 5, 1)
        issued_date = make_date(issued_day, month)
        cheque_type = "CK" if i % 3 != 0 else "BG"
        cheque_no = "%s-%06d" % (cheque_type, 100000 + i * 1234)
        amt_n = 500000 + (i * 437000) % 6000000

        rows.append(
            '      { customer: "%s", docNo: "RCT-2026/%04d", entity: "%s", paymentDate: "%s", status: "%s", issuedDate: "%s", chequeNo: "%s", amount: "%s" }'
            % (customer, idx, entity, pay_date, status, issued_date,
               cheque_no, fmt_rp(amt_n))
        )
    return "[\n" + ",\n".join(rows) + ",\n    ]"


# --- FILE PATCHING ---

def find_data_range(content, tab_id):
    """Find the start and end indices of the data array for a given tab."""
    # Find the tab section
    tab_marker = 'id: "' + tab_id + '"'
    tab_start = content.find(tab_marker)
    if tab_start == -1:
        return None, None

    # Find the data: [ within this tab section
    data_marker = 'data: ['
    data_start = content.find(data_marker, tab_start)
    if data_start == -1:
        return None, None

    # Find the matching closing bracket
    bracket_count = 0
    i = data_start + len('data: ')
    while i < len(content):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                return data_start, i + 1
        i += 1

    return None, None


def process_file(filepath, generators):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Process in reverse order to avoid index shifting
    tab_ids = list(generators.keys())
    for tab_id in tab_ids:
        start, end = find_data_range(content, tab_id)
        if start is None:
            print(f"  WARNING: Could not find data array for tab '{tab_id}'")
            continue
        new_data = generators[tab_id]()
        content = content[:start] + 'data: ' + new_data + content[end:]
        print(f"  Processed tab: {tab_id}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Saved: {filepath}")


if __name__ == "__main__":
    base = r"C:\Projects\pwncorp\src\app\finance\reports"

    print("=== Expanding AP Reports ===")
    ap_generators = {
        "account-payables": gen_ap_account_payables,
        "invoice-payables": gen_ap_invoice_payables,
        "ap-aging": gen_ap_aging,
        "ap-payments": gen_ap_payments,
        "ap-credit": gen_ap_credit,
        "ap-overdue": gen_ap_overdue,
        "ap-overlimit": gen_ap_overlimit,
        "ap-subledger": gen_ap_subledger,
        "ap-cheque": gen_ap_cheque,
    }
    process_file(base + "\\ap\\page.tsx", ap_generators)

    print("\n=== Expanding AR Reports ===")
    ar_generators = {
        "account-receivables": gen_ar_account_receivables,
        "invoice-receivables": gen_ar_invoice_receivables,
        "ar-aging": gen_ar_aging,
        "ar-payments": gen_ar_payments,
        "ar-credit": gen_ar_credit,
        "ar-overdue": gen_ar_overdue,
        "ar-overlimit": gen_ar_overlimit,
        "ar-subledger": gen_ar_subledger,
        "ar-cheque": gen_ar_cheque,
    }
    process_file(base + "\\ar\\page.tsx", ar_generators)

    print("\nDone!")
