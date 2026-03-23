<?php

namespace App\Repositories;

use App\Support\Env;
use PDO;
use PDOException;

final class CustomerRepository
{
    public function search(string $search = '', int $limit = 20): array
    {
        $limit = max(1, min($limit, 100));
        $sql = "SELECT TOP {$limit} CODIGO, NOMBRE, NUMTEL, DIRCORREO, TIPOCOMERCIO
            FROM BASECLIENTESPROVEEDORES
            WHERE TIPREG = 1 AND INTEGRADO = 0";

        $params = [];

        if ($search !== '') {
            $sql .= ' AND (CODIGO LIKE :search OR NOMBRE LIKE :search)';
            $params['search'] = "%{$search}%";
        }

        $sql .= ' ORDER BY CODIGO DESC';

        $pdo = new PDO(sprintf(
            'sqlsrv:Server=%s,%s;Database=%s',
            Env::get('DB_HOST', '127.0.0.1'),
            Env::get('DB_PORT', '1433'),
            Env::get('DB_DATABASE', '')
        ), Env::get('DB_USERNAME', ''), Env::get('DB_PASSWORD', ''));
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
