# Entregable 2: Historias de Usuario
## Parqueadero "Autos Colombia" — Iteración 2: Gestión de Usuarios y Gestión de Celdas

---

Las historias de usuario han sido diseñadas bajo los principios **INVEST** (Independiente, Negociable, Valiosa, Estimable, Pequeña y Comprobable) e incorporan criterios de aceptación en lenguaje **Gherkin** (*Given - When - Then*).

---

### HU-IT2-01: Inicio de Sesión / Autenticación

* **ID:** HU-IT2-01
* **Título:** Inicio de sesión con credenciales y control de acceso
* **Rol:** Como **Usuario del Sistema** (Operador o Administrador)
* **Quiero:** Iniciar sesión en el sistema ingresando mi nombre de usuario y contraseña.
* **Para:** Acceder a las funcionalidades del sistema correspondientes a mi rol y que mis acciones queden registradas bajo mi identidad.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Login exitoso con credenciales válidas**
    * **Dado que** el usuario "operador1" tiene una cuenta activa con rol OPERADOR en el sistema.
    * **Cuando** ingresa su username "operador1" y su contraseña correcta en el formulario de login y presiona "Ingresar".
    * **Entonces** el sistema valida las credenciales, crea una sesión autenticada, redirige al usuario al Dashboard principal y muestra el nombre del usuario y su rol en la barra de navegación.

  * **Escenario 2: Login fallido por contraseña incorrecta**
    * **Dado que** el usuario "operador1" tiene una cuenta activa en el sistema.
    * **Cuando** ingresa su username "operador1" pero una contraseña incorrecta y presiona "Ingresar".
    * **Entonces** el sistema muestra el mensaje de error *"Credenciales inválidas. Verifique su usuario y contraseña."* sin revelar cuál campo es incorrecto, y el formulario permanece en la pantalla de login.

  * **Escenario 3: Login fallido por cuenta desactivada**
    * **Dado que** el usuario "operador2" tiene una cuenta con `activo = 0` (desactivada).
    * **Cuando** ingresa credenciales válidas para "operador2".
    * **Entonces** el sistema muestra el mensaje *"Su cuenta se encuentra desactivada. Contacte al administrador del sistema."* y no permite el acceso.

  * **Escenario 4: Acceso a ruta protegida sin sesión activa**
    * **Dado que** un usuario no ha iniciado sesión o su sesión ha expirado.
    * **Cuando** intenta acceder a cualquier funcionalidad del sistema directamente por URL.
    * **Entonces** el sistema redirige automáticamente al formulario de login con el mensaje *"Debe iniciar sesión para acceder al sistema."*

---

### HU-IT2-02: Crear Nuevo Usuario Operador

* **ID:** HU-IT2-02
* **Título:** Creación de cuentas de usuario por parte del Administrador
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Crear nuevas cuentas de usuario (operadores u otros administradores) especificando su nombre completo, username, contraseña inicial y rol.
* **Para:** Habilitar a nuevos empleados del parqueadero para que operen el sistema de caseta con credenciales propias y trazables.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Creación exitosa de un nuevo operador**
    * **Dado que** el Administrador está autenticado y se encuentra en la pantalla "Gestión de Usuarios".
    * **Cuando** hace clic en "Nuevo Usuario", completa el formulario con nombre completo "María López Torres", username "operador3", contraseña "Op3r4d0r#2026", rol "OPERADOR" y confirma la creación.
    * **Entonces** el sistema almacena el nuevo usuario con la contraseña hasheada, estado activo por defecto y fecha de creación automática, muestra el mensaje *"Usuario 'operador3' creado exitosamente"* y la tabla de usuarios se actualiza para incluir el nuevo registro.

  * **Escenario 2: Intento de crear usuario con username duplicado**
    * **Dado que** ya existe un usuario con username "operador1" en el sistema.
    * **Cuando** el Administrador intenta crear un nuevo usuario con username "operador1".
    * **Entonces** el sistema rechaza la operación y muestra el mensaje *"El nombre de usuario 'operador1' ya se encuentra registrado. Elija un username diferente."*

  * **Escenario 3: Intento de creación por un usuario con rol Operador**
    * **Dado que** un usuario con rol OPERADOR está autenticado en el sistema.
    * **Cuando** intenta acceder a la funcionalidad de creación de usuarios (por API o interfaz).
    * **Entonces** el sistema bloquea la acción con mensaje HTTP 403 *"No tiene permisos suficientes para realizar esta acción"* y la opción de menú "Gestión de Usuarios" no es visible en su interfaz.

