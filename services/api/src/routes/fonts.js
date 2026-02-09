/**
 * Fonts API Routes
 *
 * Provides access to Google Fonts metadata for the frontend font selector.
 * Uses the Google Fonts Developer API to fetch the full font list.
 */

import { Router } from 'express';

const router = Router();

// Cache for Google Fonts list (refreshed every 24 hours)
let fontsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Google Fonts API key (optional - works without for basic metadata)
const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY || '';

/**
 * Fallback list of popular Google Fonts if API is unavailable
 */
const FALLBACK_FONTS = [
  { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Roboto Condensed', category: 'sans-serif', variants: ['300', '400', '700'] },
  { family: 'Source Sans Pro', category: 'sans-serif', variants: ['200', '300', '400', '600', '700', '900'] },
  { family: 'Oswald', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Nunito Sans', category: 'sans-serif', variants: ['200', '300', '400', '600', '700', '800', '900'] },
  { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Fira Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Mulish', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Barlow', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Karla', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'] },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'] },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'] },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700', '800'] },
  { family: 'Bitter', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Source Serif Pro', category: 'serif', variants: ['200', '300', '400', '600', '700', '900'] },
  { family: 'Roboto Slab', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Noto Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Roboto Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '900'] },
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'] },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Inconsolata', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'] },
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'] },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Satisfy', category: 'handwriting', variants: ['400'] },
  { family: 'Great Vibes', category: 'handwriting', variants: ['400'] },
  { family: 'Lobster', category: 'display', variants: ['400'] },
  { family: 'Bebas Neue', category: 'display', variants: ['400'] },
  { family: 'Abril Fatface', category: 'display', variants: ['400'] },
  { family: 'Righteous', category: 'display', variants: ['400'] },
  { family: 'Archivo Black', category: 'sans-serif', variants: ['400'] },
  { family: 'Anton', category: 'sans-serif', variants: ['400'] },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'] },
  { family: 'Permanent Marker', category: 'handwriting', variants: ['400'] },
  { family: 'Bangers', category: 'display', variants: ['400'] },
  { family: 'Berkshire Swash', category: 'handwriting', variants: ['400'] },
  { family: 'Comfortaa', category: 'display', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Josefin Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Archivo', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Lexend', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '700'] },
  { family: 'Outfit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Space Grotesk', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Sora', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Figtree', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Albert Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Urbanist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Red Hat Display', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Geologica', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Onest', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Instrument Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Geist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] }
];

/**
 * Fetch fonts from Google Fonts API
 */
async function fetchGoogleFonts() {
  const now = Date.now();

  // Return cached data if still valid
  if (fontsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return fontsCache;
  }

  try {
    let url = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity';
    if (GOOGLE_FONTS_API_KEY) {
      url += `&key=${GOOGLE_FONTS_API_KEY}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[Fonts] Google Fonts API returned ${response.status}, using fallback`);
      return FALLBACK_FONTS;
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('[Fonts] Invalid response from Google Fonts API, using fallback');
      return FALLBACK_FONTS;
    }

    // Transform the response to our format
    fontsCache = data.items.map(font => ({
      family: font.family,
      category: font.category,
      variants: font.variants || ['400']
    }));

    cacheTimestamp = now;
    console.log(`[Fonts] Cached ${fontsCache.length} fonts from Google Fonts API`);

    return fontsCache;
  } catch (error) {
    console.error('[Fonts] Error fetching Google Fonts:', error.message);
    return FALLBACK_FONTS;
  }
}

/**
 * GET /api/fonts
 * Returns the list of available Google Fonts
 *
 * Query params:
 *   - search: Filter fonts by name (case-insensitive)
 *   - category: Filter by category (serif, sans-serif, display, handwriting, monospace)
 *   - limit: Maximum number of fonts to return (default: 100)
 *   - offset: Pagination offset (default: 0)
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, category, limit = 100, offset = 0 } = req.query;

    let fonts = await fetchGoogleFonts();

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      fonts = fonts.filter(f => f.family.toLowerCase().includes(searchLower));
    }

    // Apply category filter
    if (category) {
      fonts = fonts.filter(f => f.category === category);
    }

    // Get total count before pagination
    const total = fonts.length;

    // Apply pagination
    const limitNum = Math.min(parseInt(limit, 10) || 100, 500);
    const offsetNum = parseInt(offset, 10) || 0;
    fonts = fonts.slice(offsetNum, offsetNum + limitNum);

    res.json({
      fonts,
      total,
      limit: limitNum,
      offset: offsetNum,
      categories: ['sans-serif', 'serif', 'display', 'handwriting', 'monospace']
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/fonts/categories
 * Returns available font categories
 */
router.get('/categories', (req, res) => {
  res.json({
    categories: [
      { id: 'sans-serif', label: 'Sans Serif', description: 'Clean, modern fonts without serifs' },
      { id: 'serif', label: 'Serif', description: 'Traditional fonts with decorative strokes' },
      { id: 'display', label: 'Display', description: 'Decorative fonts for headings' },
      { id: 'handwriting', label: 'Handwriting', description: 'Script and cursive fonts' },
      { id: 'monospace', label: 'Monospace', description: 'Fixed-width fonts for code' }
    ]
  });
});

/**
 * GET /api/fonts/:family
 * Get details for a specific font family
 */
router.get('/:family', async (req, res, next) => {
  try {
    const { family } = req.params;
    const fonts = await fetchGoogleFonts();

    const font = fonts.find(f => f.family.toLowerCase() === family.toLowerCase());

    if (!font) {
      return res.status(404).json({ error: 'Font not found' });
    }

    res.json(font);
  } catch (error) {
    next(error);
  }
});

export default router;
