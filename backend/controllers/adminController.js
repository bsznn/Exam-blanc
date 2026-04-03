const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');

const ALLOWED_STATUS = ['En attente', 'Validée', 'Expédiée', 'Annulée'];

// Helper notification sécurisé
const notify = async (message) => {
  try {
    await axios.post(
      process.env.NOTIFY_SERVICE_URL,
      { message },
      { timeout: 3000 } // évite blocage
    );
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

// Middleware attendu: req.user.role === 'admin'

// Récupérer toutes les commandes
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().lean();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Changer l'état d'une commande
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Statut invalide' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    await notify(`Commande ${id} mise à jour (${status})`);

    res.json({ message: 'Statut mis à jour', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Valider une commande
exports.validateOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'Validée' },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    await notify(`Commande ${id} validée`);

    res.json({ message: 'Commande validée', order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les produits
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le stock
exports.updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (typeof stock !== 'number' || stock < 0) {
    return res.status(400).json({ message: 'Stock invalide' });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    await notify(`Stock produit ${id} → ${stock}`);

    res.json({ message: 'Stock mis à jour', product });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};