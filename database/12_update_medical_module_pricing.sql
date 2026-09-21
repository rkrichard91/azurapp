-- ==============================================================================
-- MIGRACIÓN 12: Actualizar descripción del Módulo Médico
-- Plan Base $150 (incluye 1 doctor) + doctores adicionales según rango
-- ==============================================================================

UPDATE public.products
SET description = 'Plan Base $150 (incluye 1 doctor); adicionales: 2 a 5 docs $80 c/u; 6 a 15 docs $55 c/u; 16+ docs $40 c/u'
WHERE name = 'Módulo Médico';
