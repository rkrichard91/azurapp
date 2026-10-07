-- ==============================================================================
-- MIGRACIÓN 14: Establecer Puntos de Emisión Ilimitados en Todos los Planes
-- Aplica tanto a Planes de Facturación Estándar como a Planes Contables
-- ==============================================================================

DO $$
BEGIN
    UPDATE public.products
    SET features = jsonb_set(
        COALESCE(features, '{}'::jsonb),
        '{Puntos de Emisión}',
        '"Ilimitados"'::jsonb
    )
    WHERE category_id IN (
        SELECT id FROM public.categories WHERE code = 'PLAN'
    );
END $$;
