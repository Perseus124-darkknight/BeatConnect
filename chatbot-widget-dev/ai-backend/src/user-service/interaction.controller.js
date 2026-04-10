import * as interactionService from '../shared/interaction.service.js';

/**
 * Toggle a favorite for an artist, album, or track.
 */
export async function toggleFavorite(req, res) {
  try {
    const { entityType, entityId } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!['artist', 'album', 'track'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    const result = await interactionService.toggleFavorite(userId, entityType, entityId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error toggling favorite' });
  }
}

/**
 * Rate a music entity (1-5 stars).
 */
export async function submitRating(req, res) {
  try {
    const { entityType, entityId, rating } = req.body;
    const userId = req.user.id;

    if (!['artist', 'album', 'track'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await interactionService.submitRating(userId, entityType, entityId, rating);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error submitting rating' });
  }
}

/**
 * Get all interactions for the current user.
 */
export async function getMyInteractions(req, res) {
  try {
    const userId = req.user.id;
    const interactions = await interactionService.getUserInteractions(userId);
    res.json(interactions);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching interactions' });
  }
}
