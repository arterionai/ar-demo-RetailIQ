<#
.SYNOPSIS
  Exporta un documento Markdown a Word (.docx) con formato profesional.

.DESCRIPTION
  Convierte un subconjunto de Markdown (headings, párrafos, listas anidadas y con
  continuación, tablas, blockquotes, reglas horizontales, negritas/cursivas/código
  inline) a HTML con estilos, y usa Word (COM) para guardarlo como .docx real,
  agregando portada, tabla de contenidos y numeración de páginas.

  Todo lo que aparece antes de la primera línea `---` se trata como PORTADA.

  Requiere Microsoft Word instalado. No requiere Python ni pandoc.

.EXAMPLE
  ./scripts/md-to-docx.ps1 docs/demo-storytelling.md
  ./scripts/md-to-docx.ps1 docs/demo-storytelling.md out/Recorrido.docx
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$InputPath,

  [Parameter(Position = 1)]
  [string]$OutputPath,

  [switch]$NoToc
)

$ErrorActionPreference = 'Stop'

# --- Paleta y tipografía --------------------------------------------------
$Teal      = '#0F6E6E'
$TealDark  = '#0A4F4F'
$TealLight = '#EAF4F4'
$Rule      = '#C7DEDE'
$Ink       = '#1F2328'
$Muted     = '#5A6A6A'
$CodeBg    = '#F3F6F6'
$Serif     = "Aptos,'Segoe UI',Calibri,sans-serif"
$Mono      = "Consolas,'Cascadia Mono',monospace"

# --- Resolución de rutas --------------------------------------------------
$InputPath = (Resolve-Path -LiteralPath $InputPath).Path
if (-not $OutputPath) {
  $OutputPath = [IO.Path]::ChangeExtension($InputPath, '.docx')
} else {
  $dir = Split-Path -Parent $OutputPath
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $OutputPath = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
}

# --- Inline markdown -> HTML ---------------------------------------------
function ConvertTo-Inline {
  param([string]$Text)
  if ($null -eq $Text) { return '' }
  $t = $Text -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
  $t = [regex]::Replace($t, '`([^`]+)`', "<span style=""font-family:$Mono;font-size:9.5pt;background:#F1F5F5;"">`$1</span>")
  $t = [regex]::Replace($t, '\*\*(.+?)\*\*', '<b>$1</b>')
  $t = [regex]::Replace($t, '(?<![\*\w])\*([^\*]+)\*(?!\*)', '<i>$1</i>')
  $t = [regex]::Replace($t, '\[([^\]]+)\]\(([^\)]+)\)', '<b>$1</b>')
  return $t
}

# --- Estado del generador -------------------------------------------------
$sb = New-Object System.Text.StringBuilder
function Emit { param([string]$s) [void]$sb.AppendLine($s) }

$script:listStack = New-Object System.Collections.Generic.List[string]
$script:liOpen = $false

function Close-ListItem {
  if ($script:liOpen) { Emit '</li>'; $script:liOpen = $false }
}
function Close-Lists {
  Close-ListItem
  while ($script:listStack.Count -gt 0) {
    $tag = $script:listStack[$script:listStack.Count - 1]
    $script:listStack.RemoveAt($script:listStack.Count - 1)
    Emit "</$tag>"
  }
}

$pStyle  = "font-family:$Serif;font-size:11pt;color:$Ink;line-height:135%;margin:0 0 8pt 0;text-align:justify;"
$liStyle = "font-family:$Serif;font-size:11pt;color:$Ink;line-height:135%;margin:0 0 5pt 0;"

function Emit-Quote {
  param([string[]]$Lines, [int]$Indent = 0)
  $ml = 6 + $Indent
  Emit "<div style=""margin:8pt 0 10pt ${ml}pt;padding:5pt 0 5pt 12pt;border-left:3pt solid $Teal;background:$TealLight;"">"
  $buf = @()
  foreach ($l in $Lines) {
    if ($l.Trim() -eq '') {
      if ($buf.Count) { Emit ("<p style=""font-family:$Serif;font-size:11pt;color:$TealDark;line-height:135%;margin:0 0 6pt 0;"">" + ((ConvertTo-Inline ($buf -join ' ')) ) + '</p>'); $buf = @() }
    } else { $buf += $l }
  }
  if ($buf.Count) { Emit ("<p style=""font-family:$Serif;font-size:11pt;color:$TealDark;line-height:135%;margin:0;"">" + (ConvertTo-Inline ($buf -join ' ')) + '</p>') }
  Emit '</div>'
}

