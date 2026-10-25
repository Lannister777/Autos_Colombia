# Entregable 1 & 2: Requerimientos del Sistema e Historias de Usuario
## Parqueadero "Autos Colombia" - Iteración 1: Gestión de Entrada y Salida de Vehículos

---

### 1. Especificación de Requerimientos del Sistema

#### 1.1. Contexto Operacional y Alcance
El parqueadero **"Autos Colombia"** presta servicios integrales de parqueo bajo dos modalidades principales:
1. **Modalidad por Mensualidad (Abonados):** Clientes registrados con pago recurrente mensual para uno o más vehículos, con derecho a celda asignada o celda flotante según plan.
2. **Modalidad Ocasional / Por Fracción (Visitantes):** Vehículos que ingresan y cancelan una tarifa calculada según el tiempo efectivo de estancia (minutos/horas).

En la **Iteración 1**, el alcance se centra en la **Gestión de la entrada y salida de vehículos**, garantizando el control de acceso en tiempo real, validación de estado de mensualidad, asignación dinámica de celdas libres, registro riguroso de novedades físicas del vehículo (inspección de ingreso) y liquidación de cobro al egreso.

---

#### 1.2. Requerimientos Funcionales (RF)

| Código | Nombre del Requerimiento | Descripción | Prioridad | Actor Responsable |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | **Registro de Entrada de Vehículo** | El sistema debe permitir registrar el ingreso de un vehículo capturando placa, tipo de vehículo (Automóvil, Motocicleta, Camioneta, Bicicleta), fecha/hora exacta automática y observaciones iniciales. | Alta (Must) | Operador de Parqueadero |
| **RF-02** | **Validación Automática de Mensualidad** | Al digitar la placa en la entrada, el sistema debe consultar en la base de datos si el vehículo pertenece a un cliente con mensualidad vigente al día, indicando el nombre del cliente y estado de la cuenta. | Alta (Must) | Sistema / Operador |
| **RF-03** | **Asignación y Control de Celda** | El sistema debe validar la disponibilidad de celdas según el tipo de vehículo y permitir la asignación automática (primera celda libre disponible) o manual de una celda específica, cambiando su estado inmediatamente a "Ocupada". | Alta (Must) | Operador de Parqueadero |
| **RF-04** | **Registro de Novedades de Ingreso** | El sistema debe permitir registrar novedades e incidentes físicos del vehículo al momento de la entrada (rayones, abolladuras, espejos rotos, objetos de valor dejados, kilometraje), asociándolos a la transacción de acceso. | Alta (Must) | Operador de Parqueadero |
| **RF-05** | **Generación de Ticket de Entrada** | El sistema debe generar un comprobante o ticket de entrada (digital o para impresión térmica) con número de folio, placa, tipo de vehículo, celda asignada, fecha y hora de ingreso, y código de verificación. | Alta (Must) | Sistema / Operador |
| **RF-06** | **Consulta y Búsqueda de Vehículos en Parqueadero** | El sistema debe permitir buscar y filtrar vehículos que actualmente se encuentren dentro del parqueadero por placa, tipo de vehículo, celda asignada o rango horario de entrada. | Media (Should) | Operador / Administrador |
| **RF-07** | **Registro de Salida de Vehículo** | El sistema debe permitir registrar la salida de un vehículo ingresando su placa o número de ticket, calculando automáticamente la duración total de la estancia (horas y minutos transcurridos). | Alta (Must) | Operador de Parqueadero |
| **RF-08** | **Liquidación Automática de Tarifas** | El sistema debe calcular el valor a pagar aplicando la tarifa correspondiente al tipo de vehículo y tiempo de permanencia. Si el vehículo cuenta con mensualidad activa vigente, el valor a cobrar debe liquidarse en $0 COP con registro de exoneración. | Alta (Must) | Sistema / Operador |
| **RF-09** | **Liberación Automática de Celda** | Al confirmar la salida y el cobro del vehículo, el sistema debe cambiar de forma inmediata el estado de la celda asociada a "Libre" o "Disponible", actualizando el tablero de ocupación en tiempo real. | Alta (Must) | Sistema |
| **RF-10** | **Emisión de Comprobante de Pago y Facturación** | El sistema debe registrar la transacción de pago (medio de pago: Efectivo, Nequi/Daviplata, Tarjeta) y emitir el recibo de salida con desglose de tiempo y valor cobrado. | Alta (Must) | Operador de Parqueadero |
| **RF-11** | **Monitoreo Gráfico de Celdas** | El sistema debe proporcionar un tablero visual interactivo que muestre el mapa de celdas del parqueadero organizadas por tipo de vehículo y estado (Libre, Ocupada, Mantenimiento). | Media (Should) | Operador / Administrador |
| **RF-12** | **Registro de Novedades durante la Estancia o Salida** | El sistema debe permitir registrar novedades adicionales reportadas durante la permanencia o al momento de la salida antes de liberar el vehículo. | Media (Should) | Operador de Parqueadero |

---

#### 1.3. Requerimientos No Funcionales (RNF)

