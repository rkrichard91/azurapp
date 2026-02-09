-- Limpiar datos existentes (Opcional, usar con cuidado en producción)
TRUNCATE products, prices RESTART IDENTITY CASCADE;

-- 1. Insertar Categorías (Si no existen)
INSERT INTO categories (code, name) VALUES 
('PLAN', 'Planes de Facturación'),
('SIGNATURE', 'Firmas Electrónicas'),
('MODULE', 'Módulos Adicionales')
ON CONFLICT (code) DO NOTHING;

-- 2. Obtener IDs de Categorías y Canales
DO $$
DECLARE
    cat_plan_id UUID;
    cat_sig_id UUID;
    cat_mod_id UUID;
    chan_azur_id UUID;
    chan_local_id UUID;
    chan_web_id UUID;
    
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
    -- PLANES (Precios compartidos, Features específicos)
    --------------------------------------------------------------------------------
    
    -- Helper para insertar plan
    -- MICRO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN MICRO', 'Ideal para emprendedores', cat_plan_id, '{"Comprobantes año": "30", "Soporte": true, "Facturas": true, "Retenciones": false, "Notas de crédito": true, "Notas de débito": false, "Guías de remisión": false, "Liquidación compras": false, "Proforma": true, "Usuarios": "1", "Empresas": "1", "Establecimientos": "1", "Puntos de Emisión": "1", "Inventario": true, "Reportes": true, "Compras": false, "Cuentas por cobrar": false, "Cuentas por pagar": false, "SMTP propio": false, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    -- Precios Micro (Compartidos)
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 13.00, '1 AÑO'), (prod_id, chan_local_id, 13.00, '1 AÑO'), (prod_id, chan_web_id, 13.00, '1 AÑO'),
    (prod_id, chan_azur_id, 24.70, '2 AÑOS'), (prod_id, chan_local_id, 24.70, '2 AÑOS'), (prod_id, chan_web_id, 24.70, '2 AÑOS'),
    (prod_id, chan_azur_id, 35.88, '3 AÑOS'), (prod_id, chan_local_id, 35.88, '3 AÑOS'), (prod_id, chan_web_id, 35.88, '3 AÑOS'),
    (prod_id, chan_azur_id, 46.80, '4 AÑOS'), (prod_id, chan_local_id, 46.80, '4 AÑOS'), (prod_id, chan_web_id, 46.80, '4 AÑOS'),
    (prod_id, chan_azur_id, 57.20, '5 AÑOS'), (prod_id, chan_local_id, 57.20, '5 AÑOS'), (prod_id, chan_web_id, 57.20, '5 AÑOS');

    -- MINI
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN MINI', 'Para pequeños negocios', cat_plan_id, '{"Comprobantes año": "70", "Soporte": true, "Facturas": true, "Retenciones": false, "Notas de crédito": true, "Notas de débito": false, "Guías de remisión": false, "Liquidación compras": false, "Proforma": true, "Usuarios": "2", "Empresas": "1", "Establecimientos": "1", "Puntos de Emisión": "1", "Inventario": true, "Reportes": true, "Compras": false, "Cuentas por cobrar": false, "Cuentas por pagar": false, "SMTP propio": false, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_azur_id, 20.00, '1 AÑO'), (prod_id, chan_local_id, 20.00, '1 AÑO'), (prod_id, chan_web_id, 20.00, '1 AÑO'),
    (prod_id, chan_azur_id, 38.00, '2 AÑOS'), (prod_id, chan_local_id, 38.00, '2 AÑOS'), (prod_id, chan_web_id, 38.00, '2 AÑOS'),
    (prod_id, chan_azur_id, 55.20, '3 AÑOS'), (prod_id, chan_local_id, 55.20, '3 AÑOS'), (prod_id, chan_web_id, 55.20, '3 AÑOS'),
    (prod_id, chan_azur_id, 72.00, '4 AÑOS'), (prod_id, chan_local_id, 72.00, '4 AÑOS'), (prod_id, chan_web_id, 72.00, '4 AÑOS'),
    (prod_id, chan_azur_id, 88.00, '5 AÑOS'), (prod_id, chan_local_id, 88.00, '5 AÑOS'), (prod_id, chan_web_id, 88.00, '5 AÑOS');

    -- BÁSICO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN BÁSICO', 'Crecimiento sostenido', cat_plan_id, '{"Comprobantes año": "180", "Soporte": true, "Facturas": true, "Retenciones": false, "Notas de crédito": true, "Notas de débito": false, "Guías de remisión": false, "Liquidación compras": false, "Proforma": true, "Usuarios": "3", "Empresas": "1", "Establecimientos": "2", "Puntos de Emisión": "2", "Inventario": true, "Reportes": true, "Compras": false, "Cuentas por cobrar": false, "Cuentas por pagar": false, "SMTP propio": false, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES 
    (prod_id, chan_local_id, 30.00, '1 AÑO'), (prod_id, chan_azur_id, 30.00, '1 AÑO'), (prod_id, chan_web_id, 30.00, '1 AÑO'),
    (prod_id, chan_local_id, 57.00, '2 AÑOS'), (prod_id, chan_azur_id, 57.00, '2 AÑOS'), (prod_id, chan_web_id, 57.00, '2 AÑOS');

    -- ESPECIAL
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ESPECIAL', 'Funcionalidades completas', cat_plan_id, '{"Comprobantes año": "250", "Soporte": true, "Facturas": true, "Retenciones": true, "Notas de crédito": true, "Notas de débito": true, "Guías de remisión": true, "Liquidación compras": true, "Proforma": true, "Usuarios": "3", "Empresas": "1", "Establecimientos": "2", "Puntos de Emisión": "2", "Inventario": true, "Reportes": true, "Compras": true, "Cuentas por cobrar": true, "Cuentas por pagar": false, "SMTP propio": true, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 40.00, '1 AÑO'), (prod_id, chan_local_id, 40.00, '1 AÑO'), (prod_id, chan_web_id, 40.00, '1 AÑO');

    -- BÁSICO II
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN BÁSICO II', 'Más volumen', cat_plan_id, '{"Comprobantes año": "400", "Soporte": true, "Facturas": true, "Retenciones": true, "Notas de crédito": true, "Notas de débito": true, "Guías de remisión": true, "Liquidación compras": true, "Proforma": true, "Usuarios": "3", "Empresas": "1", "Establecimientos": "2", "Puntos de Emisión": "3", "Inventario": true, "Reportes": true, "Compras": true, "Cuentas por cobrar": true, "Cuentas por pagar": true, "SMTP propio": true, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 50.00, '1 AÑO'), (prod_id, chan_local_id, 50.00, '1 AÑO'), (prod_id, chan_web_id, 50.00, '1 AÑO');

    -- EXPRESS
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN EXPRESS', 'Alta demanda', cat_plan_id, '{"Comprobantes año": "600", "Soporte": true, "Facturas": true, "Retenciones": true, "Notas de crédito": true, "Notas de débito": true, "Guías de remisión": true, "Liquidación compras": true, "Proforma": true, "Usuarios": "∞", "Empresas": "1", "Establecimientos": "3", "Puntos de Emisión": "3", "Inventario": true, "Reportes": true, "Compras": true, "Cuentas por cobrar": true, "Cuentas por pagar": true, "SMTP propio": true, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 70.00, '1 AÑO'), (prod_id, chan_local_id, 70.00, '1 AÑO'), (prod_id, chan_web_id, 70.00, '1 AÑO');

    -- ILIMITADO
    INSERT INTO products (name, description, category_id, features) VALUES 
    ('PLAN ILIMITADO', 'Sin límites', cat_plan_id, '{"Comprobantes año": "15000", "Soporte": true, "Facturas": true, "Retenciones": true, "Notas de crédito": true, "Notas de débito": true, "Guías de remisión": true, "Liquidación compras": true, "Proforma": true, "Usuarios": "∞", "Empresas": "1", "Establecimientos": "4", "Puntos de Emisión": "10", "Inventario": true, "Reportes": true, "Compras": true, "Cuentas por cobrar": true, "Cuentas por pagar": true, "SMTP propio": true, "Portal documentación": true, "ATS": false}') RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price, duration_label) VALUES (prod_id, chan_azur_id, 150.00, '1 AÑO'), (prod_id, chan_local_id, 150.00, '1 AÑO'), (prod_id, chan_web_id, 150.00, '1 AÑO');

    --------------------------------------------------------------------------------
    -- FIRMAS (Precios diferenciados por Canal y Renovación)
    --------------------------------------------------------------------------------
    
    -- Firma P. Natural (Cédula)
    INSERT INTO products (name, description, category_id) VALUES ('Firma P. Natural (Cédula)', 'Archivo .p12', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 19.13, 16.26), (prod_id, chan_web_id, '1 AÑO', 19.13, 16.26),
    (prod_id, chan_azur_id, '2 AÑOS', 29.13, 24.76), (prod_id, chan_web_id, '2 AÑOS', 29.13, 24.76);
    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 18.00, 15.30),
    (prod_id, chan_local_id, '2 AÑOS', 28.00, 23.80);

    -- Firma P. Jurídica (Empresa)
    INSERT INTO products (name, description, category_id) VALUES ('Firma P. Jurídica (Empresa)', 'Archivo .p12 para Representante Legal', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 21.74, 18.48), (prod_id, chan_web_id, '1 AÑO', 21.74, 18.48),
    (prod_id, chan_azur_id, '2 AÑOS', 31.30, 26.61), (prod_id, chan_web_id, '2 AÑOS', 31.30, 26.61);
    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 18.00, 15.30),
    (prod_id, chan_local_id, '2 AÑOS', 28.00, 23.80);

     -- Firma en Token (Persona Natural)
    INSERT INTO products (name, description, category_id) VALUES ('Firma en Token (Persona Natural)', 'Token USB Físico', cat_sig_id) RETURNING id INTO prod_id;
    -- AZUR / WEB
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_azur_id, '1 AÑO', 37.00, 31.45), (prod_id, chan_web_id, '1 AÑO', 37.00, 31.45),
    (prod_id, chan_azur_id, '2 AÑOS', 45.00, 38.25), (prod_id, chan_web_id, '2 AÑOS', 45.00, 38.25);
    -- LOCAL
    INSERT INTO prices (product_id, channel_id, duration_label, price, renewal_price) VALUES
    (prod_id, chan_local_id, '1 AÑO', 32.14, 27.32),
    (prod_id, chan_local_id, '2 AÑOS', 41.07, 34.91);

    --------------------------------------------------------------------------------
    -- MÓDULOS (Precios compartidos)
    --------------------------------------------------------------------------------
    
    INSERT INTO products (name, description, category_id) VALUES ('Usuario adicional (Anual)', 'Acceso para un usuario extra', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price) VALUES (prod_id, chan_azur_id, 15.00), (prod_id, chan_local_id, 15.00), (prod_id, chan_web_id, 15.00);

    INSERT INTO products (name, description, category_id) VALUES ('Punto de venta', 'Módulo POS Factu', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price) VALUES (prod_id, chan_azur_id, 40.00), (prod_id, chan_local_id, 40.00), (prod_id, chan_web_id, 40.00);

    INSERT INTO products (name, description, category_id) VALUES ('Empresa adicional', 'Manejo de otro RUC', cat_mod_id) RETURNING id INTO prod_id;
    INSERT INTO prices (product_id, channel_id, price) VALUES (prod_id, chan_azur_id, 60.00), (prod_id, chan_local_id, 60.00), (prod_id, chan_web_id, 60.00);

END $$;
