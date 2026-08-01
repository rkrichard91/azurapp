-- ==============================================================================
-- MIGRACIÓN 05: Limpieza de Productos Duplicados y Actualización de Nombres a (Micro a Especial II)
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

    -- 1. Desactivar productos legados/duplicados de usuarios contables
    UPDATE public.products 
    SET is_active = false 
    WHERE name IN (
        'Usuario Adic. (Contable - Mensual)',
        'Usuario Adic. (Contable - Anual)'
    );

    -- 2. Renombrar add-ons no contables a '(Micro a Especial II)'
    UPDATE public.products 
    SET name = 'Usuario Adicional (Micro a Especial II)', 
        description = 'Acceso para un usuario extra (Planes Micro a Especial II)'
    WHERE name IN ('Usuario adicional (Anual)', 'Usuario Adicional (Anual)', 'Usuario Adicional (Planes Estándar)');

    UPDATE public.products 
    SET name = 'Establecimiento Adicional', 
        description = 'Sucursal extra (Planes Micro a Especial II)'
    WHERE name IN ('Establecimiento Adicional (Micro a Especial II)', 'Establecimiento Adicional (Anual)');

    -- 3. Asegurar que 'Usuario Adicional (Plan Contable)' esté activo y con precio anual completo sin descuento ($30.00)
    UPDATE public.products 
    SET is_active = true 
    WHERE name = 'Usuario Adicional (Plan Contable)';

    SELECT id INTO prod_id FROM public.products WHERE name = 'Usuario Adicional (Plan Contable)';
    IF prod_id IS NOT NULL THEN
        UPDATE public.prices 
        SET price = 30.00 
        WHERE product_id = prod_id AND duration_label = '1 AÑO';
    END IF;

    -- 4. Insertar u ordenar 'Empleado Adicional (Plan Contable)' ($0.50/mes o $6.00/año completo sin descuento)
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Empleado Adicional (Plan Contable)') THEN
        INSERT INTO public.products (name, description, category_id)
        VALUES ('Empleado Adicional (Plan Contable)', 'Empleado extra en Nómina para Planes Contables', cat_mod_id)
        RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_azur_id, 0.50, '1 MES'),
            (prod_id, chan_azur_id, 6.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_local_id, 0.50, '1 MES'),
            (prod_id, chan_local_id, 6.00, '1 AÑO');
        END IF;
    ELSE
        SELECT id INTO prod_id FROM public.products WHERE name = 'Empleado Adicional (Plan Contable)';
        IF prod_id IS NOT NULL THEN
            UPDATE public.prices 
            SET price = 6.00 
            WHERE product_id = prod_id AND duration_label = '1 AÑO';
        END IF;
    END IF;

    -- 5. Insertar u ordenar 'Establecimiento Adicional (Plan Contable)' ($20.00/mes o $240.00/año completo sin descuento)
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Establecimiento Adicional (Plan Contable)') THEN
        INSERT INTO public.products (name, description, category_id)
        VALUES ('Establecimiento Adicional (Plan Contable)', 'Sucursal extra para Planes Contables', cat_mod_id)
        RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_azur_id, 20.00, '1 MES'),
            (prod_id, chan_azur_id, 240.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_local_id, 20.00, '1 MES'),
            (prod_id, chan_local_id, 240.00, '1 AÑO');
        END IF;
    ELSE
        SELECT id INTO prod_id FROM public.products WHERE name = 'Establecimiento Adicional (Plan Contable)';
        IF prod_id IS NOT NULL THEN
            UPDATE public.prices 
            SET price = 240.00 
            WHERE product_id = prod_id AND duration_label = '1 AÑO';
        END IF;
    END IF;

END $$;
