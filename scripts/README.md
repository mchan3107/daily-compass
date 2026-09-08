# Scripts

Start and stop the single Daily Compass Docker container.

Mac / Linux:

```
./scripts/start.sh
./scripts/stop.sh
```

Windows:

```
scripts\start.ps1
scripts\stop.ps1
```

The app is at http://127.0.0.1:8080

Start builds the image, replaces any existing `daily-compass` container, and passes `.env` from the workspace root (parent of `dc/`) when that file exists.
