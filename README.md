 

# 🟢 Whatsapp Monitor API 🟢

Backend desarrollado en NestJS que sirve una aplicación Angular embebida y gestiona conversaciones de WhatsApp Business mediante Evolution API.


## Stack Tecnológico
- Backend: NestJS
- Frontend: Angular (archivos estáticos servidos por NestJS)
- Base de datos: PostgreSQL
- Almacenamiento de archivos: MinIO
- Motor WhatsApp: Evolution API (Baileys)
- Autenticación:
- HTTP Basic Auth para acceso a la UI
- Keycloak para acceso a la API
- Contenedores: Docker y Docker Compose


## Flujo de Desarrollo (Local)
1. Instalar dependencias
```
    npm install
```
2. Compilar el proyecto
```
    npm run build
```
3. Ejecutar el backend en modo producción local
```
    npm run start:dev
```
4. Acceder a la aplicación
    http://localhost:3000 <- Si ese es tu puerto


## Flujo Docker (Producción / Local)
Cada vez que se realicen cambios en el backend:

1. Compilar NestJS
```
npm run build
```
2. Construir la imagen Docker
```
docker build -t whatsapp-monitor-api .
```
3. Detener contenedores existentes
```
docker compose down
```
Si se realizaron cambios en almacenamiento o base de datos (OPCIONAL)
```
docker compose down -v
```
4. Levantar el stack completo
```
docker compose up -d
```

5. Ver logs contenedor
```
docker logs -f whatsapp-monitor-api
```


## Publicar la imagen en Docker Hub
Este proyecto utiliza una imagen Docker versionada para su despliegue.

1. Iniciar sesión en Docker Hub
```
docker login
```

2. Construir la imagen con versión
```
docker build -t tuusuario/whatsapp-monitor-api:1.0.0 .
```

3. Ver imágenes locales
```
docker images
```

4. Subir imagen 
```
docker push tuusuario/whatsapp-monitor-api:1.0.0
```
