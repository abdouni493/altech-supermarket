@echo off
REM create_shortcut.bat — helper to create desktop shortcut for run-suppirette.bat
SET SCRIPT_DIR=%~dp0

SET TARGET=%SCRIPT_DIR%run-suppirette.bat

REM Use cscript to run the VBScript that creates the shortcut
cscript //nologo "%SCRIPT_DIR%create_shortcut.vbs" "%TARGET%"
