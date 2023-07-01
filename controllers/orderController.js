const Order = require("../models/order");
const Product = require("../models/product");

exports.createOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      taxAmount,
      shippingAmount,
      totalAmount,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Order is successfully placed",
      order,
    });
  } catch (error) {
    console.log("Error");
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getLoggedUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.orderStatus === "delivered") {
      return res.status(401).json({
        success: false,
        message: "Order is already mark as delivered",
      });
    }

    order.orderStatus = req.body.orderStatus;
    order.orderItems.forEach(async (ord) => {
      await updateProductStock(ord.product, ord.quantity);
    });

    await order.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
      message: "Order status is updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.adminDeleteSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: true,
        message: "Order is not found",
      });
    }
    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Order is successfully deleted",
      success: true,
    });
  } catch (error) {}
};

const updateProductStock = async (productID, quantity) => {
  const product = await Product.findById(productID);
  if (!product) {
    return;
  }
  if (product.stock > quantity) {
    product.stock = product.stock - quantity;
  }
  await product.save({ validateBeforeSave: false });
};
