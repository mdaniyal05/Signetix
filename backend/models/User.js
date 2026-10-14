const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  profileStatus: { type: String },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  pushSubscriptions: [
    {
      endpoint: { type: String, required: true },
      keys: { p256dh: { type: String }, auth: { type: String } },
    },
  ],
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
