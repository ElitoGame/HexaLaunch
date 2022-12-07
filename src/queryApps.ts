export const queryLinkedApps = `
$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();
$lrelevant = @();
foreach ($file in Get-ChildItem "$env:ALLUSERSPROFILE\\Microsoft\\Windows\\Start Menu\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
    $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
    $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
    if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;


$lrelevant = @();
foreach ($file in Get-ChildItem "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
    $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
    $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
    if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;

$lrelevant = @();
foreach ($file in Get-ChildItem "$env:HOMEPATH\\Desktop\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
    $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
    $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
    if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;

$lrelevant = @();
foreach ($file in Get-ChildItem "$env:PUBLIC\\Desktop\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
    $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
    $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
    if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;

$relevant = $relevant | Sort-Object executable -Unique;

$relevant = $relevant | Where-Object {!($_.executable -match "setup" -or $_.executable -match "install" -or $_.executable -match "unins" -or $_.executable -match "update" -or $_.executable -match "repair" -or $_.executable -match "upgrade" -or $_.executable -match"patch" -or $_.executable -match"helper" -or $_.executable -match"verif" -or $_.executable -match"crash" -or $_.executable -match"bug")}
$relevant;
`;

export const queryInterestingRelevantApps = `
$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();
$lrelevant = @();
foreach ($file in Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*) {
    if (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -match "\\.exe") {

        $path = (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] + ".exe";
        $name = ($file | Select-Object DisplayName | Format-table -HideTableHeaders | Out-String);
        if ($name -match "Win" -or $name -match "Microsoft" -or $name -match "unins" -or $path -match "unins") {
            continue;
        }
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;

$lrelevant = @();
foreach ($file in Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*) {
    if (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -match "\\.exe") {

        $path = (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] + ".exe";
        $name = ($file | Select-Object DisplayName | Format-table -HideTableHeaders | Out-String);
        if ($name -match "Win" -or $name -match "Microsoft" -or $name -match "unins" -or $path -match "unins") {
            continue;
        }
        $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
    }
}
$relevant += $lrelevant;

$relevant += $lrelevant;

$relevant = $relevant | Sort-Object executable -Unique;

$relevant = $relevant | Where-Object {!($_.executable -match "setup" -or $_.executable -match "install" -or $_.executable -match "unins" -or $_.executable -match "update" -or $_.executable -match "repair" -or $_.executable -match "upgrade" -or $_.executable -match"patch" -or $_.executable -match"helper" -or $_.executable -match"verif" -or $_.executable -match"crash" -or $_.executable -match"bug")}
$relevant;
`;

