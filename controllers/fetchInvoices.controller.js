import User from "../models/user.model.js";

export const getUserInvoices = async (req, res) => {
  try {
    // Assuming you have the user ID in req.user or similar
    const userId = req?.user?._id;

    // Fetch the user and populate their invoices
    const user = await User.findById(userId).populate("invoices");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return the user's invoices
    return res.status(200).json({ invoices: user?.invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching invoices." });
  }
};
