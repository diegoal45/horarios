# Despliegue rapido en Azure for Students

## Arquitectura recomendada
- Backend Laravel (API): Azure App Service (Linux, PHP 8.3)
- Base de datos: Azure Database for MySQL Flexible Server
- Frontend Angular: Azure Static Web Apps

## 1) Backend Laravel en App Service

### Crear recursos (Azure CLI)
Ejecuta estos comandos en PowerShell (ajusta nombres unicos):

az login
az account show

$RG = "rg-horarios"
$LOC = "eastus"
$PLAN = "plan-horarios"
$APIAPP = "horarios-api-UNICO"

az group create --name $RG --location $LOC
az appservice plan create --name $PLAN --resource-group $RG --sku B1 --is-linux
az webapp create --resource-group $RG --plan $PLAN --name $APIAPP --runtime "PHP|8.3"

### Configuracion de App Settings
Configura variables en el Web App (Configuration > Application settings):

- APP_ENV=production
- APP_DEBUG=false
- APP_URL=https://<tu-api>.azurewebsites.net
- LOG_CHANNEL=stack
- LOG_LEVEL=warning
- DB_CONNECTION=mysql
- DB_HOST=<host-mysql>
- DB_PORT=3306
- DB_DATABASE=horarios
- DB_USERNAME=<usuario>
- DB_PASSWORD=<password>
- CORS_ALLOWED_ORIGINS=https://<tu-frontend>.azurestaticapps.net

Genera APP_KEY localmente y copiala en Azure:

php artisan key:generate --show

Luego agrega:
- APP_KEY=base64:...

### Deploy del codigo backend
Opcion A (recomendada): GitHub Actions desde Deployment Center del Web App.
Opcion B: Zip Deploy.

Comandos Zip Deploy (si usas Azure CLI):

Compress-Archive -Path * -DestinationPath deploy.zip -Force
az webapp deploy --resource-group $RG --name $APIAPP --src-path deploy.zip --type zip

### Post-deploy
En consola Kudu/SSH del Web App ejecuta:

php artisan migrate --force
php artisan config:clear
php artisan config:cache
php artisan route:cache

## 2) Frontend Angular en Static Web Apps

### Build local
cd frontend
npm install
npm run build

### Crear Static Web App
Desde Azure Portal:
- Crea Static Web App
- Conecta tu repo GitHub
- Build preset: Angular
- App location: frontend
- Output location: dist/frontend/browser

Al terminar, Azure crea pipeline y publica automaticamente.

## 3) Ajustes finales obligatorios

1. Edita frontend/src/environments/environment.prod.ts y cambia apiUrl por tu URL real:
   https://<tu-api>.azurewebsites.net/api

2. Rebuild y redeploy del frontend.

3. En backend valida CORS_ALLOWED_ORIGINS con tu dominio real de Static Web Apps.

4. Prueba login y endpoint protegido:
- POST /api/auth/login
- GET /api/user/profile (con Bearer token)

## 4) Checklist de salida a produccion
- APP_DEBUG=false
- Rutas de debug no expuestas
- CORS limitado al dominio del frontend
- Migraciones aplicadas
- APP_KEY en Azure
- URL de API correcta en Angular
