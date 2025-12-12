# North Code - Sistema de Gestion de Soporte TI

Sistema integral para la gestión, seguimiento y resolución de tickets de soporte técnico, desplegado en infraestructura en la nube (Oracle Cloud Infrastructure).

## Estado del Proyecto
* **Estatus:** Terminado
* **Despliegue:** Oracle Cloud
* **Licencia:** MIT

## Demo en Vivo
**URL:** https://northcode-soporte.duckdns.org

---

## Caracteristicas Principales

### Seguridad y Accesos
* **Autenticación JWT:** Manejo de sesiones seguras mediante tokens y cookies httpOnly.
* **Roles de Usuario:**
    * **Administrador:** Control total del sistema, gestión de personal y visualización de métricas globales y rankings.
    * **Soporte:** Acceso a bandeja de entrada de tickets, asignación de casos y métricas de rendimiento personal.
    * **Cliente:** Creación de reportes de incidencias, historial de tickets y línea de tiempo de seguimiento.

### Gestion de Tickets
* **Prioridad Inteligente:** Detección automática de palabras clave críticas en la descripción del problema.
* **Evidencias:** Capacidad para adjuntar imágenes y archivos PDF como evidencia del error.
* **Indicadores SLA:** Visualización de tiempos de espera mediante códigos de color.
* **Comunicación Interna:** Sistema de comentarios y notas internas exclusivas para el personal de soporte.

### Dashboards y Metricas
* **Ranking de Calidad:** Evaluación del desempeño de los agentes basada en tickets resueltos y calificaciones.
* **Reportes:** Exportación de datos a formato Excel para análisis externo.
* **Feedback:** Sistema de calificación de servicio por parte del cliente al cerrar un ticket.

---

## Tecnologias Utilizadas (MERN Stack)

* **Frontend:** React, Vite, Bootstrap 5, React Router DOM.
* **Backend:** Node.js, Express.js.
* **Base de Datos:** MongoDB (Mongoose ODM).
* **Seguridad:** Helmet, Rate Limiting, Bcrypt, Mongo Sanitize.
* **Infraestructura:** Nginx (Reverse Proxy), PM2, Oracle Linux, DuckDNS (SSL/HTTPS).

---

## Usuarios de Prueba

Para efectos de evaluación y pruebas, se han configurado las siguientes credenciales de acceso:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | ceo@gmail.com | 1122messi |
| **Soporte** | soporte_1@gmail.com | 123456 |
| **Cliente** | cliente_1@northcode.com | 123456 |

---

## Instalacion Local

Instrucciones para desplegar el proyecto en un entorno de desarrollo local:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/VictorMelendez4/sistema-tickets.git](https://github.com/VictorMelendez4/sistema-tickets.git)
    cd sistema-tickets
    ```

2.  **Configurar Backend**
    Navegar a la carpeta del servidor e instalar dependencias:
    ```bash
    cd backend
    npm install
    ```
    Crear un archivo `.env` en la carpeta `backend` con las siguientes variables:
    ```env
    PORT=4000
    MONGODB_URI=mongodb://localhost:27017/sistema-tickets
    JWT_SECRET=tu_clave_secreta
    TOKEN_SECRET=otra_clave_secreta
    FRONTEND_URL=http://localhost:5173
    ```
    Iniciar el servidor:
    ```bash
    npm run dev
    ```

3.  **Configurar Frontend**
    Navegar a la carpeta del cliente e instalar dependencias:
    ```bash
    cd ../frontend
    npm install
    ```
    Iniciar la aplicación:
    ```bash
    npm run dev
    ```

---

## Equipo de Desarrollo

* **Victor Alejandro Melendez Bassoco** - DevOps, Integración Fullstack, Seguridad.
* **Manuel Garcia Rivera** - Desarrollo Frontend e Interfaz de Usuario.
* **Victor Hugo Guevara Luna** - Desarrollo Backend y Base de Datos.