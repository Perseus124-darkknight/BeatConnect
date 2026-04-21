// ai-backend/src/user-service/admin.controller.js
import { getAggregatedMetrics, getRecentEvents, logEvent } from './analytics-service.js';
import { getRecentPosts, deletePost } from '../social-service/post-service.js';
import * as adminRepo from './admin.repository.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initEmbeddings } from '../chat-service/chat.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FAQ_PATH = path.join(__dirname, '../../../docs/chatbot_faq.md');

export const getKnowledgeBase = async (req, res) => {
    try {
        const content = await fs.readFile(FAQ_PATH, 'utf-8');
        res.json({ content });
    } catch (err) {
        console.error('[ADMIN] Error reading FAQ:', err);
        res.status(500).json({ error: 'Failed to read Knowledge Base' });
    }
};

export const updateKnowledgeBase = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content is required' });

        await fs.writeFile(FAQ_PATH, content, 'utf-8');
        
        // Trigger Neural Re-sync
        initEmbeddings().catch(err => console.error('[RAG] Background re-sync failed:', err));

        res.json({ message: 'Knowledge Base updated and Neural Sync triggered' });
    } catch (err) {
        console.error('[ADMIN] Error updating FAQ:', err);
        res.status(500).json({ error: 'Failed to update Knowledge Base' });
    }
};

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

export const uploadArtistImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        // Return the path that can be served statically
        const imageUrl = `/public/uploads/${req.file.filename}`;
        res.json({ 
            message: 'Image uploaded successfully', 
            url: imageUrl 
        });
    } catch (err) {
        console.error('[ADMIN] Error uploading artist image:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await adminRepo.getSystemUsers();
        console.log('[DEBUG-ADMIN] Fetched Users:', users?.length || 0, 'records');
        res.json(users);
    } catch (err) {
        console.error('[DEBUG-ADMIN] getSystemUsers Error:', err);
        res.status(500).json({ error: 'Failed to fetch user list' });
    }
};

export const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await adminRepo.deleteSystemUser(id);
        if (success) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};


