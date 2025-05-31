import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { inngest } from "../inngest/client.js";

export const signup = async (req, res) => {
  try {
    const { email, password, name, skills } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      skills: skills || [],
    });
    // Fire the Inngest function
    await inngest.send({
      name: "user/signup",
      data: {
        email: user.email,
        name: user.name,
      },
    });

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET
    );
    const userData = user.toObject();
    delete userData.password;
    res.json({ token, userData });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Signup failed", details: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET
    );
    const userData = user.toObject();
    delete userData.password;
    res.json({ token, userData });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Login failed", details: error.message });
  }
};

export const logout = async () => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized to access" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized to access" });
      }
      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error during logout:", error.message);
    res.status(500).json({ message: "Logout failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { skills, name, role, email } = req.body;
    // Update user details
    if (req.user.role != "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Find user by email
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update user details
    const updatedUser = await User.updateOne(email, {
      skills: skills.length ? skills : findUser.skills,
      name: name || findUser.name,
      role: role || findUser.role,
    });
    const userData = updatedUser.toObject();
    delete userData.password;
    res.json({ userData, message: "User updated successfully" });
  } catch (error) {
    console.error("Error during user update:", error.message);
    res
      .status(500)
      .json({ message: "User update failed", details: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await User.find().select("-password");
    return res.json(user);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", details: error.message });
  }
};
