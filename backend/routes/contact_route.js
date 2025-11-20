import express from "express";
import Contact from "../models/contact_model.js";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { format } from "@fast-csv/format";
import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔹 Add a new contact
router.post("/", authMiddleware, async (req, res) => {
  try {
    const contact = new Contact({
      userId: req.user.id, // ✅ Fix: attach logged-in user ID
      ...req.body,
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Get all contacts (only logged-in user's)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Get single contact by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 Update contact
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE contact
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.user.id;
    
    // Find and delete the contact (only if it belongs to the user)
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      userId: userId
    });
    
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// keep other routes same (PUT, DELETE, import/export)
export default router;
