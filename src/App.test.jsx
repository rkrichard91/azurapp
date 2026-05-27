import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import App from './App';

vi.mock('./services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null } }),
            onAuthStateChange: () => ({
                data: { subscription: { unsubscribe: () => {} } },
            }),
        },
        from: () => ({
            select: () => ({
                data: [],
                error: null,
            }),
        }),
    },
}));

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check if the dashboard or some element is present.
        // Based on App.jsx, it renders Dashboard on /.
        // We can just rely on render() not throwing for now.
    });
});
