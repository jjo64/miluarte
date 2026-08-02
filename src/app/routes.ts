import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./pages/RootLayout";

// Route-based code splitting: each page is a separate chunk downloaded on demand.
// This reduces the initial JS bundle from ~703KB to ~150KB, cutting LCP render delay.
const HomePage       = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CollectionPage = lazy(() => import("./pages/CollectionPage").then(m => ({ default: m.CollectionPage })));
const RendersPage    = lazy(() => import("./pages/RendersPage").then(m => ({ default: m.RendersPage })));
const ResumePage     = lazy(() => import("./pages/ResumePage").then(m => ({ default: m.ResumePage })));
const NotFoundPage   = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const EncargoPage    = lazy(() => import("./pages/EncargoPage").then(m => ({ default: m.EncargoPage })));

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