| Código | Categoría | Descripción y Métrica |
| :--- | :--- | :--- |
| **RNF-01** | **Rendimiento** | El tiempo de respuesta para el registro de entrada, salida y consulta de placa no debe superar los **1.5 segundos** bajo condiciones de operación normales. |
| **RNF-02** | **Disponibilidad** | El sistema debe garantizar una disponibilidad del **99.5%** durante las horas operativas del parqueadero (24/7). |
| **RNF-03** | **Seguridad y Control de Acceso** | El sistema debe contar con autenticación de usuarios basada en roles (Operador y Administrador), restringiendo la modificación de tarifas o anulación de tickets solo a administradores. |
| **RNF-04** | **Integridad y Trazabilidad de Datos** | Todas las transacciones de entrada, salida, novedades y pagos deben quedar registradas en un log inmutable de auditoría con fecha, hora y usuario que operó la transacción. No se permite borrado físico destructivo. |
| **RNF-05** | **Usabilidad e Interfaz (UI/UX)** | La interfaz debe ser receptiva (responsive), de alto contraste para visibilidad en caseta, permitiendo operar los formularios de entrada y salida mediante atajos de teclado y escaneo rápido. |
| **RNF-06** | **Compatibilidad y Portabilidad** | La solución debe ser accesible desde cualquier navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox) y compatible con sistemas operativos Windows 10/11 y Linux. |
| **RNF-07** | **Mantenibilidad** | El código fuente debe seguir una arquitectura modular por capas (Separation of Concerns), documentado bajo estándares de código limpio y con separación de controladores, servicios y persistencia. |
| **RNF-08** | **Persistencia y Respaldo** | La base de datos debe implementar restricciones de clave foránea e índices sobre placas y fechas de acceso, con capacidad de exportación o respaldo periódico. |

---

### 2. Historias de Usuario (HU)

Las historias de usuario han sido diseñadas bajo los principios **INVEST** (Independiente, Negociable, Valiosa, Estimable, Pequeña y Comprobable) e incorporan criterios de aceptación en lenguaje **Gherkin** (*Given - When - Then*).

---

#### HU-01: Registro de Entrada de Vehículo Ocasional
* **ID:** HU-01
* **Título:** Registro de entrada para vehículos ocasionales por fracción
* **Rol:** Como **Operador de Parqueadero**
* **Quiero:** Registrar el ingreso de un vehículo visitante ingresando su placa, tipo de vehículo y asignando una celda disponible.
* **Para:** Iniciar el conteo del tiempo de estacionamiento, reservar el espacio físico y entregar un comprobante de ingreso al conductor.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Ingreso exitoso de vehículo con celdas disponibles**
    * **Dado que** el operador se encuentra en la pantalla de registro de entrada y existen celdas libres para el tipo de vehículo seleccionado (ej. Automóvil).
    * **Cuando** el operador ingresa la placa "ABC123", selecciona el tipo de vehículo y confirma la entrada.
    * **Entonces** el sistema valida que no exista un vehículo activo con la misma placa dentro del parqueadero, asigna automáticamente la celda libre (ej. "A-01"), cambia el estado de la celda a "Ocupada", genera el registro de acceso con fecha/hora actual y muestra el ticket de entrada.
  * **Escenario 2: Intento de ingreso sin celdas disponibles**
    * **Dado que** no existen celdas disponibles para el tipo de vehículo seleccionado.
    * **Cuando** el operador intenta registrar el vehículo.
    * **Entonces** el sistema bloquea la acción, muestra una alerta visual: *"No hay celdas disponibles para la categoría seleccionada"* y no genera ningún registro.
  * **Escenario 3: Placa ya registrada adentro del parqueadero**
    * **Dado que** la placa "ABC123" ya cuenta con un registro de entrada sin salida registrada.
    * **Cuando** el operador ingresa dicha placa.
    * **Entonces** el sistema notifica: *"El vehículo con placa ABC123 ya se encuentra registrado dentro de las instalaciones en la celda A-01"*.

---

#### HU-02: Validación y Registro de Entrada para Cliente con Mensualidad
* **ID:** HU-02
* **Título:** Detección y acceso de vehículos con mensualidad vigente
* **Rol:** Como **Operador de Parqueadero**
* **Quiero:** Que el sistema reconozca automáticamente si la placa ingresada pertenece a un cliente con suscripción mensual activa.
* **Para:** Agilizar el ingreso del abonado, garantizar su cupo preferencial y asegurar que no se le liquide cobro por fracción indebidamente.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Mensualidad vigente al día**
    * **Dado que** el cliente "Juan Pérez" tiene suscripción activa hasta el 30 del mes corriente para el vehículo "KLT456".
    * **Cuando** el operador digita la placa "KLT456".
    * **Entonces** el sistema muestra una insignia verde *"Cliente Mensualidad Activa - Juan Pérez"*, precarga sus datos y permite registrar la entrada asignando celda sin costo de fracción.
  * **Escenario 2: Mensualidad vencida**
    * **Dado que** la mensualidad del vehículo "XYZ789" venció hace 3 días.
    * **Cuando** el operador digita la placa.
    * **Entonces** el sistema muestra una advertencia en color naranja: *"Mensualidad Vencida el DD/MM/AAAA. Se liquidará como tarifa plena de visitante o debe renovar suscripción"*.

