# Iteración 3 – Gestión de Pagos
## Parqueadero "Autos Colombia"

---

## 1. Requerimientos Funcionales

| ID | Nombre | Descripción |
|----|--------|-------------|
| RF-IT3-01 | Registrar pago de acceso ocasional | El sistema debe permitir registrar el pago de un vehículo de acceso ocasional al momento de registrar su salida, seleccionando el método de pago (Efectivo, Nequi, Daviplata, Tarjeta) y capturando la referencia de transacción cuando aplique. |
| RF-IT3-02 | Registrar pago de mensualidad nueva | El sistema debe permitir crear una mensualidad para un cliente registrado, asignando vehículo, celda, fecha de inicio, valor mensual y registrar el pago de activación. |
| RF-IT3-03 | Renovar mensualidad existente | El sistema debe permitir renovar una mensualidad vencida o próxima a vencer, extendiendo la fecha fin y registrando el pago de renovación con el método elegido. |
| RF-IT3-04 | Consultar historial de pagos | El sistema debe listar todos los pagos registrados con filtros por rango de fecha, método de pago, tipo (acceso/mensualidad) y placa del vehículo. |
| RF-IT3-05 | Ver detalle de pago | El sistema debe mostrar el detalle completo de un pago: número de comprobante, fecha/hora, monto, método, referencia, datos del vehículo y operador que registró. |
| RF-IT3-06 | Anular pago | El sistema debe permitir al administrador anular un pago, registrando el motivo y el usuario que realizó la anulación. Solo se pueden anular pagos cuyo registro de acceso esté aún activo (EN_CURSO). |
| RF-IT3-07 | Listar suscripciones de mensualidad | El sistema debe listar todas las mensualidades con su estado (ACTIVA, VENCIDA, CANCELADA), datos del cliente, vehículo y celda asignada, con filtros por estado. |
| RF-IT3-08 | Cancelar mensualidad | El sistema debe permitir cancelar una mensualidad activa, cambiando su estado a CANCELADA y liberando la celda asignada. |
| RF-IT3-09 | Reimprimir comprobante de pago | El sistema debe permitir regenerar y mostrar el comprobante de cualquier pago registrado, con número de comprobante, fecha, monto y datos del vehículo. |
| RF-IT3-10 | Reporte de ingresos del día | El sistema debe generar un reporte de todos los ingresos de un día específico, agrupados por método de pago, con totales y conteo de transacciones. |
| RF-IT3-11 | Reporte de ingresos del mes | El sistema debe generar un reporte mensual de ingresos con desglose por día, resumen por método de pago y total acumulado del mes. |
| RF-IT3-12 | Reporte de mensualidades próximas a vencer | El sistema debe identificar y listar las mensualidades que vencen en los próximos N días (configurable), mostrando datos del cliente y la fecha de vencimiento. |

---

## 2. Requerimientos No Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-IT3-01 | Seguridad | Solo usuarios con rol ADMINISTRADOR pueden anular pagos y cancelar mensualidades. |
| RNF-IT3-02 | Integridad | Cada pago debe generar un número de comprobante único con formato `CP-{YYYYMMDD}-{secuencial}`. No se puede eliminar un pago físicamente de la base de datos. |
| RNF-IT3-03 | Rendimiento | Los reportes de ingresos deben generarse en menos de 2 segundos para rangos de hasta 90 días. |
| RNF-IT3-04 | Trazabilidad | Toda anulación de pago debe quedar registrada con el ID del usuario que la realizó, fecha/hora y motivo. |
| RNF-IT3-05 | Disponibilidad | El módulo de pagos debe estar disponible 24/7 para consultas. Las operaciones de registro solo están disponibles cuando el sistema tiene al menos un operador activo. |
| RNF-IT3-06 | Usabilidad | Los formularios de pago deben validar los campos requeridos antes de enviar, mostrando mensajes de error claros en español. |
| RNF-IT3-07 | Consistencia | El estado de una mensualidad debe actualizarse automáticamente a VENCIDA cuando su fecha_fin sea anterior a la fecha actual. |
| RNF-IT3-08 | Auditabilidad | El sistema debe registrar el ID del operador/administrador en cada transacción de pago para fines de auditoría. |

---

## 3. Actores del Sistema (Iteración 3)

| Actor | Descripción |
|-------|-------------|
| Administrador | Gestiona pagos, mensualidades, reportes y puede anular transacciones |
| Operador | Registra pagos de acceso ocasional y consulta historial |
| Cliente Abonado | Tiene mensualidad activa; beneficiario de los pagos de mensualidad |

---

## 4. Casos de Uso Principales

| ID CU | Nombre | Actor Principal |
|-------|--------|-----------------|
| CU-IT3-01 | Registrar Pago de Mensualidad | Administrador / Operador |
| CU-IT3-02 | Consultar Historial de Pagos | Administrador / Operador |
| CU-IT3-03 | Anular Pago | Administrador |
| CU-IT3-04 | Crear Mensualidad | Administrador |
| CU-IT3-05 | Renovar Mensualidad | Administrador / Operador |
| CU-IT3-06 | Cancelar Mensualidad | Administrador |
| CU-IT3-07 | Generar Reporte de Ingresos | Administrador |
| CU-IT3-08 | Ver Mensualidades Próximas a Vencer | Administrador |
| CU-IT3-09 | Reimprimir Comprobante | Administrador / Operador |
