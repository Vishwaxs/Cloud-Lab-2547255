<#
    Parses the "Table showing River wise Danger Level and its Highest Water Level"
    from the Assam Water Resources Department Flood Information System page into
    a tidy CSV.

    Source page: https://waterresources.assam.gov.in/portlets/flood-information-system
    Retrieved  : 2026-08-14

    The source table uses rowspan on the "River" column, so a row belonging to the
    same river as the row above emits only 5 <td> cells instead of 6. We forward-fill
    the river name in that case. Rows are emitted verbatim otherwise - no value is
    imputed, corrected or invented.
#>
param(
    [string]$InHtml  = (Join-Path $PSScriptRoot '..\data\raw\reference\assam_wrd_flood_information_system.html'),
    [string]$OutCsv  = (Join-Path $PSScriptRoot '..\data\raw\reference\assam_river_danger_levels.csv')
)

$ErrorActionPreference = 'Stop'

$html  = Get-Content $InHtml -Raw
$table = [regex]::Match($html, '(?s)<table.*?</table>').Value
if (-not $table) { throw "No <table> found in $InHtml" }

$out         = New-Object System.Collections.Generic.List[object]
$currentRiver = $null

foreach ($row in [regex]::Matches($table, '(?s)<tr.*?</tr>')) {
    $cells = [regex]::Matches($row.Value, '(?s)<t[dh][^>]*>(.*?)</t[dh]>') | ForEach-Object {
        ($_.Groups[1].Value -replace '<[^>]+>', '' -replace '&nbsp;', ' ' -replace '&amp;', '&').Trim()
    }

    # Skip the caption row and the header row.
    if ($cells.Count -lt 5)          { continue }
    if ($cells[0] -eq 'River')       { continue }

    if ($cells.Count -ge 6) {
        $currentRiver = $cells[0]
        $gauge = $cells[1]; $district = $cells[2]; $dl = $cells[3]; $hfl = $cells[4]; $hflDate = $cells[5]
    } else {
        # rowspan continuation: river inherited from the row above
        $gauge = $cells[0]; $district = $cells[1]; $dl = $cells[2]; $hfl = $cells[3]; $hflDate = $cells[4]
    }

    $out.Add([pscustomobject]@{
        river           = $currentRiver
        gauge_location  = $gauge
        district        = $district
        danger_level_m  = [double]$dl
        hfl_m           = [double]$hfl
        hfl_date_raw    = $hflDate
    })
}

$out | Export-Csv -Path $OutCsv -NoTypeInformation -Encoding utf8
Write-Host ("Parsed {0} gauge stations -> {1}" -f $out.Count, $OutCsv) -ForegroundColor Green
$out | Format-Table -AutoSize
