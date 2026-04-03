const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();
const authLog = require('debug')('authRoutes:console');

const SALT_ROUNDS = 12;

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Requête invalide' });
  }

  try {
    const user = await User.findOne({ username });

    // Message générique pour éviter l’énumération
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: 'your-app',
        audience: 'your-app-users',
      }
    );

    // Log SAFE
    authLog(`User ${user._id} logged in`);

    res.json({
      token,
      role: user.role,
      username: user.username
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validation basique
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Données invalides' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Mot de passe trop court' });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Impossible de créer le compte' });
    }

    // 🔐 Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    authLog(`User created: ${user._id}`);

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};