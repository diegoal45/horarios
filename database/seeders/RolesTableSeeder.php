<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        DB::table('roles')->insertOrIgnore([
            ['name' => 'administrador', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'jefe', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'trabajador', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
