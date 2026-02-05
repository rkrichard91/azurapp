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
      category:categories(code, name),
      prices!inner(price, renewal_price, duration_label)
    `)
        .eq('is_active', true)
        .eq('prices.channel_id', channel.id);

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}
