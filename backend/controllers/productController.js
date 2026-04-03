const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET produits sécurisé
exports.getProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = parseInt(req.query.page) || 1;

    const products = await Product.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// UPDATE stock sécurisé
exports.updateProductStock = async (req, res) => {
  const { stock } = req.body;
  const { productId } = req.params;

  // 🔐 Validation ID Mongo
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  // 🔐 Validation stricte du stock
  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ message: 'Stock invalide' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        stock,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    res.json({
      message: 'Stock mis à jour',
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};