---

#### HU-03: Asignación y Visualización de Celdas en Tiempo Real
* **ID:** HU-03
* **Título:** Tablero interactivo de celdas por estado y categoría
* **Rol:** Como **Operador o Administrador**
* **Quiero:** Visualizar el plano gráfico de celdas distribuidas por sectores y categorías (Carros, Motos, Camionetas).
* **Para:** Identificar de un vistazo los espacios disponibles, dirigir a los conductores rápidamente y monitorear el porcentaje de ocupación.
* **Prioridad:** Media | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Monitoreo de disponibilidad**
    * **Dado que** el operador accede al panel de control de celdas.
    * **Entonces** se muestran tarjetas de colores: Verde (Libre con número de celda), Rojo (Ocupada con placa del vehículo) y Amarillo (Mantenimiento/Reservada).
  * **Escenario 2: Conteo de disponibilidad por tipo**
    * **Dado que** hay 20 celdas de automóviles (15 ocupadas) y 10 de motos (4 ocupadas).
    * **Entonces** el panel muestra los contadores: *Automóviles: 5 Libres / 15 Ocupadas (75% ocupación)* y *Motos: 6 Libres / 4 Ocupadas (40% ocupación)*.

---

#### HU-04: Registro de Novedades y Estado Físico del Vehículo
* **ID:** HU-04
* **Título:** Registro de novedades e inspección física al ingresar
* **Rol:** Como **Operador de Parqueadero**
* **Quiero:** Registrar observaciones e incidentes físicos (rayones, golpes, accesorios faltantes o pertenencias dejadas) asociados a un vehículo al momento de ingresar o durante su estancia.
* **Para:** Deslindar responsabilidades del parqueadero "Autos Colombia" ante posibles reclamos infundados de los clientes al momento del retiro.
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Registro de novedad al ingreso**
    * **Dado que** un vehículo ingresa con una abolladura visible en la puerta lateral izquierda.
    * **Cuando** el operador selecciona la opción *"Registrar Novedad"*, escribe el tipo de novedad ("Golpe/Rayón"), la descripción detallada y el nivel de severidad.
    * **Entonces** la novedad queda vinculada al ticket de entrada con fecha, hora y usuario responsable, imprimiéndose la observación en el ticket del cliente.
  * **Escenario 2: Consulta de historial de novedades por placa**
    * **Dado que** un cliente reclama un daño en su vehículo a la salida.
    * **Cuando** el operador consulta el historial del vehículo.
    * **Entonces** el sistema despliega el registro histórico de novedades fechadas donde conste el estado en el que ingresó.

---

#### HU-05: Registro de Salida y Cobro por Fracción de Tiempo
* **ID:** HU-05
* **Título:** Registro de egreso, cálculo de tiempo y cobro de tarifa
* **Rol:** Como **Operador de Parqueadero**
* **Quiero:** Registrar la salida de un vehículo ocasional ingresando su placa o ticket para liquidar el importe exacto según el tiempo de permanencia.
* **Para:** Realizar el cobro justo conforme a las tarifas vigentes, liberar la celda y entregar el comprobante de salida.
* **Prioridad:** Alta | **Estimación:** 5 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Salida de vehículo ocasional con cobro exitoso**
    * **Dado que** el vehículo "ABC123" ingresó a las 08:00 AM y la salida se registra a las 10:45 AM (Duración: 2 horas 45 minutos) y la tarifa es $4.000 COP por hora o fracción.
    * **Cuando** el operador ingresa la placa "ABC123".
    * **Entonces** el sistema liquida 3 fracciones/horas equivalentes a $12.000 COP, solicita el método de pago (Efectivo/Digital), registra el pago, cambia la celda a "Libre" y genera el recibo de salida.
  * **Escenario 2: Intento de salida de placa inexistente en parqueadero**
    * **Dado que** se ingresa una placa que no tiene registro de ingreso activo.
    * **Cuando** se solicita liquidar salida.
    * **Entonces** el sistema muestra un mensaje de error: *"La placa ingresada no se encuentra activa en el parqueadero"*.

---

#### HU-06: Liquidación de Salida para Abonado Mensual
* **ID:** HU-06
* **Título:** Registro de salida sin cobro para clientes con mensualidad
* **Rol:** Como **Operador de Parqueadero**
* **Quiero:** Registrar la salida de un vehículo con mensualidad activa de forma automática sin cobro por minutos.
* **Para:** Registrar el egreso en la bitácora de control de accesos y liberar inmediatamente la celda flotante utilizada.
* **Prioridad:** Alta | **Estimación:** 3 Puntos de Historia (SP)
* **Criterios de Aceptación:**
  * **Escenario 1: Salida de abonado al día**
    * **Dado que** el vehículo "KLT456" con mensualidad activa registrada se presenta a la salida.
    * **Cuando** el operador ingresa la placa.
    * **Entonces** el sistema muestra *"Total a Pagar: $0 COP (Cubierto por Mensualidad N° 102 - Juan Pérez)"*, registra la salida y libera la celda.
