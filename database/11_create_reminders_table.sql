-- =======================================================
-- MIGRACIÓN: Tabla de Recordatorios y Agenda (Azurapp)
-- Permite agendar reuniones comerciales y otros asuntos
-- =======================================================

CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'reunion_comercial', -- 'reunion_comercial', 'otro'
    modality VARCHAR(30) DEFAULT 'presencial',
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(50),
    client_email VARCHAR(100),
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_url TEXT,                                 -- Enlace opcional si aplica
    location_address TEXT,                            -- Dirección física si es presencial
    notify_advance_minutes INT DEFAULT 15,            -- Minutos antes para la alarma (0, 5, 15, 30, 45, 60)
    status VARCHAR(30) DEFAULT 'pendiente',           -- 'pendiente', 'en_curso', 'completada', 'cancelada'
    notes TEXT,
    notified BOOLEAN DEFAULT FALSE,                   -- Flag de alarma disparada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas de agenda y alertas activas
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON public.reminders(user_id, date_time);
CREATE INDEX IF NOT EXISTS idx_reminders_status_date ON public.reminders(status, date_time);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS:
-- 1. Los usuarios pueden ver sus propios recordatorios (o todos si no se filtra por usuario en equipo)
CREATE POLICY "Permitir ver recordatorios a usuarios autenticados" 
ON public.reminders FOR SELECT 
TO authenticated 
USING (true);

-- 2. Permitir crear recordatorios
CREATE POLICY "Permitir insertar recordatorios a usuarios autenticados" 
ON public.reminders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Permitir actualizar recordatorios
CREATE POLICY "Permitir actualizar recordatorios a usuarios autenticados" 
ON public.reminders FOR UPDATE 
TO authenticated 
USING (true);

-- 4. Permitir eliminar recordatorios
CREATE POLICY "Permitir borrar recordatorios a usuarios autenticados" 
ON public.reminders FOR DELETE 
TO authenticated 
USING (true);
