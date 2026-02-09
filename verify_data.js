
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctpludvbndvzgzghjkxg.supabase.co';
const supabaseAnonKey = 'sb_publishable_rykF8Nkv9DWXaWDpFOK_2g_AB4eBOsf';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log("🔍 Verifying Data...");

    // 1. Check Integration Packages
    console.log("\n--- Checking Integration Packages ---");
    const { data: integrations, error: intError } = await supabase
        .from('integration_packages')
        .select('*');

    if (intError) {
        console.error("❌ Error fetching integration_packages:", intError.message);
        console.error("   Details:", intError);
    } else {
        console.log(`✅ Found ${integrations.length} integration packages.`);
        if (integrations.length > 0) {
            console.log("   Sample:", integrations[0]);
        } else {
            console.warn("   ⚠️ Table is empty!");
        }
    }

    // 2. Check Products & Prices (PlanChange dependency)
    console.log("\n--- Checking Products (PLAN) ---");
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            category:categories(code),
            prices(id, price, channel_id)
        `)
        .eq('category.code', 'PLAN') // categorization check might fail if relation is wrong
        .limit(5);

    if (prodError) {
        // Try simpler query if relation fails
        console.error("❌ Error fetching detailed products:", prodError.message);

        console.log("\n--- fallback: Checking Products (Simple) ---");
        const { data: simpleProds, error: simpleErr } = await supabase.from('products').select('*').limit(5);
        if (simpleErr) {
            console.error("❌ Error fetching basic products:", simpleErr.message);
        } else {
            console.log(`✅ Found ${simpleProds.length} products (basic query).`);
            console.log("   Sample:", simpleProds[0]);
        }

        console.log("\n--- fallback: Checking Categories ---");
        const { data: cats, error: catErr } = await supabase.from('categories').select('*');
        if (catErr) console.error("Error fetching categories:", catErr.message);
        else console.log("Categories:", cats);

    } else {
        console.log(`✅ Found ${products.length} products with prices.`);
        if (products.length > 0) {
            console.log("   Sample:", JSON.stringify(products[0], null, 2));
        } else {
            console.warn("   ⚠️ No products found with PLAN category!");
        }
    }
}

verify();
