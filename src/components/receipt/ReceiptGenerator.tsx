// src/components/receipt/ReceiptGenerator.tsx
import React from "react";
import { CartItem } from "../../hooks/useCart";
import { BusinessData } from "../../hooks/useBusiness";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ReceiptGeneratorProps {
  cart: CartItem[];
  customerInfo: CustomerInfo;
  total: number;
  businessInfo?: BusinessData;
}

export const generateReceiptHTML = ({
  cart,
  customerInfo,
  total,
  businessInfo,
}: ReceiptGeneratorProps): string => {
  const date = new Date().toLocaleString();
  const receiptNumber = `R-${Date.now().toString().slice(-6)}`;
  const businessName = businessInfo?.name || "ScanStock Pro";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
          
          body { 
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
            color: #1e293b;
            background-color: #fff;
          }
          
          .receipt {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .receipt-header {
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #2563eb;
          }
          
          .receipt-details {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 14px;
            color: #64748b;
          }
          
          .receipt-body {
            padding: 20px;
          }
          
          .business-info {
            text-align: center;
            margin-bottom: 15px;
          }
          
          .business-info p {
            margin: 3px 0;
            font-size: 14px;
            color: #334155;
          }
          
          .customer-info {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #e2e8f0;
          }
          
          .customer-info p {
            margin-bottom: 3px;
            font-size: 14px;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .items-table th {
            text-align: left;
            color: #64748b;
            font-weight: 500;
            font-size: 14px;
            padding: 8px 4px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .items-table td {
            padding: 12px 4px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
          }
          
          .items-table .qty-col {
            text-align: center;
            width: 50px;
          }
          
          .items-table .price-col {
            text-align: right;
            width: 80px;
          }
          
          .items-table .total-col {
            text-align: right;
            width: 80px;
          }
          
          .receipt-summary {
            margin-top: 20px;
            text-align: right;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }
          
          .summary-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 5px;
          }
          
          .summary-label {
            font-size: 14px;
            color: #64748b;
            margin-right: 20px;
            min-width: 100px;
            text-align: right;
          }
          
          .summary-value {
            font-size: 14px;
            min-width: 80px;
            text-align: right;
          }
          
          .total-row {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-weight: bold;
          }
          
          .total-label {
            font-size: 16px;
            color: #1e293b;
          }
          
          .total-value {
            font-size: 16px;
            color: #2563eb;
          }
          
          .receipt-footer {
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
          }
          
          .thank-you {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 10px;
          }
          
          .footer-message {
            font-size: 14px;
            color: #64748b;
          }
          
          .barcode {
            margin-top: 15px;
            text-align: center;
          }
          
          .barcode-value {
            font-family: monospace;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="company-name">${businessName}</div>
            ${
              businessInfo
                ? `
              <div class="business-info">
                ${businessInfo.address ? `<p>${businessInfo.address}</p>` : ""}
                ${
                  businessInfo.city && businessInfo.state
                    ? `<p>${businessInfo.city}, ${businessInfo.state} ${
                        businessInfo.postalCode || ""
                      }</p>`
                    : businessInfo.city
                    ? `<p>${businessInfo.city}</p>`
                    : ""
                }
                ${businessInfo.country ? `<p>${businessInfo.country}</p>` : ""}
                ${
                  businessInfo.phoneNumber
                    ? `<p>Phone: ${businessInfo.phoneNumber}</p>`
                    : ""
                }
                ${
                  businessInfo.website
                    ? `<p>Website: ${businessInfo.website}</p>`
                    : ""
                }
                ${
                  businessInfo.taxId
                    ? `<p>Tax ID: ${businessInfo.taxId}</p>`
                    : ""
                }
              </div>
            `
                : ""
            }
            <div class="receipt-details">
              <span>Receipt #${receiptNumber}</span>
              <span>${date}</span>
            </div>
          </div>
          
          <div class="receipt-body">
            ${
              customerInfo.name || customerInfo.email || customerInfo.phone
                ? `
              <div class="customer-info">
                ${
                  customerInfo.name
                    ? `<p><strong>Customer:</strong> ${customerInfo.name}</p>`
                    : ""
                }
                ${
                  customerInfo.email
                    ? `<p><strong>Email:</strong> ${customerInfo.email}</p>`
                    : ""
                }
                ${
                  customerInfo.phone
                    ? `<p><strong>Phone:</strong> ${customerInfo.phone}</p>`
                    : ""
                }
              </div>
            `
                : ""
            }
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="qty-col">Qty</th>
                  <th class="price-col">Price</th>
                  <th class="total-col">Total</th>
                </tr>
              </thead>
              <tbody>
                ${cart
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="qty-col">${item.quantity}</td>
                    <td class="price-col">$${item.price}</td>
                    <td class="total-col">$${(
                      item.price * item.quantity
                    ).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="receipt-summary">
              <div class="summary-row">
                <div class="summary-label">Subtotal:</div>
                <div class="summary-value">$${
                  typeof total === "number" ? total.toFixed(2) : total
                }</div>
              </div>
              <div class="summary-row">
                <div class="summary-label">Tax:</div>
                <div class="summary-value">$0.00</div>
              </div>
              <div class="summary-row total-row">
                <div class="summary-label total-label">Total:</div>
                <div class="summary-value total-value">$${
                  typeof total === "number" ? total.toFixed(2) : total
                }</div>
              </div>
            </div>
          </div>
          
          <div class="receipt-footer">
            <div class="thank-you">Thank you for your purchase!</div>
            <div class="footer-message">We appreciate your business</div>
            <div class="barcode">
              <div class="barcode-value">${receiptNumber}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default generateReceiptHTML;
