-- 02_add_user_id_to_sales.sql
-- Run this SQL in your Supabase SQL Editor to add user isolation and RLS policies.

-- 1. Agregar la columna user_id enlazada a la tabla de usuarios de Supabase Auth
ALTER TABLE public.sales 
ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Migrar las ventas existentes sin usuario asignado.
-- REEMPLAZA 'correo_de_paola@ejemplo.com' con el correo real de Paola Alban en tu Supabase:
UPDATE public.sales 
SET user_id = (SELECT id FROM auth.users WHERE email = 'correo_de_paola@ejemplo.com') 
WHERE user_id IS NULL;

-- 3. Habilitar RLS (Row Level Security) en la tabla sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 4. Crear Política para Leer (SELECT):
-- Permite leer si el usuario es el dueño de la venta OR si es un administrador (basado en metadatos de usuario)
CREATE POLICY "Permitir lectura propia o de administradores" 
ON public.sales 
FOR SELECT 
USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 5. Crear Política para Insertar (INSERT):
-- Permite insertar si el user_id coincide con el del usuario autenticado
CREATE POLICY "Permitir inserción solo para el usuario logueado" 
ON public.sales 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id
);

-- 6. Crear Política para Actualizar (UPDATE):
-- Permite actualizar si el usuario es el dueño de la venta OR si es administrador
CREATE POLICY "Permitir actualización propia o de administradores" 
ON public.sales 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 7. Crear Política para Eliminar (DELETE):
-- Permite eliminar si el usuario es dueño de la venta OR si es administrador
CREATE POLICY "Permitir eliminación propia o de administradores" 
ON public.sales 
FOR DELETE 
USING (
    auth.uid() = user_id 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
