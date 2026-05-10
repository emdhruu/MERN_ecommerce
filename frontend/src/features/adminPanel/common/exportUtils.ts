import type { Invoice } from "../invoice/invoiceApi";

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadInvoicePDF = (invoice: Invoice) => {
  const itemRows = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.total.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; font-size: 14px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .invoice-title { font-size: 28px; font-weight: 700; color: #D54F47; }
        .invoice-number { font-size: 13px; color: #6b7280; margin-top: 4px; font-family: monospace; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
        .badge-sales { background: #dbeafe; color: #1d4ed8; }
        .badge-purchase { background: #dcfce7; color: #166534; }
        .badge-status { background: #f3f4f6; color: #374151; margin-left: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-block label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-block p { font-weight: 500; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        thead th:nth-child(2) { text-align: center; }
        thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
        .totals { margin-left: auto; width: 280px; }
        .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .totals .row.total { border-top: 2px solid #1f2937; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 700; }
        .notes { margin-top: 30px; padding: 12px 16px; background: #f9fafb; border-radius: 6px; font-size: 13px; color: #6b7280; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${invoice.invoiceNumber}</div>
        </div>
        <div>
          <span class="badge ${invoice.type === "SALES" ? "badge-sales" : "badge-purchase"}">${invoice.type}</span>
          <span class="badge badge-status">${invoice.status}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-block">
          <label>${invoice.type === "SALES" ? "Bill To" : "Supplier"}</label>
          <p>${invoice.type === "SALES" ? (invoice.customer?.name || "N/A") : (invoice.supplier?.name || "N/A")}</p>
          ${invoice.customer?.email ? `<p style="font-size: 12px; color: #6b7280;">${invoice.customer.email}</p>` : ""}
        </div>
        <div class="info-block" style="text-align: right;">
          <label>Issue Date</label>
          <p>${new Date(invoice.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span>₹${invoice.subtotal.toFixed(2)}</span></div>
        ${invoice.taxRate > 0 ? `<div class="row"><span>Tax (${invoice.taxRate}%)</span><span>₹${invoice.tax.toFixed(2)}</span></div>` : ""}
        ${invoice.discount > 0 ? `<div class="row"><span>Discount</span><span style="color: #16a34a;">-₹${invoice.discount.toFixed(2)}</span></div>` : ""}
        <div class="row total"><span>Total</span><span>₹${invoice.totalAmount.toFixed(2)}</span></div>
      </div>

      ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ""}

      <div class="footer">
        This is a computer generated invoice and does not require a signature.<br/>
        Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export const exportInvoiceCSV = (invoices: Invoice[]) => {
  const headers = ["Invoice #", "Type", "Customer/Supplier", "Subtotal", "Tax", "Discount", "Total", "Status", "Date"];
  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.type,
    inv.type === "SALES" ? (inv.customer?.name || "") : (inv.supplier?.name || ""),
    inv.subtotal.toFixed(2),
    inv.tax.toFixed(2),
    inv.discount.toFixed(2),
    inv.totalAmount.toFixed(2),
    inv.status,
    new Date(inv.issuedAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(csv, `invoices-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportSingleInvoiceCSV = (invoice: Invoice) => {
  const lines: string[] = [];
  lines.push(`Invoice Number,${invoice.invoiceNumber}`);
  lines.push(`Type,${invoice.type}`);
  lines.push(`Status,${invoice.status}`);
  lines.push(`Date,${new Date(invoice.issuedAt).toLocaleDateString()}`);
  lines.push(`${invoice.type === "SALES" ? "Customer" : "Supplier"},${invoice.type === "SALES" ? invoice.customer?.name : invoice.supplier?.name}`);
  lines.push("");
  lines.push("Item,Quantity,Unit Price,Total");
  invoice.items.forEach((item) => {
    lines.push(`${item.name},${item.quantity},${item.unitPrice.toFixed(2)},${item.total.toFixed(2)}`);
  });
  lines.push("");
  lines.push(`Subtotal,,,₹${invoice.subtotal.toFixed(2)}`);
  if (invoice.taxRate > 0) lines.push(`Tax (${invoice.taxRate}%),,,₹${invoice.tax.toFixed(2)}`);
  if (invoice.discount > 0) lines.push(`Discount,,,-₹${invoice.discount.toFixed(2)}`);
  lines.push(`Total,,,₹${invoice.totalAmount.toFixed(2)}`);

  downloadCSV(lines.join("\n"), `${invoice.invoiceNumber}.csv`);
};

export const exportOrdersCSV = (orders: any[]) => {
  const headers = ["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date"];
  const rows = orders.map((order) => {
    const total = typeof order.totalAmount === "object"
      ? parseFloat(order.totalAmount.$numberDecimal)
      : Number(order.totalAmount);
    return [
      order._id.slice(-8).toUpperCase(),
      order.user?.name || "N/A",
      order.items.length,
      total.toFixed(2),
      order.paymentStatus,
      order.orderStatus,
      new Date(order.createdAt).toLocaleDateString(),
    ];
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(csv, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportInventoryCSV = (inventory: any[]) => {
  const headers = ["Product", "Available", "Reserved", "Total", "Threshold", "Status"];
  const rows = inventory.map((item) => {
    const status = item.availableStock === 0 ? "Out of Stock"
      : item.availableStock <= item.lowStockThreshold ? "Low Stock" : "In Stock";
    return [
      item.product?.name || "Unknown",
      item.availableStock,
      item.reservedStock,
      item.totalStock,
      item.lowStockThreshold,
      status,
    ];
  });

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(csv, `inventory-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const exportLedgerCSV = (entries: any[]) => {
  const headers = ["Date", "Product", "Type", "Quantity", "Reference", "Note"];
  const rows = entries.map((entry) => [
    new Date(entry.createdAt).toLocaleString(),
    entry.productId?.name || "Unknown",
    entry.type,
    entry.quantity,
    entry.reference,
    (entry.note || "").replace(/,/g, ";"),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadCSV(csv, `ledger-${new Date().toISOString().slice(0, 10)}.csv`);
};

export const downloadLedgerPDF = (entries: any[]) => {
  const rows = entries
    .map((entry) => {
      const isPositive = entry.type === "IN" || entry.type === "RELEASE";
      const color = isPositive ? "#16a34a" : "#dc2626";
      const sign = isPositive ? "+" : "-";
      return `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${new Date(entry.createdAt).toLocaleString()}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${entry.productId?.name || "Unknown"}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;"><span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${entry.type}</span></td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: ${color};">${sign}${entry.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">${entry.reference}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; max-width: 200px;">${entry.note || "-"}</td>
        </tr>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inventory Ledger</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; font-size: 14px; }
        .header { margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 700; color: #D54F47; }
        .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
        thead th { padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: center; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Inventory Ledger</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} &bull; ${entries.length} entries</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Reference</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        This is a computer generated report and does not require a signature.
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
