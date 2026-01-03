import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  category: {
    type: String,
    enum: [
      "Snacks",
      "Main course",
      "Desserts",
      "Pizza",
      "Burgers",
      "Sandwiches",
      "South Indian",
      "North Indian",
      "Chinese",
      "Fast Food",
      "Italian",
      "others"
    ],
    required: true
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  foodType: {
    type: String,
    enum: [
      "Veg",
      "Non-Veg"
    ]
  },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

export default Item;