# Timberlake Workshop Timer

A simple installable workshop job timer.

## Run it on the work computer

1. Extract the ZIP.
2. Open PowerShell in the extracted folder.
3. Run:

   python -m http.server 8000

4. Open http://localhost:8000 in Chrome or Edge.

Opening `index.html` directly will show the app, but the install/offline features require a local web server.

## Current features

- Create and label jobs
- Registration, customer, job number and notes
- One running timer at a time
- Pause and resume
- Accurate timestamp-based timing
- Complete and reopen jobs
- View individual time sessions
- Search completed jobs
- Export completed jobs to CSV
- Local browser storage
- Offline-capable PWA

## Important

Data is currently stored only in the browser on that device. Do not clear browser site data. Cloud backup and multi-device syncing are not yet included.


## Version 2 changes

- Running job automatically appears first
- Two active job cards per row on phones
- Customer is now the main job title
- Mileage replaces job number
- Make and model fields added
