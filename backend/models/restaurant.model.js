import mongoose from "mongoose";

// 1️⃣ DEFINE SCHEMA FIRST
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide restaurant name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    image: {
      type: String,
      default: "default-restaurant.png",
    },
    cuisine: [
      {
        type: String,
        required: true,
      },
    ],
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    openingHours: {
      monday: { open: String, close: String, isClosed: Boolean },
      tuesday: { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday: { open: String, close: String, isClosed: Boolean },
      friday: { open: String, close: String, isClosed: Boolean },
      saturday: { open: String, close: String, isClosed: Boolean },
      sunday: { open: String, close: String, isClosed: Boolean },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: "30-40 mins",
    },
    preparationTime: {
      type: Number,
      default: 20, // minutes
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2️⃣ VIRTUAL POPULATION
restaurantSchema.virtual("menuItems", {
  ref: "MenuItem",
  localField: "_id",
  foreignField: "restaurant",
});

// 3️⃣ CREATE MODEL
const Restaurant = mongoose.model("Restaurant", restaurantSchema);

// 4️⃣ EXPORT MODEL (NOT SCHEMA)
export default Restaurant;
