' create_shortcut.vbs
'Create a desktop shortcut pointing to the BAT given as argument.
Option Explicit
Dim WshShell, fso, args, targetBat, desktopPath, shortcut, iconPath
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
Set args = WScript.Arguments
If args.Count = 0 Then
  WScript.Echo "Usage: cscript //nologo create_shortcut.vbs path\to\run-suppirette.bat"
  WScript.Quit 1
End If

targetBat = args(0)
If Not fso.FileExists(targetBat) Then
  WScript.Echo "Target not found: " & targetBat
  WScript.Quit 1
End If

desktopPath = WshShell.SpecialFolders("Desktop")
Set shortcut = WshShell.CreateShortcut(desktopPath & "\Suppirette.lnk")
shortcut.TargetPath = targetBat
shortcut.WorkingDirectory = fso.GetParentFolderName(targetBat)
shortcut.WindowStyle = 1

' Prefer a project icon if present
iconPath = fso.BuildPath(fso.GetParentFolderName(targetBat), "suppirette.ico")
If fso.FileExists(iconPath) Then
  shortcut.IconLocation = iconPath
Else
  ' fall back to a generic shell icon
  shortcut.IconLocation = WshShell.ExpandEnvironmentStrings("%SystemRoot%\\system32\\shell32.dll,3")
End If

shortcut.Save
WScript.Echo "Shortcut created on Desktop: Suppirette.lnk"
