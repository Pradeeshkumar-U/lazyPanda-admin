const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');

const ALLOWED_TABLES = ['tamil', 'hindi', 'malayalam', 'mallu', 'telugu', 'kannada'];

function sanitizeTable(tableName) {
  const table = (tableName || 'tamil').toLowerCase().trim();
  if (!ALLOWED_TABLES.includes(table)) {
    return 'tamil';
  }
  return table;
}

/**
 * GET /api/categories?table=tamil
 * Fetches distinct categories for the selected station
 */
router.get('/', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);

  try {
    const { data, error } = await supabase
      .from(table)
      .select('category');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const uniqueCategories = [
      ...new Set(
        (data || [])
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ].sort();

    return res.json(uniqueCategories);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching categories' });
  }
});

module.exports = router;
