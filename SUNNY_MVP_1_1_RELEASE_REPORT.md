# Sunny MVP 1.1 — Reporte de entrega

Rama: **`claude/sunny-mvp-1-1-design-admin`** · base: `claude/sunny-mvp-1-1-implementation` @ `03af409`

---

## 1. Lo primero: tres cosas que debes saber antes de seguir

1. **Las fotografías adjuntas no son de Sunny.** 15 de las 16 imágenes de `PaginaWeb` miden exactamente 736 px de ancho — el ancho canónico del feed de Pinterest — y varias llevan marca ajena legible (`CRUISE CONTROL RUN CLUB` frente a un local en **Bangkok**, `OYSHO RUNNING CLUB MAD` de Madrid, `OACE`, `POUNCE PADEL`). Ninguna es de Monterrey. Se usan en el Preview para que puedas evaluar el diseño con fotografía real; **no pueden publicarse en producción** sin una sesión propia de Emmy o licencia. Detalle en `SUNNY_ASSET_MANIFEST.md` §0.
2. **Auth sigue sin probarse.** El límite `over_email_send_rate_limit` continúa vigente y el brief prohíbe reintentar OTP. **No declaro que el magic link funcione.**
3. **Las migraciones no se aplicaron a ninguna base.** La garantía de no-sobreventa **no está demostrada**: vive en SQL que nunca corrió. Ver §7.

---

## 2. Qué se implementó

**Fase 1 — análisis** · `SUNNY_REFERENCE_ANALYSIS.md`, `SUNNY_VISUAL_DIRECTION_1_0.md`, `SUNNY_ASSET_MANIFEST.md`.

**Fase 2 — sistema visual** · 13 fotografías convertidas a WebP (1.2 MB) en siete carpetas semánticas · registro tipado en `lib/media.ts` con alt real · escala tipográfica nombrada · color secundario único (pine, dos usos) · tokens de radio (botones de 10 px, no cápsulas) · `Button` con estado de carga real · `Badge` con tono pine y sobre-foto + sello Sunny Original · `SocialModes` · `EmptyState` · `ExperienceMarquee`.

**Fase 3 — Home** · reordenada al orden del brief: hero → cinta → esta semana → intención → qué es Sunny → cómo funciona → comunidad → Originals → categorías → aliados → pase → negocios → FAQ → cierre. Hero como split editorial. Header sólido en todas las rutas y sensible a la sesión (Acceso / Mi pase + Mi cuenta / + Panel). Secciones nuevas: cinta de experiencias, selector por intención, Qué es Sunny (con Emmy en un párrafo y una foto), Comunidad, Sunny Originals, Espacios aliados. "Cómo funciona" con los cinco pasos, sticky en `lg:` y secuencia vertical debajo.

**Fase 4 — catálogo y experiencia** · filtros por intención + Originals + conteo de resultados · agotadas separadas al final, no escondidas · Quick View direccionable como `?ver=<slug>` con CTA fijo · detalle con modalidad, acompañantes, instrucciones, política de cancelación y cupos por reservación · `ShareButton` (hoja nativa + WhatsApp + copiar enlace, con confirmación por `aria-live`).

**Fase 5 — panel de Emmy** · shell nuevo · dashboard que responde preguntas en vez de apilar métricas · experiencias con publicar/ocultar/duplicar/destacar/Original/archivar y 8 filtros · reservaciones con 5 filtros, paginación y acompañantes · negocios con aliado público y estadísticas reales · solicitudes con pipeline, notas internas y conversión · **`/admin/usuarios` nueva**.

**Fase 6 — acompañantes** · dos migraciones preparadas · UI de selector y nombres · correo, Mi pase y panel mostrando el grupo · 31 pruebas.

**Fase 7 — QA** · 24 capturas revisadas · 4 defectos visuales corregidos · documentos de entrega.

---

## 3. Qué se conservó

El flujo individual completo, intacto · los logs seguros de `/auth/callback` (nunca token, código, cookie ni correo completo) · el endurecimiento contra redirects externos · `claim_reservation()` como única vía de inserción · la ventana de cancelación de 12 h · el pase semanal de uno · `ManagedPhoto` y su estado honesto de foto ausente · la convención `[Demostración]` · RLS y todas las funciones `admin_*` · el stack (Next, Supabase, Resend, Tailwind, Vercel).

---

## 4. Qué se eliminó

`HeroVideo.tsx`, `HeroExperienceRotator.tsx`, `useVideoAllowed.ts` — sin uso tras el hero nuevo; mantener código muerto que promete video inexistente es peor que borrarlo · `CATEGORY_PHOTOS` y `demoPhotoForSlug` en `lib/media.ts` — duplicaban la fuente de verdad · logotipos SVG de relleno en los negocios demo — implicaban una marca que no existe · la copy **"no admite acompañantes"** en los 6 archivos donde vivía · las rutas `/demo-assets/*` que apuntaban a archivos borrados dos fases atrás.

