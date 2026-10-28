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
 * GET /api/reports?table=tamil
 * Fetches reported channels for the given station table.
 * Groups by channel UUID and joins channel details.
 */
router.get('/', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);

  try {
    // 1. Fetch reports for the selected station ordered by newest
    const { data: reports, error: reportErr } = await supabase
      .from('reports')
      .select('*')
      .ilike('table_name', table)
      .order('created_at', { ascending: false });

    if (reportErr) {
      console.error('[Reports Fetch Error]', reportErr);
      return res.status(400).json({ error: reportErr.message });
    }

    if (!reports || reports.length === 0) {
      return res.json([]);
    }

    // 2. Group reports by UUID and count frequencies
    const reportGroups = new Map();
    reports.forEach((rep) => {
      const id = rep.uuid;
      if (!id) return;
      if (!reportGroups.has(id)) {
        reportGroups.set(id, {
          uuid: id,
          fm_name: rep.fm_name || 'Unknown Channel',
          table_name: rep.table_name || table,
          created_at: rep.created_at,
          report_count: 1,
        });
      } else {
        const item = reportGroups.get(id);
        item.report_count += 1;
        if (new Date(rep.created_at) > new Date(item.created_at)) {
          item.created_at = rep.created_at;
        }
      }
    });

    const uniqueUuids = Array.from(reportGroups.keys());

    // 3. Fetch corresponding channels from the station table
    let channelMap = new Map();
    if (uniqueUuids.length > 0) {
      const { data: channels, error: chErr } = await supabase
        .from(table)
        .select('*')
        .in('uuid', uniqueUuids);

      if (!chErr && channels) {
        channels.forEach((ch) => channelMap.set(ch.uuid, ch));
      }
    }

    // 4. Merge report stats with live channel data
    const mergedResults = uniqueUuids.map((uuid) => {
      const rep = reportGroups.get(uuid);
      const ch = channelMap.get(uuid) || {};

      return {
        uuid: uuid,
        table_name: rep.table_name || table,
        report_count: rep.report_count,
        reported_at: rep.created_at,
        channel_name: ch.channel_name || rep.fm_name || 'Unknown Channel',
        streaming_link: ch.streaming_link || '',
        category: ch.category || 'Reported',
        image_xs: ch.image_xs || '',
        image_m: ch.image_m || '',
        channel_exists: Boolean(ch.channel_name),
      };
    });

    // Sort by report_count descending, then newest reported_at
    mergedResults.sort((a, b) => {
      if (b.report_count !== a.report_count) {
        return b.report_count - a.report_count;
      }
      return new Date(b.reported_at) - new Date(a.reported_at);
    });

    return res.json(mergedResults);
  } catch (err) {
    console.error('[Reports Error]', err);
    return res.status(500).json({ error: 'Server error while fetching reports' });
  }
});

/**
 * DELETE /api/reports/:uuid?table=tamil
 * Clears all reports for a channel UUID from the reports table
 */
router.delete('/:uuid', requireAuth, async (req, res) => {
  const table = sanitizeTable(req.query.table);
  const uuid = req.params.uuid;

  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('uuid', uuid)
      .ilike('table_name', table);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Server error while resolving report' });
  }
});

module.exports = router;
