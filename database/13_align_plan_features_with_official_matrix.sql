-- ==============================================================================
-- MIGRACIÓN 13: Alinear Características de Planes con Matriz Oficial
-- Documento: planes_y_precios_facturaci_n_electr_nica.md
-- ==============================================================================

DO $$
BEGIN
    -- 1. PLAN MICRO: Habilitar Inventario/Kardex y deshabilitar Proformas (inicia en Básico)
    UPDATE public.products 
    SET features = jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(features, '{}'::jsonb),
                '{Inventario}', 'true'::jsonb
            ),
            '{Proformas}', 'false'::jsonb
        ),
        '{Proforma}', 'false'::jsonb
    )
    WHERE name = 'PLAN MICRO';

    -- 2. PLAN MINI: Deshabilitar Proformas (inicia en Básico)
    UPDATE public.products 
    SET features = jsonb_set(
        jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{Proformas}', 'false'::jsonb
        ),
        '{Proforma}', 'false'::jsonb
    )
    WHERE name = 'PLAN MINI';

    -- 3. PLAN ESPECIAL: Habilitar Cuentas por Pagar
    UPDATE public.products 
    SET features = jsonb_set(
        jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{Cuentas por Pagar}', 'true'::jsonb
        ),
        '{Cuentas por pagar}', 'true'::jsonb
    )
    WHERE name = 'PLAN ESPECIAL';

    -- 4. PLAN ILIMITADO BASE: Mantener ATS en false
    UPDATE public.products 
    SET features = jsonb_set(
        jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{ATS}', 'false'::jsonb
        ),
        '{Generación ATS}', 'false'::jsonb
    )
    WHERE name = 'PLAN ILIMITADO';

    -- 5. PLAN ILIMITADO PLUS y PLAN ILIMITADO PRO: Habilitar Anexo Transaccional (ATS)
    UPDATE public.products 
    SET features = jsonb_set(
        jsonb_set(
            COALESCE(features, '{}'::jsonb),
            '{ATS}', 'true'::jsonb
        ),
        '{Generación ATS}', 'true'::jsonb
    WHERE name IN ('PLAN ILIMITADO PLUS', 'PLAN ILIMITADO PRO');

    -- 6. Puntos de Emisión: Ilimitados en todos los planes
    UPDATE public.products
    SET features = jsonb_set(
        COALESCE(features, '{}'::jsonb),
        '{Puntos de Emisión}',
        '"Ilimitados"'::jsonb
    )
    WHERE category_id = (SELECT id FROM public.categories WHERE code = 'PLAN');

END $$;
