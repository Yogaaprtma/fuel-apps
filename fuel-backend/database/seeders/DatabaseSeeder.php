<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat roles
        $roles = [
            'super-admin',
            'admin-operasional',
            'driver',
            'customer'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // Buat users demo
        $users = [
            ['name' => 'Super Admin',   'email' => 'superadmin@fds.com', 'role' => 'super-admin'],
            ['name' => 'Admin Ops',     'email' => 'admin@fds.com',      'role' => 'admin-operasional'],
            ['name' => 'Driver Budi',   'email' => 'driver1@fds.com',    'role' => 'driver'],
            ['name' => 'Driver Santi',  'email' => 'driver2@fds.com',    'role' => 'driver'],
            ['name' => 'Driver Reza',   'email' => 'driver3@fds.com',    'role' => 'driver'],
            ['name' => 'Customer Andi', 'email' => 'customer@fds.com',   'role' => 'customer'],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                ['name' => $u['name'], 'password' => bcrypt('password'), 'is_active' => true]
            );
            $user->syncRoles([$u['role']]);
        }

        $this->command->info('✅ Seeder selesai! Semua user password: "password"');
    }
}
