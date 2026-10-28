const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Valid tables whitelist to prevent arbitrary table querying
const ALLOWED_TABLES = ['tamil', 'hindi', 'malayalam', 'mallu', 'telugu', 'kannada'];

function sanitizeTable(tableName) {
  const table = (tableName || 'tamil').toLowerCase().trim();
  if (!ALLOWED_TABLES.includes(table)) {
    return 'tamil';
  }
  return table;
}

/**
 * GET /api/channels?table=tamil
 * Fetches all channels for a given language table
 */
router.get('/', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('channel_name', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching channels' });
  }
});

/**
 * POST /api/channels?table=tamil
 * Creates a new channel
 */
router.post('/', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);
  const body = req.body || {};

  // Ensure UUID is present
  if (!body.uuid) {
    body.uuid = uuidv4();
  }

  // Validate required fields
  if (!body.channel_name || !body.streaming_link) {
    return res.status(400).json({ error: 'channel_name and streaming_link are required' });
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .insert([body])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while adding channel' });
  }
});

/**
 * PUT /api/channels/:uuid?table=tamil
 * Updates an existing channel
 */
router.put('/:uuid', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);
  const uuid = req.params.uuid;
  const updateData = { ...req.body };
  delete updateData.uuid; // Do not overwrite UUID

  try {
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('uuid', uuid)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    return res.json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Server error while updating channel' });
  }
});

/**
 * DELETE /api/channels/:uuid?table=tamil
 * Deletes a channel
 */
router.delete('/:uuid', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);
  const uuid = req.params.uuid;

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('uuid', uuid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Server error while deleting channel' });
  }
});

module.exports = router;
