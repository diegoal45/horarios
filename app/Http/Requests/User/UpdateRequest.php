<?php

namespace App\Http\Requests\User;

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
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,' . $this->route('user')],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?\":{}|<>]/',
            ],
            'role' => ['sometimes', 'in:administrador,jefe,trabajador'],
        ];
    }
    public function messages(): array
    {
        return [
            'name.string' => 'El campo de nombre debe ser una cadena de texto.',
            'name.max' => 'El campo de nombre no debe exceder los 255 caracteres.',
            'email.email' => 'El campo de correo electrónico debe ser una dirección de correo válida.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'password.string' => 'El campo de contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex' => 'La contraseña debe contener al menos un número y un carácter especial.',
            'role.in' => 'El rol seleccionado no es válido. Debe ser administrador, jefe o trabajador.',
        ];
    }
}
