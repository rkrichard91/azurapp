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
    },
    // SRI API Proxy / Stub
    // El usuario reemplazará esta función con su proveedor de la API de Ecuador
    async querySRI(ruc) {
        // Simulador de retraso de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.warn('Utilizando MOCK del SRI. Para usar el real, configura el endpoint en services/salesService.js');
        // Endpoint Ejemplo Facturito/Taxo
        // const response = await fetch(`https://api.proveedor.com/v1/ruc/${ruc}`);
        // const data = await response.json();
        // return data.razonSocial;

        // Mock Response dependiente del num
        if (ruc.length !== 13 && ruc.length !== 10) {
            throw new Error("Longitud de identificación no válida");
        }
        
        // Simular un autocompletado en el front si el ruc existe
        return "CLIENTE DE PRUEBA S.A.";
    }
};
