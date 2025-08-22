import express from 'express';
import db from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM meals WHERE user_id = ? ORDER BY timestamp DESC', [req.userId]);
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { items, total_calories, timestamp } = req.body;
  await db.query('INSERT INTO meals (user_id, items, total_calories, timestamp) VALUES (?, ?, ?, ?)', [
    req.userId,
    JSON.stringify(items || []),
    total_calories || 0,
    timestamp || new Date()
  ]);
  res.json({ message: 'Refeição salva' });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ message: 'Refeição removida' });
});

export default router;
