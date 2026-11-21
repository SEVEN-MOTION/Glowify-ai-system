import { describe, expect, it } from 'vitest';
import { getSavedStoreDetails } from './stores';

describe('getSavedStoreDetails', () => {
  it('returns profile data as saved details without claiming verification', () => {
    expect(getSavedStoreDetails({ storeName: 'My Studio', shopifyStoreDomain: 'my-studio.myshopify.com' })).toEqual({
      name: 'My Studio',
      domain: 'my-studio.myshopify.com',
    });
  });

  it('uses the domain as a display name when no custom name is saved', () => {
    expect(getSavedStoreDetails({ shopifyStoreDomain: 'my-studio.myshopify.com' })?.name).toBe('my studio');
  });

  it('returns no store for missing or invalid domains', () => {
    expect(getSavedStoreDetails(null)).toBeNull();
    expect(getSavedStoreDetails({ shopifyStoreDomain: 'example.com' })).toBeNull();
  });
});
