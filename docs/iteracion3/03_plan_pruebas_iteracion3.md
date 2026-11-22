# Plan de Pruebas Resumido – Iteración 3: Gestión de Pagos
## Parqueadero "Autos Colombia"

---

## 1. Información General

| Campo | Detalle |
|-------|---------|
| Proyecto | Parqueadero Autos Colombia |
| Iteración | 3 – Gestión de Pagos |
| Responsable | Equipo de Desarrollo |
| Fecha | Noviembre 2026 |
| Ambiente | Node.js + Express + SQLite (localhost:3000) |

---

## 2. Alcance de las Pruebas

Cubrir todos los requerimientos funcionales RF-IT3-01 a RF-IT3-12:
- Registro de pago de mensualidades
- Consulta y filtrado del historial de pagos
- Anulación de pagos
- Gestión de mensualidades (crear, renovar, cancelar)
- Reportes de ingresos (diario y mensual)
- Alertas de vencimiento

---

## 3. Casos de Prueba

### CP-IT3-01: Registrar pago al confirmar salida de vehículo
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-01 / RF-IT3-01 |
| **Precondición** | Existe vehículo "ABC-123" con registro EN_CURSO |
| **Pasos** | 1. POST /api/acceso/confirmar-salida con placa, método "EFECTIVO" |
| **Resultado Esperado** | HTTP 200, pago registrado con comprobante "CP-YYYYMMDD-XXX", registro en estado COMPLETADO |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-02: Pago con referencia de transacción (Nequi)
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-01 / RF-IT3-01 |
| **Precondición** | Vehículo con registro EN_CURSO |
| **Pasos** | 1. POST /api/acceso/confirmar-salida con metodo "NEQUI", referencia "NEQ123456" |
| **Resultado Esperado** | HTTP 200, campo referencia_transaccion almacenado en la BD |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-03: Crear mensualidad nueva exitosamente
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-02 / RF-IT3-02 |
| **Precondición** | Cliente registrado con vehículo, celda disponible |
| **Pasos** | 1. POST /api/mensualidades con id_cliente, id_vehiculo, id_celda, fecha_inicio, valor_mensual, metodo_pago |
| **Resultado Esperado** | HTTP 201, mensualidad con estado ACTIVA, celda cambia a MENSUALIDAD, pago registrado |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-04: Error al crear mensualidad con celda no disponible
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-02 / RF-IT3-02 |
| **Precondición** | Celda "A-01" tiene estado MENSUALIDAD |
| **Pasos** | 1. POST /api/mensualidades con id_celda de "A-01" |
| **Resultado Esperado** | HTTP 400, mensaje "La celda seleccionada no está disponible" |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-05: Renovar mensualidad vencida
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-03 / RF-IT3-03 |
| **Precondición** | Mensualidad con estado VENCIDA |
| **Pasos** | 1. PATCH /api/mensualidades/{id}/renovar con metodo_pago, referencia |
| **Resultado Esperado** | HTTP 200, mensualidad estado ACTIVA, fecha_fin + 30 días, nuevo pago registrado |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-06: Error al renovar mensualidad cancelada
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-03 / RF-IT3-03 |
| **Precondición** | Mensualidad con estado CANCELADA |
| **Pasos** | 1. PATCH /api/mensualidades/{id}/renovar |
| **Resultado Esperado** | HTTP 400, mensaje "No se puede renovar una mensualidad cancelada" |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-07: Listar historial de pagos sin filtros
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-04 / RF-IT3-04 |
| **Precondición** | Existen pagos en el sistema |
| **Pasos** | 1. GET /api/pagos |
| **Resultado Esperado** | HTTP 200, array de pagos con campos: id_pago, numero_comprobante, monto_pagado, metodo_pago, fecha_hora_pago |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-08: Filtrar pagos por método de pago
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-04 / RF-IT3-04 |
| **Precondición** | Existen pagos con método NEQUI |
| **Pasos** | 1. GET /api/pagos?metodo=NEQUI |
| **Resultado Esperado** | HTTP 200, solo pagos con metodo_pago = "NEQUI" |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-09: Filtrar pagos por rango de fechas
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-04 / RF-IT3-04 |
| **Precondición** | Existen pagos en distintas fechas |
| **Pasos** | 1. GET /api/pagos?fecha_inicio=2026-11-01&fecha_fin=2026-11-30 |
| **Resultado Esperado** | HTTP 200, solo pagos dentro del rango de fechas especificado |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-10: Ver detalle de pago específico
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-05 / RF-IT3-05 |
| **Precondición** | Existe pago con id_pago = 1 |
| **Pasos** | 1. GET /api/pagos/1 |
| **Resultado Esperado** | HTTP 200, objeto con todos los campos del pago incluyendo datos de vehículo y operador |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-11: Ver detalle de pago inexistente
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-05 / RF-IT3-05 |
| **Precondición** | No existe pago con id = 9999 |
| **Pasos** | 1. GET /api/pagos/9999 |
| **Resultado Esperado** | HTTP 404, mensaje "Pago no encontrado" |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-12: Anular pago (administrador)
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-06 / RF-IT3-06 |
| **Precondición** | Existe pago con registro EN_CURSO, usuario admin |
| **Pasos** | 1. PATCH /api/pagos/{id}/anular con id_usuario (admin) y motivo |
| **Resultado Esperado** | HTTP 200, pago marcado como ANULADO con fecha y motivo registrados |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-13: Anular pago sin ser administrador
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-06 / RF-IT3-06 |
| **Precondición** | Usuario con rol OPERADOR intenta anular |
| **Pasos** | 1. PATCH /api/pagos/{id}/anular con id_usuario del operador |
| **Resultado Esperado** | HTTP 403, mensaje "No tiene permisos para anular pagos" |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-14: Listar todas las mensualidades
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-07 / RF-IT3-07 |
| **Precondición** | Existen mensualidades en el sistema |
| **Pasos** | 1. GET /api/mensualidades |
| **Resultado Esperado** | HTTP 200, array con mensualidades incluyendo datos de cliente, vehículo y celda |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-15: Filtrar mensualidades por estado ACTIVA
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-07 / RF-IT3-07 |
| **Precondición** | Existen mensualidades con distintos estados |
| **Pasos** | 1. GET /api/mensualidades?estado=ACTIVA |
| **Resultado Esperado** | HTTP 200, solo mensualidades con estado ACTIVA |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-16: Cancelar mensualidad activa
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-08 / RF-IT3-08 |
| **Precondición** | Mensualidad con estado ACTIVA y celda asignada |
| **Pasos** | 1. PATCH /api/mensualidades/{id}/cancelar |
| **Resultado Esperado** | HTTP 200, mensualidad estado CANCELADA, celda cambia a LIBRE |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-17: Reporte de ingresos del día
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-09 / RF-IT3-10 |
| **Precondición** | Existen pagos en la fecha consultada |
| **Pasos** | 1. GET /api/reportes/ingresos-dia?fecha=2026-11-22 |
| **Resultado Esperado** | HTTP 200, objeto con total_ingresos, total_transacciones y desglose por metodo_pago |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-18: Reporte de ingresos del mes
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-09 / RF-IT3-11 |
| **Precondición** | Existen pagos en el mes consultado |
| **Pasos** | 1. GET /api/reportes/ingresos-mes?year=2026&month=11 |
| **Resultado Esperado** | HTTP 200, objeto con desglose diario, resumen por método y total mensual |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-19: Mensualidades próximas a vencer
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-10 / RF-IT3-12 |
| **Precondición** | Mensualidad vence en menos de 7 días |
| **Pasos** | 1. GET /api/mensualidades/proximas-a-vencer?dias=7 |
| **Resultado Esperado** | HTTP 200, listado con nombre cliente, teléfono, placa y fecha_fin |
| **Resultado Obtenido** | ✅ Pasa |

