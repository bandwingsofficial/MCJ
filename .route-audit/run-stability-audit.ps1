# Final route stability audit — 3 clean next-dev restarts
$ErrorActionPreference = "Continue"
$AdminPort = 3010
$CustomerPort = 3011
$AdminRoot = "D:\webs\mcj-new\MCJ-WEB\apps\admin-web"
$CustomerRoot = "D:\webs\mcj-new\MCJ-WEB\apps\customer-web"
$ReportDir = "D:\webs\mcj-new\MCJ-WEB\.route-audit"
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

function Kill-Port([int]$Port) {
  $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $conns) {
    if ($procId) {
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
  }
}

function Wait-Ready([int]$Port, [int]$TimeoutSec = 90) {
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $code = curl.exe -s -o NUL -w "%{http_code}" --max-time 3 "http://localhost:$Port/"
      if ($code -match '^\d{3}$' -and $code -ne "000") { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

function Probe([string]$Url, [string]$Mode) {
  $headers = @()
  if ($Mode -eq "refresh") {
    $headers += "-H"; $headers += "Cache-Control: no-cache"
    $headers += "-H"; $headers += "Pragma: no-cache"
  }
  if ($Mode -eq "client") {
    # Simulate App Router client transition (RSC flight) after prior page load
    $headers += "-H"; $headers += "RSC: 1"
    $headers += "-H"; $headers += "Next-Router-Prefetch: 0"
    $headers += "-H"; $headers += 'Next-Url: /'
  }
  $code = & curl.exe -s -o NUL -w "%{http_code}" --max-time 60 @headers $Url
  if (-not $code) { $code = "000" }
  return $code
}

$adminValid = @(
  "/login",
  "/courses",
  "/courses/audit-course/manage",
  "/courses/audit-course/manage/modules/audit-module",
  "/courses/audit-course/manage/modules/audit-module/lessons/audit-lesson/manage",
  "/courses/audit-course/manage/modules/audit-module/lessons/audit-lesson/quiz",
  "/courses/audit-course/modules/audit-module/lessons",
  "/courses/audit-course/modules/audit-module/lessons/audit-lesson/resources",
  "/branches/audit-branch/manage",
  "/batches/audit-batch/manage",
  "/batches/audit-batch/timings/audit-timing/manage",
  "/batches/audit-batch/modes/offline/manage",
  "/students/audit-student/manage",
  "/enrollments/audit-enrollment/manage",
  "/community/audit-post/manage"
)

$customerValid = @(
  "/",
  "/courses",
  "/courses/junior-accountant",
  "/courses/junior-accountant/enroll",
  "/jobs",
  "/jobs/junior-accountant",
  "/jobs/junior-accountant/apply",
  "/jobs/junior-accountant/apply/success",
  "/branches/malleshwaram",
  "/onboarding/job",
  "/student/jobs",
  "/student/jobs/audit-job",
  "/student/jobs/audit-job/apply",
  "/student/enrollments",
  "/student/my-learning"
)

$adminInvalid = @(
  "/this-route-does-not-exist-xyz",
  "/courses/audit-course/manage/modules/m1/DOES-NOT-EXIST",
  "/courses/audit-course/modules/m1/lessons/l1/nope",
  "/batches/audit-batch/modes/offline/manage/extra"
)

$customerInvalid = @(
  "/totally-missing-page",
  "/jobs/junior-accountant/apply/nope",
  "/courses/junior-accountant/enroll/extra",
  "/branches/malleshwaram/extra-segment"
)

$allResults = @()

for ($cycle = 1; $cycle -le 3; $cycle++) {
  Write-Host "`n======== CLEAN RESTART CYCLE $cycle ========"

  Kill-Port $AdminPort
  Kill-Port $CustomerPort
  Start-Sleep -Seconds 2

  if (Test-Path "$AdminRoot\.next") { Remove-Item -LiteralPath "$AdminRoot\.next" -Recurse -Force }
  if (Test-Path "$CustomerRoot\.next") { Remove-Item -LiteralPath "$CustomerRoot\.next" -Recurse -Force }

  $adminLog = Join-Path $ReportDir "admin-c$cycle.log"
  $customerLog = Join-Path $ReportDir "customer-c$cycle.log"

  Start-Process -FilePath "cmd.exe" -ArgumentList @("/c","pnpm exec next dev --port $AdminPort") `
    -WorkingDirectory $AdminRoot -RedirectStandardOutput $adminLog -RedirectStandardError "$adminLog.err" `
    -WindowStyle Hidden -PassThru | Out-Null
  Start-Process -FilePath "cmd.exe" -ArgumentList @("/c","pnpm exec next dev --port $CustomerPort") `
    -WorkingDirectory $CustomerRoot -RedirectStandardOutput $customerLog -RedirectStandardError "$customerLog.err" `
    -WindowStyle Hidden -PassThru | Out-Null

  if (-not (Wait-Ready $AdminPort)) { throw "Admin failed to become ready in cycle $cycle" }
  if (-not (Wait-Ready $CustomerPort)) { throw "Customer failed to become ready in cycle $cycle" }
  Write-Host "Both servers ready (cycle $cycle)"

  function Run-Suite($Base, $Valid, $Invalid, $App) {
    $rows = @()
    foreach ($path in $Valid) {
      $url = "$Base$path"
      # Warm parent then deep (client-nav style path)
      $parent = if ($path -match '^(/[^/]+)') { $Matches[1] } else { "/" }
      [void](Probe "$Base$parent" "direct")

      $d = Probe $url "direct"
      $r = Probe $url "refresh"
      $c = Probe $url "client"
      $ok = ($d -eq "200" -and $r -eq "200" -and $c -eq "200")
      $rows += [pscustomobject]@{
        Cycle = $cycle; App = $App; Path = $path; Kind = "valid"
        Direct = $d; Refresh = $r; Client = $c; Pass = $ok
      }
      $mark = if ($ok) { "PASS" } else { "FAIL" }
      Write-Host ("[{0}] {1} {2} d={3} r={4} c={5}" -f $mark, $App, $path, $d, $r, $c)
    }
    foreach ($path in $Invalid) {
      $url = "$Base$path"
      $d = Probe $url "direct"
      # App Router notFound() under catch-alls may soft-stream 200 HTML with NEXT_HTTP_ERROR_FALLBACK;404
      # True missing filesystem routes return hard 404. Accept either hard 404 or soft notFound digest.
      $bodyFile = Join-Path $ReportDir "body-tmp.html"
      curl.exe -s -o $bodyFile --max-time 60 $url | Out-Null
      $body = Get-Content -Raw -Path $bodyFile -ErrorAction SilentlyContinue
      $soft404 = $body -match 'NEXT_HTTP_ERROR_FALLBACK;404'
      $hard404 = ($d -eq "404")
      $ok = $hard404 -or $soft404
      $rows += [pscustomobject]@{
        Cycle = $cycle; App = $App; Path = $path; Kind = "invalid"
        Direct = $d; Refresh = $(if ($soft404) { "soft404" } else { $d }); Client = "-"; Pass = $ok
      }
      $mark = if ($ok) { "PASS" } else { "FAIL" }
      Write-Host ("[{0}] {1} INVALID {2} status={3} soft404={4}" -f $mark, $App, $path, $d, $soft404)
    }
    return $rows
  }

  $allResults += Run-Suite "http://localhost:$AdminPort" $adminValid $adminInvalid "admin-web"
  $allResults += Run-Suite "http://localhost:$CustomerPort" $customerValid $customerInvalid "customer-web"

  Kill-Port $AdminPort
  Kill-Port $CustomerPort
  Start-Sleep -Seconds 2
  Write-Host "Cycle $cycle servers stopped"
}

$csv = Join-Path $ReportDir "results.csv"
$allResults | Export-Csv -NoTypeInformation -Path $csv
$failed = @($allResults | Where-Object { -not $_.Pass })
$passed = @($allResults | Where-Object { $_.Pass })

Write-Host "`n======== SUMMARY ========"
Write-Host ("Total checks: {0}" -f $allResults.Count)
Write-Host ("Passed: {0}" -f $passed.Count)
Write-Host ("Failed: {0}" -f $failed.Count)
if ($failed.Count -gt 0) {
  Write-Host "FAILURES:"
  $failed | Format-Table -AutoSize | Out-String | Write-Host
  exit 1
}
Write-Host "ALL CYCLES PASSED"
exit 0
