# Sunny MVP 1.1 — Decisiones de producto aprobadas

Este documento registra las decisiones de producto aprobadas para Sunny MVP 1.1 (grupos/acompañantes), tomadas en respuesta a las preguntas abiertas de `SUNNY_MVP_1_1_AUDIT.md` §19.

**Estado: aprobadas, no implementadas.** Todo lo que describe este documento pertenece a la **Fase 2**. La fase actual (esta rama, `claude/sunny-mvp-1-1-implementation`) es exclusivamente estabilizar el flujo individual existente (1 lugar, sin acompañantes) — no se toca el esquema de Supabase, no se agrega `party_size`, no se agrega `reservation_companions`, y la lógica canónica de "un lugar por reservación" en `claim_reservation()` permanece exactamente como está hoy.

## Decisiones aprobadas

1. **Modelo de datos de acompañantes**: se guardarán en una tabla relacional `reservation_companions`, no en una columna de arreglo.

2. **Campos de `reservation_companions`**: nombre completo (obligatorio), correo (opcional), estado de asistencia, y relación (foreign key) con una reservación.

3. **Momento de captura**: los nombres de los acompañantes se capturan al momento de reservar. El MVP no incluye edición posterior de acompañantes.

4. **Tamaño de grupo**: cada experiencia tendrá `max_party_size` entre 1 y 3. La persona que reserva podrá elegir cualquier `party_size` entre 1 y el `max_party_size` de esa experiencia.

5. **Cancelación grupal**: todo-o-nada. Cancelar una reservación cancela al titular, a todos los acompañantes, y libera todos los lugares del grupo — no existe cancelación parcial en el MVP.

6. **Acompañantes y el pase semanal**: los acompañantes no necesitan cuenta propia y no consumen su propio pase semanal durante el piloto.

7. **Responsabilidad del titular**: el pase pertenece a quien reserva (el titular); el titular responde por todo su grupo.

8. **Máximo predeterminado**: toda experiencia nace con `max_party_size = 1`. Emmy debe habilitar explícitamente 2 o 3 lugares por reservación — nunca es el comportamiento por defecto.

9. **Aliados públicos**: un negocio activo (`businesses.active = true`) no se convierte automáticamente en "aliado público" para la sección "Espacios aliados" de Home. Eso requiere una bandera explícita adicional (p. ej. `featured_as_partner`), que se agregará en una fase posterior.

10. **Alcance de "duplicar" una experiencia**: copia el contenido y la configuración (título, descripción, categoría, imagen, requisitos, qué incluye, restricciones, instrucciones, negocio, capacidad, `max_party_size`, etc.), pero **deja las fechas vacías**, el estado en `draft`, y **no copia** reservaciones, folios ni estadísticas de la experiencia original.

11. **Encuesta posterior**: queda como P2. Durante el piloto se maneja manualmente (fuera de la plataforma), no como una función construida en el producto.

## Qué NO ocurre en esta fase

- No se crean las columnas `experiences.max_party_size` ni `reservations.party_size`.
- No se crea la tabla `reservation_companions`.
- No se modifica `claim_reservation()`, `cancel_reservation()`, `reserved_counts_for_experiences()`, ni ninguna otra función SQL existente.
- No se modifica el esquema de Supabase de ninguna forma.
- No se toca `ClaimPanel`, `QuickView`, ni el formulario de reclamo para agregar campos de grupo/acompañantes.
- No se implementa la bandera `featured_as_partner` ni la acción "duplicar" en el panel de Emmy.
- No se construye la encuesta posterior.

Todo lo anterior queda pendiente para la Fase 2, una vez que el flujo individual actual esté validado y estable (ver `INDIVIDUAL_FLOW_QA_RUNBOOK.md` y los hallazgos de esta fase).
