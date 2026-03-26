<?php

namespace App\Http\Requests\Shift;

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
            'schedule_id' => ['sometimes', 'exists:schedules,id'],
            'day_of_week' => ['sometimes', 'in:lunes,martes,miércoles,jueves,viernes'],
            'start_time' => ['sometimes', 'date_format:H:i:s'],
            'end_time' => ['sometimes', 'date_format:H:i:s', 'after:start_time'],
            'is_opening' => ['boolean'],
            'is_closing' => ['boolean'],
            'hours' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'schedule_id.exists' => 'El horario seleccionado no existe',
            'day_of_week.in' => 'El campo de día de la semana debe ser uno de los siguientes: lunes, martes, miércoles, jueves, viernes',
            'start_time.date_format' => 'El campo de hora de inicio debe tener el formato HH:mm:ss',
            'end_time.date_format' => 'El campo de hora de fin debe tener el formato HH:mm:ss',
            'end_time.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            'hours.min' => 'El campo de horas debe ser un número positivo',
        ];
    }
}
