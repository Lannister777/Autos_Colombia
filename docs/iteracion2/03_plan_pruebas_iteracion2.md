# Entregable 7: Formato de Plan de Pruebas Resumido
## Parqueadero "Autos Colombia" — Iteración 2: Gestión de Usuarios y Gestión de Celdas

---

### 1. Información General del Plan de Pruebas

| Parámetro | Detalle |
| :--- | :--- |
| **Proyecto:** | Sistema de Información Integral — Parqueadero "Autos Colombia" |
| **Iteración Evaluada:** | **Iteración 2:** Gestión de Usuarios y Gestión de Celdas |
| **Líder de Calidad / Tester:** | Equipo de Aseguramiento de Calidad (QA) - Autos Colombia |
| **Ambiente de Pruebas:** | Windows 10/11 x64, Node.js v24.14.0, SQLite 3, Chrome / Edge |
| **URL del Sistema Local:** | `http://localhost:3000` |
| **Fecha de Ejecución:** | Noviembre de 2026 |
| **Alcance:** | Pruebas funcionales de extremo a extremo (E2E), validación de restricciones de integridad de base de datos, pruebas de autenticación RBAC y ciclo de vida de celdas. |

---

### 2. Estrategia y Tipos de Prueba

1. **Pruebas Unitarias y de Integración (API REST):** Verificación de respuestas HTTP, códigos de estado (200, 201, 400, 401, 403, 404) y payloads JSON devueltos por `userController` y `cellAdminController`.
2. **Pruebas de Validación y Límites:** Verificación de unicidad en `username` y `codigo_celda`, campos requeridos y restricciones CHECK en SQLite.
3. **Pruebas de Interfaz Gráfica (UI/UX):** Comportamiento de formularios, modales, filtros dinámicos, renderizado de badges de estado y notificaciones Toast en `index.html`.

---

### 3. Matriz de Casos de Prueba Ejecutados

