import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  SessionResponse,
  UserProfile,
} from "../../shared/models/accounts.models";

/** Límite HTTP del contexto Accounts; intencionalmente no expone almacenamiento de sesión. */
@Injectable({ providedIn: "root" })
export class AccountsApiService {
  constructor(private readonly http: HttpClient) {}

  /** Intercambia credenciales por el par de tokens emitido por Accounts. */
  login(email: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>("/api/accounts/v1/auth/login", {
      email,
      password,
    });
  }

  /** Usa el nombre de campo de la API aquí para que las páginas mantengan nombres propios de TypeScript. */
  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Observable<SessionResponse> {
    return this.http.post<SessionResponse>("/api/accounts/v1/auth/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  me(): Observable<UserProfile> {
    return this.http.get<UserProfile>("/api/accounts/v1/me");
  }
  updateMe(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>("/api/accounts/v1/me", payload);
  }
}
