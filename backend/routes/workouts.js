import express from 'express';
import db from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  res.json(rows[0] || null);
});

router.post('/', requireAuth, async (req, res) => {
  const { plan } = req.body;
  await db.query('INSERT INTO workouts (user_id, plan) VALUES (?, ?)', [
    req.userId, JSON.stringify(plan || [])
  ]);
  res.json({ message: 'Treino salvo' });
});

export default router;
