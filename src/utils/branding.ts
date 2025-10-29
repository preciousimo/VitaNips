// src/utils/branding.ts
// Lightweight runtime branding helper: derives a palette from /logo.png and applies CSS variables

type RGB = { r: number; g: number; b: number };

const clamp = (v: number, min = 0, max = 255) => Math.max(min, Math.min(max, v));

const toHex = ({ r, g, b }: RGB): string =>
  `#${[r, g, b]
    .map((n) => clamp(Math.round(n)))
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;

const lighten = ({ r, g, b }: RGB, amount = 0.2): RGB => {
  return {
    r: clamp(r + (255 - r) * amount),
    g: clamp(g + (255 - g) * amount),
    b: clamp(b + (255 - b) * amount),
  };
};

const darken = ({ r, g, b }: RGB, amount = 0.2): RGB => {
  return {
    r: clamp(r * (1 - amount)),
    g: clamp(g * (1 - amount)),
    b: clamp(b * (1 - amount)),
  };
};

/*
const readImageAverageColor = (src: string): Promise<RGB> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // allow sampling public/logo.png
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const { data } = ctx.getImageData(0, 0, width, height);

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue; // skip transparent
          r += data[i + 0];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count === 0) throw new Error('No opaque pixels found');
        resolve({ r: r / count, g: g / count, b: b / count });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};
*/

export const applyBranding = (primaryHex: string) => {
  try {
    const root = document.documentElement;
    // Parse hex to RGB
    const r = parseInt(primaryHex.slice(1, 3), 16);
    const g = parseInt(primaryHex.slice(3, 5), 16);
    const b = parseInt(primaryHex.slice(5, 7), 16);
    const base: RGB = { r, g, b };
    const light = lighten(base, 0.7);
    const dark = darken(base, 0.25);

    root.style.setProperty('--primary', primaryHex);
    root.style.setProperty('--primary-light', toHex(light));
    root.style.setProperty('--primary-dark', toHex(dark));
  } catch (e) {
    // Fallback is already defined in CSS
    console.warn('applyBranding failed, using default palette', e);
  }
};

export const initBrandingFromLogo = async () => {
  // VitaNips brand green is #32a852 - apply directly
  applyBranding('#32a852');
  
  // Optional: still try to read the logo for future dynamic theming
  // Uncomment below if you want to derive color from the image instead
  /*
  try {
    const rgb = await readImageAverageColor('/logo.png');
    const hex = toHex(rgb);
    applyBranding(hex);
  } catch (e) {
    console.warn('Could not derive branding from logo, using default palette', e);
  }
  */
};