function Emit-Code {
  param([string[]]$Lines)
  Emit "<div style=""margin:6pt 0 10pt 0;"">"
  foreach ($l in $Lines) {
    $esc = $l -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
    $esc = [regex]::Replace($esc, '^\s+', { param($m) '&nbsp;' * $m.Value.Length })
    if ($esc.Trim() -eq '') { $esc = '&nbsp;' }
    Emit ("<p style=""font-family:$Mono;font-size:8.5pt;color:#243434;background:$CodeBg;margin:0;padding:1pt 6pt;line-height:120%;"">$esc</p>")
  }
  Emit '</div>'
}

function Emit-Table {
  param([string[]]$Rows)
  $cells = @()
  foreach ($r in $Rows) {
    $trim = $r.Trim()
    $trim = $trim -replace '^\|', '' -replace '\|$', ''
    $cells += , ($trim -split '\s*\|\s*')
  }
  $header = $cells[0]
  $body = if ($cells.Count -gt 2) { $cells[2..($cells.Count - 1)] } else { @() }

  Emit "<table style=""border-collapse:collapse;width:100%;margin:8pt 0 12pt 0;"" border=""1"" cellspacing=""0"" cellpadding=""0"">"
  Emit '<tr>'
  foreach ($h in $header) {
    Emit ("<td style=""background:$Teal;border:0.5pt solid $Teal;padding:5pt 7pt;"" valign=""top""><p style=""font-family:$Serif;font-size:10pt;color:#FFFFFF;margin:0;""><b>" + (ConvertTo-Inline $h) + '</b></p></td>')
  }
  Emit '</tr>'
  $i = 0
  foreach ($row in $body) {
    $bg = if ($i % 2 -eq 0) { '#FFFFFF' } else { $TealLight }
    Emit '<tr>'
    foreach ($c in $row) {
      Emit ("<td style=""background:$bg;border:0.5pt solid $Rule;padding:5pt 7pt;"" valign=""top""><p style=""font-family:$Serif;font-size:10pt;color:$Ink;margin:0;"">" + (ConvertTo-Inline $c) + '</p></td>')
    }
    Emit '</tr>'
    $i++
  }
  Emit '</table>'
}

# --- Lectura y separación de portada -------------------------------------
$lines = [IO.File]::ReadAllLines($InputPath, [Text.Encoding]::UTF8)

$sepIndex = -1
for ($k = 0; $k -lt $lines.Count; $k++) {
  if ($lines[$k].Trim() -match '^-{3,}$') { $sepIndex = $k; break }
}
if ($sepIndex -lt 0) { $coverLines = @(); $bodyStart = 0 }
else { $coverLines = $lines[0..($sepIndex - 1)]; $bodyStart = $sepIndex + 1 }

# --- Portada ---------------------------------------------------------------
Emit "<div style=""margin-top:150pt;"">"
foreach ($cl in $coverLines) {
  $t = $cl.Trim()
  if ($t -eq '') { continue }
  if ($t -match '^#\s+(.*)$') {
    Emit ("<p style=""font-family:$Serif;font-size:34pt;color:$Teal;margin:0 0 2pt 0;text-align:center;""><b>" + (ConvertTo-Inline $Matches[1]) + '</b></p>')
    Emit "<p style=""margin:0 0 14pt 0;text-align:center;""><span style=""font-size:2pt;"">&nbsp;</span></p>"
  } elseif ($t -match '^##\s+(.*)$') {
    Emit ("<p style=""font-family:$Serif;font-size:16pt;color:$TealDark;margin:0 0 22pt 0;text-align:center;"">" + (ConvertTo-Inline $Matches[1]) + '</p>')
  } else {
    Emit ("<p style=""font-family:$Serif;font-size:11pt;color:$Muted;margin:0 0 7pt 0;text-align:center;"">" + (ConvertTo-Inline $t) + '</p>')
  }
}
Emit '</div>'
Emit "<p style=""page-break-before:always;font-size:1pt;margin:0;"">&nbsp;</p>"
if (-not $NoToc) {
  Emit ("<p style=""font-family:$Serif;font-size:16pt;color:$Teal;margin:0 0 12pt 0;""><b>Contenido</b></p>")
  Emit ("<p style=""font-family:$Serif;font-size:11pt;margin:0;"">[[TOC]]</p>")
  Emit "<p style=""page-break-before:always;font-size:1pt;margin:0;"">&nbsp;</p>"
}

