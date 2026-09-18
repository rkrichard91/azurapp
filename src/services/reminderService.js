import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'azurapp_reminders_fallback';

function getLocalReminders() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveLocalReminders(reminders) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reminders));
    } catch (e) {
        console.warn('Error saving to localStorage:', e);
    }
}

export const reminderService = {
    /**
     * Fetch all reminders, ordered by date_time
     */
    async getReminders() {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .order('date_time', { ascending: true });

            if (error) {
                // If table doesn't exist yet, fallback to localStorage
                if (error.code === '42P01' || error.message?.includes('relation "public.reminders" does not exist') || error.code === 'PGRST204') {
                    console.warn('Tabla reminders no existe aún en Supabase. Usando almacenamiento local temporal.');
                    return getLocalReminders();
                }
                console.error('Error fetching reminders:', error);
                return getLocalReminders();
            }
            return data || [];
        } catch (err) {
            console.warn('Error in getReminders, using local fallback:', err);
            return getLocalReminders();
        }
    },

    /**
     * Create a new reminder
     */
    async createReminder(reminderData) {
        const payload = {
            title: reminderData.title,
            type: reminderData.type || 'reunion_comercial',
            modality: reminderData.modality || 'presencial',
            client_name: reminderData.client_name,
            client_phone: reminderData.client_phone || '',
            client_email: reminderData.client_email || '',
            date_time: reminderData.date_time,
            meeting_url: reminderData.meeting_url || '',
            location_address: reminderData.location_address || '',
            notify_advance_minutes: Number(reminderData.notify_advance_minutes ?? 15),
            status: reminderData.status || 'pendiente',
            notes: reminderData.notes || '',
            notified: false
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                payload.user_id = session.user.id;
            }

            const { data, error } = await supabase
                .from('reminders')
                .insert([payload])
                .select()
                .single();

            if (error) {
                if (error.code === '42P01' || error.message?.includes('relation "public.reminders" does not exist')) {
                    const localItem = {
                        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                        ...payload,
                        created_at: new Date().toISOString()
                    };
                    const list = getLocalReminders();
                    list.push(localItem);
                    saveLocalReminders(list);
                    return localItem;
                }
                throw error;
            }

            return data;
        } catch (err) {
            console.warn('Fallback insert to local storage due to:', err);
            const localItem = {
                id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                ...payload,
                created_at: new Date().toISOString()
            };
            const list = getLocalReminders();
            list.push(localItem);
            saveLocalReminders(list);
            return localItem;
        }
    },

    /**
     * Update an existing reminder
     */
    async updateReminder(id, updates) {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                // Try local update
                const list = getLocalReminders();
                const idx = list.findIndex(r => r.id === id);
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
                    saveLocalReminders(list);
                    return list[idx];
                }
                throw error;
            }
            return data;
        } catch (err) {
            console.warn('Fallback update in local storage:', err);
            const list = getLocalReminders();
            const idx = list.findIndex(r => r.id === id);
            if (idx !== -1) {
                list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
                saveLocalReminders(list);
                return list[idx];
            }
            throw err;
        }
    },

    /**
     * Delete a reminder
     */
    async deleteReminder(id) {
        try {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id);

            if (error) {
                const list = getLocalReminders().filter(r => r.id !== id);
                saveLocalReminders(list);
                return true;
            }
            return true;
        } catch {
            const list = getLocalReminders().filter(r => r.id !== id);
            saveLocalReminders(list);
            return true;
        }
    }
};
