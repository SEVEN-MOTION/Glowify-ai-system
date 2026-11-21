// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardShell } from './DashboardShell';

const authState = vi.hoisted(() => ({
  user: { email: 'owner@example.com' },
  profile: null as null | { displayName?: string; storeName?: string; shopifyStoreDomain?: string },
  signOut: vi.fn(),
}));

const dataState = vi.hoisted(() => ({ notifications: [] as Array<{ id: string; type: 'info'; title: string; message: string; timestamp: string; read: boolean }> }));

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('../contexts/DataContext', () => ({
  useData: () => ({ notifications: dataState.notifications, markNotificationRead: vi.fn(), clearNotifications: vi.fn() }),
}));

describe('DashboardShell', () => {
  afterEach(cleanup);

  beforeEach(() => {
    authState.profile = null;
    dataState.notifications = [];
  });

  it('shows an honest store empty state and labels dashboard content as sample data', () => {
    render(<DashboardShell activeTab="overview" setActiveTab={vi.fn()}>Dashboard content</DashboardShell>);

    expect(screen.getByRole('button', { name: /Store details unavailable/ })).toBeTruthy();
    expect(screen.getByText(/Sample dashboard data/)).toBeTruthy();
    expect(screen.queryByText('NEUROZEN LAB')).toBeNull();
    expect(screen.queryByText('All Systems Operational')).toBeNull();
    expect(screen.queryByText(/Efficiency \+24%/)).toBeNull();
  });

  it('shows saved store details as unverified', () => {
    authState.profile = { storeName: 'My Studio', shopifyStoreDomain: 'my-studio.myshopify.com' };
    render(<DashboardShell activeTab="overview" setActiveTab={vi.fn()}>Dashboard content</DashboardShell>);

    expect(screen.getByText('My Studio')).toBeTruthy();
    expect(screen.getByText(/saved, unverified/)).toBeTruthy();
  });

  it('uses semantic navigation and opens an empty notification center', () => {
    render(<DashboardShell activeTab="overview" setActiveTab={vi.fn()}>Dashboard content</DashboardShell>);

    expect(screen.getByRole('navigation', { name: 'Dashboard sections' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Command Center' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeTruthy();
    expect(screen.getByText('No notifications yet')).toBeTruthy();
  });
});