---

## 5. Decisiones tomadas (y por qué)

| Decisión | Motivo |
|---|---|
| Hero como split editorial, no media a sangre | No hay video ni fotografía horizontal; 736 px estirado a 1440 se vería suave |
| Header sólido siempre | El hero es claro; texto blanco sobre marfil era invisible. Elimina la clase de bug en vez de ajustarla |
| Dos migraciones separadas por riesgo | La aditiva entrega casi todo el valor visible sin tocar la lógica de cupo |
| `status` **no** migrado a 7 valores | 4 de los 7 son derivables; almacenarlos permitiría contradicciones |
| Duplicar deja fecha +1 semana | Tres columnas de fecha son `NOT NULL`; la decisión 10 pide vacías, imposible. Documentado, no silenciado |
| `Pádel Mix-In` en lugar de `Sunrise Paddle` | La carpeta `Padel` es pádel de raqueta, no paddle board. Se corrigió el contenido, no la foto |
| `Recovery & Breathwork`, `Mat Pilates` | No hay foto de sauna/hielo ni de camas reformer |
| 3 imágenes descartadas | Marca de terceros legible |
| `outdoor` sin foto de categoría | No existe imagen outdoor; prestarle una ajena sería el error que el manifiesto evita |
| Sin `/admin/configuracion` | No había nada que configurar; una pantalla vacía es alcance por alcance |
| Aliados y Originals condicionales | Sin dato real, la sección no se renderiza |
| Usuarios de solo lectura | Sin edición de rol, contraseñas ni envíos masivos |
| `overflow-x: clip` y no `hidden` | `hidden` rompería `position: sticky` |

---

## 6. Bugs encontrados y corregidos

Cinco no estaban en el alcance pedido; salieron de probar en serio.

1. **`/admin` se servía a peticiones anónimas** (preexistente, seguridad). `redirect()` en un layout no impide que el HTML se envíe en esta versión de Next: devolvía **200 con el panel completo** más un `<meta refresh>`. `curl /admin` traía 42 KB del dashboard. Sin fuga de datos privados (RLS), pero la estructura salía. Compuerta movida a `proxy.ts`: **307, cuerpo de 21 bytes**. 6 pruebas.
2. **Sobrecarga de `claim_reservation`**: agregar parámetros no reemplaza. La función de 2 argumentos habría sobrevivido contando filas y habría reintroducido la sobreventa. `DROP` explícito.
3. **Tipo de retorno de `reserved_counts_for_experiences`**: `CREATE OR REPLACE` no puede cambiarlo; ampliarlo a `bigint` habría hecho fallar la migración entera.
4. **150 px de scroll horizontal en Home a 375 px**: `truncate` daba 505 px de min-content a una columna del grid.
5. **Palabras pegadas en el hero** ("algonuevo"): espacio final colapsado dentro de un `inline-block` en `WordReveal` (preexistente).
6. **Fotos ausentes** en Categorías y Para negocios: rutas a archivos borrados.

---

## 7. Migraciones — estado exacto

| Archivo | Riesgo | Aplicada |
|---|---|---|
| `20260201000000_experience_presentation.sql` | **Bajo** — solo `add column` + un CHECK ampliado | ❌ No |
| `20260201000100_group_reservations.sql` | **Alto** — reescribe el conteo de cupo | ❌ No |

**No se aplicó SQL en ningún entorno.** No hay proyecto de staging ni rama de Supabase, Supabase no es alcanzable desde aquí, y las herramientas MCP de Supabase se desconectaron a mitad de sesión.

`SUNNY_COMPANIONS_MIGRATION_PLAN.md` contiene esquema, funciones, orden de aplicación, **20 pruebas SQL obligatorias** (incluida la de concurrencia con dos sesiones psql), riesgos y rollback con la advertencia de no revertir si ya existe algún grupo.

**Recomendación**: aplica la primera (segura) para ver Originals, modalidad, archivar y aliados. Deja la segunda detrás de la barrera hasta poder correr las 20 pruebas en un entorno aislado.

---

## 8. Estado de auth

Sin cambios de lógica. Se conservan los logs seguros y el endurecimiento de redirects. El último error real observado sigue siendo `429 / over_email_send_rate_limit` del mailer de prueba de Supabase.

