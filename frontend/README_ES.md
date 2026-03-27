# Frontend Angular - Gestión de Horarios Laborales

Proyecto Angular moderno con arquitectura profesional, login/register y diseño basado en el mockup proporcionado.

## 🚀 Características

✅ **Componentes desarrollados:**
- Login component (formulario reactivo)
- Register component (con validación de contraseñas)
- Dashboard component (protegido con auth guard)
- Header/Footer compartidos

✅ **Servicios profesionales:**
- `AuthService` - Gestionar login, logout, token, usuario actual
- `ApiService` - Consumir endpoints de Laravel
- `AuthInterceptor` - Inyecta JWT automáticamente en peticiones
- `authGuard` - Protege rutas privadas

✅ **Características:**
- Validaciones reactivas
- Manejo de errores
- Estilos Tailwind CSS con tema personalizado
- Material Symbols Icons
- Tipado fuerte (TypeScript)
- Diseño responsivo

## 📁 Estructura del proyecto

```
src/app/
├── core/                    # Lógica principal
│   ├── models/             # Interfaces TypeScript
│   ├── services/           # AuthService, ApiService
│   ├── interceptors/       # AuthInterceptor
│   └── guards/            # authGuard
├── features/
│   ├── auth/              # Login, Register
│   └── dashboard/         # Dashboard
├── shared/
│   ├── components/        # Header, Footer
│   └── layouts/           # Layouts (preparado)
└── app.routes.ts          # Rutas de la app
```

## 🔧 Requisitos

Node.js v18+ (preferiblemente versión LTS)
npm 9+

## 📦 Instalación

```bash
cd frontend
npm install
```

## 🏃 Desarrollo

### Terminal 1: Frontend Angular
```bash
cd frontend
npm start
# Abre http://localhost:4200/
```

### Terminal 2: Backend Laravel
```bash
# En la raíz del proyecto
php artisan serve
# http://localhost:8000
```

## 🔐 Flujo de autenticación

1. **Usuario hace login** en `http://localhost:4200/login`
   - Ingresa email/contraseña
   - AuthService envía petición a `http://localhost:8000/api/login`
   - Backend retorna token + datos de usuario

2. **Token guardado** en localStorage
   - AuthInterceptor lo inyecta automáticamente en todas las peticiones

3. **Acceso a rutas protegidas**
   - Dashboard está protegido por `authGuard`
   - Si no está logueado → redirige a login
   - Si token expira (401) → desloguea automáticamente

## 📝 Endpoints que consume

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Autenticación |
| GET | `/api/user` | Datos del usuario actual |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/schedules` | Listar horarios |
| POST | `/api/schedules` | Crear horario |
| GET | `/api/shifts` | Listar turnos |
| POST | `/api/shifts` | Crear turno |

## 🎨 Personalizacion de estilos

Los estilos usan Tailwind CSS con colores personalizados:

```typescript
// src/index.html - Tailwind config
primary: "#16A085"       // Color principal
error: "#ba1a1a"         // Color de error
tertiary: "#974232"      // Color terciario
```

Modificar `index.html` para cambiar colores globales.

## 🔗 Integración con GitHub/Azure

Cuando esté listo para producción:

1. **Build production**
   ```bash
   npm run build
   ```
   Genera carpeta `dist/` lista para desplegar

2. **Desplegar en Azure Static Web Apps**
   - Subir `dist/` a Azure Static Web Apps
   - Configurar CORS en Laravel backend
   - Actualizar `environment.prod.ts` con URL de producción

## 🧪 Proximas funcionalidades

- [ ] Componentes de Dashboard (horarios, turnos)
- [ ] Gestión de horarios
- [ ] Reportes
- [ ] Perfil de usuario
- [ ] Tests unitarios
- [ ] PWA support

## 📚 Scripts disponibles

```bash
npm start          # Desarrollo (http://localhost:4200)
npm run build      # Build producción
npm run test       # Tests unitarios
npm run lint       # Linter
```

## 🔑 Variables de entorno

**Desarrollo** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**Producción** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-azure.azurewebsites.net/api'
};
```

## 🐛 Troubleshooting

**Error: "Cannot find module..."**
```bash
rm -rf node_modules
npm install
```

**Puerto 4200 en uso**
```bash
npm start -- --port 4300
```

**CORS errors**
En Laravel `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:4200', 'https://tu-frontend.azurewebsites.net'],
```

## 📖 Documentación adicional

- [Angular Docs](https://angular.io)
- [Tailwind CSS](https://tailwindcss.com)
- [RxJS Guide](https://rxjs.dev)
- [Material Symbols](https://fonts.google.com/icons)

## 👨‍💻 Autor

Proyecto desarrollado con Angular 18+, Tailwind CSS y TypeScript.

---

**¿Preguntas?** Revisa los archivos de componentes para ver ejemplos de uso.
