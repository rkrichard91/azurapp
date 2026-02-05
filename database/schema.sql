-- 1. Canales de Venta (Para segmentar precios)
CREATE TABLE public.channels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- 'AZUR', 'LOCAL', 'WEB'
    name VARCHAR(50) NOT NULL
);

-- 2. Categorías de Productos
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'PLAN', 'SIGNATURE', 'MODULE', 'INTEGRATION'
    name VARCHAR(100) NOT NULL
);

-- 3. Productos Principales (Planes, Firmas, Módulos)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id INT REFERENCES public.categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    allows_quantity BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '{}'::JSONB, -- Para comparador de características
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Lista de Precios General
CREATE TABLE public.prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    channel_id INT REFERENCES public.channels(id),
    duration_label VARCHAR(50) NOT NULL, -- '1 AÑO', 'MENSUAL'
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    renewal_price DECIMAL(10, 2), -- Precio diferenciado para renovación
    UNIQUE(product_id, channel_id, duration_label)
);

-- 5. TABLA ESPECIAL: Paquetes de Integración (Lógica del Excel)
CREATE TABLE public.integration_packages (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'API' o 'WEB'
    quantity INT NOT NULL,     -- Cantidad de comprobantes adicionales
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
