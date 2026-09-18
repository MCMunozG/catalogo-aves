<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Sólo valida el transporte; la sensibilidad y el estado de publicación son decisiones de dominio. */
class StoreSightingRequest extends FormRequest
{
    /** La ruta JWT autentica primero; las políticas de publicación se aplican en CreateSighting. */
    public function authorize(): bool
    {
        return true;
    }

    /** Define sólo forma y límites del transporte HTTP, no sensibilidad biológica. */
    public function rules(): array
    {
        return [
            'species_id' => ['nullable', 'string', 'max:26'],
            'observed_at' => ['required', 'date'],
            'individuals' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'behavior' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'region' => ['nullable', 'string', 'max:160'],
            'publish' => ['boolean'],
        ];
    }
}
