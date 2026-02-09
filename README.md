# 🚀 Calculadora Unificada Azur (v2.0)

Este proyecto es una **Single Page Application (SPA)** moderna desarrollada para **Center Tecno / Azur**. Su objetivo es unificar y simplificar el proceso de cotización de planes, firmas electrónicas, módulos adicionales e integraciones.

---

## 📋 Características Principales

### 1. Nueva Venta (`/venta`)
Módulo principal para armar cotizaciones nuevas o renovaciones.
*   **Selección de Canal:** Precios dinámicos según el canal seleccionado (Azur, Local, Web).
*   **Carrito de Compras:** Permite agregar múltiples ítems (Planes, Firmas, Módulos).
*   **Persistencia de Carrito:** Al cambiar de canal, los productos se mantienen y sus precios se recalculan automáticamente.
*   **Copiado Inteligente:**
    *   📋 **Copiar Resumido:** Lista simple de servicios para el cliente.
    *   📑 **Copiar Detallado:** Desglose completo con precios unitarios, IVA y total.

### 2. Cambio de Plan (`/cambio-plan`)
Herramienta para calcular upgrades o downgrades de planes.
*   **Comparativa Visual:** Muestra una tabla con las características que se ganan (✅) o pierden (❌) al cambiar de plan.
*   **Filtrado:** Planes restringidos (Esencial, Transición, Contable) están ocultos.
*   **Mensaje Automático:** Genera un texto explicativo listo para enviar al cliente.

### 3. Integraciones (`/integraciones`)
Cotizador para servicios de API y Web.
*   **Paquetes:** Selección de paquetes base (Start, Business, Enterprise).
*   **Adicionales:** Cálculo de costos por documentos/transacciones adicionales.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Iconos:** [Lucide React](https://lucide.dev/)
*   **Base de Datos / Backend:** [Supabase](https://supabase.com/) (PostgreSQL)

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
*   Node.js (v18 o superior)
*   NPM

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/rkrichard91/azurapp.git
    cd azurapp
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Solicitud:**
    Crear un archivo `.env` en la raíz (basado en `.env.local` si existe) con las credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anonima
    ```

4.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🗄️ Configuración de Base de Datos

El proyecto incluye un script SQL completo para generar la estructura de tablas y cargar los datos iniciales (Planes, Precios, Canales).

1.  Ir al archivo: `database/full_schema_and_seed.sql`
2.  Copiar el contenido.
3.  Pegarlo y ejecutarlo en el **SQL Editor** de tu proyecto en Supabase.

---

## 📂 Estructura del Proyecto

```
/src
  ├── /components    # Componentes reutilizables (Botones, Layouts, SummaryCard)
  ├── /context       # Estado global (Canal seleccionado)
  ├── /pages         # Vistas principales (NewSale, PlanChange, Integrations)
  ├── /services      # Lógica de conexión con Supabase
  └── App.jsx        # Configuración de Rutas
```
