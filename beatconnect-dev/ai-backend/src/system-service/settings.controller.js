import db from '../config/db.pool.js';

export const initSettingsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  try {
    await db.execute(sql);
    // Seed default values if empty
    const [rows] = await db.query('SELECT COUNT(*) as count FROM system_settings');
    if (rows[0].count === 0) {
      await db.execute(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?), (?, ?)',
        ['user_avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user', 'bot_avatar', '/public/assets/bot-avatar.png']
      );
    }
  } catch (err) {
    console.error('[SETTINGS] Initialization error:', err);
  }
};

export const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM system_settings');
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSetting = async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) return res.status(400).json({ error: 'Key and value required' });
  
  try {
    await db.execute(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, value, value]
    );
    res.json({ message: `Setting ${key} updated successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
};
