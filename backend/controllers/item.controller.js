import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addOrEditItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    const { itemId } = req.params;

    // Find shop of logged-in owner
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // ===================== ADD ITEM =====================
    if (!itemId) {
      const item = await Item.create({
        name,
        category,
        foodType,
        price,
        image,
        shop: shop._id,
      });

      return res.status(201).json({
        message: "Item added successfully",
        item,
      });
    }

    // ===================== EDIT ITEM =====================
    const item = await Item.findOne({ _id: itemId, shop: shop._id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.name = name || item.name;
    item.category = category || item.category;
    item.foodType = foodType || item.foodType;
    item.price = price || item.price;
    if (image) item.image = image;

    await item.save();

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Add/Edit item failed",
    });
  }
};
