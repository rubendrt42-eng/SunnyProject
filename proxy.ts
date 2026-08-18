import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Cierra la puerta a las rutas de API de la versión avanzada.
 *
 * POR QUÉ HACE FALTA ALGO ADEMÁS DE LAS REDIRECCIONES
 *
 * `next.config.ts` ya redirige las **páginas** de la versión avanzada —/admin,
 * /mi-pase, /acceso— a la portada. Pero los endpoints siguen desplegados y
 * respondiendo: `/api/reservations/claim`, `/api/admin/reservations/export`,
 * `/api/partner-leads`. La auditoría los encontró accesibles.
 *
 * No es teórico. `/api/admin/reservations/export` devuelve un CSV de
 * reservaciones y `/api/partner-leads` escribe en Supabase. Que hoy fallen por
 * falta de credenciales no es una defensa: es una puerta cerrada con llave
 * puesta. En cuanto alguien configure Supabase en este proyecto por error, la
 * puerta se abre sola.
 *
 * QUÉ DEVUELVE Y POR QUÉ 404
 *
 * 404, no 403 ni una redirección:
 *
 * - **No 403**, porque «prohibido» dice que el recurso existe y solo falta
 *   permiso. Aquí la respuesta honesta es que en este producto no existe.
 * - **No redirección**, porque un POST redirigido a la portada devolvería HTML
 *   a quien esperaba JSON, y el error resultante sería incomprensible.
 * - **404 con cuerpo JSON**, porque quien llame a esto espera JSON.
 *
 * EL COSTE
 *
 * El `matcher` limita esta función a las tres familias de rutas bloqueadas. El
 * tráfico normal —portada, experiencias, el formulario del MVP— no pasa por
 * aquí y no paga nada.
 *
 * ESTO NO BORRA NADA
 *
 * Los archivos siguen en el repositorio y en las ramas avanzadas. La segunda
 * etapa solo tiene que quitar la ruta de `config.matcher`.
 */
export function proxy(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Esta función no forma parte de esta versión de The Sunny Project.",
      path: request.nextUrl.pathname,
    },
    { status: 404 },
  );
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/reservations/:path*", "/api/partner-leads"],
};
