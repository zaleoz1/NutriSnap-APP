import express from 'express';
import db from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM goals WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.userId]);
  res.json(rows[0] || null);
});

router.post('/', requireAuth, async (req, res) => {
  const { current_weight, goal_weight, days, daily_calories } = req.body;
  await db.query('INSERT INTO goals (user_id, current_weight, goal_weight, days, daily_calories) VALUES (?, ?, ?, ?, ?)', [
    req.userId, current_weight, goal_weight, days, daily_calories
  ]);
  res.json({ message: 'Meta salva' });
});

export default router;
