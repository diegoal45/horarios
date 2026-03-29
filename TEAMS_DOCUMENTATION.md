# Sistema de Equipos - Documentación de Backend

## Descripción General

El sistema de **Equipos** permite a los jefes de grupo crear y gestionar equipos de hasta **6 miembros máximo**. Cada equipo tiene:

- Un líder (jefe)
- Múltiples miembros trabajadores (1-6)
- Horarios asociados para planificar turnos
- Estados de activo/inactivo

## Modelos de Base de Datos

### Tabla `teams`

```sql
id                INT (PK)
name              VARCHAR(255) - Nombre único del equipo
description       TEXT - Descripción del equipo
leader_id         INT (FK) - Referencia al User que lidera
max_members       INT - Máximo de miembros (default 6)
is_active         BOOLEAN - Estado del equipo (default true)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### Tabla `team_user` (Pivot/Junction)

```sql
id                INT (PK)
team_id           INT (FK)
user_id           INT (FK)
created_at        TIMESTAMP
updated_at        TIMESTAMP
UNIQUE(team_id, user_id)
```

### Relación en `schedules`

Agregamos `team_id` (FK) a la tabla schedules para asociar horarios a equipos:

```sql
team_id           INT (FK) - Nullable, referencia al Team
```

## Modelos Laravel

### Team Model

```php
class Team extends Model
{
    // Relaciones
    public function leader(): BelongsTo
    public function members(): BelongsToMany
    public function schedules(): HasMany
    
    // Métodos útiles
    public function isFull(): bool
    public function getAvailableSlots(): int
    public function addMember(User $user): bool
    public function removeMember(User $user): bool
}
```

### User Model (Actualizado)

```php
public function teams(): BelongsToMany
{
    return $this->belongsToMany(Team::class, 'team_user')
        ->withTimestamps();
}
```

### Schedule Model (Actualizado)

```php
protected $fillable = ['user_id', 'team_id', 'week_start', 'total_hours'];

