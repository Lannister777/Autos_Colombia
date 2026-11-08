# Entregable 1: Especificación de Requerimientos del Sistema
## Parqueadero "Autos Colombia" — Iteración 2: Gestión de Usuarios y Gestión de Celdas

---

### 1. Contexto y Alcance de la Iteración 2

La **Iteración 1** implementó la gestión de entrada y salida de vehículos (control de acceso, asignación de celdas, inspección de novedades y facturación). En la **Iteración 2** se amplía el sistema con dos módulos transversales:

1. **Gestión de Usuarios:** Administración completa del ciclo de vida de los usuarios del sistema (operadores y administradores), incluyendo autenticación, control de acceso basado en roles (RBAC), auditoría de acciones y gestión de contraseñas.
2. **Gestión de Celdas:** Administración integral del inventario de celdas de parqueo, incluyendo creación, edición, eliminación controlada, cambio de estados, gestión de sectores y generación de reportes de capacidad/ocupación.

**Tablas involucradas:**
- `usuarios` (id_usuario, nombre_completo, username, password_hash, rol [ADMIN/OPERADOR], activo, fecha_creacion)
- `celdas` (id_celda, codigo_celda, tipo_permitido [AUTOMOVIL/MOTO/CAMIONETA/BICICLETA], estado [LIBRE/OCUPADA/MANTENIMIENTO], sector)

---

### 2. Requerimientos Funcionales (RF) — Iteración 2

#### 2.1. Módulo de Gestión de Usuarios

| Código | Nombre del Requerimiento | Descripción | Prioridad | Actor Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **RF-IT2-01** | **Inicio de Sesión (Login)** | El sistema debe permitir a los usuarios autenticarse mediante nombre de usuario (`username`) y contraseña, validando las credenciales contra la tabla `usuarios`. Debe verificar que la cuenta esté activa (`activo = 1`). Si las credenciales son inválidas o la cuenta está desactivada, el sistema debe rechazar el acceso con un mensaje de error claro. Al autenticarse correctamente, se debe iniciar una sesión con un token JWT o variable de sesión que identifique al usuario y su rol. | Alta (Must) | Operador / Administrador |
| **RF-IT2-02** | **Creación de Usuarios** | El sistema debe permitir al Administrador crear nuevas cuentas de usuario especificando: nombre completo, nombre de usuario (único), contraseña inicial y rol (ADMIN u OPERADOR). El `username` no debe duplicarse. La contraseña debe almacenarse con hash seguro (bcrypt o similar). El campo `activo` se establece en 1 por defecto y `fecha_creacion` se asigna automáticamente. | Alta (Must) | Administrador |
| **RF-IT2-03** | **Edición de Usuarios** | El sistema debe permitir al Administrador modificar los datos de un usuario existente: nombre completo, nombre de usuario y rol. No se debe permitir cambiar el `username` a uno que ya esté en uso por otro usuario. El Administrador no debe poder degradar su propia cuenta si es el único administrador activo del sistema. | Alta (Must) | Administrador |
| **RF-IT2-04** | **Desactivación / Reactivación de Usuarios** | El sistema debe permitir al Administrador desactivar una cuenta de usuario (`activo = 0`), impidiendo que ese usuario inicie sesión sin borrar sus datos históricos. También debe permitir reactivar cuentas desactivadas (`activo = 1`). No se permite la eliminación física de usuarios para mantener la trazabilidad de auditoría. Un Administrador no puede desactivar su propia cuenta. | Alta (Must) | Administrador |
| **RF-IT2-05** | **Listado y Búsqueda de Usuarios** | El sistema debe proporcionar una vista que liste todos los usuarios del sistema con filtros por: rol (ADMIN/OPERADOR), estado (Activo/Inactivo), y búsqueda por nombre completo o `username`. La lista debe mostrar: nombre completo, username, rol, estado y fecha de creación. | Media (Should) | Administrador |
| **RF-IT2-06** | **Control de Acceso Basado en Roles (RBAC)** | El sistema debe restringir las funcionalidades según el rol del usuario autenticado. El **Administrador** tiene acceso completo a todos los módulos (gestión de usuarios, gestión de celdas, configuración de tarifas, reportes). El **Operador** tiene acceso limitado a las operaciones de caseta: registro de entrada/salida, consulta de celdas, registro de novedades. Las rutas API y los elementos de la interfaz deben respetar estas restricciones. | Alta (Must) | Sistema |
| **RF-IT2-07** | **Cambio de Contraseña** | El sistema debe permitir que cualquier usuario autenticado cambie su propia contraseña, ingresando la contraseña actual (para verificación) y la nueva contraseña (con confirmación). El Administrador debe poder restablecer la contraseña de cualquier otro usuario sin necesidad de conocer la contraseña anterior. | Media (Should) | Administrador / Operador |
| **RF-IT2-08** | **Registro de Auditoría de Acciones** | El sistema debe registrar las acciones críticas relacionadas con la gestión de usuarios: inicios de sesión exitosos y fallidos, creación de usuarios, edición de datos, desactivación/reactivación de cuentas y cambios de contraseña. El log de auditoría debe incluir: fecha/hora, usuario que realizó la acción, tipo de acción y detalles relevantes. | Media (Should) | Sistema |

