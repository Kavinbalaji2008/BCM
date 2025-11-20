import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    company: { type: String },
    jobTitle: { type: String },
    emails: [{ type: String }],
    phones: [{ type: String }],
    address: { type: String },
    notes: [{ text: String, date: { type: Date, default: Date.now } }],
    socialLinks: [{ platform: String, url: String }],
    birthday: { type: Date },
    anniversary: { type: Date },
    category: { type: String },  // e.g., client, vendor, partner
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
