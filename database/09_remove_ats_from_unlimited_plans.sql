-- ==============================================================================
-- MIGRACIÓN 09: Quitar ATS de las características de los Planes Ilimitados
-- (PLAN ILIMITADO, PLAN ILIMITADO PLUS, PLAN ILIMITADO PRO)
-- ==============================================================================

UPDATE public.products 
SET features = jsonb_set(
    jsonb_set(
        COALESCE(features, '{}'::jsonb),
        '{ATS}', 'false'::jsonb
    ),
    '{Generación ATS}', 'false'::jsonb
)
WHERE name LIKE 'PLAN ILIMITADO%';

