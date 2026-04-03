const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const notify = async (payload) => {
  try {
    await axios.post(process.env.NOTIFY_SERVICE_URL, payload, {
      timeout: 3000,
    });
  } catch (err) {
    console.error('Notify error:', err.message);
  }
};

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Panier invalide' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔐 Récupérer les vrais produits depuis la DB
    const productIds = items.map(i => i.productId);

    const products = await Product.find({
      _id: { $in: productIds }
    }).session(session);

    if (products.length !== items.length) {
      throw new Error('Produit invalide');
    }

    let total = 0;

    const orderDetails = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);

      if (!product) {
        throw new Error('Produit introuvable');
      }

      if (item.quantity <= 0) {
        throw new Error('Quantité invalide');
      }

      if (product.stock < item.quantity) {
        throw new Error('Stock insuffisant');
      }

      // ✅ prix serveur ONLY
      total += product.price * item.quantity;

      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      };
    });

    // 🔄 Mise à jour du stock
    for (const item of orderDetails) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    const order = new Order({
      userId: req.user.userId,
      items: orderDetails,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      status: 'En attente'
    });

    const savedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    await notify({
      message: `Nouvelle commande ${savedOrder._id}`
    });

    res.status(201).json({
      message: 'Commande créée',
      order: savedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error.message);

    res.status(400).json({
      message: 'Impossible de créer la commande'
    });
  }
};