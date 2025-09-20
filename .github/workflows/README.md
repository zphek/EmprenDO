# GitHub Actions Workflows

Este directorio contiene los workflows de GitHub Actions para automatizar procesos de desarrollo y despliegue.

## Workflows Disponibles

### 1. Auto Pull (`auto-pull.yml`)
**Propósito**: Mantener el repositorio actualizado automáticamente cuando hay cambios en la rama `main`.

**Triggers**:
- Push a la rama `main`
- Ejecución manual (`workflow_dispatch`)

**Funciones**:
- Hace checkout del repositorio
- Configura Git con credenciales del bot
- Ejecuta `git pull` para obtener los últimos cambios
- Muestra el estado actualizado

### 2. Deploy on Main (`deploy-on-main.yml`)
**Propósito**: Automatizar el proceso de despliegue cuando hay cambios en `main`.

**Triggers**:
- Push a la rama `main`
- Ejecución manual

**Funciones**:
- Instala dependencias
- Ejecuta linting y type checking
- Construye la aplicación
- Mantiene el repositorio actualizado
- Notifica sobre el estado del despliegue

### 3. Pull Request Checks (`pr-checks.yml`)
**Propósito**: Ejecutar verificaciones de calidad en pull requests.

**Triggers**:
- Pull requests hacia `main` o `develop`
- Ejecución manual

**Funciones**:
- Verificaciones de linting
- Type checking
- Build del proyecto
- Ejecución de tests
- Comentarios automáticos en PR

## Configuración

### Variables de Entorno
- `NODE_VERSION`: Versión de Node.js (por defecto: '18')

### Secrets Requeridos
- `GITHUB_TOKEN`: Token automático de GitHub (incluido por defecto)

### Personalización
Para personalizar los workflows:

1. **Comandos de Deploy**: Edita la sección comentada en `deploy-on-main.yml`
2. **Notificaciones**: Agrega integración con Slack, Discord, etc.
3. **Tests**: Asegúrate de tener scripts de test en `package.json`

## Scripts de Package.json Recomendados

```json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "build": "next build",
    "test": "jest",
    "test:ci": "jest --ci --coverage"
  }
}
```

## Monitoreo

Puedes monitorear los workflows en:
- GitHub → Tu repositorio → Actions

## Troubleshooting

### Errores Comunes
1. **Build failures**: Verificar que todas las dependencias estén en `package.json`
2. **Permission errors**: Verificar que `GITHUB_TOKEN` tenga los permisos necesarios
3. **Merge conflicts**: Los workflows intentarán resolver automáticamente

### Logs
Todos los workflows generan logs detallados disponibles en la pestaña Actions de GitHub.