-- A. Insertar Estructura Base
INSERT INTO public.channels (code, name) VALUES 
('AZUR', 'Canal Azur'), ('LOCAL', 'Canal Local'), ('WEB', 'Canal Web');

INSERT INTO public.categories (code, name) VALUES 
('PLAN', 'Plan de Facturación'), 
('SIGNATURE', 'Firma Electrónica'), 
('MODULE', 'Módulo Adicional'),
('INTEGRATION', 'Integración y API');

-- B. Insertar PLAN BASE DE INTEGRACIÓN ($100 / 2000 docs)
DO $$
DECLARE 
    cat_int INT;
    chan_azur INT;
    prod_id UUID;
BEGIN
    SELECT id INTO cat_int FROM public.categories WHERE code = 'INTEGRATION';
    SELECT id INTO chan_azur FROM public.channels WHERE code = 'AZUR';

    -- Producto Base
    INSERT INTO public.products (category_id, name, features)
    VALUES (cat_int, 'Plan Integración (Base)', '{"comprobantes": 2000, "tipo": "base"}'::JSONB)
    RETURNING id INTO prod_id;

    -- Precio Base
    INSERT INTO public.prices (product_id, channel_id, duration_label, price)
    VALUES (prod_id, chan_azur, '1 AÑO', 100.00);
END $$;

-- C. Insertar Paquetes Adicionales (Datos del Excel)
INSERT INTO public.integration_packages (type, quantity, price) VALUES
-- API REST
('API', 5000, 59.00), ('API', 10000, 118.00), ('API', 20000, 236.00),
('API', 30000, 354.00), ('API', 40000, 472.00), ('API', 50000, 590.00),
('API', 60000, 708.00), ('API', 70000, 826.00), ('API', 80000, 944.00),
('API', 90000, 1062.00), ('API', 100000, 1180.00), ('API', 110000, 1300.00),
('API', 120000, 1420.00), ('API', 130000, 1540.00), ('API', 140000, 1660.00),
('API', 150000, 1780.00), ('API', 160000, 1900.00), ('API', 170000, 2020.00),
('API', 180000, 2140.00),
-- USO WEB
('WEB', 500, 10.00), ('WEB', 1000, 20.00), ('WEB', 2000, 36.00),
('WEB', 5000, 59.00), ('WEB', 10000, 118.00), ('WEB', 20000, 236.00),
('WEB', 30000, 354.00), ('WEB', 40000, 472.00), ('WEB', 50000, 590.00),
('WEB', 100000, 1180.00), ('WEB', 150000, 1770.00), ('WEB', 180000, 1800.00),
('WEB', 200000, 2000.00), ('WEB', 300000, 3000.00), ('WEB', 500000, 5000.00);