**No se envió ningún OTP en esta sesión.** **No declaro que el magic link funcione.** Sigue pendiente tu prueba manual real cuando se libere el límite; si vuelve a fallar, la vía es SMTP propio (Resend) en la configuración de Supabase Auth, que ninguna herramienta disponible aquí puede editar.

---

## 9. Assets

**Usados (13)**: hero (1) · experiencias (5) · comunidad (2) · Emmy (1) · negocios (1) · originals (1) · categorías (2).

**Pendientes**: video de hero (no existe material — no se fabricó) · fotografía horizontal (no existe) · fotografía propia de las 6 experiencias · logotipos de aliados (ninguno) · reemplazo de `POUNCE PADEL` · sustitutos de las 3 descartadas · foto de categoría `outdoor`.

---

## 10. Pruebas

| Compuerta | Resultado |
|---|---|
| `pnpm lint` | ✅ |
| `pnpm typecheck` | ✅ |
| `pnpm test` | ✅ 76 pruebas / 9 archivos (9 omitidas: integración con Supabase real) |
| `pnpm build` | ✅ 30 rutas |
| Scroll horizontal | ✅ 42/42 combinaciones |
| Rutas públicas | ✅ 200 |
| `/admin` sin sesión | ✅ 307 sin cuerpo |
| `/admin` con sesión admin | ✅ 200 en las 6 |
| `pnpm test:e2e` | ❌ No ejecutado: requiere Supabase alcanzable |

Nuevas: `tests/unit/admin-gate.test.ts` (6) · `tests/unit/group-reservations.test.ts` (31).

---

## 11. Riesgos que quedan

| Riesgo | Gravedad | Nota |
|---|---|---|
| Publicar las fotos de terceros | **Alta (legal)** | Bloquea producción. Sesión propia o licencia |
| Migración de grupos sin probar en SQL | **Alta** | Barrera de despliegue; 20 pruebas listas |
| Magic link sin verificar | **Alta** | Bloquea todo el flujo autenticado |
| Sin prueba en móvil físico | Media | Solo emulación de viewport |
| Correos sin enviar | Media | Resend no ejercitado |
| Texto provisional de Emmy | Baja | Un párrafo neutro; reemplázalo con sus palabras |
| Negocios demo sin logo | Baja | La tarjeta de aliado cae al nombre en letra |

---

## 12. Para Emmy

`SUNNY_EMMY_ADMIN_GUIDE.md` — cómo entrar, crear negocios y experiencias, subir foto, publicar, ocultar, duplicar, cancelar, archivar, revisar cupos, ver reservaciones y acompañantes, marcar asistencia y no-show, gestionar solicitudes, convertirlas en negocio, y consultar usuarios. Sin jerga, sin editar código.

## 13. Para el desarrollador

1. `supabase/demo_seed.sql` en el editor SQL de Supabase → las 6 experiencias demo con las fotos correctas. **Es lo único necesario para que el Preview se vea con contenido.**
2. Cuando decidas: `20260201000000_experience_presentation.sql` (segura).
3. Después: `supabase/demo_seed_groups.sql` para modalidad y el Original.
4. Solo tras las 20 pruebas en entorno aislado: `20260201000100_group_reservations.sql`.
5. `SUNNY_ADMIN_SPEC.md` para la arquitectura del panel; `SUNNY_DESIGN_QA_REPORT.md` para qué se probó y qué no.

---

## 14. Cinco pruebas manuales (máximo, en orden)

1. **Abre el Preview y recórrelo completo en tu teléfono.** Confirma que la Home baja sin scroll lateral, que el hero se lee ("Descubre algo nuevo. / Vívelo con alguien."), que las fotos cargan, y que el selector "¿Qué buscas esta semana?" cambia las tarjetas al tocarlo. *(Si aún no corriste `demo_seed.sql`, verás estados vacíos: córrelo primero.)*
2. **Magic link, un solo intento.** Pide el enlace una vez, ábrelo desde el mismo navegador, y confirma que el header cambia a *Mi pase / Mi cuenta*. Si falla con "No pudimos enviar el enlace", es el límite de correo otra vez: no reintentes, avísame.
3. **Reserva y cancela.** Con sesión: reserva una experiencia, revisa el folio en *Mi pase*, cancélala, y confirma que el número de lugares de esa experiencia baja en 1 y vuelve a subir en 1.
4. **Entra a `/admin` y prueba las acciones.** Duplica una experiencia (revisa que la fecha quedó una semana después y en borrador), ocúltala, publícala de nuevo, y marca *Mostrar como aliado* en un negocio para ver aparecer la sección de aliados en la Home.
5. **Comparte una experiencia desde el teléfono.** Botón *Compartir*: confirma que abre la hoja nativa, y que *Copiar enlace* dice "Enlace copiado." y pega una URL completa con dominio.
