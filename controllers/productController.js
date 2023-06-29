const Product = require("../models/product");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");
exports.addProduct = async (req, res) => {
  try {
    const imageArray = [];
    let result;
    const { name, price, description, category, brand, stock } = req.body;
    if (!price || !name || !description || !category || !brand || !stock) {
      return res.status(400).json({
        success: false,
        message: "Please enter all the fields",
      });
    }
    if (req.files) {
      if (req.files.photo.length) {
        for (let idx = 0; idx < req.files.photo.length; idx++) {
          result = await cloudinary.v2.uploader.upload(
            req.files.photo[idx].tempFilePath,
            {
              folder: "Ecommerce_Backend/Products",
            }
          );
          imageArray.push({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        }
      } else {
        result = await cloudinary.v2.uploader.upload(
          req.files.photo.tempFilePath,
          {
            folder: "Ecommerce_Backend/Products",
          }
        );
        imageArray.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    req.body.photos = imageArray;
    const { photos } = req.body;
    const user = req.user.id;

    const product = await Product.create({
      name,
      price,
      description,
      category,
      photos,
      brand,
      stock,
      user,
    });
    return res.status(201).json({
      message: "Product is created",
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: true,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const resultPerPage = 3;
    const totalcountProduct = await Product.countDocuments();

    const productsObj = new WhereClause(Product.find(), req.query)
      .search()
      .filter();

    let products = await productsObj.base;
    const filteredProductNumber = products.length;

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    res.status(200).json({
      success: true,
      products,
      filteredProductNumber,
      totalcountProduct,
      resultPerPage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product is not found",
    });
  }

  return res.status(200).json({
    success: true,
    product,
  });
};

exports.adminGetAllProduct = async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

exports.adminUpdateSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const imageArray = [];
    if (req.files) {
      for (let idx = 0; idx < product.photos.length; idx++) {
        await cloudinary.v2.uploader.destroy(product.photos[idx].public_id);
      }
      let result;
      if (req.files.photo.length) {
        for (let idx = 0; idx < req.files.photo.length; idx++) {
          result = await cloudinary.v2.uploader.upload(
            req.files.photo[idx].tempFilePath,
            {
              folder: "Ecommerce_Backend/Products",
            }
          );
          imageArray.push({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        }
      } else {
        result = await cloudinary.v2.uploader.upload(
          req.files.photo.tempFilePath,
          {
            folder: "Ecommerce_Backend/Products",
          }
        );
        imageArray.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
      req.body.photos = imageArray;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Product is updated Successfully",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: true,
    });
  }
};

exports.adminDeleteSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    for (let idx = 0; idx < product.photos.length; idx++) {
      await cloudinary.v2.uploader.destroy(product.photos[idx].public_id);
    }
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product is Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
