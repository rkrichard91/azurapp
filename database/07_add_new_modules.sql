-- ==============================================================================
-- MIGRACIÓN 07: Incorporación de Nuevos Módulos Adicionales (Cobranzas, Gestión Comercial, Médico)
-- Precios Anuales
-- ==============================================================================

-- 1. Insertar Módulo de Cobranzas si no existe
INSERT INTO public.products (category_id, name, description, is_active)
SELECT id, 'Módulo de Cobranzas', 'Gestión, control y seguimiento de cobranzas', true
FROM public.categories WHERE code = 'MODULE'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Módulo de Cobranzas');

-- 2. Insertar Módulo de Gestión Comercial si no existe
INSERT INTO public.products (category_id, name, description, is_active)
SELECT id, 'Módulo de Gestión Comercial', 'Administración y control de gestión comercial y ventas', true
FROM public.categories WHERE code = 'MODULE'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Módulo de Gestión Comercial');

-- 3. Insertar Módulo Médico si no existe
INSERT INTO public.products (category_id, name, description, is_active)
SELECT id, 'Módulo Médico', 'Gestión médica: 1 doc $150 c/u; 2 a 5 docs $80 c/u; 6 a 15 docs $51 c/u; 16+ docs $40 c/u', true
FROM public.categories WHERE code = 'MODULE'
AND NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Módulo Médico');

-- 4. Insertar Precios si no existen (AZUR y LOCAL)
-- Módulo de Cobranzas ($80.00 / 1 AÑO)
INSERT INTO public.prices (product_id, channel_id, price, duration_label)
SELECT p.id, c.id, 80.00, '1 AÑO'
FROM public.products p, public.channels c
WHERE p.name = 'Módulo de Cobranzas' AND c.code IN ('AZUR', 'LOCAL')
AND NOT EXISTS (
    SELECT 1 FROM public.prices pr 
    WHERE pr.product_id = p.id AND pr.channel_id = c.id AND pr.duration_label = '1 AÑO'
);

-- Módulo de Gestión Comercial ($100.00 / 1 AÑO)
INSERT INTO public.prices (product_id, channel_id, price, duration_label)
SELECT p.id, c.id, 100.00, '1 AÑO'
FROM public.products p, public.channels c
WHERE p.name = 'Módulo de Gestión Comercial' AND c.code IN ('AZUR', 'LOCAL')
AND NOT EXISTS (
    SELECT 1 FROM public.prices pr 
    WHERE pr.product_id = p.id AND pr.channel_id = c.id AND pr.duration_label = '1 AÑO'
);

-- Módulo Médico ($150.00 / 1 AÑO)
INSERT INTO public.prices (product_id, channel_id, price, duration_label)
SELECT p.id, c.id, 150.00, '1 AÑO'
FROM public.products p, public.channels c
WHERE p.name = 'Módulo Médico' AND c.code IN ('AZUR', 'LOCAL')
AND NOT EXISTS (
    SELECT 1 FROM public.prices pr 
    WHERE pr.product_id = p.id AND pr.channel_id = c.id AND pr.duration_label = '1 AÑO'
);



