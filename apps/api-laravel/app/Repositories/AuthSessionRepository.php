<?php

namespace App\Repositories;

final class AuthSessionRepository
{
    private string $storagePath;

    public function __construct(?string $storagePath = null)
    {
        $this->storagePath = $storagePath ?? __DIR__ . '/../../storage/auth_sessions.ndjson';
    }

    public function all(int $limit = 50): array
    {
        if (!is_file($this->storagePath)) {
            return [];
        }

        $lines = file($this->storagePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $records = array_map(static fn (string $line) => json_decode($line, true), $lines);
        $records = array_filter($records, static fn ($item) => is_array($item));

        return array_slice(array_reverse(array_values($records)), 0, $limit);
    }

    public function findActiveByToken(string $token): ?array
    {
        foreach ($this->all(500) as $record) {
            if (($record['token'] ?? null) === $token && ($record['status'] ?? null) === 'active') {
                return $record;
            }
        }

        return null;
    }

    public function append(array $record): array
    {
        $dir = dirname($this->storagePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents($this->storagePath, json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
        return $record;
    }

    public function revoke(string $token): ?array
    {
        if (!is_file($this->storagePath)) {
            return null;
        }

        $lines = file($this->storagePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $records = array_map(static fn (string $line) => json_decode($line, true), $lines);
        $records = array_values(array_filter($records, static fn ($item) => is_array($item)));

        $revoked = null;
        foreach ($records as &$record) {
            if (($record['token'] ?? null) === $token && ($record['status'] ?? null) === 'active') {
                $record['status'] = 'revoked';
                $record['revokedAt'] = gmdate(DATE_ATOM);
                $revoked = $record;
                break;
            }
        }
        unset($record);

        if (!$revoked) {
            return null;
        }

        $dir = dirname($this->storagePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $serialized = implode(PHP_EOL, array_map(static fn (array $record): string => json_encode($record, JSON_UNESCAPED_UNICODE), $records));
        file_put_contents($this->storagePath, $serialized . PHP_EOL);

        return $revoked;
    }
}
