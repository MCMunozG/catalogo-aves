/** Resumen mínimo de identidad devuelto con un token; no es un perfil completo. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Par de tokens emitido por Accounts después de registro, inicio de sesión o renovación. */
export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: SessionUser;
}

/** Datos editables del perfil que pertenece al usuario autenticado actual. */
export interface UserProfile extends SessionUser {
  bio?: string | null;
  general_location?: string | null;
  privacy_settings?: {
    show_general_location?: boolean;
    share_activity?: boolean;
  } | null;
  preferences?: { weekly_digest?: boolean } | null;
}
