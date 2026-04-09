import { supabase } from './supabaseClient';

export const salesService = {
    /**
     * Create a new sale
     * @param {Object} saleData - object containing client data, sale_type, channel, status, and amounts
     */
    async createSale(saleData) {
        const { data, error } = await supabase
            .from('sales')
            .insert([saleData])
            .select()
            .single();

        if (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
        return data;
    },

    /**
     * Get all sales ordered by created_at
     */
    async getSales() {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sales:', error);
            throw error;
        }
        return data;
    },

    /**
     * Update the status of a sale
     */
    async updateSaleStatus(id, status) {
        const { data, error } = await supabase
            .from('sales')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating sale status:', error);
            throw error;
        }
        return data;
    },

    /**
     * Update an entire sale record
     */
    async updateSale(id, updates) {
        const { data, error } = await supabase
            .from('sales')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating sale:', error);
            throw error;
        }
        return data;
    }
};
