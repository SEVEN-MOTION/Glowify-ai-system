// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  firebaseAuth: {
    signInWithGoogle: mocks.signInWithGoogle,
  },
}));

vi.mock('./CommonUI', () => ({
  TechBackground: () => null,
}));

import { AuthScreen } from './AuthScreen';

describe('AuthScreen Google sign-in feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the pending state on Google while the popup is open', async () => {
    let finishSignIn: (result: { user: null; error: string }) => void = () => {};
    mocks.signInWithGoogle.mockImplementation(() => new Promise(resolve => {
      finishSignIn = resolve;
    }));

    render(<AuthScreen />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    const googleButton = screen.getByRole('button', { name: 'Waiting for Google…' });
    const [, emailSignInButton] = screen.getAllByRole('button', { name: 'Sign In' });

    expect(googleButton.getAttribute('aria-busy')).toBe('true');
    expect(googleButton.disabled).toBe(true);
    expect(emailSignInButton.disabled).toBe(true);
    expect(emailSignInButton.querySelector('.animate-spin')).toBeNull();

    finishSignIn({ user: null, error: 'Sign-in popup closed. Please try again.' });
    expect(await screen.findByText('Sign-in popup closed. Please try again.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Google' }).disabled).toBe(false);
  });
});
