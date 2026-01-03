import mongoose from "mongoose";

// 1️⃣ DEFINE SCHEMA FIRST
const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide item name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot be more than 300 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide category"],
      enum: [
        "appetizer",
        "main-course",
        "dessert",
        "beverage",
        "snacks",
        "breakfast",
        "lunch",
        "dinner",
      ],
    },
    price: {
      type: Number,
      required: [true, "Please provide price"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      default: "default-food.png",
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 15, // minutes
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
    tags: [String],
    customizations: [
      {
        name: String,
        options: [
          {
            name: String,
            price: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 2️⃣ INDEXES
menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ name: "text", description: "text" });

// 3️⃣ CREATE & EXPORT MODEL
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
