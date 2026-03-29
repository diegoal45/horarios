<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Step 1: Create roles
        $this->call([
            RolesTableSeeder::class,
        ]);

        // Step 2: Create demo users with their roles
        $users = [];

        $users[] = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'administrador',
        ]);

        $users[] = User::create([
            'name' => 'Jefe User',
            'email' => 'jefe@example.com',
            'password' => bcrypt('password'),
            'role' => 'jefe',
        ]);

        $users[] = User::create([
            'name' => 'Jefe Segundo',
            'email' => 'jefe2@example.com',
            'password' => bcrypt('password'),
            'role' => 'jefe',
        ]);

        $users[] = User::create([
            'name' => 'Carlos Ruiz',
            'email' => 'carlos@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Elena Vargas',
            'email' => 'elena@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Miguel Torres',
            'email' => 'miguel@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Sofía Méndez',
            'email' => 'sofia@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Roberto Díaz',
            'email' => 'roberto@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Lucía Ferrán',
            'email' => 'lucia@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Diego Morales',
            'email' => 'diego@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Martina López',
            'email' => 'martina@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Andrés García',
            'email' => 'andres@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Catalina Sánchez',
            'email' => 'catalina@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Gustavo Pérez',
            'email' => 'gustavo@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        $users[] = User::create([
            'name' => 'Valentina Rodríguez',
            'email' => 'valentina@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        // Step 3: Create teams and assign members after all users are created
        $this->call([
            TeamsTableSeeder::class,
        ]);
    }
}
