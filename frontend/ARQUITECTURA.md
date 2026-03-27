# Frontend Angular - Arquitectura Profesional

## 📁 Estructura

```
src/app/core/
├── models/              # Interfaces TypeScript
│   ├── user.model.ts
│   ├── schedule.model.ts
│   ├── shift.model.ts
│   └── role.model.ts
├── services/            # Lógica de negocio
│   ├── api.service.ts      (todas las peticiones HTTP)
│   └── auth.service.ts     (login, logout, token)
├── interceptors/        # Middleware HTTP
│   └── auth.interceptor.ts (añade token, maneja 401)
└── guards/              # Protección de rutas
    └── auth.guard.ts       (solo usuarios logueados)
```

## 🔐 Autenticación

### Login
```typescript
// En un componente
constructor(private auth: AuthService) {}

onLogin() {
  this.auth.login({ email: 'user@example.com', password: '123' })
    .subscribe(response => {
      // Token guardado automáticamente
      console.log('Logueado:', response.user);
    });
}
```

### Obtener usuario actual
```typescript
this.auth.user$.subscribe(user => {
  console.log('Usuario:', user);
});
```

### Proteger rutas
```typescript
// En app.routes.ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]  // Solo si está logueado
  }
];
```

## 📮 Uso de API

### Obtener schedules
```typescript
constructor(private api: ApiService) {}

loadSchedules() {
  this.api.getSchedules().subscribe(
    schedules => console.log('Schedules:', schedules)
  );
}
```

### Crear schedule
```typescript
createSchedule() {
  this.api.createSchedule({
    user_id: 1,
    date: '2026-03-27'
  }).subscribe(newSchedule => {
    console.log('Creado:', newSchedule);
  });
}
```

## ⚙️ Configuración por ambiente

**Desarrollo** (`environment.ts`):
```typescript
apiUrl: 'http://localhost:8000/api'
```

**Producción** (`environment.prod.ts`):
```typescript
apiUrl: 'https://tu-api-azure.azurewebsites.net/api'
```

## 🚀 Desarrollo

```bash
cd frontend
npm start  # http://localhost:4200
```

## 📦 Build para Azure

```bash
npm run build  # Genera dist/
# Deploy dist/ a Azure Static Web Apps
```

## 🔑 Flujo completo

1. Usuario hace login
2. AuthService guarda token en localStorage
3. **AuthInterceptor** automáticamente añade `Authorization: Bearer {token}` a cada request
4. Si token expira (401), interceptor desloguea y redirige a login
5. **authGuard** protege rutas privadas

Todo sin escribir más código en cada componente ✨
