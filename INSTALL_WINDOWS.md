```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
shutdown /r /t 0
```

```powershell
wsl --install -d Ubuntu
wsl --set-default-version 2
```

```powershell
docker --version
docker compose version
cd C:\Users\Dell\Desktop\tiktok-marwan
docker compose up -d --build
```

```powershell
docker compose ps
docker compose logs -f api
docker compose down
```