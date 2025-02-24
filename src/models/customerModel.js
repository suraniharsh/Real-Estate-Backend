const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Property", default: [] }],
    shortlists: [{ type: Schema.Types.ObjectId, ref: "Property", default: [] }],
    isVerified: { type: Boolean, default: false },
    profileImg: { type: String, default: null },
  },
  { timestamps: { createdAt: "created", updatedAt: "modified" } }
);

// Hash password before saving
customerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
