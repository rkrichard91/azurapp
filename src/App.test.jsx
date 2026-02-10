import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import App from './App';

// Mock supabase client to avoid initialization errors
vi.mock('./services/supabaseClient', () => ({
    supabase: {
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
