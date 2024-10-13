import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		invoices: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Invoice'
		}],
	
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
