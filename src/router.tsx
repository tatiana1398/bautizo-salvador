import Index from "./pages/Index";

export const routers = [
  {
    path: "*",
    // Cualquier ruta muestra la invitación.
    element: <Index />,
  },
];