---

### HU-IT2-03: Listar y Buscar Usuarios

* **ID:** HU-IT2-03
* **Título:** Listado y búsqueda de usuarios del sistema con filtros
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Visualizar una tabla con todos los usuarios registrados y poder filtrar por rol, estado (activo/inactivo) y buscar por nombre o username.
* **Para:** Tener visibilidad completa de las cuentas del sistema, verificar el estado de cada una y encontrar rápidamente un usuario específico.
* **Prioridad:** Media | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Listado completo de usuarios**
    * **Dado que** el Administrador accede a la sección "Gestión de Usuarios".
    * **Cuando** la pantalla carga por primera vez.
    * **Entonces** el sistema muestra una tabla con todos los usuarios mostrando las columnas: Nombre Completo, Username, Rol, Estado (activo/inactivo con indicador visual), Fecha de Creación y acciones (Editar, Activar/Desactivar).

  * **Escenario 2: Filtrado por rol y estado**
    * **Dado que** existen 5 usuarios: 2 ADMIN (1 activo, 1 inactivo) y 3 OPERADOR (todos activos).
    * **Cuando** el Administrador selecciona el filtro Rol = "OPERADOR" y Estado = "Activo".
    * **Entonces** la tabla muestra únicamente los 3 usuarios operadores activos, ocultando los administradores y cualquier usuario inactivo.

  * **Escenario 3: Búsqueda por texto libre**
    * **Dado que** existe un usuario con nombre "Carlos Restrepo" y username "operador1".
    * **Cuando** el Administrador escribe "Restrepo" en el campo de búsqueda.
    * **Entonces** la tabla se filtra en tiempo real para mostrar solo los usuarios cuyo nombre completo o username contengan "Restrepo".

---

### HU-IT2-04: Editar Perfil / Rol de Usuario

* **ID:** HU-IT2-04
* **Título:** Edición de datos y rol de usuario existente
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Editar el nombre completo, username, rol y contraseña de cualquier usuario del sistema.
* **Para:** Actualizar la información de los empleados del parqueadero, corregir errores de registro, cambiar roles según cambios organizacionales y restablecer contraseñas olvidadas.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Edición exitosa de nombre y rol**
    * **Dado que** el Administrador selecciona al usuario "operador1" desde la lista de usuarios.
    * **Cuando** modifica el nombre completo a "Carlos A. Restrepo Mejía" y cambia el rol de OPERADOR a ADMIN, y confirma los cambios.
    * **Entonces** el sistema actualiza los datos del usuario, muestra *"Usuario 'operador1' actualizado correctamente"* y la tabla refleja los cambios inmediatamente.

  * **Escenario 2: Prevención de username duplicado al editar**
    * **Dado que** existen los usuarios "operador1" y "admin".
    * **Cuando** el Administrador intenta cambiar el username de "operador1" a "admin".
    * **Entonces** el sistema rechaza la operación con el mensaje *"El nombre de usuario 'admin' ya se encuentra en uso por otro usuario."*

  * **Escenario 3: Restablecimiento de contraseña por Administrador**
    * **Dado que** el operador "operador1" olvidó su contraseña y solicita al administrador restablecerla.
    * **Cuando** el Administrador abre la edición de "operador1" e ingresa una nueva contraseña "NuevaCl4v3#" con confirmación.
    * **Entonces** el sistema actualiza el hash de la contraseña y muestra *"Contraseña restablecida exitosamente para el usuario 'operador1'."*

---

### HU-IT2-05: Desactivar / Reactivar Cuenta de Usuario

