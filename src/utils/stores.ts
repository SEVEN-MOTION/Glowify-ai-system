export interface StoreProfile {
  storeName?: string | null;
  shopifyStoreDomain?: string | null;
}

export interface SavedStoreDetails {
  name: string;
  domain: string;
}

const SHOPIFY_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

/** Reads the account's saved store details; it does not verify an OAuth connection. */
export function getSavedStoreDetails(profile: StoreProfile | null | undefined): SavedStoreDetails | null {
  const domain = profile?.shopifyStoreDomain?.trim().toLowerCase() ?? '';
  if (!SHOPIFY_DOMAIN.test(domain)) return null;

  const savedName = profile?.storeName?.trim();
  return {
    name: savedName && savedName !== 'My Store'
      ? savedName
      : domain.replace(/\.myshopify\.com$/, '').replace(/-/g, ' '),
    domain,
  };
}
