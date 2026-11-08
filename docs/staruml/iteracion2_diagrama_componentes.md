# Entregable: Diagrama de Componentes del Sistema (Iteraciones 1 y 2)
## Parqueadero "Autos Colombia" — Arquitectura de Software en Capas

---

### 1. Visión General de la Arquitectura

El sistema de software para el parqueadero **"Autos Colombia"** adopta una **Arquitectura en Capas (Layered / N-Tier Architecture)** desacoplada, orientada a servicios API REST y basada en el stack moderno **Node.js + Express.js + SQLite3 + Vanilla JavaScript (Tailwind CSS)**.

La arquitectura integra todas las capacidades construidas durante la **Iteración 1** (Operaciones de Caseta: Ingreso, Salida, Liquidación, Novedades) y la **Iteración 2** (Administración del Sistema: Autenticación, Gestión de Usuarios RBAC, Gestión y Mantenimiento de Celdas, Reporte de Capacidad).

El archivo fuente PlantUML se ubica en:  
`docs/staruml/diagrama_componentes.puml`.

---

### 2. Descripción de Capas y Componentes

```
+---------------------------------------------------------------------------------+
|                        CAPA DE PRESENTACIÓN (CLIENTE)                          |
|  - index.html (SPA Multipestaña)        - figma-mockups.html (Visor Figma)     |
|  - app.js (Controlador Cliente)         - Tailwind CSS & Font Awesome CDNs     |
+---------------------------------------------------------------------------------+
                                      | HTTP / JSON (Fetch API)
                                      v
+---------------------------------------------------------------------------------+
|                  CAPA DE APLICACIÓN Y API REST (NODE.JS / EXPRESS)              |
|  - server.js (Servidor Express & Archivos Estáticos)                           |
|  - apiRoutes.js (Enrutador Centralizado)                                       |
|  +-- Iteración 1: accessController, cellController, noveltyController, etc.    |
|  +-- Iteración 2: userController, cellAdminController                          |
+---------------------------------------------------------------------------------+
                                      | Llamadas Asíncronas (Promises)
                                      v
+---------------------------------------------------------------------------------+
|                     CAPA DE ACCESO A DATOS (DATA ACCESS LAYER)                 |
|  - userModel.js, cellModel.js, accessModel.js, vehicleModel.js, billingModel   |
|  - database.js (Conexión, PRAGMA foreign_keys, Pool Promisificado)            |
+---------------------------------------------------------------------------------+
                                      | Consultas SQL Parametrizadas
                                      v
+---------------------------------------------------------------------------------+
|                   CAPA DE PERSISTENCIA (SQLITE3 / DATABASE)                     |
|  Tablas: usuarios, celdas, clientes, vehiculos, tarifas, mensualidades,        |
|          registros_acceso, novedades, pagos (Normalización 3FN)                |
+---------------------------------------------------------------------------------+
```

---

### 3. Matriz de Responsabilidades por Componente

| Capa | Componente | Responsabilidad Principal | Iteración |
| :--- | :--- | :--- | :--- |
| **Presentación** | `index.html` | Estructura SPA con pestañas operativas y administrativas. | 1 y 2 |
| **Presentación** | `figma-mockups.html` | Lienzo interactivo de diseño UI/UX con selector de frames y exportador PNG. | 1 y 2 |
| **Presentación** | `app.js` | Manejo de estado del cliente, llamadas `fetch()`, timers, rendering de tablas y modales. | 1 y 2 |
| **Aplicación** | `server.js` | Configuración del servidor HTTP, middlewares CORS y JSON, fallback SPA. | 1 y 2 |
| **Aplicación** | `apiRoutes.js` | Mapeo de URIs y métodos HTTP (GET, POST, PUT, PATCH, DELETE) a controladores. | 1 y 2 |
| **Aplicación** | `accessController.js` | Lógica de negocio para verificación de placas, registro de ingreso y liquidación de salida. | 1 |
| **Aplicación** | `userController.js` | Autenticación (login), CRUD de operadores/administradores, cambio de estado y contraseñas. | **2** |
| **Aplicación** | `cellAdminController.js` | Creación de celdas, bloqueo por mantenimiento, eliminación controlada y reportes. | **2** |
| **Datos** | `userModel.js` | Abstracción de consultas SQL sobre la tabla `usuarios` (ocultamiento de hash, filtros). | **2** |
| **Datos** | `cellModel.js` | Consultas de inventario, disponibilidad por categoría y actualización de estados. | 1 y 2 |
| **Persistencia** | `autos_colombia.db` | Motor SQLite 3 embebido con claves foráneas activas y transacciones ACID. | 1 y 2 |

---

### 4. Justificación de Decisiones de Arquitectura

1. **Desacoplamiento Front/Back:** El cliente consume la API exclusivamente mediante JSON, permitiendo reemplazar el frontend en el futuro (ej. por una app móvil React Native o Flutter) sin tocar la lógica de negocio ni la base de datos.
2. **Seguridad y Trazabilidad:** Al asociar cada acción operativa a un `id_usuario` autenticado, el sistema garantiza auditoría inmutable en `registros_acceso`, `novedades` y `pagos`.
3. **Mantenibilidad:** La división en modelos y controladores especializados previene archivos monolíticos y facilita la cobertura en pruebas unitarias e integración.
