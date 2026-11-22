# Historias de Usuario – Iteración 3: Gestión de Pagos
## Parqueadero "Autos Colombia"

---

## HU-IT3-01: Registrar pago al momento de la salida del vehículo

**Como** operador del parqueadero,  
**quiero** registrar el método de pago al confirmar la salida de un vehículo,  
**para** que el cobro quede documentado con comprobante en el sistema.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Pago en salida de vehículo

  Scenario: Registrar pago exitoso con efectivo
    Given que el vehículo con placa "ABC-123" tiene un registro de acceso EN_CURSO
    And la tarifa para moto es $3.500/hora
    When el operador confirma la salida y selecciona método "EFECTIVO"
    Then el sistema debe registrar el pago con el monto calculado
    And generar un número de comprobante con formato "CP-YYYYMMDD-XXX"
    And marcar el registro de acceso como COMPLETADO

  Scenario: Pago con referencia de transferencia
    Given que el vehículo con placa "XYZ-789" debe pagar $45.000
    When el operador selecciona método "NEQUI" e ingresa referencia "NEQ123456"
    Then el sistema debe guardar la referencia de transacción junto al pago
    And mostrar el comprobante con todos los datos
```

**Prioridad:** Alta  
**Estimación:** 3 puntos  
**RF asociados:** RF-IT3-01

---

## HU-IT3-02: Crear mensualidad para cliente abonado

**Como** administrador del parqueadero,  
**quiero** registrar una nueva mensualidad para un cliente,  
**para** asignarle una celda fija y recibir su pago mensual de forma organizada.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Crear nueva mensualidad

  Scenario: Crear mensualidad exitosamente
    Given que existe el cliente "Santiago Morales" con un vehículo registrado
    And la celda "A-02" está disponible (LIBRE)
    When el administrador crea una mensualidad con fecha inicio hoy, valor $280.000 y método EFECTIVO
    Then el sistema debe crear el registro de mensualidad con estado ACTIVA
    And asignar la celda "A-02" como MENSUALIDAD
    And registrar el pago con el comprobante correspondiente

  Scenario: Error al crear mensualidad con celda ocupada
    Given que la celda "A-01" tiene estado MENSUALIDAD
    When el administrador intenta crear una mensualidad asignando la celda "A-01"
    Then el sistema debe mostrar el error "La celda seleccionada no está disponible"
    And no debe crear la mensualidad
```

**Prioridad:** Alta  
**Estimación:** 5 puntos  
**RF asociados:** RF-IT3-02

---

## HU-IT3-03: Renovar mensualidad vencida

**Como** administrador del parqueadero,  
**quiero** renovar la mensualidad de un cliente abonado,  
**para** extender su acceso mensual y registrar el nuevo pago.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Renovar mensualidad

  Scenario: Renovar mensualidad vencida exitosamente
    Given que la mensualidad #5 del cliente "Valeria Duque" tiene estado VENCIDA
    When el administrador la renueva por 1 mes adicional con método "DAVIPLATA" y referencia "DAV999"
    Then el sistema debe actualizar la fecha_fin sumando 30 días a la fecha actual
    And cambiar el estado de la mensualidad a ACTIVA
    And registrar el nuevo pago con comprobante

  Scenario: Intentar renovar mensualidad cancelada
    Given que la mensualidad #3 tiene estado CANCELADA
    When el administrador intenta renovarla
    Then el sistema debe mostrar "No se puede renovar una mensualidad cancelada"
```

**Prioridad:** Alta  
**Estimación:** 3 puntos  
**RF asociados:** RF-IT3-03

---

## HU-IT3-04: Consultar historial de pagos con filtros

**Como** administrador u operador,  
**quiero** consultar el historial de todos los pagos con filtros por fecha, método y tipo,  
**para** hacer seguimiento de las transacciones del parqueadero.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Historial de pagos

  Scenario: Ver todos los pagos del día
    Given que existen pagos registrados en la fecha actual
    When el usuario consulta el historial filtrando por la fecha de hoy
    Then el sistema debe listar todos los pagos del día con: comprobante, placa, monto, método y hora

  Scenario: Filtrar pagos por método NEQUI
    Given que existen pagos registrados con diferentes métodos
    When el usuario filtra por método "NEQUI"
    Then el sistema debe mostrar únicamente los pagos realizados con Nequi

  Scenario: Sin resultados en el filtro
    Given que no hay pagos en el rango de fechas seleccionado
    When el usuario aplica el filtro
    Then el sistema debe mostrar "No se encontraron pagos con los filtros aplicados"
```

**Prioridad:** Alta  
**Estimación:** 3 puntos  
**RF asociados:** RF-IT3-04, RF-IT3-05

---

## HU-IT3-05: Ver detalle y reimprimir comprobante de pago

**Como** operador del parqueadero,  
**quiero** ver el detalle completo de cualquier pago y poder reimprimir su comprobante,  
**para** responder a consultas de clientes y llevar el control de transacciones.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Detalle y reimpresión de comprobante

  Scenario: Ver detalle de un pago de acceso
    Given que existe el pago con comprobante "CP-20261122-001"
    When el usuario hace clic en "Ver Detalle"
    Then el sistema debe mostrar: comprobante, fecha/hora, placa, tipo vehículo, duración, monto, método y operador

  Scenario: Reimprimir comprobante
    Given que el detalle del pago está visible
    When el usuario hace clic en "Reimprimir Comprobante"
    Then el sistema debe mostrar una vista imprimible con todos los datos del pago
