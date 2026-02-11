
# Bella Nails - Gestión de Turnos 💅

Esta es una solución integral para profesionales independientes que necesitan gestionar sus turnos de forma sencilla y amorosa.

## Cómo Probar Localmente

1. **Instalación**: `npm install`
2. **Ejecución**: `npm start`
3. **Uso Cliente**: Ingresá tus datos en la pantalla principal para solicitar un turno.
4. **Uso Profesional**:
   - Accedé a `http://localhost:3000/#admin` (o hacé click en el pequeño enlace gris al final de la página).
   - Contraseña: `admin123`
   - Aquí podrás confirmar turnos y verás la simulación del mensaje de WhatsApp en la **consola del navegador** (F12).

## Características Técnicas

- **Frontend**: React + Tailwind CSS (Diseño Responsivo y Femenino).
- **Backend Simulado**: Servicio que utiliza `localStorage` para persistir datos localmente sin necesidad de configurar una base de datos externa inicialmente.
- **WhatsApp**: Lógica preparada para integración. Actualmente simula el envío logueando el mensaje cálido en consola.
- **Arquitectura**: Separación clara entre Vistas (Customer/Admin), Componentes UI y Servicios.

## Despliegue (Deploy)

### GitHub
1. Creá un repositorio en GitHub.
2. `git remote add origin YOUR_URL`
3. `git push -u origin main`

### Vercel
1. Conectá tu cuenta de GitHub a Vercel.
2. Seleccioná el repositorio.
3. El proyecto se detectará automáticamente como React.
4. Click en **Deploy**. ¡Listo!

---

*Diseñado con ❤️ para profesionales que aman lo que hacen.*
