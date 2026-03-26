<?php

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class CreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'week_start' => ['required', 'date'],
            'total_hours' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'El campo de usuario es obligatorio',
            'week_start.required' => 'El campo de inicio de semana es obligatorio',
            'total_hours.min' => 'El campo de horas totales debe ser un número positivo',
        ];
    }
}