* **ID:** HU-IT2-05
* **Título:** Desactivación y reactivación de cuentas de usuario
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Desactivar cuentas de usuarios que ya no laboran en el parqueadero o reactivar cuentas suspendidas temporalmente.
* **Para:** Impedir el acceso de ex-empleados al sistema sin perder la trazabilidad de sus acciones históricas (los registros de acceso, novedades y pagos quedan vinculados al usuario).
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Desactivación exitosa de cuenta**
    * **Dado que** el usuario "operador2" se encuentra activo y no es el último administrador del sistema.
    * **Cuando** el Administrador hace clic en "Desactivar" para "operador2" y confirma la acción en el diálogo de confirmación.
    * **Entonces** el sistema cambia el campo `activo` a 0, muestra *"La cuenta del usuario 'operador2' ha sido desactivada"*, el indicador visual cambia a "Inactivo" (rojo) en la tabla, y el usuario "operador2" no podrá iniciar sesión.

  * **Escenario 2: Prevención de auto-desactivación**
    * **Dado que** el Administrador "admin" está autenticado.
    * **Cuando** intenta desactivar su propia cuenta.
    * **Entonces** el sistema bloquea la operación con el mensaje *"No puede desactivar su propia cuenta de administrador."*

  * **Escenario 3: Reactivación de cuenta inactiva**
    * **Dado que** el usuario "operador2" tiene estado `activo = 0`.
    * **Cuando** el Administrador hace clic en "Reactivar" para "operador2" y confirma.
    * **Entonces** el sistema cambia el campo `activo` a 1, muestra *"La cuenta del usuario 'operador2' ha sido reactivada exitosamente"* y el usuario puede iniciar sesión nuevamente.

---

### HU-IT2-06: Crear Nueva Celda de Parqueo

* **ID:** HU-IT2-06
* **Título:** Creación de nuevas celdas en el inventario del parqueadero
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Crear nuevas celdas de parqueo especificando su código, tipo de vehículo permitido y sector al que pertenece.
* **Para:** Ampliar la capacidad del parqueadero cuando se habiliten nuevos espacios físicos o se reorganicen los sectores existentes.
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Creación exitosa de una nueva celda**
    * **Dado que** el Administrador está autenticado y accede a la sección "Gestión de Celdas".
    * **Cuando** hace clic en "Nueva Celda", ingresa el código "A-07", selecciona tipo "AUTOMOVIL", sector "Sector A - Principal" y confirma la creación.
    * **Entonces** el sistema crea la celda con estado LIBRE por defecto, muestra *"Celda 'A-07' creada exitosamente en Sector A - Principal"* y la celda aparece en el tablero de celdas con color verde (Libre).

  * **Escenario 2: Intento de crear celda con código duplicado**
    * **Dado que** ya existe la celda con código "A-01" en el sistema.
    * **Cuando** el Administrador intenta crear una nueva celda con código "A-01".
    * **Entonces** el sistema rechaza la operación con el mensaje *"El código de celda 'A-01' ya se encuentra registrado. Ingrese un código único."*

  * **Escenario 3: Validación de campos obligatorios**
    * **Dado que** el Administrador abre el formulario de nueva celda.
    * **Cuando** intenta confirmar la creación sin completar el campo "código de celda" o sin seleccionar el tipo de vehículo.
    * **Entonces** el sistema resalta los campos faltantes en rojo y muestra *"Todos los campos marcados son obligatorios."* sin enviar la petición al servidor.

---

### HU-IT2-07: Editar Configuración de Celda

