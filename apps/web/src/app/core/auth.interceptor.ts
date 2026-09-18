import { HttpInterceptorFn } from "@angular/common/http";

/** Adjunta el access token actual; cada API Laravel mantiene la autorización en el servidor. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem("catalogo_aves_access_token");
  return next(
    token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req,
  );
};
