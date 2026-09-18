import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { Species } from "../../../shared/models/catalog.models";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./species-detail.page.html",
  styleUrl: "./species-detail.page.scss",
})
/** Resuelve una especie publicada, con respaldo de desarrollo cuando Catalog no está disponible. */
export class SpeciesDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogApi = inject(CatalogApiService);
  readonly selectedSpecies = signal<Species>(seedSpecies[0]);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (!id) return;
      this.catalogApi.speciesById(id).subscribe({
        next: (species) => this.selectedSpecies.set(species),
        error: () =>
          this.selectedSpecies.set(
            seedSpecies.find((species) => species.id === id) ?? seedSpecies[0],
          ),
      });
    });
  }
}
