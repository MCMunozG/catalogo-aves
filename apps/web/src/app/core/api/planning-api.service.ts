import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BirdingRoute, Place } from "../../shared/models/planning.models";
/** Cliente de lectura del inventario público de Observation. */
@Injectable({ providedIn: "root" })
export class PlanningApiService { constructor(private readonly http: HttpClient) {} places(): Observable<Place[]> { return this.http.get<Place[]>("/api/observations/v1/places"); } routes(): Observable<BirdingRoute[]> { return this.http.get<BirdingRoute[]>("/api/observations/v1/routes"); } }
