import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AccountsApiService } from "../../../core/api/accounts-api.service";
import { CommunityApiService } from "../../../core/api/community-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { SessionService } from "../../../core/session.service";
import { UserProfile } from "../../../shared/models/accounts.models";
import { Notification } from "../../../shared/models/community.models";
import { Sighting } from "../../../shared/models/observation.models";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./profile.page.html",
  styleUrl: "./profile.page.scss",
})
/** Compone perfil de Accounts con resúmenes personales de Observation y Community. */
export class ProfilePageComponent {
  private readonly accountsApi = inject(AccountsApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly communityApi = inject(CommunityApiService);
  private readonly session = inject(SessionService);
  readonly mySightings = signal<Sighting[]>([]);
  readonly notifications = signal<Notification[]>([]);
  readonly profileLoading = signal(false);
  readonly profileError = signal(false);
  readonly profileSaving = signal(false);
  readonly profileMessage = signal("");
  readonly profileRole = signal("");
  profileForm = {
    name: "",
    bio: "",
    general_location: "",
    show_general_location: true,
    weekly_digest: true,
  };

  constructor() {
    if (this.hasSession()) this.loadProfile();
  }

  /** Evita solicitar datos privados si no existe un access token local. */
  hasSession(): boolean {
    return this.session.hasToken();
  }

  /** Envía únicamente campos editables del perfil; rol y credenciales no se modifican aquí. */
  saveProfile(valid: boolean | null): void {
    if (!valid) return;
    this.profileSaving.set(true);
    this.profileMessage.set("");
    this.accountsApi
      .updateMe({
        name: this.profileForm.name,
        bio: this.profileForm.bio,
        general_location: this.profileForm.general_location,
        privacy_settings: {
          show_general_location: this.profileForm.show_general_location,
        },
        preferences: { weekly_digest: this.profileForm.weekly_digest },
      })
      .subscribe({
        next: (profile) => {
          this.setProfile(profile);
          this.profileSaving.set(false);
          this.profileMessage.set("Tus cambios se guardaron correctamente.");
        },
        error: () => {
          this.profileSaving.set(false);
          this.profileError.set(true);
        },
      });
  }

  /** Carga en paralelo el perfil y sus resúmenes sin mezclar propiedad entre servicios. */
  private loadProfile(): void {
    this.profileLoading.set(true);
    this.accountsApi.me().subscribe({
      next: (profile) => {
        this.setProfile(profile);
        this.profileLoading.set(false);
      },
      error: () => {
        this.profileLoading.set(false);
        this.profileError.set(true);
      },
    });
    this.observationsApi
      .mine()
      .subscribe({ next: ({ data }) => this.mySightings.set(data) });
    this.communityApi
      .notifications()
      .subscribe({ next: ({ data }) => this.notifications.set(data) });
  }

  /** Normaliza campos opcionales de la API para que el formulario siempre tenga valores editables. */
  private setProfile(profile: UserProfile): void {
    this.profileForm = {
      name: profile.name,
      bio: profile.bio ?? "",
      general_location: profile.general_location ?? "",
      show_general_location:
        profile.privacy_settings?.show_general_location ?? true,
      weekly_digest: profile.preferences?.weekly_digest ?? true,
    };
    this.profileRole.set(profile.role);
  }
}
