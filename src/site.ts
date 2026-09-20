// Everything that isn't words: dates, links, payment details, crew photos.

export const ARRIVED = '2026-06-19';

export const social = {
  x: 'https://x.com/carathepirate',
  xHandle: '@carathepirate',
  tiktok: 'https://www.tiktok.com/@cara.the.pirate',
  tiktokHandle: '@cara.the.pirate',
};

// Payment details come from env vars at build time (see .env.example).
// Placeholders are deliberately invalid addresses, so nobody can send money to them by accident.
const missing: string[] = [];
const env = (key: string, placeholder: string): string => {
  const v = (import.meta.env[key] as string | undefined)?.trim();
  if (!v) missing.push(key);
  return v || placeholder;
};

const optional = (key: string): string | null => {
  const v = (import.meta.env[key] as string | undefined)?.trim();
  if (!v) missing.push(key);
  return v || null;
};

const paypalHandle = optional('PUBLIC_PAYPAL_ME');

export const pay = {
  // null hides the button rather than publishing a dead link
  stripe: optional('PUBLIC_STRIPE_LINK'),
  paypal: paypalHandle && `https://paypal.me/${paypalHandle}`,
  bank: {
    holder: env('PUBLIC_IBAN_HOLDER', 'Account holder name'),
    iban: env('PUBLIC_IBAN', 'RO00XXXX0000000000000000').replace(/\s+/g, ''),
    bank: env('PUBLIC_IBAN_BANK', 'Bank name'),
    bic: env('PUBLIC_IBAN_BIC', 'XXXXROBU'),
    currency: env('PUBLIC_IBAN_CURRENCY', 'RON'),
  },
  wallets: [
    { id: 'evm', scheme: 'ethereum', address: env('PUBLIC_WALLET_EVM', '0xYOUR-EVM-ADDRESS'), networks: env('PUBLIC_EVM_NETWORKS', 'Ethereum, Base, Arbitrum') },
    { id: 'sol', scheme: 'solana', address: env('PUBLIC_WALLET_SOL', 'YOUR-SOLANA-ADDRESS'), networks: '' },
    { id: 'btc', scheme: 'bitcoin', address: env('PUBLIC_WALLET_BTC', 'bc1-YOUR-BITCOIN-ADDRESS'), networks: '' },
  ] as const,
};

if (missing.length) console.warn(`\n⚠ Placeholder payment details in use. Set: ${missing.join(', ')}\n`);

const all = import.meta.glob<{ default: ImageMetadata }>('./assets/photos/*.jpg', { eager: true });
export const photos: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(all).map(([path, mod]) => [path.split('/').pop()!.replace('.jpg', ''), mod.default]),
);

// Intrinsic sizes, so videos reserve their space before they load.
export const videoSize: Record<string, [number, number]> = {
  'just-found-2': [576, 1024],
  'meet-the-gang': [960, 540],
  'meet-the-gang-2': [540, 960],
};

// Crew portraits are pre-cropped squares (see scripts/media.sh), so they just fill their circle.
export const crew = [
  { id: 'cara', name: 'Cara', photo: 'crew-cara' },
  { id: 'zuba', name: 'Zuba', photo: 'crew-zuba' },
  { id: 'cookie', name: 'Cookie', photo: 'crew-cookie' },
  { id: 'oreo', name: 'Oreo', photo: 'crew-oreo' },
  { id: 'cats', name: null, photo: 'crew-cats' },
] as const;
