import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    type: { type: String, enum: ["call", "email", "meeting"], required: true },
    title: { type: String, required: true },
    location: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String },
    reminder: { type: Date },  // optional follow-up
}, { timestamps: true });

export default mongoose.model("Interaction", interactionSchema);
