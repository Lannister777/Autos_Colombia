# Entregable 4: Mockups de Historias de Usuario (Figma)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Sistema de Diseño (Design System & UI Kit)

Para el diseño de la interfaz gráfica del parqueadero **"Autos Colombia"** en **Figma**, se diseñó un sistema visual enfocado en alta legibilidad para entornos de caseta (iluminación variable, pantallas táctiles o monitores estándar):

#### 1.1. Paleta de Colores Corporativa
* **Primario (Azul Petróleo / Autos Colombia):** `#1E3A8A` (Encabezados, botones primarios, identidad institucional)
* **Secundario (Azul Cobalto):** `#2563EB` (Estados hover, elementos interactivos activos)
* **Éxito / Celda Libre / Mensualidad Activa:** `#10B981` (Disponibilidad, tickets aprobados)
* **Alerta / Celda Ocupada / Pendiente:** `#EF4444` (Ocupación, cobros pendientes, errores)
* **Advertencia / Novedad / En Revisión:** `#F59E0B` (Avisos de daños, celdas en mantenimiento)
* **Fondo de Interfaz (Light Canvas):** `#F8FAFC`
* **Superficies de Tarjetas (Cards):** `#FFFFFF` con sombras suaves `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
* **Tipografía Principal:** `Inter`, `system-ui` (Legibilidad óptima)
* **Tipografía de Monospaciado (Placas y Folios):** `JetBrains Mono`, `Consolas`

---

### 2. Especificación de Pantallas y Wireframes Figma

#### Pantalla 1: Dashboard y Tablero Interactivo de Celdas (HU-03)
* **Componentes:**
  * Barra superior de navegación con logotipo de "Autos Colombia", reloj digital en vivo, indicador de turno y botón de usuario operador.
  * Tarjetas KPI de resumen: *Total Celdas (15)*, *Celdas Ocupadas (5)*, *Celdas Libres (10)*, *Ingresos del Turno ($)*.
  * Selector de filtro de celdas por tipo: `[Todos] [Automóviles] [Motos] [Camionetas] [Bicicletas]`.
  * Grid de celdas dinámicas: Cada celda representada por una tarjeta con código (ej. `A-01`), ícono del vehículo, estado (`Libre` en verde o `Ocupada` en rojo con placa y tiempo transcurrido).

```
+---------------------------------------------------------------------------------------+
| [LOGO] AUTOS COLOMBIA  |  Turno: Mañana (Carlos R.)  |  12:45:00 PM  |  [ Cerrar Sesión ] |
+---------------------------------------------------------------------------------------+
|  [KPI: 10 Celdas Libres]   [KPI: 5 Celdas Ocupadas]   [KPI: $ 85.000 Cobrado Hoy]      |
+---------------------------------------------------------------------------------------+
|  FILTRO: [ (X) Todas ]  [ ( ) Automóvil ]  [ ( ) Moto ]  [ ( ) Camioneta ]            |
|                                                                                       |
|  +----------------+  +----------------+  +----------------+  +----------------+       |
|  | Celda: A-01    |  | Celda: A-02    |  | Celda: A-03    |  | Celda: M-01    |       |
|  | [ AUTO - LIBRE]|  | [ AUTO - OCUP] |  | [ AUTO - LIBRE]|  | [ MOTO - OCUP] |       |
|  | [ Disponible ] |  | Placa: ABC-123 |  | [ Disponible ] |  | Placa: MED-456 |       |
|  |                |  | Estancia: 1h15m|  |                |  | Mensualidad OK |       |
|  +----------------+  +----------------+  +----------------+  +----------------+       |
+---------------------------------------------------------------------------------------+
```

---

#### Pantalla 2: Registro de Entrada de Vehículo (HU-01, HU-02)
* **Componentes:**
  * Campo de entrada de placa con autoformato en mayúsculas y detección instantánea de suscripción mensual.
  * Alerta dinámica: Si la placa tiene mensualidad activa, se despliega un banner verde con datos del abonado (*"Santiago Morales - Mensualidad Vigente"*).
  * Selector de categoría de vehículo: Automóvil, Moto, Camioneta, Bici.
  * Menú desplegable o asignador automático de celda disponible con visualización del sector.
  * Botón directo: `[ + Registrar Novedad / Daño Previo ]`.
  * Botón de acción principal: `[ Registrar Entrada y Generar Ticket ]`.

```
+---------------------------------------------------------------------------------------+
| NUEVO REGISTRO DE ENTRADA                                                             |
+---------------------------------------------------------------------------------------+
|  Placa del Vehículo:                                                                  |
|  [ ABC123                                                   ]                         |
|  ✓ Verificación: Vehículo Visitante / Ocasional (Tarifa: $4.000 / hora)               |
|                                                                                       |
|  Tipo de Vehículo:                                                                    |
|  (•) Automóvil     ( ) Motocicleta     ( ) Camioneta     ( ) Bicicleta                |
|                                                                                       |
|  Celda Asignada:                                                                      |
|  [ A-01 (Sector Principal - Automóvil)                    v ]                         |
|                                                                                       |
|  Observaciones de Entrada:                                                            |
|  [ Sin novedades aparentes                                  ]                         |
|                                                                                       |
|  [ + Inspeccionar Daños / Añadir Novedad ]                                            |
|                                                                                       |
|  [ CANCELAR ]                             [ REGISTRAR ENTRADA Y EMITIR TICKET (F2) ]  |
+---------------------------------------------------------------------------------------+
```

---

#### Pantalla 3: Modal de Registro de Novedades e Inspección Física (HU-04)
* **Componentes:**
  * Encabezado con placa del vehículo y tipo.
  * Selector de tipo de novedad: *Rayón superficial, Golpe/Abolladura, Espejo roto, Objeto de valor dejado, Falla mecánica previa*.
  * Selector de severidad: *Baja, Media, Alta*.
  * Área de texto libre para descripción detallada de la novedad.
  * Campo para adjuntar fotografía o evidencia digital.
  * Botón `[ Guardar Novedad ]`.

```
+-----------------------------------------------------------------------------+
| REGISTRO DE NOVEDAD E INSPECCIÓN FÍSICA - Placa: ABC-123                    |
+-----------------------------------------------------------------------------+
| Momento: [ Entrada ]                                                        |
| Tipo de Incidente: [ Golpe / Abolladura en Carrocería                    v ]|
| Severidad: [ ( ) Baja  (•) Media  ( ) Alta ]                                |
|                                                                             |
| Descripción Detallada del Estado del Vehículo:                              |
| +-------------------------------------------------------------------------+ |
| | Presenta rayón longitudinal de aprox. 15 cm en la puerta trasera        | |
| | derecha y hendidura menor sobre el guardabarros. Conductor informado.   | |
| +-------------------------------------------------------------------------+ |
|                                                                             |
| [ Guardar Novedad y Anexar al Ticket ]               [ Descartar ]          |
+-----------------------------------------------------------------------------+
```

---

#### Pantalla 4: Registro de Salida y Liquidación de Tarifa (HU-05, HU-06)
* **Componentes:**
  * Búsqueda por placa o folio de ticket.
  * Desglose cronológico: Hora de entrada, hora de salida actual, total minutos transcurridos, horas/fracciones liquidadas.
  * Si es mensualidad activa: Desglose indica `$0 COP - Abonado Mensual`.
  * Si es visitante: Cálculo automático del total a pagar en tipografía destacada.
  * Selector de método de pago: *Efectivo, Nequi, Daviplata, Tarjeta*.
  * Botón `[ Procesar Pago, Liberar Celda e Imprimir Recibo ]`.

```
+---------------------------------------------------------------------------------------+
| REGISTRO DE SALIDA Y LIQUIDACIÓN                                                      |
+---------------------------------------------------------------------------------------+
| Digite Placa o Escanee Folio:                                                         |
| [ ABC123                                                  ] [ BUSCAR ]                |
|                                                                                       |
| DETALLES DE LA ESTANCIA:                                                              |
| • Folio Ticket: TCK-20261025-0012            • Celda: A-01                            |
| • Hora Entrada: 10:15 AM                     • Hora Salida: 12:45 PM                  |
| • Tiempo Transcurrido: 2 horas 30 min        • Fracciones a Cobrar: 3 horas           |
|                                                                                       |
| TOTAL A PAGAR:                                                                        |
| $ 12.000 COP                                                                          |
|                                                                                       |
| Medio de Pago:                                                                        |
| [ (•) Efectivo ]    [ ( ) Nequi ]    [ ( ) Daviplata ]    [ ( ) Tarjeta Débito ]      |
|                                                                                       |
| [ CONFIRMAR SALIDA Y LIBERAR CELDA A-01 ]              [ IMPRIMIR COMPROBANTE ]       |
+---------------------------------------------------------------------------------------+
```

---

### 3. Enlace y Guía de Construcción en Figma

Para los diseñadores y evaluadores que deseen revisar o extender los archivos en Figma:
1. **Frame Canvas:** Tamaño estándar recomendado **Desktop 1440 x 1024 px** (o Tablet 1024 x 768 px).
2. **Auto Layout:** Todos los componentes de formularios y tarjetas de celdas utilizan `Auto Layout (Shift + A)` con espaciado vertical de `16px` y `padding: 24px`.
3. **Componentes Reutilizables:**
   * `Cell-Card`: Variantes por estado (Default/Libre, Occupied, Maintenance).
   * `Badge-Subscription`: Variante Activa (Verde) y Vencida (Rojo/Ámbar).
   * `Button-Primary`: Estado Default, Hover y Disabled.
4. **Enlace al Proyecto Figma:** Puede vincularse a la biblioteca de prototipos de Autos Colombia o importarse usando el paquete de componentes web interactivos provisto en la carpeta `src/public`.
