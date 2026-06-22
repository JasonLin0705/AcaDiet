---
description: Stop the AcaDiet backend and frontend dev servers
---

Stop all AcaDiet local development servers. Run these commands:

```
pkill -f "node server.js" 2>/dev/null; pkill -f "react-scripts start" 2>/dev/null; echo "Servers stopped."
```

Then confirm ports 3000 and 3001 are free:
```
lsof -ti:3001,3000
```

If any PIDs are still listed, kill them:
```
lsof -ti:3001,3000 | xargs kill -9 2>/dev/null
```

Report: "Backend and frontend servers have been stopped."
