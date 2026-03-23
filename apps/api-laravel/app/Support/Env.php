<?php

namespace App\Support;

final class Env
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
        return $value === false || $value === null || $value === '' ? $default : $value;
    }
}
