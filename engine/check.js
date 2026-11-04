// Deterministic invoice checks. A failure is a code, never a corrected value.
// Money is compared in cents. Dates are calendar dates.

export const STALE_DAYS = 180;
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_TAX_RATE_PCT = 8.25;
export const DEFAULT_TAX_TOLERANCE_PT = 0.05;

const REQUIRED = [
  ["vendorName", "vendor name"],
  ["invoiceNumber", "invoice number"],
  ["invoiceDate", "invoice date"],
  ["currency", "currency"],
  ["subtotal", "subtotal"],
  ["tax", "tax"],
  ["total", "total"],
];

export function checkInvoice(input) {
  const extraction = input.extraction || {};
  const findings = [];
  const flag = (code, field, detail) => findings.push({ code, field, detail });

  for (const [key, label] of REQUIRED) {
    if (blank(extraction[key])) flag("REQUIRED_MISSING", key, label);
  }
  if (blank(extraction.dueDate) && blank(extraction.paymentTerms)) {
    flag("REQUIRED_MISSING", "dueDate", "due date or payment terms");
  }
  const lines = Array.isArray(extraction.lineItems) ? extraction.lineItems : [];
  if (!lines.some((line) => cents(line.amount) !== null)) {
    flag("REQUIRED_MISSING", "lineItems", "at least one line item with an amount");
  }

  const kind = norm(extraction.documentKind);
  if (kind && !/invoice|bill|credit/.test(kind)) {
    flag("NOT_AN_INVOICE", "documentKind", extraction.documentKind);
  }

  checkDates(extraction, flag);
  checkMath(extraction, lines, flag);
  checkVendor(extraction, input, flag);
  checkDuplicates(extraction, input.history || [], flag);

  const units = input.units || { ap: true, cash: true, close: true };
  if (units.ap !== false) checkAp(extraction, input, flag);
  if (units.cash !== false) checkCash(extraction, input.payments || [], flag);
  if (units.close !== false) checkClose(input.closeSupport, flag);

  return {
    status: findings.length ? "flag" : "pass",
    codes: findings.map((f) => f.code),
    findings,
  };
}

function checkDates(extraction, flag) {
  const issued = dateOf(extraction.invoiceDate);
  const due = dateOf(extraction.dueDate);
  if (!blank(extraction.invoiceDate) && !issued) flag("DATE_UNREADABLE", "invoiceDate", String(extraction.invoiceDate));
  if (!blank(extraction.dueDate) && !due) flag("DATE_UNREADABLE", "dueDate", String(extraction.dueDate));
  const today = dateOf(inputToday());
  if (issued && issued > today) flag("DATE_IN_FUTURE", "invoiceDate", extraction.invoiceDate);
  if (issued && daysBetween(issued, today) > STALE_DAYS) flag("DATE_STALE", "invoiceDate", extraction.invoiceDate);
  if (issued && due && due < issued) flag("DATE_DUE_BEFORE_ISSUED", "dueDate", extraction.dueDate);
}

function checkMath(extraction, lines, flag) {
  let lineSum = 0;
  let any = false;
  lines.forEach((line, index) => {
    const amount = cents(line.amount);
    const qty = num(line.quantity);
    const unit = cents(line.unitPrice);
    if (amount === null) return;
    any = true;
    lineSum += amount;
    if (qty !== null && unit !== null && Math.abs(Math.round(qty * unit) - amount) > 1) {
      flag("LINE_MATH", `lineItems.${index}.amount`, "quantity times unit price does not equal the line amount");
    }
  });
  const subtotal = cents(extraction.subtotal);
  const tax = cents(extraction.tax);
  const shipping = cents(extraction.shipping) || 0;
  const fees = cents(extraction.fees) || 0;
  const discounts = cents(extraction.discounts) || 0;
  const total = cents(extraction.total);
  if (any && subtotal !== null && Math.abs(lineSum - subtotal) > 1) {
    flag("TOTALS_MISMATCH", "subtotal", "line amounts do not equal the subtotal");
  }
  if (subtotal !== null && tax !== null && total !== null) {
    const expected = subtotal - discounts + tax + shipping + fees;
    if (Math.abs(expected - total) > 1) flag("TOTALS_MISMATCH", "total", "subtotal, tax, and fees do not equal the total");
  }
}

function checkVendor(extraction, input, flag) {
  if (input.vendorChecks === false) return;
  const profile = input.vendorProfile || {};
  const expectedCurrency = norm(profile.currency || DEFAULT_CURRENCY).toUpperCase();
  const currency = norm(extraction.currency).toUpperCase();
  if (currency && currency !== expectedCurrency) flag("CURRENCY_VENDOR_MISMATCH", "currency", currency);
  const subtotal = num(extraction.subtotal);
  const tax = num(extraction.tax);
  if (subtotal === null || tax === null || subtotal === 0) return;
  const rate = (tax / subtotal) * 100;
  const expected = profile.taxRatePct ?? DEFAULT_TAX_RATE_PCT;
  const tolerance = profile.tolerancePt ?? DEFAULT_TAX_TOLERANCE_PT;
  if (Math.abs(rate - expected) > tolerance + 1e-9) flag("TAX_RATE_MISMATCH", "tax", `${round2(rate)}%`);
}

