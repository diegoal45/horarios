<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth Routes
Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Register');
})->name('register');

// Dashboard
Route::get('/', function () {
    return Inertia::render('Dashboard');
});

// Schedules
Route::get('/schedules', function () {
    return Inertia::render('Schedules/Index');
});

Route::get('/schedules/create', function () {
    return Inertia::render('Schedules/Create');
});

Route::get('/schedules/{id}/edit', function ($id) {
    return Inertia::render('Schedules/Edit', ['id' => $id]);
});

// Shifts
Route::get('/shifts', function () {
    return Inertia::render('Shifts/Index');
});

Route::get('/shifts/create', function () {
    return Inertia::render('Shifts/Create');
});

Route::get('/shifts/{id}/edit', function ($id) {
    return Inertia::render('Shifts/Edit', ['id' => $id]);
});

// Users
Route::get('/users', function () {
    return Inertia::render('Users/Index');
});

Route::get('/users/create', function () {
    return Inertia::render('Users/Create');
});

Route::get('/users/{id}/edit', function ($id) {
    return Inertia::render('Users/Edit', ['id' => $id]);
});
