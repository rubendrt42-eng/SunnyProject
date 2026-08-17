# Por qué no hay `proxy.ts` en esta rama

El archivo existía para una sola cosa: refrescar la sesión de Supabase en cada
petición (`updateSession`). En el MVP lean **no hay sesiones**, así que lo único
que hacía era añadir una llamada a Supabase antes de cada página, incluidas las
estáticas — y obligar a que las variables de Supabase estuvieran configuradas
para que el sitio arrancara.

Las rutas que protegía se cierran ahora con `redirects` en `next.config.ts`,
que es lo que la documentación de Next recomienda para redirecciones simples:
se aplican antes y no ejecutan código por petición.

**El archivo sigue intacto en las ramas avanzadas** (`claude/sunny-motion-choreography`
y las demás) y en el historial de esta. Para recuperarlo:

    git checkout claude/sunny-motion-choreography -- proxy.ts
