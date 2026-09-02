-- Migration: Actualizar precio de Establecimiento Adicional (Plan Contable) a $10.00 + IVA / mes y $120.00 + IVA / año
DO $$
DECLARE
    prod_id UUID;
BEGIN
    SELECT id INTO prod_id FROM public.products WHERE name = 'Establecimiento Adicional (Plan Contable)';

    IF prod_id IS NOT NULL THEN
        -- Actualizar precio mensual a $10.00
        UPDATE public.prices 
        SET price = 10.00 
        WHERE product_id = prod_id AND duration_label = '1 MES';

        -- Actualizar precio anual a $120.00 ($10 * 12 meses)
        UPDATE public.prices 
        SET price = 120.00 
        WHERE product_id = prod_id AND duration_label = '1 AÑO';
    END IF;
END $$;