### CP-IT3-20: Reporte diario sin transacciones
| Campo | Detalle |
|-------|---------|
| **Historia** | HU-IT3-09 / RF-IT3-10 |
| **Precondición** | No hay pagos en la fecha consultada |
| **Pasos** | 1. GET /api/reportes/ingresos-dia?fecha=2020-01-01 |
| **Resultado Esperado** | HTTP 200, total_ingresos: 0, total_transacciones: 0 |
| **Resultado Obtenido** | ✅ Pasa |

---

## 4. Resumen de Cobertura

| Módulo | Total CP | Pasan | Fallan |
|--------|----------|-------|--------|
| Pago en salida | 2 | 2 | 0 |
| Mensualidades | 7 | 7 | 0 |
| Historial de pagos | 4 | 4 | 0 |
| Anulación | 2 | 2 | 0 |
| Reportes | 3 | 3 | 0 |
| Vencimiento | 2 | 2 | 0 |
| **TOTAL** | **20** | **20** | **0** |

---

## 5. Cobertura de Requerimientos

| RF | CP asociados | Cubierto |
|----|-------------|---------|
| RF-IT3-01 | CP-IT3-01, CP-IT3-02 | ✅ |
| RF-IT3-02 | CP-IT3-03, CP-IT3-04 | ✅ |
| RF-IT3-03 | CP-IT3-05, CP-IT3-06 | ✅ |
| RF-IT3-04 | CP-IT3-07, CP-IT3-08, CP-IT3-09 | ✅ |
| RF-IT3-05 | CP-IT3-10, CP-IT3-11 | ✅ |
| RF-IT3-06 | CP-IT3-12, CP-IT3-13 | ✅ |
| RF-IT3-07 | CP-IT3-14, CP-IT3-15 | ✅ |
| RF-IT3-08 | CP-IT3-16 | ✅ |
| RF-IT3-09 | CP-IT3-10 | ✅ |
| RF-IT3-10 | CP-IT3-17, CP-IT3-20 | ✅ |
| RF-IT3-11 | CP-IT3-18 | ✅ |
| RF-IT3-12 | CP-IT3-19 | ✅ |
