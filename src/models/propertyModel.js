const mongoose = require("mongoose");
const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["agent", "builder"],
    },
    propertyDetails: {
      title: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ["Residential", "Commercial", "Land"],
      },
      status: { type: String, required: true, enum: ["buy", "rent", "PG"] },
      price: { type: Number, required: true }, // Kept as the primary price field
      location: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
      },
      description: { type: String, required: true },
      propertyStatus: {
        type: String,
        enum: ["Ready to Move", "Under Construction"],
        required: true,
      },
      pricePerSqFt: { type: Number },
      priceNegotiable: { type: Boolean, default: false },
    },
    media: [{ type: String }],
    additionalDetails: {
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      area: { type: Number },
      amenities: [{ type: String }],
      nearbyFacilities: [{ type: String }],
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    visibility: { type: String, required: true, enum: ["public", "private"] },
    views: { type: Number, default: 0 },
    comments: [{ type: String }],
  },
  { timestamps: { createdAt: "created", updatedAt: "modified" } }
);

// Indexes for performance
propertySchema.index({ userId: 1 });
propertySchema.index({ "propertyDetails.location.city": 1 });

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
