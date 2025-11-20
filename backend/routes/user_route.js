import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user_model.js";
import authMiddleware from "../middleware/auth_middleware.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ✅ Cloudinary storage setup with cropping
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" }
    ]
  },
});

const upload = multer({ storage });

// ---------------- Signup ----------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Login ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password: "***" });
    
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user)
      return res.status(400).json({ message: "Invalid email" });

    console.log("Comparing passwords...");
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);
    
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Forgot Password ----------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpUsed = false;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for password reset",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ---------------- Verify OTP ----------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpUsed || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified, proceed to reset password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// ---------------- Reset Password ----------------
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpUsed || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otpUsed = true;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// ---------------- Get User Profile ----------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpiry -otpUsed"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Update Profile Details ----------------
router.put("/profile", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Handle profile picture upload if file is provided
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    delete updateData.password;
    delete updateData.email;
    delete updateData.otp;
    delete updateData.otpExpiry;
    delete updateData.otpUsed;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpiry -otpUsed");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Upload Profile Picture ----------------
router.post(
  "/upload-profile",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const imageUrl = req.file.path;

      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: imageUrl },
        { new: true }
      ).select("-password -otp -otpExpiry -otpUsed");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile picture updated successfully", user });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  }
);

// ---------------- Upload Profile Picture ----------------
router.post("/upload-profile-picture", authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const imageUrl = req.file.path; // CloudinaryStorage already uploaded and cropped the file
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    ).select("-password -otp -otpExpiry -otpUsed");
    
    res.json({ 
      message: "Profile picture uploaded successfully", 
      user: updatedUser,
      profilePicture: imageUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Upload with Custom Crop ----------------
router.post("/upload-profile-picture-crop", authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const { x, y, width, height } = req.body; // Crop coordinates from frontend
    
    // Get the public_id from the uploaded file
    const publicId = req.file.filename;
    
    // Apply custom crop transformation
    const croppedUrl = cloudinary.url(publicId, {
      width: width || 400,
      height: height || 400,
      x: x || 0,
      y: y || 0,
      crop: "crop",
      quality: "auto",
      fetch_format: "auto"
    });
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: croppedUrl },
      { new: true }
    ).select("-password -otp -otpExpiry -otpUsed");
    
    res.json({ 
      message: "Profile picture cropped and uploaded successfully", 
      user: updatedUser,
      profilePicture: croppedUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
