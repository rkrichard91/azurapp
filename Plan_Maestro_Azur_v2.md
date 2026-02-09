# **🚀 Plan Maestro de Implementación: Calculadora Unificada Azur (v2.0)**

Este documento detalla la arquitectura, base de datos, lógica de backend y estructura de frontend para la modernización de las herramientas de cotización de **Center Tecno / Azur**.

## **📋 1\. Visión General y Arquitectura**

El objetivo es migrar de archivos HTML monolíticos a una **Single Page Application (SPA)** escalable, separando la interfaz de los datos y centralizando las reglas de negocio.

### **Stack Tecnológico**

* **Frontend:** React.js (Vite) \+ Tailwind CSS.  
* **Base de Datos & Backend:** Supabase (PostgreSQL \+ Edge Functions opcionales).  
* **Lenguaje:** JavaScript (ES6+) / React JSX.

### **Estructura del Proyecto (File System)**

/azur-calculator  
├── /public                 \# Assets estáticos (favicon, manifest)  
├── /src  
│   ├── /assets             \# Imágenes (Logos Azur)  
│   ├── /components         \# UI Reutilizable  
│   │   ├── /ui             \# Cards, Buttons, Inputs, Selects  
│   │   ├── /layout         \# Navbar, LayoutContainer  
│   │   └── SummaryCard.jsx \# Componente flotante de totales  
│   ├── /context            \# Estado Global  
│   │   └── AppContext.jsx  \# Guarda: canalSeleccionado (Azur/Local/Web)  
│   ├── /pages              \# Vistas Principales  
│   │   ├── Dashboard.jsx        \# Menú principal  
│   │   ├── NewSale.jsx          \# Calculadora de Ventas (Planes/Firmas)  
│   │   ├── PlanChange.jsx       \# Calculadora de Upgrade/Downgrade  
│   │   └── Integrations.jsx     \# Calculadora de Integraciones (API/Web)  
│   ├── /services           \# Lógica de Negocio y API  
│   │   ├── supabaseClient.js    \# Conexión  
│   │   ├── pricingService.js    \# Fetch de productos generales  
│   │   └── integrationService.js \# Lógica acumulativa (Base \+ Paquete)  
│   └── App.jsx             \# Router (React Router DOM)  
├── .env.local              \# Variables de entorno (API Keys)  
├── package.json  
└── tailwind.config.js

## **🗄️ 2\. Base de Datos (Supabase PostgreSQL)**

Ejecuta el siguiente script SQL en el **SQL Editor** de Supabase para generar la estructura completa y cargar los datos iniciales.

### **2.1. Esquema de Tablas**

\-- 1\. Canales de Venta (Para segmentar precios)  
CREATE TABLE public.channels (  
    id SERIAL PRIMARY KEY,  
    code VARCHAR(20) UNIQUE NOT NULL, \-- 'AZUR', 'LOCAL', 'WEB'  
    name VARCHAR(50) NOT NULL  
);

\-- 2\. Categorías de Productos  
CREATE TABLE public.categories (  
    id SERIAL PRIMARY KEY,  
    code VARCHAR(50) UNIQUE NOT NULL, \-- 'PLAN', 'SIGNATURE', 'MODULE', 'INTEGRATION'  
    name VARCHAR(100) NOT NULL  
);

