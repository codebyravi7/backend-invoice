import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true,
    },
    customer_email: {
      type: String,
      required: true,
    },
    products: [
      {
        product_name: String,
        product_price: Number,
        product_quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", InvoiceSchema);

export default Invoice;
