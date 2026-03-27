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
        $this->call([
            RolesTableSeeder::class,
        ]);

        // Create demo users with their roles
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'administrador',
        ]);

        User::create([
            'name' => 'Jefe User',
            'email' => 'jefe@example.com',
            'password' => bcrypt('password'),
            'role' => 'jefe',
        ]);

        User::create([
            'name' => 'Worker User',
            'email' => 'worker@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);

        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'trabajador',
        ]);
    }
}