# --- Cuerpo ----------------------------------------------------------------
$i = $bodyStart
while ($i -lt $lines.Count) {
  $raw = $lines[$i]
  $line = $raw.TrimEnd()
  $trim = $line.Trim()

  # Bloque de código con cercas ```
  if ($trim -match '^```') {
    $i++
    $code = @()
    while ($i -lt $lines.Count -and $lines[$i].Trim() -notmatch '^```') { $code += $lines[$i].TrimEnd(); $i++ }
    if ($i -lt $lines.Count) { $i++ }   # cierre
    Close-Lists
    Emit-Code $code
    continue
  }

  # Tabla
  if ($trim -match '^\|.*\|$') {
    $tbl = @()
    while ($i -lt $lines.Count -and $lines[$i].Trim() -match '^\|.*\|$') { $tbl += $lines[$i].Trim(); $i++ }
    Close-Lists
    if ($tbl.Count -ge 2) { Emit-Table $tbl }
    continue
  }

  # Blockquote indentado (dentro de un item de lista)
  if ($script:liOpen -and $line -match '^\s{2,}>\s?(.*)$') {
    $q = @()
    while ($i -lt $lines.Count -and $lines[$i] -match '^\s{2,}>\s?(.*)$') { $q += $Matches[1]; $i++ }
    Emit-Quote -Lines $q -Indent 0
    continue
  }

  # Blockquote normal
  if ($line -match '^>\s?(.*)$') {
    $q = @()
    while ($i -lt $lines.Count -and $lines[$i].TrimEnd() -match '^>\s?(.*)$') { $q += $Matches[1]; $i++ }
    Close-Lists
    Emit-Quote -Lines $q
    continue
  }

  # Headings
  if ($trim -match '^(#{1,4})\s+(.*)$') {
    Close-Lists
    $lvl = $Matches[1].Length
    $txt = ConvertTo-Inline $Matches[2]
    switch ($lvl) {
      1 { Emit "<h1 style=""page-break-before:always;font-family:$Serif;font-size:22pt;color:$Teal;margin:0 0 4pt 0;border-bottom:1.5pt solid $Teal;padding-bottom:4pt;"">$txt</h1>" }
      2 { Emit "<h2 style=""font-family:$Serif;font-size:15pt;color:$Teal;margin:16pt 0 6pt 0;"">$txt</h2>" }
      3 { Emit "<h3 style=""font-family:$Serif;font-size:12pt;color:$TealDark;margin:12pt 0 4pt 0;"">$txt</h3>" }
      default { Emit "<h4 style=""font-family:$Serif;font-size:11pt;color:$Muted;margin:10pt 0 4pt 0;"">$txt</h4>" }
    }
    $i++
    continue
  }

  # Regla horizontal
  if ($trim -match '^-{3,}$') {
    Close-Lists
    Emit "<p style=""margin:10pt 0 10pt 0;border-top:0.75pt solid $Rule;font-size:1pt;"">&nbsp;</p>"
    $i++
    continue
  }

  # Lista numerada
  if ($line -match '^(\s*)(\d+)\.\s+(.*)$') {
    $content = $Matches[3]
    Close-ListItem
    if ($script:listStack.Count -eq 0 -or $script:listStack[$script:listStack.Count - 1] -ne 'ol') {
      Close-Lists
      Emit "<ol style=""margin:6pt 0 10pt 0;"">"
      $script:listStack.Add('ol')
    }
    Emit ("<li style=""$liStyle"">" + (ConvertTo-Inline $content))
    $script:liOpen = $true
    $i++
    continue
  }

  # Lista con viñetas
  if ($line -match '^(\s*)-\s+(.*)$') {
    $content = $Matches[2]
    Close-ListItem
    if ($script:listStack.Count -eq 0 -or $script:listStack[$script:listStack.Count - 1] -ne 'ul') {
      Close-Lists
      Emit "<ul style=""margin:6pt 0 10pt 0;"">"
      $script:listStack.Add('ul')
    }
    Emit ("<li style=""$liStyle"">" + (ConvertTo-Inline $content))
    $script:liOpen = $true
    $i++
    continue
  }

  # Línea en blanco
  if ($trim -eq '') { $i++; continue }

  # Continuación indentada dentro de un item de lista
  if ($script:liOpen -and $raw -match '^\s{2,}(\S.*)$') {
    $para = @($Matches[1])
    $i++
    while ($i -lt $lines.Count -and $lines[$i].TrimEnd() -match '^\s{2,}(\S.*)$' -and $lines[$i] -notmatch '^\s*[-\d]' ) {
      $para += $lines[$i].Trim(); $i++
    }
    Emit ("<p style=""$pStyle margin-top:5pt;"">" + (ConvertTo-Inline ($para -join ' ')) + '</p>')
    continue
  }

  # Párrafo normal
  Close-Lists
  $para = @($trim)
  $i++
  while ($i -lt $lines.Count) {
    $n = $lines[$i].TrimEnd()
    if ($n.Trim() -eq '') { break }
    if ($n -match '^(#{1,4})\s' -or $n -match '^>' -or $n.Trim() -match '^\|' -or $n -match '^\s*-\s' -or $n -match '^\s*\d+\.\s' -or $n.Trim() -match '^-{3,}$') { break }
    $para += $n.Trim(); $i++
  }
  Emit ("<p style=""$pStyle"">" + (ConvertTo-Inline ($para -join ' ')) + '</p>')
}
Close-Lists