export const queryRelevantApps = `

$stopwatch = [system.diagnostics.stopwatch]::startNew();
$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();

# query relevant apps

Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "$env:ALLUSERSPROFILE\\Microsoft\\Windows\\Start Menu\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
        $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
        if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null

Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
        $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
        if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null

Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "$env:HOMEPATH\\Desktop\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
        $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
        if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null
Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "$env:PUBLIC\\Desktop\\" -Recurse *.lnk | Select-Object VersionInfo -ExpandProperty VersionInfo | Select FileName) {
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.lnk")[0] -split "\\\\")[-1];
        $path = (New-Object -ComObject WScript.Shell).CreateShortcut(($file | Format-table  -HideTableHeaders | Out-String).Trim()).TargetPath;
        if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null
Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object -Expand MainModule -ErrorAction SilentlyContinue | Select-Object -Property FileName) {
        $path = ($file | Format-table -HideTableHeaders | Out-String).Trim();
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] -split "\\\\")[-1];
        if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null
Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*) {
        if (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -match "\\.exe") {

            $path = (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] + ".exe";
            $name = ($file | Select-Object DisplayName | Format-table -HideTableHeaders | Out-String);
            if ($name -match "Win" -or $name -match "Microsoft" -or $name -match "unins" -or $path -match "unins") {
                continue;
            }
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null
Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*) {
        if (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -match "\\.exe") {

            $path = (($file | Select-Object DisplayIcon | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] + ".exe";
            $name = ($file | Select-Object DisplayName | Format-table -HideTableHeaders | Out-String);
            if ($name -match "Win" -or $name -match "Microsoft" -or $name -match "unins" -or $path -match "unins") {
                continue;
            }
            $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
        }
    }
    return $lrelevant;
} | Out-Null

$relevant += Receive-Job -Name AppQuery -Wait -AutoRemoveJob

$relevant = $relevant | Sort-Object executable -Unique;

$relevant = $relevant | Where-Object {!($_.executable -match "setup" -or $_.executable -match "install" -or $_.executable -match "unins" -or $_.executable -match "update" -or $_.executable -match "repair" -or $_.executable -match "upgrade" -or $_.executable -match"patch" -or $_.executable -match"helper" -or $_.executable -match"verif" -or $_.executable -match"crash" -or $_.executable -match"bug")}



$groupSize = 30;

$relevantGroups = [PSCustomObject[]]::new([math]::Ceiling($relevant.count / $groupSize))
for($i=0; $i -lt $relevant.count; $i+=$groupSize){
    $relevantGroups[($i / $groupSize)] = $relevant[$i..($i+$groupSize -1)]
}

$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();
for ($i=0; $i -lt $relevantGroups.Count; $i++) {
    $group = $relevantGroups[$i];
    Start-Job -Name AppIconQuery -InputObject $group -ScriptBlock {
        param($index)
        [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing");
        $result = [System.Collections.Generic.List[PSCustomObject]]::new();
        $input | ForEach-Object {
            foreach ($app in $_) {
                try {
                    [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing");
                    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($app.executable)
                    $memoryStream = New-Object System.IO.MemoryStream
                    $icon.ToBitmap().Save($memoryStream, "Png")
                    $base64String = [Convert]::ToBase64String($memoryStream.ToArray())
                    $byteArray = [Convert]::FromBase64String($base64String)
                    $compressedStream = New-Object System.IO.MemoryStream
                    $deflateStream = New-Object System.IO.Compression.DeflateStream($compressedStream, [System.IO.Compression.CompressionMode]::Compress)
                    $deflateStream.Write($byteArray, 0, $byteArray.Length)
                    $deflateStream.Close()
                    $compressedBase64 = [Convert]::ToBase64String($compressedStream.ToArray())
                    $name = [System.Text.Encoding]::Default.GetString([System.Text.Encoding]::UTF8.GetBytes($app.name));
                    $result.Add([PSCustomObject]@{name = $name; executable = $app.executable; icon = $base64String});
                } catch {
                }
            }
        }
        return $result;
    } -Arg $i | Out-Null
}

$relevant += Receive-Job -Name AppIconQuery -Wait -AutoRemoveJob

#'[{"executable":"Outoutout","name":"Output Data","icon":"dataimage"}]'
$relevant = $relevant.Where({$_.icon -ne ''});
$relevant | Select-Object -Property name, executable, icon | ConvertTo-Json -Compress
`;

