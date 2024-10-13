import PDFDocument from "pdfkit";
import Invoice from "../models/invoice.model.js";
import User from "../models/user.model.js";

function generateHeader(doc) {
  doc
    .image("public/images/logo.png", 50, 45, { height: 50 }) // Adjusted path to your logo
    .fillColor("#444444")
    .fontSize(20)
    .text("ACME Inc.", 60, 90)
    .fontSize(10)
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("New York, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, customer) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(customer.invoiceNumber || "INV-12345", 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(customer.balanceDue || 0, 150, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text(customer.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(customer.email, 300, customerInformationTop + 15)
    .text(
      customer.address || "123 Traveller St, Travelville, TV 12345",
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, products) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  let totalCharges = 0;
  for (i = 0; i < products.length; i++) {
    const item = products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name,
      item.description || "",
      item.price,
      item.qty,
      item.qty * item.price
    );

    generateHr(doc, position + 20);
    totalCharges += item.qty * item.price;
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(doc, subtotalPosition, "", "", "Subtotal", "", totalCharges);

  const gst = totalCharges * 0.18;
  const gstPosition = subtotalPosition + 20;
  generateTableRow(doc, gstPosition, "", "", "GST (18%)", "", gst);

  const totalPosition = gstPosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(doc, totalPosition, "", "", "Total", "", totalCharges + gst);
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .moveDown(5) // Adds some space after the content
    .fontSize(10)
    .text("!! Thanks for giving us a chance to serve you !!", {
      align: "center",
      width: 500,
      baseline: "bottom",
    });
}
function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

export const generateInvoice = async (req, res) => {
  const { customer, products } = req.body;

  // Validate customer details
  if (!customer?.name || !customer?.email) {
    return res
      .status(400)
      .json({ error: "Customer name and email must be provided." });
  }

  // Validate products details
  if (!Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one product must be provided." });
  }

  // Get the current user from the request
  let user = req.user;

  try {
    // Map products to match the schema
    const mappedProducts = products.map((product) => ({
      product_name: product.name,
      product_price: parseFloat(product.price), // Ensure price is a number
      product_quantity: parseInt(product.qty, 10), // Ensure quantity is a number
    }));

    // Create a new invoice instance
    const newInvoice = new Invoice({
      customer_name: customer.name,
      customer_email: customer.email,
      products: mappedProducts, // Use mapped products
    });

    // Save the new invoice to the database
    await newInvoice.save();

    // Update the user's invoices
    user?.invoices?.unshift(newInvoice._id); // Add the new invoice ID to the user's invoices
    await user.save();
  } catch (error) {
    console.error("Error saving invoice:", {
      error,
      customer_email: customer.email,
      customer_name: customer.name,
    });
    return res.status(500).json({ error: "Failed to save invoice." });
  }

  /*handle pdf-generation */
  const doc = new PDFDocument({ margin: 50 });

  let filename = encodeURIComponent(`${Date.now()}invoice.pdf`);
  res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-type", "application/pdf");

  generateHeader(doc);
  generateCustomerInformation(doc, customer);
  generateInvoiceTable(doc, products);
  generateFooter(doc);

  doc.end();
  doc.pipe(res);
};
