# Rutinas Gym · Programa W2

Web app móvil para registrar la rutina del gimnasio: modo entrenamiento serie
por serie, planilla semanal (réplica de la hoja de papel) y último
entrenamiento realizado. Stack: **Vite + React + Supabase**, deploy en **Vercel**.

## 1. Base de datos (Supabase)

1. Entrá a tu proyecto en [supabase.com](https://supabase.com) (o creá uno nuevo).
2. Abrí **SQL Editor → New query**, pegá el contenido de `supabase/schema.sql` y ejecutalo (Run).
3. Crea 3 tablas con RLS activado: `registros_serie` (cada serie con fecha),
   `planilla` (la grilla semanal) y `estado` (semana actual).
4. En **Authentication → Providers**, verificá que **Email** esté habilitado.
   Sugerencia: en **Authentication → Sign In / Up** podés desactivar
   "Confirm email" para no depender del correo de confirmación (es una app personal).

> Las semanas 1 a 5 de la hoja de papel **no necesitan seed**: viven en
> `src/data/rutina.js` como fallback. Si editás una celda en la app, el valor
> de la DB pisa al del papel.

## 2. Correr en local

```bash
npm install
cp .env.example .env   # completar con URL y anon key de Supabase (Settings > API)
npm run dev
```

Abrí la app, tocá **Crear cuenta** con tu email y contraseña, y listo.

⚠️ La **anon key** puede ir en el `.env` del cliente (es pública por diseño;
la seguridad la dan las políticas RLS). La **service_role key nunca** va en
este repo ni en el navegador.

## 3. Deploy en Vercel

1. Subí el repo a GitHub.
2. En Vercel: **Add New → Project → importar el repo** (detecta Vite solo).
3. En **Settings → Environment Variables** agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. En el teléfono, abrí la URL y usá **"Agregar a pantalla de inicio"**
   (Safari: Compartir → Agregar a inicio / Chrome: menú ⋮ → Agregar a pantalla
   principal). Queda como app con ícono propio gracias al manifest PWA.

## 4. Estructura

```
src/
  App.jsx           # UI completa + sincronización con Supabase
  data/rutina.js    # Programa W2 (ejercicios, descripciones, datos del papel)
  lib/supabase.js   # Cliente
supabase/schema.sql # Tablas + RLS + triggers
```

## 5. Cuando termine el programa (semana 8)

El programa es fijo por 8 semanas, por eso vive en código. Cuando el profe
entregue el W3: editar `src/data/rutina.js` con los ejercicios nuevos y,
si se quiere conservar el historial, versionar el campo `dia`
(ej. `w3-d1`) o agregar una columna `programa` a las tablas.

## Ideas pendientes (para seguir con Claude Code)

- Temporizador de descanso entre series.
- Gráfico de progresión de peso por ejercicio.
- Historial de sesiones por fecha (ya se guarda `updated_at` en cada serie).
- Botón "repetir pesos de la semana pasada".
