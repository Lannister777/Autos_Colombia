# Entregable 4: Guía y Especificación de Mockups (Figma) — Iteración 2
## Parqueadero "Autos Colombia" — Gestión de Usuarios y Gestión de Celdas

---

### 1. Sistema de Diseño Extendido (Figma Design System)

Para la **Iteración 2**, se extendió el kit de diseño institucional con nuevos componentes para interfaces administrativas y tableros analíticos:

#### 1.1. Paleta de Colores y Tokens UI
* **Admin Brand Dark:** `#0F172A` (Fondo de encabezados administrativos y paneles laterales)
* **Cyan Admin / Rol Operador:** `#06B6D4` (Identificadores de operadores y perfiles de usuario)
* **Púrpura / Rol Administrador:** `#8B5CF6` (Badges de administradores y permisos elevados)
* **Mantenimiento / Bloqueo:** `#D97706` (Celdas fuera de servicio y avisos de contingencia)
* **Capacidad / Ocupación Normal:** `#10B981` (Disponibilidad < 70% ocupación)
* **Capacidad / Alerta Saturación:** `#EF4444` (Disponibilidad < 15% o parqueadero lleno)

---

### 2. Especificación de Pantallas y Wireframes Figma (Iteración 2)

#### Frame 6: Panel de Gestión de Usuarios del Sistema (HU-IT2-02, HU-IT2-03, HU-IT2-04, HU-IT2-05)
* **Dimensiones:** Desktop 1440 × 900 px
* **Componentes clave:**
  - Encabezado con título del módulo, contador total de usuarios activos/inactivos y botón destacado `[ + Nuevo Usuario ]`.
  - Barra de filtrado dinámico: filtro por rol (`[Todos] [Administrador] [Operador]`), filtro por estado (`[Todos] [Activo] [Inactivo]`) y caja de búsqueda por nombre o `username`.
  - Tabla de datos institucional con cabeceras estilizadas: ID, Nombre Completo, Nombre de Usuario, Rol (badges púrpura/cian), Estado (switch o badge verde/rojo), Fecha de Registro y Columna de Acciones.
  - Acciones por fila: `[ Editar ]`, `[ Desactivar / Activar ]`, `[ Cambiar Clave ]`.
  - Modal emergente de Creación/Edición con validaciones visuales: campos requeridos, feedback de disponibilidad de `username` y selector de rol.

```
+-----------------------------------------------------------------------------------------------+
| GESTIÓN DE USUARIOS DEL SISTEMA                           [ + NUEVO USUARIO ]                 |
+-----------------------------------------------------------------------------------------------+
| Filtro Rol: [ Todos v ]  |  Estado: [ Activos v ]  |  Buscar: [ Juan Pérez...       ] [BUSCAR]|
+-----------------------------------------------------------------------------------------------+
| ID | Nombre Completo        | Username     | Rol        | Estado   | Creado      | Acciones   |
|----+------------------------+--------------+------------+----------+-------------+------------|
| 1  | Carlos Alberto Restrepo| operador1    | [OPERADOR] | [ACTIVO] | 2026-10-15  | [✎] [⊘] [🔑]|
| 2  | Administrador General  | admin        | [ ADMIN  ] | [ACTIVO] | 2026-10-01  | [✎] [⊘] [🔑]|
| 3  | Andrea Gómez Henao     | operador2    | [OPERADOR] | [INACTIVO| 2026-10-20  | [✎] [✓] [🔑]|
+-----------------------------------------------------------------------------------------------+
```

---

#### Frame 7: Panel de Administración de Celdas y Mantenimiento (HU-IT2-06, HU-IT2-07, HU-IT2-08, HU-IT2-09)
* **Dimensiones:** Desktop 1440 × 900 px
* **Componentes clave:**
  - Barra de herramientas con botón `[ + Nueva Celda ]` y selector de sector.
  - Indicadores superiores de estado general: *Total Celdas*, *Libres*, *Ocupadas*, *En Mantenimiento*.
  - Tabla de inventario de celdas: Código de celda (ej. `A-01`), Tipo de vehículo permitido (ícono + texto), Sector asignado, Estado actual (`LIBRE`, `OCUPADA`, `MANTENIMIENTO`).
  - Botones de acción rápida en cada celda:
    - Botón `[ Poner en Mantenimiento ]` (deshabilitado si está ocupada).
    - Botón `[ Habilitar ]` (si está en mantenimiento).
    - Botón `[ Editar ]` y `[ Eliminar ]` (con confirmación de seguridad que valida que no tenga historial).

```
+-----------------------------------------------------------------------------------------------+
| ADMINISTRACIÓN DE CELDAS                                  [ + NUEVA CELDA ]                   |
+-----------------------------------------------------------------------------------------------+
| [ 20 Total Celdas ]   [ 13 Celdas Libres ]   [ 5 Ocupadas ]   [ 2 En Mantenimiento ]          |
+-----------------------------------------------------------------------------------------------+
| Código | Tipo Permitido | Sector                 | Estado         | Acciones                  |
|--------+----------------+------------------------+----------------+---------------------------|
| A-01   | [🚗 AUTOMÓVIL] | Sector A - Principal   | [ LIBRE ]      | [✎ Editar] [🔧 Mantenim.]  |
| A-02   | [🚗 AUTOMÓVIL] | Sector A - Principal   | [ OCUPADA ]    | (Vehículo Adentro)        |
| A-03   | [🚗 AUTOMÓVIL] | Sector A - Principal   | [MANTENIMIENTO]| [✓ Habilitar Celda]       |
| M-01   | [🏍️ MOTO]      | Sector M - Motos       | [ LIBRE ]      | [✎ Editar] [🔧 Mantenim.]  |
+-----------------------------------------------------------------------------------------------+
```

---

#### Frame 8: Reporte Gráfico de Capacidad y Ocupación (HU-IT2-10)
* **Dimensiones:** Desktop 1440 × 900 px
* **Componentes clave:**
  - Widget circular o barra de progreso general con el **Porcentaje de Ocupación Global** (ej. `35% Ocupación`).
  - Tarjetas segmentadas por categoría de vehículo con barras de progreso relativas:
    - Automóviles: 6 Libres / 3 Ocupadas / 1 Mantenimiento (Total 10)
    - Motocicletas: 4 Libres / 1 Ocupada / 1 Mantenimiento (Total 6)
    - Camionetas: 2 Libres / 1 Ocupada (Total 3)
    - Bicicletas: 1 Libre / 0 Ocupadas (Total 1)
  - Desglose por sectores del parqueadero con capacidad máxima y disponibilidad en tiempo real.
  - Botón de exportación `[ Imprimir Reporte de Capacidad ]`.

---

### 3. Visualización Interactiva en Navegador

Los mockups de la **Iteración 2** (Frames 6, 7 y 8) están integrados directamente en el visor Figma del proyecto:
* **URL Local:** `http://localhost:3000/figma-mockups.html`
* Cuenta con soporte para exportación directa a imágenes PNG en alta resolución (2x) con un solo clic.
