<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    public function boot(): void
    {
        // For Laravel 11, policies auto-discover; explicit register not required
        Gate::define('isAdmin', function ($user) {
            return strtolower($user->role ?? '') === 'admin';
        });
    }
}
