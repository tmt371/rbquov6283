# 輸出檔案的名稱
$outputFile = "codebase_snapshot.txt"

# 執行前先清空舊檔案，確保快照的純淨度
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# 定義要包含的專案原始碼檔案/資料夾列表
$includePaths = @(
    ".gitignore",
    ".gitattributes",
    "package.json",
    "package-lock.json",
    "index.html",
    "style.css",
    "jest.config.js",
    "babel.config.js",
    ".eslintrc.json",
    ".prettierrc.json",
    "03-data-models",
    "04-core-code"
)

# 遍歷所有指定的路徑
# 【主要變更】在 Where-Object 中加入一個條件，確保檔案的完整路徑 (FullName) 不包含 "node_modules"
Get-ChildItem -Path $includePaths -Recurse | Where-Object { !$_.PSIsContainer -and $_.FullName -notlike "*node_modules*" } | ForEach-Object {
    # 取得相對於腳本執行位置的相對路徑
    $relativePath = $_.FullName.Substring($PWD.Path.Length + 1)
    
    # 標準化路徑分隔符，將 Windows 的 '\' 轉換為 UNIX 的 '/'
    $normalizedPath = $relativePath.Replace("\", "/")

    # 寫入檔案標頭
    Add-Content -Path $outputFile -Value "--- FILE START: $normalizedPath ---"
    
    # 寫入檔案的完整內容
    Add-Content -Path $outputFile -Value (Get-Content $_.FullName -Raw)
    
    # 寫入檔案結尾
    Add-Content -Path $outputFile -Value "--- FILE END ---`n"
}

Write-Host "Codebase snapshot created successfully: $outputFile"