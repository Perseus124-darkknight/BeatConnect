// ai-backend/src/shared/analytics-service.js
import db from '../config/db.pool.js';

export const logEvent = async (type, value = null) => {
    try {
        await db.execute('INSERT INTO analytics_events (event_type, value) VALUES (?, ?)', [type, value]);
    } catch (err) {
        console.error('[Analytics] Error logging event:', err);
    }
};

export const getAggregatedMetrics = async () => {
    try {
        const [today] = await db.execute('SELECT COUNT(*) as count FROM analytics_events WHERE event_type = "conversation_started" AND DATE(created_at) = CURDATE()');
        const [total] = await db.execute('SELECT COUNT(*) as count FROM analytics_events WHERE event_type = "conversation_started"');
        const [ctr] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM analytics_events WHERE event_type = "vinyl_player_clicked") / 
                NULLIF((SELECT COUNT(*) FROM analytics_events WHERE event_type = "conversation_started"), 0) * 100 as rate
        `);
        const [avgResponse] = await db.execute('SELECT AVG(CAST(value AS UNSIGNED)) as avg_time FROM analytics_events WHERE event_type = "ai_response_time"');

        return {
            today_conversations: today[0].count || 0,
            total_conversations: total[0].count || 0,
            vinyl_player_ctr: parseFloat(ctr[0].rate || 0).toFixed(2),
            avg_response_time: Math.round(avgResponse[0].avg_time || 0)
        };
    } catch (err) {
        console.error('[Analytics] Error fetching metrics:', err);
        return {
            today_conversations: 0,
            total_conversations: 0,
            vinyl_player_ctr: 0,
            avg_response_time: 0
        };
    }
};

export const getRecentEvents = async (limit = 10) => {
    try {
        const [rows] = await db.query('SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT ?', [Number(limit)]);
        return rows;
    } catch (err) {
        console.error('[Analytics] Error fetching recent events:', err);
        return [];
    }
};