```

**Prioridad:** Media  
**Estimación:** 2 puntos  
**RF asociados:** RF-IT3-05, RF-IT3-09

---

## HU-IT3-06: Anular pago (solo administrador)

**Como** administrador del parqueadero,  
**quiero** poder anular un pago registrado por error,  
**para** corregir equivocaciones y mantener la integridad contable del sistema.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Anulación de pago

  Scenario: Anular pago exitosamente
    Given que existe el pago #7 asociado a un registro de acceso EN_CURSO
    And el usuario autenticado tiene rol ADMINISTRADOR
    When el administrador selecciona "Anular pago" e ingresa motivo "Error en método de pago"
    Then el sistema debe marcar el pago como ANULADO con fecha/hora de anulación y motivo
    And registrar el ID del administrador que realizó la acción

  Scenario: Operador intenta anular un pago
    Given que el usuario autenticado tiene rol OPERADOR
    When intenta anular el pago #7
    Then el sistema debe mostrar "No tiene permisos para anular pagos"

  Scenario: Anular pago de registro ya completado
    Given que el pago #3 está asociado a un registro con estado COMPLETADO
    When el administrador intenta anularlo
    Then el sistema debe mostrar "Solo se pueden anular pagos de accesos activos"
```

**Prioridad:** Media  
**Estimación:** 3 puntos  
**RF asociados:** RF-IT3-06

---

## HU-IT3-07: Listar y filtrar mensualidades por estado

**Como** administrador del parqueadero,  
**quiero** ver todas las mensualidades con su estado actual,  
**para** identificar cuáles están activas, cuáles vencieron y cuáles fueron canceladas.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Listado de mensualidades

  Scenario: Ver todas las mensualidades activas
    Given que existen mensualidades con distintos estados
    When el administrador filtra por estado "ACTIVA"
    Then el sistema debe listar solo las mensualidades activas con: cliente, placa, celda, fecha vencimiento

  Scenario: Verificar actualización automática de estado a VENCIDA
    Given que la mensualidad #2 tiene fecha_fin anterior a hoy
    When el sistema consulta el listado
    Then debe mostrar la mensualidad #2 con estado "VENCIDA"
```

**Prioridad:** Alta  
**Estimación:** 2 puntos  
**RF asociados:** RF-IT3-07

---

## HU-IT3-08: Cancelar mensualidad activa

**Como** administrador del parqueadero,  
**quiero** cancelar la mensualidad de un cliente que ya no requiere el servicio,  
**para** liberar la celda asignada y actualizar los registros del sistema.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Cancelar mensualidad

  Scenario: Cancelar mensualidad activa
    Given que la mensualidad #4 del cliente "Santiago Morales" tiene estado ACTIVA con celda "B-01" asignada
    When el administrador confirma la cancelación
    Then el sistema debe cambiar el estado de la mensualidad a CANCELADA
    And cambiar el estado de la celda "B-01" a LIBRE

  Scenario: Cancelar mensualidad ya cancelada
    Given que la mensualidad #6 ya tiene estado CANCELADA
    When el administrador intenta cancelarla
    Then el sistema debe mostrar "La mensualidad ya se encuentra cancelada"
```

**Prioridad:** Alta  
**Estimación:** 2 puntos  
**RF asociados:** RF-IT3-08

---

## HU-IT3-09: Reporte de ingresos del día

**Como** administrador del parqueadero,  
**quiero** ver el reporte de ingresos de un día específico,  
**para** conocer cuánto se recaudó, por qué método y cuántas transacciones se realizaron.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Reporte diario de ingresos

  Scenario: Generar reporte del día con transacciones
    Given que existen pagos registrados en la fecha "2026-11-22"
    When el administrador solicita el reporte del día "2026-11-22"
    Then el sistema debe mostrar:
      | Método     | Cantidad | Total       |
      | EFECTIVO   | 5        | $125.000    |
      | NEQUI      | 2        | $60.000     |
      | Total      | 7        | $185.000    |

  Scenario: Reporte de día sin transacciones
    Given que no hay pagos en la fecha "2026-01-01"
    When el administrador solicita el reporte de esa fecha
    Then el sistema debe mostrar "No hay ingresos registrados para esta fecha"
```

**Prioridad:** Alta  
**Estimación:** 3 puntos  
**RF asociados:** RF-IT3-10

---

## HU-IT3-10: Alerta de mensualidades próximas a vencer

**Como** administrador del parqueadero,  
**quiero** ver un listado de mensualidades que vencen en los próximos días,  
**para** contactar a los clientes y gestionar las renovaciones con anticipación.

**Criterios de Aceptación (Gherkin):**
```gherkin
Feature: Alertas de vencimiento de mensualidades

  Scenario: Ver mensualidades que vencen en 7 días
    Given que la mensualidad del cliente "Valeria Duque" vence en 5 días
    When el administrador consulta las alertas de vencimiento a 7 días
    Then el sistema debe mostrar la mensualidad de "Valeria Duque" con su fecha de vencimiento y datos de contacto

  Scenario: No hay mensualidades próximas a vencer
    Given que ninguna mensualidad vence en los próximos 7 días
    When el administrador consulta las alertas
    Then el sistema debe mostrar "No hay mensualidades próximas a vencer en los próximos 7 días"
```

**Prioridad:** Media  
**Estimación:** 2 puntos  
**RF asociados:** RF-IT3-12
