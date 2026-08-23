import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

/**
 * Configuración del CLI de Sanity — la que usan `sanity deploy` y
 * `sanity schema deploy`.
 *
 * `studioHost` fija la dirección pública del Studio. Sin él, el CLI la pide de
 * forma interactiva, y este proyecto se despliega desde scripts donde no hay
 * nadie para contestar.
 *
 * Si `the-sunny-project` ya estuviera tomado por otra cuenta, el despliegue
 * falla con un mensaje claro y hay que elegir otro nombre aquí. Ver
 * MVP_SETUP.md.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "the-sunny-project",
  /**
   * El Studio se despliega aparte; no forma parte del build de Next.
   *
   * `autoUpdates` vive dentro de `deployment` desde Sanity 6: en la raíz
   * sigue funcionando pero el CLI avisa de que está obsoleto.
   */
  deployment: {
    autoUpdates: true,
    /**
     * Identidad del Studio ya desplegado. Sin ella el CLI la pregunta en cada
     * despliegue, y este proyecto se despliega desde scripts.
     */
    appId: "oawhh49w5o3sch8yhgge8fbr",
  },
});
