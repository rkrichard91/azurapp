-- 01_sales_table.sql
-- Run this SQL in your Supabase SQL Editor to create the sales table for the Sales CRM feature.

CREATE TABLE public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_ruc VARCHAR(50),
    client_name VARCHAR(255),
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    sale_type VARCHAR(20) NOT NULL CHECK (sale_type IN ('NUEVA', 'RENOVACION')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('EN GESTIÓN', 'VENTA CERRADA', 'DESCARTADA')),
    description VARCHAR(255),
    channel VARCHAR(20) NOT NULL, -- 'AZUR', 'LOCAL'
    origin VARCHAR(100), -- Ej. Local Samanes, Página Web
    management_type VARCHAR(50) DEFAULT 'N/A', -- 'Gestión Vendedor', 'Autogestión', 'N/A'
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    plan_amount DECIMAL(10, 2) DEFAULT 0,
    signature_amount DECIMAL(10, 2) DEFAULT 0,
    module_amount DECIMAL(10, 2) DEFAULT 0,
    product_details JSONB DEFAULT '{}'::JSONB,
    next_contact_date DATE
);

-- RLS (Row Level Security) - Permite acceso total para entorno de desarrollo (de requerirse)
-- Dependiendo de tu configuración de Supabase, puedes querer agregar esto o dejarlo desactivado.
-- ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable all for authenticated users" ON public.sales AS PERMISSIVE FOR ALL USING (true);
