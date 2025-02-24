const mongoose = require("mongoose");
const { Schema } = mongoose;

const inquirySchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "responded"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: "created", updatedAt: "modified" } }
);

const Inquiry = mongoose.model("Inquiry", inquirySchema);
module.exports = Inquiry;
