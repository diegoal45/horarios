<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    protected $fillable = [
        'name',
        'description',
        'leader_id',
        'max_members',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the leader of the team
     */
    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /**
     * Get all team members
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withTimestamps();
    }

    /**
     * Get all schedules for this team
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Check if team is full (max 6 members)
     */
    public function isFull(): bool
    {
        $currentCount = $this->members()->count();
        return $currentCount >= $this->max_members;
    }

    /**
     * Get available slots in team
     */
    public function getAvailableSlots(): int
    {
        $currentCount = $this->members()->count();
        return max(0, $this->max_members - $currentCount);
    }

    /**
     * Add member to team (if not full)
     */
    public function addMember(User $user): bool
    {
        if ($this->isFull()) {
            return false;
        }

        if (!$this->members()->where('user_id', $user->id)->exists()) {
            $this->members()->attach($user->id);
            return true;
        }

        return false;
    }

    /**
     * Remove member from team
     */
    public function removeMember(User $user): bool
    {
        return (bool) $this->members()->detach($user->id);
    }
}
