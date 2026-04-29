import { jsPDF } from 'jspdf';

export const generatePDFReceipt = (cart, totalPrice, customerName, subTotal, taxAmount) => {
    // A5 size for receipt usually looks better
    const doc = new jsPDF('p', 'mm', 'a5');

    // Branding / Header
    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241); // Primary Color
    doc.text('Qubix Smart Billing System', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Smart Management Receipt', 14, 26);

    // Customer & Date Info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 14, 40);

    const dateStr = new Date().toLocaleString();
    doc.text(`Date: ${dateStr}`, 14, 46);

    // Table Header
    let yPos = 55;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Item', 14, yPos);
    doc.text('Price', 70, yPos);
    doc.text('Qty', 100, yPos);
    doc.text('Total', 120, yPos);

    yPos += 3;
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 134, yPos); // Header underline

    yPos += 7;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);

        doc.text(item.name.substring(0, 25), 14, yPos);
        doc.text(`RS. ${item.price.toFixed(2)}`, 70, yPos);
        doc.text(item.quantity.toString(), 100, yPos);
        doc.text(`RS. ${itemTotal}`, 120, yPos);

        yPos += 7;
    });

    yPos += 3;
    doc.line(14, yPos, 134, yPos); // Footer line
    yPos += 7;

    // Summary Area
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // If not provided, fallback to standard logic
    const calcSubTotal = subTotal || totalPrice;
    const calcTaxAmount = taxAmount || 0;
    const halfTax = calcTaxAmount / 2;

    doc.text('Subtotal:', 90, yPos);
    doc.text(`RS. ${calcSubTotal.toFixed(2)}`, 134, yPos, { align: 'right' });
    yPos += 6;

    if (calcTaxAmount > 0) {
        doc.text('CGST (9%):', 90, yPos);
        doc.text(`RS. ${halfTax.toFixed(2)}`, 134, yPos, { align: 'right' });
        yPos += 6;

        doc.text('SGST (9%):', 90, yPos);
        doc.text(`RS. ${halfTax.toFixed(2)}`, 134, yPos, { align: 'right' });
        yPos += 6;
    }

    yPos += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 90, yPos);
    doc.text(`RS. ${totalPrice.toFixed(2)}`, 134, yPos, { align: 'right' });

    // Footer
    yPos += 20;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with Qubix!', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });

    // Cleaned customer name for filename
    const safeName = (customerName || 'walk_in').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().getTime();

    // Trigger download
    doc.save(`qubix_receipt_${safeName}_${timestamp}.pdf`);
};
