<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use RuntimeException;

/**
 * Creates the RSA key pair used exclusively by Accounts to issue JWTs.
 *
 * The public key can be distributed to other services for verification, but
 * this command never writes the private key outside the Accounts service.
 */
class EnsureJwtKeys extends Command
{
    protected $signature = 'catalogo-aves:jwt-keys {--force : Rotate an existing key pair}';

    protected $description = 'Create or validate the local JWT signing key pair';

    public function handle(): int
    {
        $privatePath = config('catalogo_aves.private_key');
        $publicPath = config('catalogo_aves.public_key');

        if ($this->option('force') || !is_file($privatePath)) {
            $this->createKeyPair($privatePath, $publicPath);
            $this->info('JWT signing key pair created.');

            return self::SUCCESS;
        }

        $privateKey = openssl_pkey_get_private((string) file_get_contents($privatePath));
        if ($privateKey === false) {
            $this->error('The configured JWT private key is invalid. Use --force only when rotating local keys.');

            return self::FAILURE;
        }

        $details = openssl_pkey_get_details($privateKey);
        if ($details === false || !isset($details['key'])) {
            $this->error('The configured JWT private key has no public counterpart.');

            return self::FAILURE;
        }

        $this->writeKey($publicPath, $details['key'], 0644);
        $this->info('JWT signing key pair is ready.');

        return self::SUCCESS;
    }

    /** Generates a 4096-bit RSA pair and persists it using the configured paths. */
    private function createKeyPair(string $privatePath, string $publicPath): void
    {
        $options = [
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
            'private_key_bits' => 4096,
            'digest_alg' => 'sha256',
        ];
        $openSslConfig = dirname(base_path(), 3) . DIRECTORY_SEPARATOR . 'infra' . DIRECTORY_SEPARATOR . 'openssl.cnf';
        if (is_file($openSslConfig)) {
            // Windows PHP installations frequently do not expose OPENSSL_CONF.
            // The repository-owned provider configuration keeps local bootstrap portable.
            $options['config'] = $openSslConfig;
        }

        $key = openssl_pkey_new($options);
        if ($key === false || !openssl_pkey_export($key, $privatePem)) {
            // Some Windows PHP distributions can verify keys but cannot create
            // them. Git Bash supplies a compatible OpenSSL binary to local runs.
            if ($this->createKeyPairWithBinary($privatePath, $publicPath)) {
                return;
            }

            $error = openssl_error_string() ?: 'No OpenSSL diagnostic was returned.';
            throw new RuntimeException("Unable to generate the JWT signing key pair: {$error}");
        }

        $details = openssl_pkey_get_details($key);
        if ($details === false || !isset($details['key'])) {
            throw new RuntimeException('Unable to extract the JWT public key.');
        }

        $this->writeKey($privatePath, $privatePem, 0600);
        $this->writeKey($publicPath, $details['key'], 0644);
    }

    /** Uses Git Bash OpenSSL only when the local PHP OpenSSL binding cannot generate keys. */
    private function createKeyPairWithBinary(string $privatePath, string $publicPath): bool
    {
        $binary = getenv('CATALOGO_AVES_OPENSSL_BINARY');
        if (!is_string($binary) || $binary === '') {
            return false;
        }

        $directory = dirname($privatePath);
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            return false;
        }

        $generated = $this->runOpenSsl([$binary, 'genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:4096', '-out', $privatePath]);
        $exported = $generated && $this->runOpenSsl([$binary, 'pkey', '-in', $privatePath, '-pubout', '-out', $publicPath]);
        if (!$exported) {
            return false;
        }

        chmod($privatePath, 0600);
        chmod($publicPath, 0644);

        return true;
    }

    /** Executes an explicit OpenSSL command without invoking a shell. */
    private function runOpenSsl(array $command): bool
    {
        $process = proc_open($command, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
        if (!is_resource($process)) {
            return false;
        }

        fclose($pipes[1]);
        fclose($pipes[2]);

        return proc_close($process) === 0;
    }

    /** Creates the parent directory before writing a PEM file with restrictive permissions. */
    private function writeKey(string $path, string $contents, int $permissions): void
    {
        $directory = dirname($path);
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException("Unable to create JWT key directory: {$directory}");
        }

        if (file_put_contents($path, $contents, LOCK_EX) === false) {
            throw new RuntimeException("Unable to write JWT key: {$path}");
        }

        chmod($path, $permissions);
    }
}
