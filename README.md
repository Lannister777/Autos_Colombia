# Parqueadero "Autos Colombia" - Sistema de Gestión Integral de Operaciones
## Iteración 1: Gestión de Entrada y Salida de Vehículos
## Iteración 2: Gestión de Usuarios y Gestión de Celdas

Sistema de información integral desarrollado para el parqueadero **"Autos Colombia"**, enfocado en la gestión operativa de accesos vehiculares, asignación dinámica de celdas, detección de suscripciones de mensualidad, inspección física de novedades, administración de usuarios (RBAC), control del inventario y mantenimiento de celdas, y reportes analíticos de capacidad.

**Repositorio en GitHub:** [https://github.com/Lannister777/Autos_Colombia](https://github.com/Lannister777/Autos_Colombia)

---

## 🚀 Características del Sistema

### Iteración 1: Gestión de Entrada y Salida de Vehículos
* **Control de Entradas en Tiempo Real:** Captura de placas con autoformato, validación instantánea contra clientes abonados con mensualidad activa, asignación de celda disponible y generación de tiquete con número de folio único.
* **Inspección Física y Bitácora de Novedades:** Registro fotográfico/descriptivo de daños previos (rayones, golpes, abolladuras) al ingresar o salir para deslinde legal de responsabilidades.
* **Liquidación y Cobro Inteligente:** Cálculo exacto de minutos y horas de estancia, aplicación de tiempos de gracia reglamentarios, cobro por fracción según tipo de vehículo (Carro, Moto, Camioneta, Bici) o exoneración ($0 COP) si ampara mensualidad vigente.
* **Plano Interactivo de Celdas:** Monitoreo visual con estados en vivo (Libre en Verde, Ocupada en Rojo con placa y tiempo transcurrido).

### Iteración 2: Gestión de Usuarios y Gestión de Celdas
* **Autenticación y Control de Acceso Basado en Roles (RBAC):** Inicio de sesión con credenciales, separación de roles `ADMIN` (acceso total a configuración) y `OPERADOR` (caseta y control operativo), cambio de contraseñas y alternancia de estado activo/inactivo.
* **Administración Completa de Usuarios:** CRUD de operadores con validación de unicidad en `username`, auditoría de creación y bloqueo preventivo de cuentas.
* **Gestión Avanzada de Celdas y Mantenimiento:** Alta de nuevas celdas, edición de sectores y tipos permitidos, aislamiento seguro por reparaciones o pintura fresca (`MANTENIMIENTO`), rehabilitación inmediata a `LIBRE` y eliminación controlada (solo si no tiene historial de accesos).
* **Reporte Ejecutivo de Capacidad y Ocupación:** Indicadores en vivo de ocupación global (%), desglose estadístico por categoría de vehículo (Automóvil, Moto, Camioneta, Bici) y monitoreo de sectores.
* **Visor Interactivo de Mockups Figma (Hi-Fi):** Entorno visual idéntico a Figma con 8 Frames de diseño (Iteraciones 1 y 2) y herramienta integrada de exportación a PNG en alta resolución (2x).

---

## 📂 Estructura del Proyecto y Entregables

```text
Autos_Colombia/
├── docs/                                          # Documentación técnica formal
│   ├── Autos_Colombia_Documento_Metodologico.pdf  # Documento final compilado en PDF
│   ├── documento_metodologico.html                # Documento HTML imprimible
│   ├── 01_requerimientos_y_historias_usuario.md   # Requerimientos e Historias Iteración 1
│   ├── iteracion2/                                # Entregables Iteración 2
│   │   ├── 01_requerimientos_iteracion2.md        # RF y RNF de Usuarios y Celdas
│   │   ├── 02_historias_usuario_iteracion2.md     # Historias de Usuario INVEST (Gherkin)
│   │   └── 03_plan_pruebas_iteracion2.md          # Plan de Pruebas Resumido (19 Casos)
│   ├── database/                                  # Modelado de datos
│   │   ├── mer_mr_documentation.md                # Diagrama MER conceptual y MR 3FN
│   │   └── schema.sql                             # Script físico DDL e inserción de semillas
│   ├── staruml/                                   # Modelos StarUML y PlantUML
│   │   ├── autos_colombia_model.mdj               # Archivo nativo StarUML (Iteraciones 1 y 2)
│   │   ├── arquitectura.puml                      # Diagrama de arquitectura en capas
│   │   ├── casos_de_uso.puml                      # Casos de uso Iteración 1
│   │   ├── iteracion2_casos_de_uso.puml           # Casos de uso Iteración 2
│   │   ├── iteracion2_06_diagrama_casos_de_uso.md # Documentación casos de uso Iteración 2
│   │   ├── diagrama_clases.puml                   # Diagrama de clases del dominio
│   │   ├── diagramas_secuencia.puml               # Diagramas de secuencia Iteraciones 1 y 2
│   │   ├── iteracion2_diagramas_secuencia.md      # Documentación diagramas de secuencia
│   │   ├── diagrama_componentes.puml              # Diagrama de componentes Iteraciones 1 y 2
│   │   ├── iteracion2_diagrama_componentes.md     # Documentación diagrama de componentes
│   │   └── diagrama_paquetes.puml                 # Diagrama de paquetes modulares
│   └── figma/                                     # Especificaciones UI/UX
│       ├── 04_mockups_figma_guide.md              # Mockups Iteración 1 (Frames 1 al 5)
│       └── 05_mockups_iteracion2_guide.md         # Mockups Iteración 2 (Frames 6 al 8)
├── src/                                           # Código fuente de la aplicación
│   ├── config/database.js                         # Conexión SQLite y migración automática
│   ├── controllers/                               # Controladores REST API
│   │   ├── accessController.js                    # Ingreso, liquidación y salida
│   │   ├── cellController.js                      # Consulta operativa de celdas
│   │   ├── cellAdminController.js                 # CRUD celdas, mantenimiento y capacidad
│   │   ├── noveltyController.js                   # Bitácora de novedades
│   │   ├── rateController.js                      # Consulta de tarifas vigentes
│   │   └── userController.js                      # Autenticación, login y CRUD usuarios
│   ├── models/                                    # Capa de acceso a datos y lógica
│   │   ├── accessModel.js
│   │   ├── billingModel.js
│   │   ├── cellModel.js
│   │   ├── noveltyModel.js
│   │   ├── userModel.js
│   │   └── vehicleModel.js
│   ├── routes/apiRoutes.js                        # Enrutamiento de endpoints
│   ├── public/                                    # Frontend Web SPA (HTML5, Tailwind, JS)
│   │   ├── index.html                             # SPA con pestañas operativas y admin
│   │   ├── figma-mockups.html                     # Visor interactivo Figma (Frames 1-8)
│   │   └── js/app.js                              # Lógica cliente y llamadas REST
│   └── server.js                                  # Servidor principal Express
├── generate_staruml.js                            # Generador del modelo StarUML .mdj
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Instalación y Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ (probado exitosamente en Node.js v24)
* Navegador web moderno (Chrome, Edge, Firefox)

### Pasos de Ejecución
1. **Situarse en la carpeta del proyecto:**
   ```bash
   cd c:\Users\Usuario\Downloads\U\Autos_Colombia
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de la aplicación:**
   ```bash
   npm start
   ```

4. **Acceder a la aplicación:**
   * **Plataforma Operativa y Administrativa:** [http://localhost:3000](http://localhost:3000)
   * **Visor Interactivo de Mockups Figma:** [http://localhost:3000/figma-mockups.html](http://localhost:3000/figma-mockups.html)

---

## 📡 API REST - Endpoints Principales

### Iteración 1: Accesos, Celdas y Novedades
* `GET /api/accesos/verificar/:placa`: Verifica estado en parqueadero y mensualidad activa.
* `POST /api/accesos/entrada`: Registra entrada de vehículo, asigna celda y emite ticket.
* `GET /api/accesos/calcular-salida?busqueda=XXX`: Calcula liquidación cronológica y fracciones.
* `POST /api/accesos/salida`: Finaliza estancia, registra pago y libera celda.
* `GET /api/accesos/activos`: Lista vehículos actualmente dentro de las instalaciones.
* `GET /api/celdas`: Consulta el estado en tiempo real del inventario de celdas.
* `POST /api/novedades`: Registra novedad de ingreso o salida con severidad.

### Iteración 2: Usuarios y Administración de Celdas
* `POST /api/auth/login`: Autenticación con usuario y contraseña (retorna token).
* `GET /api/usuarios`: Listado de usuarios con filtros por rol y estado.
* `POST /api/usuarios`: Creación de nuevas cuentas de operador o administrador.
* `PUT /api/usuarios/:id`: Actualización de datos de perfil y rol.
* `PATCH /api/usuarios/:id/toggle-active`: Alternancia entre activo e inactivo.
* `PATCH /api/usuarios/:id/password`: Restablecimiento de contraseña.
* `POST /api/celdas`: Creación de nueva celda de parqueo con código único.
* `PUT /api/celdas/:id`: Edición de configuración de celda (solo si está libre).
* `PATCH /api/celdas/:id/maintenance`: Pasa una celda libre a mantenimiento.
* `PATCH /api/celdas/:id/available`: Rehabilita una celda en mantenimiento a libre.
* `DELETE /api/celdas/:id`: Eliminación física controlada (solo celdas sin historial).
* `GET /api/celdas/reporte-capacidad`: Reporte completo de ocupación, libres y porcentajes.

---

## 🎨 Mockups de Figma (Frames en Alta Fidelidad)

El visor interactivo `figma-mockups.html` contiene 8 lienzos con soporte de exportación a PNG:
* **Frame 1:** Dashboard y Monitoreo de Celdas en Vivo (HU-03).
* **Frame 2:** Formulario de Registro de Entrada y Emisión de Ticket (HU-01, HU-02).
* **Frame 3:** Modal de Inspección Física y Novedades con Blueprint del Vehículo (HU-04).
* **Frame 4:** Liquidación de Salida, Selección de Pago y Desglose (HU-05, HU-06).
* **Frame 5:** Ticket Digital Térmico de 80mm con Código de Barras.
* **Frame 6:** Panel de Gestión de Usuarios y Roles RBAC (HU-IT2-02, HU-IT2-03).
* **Frame 7:** Administración de Celdas y Aislamiento por Mantenimiento (HU-IT2-06, HU-IT2-08).
* **Frame 8:** Reporte Gráfico de Capacidad y Ocupación del Parqueadero (HU-IT2-10).

---

## 🧪 Plan de Pruebas Resumido

En el archivo `docs/iteracion2/03_plan_pruebas_iteracion2.md` se encuentra la matriz de 19 casos de prueba ejecutados y aprobados al 100%:
* **CP-USR-01 al CP-USR-09:** Pruebas de login, validación de contraseñas, RBAC, creación, unicidad de username y filtros de usuarios.
* **CP-CEL-01 al CP-CEL-10:** Pruebas de creación de celdas, código duplicado, bloqueo en celdas ocupadas, transición a mantenimiento, eliminación controlada y reportes de capacidad.

---

## 🏛️ Créditos y Licencia

Desarrollado para el proyecto académico **Parqueadero Autos Colombia**.  
Todos los derechos reservados © 2026.
