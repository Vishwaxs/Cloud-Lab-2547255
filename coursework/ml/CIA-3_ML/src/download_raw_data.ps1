<#
    CIA-3 / ML for Social Good Ensemble Challenge
    Raw data acquisition - Assam flood prediction

    Source: National Water Data Portal (NWDP), National Water Informatics Centre,
            Ministry of Jal Shakti, Government of India.  https://nwdp.nwic.gov.in
            CKAN API v3.  Data published by Assam Water Department and by the
            Central Water Commission (CWC).

    This script is idempotent: already-downloaded files are skipped unless -Force.
    It writes data/raw/_manifest.csv recording URL, size and SHA256 for every file,
    so the dataset can be re-created and verified by a third party.
#>
param(
    [string]$OutRoot = (Join-Path $PSScriptRoot '..\data\raw'),
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'   # large speedup for Invoke-WebRequest
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$API = 'https://nwdp.nwic.gov.in/api/3/action/package_show?id='

# Packages taken in full: these are Assam-state observation networks.
$FullPackages = @(
    @{ id = 'river-water-level-telemetry-hourly-assam-department'; dir = 'river_level' },
    @{ id = 'rainfall-assam-telemetry-hourly';                     dir = 'rainfall'    },
    @{ id = 'rainfall-assam-manual-daily';                         dir = 'rainfall'    },
    @{ id = 'temperature-telemetry-hourly-assam-water-department'; dir = 'weather'     },
    @{ id = 'relative-humidity-telemetry-hourly-assam';            dir = 'weather'     },
    @{ id = 'atmospheric-pressure-telemetry-hourly-assam';         dir = 'weather'     },
    @{ id = 'wind-speed-telemetry-hourly-assam-water-department';  dir = 'weather'     },
    @{ id = 'wind-speed-and-direction-assam-telemetry-hourly';     dir = 'weather'     },
    @{ id = 'solar-radiation-telemetry-hourly-assam';              dir = 'weather'     },
    @{ id = 'ground-water-level-telemetry-daily-assam';            dir = 'groundwater' }
)

# Nationwide CWC packages: keep ONLY the Assam resources.
# NOTE: CWC's river-water-level package is deliberately NOT listed here - it has no
# Brahmaputra or Barak basin resource (verified 2026-08-14), only peninsular basins.
# "Brahmani and Baitarni" is an Odisha/Jharkhand basin and must not be mistaken for it.
$AssamOnlyPackages = @(
    @{ id = 'rainfall-cwc-telemetry-hourly'; dir = 'rainfall' },
    @{ id = 'rainfall-cwc-manual-daily';     dir = 'rainfall' },
    @{ id = 'rainfall-cwc-manual-hourly';    dir = 'rainfall' }
)

function Get-Package([string]$id) {
    (Invoke-WebRequest -Uri "$API$id" -TimeoutSec 120 -UseBasicParsing).Content | ConvertFrom-Json
}

$manifest = New-Object System.Collections.Generic.List[object]

function Fetch-Resources($pkg, [string]$subdir, [scriptblock]$filter) {
    $targetDir = Join-Path $OutRoot $subdir
    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }

    $resources = $pkg.result.resources
    if ($filter) { $resources = $resources | Where-Object $filter }

    foreach ($r in $resources) {
        if ($r.format -notmatch 'CSV') { continue }
        $fileName = Split-Path $r.url -Leaf
        $dest     = Join-Path $targetDir $fileName

        if ((Test-Path $dest) -and -not $Force) {
            Write-Host ("  SKIP  {0}" -f $fileName)
        } else {
            Write-Host ("  GET   {0}  ({1:N1} MB)" -f $fileName, ($r.size / 1MB))
            try {
                Invoke-WebRequest -Uri $r.url -OutFile $dest -TimeoutSec 900 -UseBasicParsing
            } catch {
                Write-Warning ("  FAILED {0}: {1}" -f $fileName, $_.Exception.Message)
                continue
            }
        }

        $fi = Get-Item $dest
        $manifest.Add([pscustomobject]@{
            file          = "$subdir/$fileName"
            package_title = $pkg.result.title
            resource_name = $r.name
            bytes         = $fi.Length
            sha256        = (Get-FileHash $dest -Algorithm SHA256).Hash
            source_url    = $r.url
        })
    }
}

if (-not (Test-Path $OutRoot)) { New-Item -ItemType Directory -Path $OutRoot -Force | Out-Null }

foreach ($p in $FullPackages) {
    $pkg = Get-Package $p.id
    Write-Host ("== {0}" -f $pkg.result.title) -ForegroundColor Cyan
    Fetch-Resources $pkg $p.dir $null
}

foreach ($p in $AssamOnlyPackages) {
    $pkg = Get-Package $p.id
    Write-Host ("== {0}  [Assam resources only]" -f $pkg.result.title) -ForegroundColor Cyan
    Fetch-Resources $pkg $p.dir { $_.name -match 'Assam' }
}

$manifestPath = Join-Path $OutRoot '_manifest.csv'
$manifest | Sort-Object file | Export-Csv -Path $manifestPath -NoTypeInformation -Encoding utf8
Write-Host ""
Write-Host ("Wrote {0} file records to {1}" -f $manifest.Count, $manifestPath) -ForegroundColor Green
Write-Host ("Total size: {0:N1} MB" -f (($manifest | Measure-Object bytes -Sum).Sum / 1MB)) -ForegroundColor Green