export const queryOtherApps = `

$stopwatch = [system.diagnostics.stopwatch]::startNew();
$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();

# query relevant apps

Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "\${env:ProgramFiles}\\" -Recurse -ErrorAction SilentlyContinue *.exe | Select-Object VersionInfo -ExpandProperty VersionInfo -ErrorAction SilentlyContinue | Select FileName) {
        $path = ($file | Format-table -HideTableHeaders | Out-String).Trim();
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] -split "\\\\")[-1];
        try {
            if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
                $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
            }
        } 
        catch {
        }
    }
    return $lrelevant;
} | Out-Null
"found progs"
Start-Job -Name AppQuery -ScriptBlock {
    $lrelevant = @();
    foreach ($file in Get-ChildItem "\${env:ProgramFiles(x86)}\\" -Recurse -ErrorAction SilentlyContinue *.exe | Select-Object VersionInfo -ExpandProperty VersionInfo -ErrorAction SilentlyContinue | Select FileName) {
        $path = ($file | Format-table -HideTableHeaders | Out-String).Trim();
        $name = ((($file | Format-table -HideTableHeaders | Out-String).Trim() -split "\\.exe")[0] -split "\\\\")[-1];
        try {
            if ($path.EndsWith(".exe","CurrentCultureIgnoreCase")){
                $lrelevant += [PSCustomObject]@{name = $name; executable = $path; icon = ""};
            }
        } 
        catch {
        }
    }
    return $lrelevant;
} | Out-Null

$relevant += Receive-Job -Name AppQuery -Wait -AutoRemoveJob

$relevant = $relevant | Sort-Object executable -Unique;

$relevant = $relevant | Where-Object {!($_.executable -match "setup" -or $_.executable -match "install" -or $_.executable -match "unins" -or $_.executable -match "update" -or $_.executable -match "repair" -or $_.executable -match "upgrade" -or $_.executable -match"patch" -or $_.executable -match"helper" -or $_.executable -match"verif" -or $_.executable -match"crash" -or $_.executable -match"bug")}



$groupSize = 30;

$relevantGroups = [PSCustomObject[]]::new([math]::Ceiling($relevant.count / $groupSize))
for($i=0; $i -lt $relevant.count; $i+=$groupSize){
    $relevantGroups[($i / $groupSize)] = $relevant[$i..($i+$groupSize -1)]
}

$relevant = [System.Collections.Generic.List[PSCustomObject]]::new();
for ($i=0; $i -lt $relevantGroups.Count; $i++) {
    $group = $relevantGroups[$i];
    Start-Job -Name AppIconQuery -InputObject $group -ScriptBlock {
        param($index)
        [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing");
        $result = [System.Collections.Generic.List[PSCustomObject]]::new();
        $input | ForEach-Object {
            foreach ($app in $_) {
                try {
                    [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing");
                    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($app.executable)
                    $memoryStream = New-Object System.IO.MemoryStream
                    $icon.ToBitmap().Save($memoryStream, "Png")
                    $base64String = [Convert]::ToBase64String($memoryStream.ToArray())
                    # $byteArray = [Convert]::FromBase64String($base64String)
                    # $compressedStream = New-Object System.IO.MemoryStream
                    # $deflateStream = New-Object System.IO.Compression.DeflateStream($compressedStream, [System.IO.Compression.CompressionMode]::Compress)
                    # $deflateStream.Write($byteArray, 0, $byteArray.Length)
                    # $deflateStream.Close()
                    # $compressedBase64 = [Convert]::ToBase64String($compressedStream.ToArray())
                    $name = [System.Text.Encoding]::Default.GetString([System.Text.Encoding]::UTF8.GetBytes($app.name));
                    $result.Add([PSCustomObject]@{name = $name; executable = $app.executable; icon = $base64String});
                } catch {
                }
            }
        }
        return $result;
    } -Arg $i | Out-Null
}

$relevant += Receive-Job -Name AppIconQuery -Wait -AutoRemoveJob


$relevant = $relevant.Where({$_.icon -ne ''});
$relevant | Select-Object -Property name, executable, icon | ConvertTo-Json -Compress
`;

export const queryIconOfExe = (path: string) => `
[void] [System.Reflection.Assembly]::LoadWithPartialName("System.Drawing");
$icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${path}")
$memoryStream = New-Object System.IO.MemoryStream
$icon.ToBitmap().Save($memoryStream, "Png")
$base64String = [Convert]::ToBase64String($memoryStream.ToArray())
$base64String
# $byteArray = [Convert]::FromBase64String($base64String)
# $compressedStream = New-Object System.IO.MemoryStream
# $deflateStream = New-Object System.IO.Compression.DeflateStream($compressedStream, [System.IO.Compression.CompressionMode]::Compress)
# $deflateStream.Write($byteArray, 0, $byteArray.Length)
# $deflateStream.Close()
# $compressedBase64 = [Convert]::ToBase64String($compressedStream.ToArray())
# $compressedBase64
`;

export const queryNamesOfExes = (paths: string, index: number) => `
    $PSDefaultParameterValues = @{ '*:Encoding' = 'utf8' }
    $file = (get-childitem ${('"' + paths + '"').replace(
      '"",',
      ''
    )} | % {$_.VersionInfo} | Select ProductName, FileDescription, FileName | ForEach-Object { '{{"productName":"{0}", "fileDescription":"{1}", "fileName":"{2}"}}' -f $_.ProductName, $_.FileDescription, $_.FileName }) -join ','
    Write-Output $file > $env:TEMP\\zRadialAppNames${index}.json
    "data!"
`;