* **ID:** HU-IT2-07
* **Título:** Edición de atributos de una celda de parqueo existente
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Editar el código, tipo de vehículo permitido y sector de una celda existente.
* **Para:** Reconfigurar el parqueadero cuando cambien las necesidades operativas, por ejemplo, convertir celdas de automóvil a celdas de moto o reasignar sectores.
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Edición exitosa de celda en estado LIBRE**
    * **Dado que** la celda "M-04" está en estado LIBRE con tipo MOTO y sector "Sector M - Motos".
    * **Cuando** el Administrador cambia el tipo a "BICICLETA" y el sector a "Sector B - Bicis" y confirma.
    * **Entonces** el sistema actualiza los atributos de la celda y muestra *"Celda 'M-04' actualizada correctamente."*

  * **Escenario 2: Bloqueo de edición de tipo en celda OCUPADA**
    * **Dado que** la celda "A-01" está en estado OCUPADA (tiene un vehículo estacionado).
    * **Cuando** el Administrador intenta cambiar el tipo de vehículo permitido de la celda.
    * **Entonces** el sistema bloquea la modificación del tipo con el mensaje *"No se puede cambiar el tipo de vehículo de una celda ocupada. Espere a que el vehículo registre salida."*

  * **Escenario 3: Eliminación controlada de celda sin historial**
    * **Dado que** la celda "B-02" está en estado LIBRE y no tiene registros históricos en `registros_acceso`.
    * **Cuando** el Administrador hace clic en "Eliminar Celda" y confirma en el diálogo de advertencia.
    * **Entonces** el sistema elimina la celda del inventario, muestra *"Celda 'B-02' eliminada permanentemente"* y la celda desaparece del tablero.

---

### HU-IT2-08: Cambiar Estado de Celda a Mantenimiento

* **ID:** HU-IT2-08
* **Título:** Cambio de estado de celdas a mantenimiento y viceversa
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Marcar una o varias celdas como "En Mantenimiento" cuando necesiten reparación, limpieza u obras, y restaurarlas a "Libre" cuando estén habilitadas.
* **Para:** Garantizar que las celdas en mantenimiento no se asignen a vehículos entrantes y que el tablero de ocupación refleje la disponibilidad real del parqueadero.
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Cambio individual a MANTENIMIENTO**
    * **Dado que** la celda "C-02" está en estado LIBRE.
    * **Cuando** el Administrador selecciona la celda "C-02" y elige la opción "Marcar en Mantenimiento".
    * **Entonces** el sistema cambia el estado a MANTENIMIENTO, el color de la celda en el tablero cambia a amarillo, y muestra *"Celda 'C-02' marcada en mantenimiento."*

  * **Escenario 2: Bloqueo de mantenimiento en celda OCUPADA**
    * **Dado que** la celda "A-03" está en estado OCUPADA con un vehículo dentro.
    * **Cuando** el Administrador intenta cambiar su estado a MANTENIMIENTO.
    * **Entonces** el sistema bloquea la acción con el mensaje *"No se puede poner en mantenimiento la celda 'A-03' porque tiene un vehículo estacionado. Registre primero la salida del vehículo."*

  * **Escenario 3: Cambio masivo a MANTENIMIENTO**
    * **Dado que** las celdas "M-01", "M-02", "M-03" y "M-04" están todas en estado LIBRE.
    * **Cuando** el Administrador selecciona las 4 celdas mediante checkboxes y ejecuta la acción masiva "Marcar en Mantenimiento".
    * **Entonces** el sistema cambia las 4 celdas simultáneamente a MANTENIMIENTO, muestra *"4 celdas marcadas en mantenimiento exitosamente"* y el tablero se actualiza.

---

### HU-IT2-09: Dashboard de Listado y Filtrado de Celdas

* **ID:** HU-IT2-09
* **Título:** Tablero interactivo de administración y filtrado de celdas
* **Rol:** Como **Administrador u Operador**
* **Quiero:** Visualizar un tablero completo de todas las celdas del parqueadero con filtros interactivos por estado, tipo de vehículo y sector.
* **Para:** Tener una visión integral de la infraestructura del parqueadero, identificar rápidamente celdas por su condición y tomar decisiones operativas informadas.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Visualización del tablero con indicadores de resumen**
    * **Dado que** el usuario (Administrador u Operador) accede al módulo de celdas.
    * **Cuando** se carga la vista principal del dashboard.
    * **Entonces** el sistema muestra: (a) Tarjetas resumen con: Total Celdas, Libres (verde), Ocupadas (rojo), Mantenimiento (amarillo). (b) Una tabla o grilla visual con todas las celdas organizadas por sector. (c) Cada celda muestra su código, tipo y estado con color diferenciado.

  * **Escenario 2: Filtrado combinado**
    * **Dado que** el parqueadero tiene celdas de todos los tipos y estados.
    * **Cuando** el usuario selecciona filtro Estado = "LIBRE" y Tipo = "AUTOMOVIL".
    * **Entonces** el tablero muestra únicamente las celdas de automóvil que están libres, y los contadores se actualizan para reflejar el subconjunto filtrado.

  * **Escenario 3: Búsqueda por código de celda**
    * **Dado que** el Administrador necesita encontrar la celda "C-03".
    * **Cuando** escribe "C-03" en el campo de búsqueda.
    * **Entonces** el tablero filtra para mostrar solo la celda "C-03" con toda su información: código, tipo permitido, sector y estado actual.

