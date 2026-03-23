<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\CustomerRepository;
use PDOException;

final class CustomerController
{
    public function __construct(private readonly CustomerRepository $repository = new CustomerRepository())
    {
    }

    public function index(): array
    {
        $limit = (int) ($_GET['limit'] ?? 20);
        $search = trim((string) ($_GET['search'] ?? ''));

        try {
            return [
                'data' => $this->repository->search($search, $limit),
                'meta' => ['limit' => $limit, 'search' => $search],
            ];
        } catch (PDOException $exception) {
            return [
                '_status' => 500,
                'message' => 'No fue posible consultar clientes desde SQL Server.',
                'error' => $exception->getMessage(),
            ];
        }
    }
}
