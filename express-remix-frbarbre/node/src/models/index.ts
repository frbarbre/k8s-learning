import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  avatar: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  twitter: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);
