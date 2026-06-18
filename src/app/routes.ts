import { createBrowserRouter } from "react-router";
import { RootLayout }     from "./pages/RootLayout";
import { HomePage }       from "./pages/HomePage";
import { CollectionPage } from "./pages/CollectionPage";
import { NotFoundPage }   from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,               Component: HomePage },
      { path: "coleccion/:slug",   Component: CollectionPage },
      { path: "*",                 Component: NotFoundPage },
    ],
  },
]);
