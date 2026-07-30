import { createBrowserRouter } from "react-router";
import { RootLayout }     from "./pages/RootLayout";
import { HomePage }       from "./pages/HomePage";
import { CollectionPage } from "./pages/CollectionPage";
import { RendersPage }    from "./pages/RendersPage";
import { ResumePage }     from "./pages/ResumePage";
import { NotFoundPage }   from "./pages/NotFoundPage";
import { EncargoPage }    from "./pages/EncargoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,               Component: HomePage },
      { path: "renders",           Component: RendersPage },
      { path: "coleccion/:slug",   Component: CollectionPage },
      { path: "resume",            Component: ResumePage },
      { path: "cv",                Component: ResumePage },
      { path: "encargo",           Component: EncargoPage },
      { path: "*",                 Component: NotFoundPage },
    ],
  },
]);