---

#### 2.2. Módulo de Gestión de Celdas

| Código | Nombre del Requerimiento | Descripción | Prioridad | Actor Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **RF-IT2-09** | **Creación de Nuevas Celdas** | El sistema debe permitir al Administrador crear nuevas celdas de parqueo especificando: código de celda (único, formato alfanumérico como "A-07"), tipo de vehículo permitido (AUTOMOVIL, MOTO, CAMIONETA, BICICLETA), sector al que pertenece y estado inicial (por defecto LIBRE). El código de celda no debe duplicarse en la base de datos. | Alta (Must) | Administrador |
| **RF-IT2-10** | **Edición de Configuración de Celdas** | El sistema debe permitir al Administrador modificar los atributos de una celda existente: código de celda, tipo de vehículo permitido y sector. La edición del tipo de vehículo solo se debe permitir cuando la celda esté en estado LIBRE (no ocupada). El código de celda no debe cambiarse a uno ya existente. | Alta (Must) | Administrador |
| **RF-IT2-11** | **Cambio de Estado de Celdas** | El sistema debe permitir cambiar el estado de una celda entre LIBRE, OCUPADA y MANTENIMIENTO con las siguientes reglas de negocio: (a) Una celda OCUPADA no puede pasar a MANTENIMIENTO ni ser editada hasta que se registre la salida del vehículo. (b) Una celda LIBRE puede pasar a MANTENIMIENTO directamente. (c) Una celda en MANTENIMIENTO puede regresar a LIBRE una vez finalizado el mantenimiento. La transición a OCUPADA solo ocurre mediante el flujo de entrada de vehículos (Iteración 1). | Alta (Must) | Administrador / Operador |
| **RF-IT2-12** | **Eliminación Controlada de Celdas** | El sistema debe permitir al Administrador eliminar una celda solamente si cumple todas las condiciones: (a) La celda se encuentra en estado LIBRE. (b) La celda no tiene registros de acceso históricos asociados en la tabla `registros_acceso`. Si alguna condición no se cumple, el sistema debe impedir la eliminación y mostrar el motivo. | Media (Should) | Administrador |
| **RF-IT2-13** | **Listado y Filtrado de Celdas** | El sistema debe proporcionar un tablero (dashboard) de administración de celdas con filtros por: estado (LIBRE/OCUPADA/MANTENIMIENTO), tipo de vehículo permitido, sector, y búsqueda por código de celda. Debe mostrar contadores resumidos por estado y tipo, y permitir ordenar por cualquier columna. | Alta (Must) | Administrador / Operador |
| **RF-IT2-14** | **Cambio Masivo de Estado de Celdas** | El sistema debe permitir al Administrador seleccionar múltiples celdas en estado LIBRE y cambiarlas simultáneamente a MANTENIMIENTO (o viceversa) para agilizar operaciones de cierre parcial o habilitación de sectores completos. | Baja (Could) | Administrador |
| **RF-IT2-15** | **Gestión de Sectores** | El sistema debe permitir al Administrador definir y gestionar los nombres de sectores disponibles (ej. "Sector A - Principal", "Sector M - Motos"). La asignación de sector a cada celda debe realizarse a partir de una lista predefinida. El sistema debe mostrar las celdas organizadas por sector en la vista de tablero. | Media (Should) | Administrador |
| **RF-IT2-16** | **Reporte de Capacidad y Ocupación** | El sistema debe generar reportes de capacidad que incluyan: (a) Total de celdas por tipo de vehículo y sector. (b) Porcentaje de ocupación actual por tipo y sector. (c) Cantidad de celdas en mantenimiento. (d) Historial de ocupación promedio (si se dispone de datos históricos). El reporte debe poder visualizarse en pantalla y exportarse o imprimirse. | Media (Should) | Administrador |

