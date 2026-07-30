-- ==============================================================================
-- MIGRACIÓN 03: Actualización de Características de Planes y Módulos Adicionales
-- Matriz Oficial Azur
-- ==============================================================================

DO $$
DECLARE
    cat_mod_id INT;
    chan_azur_id INT;
    chan_local_id INT;
    new_prod_id UUID;
BEGIN
    -- 1. Actualizar características (features JSONB) en productos tipo 'PLAN'

    -- PLAN MICRO
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(features, '{Inventario}', 'false'::jsonb), '{Proformas}', 'false'::jsonb)
    WHERE name = 'PLAN MICRO';

    -- PLAN MINI (Proformas es TRUE según la matriz)
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(features, '{Proformas}', 'true'::jsonb), '{Inventario}', 'true'::jsonb)
    WHERE name = 'PLAN MINI';

    -- PLAN ESPECIAL
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(features, '{API REST}', 'true'::jsonb), '{Reportes}', 'true'::jsonb)
    WHERE name = 'PLAN ESPECIAL';

    -- PLAN BÁSICO II
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(features, '{API REST}', 'true'::jsonb), '{Reportes}', 'true'::jsonb)
    WHERE name = 'PLAN BÁSICO II';

    -- PLAN EXPRESS
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(jsonb_set(features, '{Usuarios}', '5'::jsonb), '{API REST}', 'true'::jsonb), '{Reportes}', 'true'::jsonb)
    WHERE name = 'PLAN EXPRESS';

    -- PLAN EXPRESS II
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(jsonb_set(features, '{Comprobantes año}', '"900"'::jsonb), '{Usuarios}', '5'::jsonb), '{API REST}', 'true'::jsonb)
    WHERE name = 'PLAN EXPRESS II';

    -- PLAN ESPECIAL II
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(features, '{Usuarios}', '5'::jsonb), '{API REST}', 'true'::jsonb)
    WHERE name = 'PLAN ESPECIAL II';

    -- PLAN ILIMITADO (ATS es TRUE según la matriz)
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(jsonb_set(jsonb_set(features, '{Comprobantes año}', '"Ilimitado"'::jsonb), '{Usuarios}', '5'::jsonb), '{Establecimientos}', '3'::jsonb), '{ATS}', 'true'::jsonb)
    WHERE name = 'PLAN ILIMITADO';

    -- PLAN ILIMITADO PLUS
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(jsonb_set(jsonb_set(features, '{Comprobantes año}', '"Ilimitado"'::jsonb), '{Usuarios}', '5'::jsonb), '{Establecimientos}', '3'::jsonb), '{ATS}', 'true'::jsonb)
    WHERE name = 'PLAN ILIMITADO PLUS';

    -- PLAN ILIMITADO PRO
    UPDATE public.products 
    SET features = jsonb_set(jsonb_set(jsonb_set(jsonb_set(features, '{Comprobantes año}', '"Ilimitado"'::jsonb), '{Usuarios}', '5'::jsonb), '{Establecimientos}', '3'::jsonb), '{ATS}', 'true'::jsonb)
    WHERE name = 'PLAN ILIMITADO PRO';

    -- 2. Insertar Módulo de Usuario Adicional para Planes Ilimitados ($30/año)
    SELECT id INTO cat_mod_id FROM public.categories WHERE code = 'MODULE';
    SELECT id INTO chan_azur_id FROM public.channels WHERE code = 'AZUR';
    SELECT id INTO chan_local_id FROM public.channels WHERE code = 'LOCAL';

    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Usuario Adicional (Planes Ilimitados)') THEN
        INSERT INTO public.products (name, description, category_id)
        VALUES ('Usuario Adicional (Planes Ilimitados)', 'Acceso para un usuario extra en planes Ilimitados', cat_mod_id)
        RETURNING id INTO new_prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES (new_prod_id, chan_azur_id, 30.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES (new_prod_id, chan_local_id, 30.00, '1 AÑO');
        END IF;
    END IF;

END $$;
