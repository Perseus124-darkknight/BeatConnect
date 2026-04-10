// ai-backend/src/user-service/admin.controller.js
import { getAggregatedMetrics, getRecentEvents, logEvent } from '../shared/analytics-service.js';
import { getRecentPosts, deletePost } from './post-service.js';
import * as adminRepo from './admin.repository.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await getAggregatedMetrics();
        const recentActivity = await getRecentEvents(15);
        const recentPosts = await getRecentPosts(10);
        const detailed = await adminRepo.getDetailedArtistAnalytics();
        
        res.json({
            metrics,
            recentActivity,
            recentPosts,
            detailed
        });
    } catch (err) {
        console.error('[ADMIN] Error fetching dashboard data:', err);
        res.status(500).json({ 
            error: 'Failed to fetch admin metrics',
            metrics: { today_conversations: 0, total_conversations: 0, vinyl_player_ctr: 0, avg_response_time: 0 },
            recentActivity: [],
            recentPosts: [],
            detailed: { topSongs: [], topArtists: [] }
        });
    }
};

export const updateArtistConfig = async (req, res) => {
    try {
        const { artistId, personaPrompt, themeConfig } = req.body;
        if (!artistId) return res.status(400).json({ error: 'Artist ID is required' });
        
        await adminRepo.updateArtistConfig(artistId, personaPrompt, themeConfig || {});
        res.json({ message: 'Artist configuration updated successfully' });
    } catch (err) {
        console.error('[ADMIN] Error updating artist config:', err);
        res.status(500).json({ error: 'Failed to update artist config' });
    }
};

export const saveCatalogArtist = async (req, res) => {
    try {
        const artistId = await adminRepo.saveArtist(req.body);
        res.json({ message: 'Artist saved successfully', id: artistId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save artist' });
    }
};

export const trackEvent = async (req, res) => {
    try {
        const { event_type, value } = req.body;
        if (!event_type) return res.status(400).json({ error: 'Event type is required' });
        
        await logEvent(event_type, value);
        res.json({ message: 'Event tracked' });
    } catch (err) {
        console.error('[ANALYTICS] Error tracking event:', err);
        res.status(500).json({ error: 'Failed to track event' });
    }
};

export const removePost = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deletePost(id);
        if (success) {
            res.json({ message: 'Post removed successfully' });
        } else {
            res.status(404).json({ error: 'Post not found or already deleted' });
        }
    } catch (err) {
        console.error('[ADMIN] Error removing post:', err);
        res.status(500).json({ error: 'Failed to remove post' });
    }
};

export const getArtistList = async (req, res) => {
    try {
        const artists = await adminRepo.getAllArtists();
        res.json(artists);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch artist list' });
    }
};

export const deleteArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await adminRepo.deleteArtist(id);
        if (success) {
            res.json({ message: 'Artist deleted successfully' });
        } else {
            res.status(404).json({ error: 'Artist not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete artist' });
    }
};

export const restoreArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await adminRepo.restoreArtist(id);
        if (success) {
            res.json({ message: 'Artist restored successfully' });
        } else {
            res.status(404).json({ error: 'Artist not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to restore artist' });
    }
};