\-- 3\. Productos Principales (Planes, Firmas, Módulos)  
CREATE TABLE public.products (  
    id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
    category\_id INT REFERENCES public.categories(id),  
    name VARCHAR(255) NOT NULL,  
    description TEXT,  
    allows\_quantity BOOLEAN DEFAULT TRUE,  
    features JSONB DEFAULT '{}'::JSONB, \-- Para comparador de características  
    is\_active BOOLEAN DEFAULT TRUE,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- 4\. Lista de Precios General  
CREATE TABLE public.prices (  
    id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
    product\_id UUID REFERENCES public.products(id) ON DELETE CASCADE,  
    channel\_id INT REFERENCES public.channels(id),  
    duration\_label VARCHAR(50) NOT NULL, \-- '1 AÑO', 'MENSUAL'  
    price DECIMAL(10, 2\) NOT NULL DEFAULT 0,  
    renewal\_price DECIMAL(10, 2), \-- Precio diferenciado para renovación  
    UNIQUE(product\_id, channel\_id, duration\_label)  
);

\-- 5\. TABLA ESPECIAL: Paquetes de Integración (Lógica del Excel)  
CREATE TABLE public.integration\_packages (  
    id SERIAL PRIMARY KEY,  
    type VARCHAR(20) NOT NULL, \-- 'API' o 'WEB'  
    quantity INT NOT NULL,     \-- Cantidad de comprobantes adicionales  
    price DECIMAL(10, 2\) NOT NULL,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

### **2.2. Datos Semilla (Seed Data)**

\-- A. Insertar Estructura Base  
INSERT INTO public.channels (code, name) VALUES   
('AZUR', 'Canal Azur'), ('LOCAL', 'Canal Local'), ('WEB', 'Canal Web');

INSERT INTO public.categories (code, name) VALUES   
('PLAN', 'Plan de Facturación'),   
('SIGNATURE', 'Firma Electrónica'),   
('MODULE', 'Módulo Adicional'),  
('INTEGRATION', 'Integración y API');

\-- B. Insertar PLAN BASE DE INTEGRACIÓN ($100 / 2000 docs)  
DO $$  
DECLARE   
    cat\_int INT;  
    chan\_azur INT;  
    prod\_id UUID;  
BEGIN  
    SELECT id INTO cat\_int FROM public.categories WHERE code \= 'INTEGRATION';  
    SELECT id INTO chan\_azur FROM public.channels WHERE code \= 'AZUR';

    \-- Producto Base  
    INSERT INTO public.products (category\_id, name, features)  
    VALUES (cat\_int, 'Plan Integración (Base)', '{"comprobantes": 2000, "tipo": "base"}'::JSONB)  
    RETURNING id INTO prod\_id;

    \-- Precio Base  
    INSERT INTO public.prices (product\_id, channel\_id, duration\_label, price)  
    VALUES (prod\_id, chan\_azur, '1 AÑO', 100.00);  
END $$;

\-- C. Insertar Paquetes Adicionales (Datos del Excel)  
INSERT INTO public.integration\_packages (type, quantity, price) VALUES  
\-- API REST  
('API', 5000, 59.00), ('API', 10000, 118.00), ('API', 20000, 236.00),  
('API', 30000, 354.00), ('API', 40000, 472.00), ('API', 50000, 590.00),  
('API', 60000, 708.00), ('API', 70000, 826.00), ('API', 80000, 944.00),  
('API', 90000, 1062.00), ('API', 100000, 1180.00), ('API', 110000, 1300.00),  
('API', 120000, 1420.00), ('API', 130000, 1540.00), ('API', 140000, 1660.00),  
('API', 150000, 1780.00), ('API', 160000, 1900.00), ('API', 170000, 2020.00),  
('API', 180000, 2140.00),  
\-- USO WEB  
('WEB', 500, 10.00), ('WEB', 1000, 20.00), ('WEB', 2000, 36.00),  
('WEB', 5000, 59.00), ('WEB', 10000, 118.00), ('WEB', 20000, 236.00),  
('WEB', 30000, 354.00), ('WEB', 40000, 472.00), ('WEB', 50000, 590.00),  
('WEB', 100000, 1180.00), ('WEB', 150000, 1770.00), ('WEB', 180000, 1800.00),  
('WEB', 200000, 2000.00), ('WEB', 300000, 3000.00), ('WEB', 500000, 5000.00);

## **⚙️ 3\. Lógica del Backend (Servicios)**

Implementación en /src/services para manejar la lógica de negocio.

### **3.1. Cliente Supabase (/src/services/supabaseClient.js)**

import { createClient } from '@supabase/supabase-js'

const supabaseUrl \= import.meta.env.VITE\_SUPABASE\_URL  
const supabaseAnonKey \= import.meta.env.VITE\_SUPABASE\_ANON\_KEY

export const supabase \= createClient(supabaseUrl, supabaseAnonKey)

### **3.2. Servicio de Integraciones (/src/services/integrationService.js)**

Esta función implementa la regla de negocio: **Total \= Base ($100/2000docs) \+ Paquete Adicional**.

import { supabase } from './supabaseClient';

// Regla de Negocio: Valores Base  
const BASE\_CONFIG \= {  
  price: 100.00,  
  docs: 2000,  
  name: "Plan Base Integración"  
};  
const IVA\_RATE \= 0.15;

/\*\*  
 \* Calcula cotización acumulativa  
 \* @param {string} type \- 'API' | 'WEB'  
 \* @param {number} quantity \- Cantidad seleccionada (ej: 10000\)  
 \*/  
export async function calculateIntegrationQuote(type, quantity) {  
  // 1\. Buscar precio del paquete variable  
  const { data: pkg, error } \= await supabase  
    .from('integration\_packages')  
    .select('\*')  
    .eq('type', type)  
    .eq('quantity', quantity)  
    .single();

  if (error || \!pkg) {  
    console.error("Paquete no encontrado", error);  
    return null;  
  }

  // 2\. Cálculo Financiero  
  const additionalPrice \= parseFloat(pkg.price);  
  const subtotal \= BASE\_CONFIG.price \+ additionalPrice;  
  const ivaAmount \= subtotal \* IVA\_RATE;  
  const total \= subtotal \+ ivaAmount;

  // 3\. Cálculo de Capacidad  
  const totalDocs \= BASE\_CONFIG.docs \+ pkg.quantity;

  // 4\. Retorno Estructurado  
  return {  
    summary: {  
      plan\_name: \`Integración ${type} (${totalDocs.toLocaleString()} Docs)\`,  
      total\_docs: totalDocs,  
      subtotal: subtotal.toFixed(2),  
      iva: ivaAmount.toFixed(2),  
      total: total.toFixed(2)  
    },  
    breakdown: \[  
      {  
        item: "Plan Base (Obligatorio)",  
        desc: "Incluye 2,000 comprobantes anuales",  
        price: BASE\_CONFIG.price.toFixed(2)  
      },  
      {  
        item: \`Paquete Adicional ${type}\`,  
        desc: \`${pkg.quantity.toLocaleString()} comprobantes extra\`,  
        price: additionalPrice.toFixed(2)  
      }  
    \]  
  };  
}

## **💻 4\. Implementación del Frontend (React)**

### **4.1. Componente de Integraciones (/src/pages/Integrations.jsx)**

Interfaz moderna que consume el servicio anterior.

import React, { useState, useEffect } from 'react';  
import { calculateIntegrationQuote } from '../services/integrationService';

export default function IntegrationsCalculator() {  
  const \[type, setType\] \= useState('API');  
  const \[quantity, setQuantity\] \= useState(5000);  
  const \[quote, setQuote\] \= useState(null);  
  const \[loading, setLoading\] \= useState(false);

  // Opciones hardcoded (o podrían venir de DB en una versión v2.1)  
  const optionsAPI \= \[5000, 10000, 20000, 30000, 40000, 50000, 100000, 150000\];  
  const optionsWEB \= \[500, 1000, 2000, 5000, 10000, 50000, 100000, 200000\];

  useEffect(() \=\> {  
    async function runCalc() {  
      setLoading(true);  
      const result \= await calculateIntegrationQuote(type, quantity);  
      setQuote(result);  
      setLoading(false);  
    }  
    runCalc();  
  }, \[type, quantity\]);

  return (  
    \<div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans"\>  
        
      {/\* 1\. Panel de Configuración \*/}  
      \<div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 h-fit"\>  
        \<h2 className="text-2xl font-bold text-slate-800 mb-6"\>  
          Configurar Integración  
        \</h2\>  
          
        {/\* Selector Tipo \*/}  
        \<div className="mb-6"\>  
          \<label className="block text-sm font-medium text-slate-500 mb-2"\>Tipo de Servicio\</label\>  
          \<div className="flex bg-slate-100 p-1 rounded-lg"\>  
            \<button   
              onClick={() \=\> { setType('API'); setQuantity(5000); }}  
              className={\`flex-1 py-2 rounded-md font-semibold transition-all ${type \=== 'API' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}\`}  
            \>  
              API REST  
            \</button\>  
            \<button   
              onClick={() \=\> { setType('WEB'); setQuantity(500); }}  
              className={\`flex-1 py-2 rounded-md font-semibold transition-all ${type \=== 'WEB' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}\`}  
            \>  
              USO WEB  
            \</button\>  
          \</div\>  
        \</div\>

        {/\* Selector Cantidad \*/}  
        \<div className="mb-4"\>  
          \<label className="block text-sm font-medium text-slate-500 mb-2"\>Paquete Adicional\</label\>  
          \<select   
            value={quantity}  
            onChange={(e) \=\> setQuantity(parseInt(e.target.value))}  
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"  
          \>  
            {(type \=== 'API' ? optionsAPI : optionsWEB).map(opt \=\> (  
              \<option key={opt} value={opt}\>  
                {opt.toLocaleString()} Comprobantes Adicionales  
              \</option\>  
            ))}  
          \</select\>  
        \</div\>

        \<div className="p-4 bg-blue-50 rounded-lg border border-blue-100"\>  
          \<p className="text-sm text-blue-800 flex items-start gap-2"\>  
            \<span\>ℹ️\</span\>  
            El Plan Base de Integración ($100) es obligatorio y añade 2,000 comprobantes a su capacidad total.  
          \</p\>  
        \</div\>  
      \</div\>

      {/\* 2\. Panel de Resultados \*/}  
      \<div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 flex flex-col justify-between h-full"\>  
        \<div\>  
          \<h2 className="text-2xl font-bold text-slate-800 mb-6"\>Cotización Estimada\</h2\>  
            
          {loading ? (  
            \<div className="py-10 text-center text-slate-400"\>Calculando...\</div\>  
          ) : quote ? (  
            \<div className="space-y-4"\>  
              {/\* Desglose de Items \*/}  
              {quote.breakdown.map((item, idx) \=\> (  
                \<div key={idx} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0"\>  
                  \<div\>  
                    \<p className="font-semibold text-slate-700"\>{item.item}\</p\>  
                    \<p className="text-xs text-slate-400"\>{item.desc}\</p\>  
                  \</div\>  
                  \<span className="font-medium text-slate-800"\>${item.price}\</span\>  
                \</div\>  
              ))}  
            \</div\>  
          ) : (  
            \<p className="text-red-500"\>Error al calcular. Verifique la conexión.\</p\>  
          )}  
        \</div\>

        {/\* Totales Finales \*/}  
        {quote && (  
          \<div className="mt-8 bg-slate-50 rounded-xl p-6"\>  
            \<div className="flex justify-between mb-2 text-slate-500"\>  
              \<span\>Subtotal\</span\>  
              \<span\>${quote.summary.subtotal}\</span\>  
            \</div\>  
            \<div className="flex justify-between mb-4 text-slate-500"\>  
              \<span\>IVA (15%)\</span\>  
              \<span\>${quote.summary.iva}\</span\>  
            \</div\>  
              
            \<div className="flex justify-between items-center pt-4 border-t border-slate-200"\>  
              \<div\>  
                \<span className="block text-xs text-slate-400 uppercase tracking-wide"\>Total Anual\</span\>  
                \<span className="text-3xl font-bold text-blue-600"\>${quote.summary.total}\</span\>  
              \</div\>  
              \<div className="text-right"\>  
                \<span className="block text-xs text-slate-400 uppercase tracking-wide"\>Capacidad Total\</span\>  
                \<span className="text-lg font-bold text-slate-700"\>{quote.summary.total\_docs.toLocaleString()} Docs\</span\>  
              \</div\>  
            \</div\>  
              
            \<button className="w-full mt-6 bg-slate-800 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition-colors shadow-md"\>  
              Copiar Resumen  
            \</button\>  
          \</div\>  
        )}  
      \</div\>  
    \</div\>  
  );  
}

## **🛠️ 5\. Guía de Instalación y Despliegue**

Sigue estos pasos para levantar el proyecto localmente.

1. **Crear Proyecto Vite:**  
   npm create vite@latest calculadora-azur \-- \--template react  
   cd calculadora-azur  
   npm install

2. **Instalar Dependencias:**  
   npm install tailwindcss postcss autoprefixer @supabase/supabase-js react-router-dom lucide-react  
   npx tailwindcss init \-p

3. **Configurar Tailwind (tailwind.config.js):**  
   /\*\* @type {import('tailwindcss').Config} \*/  
   export default {  
     content: \["./index.html", "./src/\*\*/\*.{js,ts,jsx,tsx}"\],  
     theme: { extend: {} },  
     plugins: \[\],  
   }

   *Agrega @tailwind base; @tailwind components; @tailwind utilities; en tu src/index.css.*  
4. **Configurar Variables de Entorno (.env.local):**  
   Obtén estas credenciales en tu panel de Supabase (Settings \> API).  
   VITE\_SUPABASE\_URL=\[https://tu-proyecto.supabase.co\](https://tu-proyecto.supabase.co)  
   VITE\_SUPABASE\_ANON\_KEY=tu-clave-anonima-larga

5. **Ejecutar:**  
   npm run dev  
