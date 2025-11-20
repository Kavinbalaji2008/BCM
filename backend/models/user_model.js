
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },  // URL to profile picture
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String }
    },
    company: { type: String },
    jobTitle: { type: String },
    bio: { type: String },
    socialLinks: {
        linkedin: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        instagram: { type: String }
    },
    preferences: {
        language: { type: String, default: 'English' },
        notifications: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    },
    otp: { type: String },          // OTP for password reset
    otpExpiry: { type: Date },
    otpUsed: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password verification method
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
