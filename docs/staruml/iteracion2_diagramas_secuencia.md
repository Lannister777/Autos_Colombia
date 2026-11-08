# Entregable: Diagramas de Secuencia del Sistema (Iteraciones 1 y 2)
## Parqueadero "Autos Colombia" — Arquitectura y Flujos Dinámicos StarUML

---

### 1. Propósito y Alcance

Los **Diagramas de Secuencia UML** modelan la interacción dinámica temporal entre los actores (Operador de Caseta, Administrador), las interfaces de usuario (Frontend SPA), la capa de enrutamiento y controladores REST (Express.js), los modelos de acceso a datos y la base de datos relacional SQLite (`autos_colombia.db`).

Se estructuran en dos bloques de iteración:
- **Iteración 1:** Flujo de entrada de vehículos (SD-01) y flujo de salida con liquidación y liberación de celda (SD-02).
- **Iteración 2:** Autenticación/Login con control de acceso por roles (SD-03), Creación de usuarios por el administrador (SD-04) y Gestión del ciclo de vida y mantenimiento de celdas (SD-05).

El archivo ejecutable PlantUML correspondiente se encuentra en:  
`docs/staruml/diagramas_secuencia.puml`.

---

### 2. Especificación de Diagramas de Secuencia

#### 2.1. SD-01: Registro de Entrada de Vehículo (Iteración 1)
* **Objetivo:** Registrar el ingreso de un vehículo, verificar si cuenta con suscripción mensual activa, validar que no esté adentro, asignar una celda libre física, registrar novedad previa (si existe) y emitir el ticket físico o digital.
* **Participantes:**
  1. `Operador Caseta` (Actor)
  2. `Frontend SPA (index.html / app.js)`
  3. `API Router (apiRoutes.js)`
  4. `accessController (accessController.js)`
  5. `vehicleModel (vehicleModel.js)`
  6. `cellModel (cellModel.js)`
  7. `accessModel (accessModel.js)`
  8. `SQLite Database (autos_colombia.db)`
* **Reglas de negocio validadas:**
  - Placa no puede estar adentro (`estado = 'EN_CURSO'`).
  - Si tiene mensualidad activa en tabla `mensualidades`, modalidad es `MENSUALIDAD` ($0 COP al ingreso y salida).
  - La celda asignada cambia de `LIBRE` a `OCUPADA` atómicamente.

---

#### 2.2. SD-02: Liquidación de Salida, Pago y Liberación de Celda (Iteración 1)
* **Objetivo:** Calcular la permanencia en minutos y fracciones, aplicar la tarifa horaria según tipo de vehículo (Automóvil $4.000, Moto $2.000, Camioneta $5.000, Bici $1.000), registrar el método de pago (Efectivo, Nequi, Daviplata, Tarjeta), finalizar el acceso y retornar la celda al estado `LIBRE`.
* **Participantes:**
  1. `Operador Caseta`
  2. `Frontend SPA`
  3. `accessController`
  4. `billingModel`
  5. `cellModel`
  6. `accessModel`
  7. `SQLite Database`
* **Puntos clave:**
  - El cálculo aplica tiempo de gracia reglamentario (10-15 minutos).
  - Registro de pago genera número de comprobante único (`PAG-XXXX`).
  - La celda queda inmediatamente disponible en el plano interactivo.

---

#### 2.3. SD-03: Autenticación / Inicio de Sesión (Iteración 2)
* **Objetivo:** Validar identidad del usuario (Operador o Administrador), comprobar cuenta activa y generar sesión para control de acceso RBAC.
* **Participantes:**
  1. `Usuario (Admin/Operador)`
  2. `Frontend SPA (Login Modal)`
  3. `API Router (/api/auth/login)`
  4. `userController.js`
  5. `userModel.js`
  6. `SQLite Database (tabla usuarios)`
* **Manejo de escenarios:**
  - **Exitoso:** Retorna token de sesión y objeto usuario con rol para habilitar/deshabilitar pestañas administrativas.
  - **Credenciales inválidas:** Retorna HTTP 401 sin revelar cuál campo falló.
  - **Cuenta inactiva:** Retorna HTTP 403 bloqueando el acceso al sistema.

---

#### 2.4. SD-04: Creación de Usuarios (Iteración 2)
* **Objetivo:** Permitir al Administrador registrar nuevos operadores y supervisores en la base de datos con validación de unicidad de `username`.
* **Participantes:**
  1. `Administrador`
  2. `Frontend SPA (tabUsers)`
  3. `userController.js`
  4. `userModel.js`
  5. `SQLite Database`
* **Garantías de integridad:**
  - Restricción `UNIQUE` en `username`.
  - Roles restringidos estrictamente a `ADMIN` u `OPERADOR`.
  - Estado inicial `activo = 1`.

---

#### 2.5. SD-05: Administración de Celdas y Mantenimiento (Iteración 2)
* **Objetivo:** Controlar el estado operativo de las celdas, aislando celdas averiadas, con pintura fresca o reservadas temporalmente sin alterar el historial de cobros.
* **Participantes:**
  1. `Administrador`
  2. `Frontend SPA (tabAdminCells)`
  3. `cellAdminController.js`
  4. `cellModel.js`
  5. `SQLite Database`
* **Transiciones de estado permitidas:**
  - `LIBRE` ➔ `MANTENIMIENTO` (Permitido directamente).
  - `MANTENIMIENTO` ➔ `LIBRE` (Permitido al finalizar la reparación).
  - `OCUPADA` ➔ `MANTENIMIENTO` (Bloqueado con HTTP 400 hasta que el vehículo salga).
  - Eliminación (`DELETE`) permitida únicamente si no registra accesos en `registros_acceso`.

---

### 3. Código Fuente PlantUML

Consulte el archivo fuente completo en [`docs/staruml/diagramas_secuencia.puml`](file:///C:/Users/Usuario/Downloads/U/Autos_Colombia/docs/staruml/diagramas_secuencia.puml). Para visualizar los diagramas:
1. Copie y pegue la sintaxis en [PlantText UML Editor](https://www.planttext.com/) o en la extensión PlantUML de VS Code.
2. O expórtelos a imágenes PNG/SVG integradas en la documentación institucional.
