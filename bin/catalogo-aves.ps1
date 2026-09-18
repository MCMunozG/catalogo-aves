[CmdletBinding()]
param(
    [string]$Command = 'help',
    [string]$Target = 'all',
    [string]$ServiceName
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Get-ServiceDirectory([string]$Name) {
    $map = @{ accounts = 'accounts-service'; catalog = 'catalog-service'; observation = 'observation-service'; community = 'community-service' }
    if (-not $map.ContainsKey($Name)) { throw "Unknown service '$Name'. Use accounts, catalog, observation, or community." }
    return Join-Path $root "apps/services/$($map[$Name])"
}

function Get-ServicePort([string]$Name) {
    $map = @{ accounts = 8001; catalog = 8002; observation = 8003; community = 8004 }
    if (-not $map.ContainsKey($Name)) { throw "Unknown service '$Name'." }
    return $map[$Name]
}

function Invoke-Artisan([string]$Name, [string[]]$Arguments) {
    Push-Location (Get-ServiceDirectory $Name)
    try { & php artisan @Arguments; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
    finally { Pop-Location }
}

function Invoke-AllArtisan([string[]]$Arguments) {
    foreach ($name in 'accounts', 'catalog', 'observation', 'community') { Invoke-Artisan $name $Arguments }
}

function Prepare-Service([string]$Name) {
    Invoke-Artisan $Name @('migrate', '--force')
    Invoke-Artisan $Name @('db:seed', '--force')
}

function Prepare-AllServices {
    foreach ($name in 'accounts', 'catalog', 'observation', 'community') { Prepare-Service $name }
}

switch ($Command) {
    'up' {
        if ($Target -eq 'all') { & docker compose up -d } else { & docker compose up -d (Split-Path (Get-ServiceDirectory $Target) -Leaf) }
    }
    'down' { & docker compose down }
    'migrate' { if ($Target -eq 'all') { Invoke-AllArtisan @('migrate') } else { Invoke-Artisan $Target @('migrate') } }
    'seed' { if ($Target -eq 'all') { Invoke-AllArtisan @('db:seed') } else { Invoke-Artisan $Target @('db:seed') } }
    'prepare' { if ($Target -eq 'all') { Prepare-AllServices } else { Prepare-Service $Target } }
    'fresh' { if ($Target -eq 'all') { Invoke-AllArtisan @('migrate:fresh', '--seed') } else { Invoke-Artisan $Target @('migrate:fresh', '--seed') } }
    'test' { if ($Target -eq 'all') { Invoke-AllArtisan @('test') } else { Invoke-Artisan $Target @('test') } }
    'service' {
        if (-not $ServiceName) { throw 'Service name required.' }
        switch ($Target) {
            'up' { & docker compose up -d (Split-Path (Get-ServiceDirectory $ServiceName) -Leaf) }
            { $_ -in 'serve', 'local' } {
                Prepare-Service $ServiceName
                Invoke-Artisan $ServiceName @('serve', '--host=127.0.0.1', "--port=$(Get-ServicePort $ServiceName)")
            }
            default { throw 'Usage: .\bin\catalogo-aves.ps1 service {up|serve} {accounts|catalog|observation|community}' }
        }
    }
    default { Write-Host 'Usage: .\bin\catalogo-aves.ps1 {up|down|migrate|seed|prepare|fresh|test} [accounts|catalog|observation|community]'; Write-Host '       .\bin\catalogo-aves.ps1 service {up|serve} {accounts|catalog|observation|community}' }
}
