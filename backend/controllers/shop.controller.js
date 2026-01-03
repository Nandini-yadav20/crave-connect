import Shop from "../models/shop.model.js";
import uploadCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;

    let image;

    // Upload image if exists
    if (req.file) {
      const uploaded = await uploadCloudinary(req.file.path);
      image = uploaded;
    }

    // Find shop by owner
    let shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      // Create new shop
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      // Update existing shop
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          ...(image && { image }),
        },
        { new: true }
      );
    }

    await shop.populate("owner");

    return res.status(201).json({
      success: true,
      shop,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Create shop error: ${error.message}`,
    });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId }).populate("owner items");
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};