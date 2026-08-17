import { createElement, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./pages/RootLayout";
import { AdminGuard } from "./components/admin/AdminGuard";

function lazyWithReload<T extends { default: React.ComponentType<any> }>(factory: () => Promise<T>) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes("dynamically imported module") ||
        error?.message?.includes("Loading chunk") ||
        error?.name === "ChunkLoadError";

      if (isChunkError) {
        const lastReload = sessionStorage.getItem("last_chunk_reload");
        const now = Date.now();
        // Evitar bucles infinitos de recarga (máximo 1 recarga cada 10 seg)
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("last_chunk_reload", now.toString());
          window.location.reload();
        }
      }
      throw error;
    }
  });
}

// Route-based code splitting con auto-recarga ante nuevos despliegues en producción
const HomePage       = lazyWithReload(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CollectionPage  = lazyWithReload(() => import("./pages/CollectionPage").then(m => ({ default: m.CollectionPage })));
const CollectionsPage = lazyWithReload(() => import("./pages/CollectionsPage").then(m => ({ default: m.CollectionsPage })));
const RendersPage     = lazyWithReload(() => import("./pages/RendersPage").then(m => ({ default: m.RendersPage })));
const ResumePage      = lazyWithReload(() => import("./pages/ResumePage").then(m => ({ default: m.ResumePage })));
const NotFoundPage    = lazyWithReload(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const EncargoPage     = lazyWithReload(() => import("./pages/EncargoPage").then(m => ({ default: m.EncargoPage })));

// Admin pages
const AdminLogin         = lazyWithReload(() => import("./pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard     = lazyWithReload(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminGalleries     = lazyWithReload(() => import("./pages/admin/AdminGalleries").then(m => ({ default: m.AdminGalleries })));
const AdminGalleryEditor = lazyWithReload(() => import("./pages/admin/AdminGalleryEditor").then(m => ({ default: m.AdminGalleryEditor })));
const AdminRendersEditor = lazyWithReload(() => import("./pages/admin/AdminRendersEditor").then(m => ({ default: m.AdminRendersEditor })));
const AdminMessages      = lazyWithReload(() => import("./pages/admin/AdminMessages").then(m => ({ default: m.AdminMessages })));
const AdminSocial        = lazyWithReload(() => import("./pages/admin/AdminSocial").then(m => ({ default: m.AdminSocial })));
const AdminChangelog     = lazyWithReload(() => import("./pages/admin/AdminChangelog").then(m => ({ default: m.AdminChangelog })));
const AdminHomeEditor    = lazyWithReload(() => import("./pages/admin/AdminHomeEditor").then(m => ({ default: m.AdminHomeEditor })));

function withAdminGuard(Component: React.ComponentType) {
  return function ProtectedRoute() {
    return createElement(AdminGuard, null, createElement(Component));
  };
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,               Component: HomePage },
      { path: "renders",           Component: RendersPage },
      { path: "colecciones",       Component: CollectionsPage },
      { path: "collections",       Component: CollectionsPage },
      { path: "coleccion/:slug",   Component: CollectionPage },
      { path: "resume",            Component: ResumePage },
      { path: "cv",                Component: ResumePage },
      { path: "encargo",           Component: EncargoPage },
      { path: "*",                 Component: NotFoundPage },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: withAdminGuard(AdminDashboard),
  },
  {
    path: "/admin/inicio",
    Component: withAdminGuard(AdminHomeEditor),
  },
  {
    path: "/admin/galerias",
    Component: withAdminGuard(AdminGalleries),
  },
  {
    path: "/admin/galerias/:slug",
    Component: withAdminGuard(AdminGalleryEditor),
  },
  {
    path: "/admin/renders",
    Component: withAdminGuard(AdminRendersEditor),
  },
  {
    path: "/admin/mensajes",
    Component: withAdminGuard(AdminMessages),
  },
  {
    path: "/admin/redes",
    Component: withAdminGuard(AdminSocial),
  },
  {
    path: "/admin/historial",
    Component: withAdminGuard(AdminChangelog),
  },
]);
