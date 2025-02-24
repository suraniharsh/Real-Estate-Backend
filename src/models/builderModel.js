const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const builderSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    profileImg: { type: String, default: null }, // MinIO URL
    companyName: { type: String },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
    },
    specialization: { type: String, required: true }, // e.g., "Residential"
    yearsOfExperience: { type: Number },
    subscriptionPlan: {
      type: String,
      required: true,
      enum: ["Basic", "Premium"],
    },
    isVerified: { type: Boolean, default: false }, // OTP verification status
  },
  { timestamps: { createdAt: "created", updatedAt: "modified" } }
);

// Hash password before saving
builderSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Builder = mongoose.model("Builder", builderSchema);
module.exports = Builder;
