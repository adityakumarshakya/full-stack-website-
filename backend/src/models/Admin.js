const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

AdminSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    lastLoginAt: this.lastLoginAt,
  };
};

module.exports = mongoose.model("Admin", AdminSchema);
