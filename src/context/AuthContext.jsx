import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateProfile = async (data) => {
        const { error } = await supabase.auth.updateUser({ data });
        if (error) throw error;
    };

    const updatePassword = async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, updateProfile, updatePassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
