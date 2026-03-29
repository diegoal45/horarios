# Quick Testing Guide - Schedule Generation & Editing

## ✅ What's Fixed
1. **Team 1 now has 6 members** - Ready for schedule generation
2. **Console logging added** - Shows exactly what's happening
3. **Backend verified** - All endpoints working correctly

## 🚀 How to Test

### Step 1: Open the Application
- Frontend: http://localhost:4200/
- Backend: Running on port 8000

### Step 2: Login as "Jefe User"
1. Click "Iniciar Sesión"
2. Email: `jefe@example.com`
3. Password: `password` (or check your seeder)
4. Note: You should now see "Jefe User" in the top-right profile

### Step 3: Generate Schedules
1. Click **Generar Horarios** in the sidebar
2. You should see **Team 1: "Equipo Turno Mañana"** with ✅ "6/6 miembros"
3. Click the blue **"Generar Horarios"** button
4. Wait for the green toast message: "Horarios generados exitosamente"

### Step 4: View & Edit Schedules Table
After generation, you should see a table with:
- **Columns**: Día | Trabajador | Hora Inicio | Hora Fin | Horas |  Tipo
- **30 rows** (5 days × 6 workers)
- **Editable time fields** (start_time and end_time)

### Step 5: Test Editing
1. Click on a start_time or end_time cell
2. Change the time (e.g., "07:00" → "08:00")
3. Watch the "Horas" column update automatically
4. See if validation errors appear (if exceeds limits)

### Step 6: Save Changes
1. After editing, the **"Guardar Cambios"** button should be enabled
2. Click it to save
3. Watch for green toast: "X cambios guardados correctamente"

### Step 7: Publish Schedules
1. After saving (or if no changes), click **"Publicar Horarios"**
2. Watch for green toast: "Horarios publicados correctamente"
3. Should return to teams list

## 🔍 Debugging in Browser Console

### If Nothing Shows After Generate
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for logs starting with:
   - `[ScheduleGenerator]` - Generation logs
   - `[ScheduleViewer]` - Viewer component logs

### If You See Errors
- **401 Unauthorized**: Token not sent or expired - try logout/login
- **404 Not Found**: API endpoint issue - check Network tab
- **403 Forbidden**: You're not the team leader - make sure logged in as Jefe User
- **422 Unprocessable**: Team doesn't have 6 members - verify team membership

### Network Tab Check
1. Go to **Network** tab (not Console)
2. Generate schedules
3. Look for requests:
   ```
   POST /api/schedules/generate
   Response: {message, team_id, week_start, schedules_count}
   
   GET /api/teams/1/schedules?week_start=2026-03-23
   Response: [Array of Schedule objects with shifts]
   ```

## 📊 Expected Data Structure

### After Generation
```
POST /api/schedules/generate
Response: {
  "message": "Horarios generados automáticamente...",
  "team_id": 1,
  "week_start": "2026-03-23",
  "schedules_count": 6
}
```

### When Loading Viewer
```
GET /api/teams/1/schedules?week_start=2026-03-23
Response: [
  {
    "id": 1,
    "user_id": 4,
    "team_id": 1,
    "week_start": "2026-03-23",
    "user": { "id": 4, "name": "Carlos Ruiz", "email": "..." },
    "shifts": [
      {
        "id": 1,
        "schedule_id": 1,
        "day_of_week": "lunes",
        "start_time": "07:00:00",
        "end_time": "14:00:00",
        "is_opening": true,
        "is_closing": false,
        "hours": 7
      },
      ...
    ]
  },
  ...
]
```

## 🚨 If It Still Doesn't Work

Check these in order:
1. ✅ F12 Console shows `[ScheduleViewer] API response received: [...]`
   - If yes: Component received data, issue is display
   - If no: API call failed or returned error
   
2. ✅ Network tab shows GET request to `/api/teams/1/schedules`
   - Status should be 200
   - Response body should have array of schedules
   
3. ✅ Backend debug endpoint shows teams
   ```
   http://localhost:8000/api/debug/check-data
   ```
   - Should show Team 1 with 6 members_count
   - Should show team_id=1 schedules after generation

## 🎓 Test Credentials

**All test users** created by seeder:
- Admin: admin@example.com / password (role: administrador)
- Jefe 1: jefe@example.com / password (role: jefe) ← USE THIS
- Jefe 2: jefe2@example.com / password (role: jefe)
- Workers: trabajador@example.com / password (role: trabajador)

