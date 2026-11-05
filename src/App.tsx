import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";

const router = createBrowserRouter(routers, { basename: import.meta.env.BASE_URL });

const App = () => <RouterProvider router={router} />;

export default App;
