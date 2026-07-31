-- ==============================================================================
-- MIGRACIÓN 04: Incorporación de Nuevos Planes Contables AZUR y Add-ons
-- Matriz Oficial Planes Contables AZUR
-- ==============================================================================

DO $$
DECLARE
    cat_plan_id INT;
    cat_mod_id INT;
    chan_azur_id INT;
    chan_local_id INT;
    prod_id UUID;
BEGIN
    -- 1. Obtener IDs de Categorías y Canales
    SELECT id INTO cat_plan_id FROM public.categories WHERE code = 'PLAN';
    SELECT id INTO cat_mod_id FROM public.categories WHERE code = 'MODULE';
    SELECT id INTO chan_azur_id FROM public.channels WHERE code = 'AZUR';
    SELECT id INTO chan_local_id FROM public.channels WHERE code = 'LOCAL';

    -- Inactivar o remover planes y módulos contables antiguos si existen
    UPDATE public.products 
    SET is_active = false 
    WHERE name IN (
        'PLAN CONTABLE', 
        'PLAN CONTABLE PRO',
        'Usuario Adic. (Contable - Mensual)',
        'Usuario Adic. (Contable - Anual)'
    );

    --------------------------------------------------------------------------------
    -- PLAN CONTABLE ESENCIAL ($25/mes o $270/año)
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'PLAN CONTABLE ESENCIAL') THEN
        INSERT INTO public.products (name, description, category_id, features) 
        VALUES (
            'PLAN CONTABLE ESENCIAL', 
            'Sistema contable completo para pequeños negocios y emprendedores', 
            cat_plan_id, 
            '{"Comprobantes mes": "1250", "Comprobantes año": "15000", "Límite API REST": "2000 / año", "Empresas": 1, "Establecimientos": 2, "Puntos de Emisión": 5, "Usuarios": 5, "Empleados (Nómina)": 5, "Contabilidad Automática": true, "Estados Financieros": true, "Bancos y Cartera": true, "Inventario": true, "Compras": true, "Nómina": true, "ATS": true, "Soporte": true, "Portal documentación": true}'::jsonb
        ) RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_azur_id, 25.00, '1 MES'),
            (prod_id, chan_azur_id, 270.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_local_id, 25.00, '1 MES'),
            (prod_id, chan_local_id, 270.00, '1 AÑO');
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- PLAN CONTABLE PROFESIONAL ($35/mes o $378/año)
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'PLAN CONTABLE PROFESIONAL') THEN
        INSERT INTO public.products (name, description, category_id, features) 
        VALUES (
            'PLAN CONTABLE PROFESIONAL', 
            'Comprobantes ilimitados web y mayor capacidad operativa', 
            cat_plan_id, 
            '{"Comprobantes mes": "Ilimitados", "Comprobantes año": "Ilimitado", "Límite API REST": "4000 / año", "Empresas": 1, "Establecimientos": 2, "Puntos de Emisión": 5, "Usuarios": 5, "Empleados (Nómina)": 25, "Contabilidad Automática": true, "Estados Financieros": true, "Bancos y Cartera": true, "Inventario": true, "Compras": true, "Nómina": true, "ATS": true, "Soporte": true, "Portal documentación": true}'::jsonb
        ) RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_azur_id, 35.00, '1 MES'),
            (prod_id, chan_azur_id, 378.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_local_id, 35.00, '1 MES'),
            (prod_id, chan_local_id, 378.00, '1 AÑO');
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- PLAN CONTABLE PREMIUM ($45/mes o $486/año)
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'PLAN CONTABLE PREMIUM') THEN
        INSERT INTO public.products (name, description, category_id, features) 
        VALUES (
            'PLAN CONTABLE PREMIUM', 
            'Para empresas en crecimiento con hasta 50 empleados en nómina', 
            cat_plan_id, 
            '{"Comprobantes mes": "Ilimitados", "Comprobantes año": "Ilimitado", "Límite API REST": "6000 / año", "Empresas": 1, "Establecimientos": 3, "Puntos de Emisión": 10, "Usuarios": 8, "Empleados (Nómina)": 50, "Contabilidad Automática": true, "Estados Financieros": true, "Bancos y Cartera": true, "Inventario": true, "Compras": true, "Nómina": true, "ATS": true, "Soporte": true, "Portal documentación": true}'::jsonb
        ) RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_azur_id, 45.00, '1 MES'),
            (prod_id, chan_azur_id, 486.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_local_id, 45.00, '1 MES'),
            (prod_id, chan_local_id, 486.00, '1 AÑO');
        END IF;
    END IF;

    --------------------------------------------------------------------------------
    -- PLAN CONTABLE CORPORATIVO ($60/mes o $648/año)
    --------------------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'PLAN CONTABLE CORPORATIVO') THEN
        INSERT INTO public.products (name, description, category_id, features) 
        VALUES (
            'PLAN CONTABLE CORPORATIVO', 
            'Máxima capacidad para corporaciones y hasta 100 empleados en nómina', 
            cat_plan_id, 
            '{"Comprobantes mes": "Ilimitados", "Comprobantes año": "Ilimitado", "Límite API REST": "8000 / año", "Empresas": 1, "Establecimientos": 4, "Puntos de Emisión": 12, "Usuarios": 10, "Empleados (Nómina)": 100, "Contabilidad Automática": true, "Estados Financieros": true, "Bancos y Cartera": true, "Inventario": true, "Compras": true, "Nómina": true, "ATS": true, "Soporte": true, "Portal documentación": true}'::jsonb
        ) RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_azur_id, 60.00, '1 MES'),
            (prod_id, chan_azur_id, 648.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES 
            (prod_id, chan_local_id, 60.00, '1 MES'),
            (prod_id, chan_local_id, 648.00, '1 AÑO');
        END IF;
    END IF;

    -- Renombrar 'Usuario adicional (Anual)' a 'Usuario Adicional (Planes Estándar)' para mayor claridad
    UPDATE public.products 
    SET name = 'Usuario Adicional (Planes Estándar)', description = 'Acceso para un usuario extra en planes estándar'
    WHERE name IN ('Usuario adicional (Anual)', 'Usuario Adicional (Anual)');

    --------------------------------------------------------------------------------
    -- ADD-ONS CONTABLES (MÓDULOS)
    --------------------------------------------------------------------------------

    -- 1. Usuario Adicional (Plan Contable)
    IF NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Usuario Adicional (Plan Contable)') THEN
        INSERT INTO public.products (name, description, category_id)
        VALUES ('Usuario Adicional (Plan Contable)', 'Acceso para un usuario extra en Planes Contables', cat_mod_id)
        RETURNING id INTO prod_id;

        IF chan_azur_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_azur_id, 2.50, '1 MES'),
            (prod_id, chan_azur_id, 30.00, '1 AÑO');
        END IF;

        IF chan_local_id IS NOT NULL THEN
            INSERT INTO public.prices (product_id, channel_id, price, duration_label) VALUES
            (prod_id, chan_local_id, 2.50, '1 MES'),
            (prod_id, chan_local_id, 30.00, '1 AÑO');
        END IF;
    END IF;

    -- 2. Empleado Adicional (Plan Contable) - $0.50/mes o $6.00/año
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
    END IF;

    -- 3. Establecimiento Adicional (Plan Contable)
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
    END IF;

END $$;
