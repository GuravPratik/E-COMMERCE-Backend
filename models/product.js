const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide the product name"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide the product price"],
    maxLength: [5, "Price of the product should not be more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide the product description"],
  },
  photos: [
    {
      public_id: {
        type: String,
        required: [true, "Please upload at least 1 image for the product"],
      },
      secure_url: {
        type: String,
        required: [true, "Please upload at least 1 image for the product"],
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select category from- short-sleeves, long-sleeves, sweat-shirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "Please select category ONLY from- short-sleeves, long-sleeves, sweat-shirts, hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please add a Product brand name"],
  },
  stock: {
    type: Number,
    required: [true, "Please add the number of stock"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