---

### HU-IT2-10: Generar Reporte de Capacidad / Ocupación

* **ID:** HU-IT2-10
* **Título:** Generación de reportes de capacidad y porcentaje de ocupación
* **Rol:** Como **Administrador del Sistema**
* **Quiero:** Generar un reporte consolidado que muestre la capacidad total, ocupación actual y celdas en mantenimiento, segmentado por tipo de vehículo y sector.
* **Para:** Tomar decisiones estratégicas de inversión en infraestructura, identificar sectores subutilizados y planificar la expansión del parqueadero con datos reales.
* **Prioridad:** Media | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**

  * **Escenario 1: Reporte general de capacidad**
    * **Dado que** el parqueadero tiene 15 celdas: 6 AUTOMOVIL (3 libres, 2 ocupadas, 1 mantenimiento), 4 MOTO (4 libres), 3 CAMIONETA (1 libre, 2 ocupadas), 2 BICICLETA (2 libres).
    * **Cuando** el Administrador accede a la sección "Reportes de Capacidad".
    * **Entonces** el sistema muestra una tabla con columnas: Tipo de Vehículo | Total | Libres | Ocupadas | Mantenimiento | % Ocupación — con los datos calculados correctamente (ej. AUTOMOVIL: 33.3% ocupación).

  * **Escenario 2: Reporte desglosado por sector**
    * **Dado que** existen los sectores "Sector A - Principal", "Sector M - Motos", "Sector C - Camionetas" y "Sector B - Bicis".
    * **Cuando** el Administrador selecciona la vista "Por Sector".
    * **Entonces** el sistema muestra el desglose de cada sector con: nombre del sector, total de celdas, distribución por estado y porcentaje de ocupación.

  * **Escenario 3: Visualización gráfica del reporte**
    * **Dado que** el Administrador genera el reporte de capacidad.
    * **Cuando** se visualizan los resultados.
    * **Entonces** el sistema presenta, además de la tabla, un gráfico de barras o donut que represente visualmente la distribución de celdas por estado para cada tipo de vehículo.

---

### Resumen de Historias de Usuario — Iteración 2

| ID | Título | Prioridad | SP | Módulo |
| :--- | :--- | :--- | :---: | :--- |
| HU-IT2-01 | Login / Autenticación | Alta | 5 | Gestión de Usuarios |
| HU-IT2-02 | Crear Nuevo Usuario | Alta | 5 | Gestión de Usuarios |
| HU-IT2-03 | Listar y Buscar Usuarios | Media | 3 | Gestión de Usuarios |
| HU-IT2-04 | Editar Perfil / Rol de Usuario | Alta | 5 | Gestión de Usuarios |
| HU-IT2-05 | Desactivar / Reactivar Cuenta | Alta | 3 | Gestión de Usuarios |
| HU-IT2-06 | Crear Nueva Celda | Alta | 3 | Gestión de Celdas |
| HU-IT2-07 | Editar Configuración de Celda | Alta | 3 | Gestión de Celdas |
| HU-IT2-08 | Cambiar Estado a Mantenimiento | Alta | 3 | Gestión de Celdas |
| HU-IT2-09 | Dashboard de Celdas | Alta | 5 | Gestión de Celdas |
| HU-IT2-10 | Reporte Capacidad / Ocupación | Media | 5 | Gestión de Celdas |
| | **Total Story Points Iteración 2** | | **40** | |

---

*Documento elaborado para el proyecto Parqueadero "Autos Colombia" — Iteración 2.*
*Fecha: Noviembre 2026*
