import { createElement, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./pages/RootLayout";
import { AdminGuard } from "./components/admin/AdminGuard";

// Route-based code splitting: each page is a separate chunk downloaded on demand.
const HomePage       = lazy(() => import("./pages/HomePage").then(m => ({ default: m.HomePage })));
const CollectionPage = lazy(() => import("./pages/CollectionPage").then(m => ({ default: m.CollectionPage })));
const RendersPage    = lazy(() => import("./pages/RendersPage").then(m => ({ default: m.RendersPage })));
const ResumePage     = lazy(() => import("./pages/ResumePage").then(m => ({ default: m.ResumePage })));
const NotFoundPage   = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
const EncargoPage    = lazy(() => import("./pages/EncargoPage").then(m => ({ default: m.EncargoPage })));

// Admin pages
const AdminLogin         = lazy(() => import("./pages/admin/AdminLogin").then(m => ({ default: m.AdminLogin })));
const AdminDashboard     = lazy(() => import("./pages/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const AdminGalleries     = lazy(() => import("./pages/admin/AdminGalleries").then(m => ({ default: m.AdminGalleries })));
const AdminGalleryEditor = lazy(() => import("./pages/admin/AdminGalleryEditor").then(m => ({ default: m.AdminGalleryEditor })));
const AdminRendersEditor = lazy(() => import("./pages/admin/AdminRendersEditor").then(m => ({ default: m.AdminRendersEditor })));
const AdminTextEditor    = lazy(() => import("./pages/admin/AdminTextEditor").then(m => ({ default: m.AdminTextEditor })));
const AdminMessages      = lazy(() => import("./pages/admin/AdminMessages").then(m => ({ default: m.AdminMessages })));
const AdminSocial        = lazy(() => import("./pages/admin/AdminSocial").then(m => ({ default: m.AdminSocial })));
const AdminChangelog     = lazy(() => import("./pages/admin/AdminChangelog").then(m => ({ default: m.AdminChangelog })));

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
    path: "/admin/textos",
    Component: withAdminGuard(AdminTextEditor),
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
