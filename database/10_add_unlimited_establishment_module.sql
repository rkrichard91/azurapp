-- ==============================================================================
-- MIGRACIÓN 10: Incorporación de Establecimiento Adicional para Planes Ilimitados ($50 + IVA / año)
-- y Estandarización de Nombres de Establecimiento Adicional
-- ==============================================================================

DO $$
DECLARE
    cat_mod_id INT;
    chan_azur_id INT;
    chan_local_id INT;
    prod_id UUID;
BEGIN
    SELECT id INTO cat_mod_id FROM public.categories WHERE code = 'MODULE';
    SELECT id INTO chan_azur_id FROM public.channels WHERE code = 'AZUR';
    SELECT id INTO chan_local_id FROM public.channels WHERE code = 'LOCAL';

    -- 1. Estandarizar nombre para Planes Normales ($25.00 + IVA / año)
    UPDATE public.products 
    SET name = 'Establecimiento Adicional (Micro a Especial II)', 
        description = 'Sucursal extra (Planes Micro a Especial II)'
    WHERE name = 'Establecimiento Adicional';

    -- Asegurar que el precio sea $25.00 / 1 AÑO
    SELECT id INTO prod_id FROM public.products WHERE name = 'Establecimiento Adicional (Micro a Especial II)';
    IF prod_id IS NOT NULL THEN
        UPDATE public.prices 
        SET price = 25.00 
        WHERE product_id = prod_id AND duration_label = '1 AÑO';
    END IF;

    -- 2. Insertar o actualizar Establecimiento Adicional para Planes Ilimitados ($50.00 + IVA / año)
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Establecimiento Adicional (Planes Ilimitados)') THEN
        INSERT INTO public.products (name, description, category_id, is_active)
        VALUES ('Establecimiento Adicional (Planes Ilimitados)', 'Sucursal extra en planes Ilimitados', cat_mod_id, true)
        RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES (prod_id, chan_azur_id, 50.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES (prod_id, chan_local_id, 50.00, '1 AÑO');
        END IF;
    ELSE
        SELECT id INTO prod_id FROM public.products WHERE name = 'Establecimiento Adicional (Planes Ilimitados)';
        IF prod_id IS NOT NULL THEN
            UPDATE public.prices
            SET price = 50.00
            WHERE product_id = prod_id AND duration_label = '1 AÑO';
        END IF;
    END IF;

END $$;
