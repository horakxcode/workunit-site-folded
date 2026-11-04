import { checkInvoice } from "./check.js";
import assert from "node:assert/strict";

const today = new Date();
const iso = (days) => {
  const d = new Date(today.getTime() + days * 86400000);
  return d.toISOString().slice(0, 10);
};

function invoice(overrides = {}) {
  return {
    vendorName: "Harbor Linen Service",
    invoiceNumber: "HL-30176",
    invoiceDate: iso(-3),
    dueDate: iso(27),
    currency: "USD",
    poNumber: "PO-100",
    subtotal: 200,
    tax: 16.5,
    total: 216.5,
    lineItems: [{ sku: "BIB", description: "Patient bibs", quantity: 10, unitPrice: 20, amount: 200 }],
    ...overrides,
  };
}

const po = {
  vendorName: "Harbor Linen Service",
  poNumber: "PO-100",
  currency: "USD",
  status: "open",
  lines: [{ sku: "BIB", description: "Patient bibs", quantity: 10, qtyOrdered: 10, unitPrice: 20 }],
};
const receipts = [{ poNumber: "PO-100", lines: [{ sku: "BIB", qtyReceived: 10 }] }];
const payments = [{ vendorName: "Harbor Linen Service", invoiceNumber: "HL-30176", amount: 216.5 }];
const closeSupport = [{ name: "bank rec", present: true }];

function codesOf(extraction, extra = {}) {
  return checkInvoice({
    extraction,
    vendorProfile: extra.vendorProfile === undefined ? { currency: "USD", taxRatePct: 8.25, tolerancePt: 0.05 } : extra.vendorProfile,
    purchaseOrders: [po],
    receipts,
    payments,
    closeSupport,
    ...extra,
  }).codes;
}

const pass = codesOf(invoice());
assert.deepEqual(pass, [], pass.join(","));

assert.ok(codesOf(invoice({ vendorName: "" })).includes("REQUIRED_MISSING"));
assert.ok(codesOf(invoice({ currency: "EUR" })).includes("CURRENCY_VENDOR_MISMATCH"));
assert.ok(codesOf(invoice({ tax: 20, total: 220 })).includes("TAX_RATE_MISMATCH"));
assert.ok(codesOf(invoice({ lineItems: [{ sku: "BIB", quantity: 10, unitPrice: 20, amount: 180 }] })).includes("LINE_MATH"));
assert.ok(codesOf(invoice({ subtotal: 190 })).includes("TOTALS_MISMATCH"));
assert.ok(codesOf(invoice({ invoiceDate: iso(2) })).includes("DATE_IN_FUTURE"));
assert.ok(codesOf(invoice({ invoiceDate: iso(-200), dueDate: iso(-170) })).includes("DATE_STALE"));
assert.ok(codesOf(invoice({ dueDate: iso(-10) })).includes("DATE_DUE_BEFORE_ISSUED"));
assert.ok(codesOf(invoice(), { history: [{ vendorName: "Harbor Linen Service", invoiceNumber: "HL-30176", total: 1, invoiceDate: iso(-1) }] }).includes("DUPLICATE_NUMBER"));
assert.ok(codesOf(invoice(), { history: [{ vendorName: "harbor linen service", invoiceNumber: "OTHER", total: 216.5, invoiceDate: iso(-2) }] }).includes("DUPLICATE_TOTAL"));

assert.ok(codesOf(invoice({ poNumber: "" })).includes("PO_MISSING"));
assert.ok(codesOf(invoice({ poNumber: "PO-999" })).includes("PO_NOT_FOUND"));
assert.ok(codesOf(invoice(), { purchaseOrders: [{ ...po, vendorName: "Other Co" }] }).includes("VENDOR_PO_MISMATCH"));
assert.ok(codesOf(invoice(), { receipts: [{ poNumber: "PO-100", lines: [{ sku: "BIB", qtyReceived: 6 }] }] }).includes("QTY_OVER_RECEIVED"));
assert.ok(codesOf(invoice({ lineItems: [{ sku: "BIB", description: "Patient bibs", quantity: 1, unitPrice: 21, amount: 21 }], subtotal: 21, tax: 1.73, total: 22.73 })).includes("PRICE_MISMATCH"));
assert.ok(codesOf(invoice({ lineItems: [{ sku: "BIB", quantity: 1, unitPrice: 20, amount: 20 }], subtotal: 20, tax: 1.65, total: 21.65 }), { acceptedQty: { bib: 10 } }).includes("ALREADY_INVOICED"));

assert.ok(codesOf(invoice(), { payments: [{ vendorName: "Other Co", invoiceNumber: "X", amount: 1 }] }).includes("CASH_UNAPPLIED"));
assert.ok(codesOf(invoice(), { payments: [{ vendorName: "Harbor Linen Service", invoiceNumber: "HL-30176", amount: 100 }] }).includes("CASH_SHORT"));
assert.ok(codesOf(invoice(), { closeSupport: [{ name: "bank rec", present: false }] }).includes("CLOSE_MISSING"));
assert.ok(codesOf(invoice(), { closeSupport: [] }).includes("CLOSE_MISSING") === false);
assert.deepEqual(checkInvoice({ extraction: invoice() }).codes.filter((code) => code.startsWith("PO_") || code.startsWith("CASH_") || code.startsWith("CLOSE_")), []);

const untouched = invoice();
checkInvoice({ extraction: untouched, purchaseOrders: [po], receipts, payments, closeSupport });
assert.equal(untouched.total, 216.5);

console.log("ok");