| ID Caso | Módulo | Descripción del Caso de Prueba | Precondiciones | Pasos de Ejecución | Resultado Esperado | Resultado Obtenido | Estado |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **CP-USR-01** | Usuarios | Inicio de sesión exitoso con credenciales válidas | Usuario `admin` con clave `admin123` y `activo = 1` existe en BD | 1. Enviar POST a `/api/auth/login` con username y password correctos.<br>2. Evaluar token y datos devueltos. | HTTP 200, retorna token de sesión y objeto del usuario con rol `ADMIN`. | Token generado correctamente y sesión iniciada. | ✅ **APROBADO** |
| **CP-USR-02** | Usuarios | Rechazo de login por contraseña incorrecta | Usuario `operador1` existe en BD | 1. Enviar POST a `/api/auth/login` con password errónea `clave_falsa`. | HTTP 401 Unauthorized con mensaje: *"Credenciales inválidas"*. | HTTP 401 devuelto, acceso denegado. | ✅ **APROBADO** |
| **CP-USR-03** | Usuarios | Rechazo de login en cuenta desactivada | Usuario con `activo = 0` registrado en BD | 1. Desactivar usuario.<br>2. Intentar POST `/api/auth/login` con credenciales válidas. | HTTP 403 Forbidden con mensaje: *"La cuenta está desactivada"*. | Acceso bloqueado exitosamente con mensaje informativo. | ✅ **APROBADO** |
| **CP-USR-04** | Usuarios | Creación de nuevo usuario operador | Usuario Administrador en sesión | 1. Enviar POST `/api/usuarios` con nombre, username nuevo, clave y rol `OPERADOR`. | HTTP 201 Created, usuario insertado con `activo = 1` y fecha actual. | Usuario creado y visible en la consulta de usuarios. | ✅ **APROBADO** |
| **CP-USR-05** | Usuarios | Validación de unicidad de username | Ya existe usuario con username `admin` | 1. Intentar POST `/api/usuarios` con username `admin`. | HTTP 400 Bad Request indicando que el username ya está en uso. | Operación rechazada sin duplicar registros. | ✅ **APROBADO** |
| **CP-USR-06** | Usuarios | Actualización de datos de usuario | Usuario con ID existente en BD | 1. Enviar PUT `/api/usuarios/:id` con nombre modificado y rol actualizado. | HTTP 200 OK con datos actualizados reflejados en la respuesta. | Modificación guardada exitosamente en la BD. | ✅ **APROBADO** |
| **CP-USR-07** | Usuarios | Alternancia de estado (Activar / Desactivar) | Usuario activo en sistema | 1. Enviar PATCH `/api/usuarios/:id/toggle-active`.<br>2. Verificar cambio a 0.<br>3. Repetir petición. | El campo `activo` conmuta entre 1 y 0 con mensaje confirmatorio. | Estado conmutado correctamente en ambas direcciones. | ✅ **APROBADO** |
| **CP-USR-08** | Usuarios | Cambio de contraseña de usuario | Usuario existe en BD | 1. Enviar PATCH `/api/usuarios/:id/password` con nueva clave de 4+ caracteres. | HTTP 200 OK y actualización inmediata del hash de acceso. | Contraseña cambiada; nuevo login responde a la nueva clave. | ✅ **APROBADO** |
| **CP-USR-09** | Usuarios | Filtrado de usuarios por rol y estado | Existen usuarios ADMIN y OPERADOR | 1. Enviar GET `/api/usuarios?rol=OPERADOR&activo=1`. | Retorna únicamente usuarios que cumplan simultáneamente ambos filtros. | Filtrado exacto en backend y renderizado en UI. | ✅ **APROBADO** |
| **CP-CEL-01** | Celdas | Creación exitosa de nueva celda | Código de celda no existe previamente | 1. Enviar POST `/api/celdas` con código `A-07`, tipo `AUTOMOVIL`, sector `Sector A`. | HTTP 201 Created con estado inicial `LIBRE`. | Celda creada y disponible para asignación. | ✅ **APROBADO** |
| **CP-CEL-02** | Celdas | Rechazo de celda con código duplicado | Código `A-01` ya existe en BD | 1. Intentar POST `/api/celdas` con código `A-01`. | HTTP 400 Bad Request con mensaje de código ya registrado. | Bloqueo exitoso de código duplicado. | ✅ **APROBADO** |
| **CP-CEL-03** | Celdas | Modificación de celda en estado LIBRE | Celda en estado `LIBRE` | 1. Enviar PUT `/api/celdas/:id` cambiando sector y tipo permitido. | HTTP 200 OK con datos actualizados en la base de datos. | Atributos modificados satisfactoriamente. | ✅ **APROBADO** |
| **CP-CEL-04** | Celdas | Bloqueo de edición de celda OCUPADA | Celda tiene vehículo asignado en parqueadero | 1. Intentar PUT `/api/celdas/:id` en una celda con estado `OCUPADA`. | HTTP 400 Bad Request: *"No se puede modificar una celda OCUPADA"*. | Bloqueo de integridad aplicado con éxito. | ✅ **APROBADO** |
| **CP-CEL-05** | Celdas | Paso de celda a MANTENIMIENTO | Celda en estado `LIBRE` | 1. Enviar PATCH `/api/celdas/:id/maintenance`. | HTTP 200 OK, el estado cambia a `MANTENIMIENTO` y ya no se puede asignar. | Estado actualizado y celda excluida del dropdown de ingresos. | ✅ **APROBADO** |
| **CP-CEL-06** | Celdas | Bloqueo de mantenimiento en celda OCUPADA | Celda ocupada con estancia en curso | 1. Enviar PATCH `/api/celdas/:id/maintenance` a celda ocupada. | HTTP 400 Bad Request impidiendo la alteración del espacio con vehículo adentro. | Operación rechazada protegiendo la estancia. | ✅ **APROBADO** |
| **CP-CEL-07** | Celdas | Retorno de MANTENIMIENTO a LIBRE | Celda en estado `MANTENIMIENTO` | 1. Enviar PATCH `/api/celdas/:id/available`. | HTTP 200 OK, la celda vuelve a `LIBRE` y queda disponible para parqueo. | Celda rehabilitada con éxito en el inventario. | ✅ **APROBADO** |
| **CP-CEL-08** | Celdas | Eliminación de celda sin historial | Celda recién creada sin ingresos registrados | 1. Enviar DELETE `/api/celdas/:id` para celda sin registros de acceso. | HTTP 200 OK y eliminación física del registro en la tabla `celdas`. | Celda eliminada de la base de datos limpiamente. | ✅ **APROBADO** |
| **CP-CEL-09** | Celdas | Bloqueo de eliminación con historial | Celda con registros históricos en `registros_acceso` | 1. Enviar DELETE `/api/celdas/:id` a una celda que ha tenido ingresos previos. | HTTP 400 Bad Request reportando la cantidad de registros históricos asociados. | Integridad referencial protegida; no se eliminó. | ✅ **APROBADO** |
| **CP-CEL-10** | Celdas | Generación de reporte de capacidad | BD con celdas de varios tipos y estados | 1. Enviar GET `/api/celdas/reporte-capacidad`. | Retorna totales, libres, ocupadas, mantenimiento, % ocupación y desglose por tipo. | Cálculo estadístico exacto y coherente con el inventario. | ✅ **APROBADO** |

---

### 4. Resumen y Métricas de Ejecución

* **Total de Casos de Prueba Ejecutados:** 19
* **Casos Aprobados (Passed):** 19 (100%)
* **Casos Fallidos (Failed):** 0 (0%)
* **Casos Bloqueados / Pendientes:** 0 (0%)
* **Defectos Críticos Encontrados:** 0
* **Conclusión de Calidad:** Los módulos de **Gestión de Usuarios** y **Gestión de Celdas** correspondientes a la **Iteración 2** cumplen con la totalidad de los criterios de aceptación y requerimientos funcionales definidos, manteniendo la integridad referencial y la coherencia del modelo relacional.
