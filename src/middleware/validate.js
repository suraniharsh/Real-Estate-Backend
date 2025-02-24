const Joi = require("joi");
const { formatErrorResponse } = require("../utils/response");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error && !req.file && !req.files?.length) {
    const details = error.details.map((detail) => detail.message).join(", ");
    return res
      .status(400)
      .json(formatErrorResponse("Validation error", details));
  }
  next();
};

const registerCustomerSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must include country code and be 10-15 digits (e.g., +12345678901)",
    }),
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).required(),
});

const verifyOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must include country code and be 10-15 digits (e.g., +12345678901)",
    }),
  otp: Joi.string().length(6).required(),
  requestId: Joi.string().uuid().required(),
});

const updateProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(50).optional(),
  password: Joi.string().min(6).optional(),
});

const registerAgentSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must include country code and be 10-15 digits (e.g., +12345678901)",
    }),
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).required(),
  companyName: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    pinCode: Joi.string().required(),
  }).required(),
  specialization: Joi.string().required(),
  yearsOfExperience: Joi.number().optional(),
  subscriptionPlan: Joi.string().valid("Basic", "Premium").required(),
});

const updateAgentProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(50).optional(),
  password: Joi.string().min(6).optional(),
  companyName: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
  }).optional(),
  specialization: Joi.string().optional(),
  yearsOfExperience: Joi.number().optional(),
  subscriptionPlan: Joi.string().valid("Basic", "Premium").optional(),
});

const registerBuilderSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+\d{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must include country code and be 10-15 digits (e.g., +12345678901)",
    }),
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(6).required(),
  companyName: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    pinCode: Joi.string().required(),
  }).required(),
  specialization: Joi.string().required(),
  yearsOfExperience: Joi.number().optional(),
  subscriptionPlan: Joi.string().valid("Basic", "Premium").required(),
});

const updateBuilderProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(50).optional(),
  password: Joi.string().min(6).optional(),
  companyName: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
  }).optional(),
  specialization: Joi.string().optional(),
  yearsOfExperience: Joi.number().optional(),
  subscriptionPlan: Joi.string().valid("Basic", "Premium").optional(),
});

const propertySchema = Joi.object({
  propertyDetails: Joi.object({
    title: Joi.string().required(),
    type: Joi.string().valid("Residential", "Commercial", "Land").required(),
    status: Joi.string().valid("buy", "rent", "PG").required(),
    price: Joi.number().positive().required(),
    location: Joi.object({
      city: Joi.string().required(),
      state: Joi.string().required(),
      pinCode: Joi.string().required(),
    }).required(),
    description: Joi.string().required(),
    propertyStatus: Joi.string()
      .valid("Ready to Move", "Under Construction")
      .required(),
    pricePerSqFt: Joi.number().positive().optional(),
    priceNegotiable: Joi.boolean().optional(),
  }).required(),
  additionalDetails: Joi.object({
    bedrooms: Joi.number().optional(),
    bathrooms: Joi.number().optional(),
    area: Joi.number().optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    nearbyFacilities: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  contactInfo: Joi.object({
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
  }).required(),
  visibility: Joi.string().valid("public", "private").required(),
});

module.exports = {
  validate,
  registerCustomerSchema,
  verifyOtpSchema,
  updateProfileSchema,
  registerAgentSchema,
  updateAgentProfileSchema,
  registerBuilderSchema,
  updateBuilderProfileSchema,
  propertySchema
};
