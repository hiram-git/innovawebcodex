<?php

namespace App\Repositories;

final class ElectronicDispatchRepository
{
    private string $storagePath;

    public function __construct(?string $storagePath = null)
    {
        $this->storagePath = $storagePath ?? __DIR__ . '/../../storage/electronic_dispatch.ndjson';
    }

    public function all(int $limit = 20): array
    {
        if (!is_file($this->storagePath)) {
            return [];
        }

        $lines = file($this->storagePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $records = array_map(static fn (string $line) => json_decode($line, true), $lines);
        $records = array_filter($records, static fn ($item) => is_array($item));

        return array_slice(array_reverse(array_values($records)), 0, $limit);
    }

    public function findByIdempotencyKey(string $idempotencyKey): ?array
    {
        foreach ($this->all(200) as $record) {
            if (($record['idempotencyKey'] ?? null) === $idempotencyKey) {
                return $record;
            }
        }

        return null;
    }

    public function findById(string $dispatchId): ?array
    {
        foreach ($this->all(500) as $record) {
            if (($record['id'] ?? null) === $dispatchId) {
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
}
