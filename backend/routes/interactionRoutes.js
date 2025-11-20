
import express from "express";
import Interaction from "../models/interactionModel.js";

const router = express.Router();

// 🔹 Add interaction
router.post("/", async (req, res) => {
    try {
        const interaction = new Interaction({ ...req.body });
        await interaction.save();
        res.status(201).json(interaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔹 Get all interactions for a contact
router.get("/:contactId", async (req, res) => {
    try {
        const interactions = await Interaction.find({ contactId: req.params.contactId }).sort({ date: -1 });
        res.json(interactions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔹 Get all interactions (for dashboard)
router.get("/", async (req, res) => {
    try {
        const interactions = await Interaction.find({}).sort({ scheduledDate: 1 });
        res.json(interactions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔹 Update an interaction
router.put("/:id", async (req, res) => {
    try {
        const interaction = await Interaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!interaction) return res.status(404).json({ message: "Interaction not found" });
        res.json(interaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 🔹 Delete an interaction
router.delete("/:id", async (req, res) => {
    try {
        const interaction = await Interaction.findByIdAndDelete(req.params.id);
        if (!interaction) return res.status(404).json({ message: "Interaction not found" });
        res.json({ message: "Interaction deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
export default router;