function checkDuplicates(extraction, history, flag) {
  const vendor = vendorKey(extraction.vendorName);
  const number = norm(extraction.invoiceNumber).toLowerCase();
  const total = cents(extraction.total);
  const issued = dateOf(extraction.invoiceDate);
  if (!vendor) return;
  for (const prior of history) {
    if (vendorKey(prior.vendorName) !== vendor) continue;
    if (number && norm(prior.invoiceNumber).toLowerCase() === number) {
      flag("DUPLICATE_NUMBER", "invoiceNumber", prior.invoiceNumber);
      break;
    }
  }
  if (total === null || !issued) return;
  for (const prior of history) {
    if (vendorKey(prior.vendorName) !== vendor) continue;
    if (cents(prior.total) !== total) continue;
    const priorDate = dateOf(prior.invoiceDate);
    if (priorDate && Math.abs(daysBetween(priorDate, issued)) <= 7) {
      flag("DUPLICATE_TOTAL", "total", "same vendor and total within 7 days");
      break;
    }
  }
}

function checkAp(extraction, input, flag) {
  const poNumber = norm(extraction.poNumber);
  if (!poNumber) {
    flag("PO_MISSING", "poNumber", "no purchase order number");
    return;
  }
  const book = input.purchaseOrders || [];
  const po = book.find((row) => norm(row.poNumber).toUpperCase() === poNumber.toUpperCase());
  if (!po) {
    flag("PO_NOT_FOUND", "poNumber", poNumber);
    return;
  }
  if (norm(po.status).toLowerCase() === "closed") flag("PO_CLOSED", "poNumber", poNumber);
  if (vendorKey(po.vendorName) !== vendorKey(extraction.vendorName)) {
    flag("VENDOR_PO_MISMATCH", "vendorName", po.vendorName);
  }
  const invoiceCurrency = norm(extraction.currency).toUpperCase();
  const poCurrency = norm(po.currency || invoiceCurrency).toUpperCase();
  if (invoiceCurrency && poCurrency && invoiceCurrency !== poCurrency) {
    flag("CURRENCY_PO_MISMATCH", "currency", poCurrency);
  }
  const lines = Array.isArray(extraction.lineItems) ? extraction.lineItems : [];
  const poLines = po.lines || [];
  const received = receivedQty(input.receipts || [], poNumber);
  const already = input.acceptedQty || {};
  lines.forEach((line, index) => {
    const match = matchLine(line, poLines);
    if (!match) {
      flag("LINE_UNMATCHED", `lineItems.${index}`, line.description || line.sku || "line");
      return;
    }
    const key = lineKey(match);
    const ordered = num(match.qtyOrdered) || 0;
    const got = received[key] || 0;
    const used = already[key] || 0;
    const qty = num(line.quantity);
    if (qty !== null && qty > got - used + 1e-9) {
      flag(got - used <= 0 && used > 0 ? "ALREADY_INVOICED" : "QTY_OVER_RECEIVED", `lineItems.${index}.quantity`, String(qty));
    }
    if (got > ordered + 1e-9) flag("QTY_OVER_ORDERED", `lineItems.${index}.quantity`, String(got));
    const invoicePrice = cents(line.unitPrice);
    const poPrice = cents(match.unitPrice);
    if (invoicePrice !== null && poPrice !== null && Math.abs(invoicePrice - poPrice) > 1) {
      flag("PRICE_MISMATCH", `lineItems.${index}.unitPrice`, String(line.unitPrice));
    }
  });
}

function checkCash(extraction, payments, flag) {
  const vendor = vendorKey(extraction.vendorName);
  const number = norm(extraction.invoiceNumber).toLowerCase();
  const total = cents(extraction.total);
  const applied = payments.filter((payment) => vendorKey(payment.vendorName) === vendor && norm(payment.invoiceNumber).toLowerCase() === number);
  if (!applied.length) {
    flag("CASH_UNAPPLIED", "total", "no payment matches this invoice");
    return;
  }
  const paid = applied.reduce((sum, payment) => sum + (cents(payment.amount) || 0), 0);
  if (total !== null && paid + 1 < total) flag("CASH_SHORT", "total", String(paid / 100));
}

function checkClose(support, flag) {
  if (!Array.isArray(support) || support.length === 0) {
    flag("CLOSE_MISSING", "closeSupport", "no close file");
    return;
  }
  for (const item of support) {
    if (!item.present) flag("CLOSE_MISSING", "closeSupport", item.name || "missing support");
  }
}

function receivedQty(receipts, poNumber) {
  const out = {};
  for (const receipt of receipts) {
    if (norm(receipt.poNumber).toUpperCase() !== poNumber.toUpperCase()) continue;
    for (const line of receipt.lines || []) {
      const key = lineKey(line);
      out[key] = (out[key] || 0) + (num(line.qtyReceived) || 0);
    }
  }
  return out;
}

function matchLine(line, poLines) {
  const sku = norm(line.sku).toLowerCase();
  if (sku) {
    const hit = poLines.find((row) => norm(row.sku).toLowerCase() === sku);
    if (hit) return hit;
  }
  const description = norm(line.description).toLowerCase();
  if (!description) return null;
  return poLines.find((row) => norm(row.description).toLowerCase() === description) || null;
}

function lineKey(line) {
  return norm(line.sku).toLowerCase() || norm(line.description).toLowerCase();
}

function blank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function norm(value) {
  return blank(value) ? "" : String(value).trim();
}

function vendorKey(value) {
  return norm(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function num(value) {
  if (blank(value)) return null;
  const n = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function cents(value) {
  const n = num(value);
  return n === null ? null : Math.round(n * 100);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function dateOf(value) {
  const text = norm(value);
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [year, month, day] = match.length === 4 && text.includes("-")
    ? [Number(match[1]), Number(match[2]), Number(match[3])]
    : [Number(match[3]), Number(match[1]), Number(match[2])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function inputToday() {
  return new Date().toISOString().slice(0, 10);
}

const isMain = process.argv[1] && process.argv[1].endsWith("check.js");
if (isMain && process.argv[2]) {
  const fs = await import("node:fs");
  const input = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  console.log(JSON.stringify(checkInvoice(input), null, 2));
}
