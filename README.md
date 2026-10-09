# Shayth Campaign Center

Panel privado para el CRM y las campañas por Gmail de Inflables Shayth. Usa Next.js App Router, TypeScript, PostgreSQL/Supabase y n8n.

## Puesta en marcha

1. Copia `.env.example` a `.env.local` y completa `DATABASE_URL`, `ADMIN_PASSWORD`, un `SESSION_SECRET` aleatorio de al menos 32 caracteres y un `N8N_INTEGRATION_SECRET` distinto.
2. En Supabase SQL Editor ejecuta `supabase/migrations/0001_initial.sql`.
3. Coloca el logo oficial sin modificar en `public/logo.png` (PNG cuadrado de 512 × 512 o mayor). El manifest, acceso y navegación ya usan esa ruta.
4. Ejecuta `npm run dev` y abre `http://localhost:3000`.
5. Importa `n8n/campaign-worker.json` y `n8n/gmail-replies.json`. En n8n configura `SHAYTH_APP_URL`, `SHAYTH_INTEGRATION_SECRET` y las credenciales OAuth de Gmail; reemplaza el marcador de credencial y activa ambos workflows.

## Producción en Vercel

Crea el proyecto desde este repositorio, carga las mismas variables de entorno y despliega. Los secretos son exclusivos del servidor y nunca deben usar el prefijo `NEXT_PUBLIC_`.

## CSV

Se reconocen encabezados en español (`nombre`, `correo`, `telefono`, `provincia`, `canton`, `contacto`, `tipo`, `estado`, `notas`) o equivalentes en inglés. Los correos duplicados se omiten.

## Contrato n8n

- `POST /api/n8n/jobs/claim` reclama hasta 25 trabajos con `x-integration-secret` y bloqueo contra dobles reclamos.
- `POST /api/n8n/jobs/report` recibe `jobId`, `status`, `gmailMessageId` y `error`. `uncertain` evita un reenvío inseguro; errores de autenticación o límites pausan la campaña.
- `POST /api/n8n/replies` registra respuestas reales, evita duplicados y actualiza la institución.

Un mensaje aceptado por Gmail se registra como enviado, nunca como entregado. No se usan píxeles de seguimiento.

## Catálogo navideño

El catálogo promocional se publica como PDF original en `/catalogo-navideno.pdf`. La plantilla “Presentación de Servicios + Catálogo Navideño” usa el logo público por HTTPS e indica que el catálogo se adjunta. El workflow n8n descarga ese PDF como binario y lo adjunta desde Gmail; el backend no duplica el adjunto.

## Verificación

Ejecuta `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.
