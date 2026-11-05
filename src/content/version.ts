/**
 * La invitación tiene dos versiones del nombre:
 * - "arte": el nombre caligráfico con la paloma (imagen). Es la versión por defecto.
 * - "texto": el nombre escrito con la tipografía de la invitación y la paloma arriba.
 *   Se abre en /version-2 (o agregando ?version=texto al link).
 */
export type NameVersion = "arte" | "texto";

export const nameVersion: NameVersion =
  typeof window !== "undefined" &&
  (window.location.pathname.replace(/\/$/, "").endsWith("/version-2") ||
    new URLSearchParams(window.location.search).get("version") === "texto")
    ? "texto"
    : "arte";