public function team(): BelongsTo
{
    return $this->belongsTo(Team::class);
}
```

## Endpoints API

### Listar Equipos
```http
GET /api/teams
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Equipo Desarrollo",
      "description": "Team de backend",
      "leader": { "id": 2, "name": "Carlos Ruiz" },
      "members": [
        { "id": 5, "name": "Elena Vargas" },
        { "id": 6, "name": "Miguel Torres" }
      ],
      "is_active": true,
      "created_at": "2026-03-27T10:00:00Z",
      "updated_at": "2026-03-27T10:00:00Z"
    }
  ]
}
```

### Ver Equipo
```http
GET /api/teams/{teamId}
Authorization: Bearer {token}
```

### Crear Equipo (Solo Jefes y Admins)
```http
POST /api/teams
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Equipo Operaciones",
  "description": "Turno nocturno",
  "leader_id": 2,
  "max_members": 6
}
```

**Validaciones:**
- `name`: Required, unique, 255 caracteres max
- `description`: Optional, 1000 caracteres max
- `leader_id`: Required, debe existir en users
- `max_members`: 1-6, default 6

### Actualizar Equipo (Solo Jefes y Admins)
```http
PUT /api/teams/{teamId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Nuevo Nombre",
  "description": "Nueva descripción",
  "leader_id": 3,
  "is_active": false
}
```

### Eliminar Equipo (Solo Jefes y Admins)
```http
DELETE /api/teams/{teamId}
Authorization: Bearer {token}
```

### Obtener Miembros del Equipo
```http
GET /api/teams/{teamId}/members
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "team_id": 1,
  "team_name": "Equipo Desarrollo",
  "total_members": 3,
  "available_slots": 3,
  "max_members": 6,
  "members": [
    { "id": 5, "name": "Elena Vargas", "email": "elena@example.com", "role": "trabajador" },
    { "id": 6, "name": "Miguel Torres", "email": "miguel@example.com", "role": "trabajador" },
    { "id": 7, "name": "Ana López", "email": "ana@example.com", "role": "trabajador" }
  ]
}
```

### Agregar Miembro al Equipo (Solo Jefes y Admins)
```http
POST /api/teams/{teamId}/members
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": 8
}
```

**Validaciones:**
- Si el equipo está lleno (6 miembros): devuelve error 422
- Si el usuario ya es miembro: devuelve error 422
- El usuario debe existir

**Respuesta exitosa:**
```json
{
  "message": "Miembro agregado exitosamente",
  "team": { ... },
  "available_slots": 2
}
```

### Remover Miembro del Equipo (Solo Jefes y Admins)
```http
DELETE /api/teams/{teamId}/members
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": 8
}
```

### Equipos del Usuario Actual
```http
GET /api/my-teams
Authorization: Bearer {token}
```

Retorna todos los equipos en los que el usuario es miembro.

### Equipos Liderados por el Usuario (Solo Jefes)
```http
GET /api/led-teams
Authorization: Bearer {token}
```

Retorna todos los equipos que el usuario actual lidera.

## Control de Acceso

### Endpoints Protegidos por Rol

| Endpoint | GET | POST | PUT | DELETE | Roles |
|----------|-----|------|-----|--------|-------|
| /teams | ✅ | ✅ | ✅ | ✅ | jefe, administrador |
| /teams/{id} | ✅ | - | ✅ | ✅ | jefe, administrador |
| /teams/{id}/members | ✅ | ✅ | - | ✅ | jefe, administrador |
| /my-teams | ✅ | - | - | - | todos |
| /led-teams | ✅ | - | - | - | jefe, administrador |

## Validaciones de Negocio

1. **Máximo 6 miembros por equipo**
   - Si intenta agregar un 7º miembro, devuelve error 422
   - El método `isFull()` valida esto

2. **Miembro único por equipo**
   - Un usuario no puede ser miembro dos veces del mismo equipo
   - UNIQUE constraint en tabla `team_user`

3. **Líder válido**
   - El `leader_id` debe ser un usuario existente con rol 'jefe' o 'administrador'

4. **Nombre único**
   - Cada equipo tiene un nombre único en la base

5. **Cascada de eliminación**
   - Al eliminar un equipo, se eliminan todos los registros en `team_user`
   - Los schedules con `team_id` se ponen a null (cascade on delete)

## Casos de Uso

### Caso 1: Crear un Equipo y Agregar Miembros

```bash
# 1. Jefe crea equipo
POST /api/teams
{
  "name": "Turno Mañana",
  "description": "Turno matutino",
  "leader_id": 2,
  "max_members": 6
}

# 2. Jefe agrega miembros
POST /api/teams/1/members { "user_id": 5 }
POST /api/teams/1/members { "user_id": 6 }
POST /api/teams/1/members { "user_id": 7 }
POST /api/teams/1/members { "user_id": 8 }
POST /api/teams/1/members { "user_id": 9 }
POST /api/teams/1/members { "user_id": 10 }

# 3. Obtener miembros
GET /api/teams/1/members
# Retorna: 6 miembros, 0 slots disponibles
```

### Caso 2: Generar Horarios por Equipo

```bash
# 1. Obtener miembros del equipo
GET /api/teams/1/members

# 2. Crear schedules asociados al equipo
POST /api/schedules
{
  "user_id": 5,
  "team_id": 1,
  "week_start": "2026-03-29",
  "total_hours": 40
}

# 3. Ver schedules del equipo (en futuro)
GET /api/teams/1/schedules
```

## Datos de Prueba

El seeder `TeamsTableSeeder` crea:

1. **2 equipos** con líderes jefes
2. **5 trabajadores asignados** a cada equipo

Para ejecutar:
```bash
php artisan migrate
php artisan db:seed
```

## Migraciones

Ejecutar en orden:
1. `2026_03_27_000001_create_teams_table.php` - Crea teams y team_user
2. `2026_03_27_000002_add_team_id_to_schedules.php` - Agrega columna team_id a schedules

## Mejoras Futuras

1. **Niveles de acceso** - Distinguir entre líderes de equipo y miembros
2. **Historial de cambios** - Auditoría de quién agregó/removió miembros
3. **Rotaciones de turnos** - Auto-generar rotaciones por equipo
4. **Reportes por equipo** - Estadísticas específicas de equipo
5. **Invitaciones** - Sistema de invitación antes de agregar miembro
