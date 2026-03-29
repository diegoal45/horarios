<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'team_id',
        'week_start',
        'total_hours',
        'published',
    ];

    /**
     * Get the user that owns the schedule.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the team that owns the schedule.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the shifts for the schedule.
     */
    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }
}
