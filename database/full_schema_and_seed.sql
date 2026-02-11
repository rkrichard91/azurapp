-- ==========================================
-- 1. LIMPIEZA DE BASE DE DATOS (CUIDADO)
-- ==========================================
DROP TABLE IF EXISTS public.prices CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.integration_packages CASCADE;
DROP TABLE IF EXISTS public.channels CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- ==========================================
-- 2. CREACIÓN DE TABLAS (ESQUEMA)
-- ==========================================

-- 2.1. Canales de Venta
CREATE TABLE public.channels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'AZUR', 'LOCAL', 'WEB'
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- 2.2. Categorías de Productos
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'PLAN', 'SIGNATURE', 'MODULE'
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2.3. Productos Principales
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id INT REFERENCES public.categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    allows_quantity BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '{}'::JSONB, -- Para comparador de características
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4. Lista de Precios
CREATE TABLE public.prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    channel_id INT REFERENCES public.channels(id),
    duration_label VARCHAR(50) NOT NULL, -- '1 AÑO', 'MENSUAL', '2 AÑOS'
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    renewal_price DECIMAL(10, 2), -- Precio diferenciado para renovación
    UNIQUE(product_id, channel_id, duration_label)
);

-- 2.5. Paquetes de Integración
CREATE TABLE public.integration_packages (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'API' o 'WEB'
    quantity INT NOT NULL,     -- Cantidad de comprobantes
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. INSERCIÓN DE DATOS BASE (SEED)
-- ==========================================

-- 3.1. Canales
INSERT INTO channels (code, name, description) VALUES
('AZUR', 'Azur', 'Canal principal Azur'),
('LOCAL', 'Local', 'Ventas en oficina'),
('WEB', 'Web', 'Ventas web y referidos')
ON CONFLICT (code) DO NOTHING;

-- 3.2. Categorías
INSERT INTO categories (code, name) VALUES 
('PLAN', 'Planes de Facturación'),
('SIGNATURE', 'Firmas Electrónicas'),
('MODULE', 'Módulos Adicionales')
ON CONFLICT (code) DO NOTHING;

-- 3.3. Productos y Precios (Lógica Compleja)
DO $do$
DECLARE
    cat_plan_id INT;
    cat_sig_id INT;
    cat_mod_id INT;
    chan_azur_id INT;
    chan_local_id INT;
    chan_web_id INT;
    
    -- Variables para Productos
    prod_id UUID;
BEGIN
    -- Get Category IDs
    SELECT id INTO cat_plan_id FROM categories WHERE code = 'PLAN';
    SELECT id INTO cat_sig_id FROM categories WHERE code = 'SIGNATURE';
    SELECT id INTO cat_mod_id FROM categories WHERE code = 'MODULE';

    -- Get Channel IDs
    SELECT id INTO chan_azur_id FROM channels WHERE code = 'AZUR';
    SELECT id INTO chan_local_id FROM channels WHERE code = 'LOCAL';
    SELECT id INTO chan_web_id FROM channels WHERE code = 'WEB';

    --------------------------------------------------------------------------------
    -- PLANES
    --------------------------------------------------------------------------------
    
    -- ESENCIAL (Referencia: Entrada)
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ESENCIAL', 'Plan de entrada anual', cat_plan_id, '{"Comprobantes año": "N/A", "Usuarios": 1, "Puntos de Emisión": 1, "Empresas": 1, "Establecimientos": 1, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": false, "Compras": false, "Retenciones": false, "Guías de Remisión": false, "Liquidación Compras": false, "Cuentas por Cobrar": false, "Cuentas por Pagar": false, "Notas de Débito": false, "Generación ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 5.00, '1 AÑO'), (prod_id, chan_local_id, 5.00, '1 AÑO'), (prod_id, chan_web_id, 5.00, '1 AÑO');

    -- TRANSICIÓN (Referencia: Entrada)
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN TRANSICIÓN', 'Plan mensual flexible', cat_plan_id, '{"Comprobantes mes": "N/A", "Usuarios": 1, "Puntos de Emisión": 1, "Empresas": 1, "Establecimientos": 1, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": false, "Compras": false, "Retenciones": false, "Guías de Remisión": false, "Liquidación Compras": false, "Cuentas por Cobrar": false, "Cuentas por Pagar": false, "Notas de Débito": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 17.00, 'MENSUAL'), (prod_id, chan_local_id, 17.00, 'MENSUAL'), (prod_id, chan_web_id, 17.00, 'MENSUAL');

    -- CONTABLE (Referencia: Entrada)
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN CONTABLE', 'Soluciones para contadores', cat_plan_id, '{"Vigencia": "Variable", "Soporte Técnico": true}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 25.00, '1 MES'), (prod_id, chan_local_id, 25.00, '1 MES'), (prod_id, chan_web_id, 25.00, '1 MES'),
    (prod_id, chan_azur_id, 72.75, '3 MESES'), (prod_id, chan_local_id, 72.75, '3 MESES'), (prod_id, chan_web_id, 72.75, '3 MESES'),
    (prod_id, chan_azur_id, 141.00, '6 MESES'), (prod_id, chan_local_id, 141.00, '6 MESES'), (prod_id, chan_web_id, 141.00, '6 MESES'),
    (prod_id, chan_azur_id, 260.00, '12 MESES'), (prod_id, chan_local_id, 260.00, '12 MESES'), (prod_id, chan_web_id, 260.00, '12 MESES');

    -- CONTABLE PRO (Referencia: Entrada)
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN CONTABLE PRO', 'Soluciones avanzadas para contadores', cat_plan_id, '{"Vigencia": "1 Año", "Soporte Técnico": "Prioritario"}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 421.20, '1 AÑO'), (prod_id, chan_local_id, 421.20, '1 AÑO'), (prod_id, chan_web_id, 421.20, '1 AÑO');

    -- MICRO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN MICRO', 'Ideal para emprendedores', cat_plan_id, '{"Comprobantes año": "30", "Usuarios": 1, "Puntos de Emisión": 1, "Empresas": 1, "Establecimientos": 1, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": false, "Compras": false, "Retenciones": false, "Guías de Remisión": false, "Liquidación Compras": false, "Cuentas por Cobrar": false, "Cuentas por Pagar": false, "Notas de Débito": false, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 13.00, '1 AÑO'), (prod_id, chan_local_id, 13.00, '1 AÑO'), (prod_id, chan_web_id, 13.00, '1 AÑO'),
    (prod_id, chan_azur_id, 24.70, '2 AÑOS'), (prod_id, chan_local_id, 24.70, '2 AÑOS'), (prod_id, chan_web_id, 24.70, '2 AÑOS'),
    (prod_id, chan_azur_id, 35.88, '3 AÑOS'), (prod_id, chan_local_id, 35.88, '3 AÑOS'), (prod_id, chan_web_id, 35.88, '3 AÑOS'),
    (prod_id, chan_azur_id, 46.80, '4 AÑOS'), (prod_id, chan_local_id, 46.80, '4 AÑOS'), (prod_id, chan_web_id, 46.80, '4 AÑOS'),
    (prod_id, chan_azur_id, 57.20, '5 AÑOS'), (prod_id, chan_local_id, 57.20, '5 AÑOS'), (prod_id, chan_web_id, 57.20, '5 AÑOS');

    -- MINI
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN MINI', 'Para pequeños negocios', cat_plan_id, '{"Comprobantes año": "70", "Usuarios": 2, "Puntos de Emisión": 1, "Empresas": 1, "Establecimientos": 1, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": false, "Compras": false, "Retenciones": false, "Guías de Remisión": false, "Liquidación Compras": false, "Cuentas por Cobrar": false, "Cuentas por Pagar": false, "Notas de Débito": false, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 20.00, '1 AÑO'), (prod_id, chan_local_id, 20.00, '1 AÑO'), (prod_id, chan_web_id, 20.00, '1 AÑO'),
    (prod_id, chan_azur_id, 38.00, '2 AÑOS'), (prod_id, chan_local_id, 38.00, '2 AÑOS'), (prod_id, chan_web_id, 38.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 55.20, '3 AÑOS'), (prod_id, chan_local_id, 55.20, '3 AÑOS'), (prod_id, chan_web_id, 55.20, '3 AÑOS'),
    (prod_id, chan_azur_id, 72.00, '4 AÑOS'), (prod_id, chan_local_id, 72.00, '4 AÑOS'), (prod_id, chan_web_id, 72.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 88.00, '5 AÑOS'), (prod_id, chan_local_id, 88.00, '5 AÑOS'), (prod_id, chan_web_id, 88.00, '5 AÑOS');

    -- BÁSICO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN BÁSICO', 'Crecimiento sostenido', cat_plan_id, '{"Comprobantes año": "180", "Usuarios": 3, "Puntos de Emisión": 2, "Empresas": 1, "Establecimientos": 2, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": false, "Compras": false, "Retenciones": false, "Guías de Remisión": false, "Liquidación Compras": false, "Cuentas por Cobrar": false, "Cuentas por Pagar": false, "Notas de Débito": false, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_local_id, 30.00, '1 AÑO'), (prod_id, chan_azur_id, 30.00, '1 AÑO'), (prod_id, chan_web_id, 30.00, '1 AÑO'),
    (prod_id, chan_local_id, 57.00, '2 AÑOS'), (prod_id, chan_azur_id, 57.00, '2 AÑOS'), (prod_id, chan_web_id, 57.00, '2 AÑOS'),
    (prod_id, chan_local_id, 82.80, '3 AÑOS'), (prod_id, chan_azur_id, 82.80, '3 AÑOS'), (prod_id, chan_web_id, 82.80, '3 AÑOS'),
    (prod_id, chan_local_id, 108.00, '4 AÑOS'), (prod_id, chan_azur_id, 108.00, '4 AÑOS'), (prod_id, chan_web_id, 108.00, '4 AÑOS'),
    (prod_id, chan_local_id, 132.00, '5 AÑOS'), (prod_id, chan_azur_id, 132.00, '5 AÑOS'), (prod_id, chan_web_id, 132.00, '5 AÑOS');

    -- ESPECIAL
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ESPECIAL', 'Funcionalidades completas', cat_plan_id, '{"Comprobantes año": "250", "Usuarios": 3, "Puntos de Emisión": 2, "Empresas": 1, "Establecimientos": 2, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": false, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 40.00, '1 AÑO'), (prod_id, chan_local_id, 40.00, '1 AÑO'), (prod_id, chan_web_id, 40.00, '1 AÑO'),
    (prod_id, chan_azur_id, 76.00, '2 AÑOS'), (prod_id, chan_local_id, 76.00, '2 AÑOS'), (prod_id, chan_web_id, 76.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 110.40, '3 AÑOS'), (prod_id, chan_local_id, 110.40, '3 AÑOS'), (prod_id, chan_web_id, 110.40, '3 AÑOS'),
    (prod_id, chan_azur_id, 144.00, '4 AÑOS'), (prod_id, chan_local_id, 144.00, '4 AÑOS'), (prod_id, chan_web_id, 144.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 176.00, '5 AÑOS'), (prod_id, chan_local_id, 176.00, '5 AÑOS'), (prod_id, chan_web_id, 176.00, '5 AÑOS');

    -- BÁSICO II
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN BÁSICO II', 'Más volumen', cat_plan_id, '{"Comprobantes año": "400", "Usuarios": 3, "Puntos de Emisión": 3, "Empresas": 1, "Establecimientos": 2, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 50.00, '1 AÑO'), (prod_id, chan_local_id, 50.00, '1 AÑO'), (prod_id, chan_web_id, 50.00, '1 AÑO'),
    (prod_id, chan_azur_id, 95.00, '2 AÑOS'), (prod_id, chan_local_id, 95.00, '2 AÑOS'), (prod_id, chan_web_id, 95.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 138.00, '3 AÑOS'), (prod_id, chan_local_id, 138.00, '3 AÑOS'), (prod_id, chan_web_id, 138.00, '3 AÑOS'),
    (prod_id, chan_azur_id, 180.00, '4 AÑOS'), (prod_id, chan_local_id, 180.00, '4 AÑOS'), (prod_id, chan_web_id, 180.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 220.00, '5 AÑOS'), (prod_id, chan_local_id, 220.00, '5 AÑOS'), (prod_id, chan_web_id, 220.00, '5 AÑOS');


    -- EXPRESS
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN EXPRESS', 'Alta demanda', cat_plan_id, '{"Comprobantes año": "600", "Usuarios": "∞", "Puntos de Emisión": 3, "Empresas": 1, "Establecimientos": 3, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 70.00, '1 AÑO'), (prod_id, chan_local_id, 70.00, '1 AÑO'), (prod_id, chan_web_id, 70.00, '1 AÑO'),
    (prod_id, chan_azur_id, 133.00, '2 AÑOS'), (prod_id, chan_local_id, 133.00, '2 AÑOS'), (prod_id, chan_web_id, 133.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 193.20, '3 AÑOS'), (prod_id, chan_local_id, 193.20, '3 AÑOS'), (prod_id, chan_web_id, 193.20, '3 AÑOS'),
    (prod_id, chan_azur_id, 252.00, '4 AÑOS'), (prod_id, chan_local_id, 252.00, '4 AÑOS'), (prod_id, chan_web_id, 252.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 308.00, '5 AÑOS'), (prod_id, chan_local_id, 308.00, '5 AÑOS'), (prod_id, chan_web_id, 308.00, '5 AÑOS');

    -- EXPRESS II
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN EXPRESS II', 'Alta demanda II', cat_plan_id, '{"Comprobantes año": "850", "Usuarios": "∞", "Puntos de Emisión": 5, "Empresas": 1, "Establecimientos": 3, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 100.00, '1 AÑO'), (prod_id, chan_local_id, 100.00, '1 AÑO'), (prod_id, chan_web_id, 100.00, '1 AÑO'),
    (prod_id, chan_azur_id, 190.00, '2 AÑOS'), (prod_id, chan_local_id, 190.00, '2 AÑOS'), (prod_id, chan_web_id, 190.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 276.00, '3 AÑOS'), (prod_id, chan_local_id, 276.00, '3 AÑOS'), (prod_id, chan_web_id, 276.00, '3 AÑOS'),
    (prod_id, chan_azur_id, 360.00, '4 AÑOS'), (prod_id, chan_local_id, 360.00, '4 AÑOS'), (prod_id, chan_web_id, 360.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 440.00, '5 AÑOS'), (prod_id, chan_local_id, 440.00, '5 AÑOS'), (prod_id, chan_web_id, 440.00, '5 AÑOS');

    -- ESPECIAL II
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ESPECIAL II', 'Completo y potente', cat_plan_id, '{"Comprobantes año": "1250", "Usuarios": "∞", "Puntos de Emisión": 5, "Empresas": 1, "Establecimientos": 3, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 120.00, '1 AÑO'), (prod_id, chan_local_id, 120.00, '1 AÑO'), (prod_id, chan_web_id, 120.00, '1 AÑO'),
    (prod_id, chan_azur_id, 228.00, '2 AÑOS'), (prod_id, chan_local_id, 228.00, '2 AÑOS'), (prod_id, chan_web_id, 228.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 331.20, '3 AÑOS'), (prod_id, chan_local_id, 331.20, '3 AÑOS'), (prod_id, chan_web_id, 331.20, '3 AÑOS'),
    (prod_id, chan_azur_id, 432.00, '4 AÑOS'), (prod_id, chan_local_id, 432.00, '4 AÑOS'), (prod_id, chan_web_id, 432.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 528.00, '5 AÑOS'), (prod_id, chan_local_id, 528.00, '5 AÑOS'), (prod_id, chan_web_id, 528.00, '5 AÑOS');

    -- ILIMITADO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ILIMITADO', 'Sin límites', cat_plan_id, '{"Comprobantes año": "15000", "Usuarios": "∞", "Puntos de Emisión": 10, "Empresas": 1, "Establecimientos": 4, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": false}') RETURNING id INTO prod_id;
    
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 150.00, '1 AÑO'), (prod_id, chan_local_id, 150.00, '1 AÑO'), (prod_id, chan_web_id, 150.00, '1 AÑO'),
    (prod_id, chan_azur_id, 285.00, '2 AÑOS'), (prod_id, chan_local_id, 285.00, '2 AÑOS'), (prod_id, chan_web_id, 285.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 414.00, '3 AÑOS'), (prod_id, chan_local_id, 414.00, '3 AÑOS'), (prod_id, chan_web_id, 414.00, '3 AÑOS'),
    (prod_id, chan_azur_id, 540.00, '4 AÑOS'), (prod_id, chan_local_id, 540.00, '4 AÑOS'), (prod_id, chan_web_id, 540.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 660.00, '5 AÑOS'), (prod_id, chan_local_id, 660.00, '5 AÑOS'), (prod_id, chan_web_id, 660.00, '5 AÑOS');

    -- ILIMITADO PLUS
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ILIMITADO PLUS', 'Más capacidad', cat_plan_id, '{"Comprobantes año": "15000", "Usuarios": "∞", "Puntos de Emisión": 10, "Empresas": 2, "Establecimientos": 4, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": true}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 200.00, '1 AÑO'), (prod_id, chan_local_id, 200.00, '1 AÑO'), (prod_id, chan_web_id, 200.00, '1 AÑO'),
    (prod_id, chan_azur_id, 380.00, '2 AÑOS'), (prod_id, chan_local_id, 380.00, '2 AÑOS'), (prod_id, chan_web_id, 380.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 552.00, '3 AÑOS'), (prod_id, chan_local_id, 552.00, '3 AÑOS'), (prod_id, chan_web_id, 552.00, '3 AÑOS'),
    (prod_id, chan_azur_id, 720.00, '4 AÑOS'), (prod_id, chan_local_id, 720.00, '4 AÑOS'), (prod_id, chan_web_id, 720.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 880.00, '5 AÑOS'), (prod_id, chan_local_id, 880.00, '5 AÑOS'), (prod_id, chan_web_id, 880.00, '5 AÑOS');

    -- ILIMITADO PRO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ILIMITADO PRO', 'Máxima potencia', cat_plan_id, '{"Comprobantes año": "15000", "Usuarios": "∞", "Puntos de Emisión": 10, "Empresas": 3, "Establecimientos": 5, "Inventario": true, "Proformas": true, "Soporte Técnico": true, "Portal Clientes": true, "SMTP Propio": true, "Compras": true, "Retenciones": true, "Guías de Remisión": true, "Liquidación Compras": true, "Cuentas por Cobrar": true, "Cuentas por Pagar": true, "Notas de Débito": true, "Generación ATS": true}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 250.00, '1 AÑO'), (prod_id, chan_local_id, 250.00, '1 AÑO'), (prod_id, chan_web_id, 250.00, '1 AÑO'),
    (prod_id, chan_azur_id, 475.00, '2 AÑOS'), (prod_id, chan_local_id, 475.00, '2 AÑOS'), (prod_id, chan_web_id, 475.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 690.00, '3 AÑOS'), (prod_id, chan_local_id, 690.00, '3 AÑOS'), (prod_id, chan_web_id, 690.00, '3 AÑOS'),
    (prod_id, chan_azur_id, 900.00, '4 AÑOS'), (prod_id, chan_local_id, 900.00, '4 AÑOS'), (prod_id, chan_web_id, 900.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 1100.00, '5 AÑOS'), (prod_id, chan_local_id, 1100.00, '5 AÑOS'), (prod_id, chan_web_id, 1100.00, '5 AÑOS');

    --------------------------------------------------------------------------------
    -- FIRMAS
    --------------------------------------------------------------------------------
    
    -- Firma P. Natural (Cédula)
    INSERT INTO products (name, description, category_id) VALUES ('Firma P. Natural (Cédula)', 'Archivo .p12', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '7 DÍAS', 8.00, 8.00), (prod_id, chan_web_id, '7 DÍAS', 8.00, 8.00),
    (prod_id, chan_azur_id, '30 DÍAS', 10.69, 10.69), (prod_id, chan_web_id, '30 DÍAS', 10.69, 10.69),
    (prod_id, chan_azur_id, '1 AÑO', 19.13, 16.26), (prod_id, chan_web_id, '1 AÑO', 19.13, 16.26),
    (prod_id, chan_azur_id, '2 AÑOS', 29.13, 24.76), (prod_id, chan_web_id, '2 AÑOS', 29.13, 24.76),
    (prod_id, chan_azur_id, '3 AÑOS', 39.57, 33.63), (prod_id, chan_web_id, '3 AÑOS', 39.57, 33.63),
    (prod_id, chan_azur_id, '4 AÑOS', 50.00, 42.50), (prod_id, chan_web_id, '4 AÑOS', 50.00, 42.50),
    (prod_id, chan_azur_id, '5 AÑOS', 60.00, 51.00), (prod_id, chan_web_id, '5 AÑOS', 60.00, 51.00);
    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '7 DÍAS', 6.99, 6.99),
    (prod_id, chan_local_id, '30 DÍAS', 7.99, 7.99),
    (prod_id, chan_local_id, '1 AÑO', 18.00, 15.30),
    (prod_id, chan_local_id, '2 AÑOS', 28.00, 23.80),
    (prod_id, chan_local_id, '3 AÑOS', 37.00, 31.45),
    (prod_id, chan_local_id, '4 AÑOS', 46.00, 39.10),
    (prod_id, chan_local_id, '5 AÑOS', 54.00, 45.90);

    -- Firma P. Jurídica (Empresa)
    INSERT INTO products (name, description, category_id) VALUES ('Firma P. Jurídica (Empresa)', 'Archivo .p12 para Representante Legal', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 21.74, 18.48), (prod_id, chan_web_id, '1 AÑO', 21.74, 18.48),
    (prod_id, chan_azur_id, '2 AÑOS', 31.30, 26.61), (prod_id, chan_web_id, '2 AÑOS', 31.30, 26.61),
    (prod_id, chan_azur_id, '3 AÑOS', 41.74, 35.48), (prod_id, chan_web_id, '3 AÑOS', 41.74, 35.48),
    (prod_id, chan_azur_id, '4 AÑOS', 52.17, 44.34), (prod_id, chan_web_id, '4 AÑOS', 52.17, 44.34),
    (prod_id, chan_azur_id, '5 AÑOS', 61.74, 52.48), (prod_id, chan_web_id, '5 AÑOS', 61.74, 52.48);
    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 18.00, 15.30),
    (prod_id, chan_local_id, '2 AÑOS', 28.00, 23.80),
    (prod_id, chan_local_id, '3 AÑOS', 37.00, 31.45),
    (prod_id, chan_local_id, '4 AÑOS', 46.00, 39.10),
    (prod_id, chan_local_id, '5 AÑOS', 54.00, 45.90);

     -- Firma en Token (Persona Natural)
    INSERT INTO products (name, description, category_id) VALUES ('Firma en Token (Persona Natural)', 'Token USB Físico', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 37.00, 31.45), (prod_id, chan_web_id, '1 AÑO', 37.00, 31.45),
    (prod_id, chan_azur_id, '2 AÑOS', 45.00, 38.25), (prod_id, chan_web_id, '2 AÑOS', 45.00, 38.25),
    (prod_id, chan_azur_id, '3 AÑOS', 58.00, 49.30), (prod_id, chan_web_id, '3 AÑOS', 58.00, 49.30),
    (prod_id, chan_azur_id, '4 AÑOS', 71.00, 60.35), (prod_id, chan_web_id, '4 AÑOS', 71.00, 60.35),
    (prod_id, chan_azur_id, '5 AÑOS', 81.00, 68.85), (prod_id, chan_web_id, '5 AÑOS', 81.00, 68.85);

    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 32.14, 27.32),
    (prod_id, chan_local_id, '2 AÑOS', 41.07, 34.91),
    (prod_id, chan_local_id, '3 AÑOS', 52.68, 44.78),
    (prod_id, chan_local_id, '4 AÑOS', 65.18, 55.40),
    (prod_id, chan_local_id, '5 AÑOS', 79.02, 67.17);

    -- Firma Token (Persona Jurídica)
    INSERT INTO products (name, description, category_id) VALUES ('Firma Token (Persona Jurídica)', 'Token USB Físico para Empresas', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 37.00, 31.45), (prod_id, chan_web_id, '1 AÑO', 37.00, 31.45),
    (prod_id, chan_azur_id, '2 AÑOS', 45.00, 38.25), (prod_id, chan_web_id, '2 AÑOS', 45.00, 38.25),
    (prod_id, chan_azur_id, '3 AÑOS', 58.00, 49.30), (prod_id, chan_web_id, '3 AÑOS', 58.00, 49.30),
    (prod_id, chan_azur_id, '4 AÑOS', 71.00, 60.35), (prod_id, chan_web_id, '4 AÑOS', 71.00, 60.35),
    (prod_id, chan_azur_id, '5 AÑOS', 81.00, 68.85), (prod_id, chan_web_id, '5 AÑOS', 81.00, 68.85);

    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 32.14, 27.32),
    (prod_id, chan_local_id, '2 AÑOS', 41.07, 34.91),
    (prod_id, chan_local_id, '3 AÑOS', 52.68, 44.78),
    (prod_id, chan_local_id, '4 AÑOS', 65.18, 55.40),
    (prod_id, chan_local_id, '5 AÑOS', 79.02, 67.17);

    --------------------------------------------------------------------------------
    -- MÓDULOS
    --------------------------------------------------------------------------------
    
    INSERT INTO products (name, description, category_id) VALUES ('Usuario adicional (Anual)', 'Acceso para un usuario extra', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 15.00, '1 AÑO'), (prod_id, chan_local_id, 15.00, '1 AÑO'), (prod_id, chan_web_id, 15.00, '1 AÑO');

    INSERT INTO products (name, description, category_id) VALUES ('Usuario Adic. (Contable - Mensual)', 'Exclusivo Plan Contable', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 10.00, '1 MES'), (prod_id, chan_local_id, 10.00, '1 MES'), (prod_id, chan_web_id, 10.00, '1 MES');

    INSERT INTO products (name, description, category_id) VALUES ('Usuario Adic. (Contable - Anual)', 'Exclusivo Plan Contable', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 120.00, '1 AÑO'), (prod_id, chan_local_id, 120.00, '1 AÑO'), (prod_id, chan_web_id, 120.00, '1 AÑO');

    INSERT INTO products (name, description, category_id) VALUES ('Punto de venta', 'Módulo POS Factu', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 40.00, '1 AÑO'), (prod_id, chan_local_id, 40.00, '1 AÑO'), (prod_id, chan_web_id, 40.00, '1 AÑO');

    INSERT INTO products (name, description, category_id) VALUES ('Empresa adicional', 'Manejo de otro RUC', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 60.00, '1 AÑO'), (prod_id, chan_local_id, 60.00, '1 AÑO'), (prod_id, chan_web_id, 60.00, '1 AÑO');

    INSERT INTO products (name, description, category_id) VALUES ('Establecimiento Adicional', 'Sucursal extra', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 25.00, '1 AÑO'), (prod_id, chan_local_id, 25.00, '1 AÑO'), (prod_id, chan_web_id, 25.00, '1 AÑO');

    INSERT INTO products (name, description, category_id) VALUES ('Generación de ATS', 'Anexo Transaccional', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 15.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 15.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 15.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Compras con ATS', 'Módulo Compras + ATS', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 25.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 25.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 25.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Compras sin ATS', 'Solo Módulo Compras', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 10.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 10.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 10.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Módulo Documentos Recibidos', 'Gestión de XML recibidos', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 40.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 40.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 40.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Factura Recurrente', 'Emisión automática', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 30.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 30.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 30.00, 'PAGO ÚNICO');

    -- Importación
    INSERT INTO products (name, description, category_id) VALUES ('Importar factura unitaria', 'Módulo de importación', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 20.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Importar guía unitaria', 'Módulo de importación', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 20.00, 'PAGO ÚNICO');

    INSERT INTO products (name, description, category_id) VALUES ('Importar factura masiva', 'Módulo de importación', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_local_id, 20.00, 'PAGO ÚNICO'), (prod_id, chan_web_id, 20.00, 'PAGO ÚNICO');

    -- Plan Integración (Base $100 / 2000 docs) se maneja con lógica especial, pero lo agregamos como referencia
    INSERT INTO products (name, description, category_id) VALUES ('Plan Integración (Base)', 'Incluye 2000 documentos', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 100.00, '1 AÑO'), (prod_id, chan_local_id, 100.00, '1 AÑO'), (prod_id, chan_web_id, 100.00, '1 AÑO');

END $do$;

-- ==========================================
-- 4. INSERCIÓN DE PAQUETES DE INTEGRACIÓN (STATIC)
-- ==========================================

-- API REST
INSERT INTO integration_packages (type, quantity, price) VALUES 
('API', 5000, 59.00), ('API', 10000, 118.00), ('API', 20000, 236.00),
('API', 30000, 354.00), ('API', 40000, 472.00), ('API', 50000, 590.00),
('API', 60000, 708.00), ('API', 70000, 826.00), ('API', 80000, 944.00),
('API', 90000, 1062.00), ('API', 100000, 1180.00), ('API', 110000, 1300.00),
('API', 120000, 1420.00), ('API', 130000, 1540.00), ('API', 140000, 1660.00),
('API', 150000, 1780.00), ('API', 160000, 1900.00), ('API', 170000, 2020.00),
('API', 180000, 2140.00);

-- USO WEB
INSERT INTO integration_packages (type, quantity, price) VALUES 
('WEB', 500, 10.00), ('WEB', 1000, 20.00), ('WEB', 2000, 36.00),
('WEB', 5000, 59.00), ('WEB', 10000, 118.00), ('WEB', 20000, 236.00),
('WEB', 30000, 354.00), ('WEB', 40000, 472.00), ('WEB', 50000, 590.00),
('WEB', 100000, 1180.00), ('WEB', 150000, 1770.00), ('WEB', 180000, 1800.00),
('WEB', 200000, 2000.00), ('WEB', 300000, 3000.00), ('WEB', 500000, 5000.00);
