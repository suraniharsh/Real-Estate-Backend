const mongoose = require("mongoose");
const { Schema } = mongoose;

const visitSchema = new Schema(
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
    dateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: { createdAt: "created", updatedAt: "modified" } }
);

const Visit = mongoose.model("Visit", visitSchema);
module.exports = Visit;
