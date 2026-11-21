// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingsView } from './SettingsView';

const authState = vi.hoisted(() => ({ user: null as null | { email?: string; providerData?: Array<{ providerId?: string }> }, profile: null as Record<string, unknown> | null, refreshProfile: vi.fn(), signOut: vi.fn() }));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));
vi.mock('../../lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), setDoc: vi.fn(), serverTimestamp: vi.fn() }));
vi.mock('firebase/auth', () => ({ updateProfile: vi.fn(), linkWithCredential: vi.fn(), EmailAuthProvider: { credential: vi.fn() }, updatePassword: vi.fn() }));

describe('SettingsView', () => {
  afterEach(cleanup);

  it('renders safely for an account without provider metadata', () => {
    authState.user = { email: 'owner@example.com' };
    render(<SettingsView />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    authState.user = null;
  });

  it('renders account, navigates between sections, and avoids fabricated billing details', async () => {
    render(<SettingsView />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByRole('tabpanel')).toBeTruthy();
    expect(screen.getByText(/No Shopify domain is saved/)).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Integrations' }));
    expect(screen.getByRole('tab', { name: 'Integrations' }).getAttribute('aria-selected')).toBe('true');
    expect(await screen.findByText('Integration settings')).toBeTruthy();
    expect(screen.getAllByText('Not configured').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(await screen.findByText('Billing details are not available in this app yet.')).toBeTruthy();
    expect(screen.queryByText('$299/mo')).toBeNull();
  });
});
