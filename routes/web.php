<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest Routes (Login & Register)
Route::middleware(['guest'])->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Login');
    })->name('login');

    Route::get('/register', function () {
        return Inertia::render('Register');
    })->name('register');
});

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Users Management (Admin)
    Route::get('/users', function () {
        return Inertia::render('Users/Index');
    })->name('users.index');

    Route::get('/users/create', function () {
        return Inertia::render('Users/Create');
    })->name('users.create');

    // Schedules Management (Jefe)
    Route::get('/schedules', function () {
        return Inertia::render('Schedules/Index');
    })->name('schedules.index');

    Route::get('/schedules/create', function () {
        return Inertia::render('Schedules/Create');
    })->name('schedules.create');

    Route::get('/schedules/{id}/edit', function ($id) {
        return Inertia::render('Schedules/Edit', ['id' => $id]);
    })->name('schedules.edit');

    // My Shifts (Trabajador)
    Route::get('/my-shifts', function () {
        return Inertia::render('Shifts/MyShifts');
    })->name('my-shifts');

    Route::get('/shifts', function () {
        return Inertia::render('Shifts/Index');
    })->name('shifts.index');
});

Route::get('/users/{id}/edit', function ($id) {
    return Inertia::render('Users/Edit', ['id' => $id]);
});
