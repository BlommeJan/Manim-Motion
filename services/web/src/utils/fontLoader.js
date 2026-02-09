/**
 * Font Loader Utility
 * 
 * Dynamically loads Google Fonts for canvas preview.
 * Uses the Google Fonts CSS2 API and FontFace API for reliable loading.
 */

// Track which fonts have been loaded
const loadedFonts = new Set();
const loadingFonts = new Map(); // font -> Promise

// System fonts that don't need to be loaded
const SYSTEM_FONTS = [
  'arial', 'helvetica', 'times new roman', 'times', 'georgia',
  'courier new', 'courier', 'verdana', 'tahoma', 'trebuchet ms',
  'impact', 'comic sans ms', 'lucida console', 'monaco',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
];

/**
 * Check if a font is a system font
 */
export function isSystemFont(fontFamily) {
  if (!fontFamily) return true;
  return SYSTEM_FONTS.includes(fontFamily.toLowerCase());
}

/**
 * Check if a font is already loaded
 */
export function isFontLoaded(fontFamily) {
  if (isSystemFont(fontFamily)) return true;
  return loadedFonts.has(fontFamily);
}

/**
 * Load a Google Font dynamically
 * Returns a promise that resolves when the font is ready
 */
export async function loadFont(fontFamily) {
  // Skip system fonts
  if (isSystemFont(fontFamily)) {
    return true;
  }

  // Already loaded
  if (loadedFonts.has(fontFamily)) {
    return true;
  }

  // Currently loading - return existing promise
  if (loadingFonts.has(fontFamily)) {
    return loadingFonts.get(fontFamily);
  }

  // Create loading promise
  const loadPromise = new Promise((resolve, reject) => {
    try {
      // Create the Google Fonts link
      const encodedFamily = fontFamily.replace(/ /g, '+');
      const linkId = `google-font-${encodedFamily}`;
      
      // Check if link already exists
      if (document.getElementById(linkId)) {
        loadedFonts.add(fontFamily);
        resolve(true);
        return;
      }

      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      link.rel = 'stylesheet';

      link.onload = async () => {
        // Wait for the font to actually be ready using FontFace API
        try {
          await document.fonts.load(`16px "${fontFamily}"`);
          loadedFonts.add(fontFamily);
          loadingFonts.delete(fontFamily);
          resolve(true);
        } catch (e) {
          // Font might still work, mark as loaded anyway
          loadedFonts.add(fontFamily);
          loadingFonts.delete(fontFamily);
          resolve(true);
        }
      };

      link.onerror = () => {
        console.warn(`Failed to load font: ${fontFamily}`);
        loadingFonts.delete(fontFamily);
        reject(new Error(`Failed to load font: ${fontFamily}`));
      };

      document.head.appendChild(link);
    } catch (error) {
      loadingFonts.delete(fontFamily);
      reject(error);
    }
  });

  loadingFonts.set(fontFamily, loadPromise);
  return loadPromise;
}

/**
 * Load multiple fonts at once
 */
export async function loadFonts(fontFamilies) {
  const promises = fontFamilies
    .filter(f => f && !isSystemFont(f))
    .map(f => loadFont(f).catch(() => false));
  
  return Promise.all(promises);
}

/**
 * Preload fonts used in a project
 */
export async function preloadProjectFonts(objects) {
  const fonts = new Set();
  
  for (const obj of objects || []) {
    if (obj.type === 'text' && obj.fontFamily) {
      fonts.add(obj.fontFamily);
    }
  }

  if (fonts.size > 0) {
    await loadFonts(Array.from(fonts));
  }
}

export default {
  loadFont,
  loadFonts,
  isFontLoaded,
  isSystemFont,
  preloadProjectFonts
};
