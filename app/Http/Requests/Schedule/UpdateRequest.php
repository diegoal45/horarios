<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'exists:users,id'],
            'week_start' => ['sometimes', 'date'],
            'total_hours' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'El usuario seleccionado no existe',
            'week_start.date' => 'El campo de inicio de semana debe ser una fecha válida',
            'total_hours.min' => 'El campo de horas totales debe ser un número positivo',
        ];
    }
}
