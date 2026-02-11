import { supabase } from './supabaseClient';

/**
 * Fetch all products with their prices for a specific channel.
 * @param {string} channelCode - 'AZUR', 'LOCAL', or 'WEB'
 */
export async function fetchProductsByChannel(channelCode) {
    // 1. Get Channel ID
    const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('code', channelCode)
        .single();

    if (channelError || !channel) {
        console.error('Channel not found:', channelError);
        return [];
    }

    // 2. Get Products with Prices for this Channel
    const { data, error } = await supabase
        .from('products')
        .select(`
      id,
      name,
      description,
      features,
      category:categories(code, name),
      prices!inner(id, price, renewal_price, duration_label)
    `)
        .eq('is_active', true)
        .eq('prices.channel_id', channel.id)
        .order('id', { foreignTable: 'prices', ascending: true }); // Ordenar precios por ID (normalmente orden ascendente de duración)

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    // Sort prices by price value manually to ensure 1 AÑO (cheaper) comes before 2 AÑOS (expensive)
    // or rely on insertion order if ID sort works. Let's do a reliable sort.
    const processedData = data.map(product => {
        if (product.prices && product.prices.length > 1) {
            product.prices.sort((a, b) => a.price - b.price);
        }
        return product;
    });

    return processedData;
}

/**
 * Fetch all integration packages.
 */
export async function fetchIntegrationPackages() {
    // 3. Get Integration Packages
    const { data, error } = await supabase
        .from('integration_packages')
        .select('*')
        .order('price', { ascending: true }); // Lowest price first

    if (error) {
        console.error('Error fetching integration packages:', error);
        return [];
    }
    return data;
}
