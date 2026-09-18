import { Species } from "../../shared/models/catalog.models";

/** Respaldo exclusivo de desarrollo si Catalog no responde; no es una segunda fuente de verdad. */
export const seedSpecies: Species[] = [
  {
    id: "seed-tangara",
    common_name: "Tángara azuleja",
    scientific_name: "Thraupis episcopus",
    sensitivity: "EXACT",
    habitat: "Bordes de bosque y jardines",
    conservation_status: "Preocupación menor (LC)",
    description: "Tángara azul grisácea frecuente en paisajes intervenidos.",
  },
  {
    id: "seed-colibri",
    common_name: "Colibrí colirrufo",
    scientific_name: "Amazilia tzacatl",
    sensitivity: "APPROXIMATE",
    habitat: "Jardines y claros",
    conservation_status: "Preocupación menor (LC)",
    description: "Colibrí verde de cola rojiza, activo alrededor de flores.",
  },
  {
    id: "seed-condor",
    common_name: "Cóndor andino",
    scientific_name: "Vultur gryphus",
    sensitivity: "HIDDEN",
    habitat: "Páramo y alta montaña",
    conservation_status: "Vulnerable (VU)",
    description:
      "Rapaz planeadora de gran tamaño asociada a paisajes andinos abiertos.",
  },
];
