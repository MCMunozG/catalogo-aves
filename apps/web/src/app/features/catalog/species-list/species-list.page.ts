import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { Species } from "../../../shared/models/catalog.models";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./species-list.page.html",
  styleUrl: "./species-list.page.scss",
})
/** El estado de búsqueda de Catalog permanece local a la ruta de lista de especies. */
export class SpeciesListPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly route = inject(ActivatedRoute);
  readonly species = signal<Species[]>(seedSpecies);
  readonly catalogError = signal(false);
  searchText = "";

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.searchText = params.get("q") ?? "";
      this.loadSpecies(this.searchText, params.get("habitat") ?? "");
    });
  }

  /** Carga Catalog y conserva un respaldo visible de desarrollo cuando el servicio no responde. */
  loadSpecies(query = "", habitat = ""): void {
    this.catalogApi.species(query).subscribe({
      next: ({ data }) => {
        this.species.set(this.filterByHabitat(data, habitat));
        this.catalogError.set(false);
      },
      error: () => {
        const fallback = seedSpecies
          .filter((species) =>
            `${species.common_name} ${species.scientific_name} ${species.habitat ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .filter((species) => !habitat || (species.habitat ?? "").toLowerCase().includes(habitat.toLowerCase()));
        this.species.set(fallback);
        this.catalogError.set(true);
      },
    });
  }

  /** Aplica el filtro de hábitat al resultado porque Catalog conserva la búsqueda textual como su contrato mínimo. */
  private filterByHabitat(species: Species[], habitat: string): Species[] {
    return habitat ? species.filter((item) => (item.habitat ?? "").toLowerCase().includes(habitat.toLowerCase())) : species;
  }
}
