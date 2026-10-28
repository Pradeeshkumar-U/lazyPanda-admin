const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/version
 * Fetches application versions for all radio apps
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('version')
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || {});
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching version' });
  }
});

/**
 * PUT /api/version
 * Updates application and data versions
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    delete updatePayload.id; // Preserve primary key

    const { data, error } = await supabase
      .from('version')
      .update(updatePayload)
      .eq('id', 1)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data[0] || updatePayload);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating version' });
  }
});

module.exports = router;