# --- Escribir HTML temporal ------------------------------------------------
$docTitle = [IO.Path]::GetFileNameWithoutExtension($InputPath)
$head = @"
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>$docTitle</title>
<style>
 body  { font-family:$Serif; font-size:11pt; color:$Ink; }
 h1,h2,h3,h4 { font-family:$Serif; }
 table { border-collapse:collapse; }
 li    { font-family:$Serif; font-size:11pt; }
</style>
</head>
<body style="font-family:$Serif;font-size:11pt;color:$Ink;">
"@
$htmlPath = [IO.Path]::ChangeExtension([IO.Path]::GetTempFileName(), '.html')
$utf8Bom = New-Object System.Text.UTF8Encoding($true)
[IO.File]::WriteAllText($htmlPath, ($head + $sb.ToString() + "`n</body></html>"), $utf8Bom)

# --- Word COM --------------------------------------------------------------
Write-Host "Generando .docx con Word..." -ForegroundColor Cyan
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$doc = $null
try {
  $doc = $word.Documents.Open($htmlPath)

  # Márgenes y numeración
  for ($s = 1; $s -le $doc.Sections.Count; $s++) {
    $sec = $doc.Sections.Item($s)
    $ps = $sec.PageSetup
    $ps.TopMargin = $word.CentimetersToPoints(2.5)
    $ps.BottomMargin = $word.CentimetersToPoints(2.2)
    $ps.LeftMargin = $word.CentimetersToPoints(2.5)
    $ps.RightMargin = $word.CentimetersToPoints(2.5)
    $ps.DifferentFirstPageHeaderFooter = $true
    $footer = $sec.Footers.Item(1)   # wdHeaderFooterPrimary
    $footer.Range.Text = ''
    $footer.Range.Fields.Add($footer.Range, 33) | Out-Null   # wdFieldPage
    $footer.Range.ParagraphFormat.Alignment = 1              # centrado
    $footer.Range.Font.Name = 'Aptos'
    $footer.Range.Font.Size = 9
    $footer.Range.Font.Color = 8421504
  }

  # Tabla de contenidos
  if (-not $NoToc) {
    $rng = $doc.Content
    if ($rng.Find.Execute('[[TOC]]')) {
      $rng.Text = ''
      $toc = $doc.TablesOfContents.Add($rng, $true, 1, 2, $false, [Type]::Missing, $true, $true, [Type]::Missing, $true)
      $toc.Update()
      $tr = $toc.Range
      $tr.Font.Name = 'Aptos'
      $tr.Font.Size = 11
      $tr.Font.Color = 5197578   # #0A4F4F en BGR
      $tr.ParagraphFormat.SpaceAfter = 4
    }
  }

  # Word descarta el border-left de los blockquotes al importar HTML: se repone aquí.
  # Se reconocen por el sombreado teal claro (#EAF4F4 -> 16053482 en BGR).
  $quoteBg = 16053482
  $codeBg  = 16185075   # #F3F6F6 en BGR
  for ($p = 1; $p -le $doc.Paragraphs.Count; $p++) {
    $par = $doc.Paragraphs.Item($p)
    if ($par.Shading.BackgroundPatternColor -eq $codeBg) {
      $par.LeftIndent = 12
      $par.RightIndent = 6
      $par.SpaceBefore = 0
      $par.SpaceAfter = 0
      continue
    }
    if ($par.Shading.BackgroundPatternColor -eq $quoteBg) {
      $b = $par.Borders.Item(-2)      # wdBorderLeft
      $b.LineStyle = 1                # wdLineStyleSingle
      $b.LineWidth = 12               # 1.5 pt
      $b.Color = 7237135              # #0F6E6E en BGR
      $par.LeftIndent = $par.LeftIndent + 10
      $par.RightIndent = 6
      $par.SpaceBefore = 3
      $par.SpaceAfter = 3
    }
  }

  # Propiedades del documento
  try { $doc.BuiltInDocumentProperties.Item('Title').Value = $docTitle } catch { }

  if (Test-Path -LiteralPath $OutputPath) { Remove-Item -LiteralPath $OutputPath -Force }
  $doc.SaveAs2($OutputPath, 16)   # wdFormatDocumentDefault (.docx)
  Write-Host "OK -> $OutputPath" -ForegroundColor Green
}
finally {
  if ($doc) { $doc.Close(0) }
  $word.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
  Remove-Item -LiteralPath $htmlPath -Force -ErrorAction SilentlyContinue
}
