import { Routes } from "@angular/router";
import { authenticatedGuard } from "./core/auth.guard";

/**
 * Raíz de composición de navegación. Las páginas de feature son diferidas para que cada ruta posea su división de código.
 */
export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./features/discovery/home/home.page").then(
        (m) => m.HomePageComponent,
      ),
  },
  {
    path: "explorar",
    loadComponent: () =>
      import("./features/discovery/explore/explore.page").then(
        (m) => m.ExplorePageComponent,
      ),
  },
  {
    path: "especies",
    loadComponent: () =>
      import("./features/catalog/species-list/species-list.page").then(
        (m) => m.SpeciesListPageComponent,
      ),
  },
  {
    path: "especies/:id",
    loadComponent: () =>
      import("./features/catalog/species-detail/species-detail.page").then(
        (m) => m.SpeciesDetailPageComponent,
      ),
  },
  {
    path: "mapa",
    loadComponent: () =>
      import("./features/observations/map/map.page").then(
        (m) => m.MapPageComponent,
      ),
  },
  {
    path: "avistamientos/nuevo",
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import("./features/observations/new-sighting/new-sighting.page").then(
        (m) => m.NewSightingPageComponent,
      ),
  },
  {
    path: "avistamientos",
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import("./features/observations/my-sightings/my-sightings.page").then(
        (m) => m.MySightingsPageComponent,
      ),
  },
  {
    path: "lugares",
    data: { view: "places" },
    loadComponent: () =>
      import("./features/planning/planning.page").then(
        (m) => m.PlanningPageComponent,
      ),
  },
  {
    path: "rutas",
    data: { view: "routes" },
    loadComponent: () =>
      import("./features/planning/planning.page").then(
        (m) => m.PlanningPageComponent,
      ),
  },
  {
    path: "comunidad",
    loadComponent: () =>
      import("./features/community/community-feed/community-feed.page").then(
        (m) => m.CommunityFeedPageComponent,
      ),
  },
  {
    path: "perfil",
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import("./features/accounts/profile/profile.page").then(
        (m) => m.ProfilePageComponent,
      ),
  },
  {
    path: "colecciones",
    canActivate: [authenticatedGuard],
    data: { view: "collections", title: "Mis colecciones" },
    loadComponent: () =>
      import("./features/tools/tools.page").then((m) => m.ToolsPageComponent),
  },
  {
    path: "notificaciones",
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import("./features/community/notifications/notifications.page").then(
        (m) => m.NotificationsPageComponent,
      ),
  },
  {
    path: "administracion",
    canActivate: [authenticatedGuard],
    data: { view: "admin", title: "Administración" },
    loadComponent: () =>
      import("./features/tools/tools.page").then((m) => m.ToolsPageComponent),
  },
  {
    path: "moderacion",
    canActivate: [authenticatedGuard],
    data: { view: "moderation", title: "Moderación" },
    loadComponent: () =>
      import("./features/tools/tools.page").then((m) => m.ToolsPageComponent),
  },
  {
    path: "ingresar",
    data: { view: "login" },
    loadComponent: () =>
      import("./features/accounts/auth/auth.page").then(
        (m) => m.AuthPageComponent,
      ),
  },
  {
    path: "registro",
    data: { view: "register" },
    loadComponent: () =>
      import("./features/accounts/auth/auth.page").then(
        (m) => m.AuthPageComponent,
      ),
  },
  { path: "**", redirectTo: "" },
];
