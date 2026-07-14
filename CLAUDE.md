# CLAUDE.md — Contexto del proyecto

## Qué es
Web app móvil personal (un solo usuario: Martín) para registrar rutinas de
gimnasio del programa "W2" (8 semanas, 5 días + abdominales). Reemplaza una
hoja de papel donde se anotaban pesos por semana.

## Stack
- Vite + React 18 (JSX, sin TypeScript por ahora), estilos inline en `App.jsx`.
- Supabase: auth email/password + Postgres con RLS (`supabase/schema.sql`).
- Deploy en Vercel. PWA básica vía `public/manifest.webmanifest`.

## Modelo de datos
- La **rutina** (ejercicios, series×reps, descripciones) es estática y vive en
  `src/data/rutina.js`. No está en la DB a propósito: cambia solo cada 8 semanas.
- `PRE` en `rutina.js` tiene los valores históricos transcriptos de la hoja de
  papel (semanas 1-5). Actúan como **fallback**: `gridVal()` devuelve el valor
  de la DB si existe, si no el del papel. No hay seed.
- Tablas (todas con RLS `auth.uid() = user_id`):
  - `registros_serie(dia, semana, ejercicio, orden, kg, reps, hecho, updated_at)`
    → una fila por serie del modo entrenamiento. `updated_at` + `hecho` se usan
    para "último entrenamiento".
  - `planilla(dia, semana, ejercicio, valor)` → la grilla semanal editable.
  - `estado(user_id, semana_actual)` → semana activa del programa.
- Índices: `dia` es `'d1'..'d5' | 'abs'`; `ejercicio` y `orden` son 0-based en
  el código, `semana` es 1-based en la DB (ojo con el desfasaje: en `grid` del
  estado local las semanas son 0-based).

## Sincronización
`useDB()` en `App.jsx`: carga todo al login, mutaciones optimistas en estado
local + upsert debounced (600 ms) por clave lógica. `onConflict` usa las
uniques compuestas. Indicador "Sincronizado / Guardando…" con `saved`.

## Convenciones
- Idioma de UI y comentarios: español rioplatense (vos/tocá/anotá).
- Paleta: fondo `#0F1216`, acento cian `#5CD8F7` (imita el resaltador de la
  hoja), valores de planilla en fuente Caveat color tinta `#A9BAFF` (imita la
  letra manuscrita). Mantener esa identidad.
- Mobile-first, max-width 520px, botones grandes (se usa entre series, con
  manos transpiradas).

## Seguridad
- Solo anon key en el cliente. Nunca service_role en el repo/browser.
- RLS obligatorio en toda tabla nueva.

## Pendientes sugeridos
- Temporizador de descanso entre series.
- Gráfico de progresión (peso por semana por ejercicio).
- Vista de historial por fecha.
- Migración a programa W3 al terminar la semana 8 (versionar `dia` o agregar
  columna `programa`).
