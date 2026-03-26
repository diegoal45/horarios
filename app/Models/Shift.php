<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'schedule_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_opening',
        'is_closing',
        'hours',
    ];

    /**
     * Get the schedule that owns the shift.
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}
