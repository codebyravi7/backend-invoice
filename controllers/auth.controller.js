import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // HASH PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT token here
      const userId = newUser?._id;
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
      });
      await newUser.save();

      res
        .status(201)
        .json({
          message: "User registered Successfully!!",
          token,
          user: { name, email },
        });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    const name = user?.name;

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Email or password" });
    }

    const userId = user?._id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    res.status(200).json({
      message: "User logged in Successfully!!",
      token,
      user: { name, email },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
