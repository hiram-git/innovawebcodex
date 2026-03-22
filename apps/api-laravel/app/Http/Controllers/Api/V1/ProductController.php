<?php

namespace App\Http\Controllers\Api\V1;

use App\Repositories\ProductRepository;
use PDOException;

final class ProductController
{
    public function __construct(private readonly ProductRepository $repository = new ProductRepository())
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
                'message' => 'No fue posible consultar productos desde SQL Server.',
                'error' => $exception->getMessage(),
            ];
        }
    }
}
