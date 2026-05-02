import { jsPDF } from 'jspdf';

export const generateSupplierInvoice = (orderData) => {

    const doc = new jsPDF('p', 'mm', 'a4');


    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Primary Color
    doc.text('TAX INVOICE', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Qubix Smart Billing System', 14, 28);
    doc.text('Admin Purchase Order', 14, 34);


    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const dateStr = new Date().toLocaleString();
    doc.text(`Date: ${dateStr}`, 140, 20);
    if (orderData.razorpayPaymentId) {
        doc.text(`Payment ID: ${orderData.razorpayPaymentId}`, 140, 28);
    }
    doc.text(`Status: PAID`, 140, 36);


    doc.setFont('helvetica', 'bold');
    doc.text('From (Supplier):', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${orderData.supplierName || 'N/A'}`, 14, 58);


    doc.setFont('helvetica', 'bold');
    doc.text('To (Admin):', 140, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Qubix Administration`, 140, 58);


    let yPos = 80;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos - 5, 182, 10, 'F');
    doc.text('Product Name', 16, yPos + 1);
    doc.text('Unit Price', 100, yPos + 1);
    doc.text('Qty', 140, yPos + 1);
    doc.text('Subtotal', 160, yPos + 1);

    yPos += 12;


    doc.setFont('helvetica', 'normal');
    doc.text(orderData.productName, 16, yPos);
    doc.text(`RS. ${orderData.pricePerUnit.toFixed(2)}`, 100, yPos);
    doc.text(orderData.quantity.toString(), 140, yPos);
    doc.text(`RS. ${orderData.subTotal.toFixed(2)}`, 160, yPos);

    yPos += 15;
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;


    const halfTax = orderData.gstAmount / 2;

    doc.text('Subtotal:', 130, yPos);
    doc.text(`RS. ${orderData.subTotal.toFixed(2)}`, 196, yPos, { align: 'right' });
    yPos += 8;

    doc.text('CGST (9%):', 130, yPos);
    doc.text(`RS. ${halfTax.toFixed(2)}`, 196, yPos, { align: 'right' });
    yPos += 8;

    doc.text('SGST (9%):', 130, yPos);
    doc.text(`RS. ${halfTax.toFixed(2)}`, 196, yPos, { align: 'right' });
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Grand Total:', 130, yPos);
    doc.text(`RS. ${orderData.totalAmount.toFixed(2)}`, 196, yPos, { align: 'right' });


    yPos += 40;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated tax invoice.', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });


    const timestamp = new Date().getTime();
    doc.save(`supplier_invoice_${timestamp}.pdf`);
};
