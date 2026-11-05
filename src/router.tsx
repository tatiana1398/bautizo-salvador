import Index from "./pages/Index";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    // Cualquier otra ruta (por ejemplo, el archivo .html suelto) muestra la invitación.
    element: <Index />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
