// Intentionally empty. The previous snapshot held leftover iCore/Apple demo data
// (banners, categories, nkgj… storage URLs) which is no longer used by Valens.
// The homepage payload is fetched live; this empty default just keeps the import
// valid and yields no stale content on first paint.
export const HOMEPAGE_PAYLOAD_SNAPSHOT = {
  settings: {},
  store_sessions: [],
  homepage_banners: [],
  store_categories: [],
  featured_products: [],
} as any;
