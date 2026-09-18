import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss", "./home.page.override.scss"],
})
/** Página de entrada que presenta los tres recorridos principales del producto. */
export class HomePageComponent {
  readonly journey = [
    {
      index: "01",
      title: "Descubre",
      text: "Consulta especies y reconoce las señales que las distinguen.",
      color: "card-green",
      link: "/especies",
    },
    {
      index: "02",
      title: "Planea",
      text: "Encuentra lugares, rutas y momentos para salir a observar.",
      color: "card-sand",
      link: "/rutas",
    },
    {
      index: "03",
      title: "Registra",
      text: "Guarda tus encuentros y protege las ubicaciones delicadas.",
      color: "card-blue",
      link: "/avistamientos/nuevo",
    },
  ];
}
