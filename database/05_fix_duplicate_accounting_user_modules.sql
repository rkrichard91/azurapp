-- ==============================================================================
-- MIGRACIÓN 05: Limpieza de Productos Duplicados de Usuarios Contables
-- ==============================================================================

DO $$
BEGIN
    -- 1. Desactivar productos legados/duplicados de usuarios contables
    UPDATE public.products 
    SET is_active = false 
    WHERE name IN (
        'Usuario Adic. (Contable - Mensual)',
        'Usuario Adic. (Contable - Anual)'
    );

    -- 2. Asegurar que 'Usuario Adicional (Plan Contable)' esté activo
    UPDATE public.products 
    SET is_active = true 
    WHERE name = 'Usuario Adicional (Plan Contable)';

END $$;
