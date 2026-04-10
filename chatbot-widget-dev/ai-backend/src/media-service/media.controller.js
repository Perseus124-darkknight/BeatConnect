import { getArtists, getArtistDetails } from './media.repository.js';
import { getDailyReport } from './report-service.js';

export const getDailyReportHandler = async (req, res) => {
  try {
    const report = await getDailyReport();
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    console.error('[API] Error fetching daily report:', error);
    res.status(500).json({ error: 'Server error fetching report' });
  }
};

export const getArtistsHandler = async (req, res) => {
  try {
    const artists = await getArtists();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching artist list' });
  }
};

export const getArtistDetailsHandler = async (req, res) => {
  try {
    const details = await getArtistDetails(req.params.name);
    if (!details) return res.status(404).json({ error: 'Artist not found' });
    
    // Legacy Compatibility: The frontend expects an array of knowledge items.
    // We return an array containing:
    // 1. A virtual 'band' item that includes the structured data (discography, etc.)
    // 2. All related knowledge items (members, tours, etc.)
    const responseBody = [
      {
        category: 'band',
        title: details.name,
        content: details.bio,
        hero_image: details.profile_image,
        ...details
      },
      ...(details.knowledgeItems || [])
    ];
    
    res.json(responseBody);
  } catch (error) {
    console.error('[API] Error fetching artist details:', error);
    res.status(500).json({ error: 'Error fetching artist details' });
  }
};
