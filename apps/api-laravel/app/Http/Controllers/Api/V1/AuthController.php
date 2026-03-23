<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\AuthSessionRepository;

final class AuthController
{
    public function __construct(private readonly AuthSessionRepository $repository = new AuthSessionRepository())
    {
    }

    public function session(): array
    {
        $token = $this->resolveToken();
        if ($token === '') {
            return [
                '_status' => 401,
                'message' => 'No hay sesión activa.',
            ];
        }

        $session = $this->repository->findActiveByToken($token);
        if (!$session) {
            return [
                '_status' => 401,
                'message' => 'La sesión no es válida o ya expiró.',
            ];
        }

        return [
            'data' => $session,
        ];
    }

    public function login(): array
    {
        $payload = json_decode(file_get_contents('php://input') ?: '[]', true);
        if (!is_array($payload)) {
            return [
                '_status' => 400,
                'message' => 'Payload inválido.',
            ];
        }

        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = trim((string) ($payload['password'] ?? ''));
        $tenant = trim((string) ($payload['tenant'] ?? 'default'));

        if ($email === '' || $password === '') {
            return [
                '_status' => 422,
                'message' => 'email y password son obligatorios.',
            ];
        }

        $session = [
            'id' => uniqid('sess_', true),
            'token' => bin2hex(random_bytes(16)),
            'status' => 'active',
            'user' => [
                'email' => $email,
                'displayName' => $this->displayNameFromEmail($email),
                'roles' => $this->rolesForEmail($email),
            ],
            'tenant' => [
                'key' => $tenant,
                'label' => strtoupper($tenant),
            ],
            'permissions' => $this->permissionsForEmail($email),
            'issuedAt' => gmdate(DATE_ATOM),
            'expiresAt' => gmdate(DATE_ATOM, strtotime('+12 hours')),
            'source' => 'sprint-11-auth-foundation',
        ];

        return [
            'data' => $this->repository->append($session),
            'meta' => [
                'authenticated' => true,
            ],
        ];
    }

    public function logout(): array
    {
        $token = $this->resolveToken();
        if ($token === '') {
            return [
                '_status' => 401,
                'message' => 'No hay sesión activa para cerrar.',
            ];
        }

        $session = $this->repository->revoke($token);
        if (!$session) {
            return [
                '_status' => 404,
                'message' => 'No se encontró una sesión activa para el token indicado.',
            ];
        }

        return [
            'data' => $session,
            'meta' => [
                'authenticated' => false,
            ],
        ];
    }

    private function resolveToken(): string
    {
        $header = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
        if ($header !== '' && str_starts_with($header, 'Bearer ')) {
            return trim(substr($header, 7));
        }

        return trim((string) ($_GET['token'] ?? ''));
    }

    private function displayNameFromEmail(string $email): string
    {
        $name = explode('@', $email)[0] ?? 'usuario';
        return ucwords(str_replace(['.', '_', '-'], ' ', $name));
    }

    private function rolesForEmail(string $email): array
    {
        return str_contains($email, 'admin')
            ? ['admin', 'billing-manager']
            : ['operator'];
    }

    private function permissionsForEmail(string $email): array
    {
        $base = ['customers.read', 'documents.read', 'payments.read'];

        if (str_contains($email, 'admin')) {
            return array_merge($base, ['payments.write', 'invoices.write', 'dispatch.retry', 'settings.manage']);
        }

        return array_merge($base, ['invoices.write']);
    }
}