---

### 3. Requerimientos No Funcionales (RNF) — Iteración 2

| Código | Categoría | Descripción y Métrica |
| :--- | :--- | :--- |
| **RNF-IT2-01** | **Seguridad — Autenticación** | Las contraseñas deben almacenarse utilizando funciones de hash seguras (bcrypt con salt de mínimo 10 rondas). Nunca se deben almacenar contraseñas en texto plano. Los tokens de sesión deben tener una vigencia máxima configurable (por defecto 8 horas operativas). |
| **RNF-IT2-02** | **Seguridad — Autorización** | Todas las rutas API de gestión de usuarios y administración de celdas deben estar protegidas por middleware de autenticación y verificación de rol. Las peticiones sin token válido deben retornar HTTP 401. Las peticiones con rol insuficiente deben retornar HTTP 403. |
| **RNF-IT2-03** | **Rendimiento** | Las operaciones CRUD de usuarios y celdas deben completarse en un tiempo de respuesta inferior a **1 segundo** bajo condiciones normales de operación. La generación del reporte de capacidad no debe superar los **3 segundos** incluso con más de 500 celdas registradas. |
| **RNF-IT2-04** | **Usabilidad** | Los formularios de gestión de usuarios y celdas deben incluir validación en tiempo real (frontend) de campos obligatorios, formatos y restricciones antes de enviar la petición al servidor. Los mensajes de error deben ser claros, en español, e indicar el campo y la causa del error. |
| **RNF-IT2-05** | **Integridad de Datos** | El sistema debe implementar restricciones a nivel de base de datos (UNIQUE, CHECK, FOREIGN KEY) y validaciones a nivel de servidor para prevenir: duplicación de `username`, duplicación de `codigo_celda`, eliminación de celdas con historial, y estados de celda inválidos. |
| **RNF-IT2-06** | **Trazabilidad y Auditoría** | Todas las operaciones de escritura (INSERT, UPDATE, DELETE) sobre las tablas `usuarios` y `celdas` deben quedar registradas en un log de auditoría con fecha, hora, usuario ejecutor, acción realizada y datos afectados (antes/después cuando aplique). |
| **RNF-IT2-07** | **Compatibilidad** | Los nuevos módulos deben integrarse de forma transparente con la interfaz SPA existente (`index.html`), manteniendo la misma tecnología (Tailwind CSS, Font Awesome, vanilla JavaScript) y el mismo patrón de comunicación API REST con el backend Express.js. |
| **RNF-IT2-08** | **Mantenibilidad** | Los nuevos controladores (`userController`, `cellAdminController`) y modelos deben seguir la misma estructura modular del proyecto (carpetas `controllers/`, `models/`, `routes/`) y las convenciones de nombrado ya establecidas en la Iteración 1. |

---

### 4. Matriz de Trazabilidad RF ↔ HU

| Requerimiento | Historia(s) de Usuario Asociada(s) |
| :--- | :--- |
| RF-IT2-01 | HU-IT2-01 (Login / Autenticación) |
| RF-IT2-02 | HU-IT2-02 (Crear Nuevo Usuario Operador) |
| RF-IT2-03, RF-IT2-04 | HU-IT2-04 (Editar Perfil/Rol), HU-IT2-05 (Desactivar/Reactivar) |
| RF-IT2-05 | HU-IT2-03 (Listar y Buscar Usuarios) |
| RF-IT2-06 | HU-IT2-01, HU-IT2-02 (Transversal a todos los módulos) |
| RF-IT2-07 | HU-IT2-04 (Editar Perfil — cambio de contraseña) |
| RF-IT2-08 | Transversal (Log de auditoría interno) |
| RF-IT2-09 | HU-IT2-06 (Crear Nueva Celda) |
| RF-IT2-10 | HU-IT2-07 (Editar Configuración de Celda) |
| RF-IT2-11 | HU-IT2-08 (Cambiar Estado a Mantenimiento) |
| RF-IT2-12 | HU-IT2-07 (Edición — eliminación controlada) |
| RF-IT2-13 | HU-IT2-09 (Dashboard de Celdas) |
| RF-IT2-14 | HU-IT2-08 (Cambio masivo de estado) |
| RF-IT2-15 | HU-IT2-07 (Gestión de sectores integrada) |
| RF-IT2-16 | HU-IT2-10 (Reporte de Capacidad/Ocupación) |

---

*Documento elaborado para el proyecto Parqueadero "Autos Colombia" — Iteración 2.*
*Fecha: Noviembre 2026*
