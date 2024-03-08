@echo off

set "_cd=%cd:\=" & set "_cd=%"

ECHO Started robocopy service.
robocopy "%USERPROFILE%/%_cd%" "%USERPROFILE%/OneDrive/Desktop/%_cd%" /mir /mot:1 /xd node_modules dist
ECHO Stopped, press any key to continue.
PAUSE
