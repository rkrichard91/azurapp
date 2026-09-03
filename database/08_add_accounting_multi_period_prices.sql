-- ==============================================================================
-- MIGRACIÓN 08: Incorporación Completa de Periodos (1 MES, 3 MESES, 6 MESES, 1 AÑO)
-- Para Planes Contables AZUR (Precios según matriz oficial sin IVA)
-- ==============================================================================

DO $$
DECLARE
    chan_azur_id INT;
    chan_local_id INT;
    prod_id UUID;
BEGIN
    SELECT id INTO chan_azur_id FROM public.channels WHERE code = 'AZUR';
    SELECT id INTO chan_local_id FROM public.channels WHERE code = 'LOCAL';

    --------------------------------------------------------------------------------
    -- 1. PLAN CONTABLE ESENCIAL
    -- 1 mes: $25.00 | 3 meses: $74.25 | 6 meses: $141.00 | 1 año: $270.00
    --------------------------------------------------------------------------------
    SELECT id INTO prod_id FROM public.products WHERE name = 'PLAN CONTABLE ESENCIAL';
    IF prod_id IS NOT NULL THEN
        -- AZUR
        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_azur_id, 25.00, '1 MES'),
                (prod_id, chan_azur_id, 74.25, '3 MESES'),
                (prod_id, chan_azur_id, 141.00, '6 MESES'),
                (prod_id, chan_azur_id, 270.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;

        -- LOCAL
        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_local_id, 25.00, '1 MES'),
                (prod_id, chan_local_id, 74.25, '3 MESES'),
                (prod_id, chan_local_id, 141.00, '6 MESES'),
                (prod_id, chan_local_id, 270.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- 2. PLAN CONTABLE PROFESIONAL
    -- 1 mes: $35.00 | 3 meses: $101.85 | 6 meses: $197.40 | 1 año: $378.00
    --------------------------------------------------------------------------------
    SELECT id INTO prod_id FROM public.products WHERE name = 'PLAN CONTABLE PROFESIONAL';
    IF prod_id IS NOT NULL THEN
        -- AZUR
        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_azur_id, 35.00, '1 MES'),
                (prod_id, chan_azur_id, 101.85, '3 MESES'),
                (prod_id, chan_azur_id, 197.40, '6 MESES'),
                (prod_id, chan_azur_id, 378.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;

        -- LOCAL
        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_local_id, 35.00, '1 MES'),
                (prod_id, chan_local_id, 101.85, '3 MESES'),
                (prod_id, chan_local_id, 197.40, '6 MESES'),
                (prod_id, chan_local_id, 378.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- 3. PLAN CONTABLE PREMIUM
    -- 1 mes: $45.00 | 3 meses: $130.95 | 6 meses: $253.80 | 1 año: $486.00
    --------------------------------------------------------------------------------
    SELECT id INTO prod_id FROM public.products WHERE name = 'PLAN CONTABLE PREMIUM';
    IF prod_id IS NOT NULL THEN
        -- AZUR
        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_azur_id, 45.00, '1 MES'),
                (prod_id, chan_azur_id, 130.95, '3 MESES'),
                (prod_id, chan_azur_id, 253.80, '6 MESES'),
                (prod_id, chan_azur_id, 486.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;

        -- LOCAL
        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_local_id, 45.00, '1 MES'),
                (prod_id, chan_local_id, 130.95, '3 MESES'),
                (prod_id, chan_local_id, 253.80, '6 MESES'),
                (prod_id, chan_local_id, 486.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- 4. PLAN CONTABLE CORPORATIVO
    -- 1 mes: $60.00 | 3 meses: $174.60 | 6 meses: $338.40 | 1 año: $648.00
    --------------------------------------------------------------------------------
    SELECT id INTO prod_id FROM public.products WHERE name = 'PLAN CONTABLE CORPORATIVO';
    IF prod_id IS NOT NULL THEN
        -- AZUR
        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_azur_id, 60.00, '1 MES'),
                (prod_id, chan_azur_id, 174.60, '3 MESES'),
                (prod_id, chan_azur_id, 338.40, '6 MESES'),
                (prod_id, chan_azur_id, 648.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;

        -- LOCAL
        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label)
            VALUES 
                (prod_id, chan_local_id, 60.00, '1 MES'),
                (prod_id, chan_local_id, 174.60, '3 MESES'),
                (prod_id, chan_local_id, 338.40, '6 MESES'),
                (prod_id, chan_local_id, 648.00, '1 AÑO')
            ON CONFLICT (product_id, channel_id, duration_label)
            DO UPDATE SET price = EXCLUDED.price;
        END IF;
    END IF;

END $$;

