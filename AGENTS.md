# AGENTS.md

Frontend de **Triviando**: UI de quizzes interactivos potenciados con IA, construida con Next.js 15 (App Router) + TypeScript + Tailwind/shadcn. Paquete único (sin monorepo). Se conecta a un backend REST separado por HTTP — el backend **no** está en este repo.

## Comandos (verificados)

```bash
npm run dev               # dev server en :3000; backend esperado en http://localhost:8080
npm test                  # jest CON cobertura siempre activa (collectCoverage: true) + umbral 70%, ~70s, 54 suites
npm run lint              # eslint . (ver gotcha abajo)
npx tsc --noEmit          # typecheck — no existe script npm para esto; CI tampoco lo corre
npm run build             # next build (output: 'standalone')
```

Ejecutar un solo test:

```bash
npx jest src/app/tests/utils/capitalize.spec.ts --coverage=false
```

`--coverage=false` es obligatorio en corridas parciales; sin él, el umbral global del 70% de cobertura hace fallar la corrida. Ídem para `npx jest --watch --coverage=false` (el script `test:watch` no lo desactiva).

**`npm run lint` falla después de `npm run build`**: la flat config no ignora `.next/`, así que ESLint linkea el output compilado de webpack y reporta cientos de errores. Linkear solo el código fuente: `npx eslint src` (hoy pasa limpio).

Orden de verificación local (replica CI en `.github/workflows/ci.yml`, que hace lint → test → build en Node 18):

```bash
npx eslint src && npm test && npx tsc --noEmit && npm run build
```

## Arquitectura

- Todo vive bajo `src/app`. Las páginas están en el route group `(pages)`:
  - públicas: `login`, `register`, `forgot-password`, `reset-password`, `policy`, `terms`, `payment`, `unauthorized`
  - app autenticada: `(pages)/[username]/{topics, quiz/[topic], results, leaderboard, profile}` — el segmento de URL es el username del usuario.
- `src/middleware.ts` es quien maneja rutas/auth. El JWT vive en una cookie `token` **no HttpOnly** (se escribe desde el cliente con `js-cookie` y se lee con `nookies`). El middleware la decodifica y: `/` → redirect a `/{sub}/topics`; el username de la URL debe igualar el `sub` del JWT (case-insensitive), si no redirige a `/unauthorized`; `publicRoutes` y `/payment` se resuelven aparte. También deja pasar `/frontend-api/*`. Cualquier cambio de rutas/auth arranca acá.
- Llamadas al backend: `src/app/services/baseService.ts` crea una instancia axios con `baseURL = ${API_URL_SERVER | NEXT_PUBLIC_API_URL_CLIENT}/api/v1` (SSR vs CSR, default `http://localhost:8080`) y adjunta `Authorization: Bearer <token>` desde la cookie. El resto de los servicios en `src/app/services/` extienden `BaseService`.
- `src/app/frontend-api/**` contiene route handlers de Next.js que actúan como BFF (hoy solo `user/avatar`) — acá es donde van los **secretos server-only** (`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`). Nunca los pongas en una var `NEXT_PUBLIC_*`.
- **Generación desde archivo**: en `topics`, `NewTopicModal` tiene dos tabs ("Por tema" / "Desde archivo"). La subida valida extensión/tamaño en `topics/utils/fileValidation.ts`, `topicService.generateTopicFromFile` hace `POST /preguntas/document/generate` (multipart) y `utils/pollGenerationJob.ts` consulta `GET /preguntas/document/jobs/{jobId}` hasta `COMPLETED`/`FAILED`. El `jobId` y el progreso viven en `topicCreationStore` (persistido) para reanudar el polling tras un refresh. `utils/topicMapper.ts` centraliza el mapeo DTO→UI y la comparación de nombres; `utils/apiError.ts` unifica el toast de errores de la página.
- Las variables de entorno salen de `.env` (gitignored; template: `.env.template`): `API_URL_SERVER`, `NEXT_PUBLIC_API_URL_CLIENT`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Docker (`Dockerfile`, `docker-compose.yml`) lee `env_file: .env` y pasa las `NEXT_PUBLIC_*` como **build args** (se inlinean en tiempo de build). El README menciona `.env.local`, pero compose/Docker solo leen `.env`.
- `src/app/utils/env.ts` hardcodea `http://localhost:8080` y no se importa en ningún lado — no lo copies; la config real es `process.env` en `baseService.ts`.

## Particularidades de los tests

- Los tests viven en `src/app/tests/**`, espejando el árbol fuente (`*.spec.ts(x)`); el setup `src/app/tests/jest.setup.ts` mockea `useRouter` de `next/navigation` dejándole solo `push`.
- Jest corre vía `next/jest`; path alias `@/*` → `src/*`. Entorno jsdom.
- La cobertura tiene una lista larga de exclusiones en `jest.config.ts` — en particular todos los `page.tsx`/`layout.tsx` están excluidos, así que no agregues tests de páginas esperando computar cobertura. Mantené las exclusiones al día al agregar archivos nuevos de config o leaf files, o la cobertura baja del gate del 70%.
- Todas las interacciones con backend/Cloudinary/Google están mockeadas en los tests; no se requieren servicios corriendo.

## Gotchas de tooling

- ESLint 9 usa la flat config `eslint.config.mjs` (`next/core-web-vitals` + `next/typescript`). El `.eslintrc.js` legacy está **inerte** — sus reglas (`no-console`, etc.) no se aplican. No lo edites esperando un efecto.
- No hay dependencia de Prettier ni script de formateo; `.prettierrc` + `.vscode/settings.json` formatean al guardar en VS Code. Respetá el estilo a mano: comillas simples, punto y coma, trailing commas, 100 columnas. `npm run lint` **no** formatea (el README dice lo contrario).
- La sección de estructura del README está desactualizada: el layout real es `src/app/{components,services,stores,hooks,domain,schemas,security,tests,frontend-api}` más `src/utils` y `src/types` — no `src/services` de nivel raíz, etc.

## Git

- La rama de trabajo es `develop`; CI corre en pushes/PRs a `main` y `develop`.
- Los mensajes de commit usan prefijos como `[FEAT]` / `[FIX]` seguidos de una descripción corta en español.
