---
description: Start the AcaDiet backend (port 3001) and frontend (port 3000) dev servers
---

Start the AcaDiet local development servers. Follow these steps exactly:

1. Check if ports 3000 or 3001 are already in use:
   ```
   lsof -ti:3001,3000
   ```
   If anything is returned, kill those processes first:
   ```
   lsof -ti:3001 | xargs kill -9 2>/dev/null; lsof -ti:3000 | xargs kill -9 2>/dev/null
   ```

2. Start the backend in the background:
   ```
   cd /Users/jasonlin/AcaDiet/backend && npm start > /tmp/acadiet-backend.log 2>&1 &
   ```

3. Wait 3 seconds, then verify the backend is up:
   ```
   sleep 3 && curl -s http://localhost:3001/health
   ```
   It should return `{"status":"OK",...}`. If it fails, show the last 20 lines of `/tmp/acadiet-backend.log` and stop.

4. Start the frontend in the background (suppress auto-browser open):
   ```
   cd /Users/jasonlin/AcaDiet/frontend && BROWSER=none npm start > /tmp/acadiet-frontend.log 2>&1 &
   ```

5. Wait 15 seconds for the React dev server to compile, then verify:
   ```
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   It should return `200`. If it fails, show the last 20 lines of `/tmp/acadiet-frontend.log` and stop.

6. Report success with a table:

   | Service  | URL                   | Status |
   |----------|-----------------------|--------|
   | Frontend | http://localhost:3000 | ✅ Running |
   | Backend  | http://localhost:3001 | ✅ Running |

   Remind the user they can run `/stop-server` to shut everything down.
