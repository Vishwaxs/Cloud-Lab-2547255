<#
    CIA-3 / ML for Social Good Ensemble Challenge
    Daily flood report acquisition - DRIMS Assam

    Source: Disaster Reporting and Information Management System (DRIMS),
            Assam State Disaster Management Authority (ASDMA), Government of Assam.
            https://sdrf.assam.gov.in/dfr/  (public "Download Report -> Flood" form)

    Each report is a server-generated PDF for a single calendar date, giving
    district- and revenue-circle-wise flood status: districts affected, villages
    affected, population and crop area affected, relief camps, human/animal losses,
    house and embankment damage, and rivers flowing above danger level per the CWC
    8 AM bulletin.

    Verified coverage (probed 2026-08-14): reports exist only for the flood seasons
        2025-05-01 .. 2025-10-31
        2026-05-01 .. present
    Out-of-season dates return the HTML form instead of a PDF; those are recorded as
    "absent" in the log and are NOT treated as data.

    Politeness: strictly sequential, one request at a time, with a delay between
    requests. Re-runs skip files already on disk.
#>
param(
    [string]$OutDir     = (Join-Path $PSScriptRoot '..\data\raw\drims_daily_flood'),
    [int]   $DelayMs    = 1000,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$ProgressPreference    = 'SilentlyContinue'

$BASE  = 'https://sdrf.assam.gov.in/dfr'
$FORM  = "$BASE/download?type=flood"
$POST  = "$BASE/download"

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# --- build the date list -------------------------------------------------------
$ranges = @(
    @{ start = [datetime]'2025-05-01'; end = [datetime]'2025-10-31' },
    @{ start = [datetime]'2026-05-01'; end = [datetime]'2026-08-13' }
)
$dates = foreach ($r in $ranges) {
    for ($d = $r.start; $d -le $r.end; $d = $d.AddDays(1)) { $d.ToString('yyyy-MM-dd') }
}
Write-Host ("Target dates: {0}" -f $dates.Count) -ForegroundColor Cyan

# --- session / CSRF ------------------------------------------------------------
$script:session = $null
function Reset-Session {
    $g = Invoke-WebRequest -Uri $FORM -SessionVariable s -TimeoutSec 60 -UseBasicParsing
    $script:session = $s
    $script:token   = [regex]::Match($g.Content, 'name="_token" value="([^"]+)"').Groups[1].Value
    if (-not $script:token) { throw 'Could not read CSRF token from the download form.' }
}
Reset-Session

$log = New-Object System.Collections.Generic.List[object]
$i = 0; $got = 0; $absent = 0; $failed = 0

foreach ($d in $dates) {
    $i++
    $dest = Join-Path $OutDir "Daily_Flood_Report_$d.pdf"

    if ((Test-Path $dest) -and -not $Force) {
        $log.Add([pscustomobject]@{ date = $d; status = 'skip'; bytes = (Get-Item $dest).Length })
        $got++
        continue
    }

    # refresh the session every 60 requests in case the token/session rotates
    if ($i % 60 -eq 0) { try { Reset-Session } catch { Write-Warning "session refresh failed: $_" } }

    $body = @{ _token = $script:token; type = 'flood'; date = $d }
    try {
        $p  = Invoke-WebRequest -Uri $POST -Method POST -Body $body -WebSession $script:session `
              -TimeoutSec 180 -UseBasicParsing
        $ct = [string]$p.Headers['Content-Type']

        if ($ct -match 'pdf' -and $p.Content -is [byte[]]) {
            [IO.File]::WriteAllBytes($dest, $p.Content)
            $got++
            $log.Add([pscustomobject]@{ date = $d; status = 'ok'; bytes = $p.Content.Length })
            Write-Host ("  [{0,3}/{1}] {2}  {3,9:N0} bytes" -f $i, $dates.Count, $d, $p.Content.Length)
        } else {
            $absent++
            $log.Add([pscustomobject]@{ date = $d; status = 'absent'; bytes = 0 })
            Write-Host ("  [{0,3}/{1}] {2}  -- no report" -f $i, $dates.Count, $d) -ForegroundColor DarkGray
        }
    } catch {
        $failed++
        $log.Add([pscustomobject]@{ date = $d; status = 'error'; bytes = 0 })
        Write-Warning ("  {0} :: {1}" -f $d, $_.Exception.Message)
        try { Reset-Session } catch {}
    }

    Start-Sleep -Milliseconds $DelayMs
}

$logPath = Join-Path $OutDir '_download_log.csv'
$log | Export-Csv -Path $logPath -NoTypeInformation -Encoding utf8

Write-Host ''
Write-Host ("Downloaded/present : {0}" -f $got)    -ForegroundColor Green
Write-Host ("No report on date  : {0}" -f $absent) -ForegroundColor Yellow
Write-Host ("Errors             : {0}" -f $failed) -ForegroundColor Red
Write-Host ("Log -> {0}" -f $logPath)
