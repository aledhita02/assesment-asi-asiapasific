<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class MyClient extends Model
{
    use SoftDeletes;

    protected $table = 'my_client';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'slug',
        'is_project',
        'self_capture',
        'client_prefix',
        'client_logo',
        'address',
        'phone_number',
        'city',
    ];

    protected $casts = [
        'is_project' => 'string',
    ];

    protected static function booted()
    {
        static::created(function ($client) {
            Redis::set("client:{$client->slug}", $client->toJson());
        });

        static::updated(function ($client) {
            Redis::del("client:{$client->slug}");
            Redis::set("client:{$client->slug}", $client->toJson());
        });

        static::deleted(function ($client) {
            Redis::del("client:{$client->slug}");
        });
    }

    public function getClientLogoUrlAttribute()
    {
        return $this->client_logo === 'no-image.jpg'
            ? asset('images/no-image.jpg')
            : Storage::disk('s3')->url($this->client_logo);
    }
}
