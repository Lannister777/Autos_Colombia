# Entregable 6: Diagramas de Casos de Uso (STARUML)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Actores del Sistema

1. **Operador de Parqueadero (Actor Principal):** Responsable de registrar las entradas y salidas de vehículos, verificar el estado de las mensualidades, inspeccionar daños para registrar novedades y cobrar las tarifas liquidadas en la caseta.
2. **Administrador del Sistema (Actor Secundario / Gestión):** Supervisa el funcionamiento operativo, configura tarifas, gestiona las cuentas de usuarios, administra el inventario de celdas y audita los reportes de novedades e ingresos.
3. **Cliente / Abonado (Actor Externo):** Conductor o propietario del vehículo que solicita el servicio ocasional o cuenta con una mensualidad activa.

---

### 2. Diagrama de Casos de Uso

```mermaid
flowchart LR
    subgraph ACTORES["Actores"]
        OPERADOR(("Operador de Caseta"))
        ADMIN(("Administrador"))
    end

    subgraph SISTEMA["Parqueadero Autos Colombia - Sistema de Control"]
        CU01(["CU-01: Registrar Entrada de Vehículo"])
        CU02(["CU-02: Validar Mensualidad Activa"])
        CU03(["CU-03: Asignar Celda Disponible"])
        CU04(["CU-04: Registrar Novedad / Inspección"])
        CU05(["CU-05: Emitir Ticket de Ingreso"])
        
        CU06(["CU-06: Registrar Salida de Vehículo"])
        CU07(["CU-07: Calcular Duración y Tarifa"])
        CU08(["CU-08: Liberar Celda de Parqueo"])
        CU09(["CU-09: Gestionar Cobro y Factura"])
        
        CU10(["CU-10: Monitorear Celdas en Tiempo Real"])
        CU11(["CU-11: Configurar Tarifas y Celdas"])
    end

    OPERADOR --> CU01
    OPERADOR --> CU06
    OPERADOR --> CU10
    OPERADOR --> CU04

    ADMIN --> CU10
    ADMIN --> CU11
    ADMIN --> CU04

    CU01 -.->|"<<include>>"| CU02
    CU01 -.->|"<<include>>"| CU03
    CU01 -.->|"<<include>>"| CU05
    CU04 -.->|"<<extend>>"| CU01

    CU06 -.->|"<<include>>"| CU02
    CU06 -.->|"<<include>>"| CU07
    CU06 -.->|"<<include>>"| CU08
    CU06 -.->|"<<include>>"| CU09
```

---

### 3. Ficha de Especificación Detallada: CU-01 Registrar Entrada

| Atributo | Detalle |
| :--- | :--- |
| **Identificador** | **CU-01** |
| **Nombre** | **Registrar Entrada de Vehículo** |
| **Actor Principal** | Operador de Parqueadero |
| **Propósito** | Registrar el acceso formal del vehículo al parqueadero, asignando celda y emitiendo comprobante. |
| **Precondiciones** | 1. El operador ha iniciado sesión en el sistema.<br>2. Existen celdas libres para el tipo de vehículo a ingresar. |
| **Disparador** | Un vehículo llega a la barrera/caseta de ingreso de "Autos Colombia". |
| **Flujo Principal (Happy Path)** | 1. El operador ingresa la placa del vehículo.<br>2. El sistema valida si el vehículo cuenta con mensualidad activa (**CU-02**).<br>3. El operador confirma el tipo de vehículo (Automóvil, Moto, Camioneta, Bici).<br>4. El sistema busca y asigna automáticamente una celda libre del tipo requerido (**CU-03**).<br>5. La celda cambia a estado "OCUPADA".<br>6. El sistema crea el registro de acceso con fecha y hora actual.<br>7. El sistema emite e imprime el ticket de entrada con folio y código QR (**CU-05**). |
| **Flujos Alternos** | **3a. Vehículo con daños visibles o pertenencias:** El operador ejecuta la extensión **CU-04 (Registrar Novedad)**, redactando la observación antes de emitir el ticket.<br>**4a. No hay celdas libres:** El sistema notifica al operador que el parqueadero está lleno para ese tipo de vehículo. El proceso se cancela sin generar registro.<br>**1a. Placa ya registrada con entrada activa:** El sistema alerta que el vehículo ya se encuentra adentro del parqueadero y rechaza el registro. |
| **Postcondiciones** | Se crea el registro de entrada, se decrementa la disponibilidad de celdas y se genera el ticket. |

---

### 4. Ficha de Especificación Detallada: CU-06 Registrar Salida

| Atributo | Detalle |
| :--- | :--- |
| **Identificador** | **CU-06** |
| **Nombre** | **Registrar Salida de Vehículo y Liquidación** |
| **Actor Principal** | Operador de Parqueadero |
| **Propósito** | Registrar el egreso del vehículo, calcular el cobro según tiempo de permanencia, registrar el pago y liberar la celda. |
| **Precondiciones** | El vehículo debe tener un registro de acceso en estado "EN_CURSO". |
| **Disparador** | El conductor se presenta en la caseta de salida. |
| **Flujo Principal** | 1. El operador digita la placa del vehículo o escanea el folio del ticket.<br>2. El sistema recupera el registro de acceso y valida si tiene mensualidad activa (**CU-02**).<br>3. El sistema calcula los minutos transcurridos y liquida la tarifa según la categoría (**CU-07**).<br>4. El operador solicita el importe al cliente y selecciona el medio de pago (Efectivo/Transferencia).<br>5. El sistema registra el pago y emite el comprobante de salida (**CU-09**).<br>6. El sistema actualiza el registro a estado "FINALIZADO".<br>7. La celda asignada cambia inmediatamente a estado "LIBRE" (**CU-08**). |
| **Flujos Alternos** | **2a. Vehículo amparado por mensualidad vigente:** El sistema liquida valor a pagar en $0 COP con motivo "Mensualidad Vigente". Se emite comprobante de salida sin cobro de fracción.<br>**3a. Estancia dentro del tiempo de gracia (<= 15 min):** Si el vehículo estuvo menos del tiempo de gracia reglamentario, el cobro es $0 COP. |
| **Postcondiciones** | Celda liberada, pago registrado en caja y registro de acceso cerrado. |

---

### 5. Archivo PlantUML de Casos de Uso

```plantuml
@startuml Casos_De_Uso_Autos_Colombia
left to right direction
skinparam packageStyle rectangle

actor "Operador de Caseta" as Operador
actor "Administrador" as Admin

rectangle "Sistema Autos Colombia - Iteración 1" {
    usecase "CU-01: Registrar Entrada de Vehículo" as UC1
    usecase "CU-02: Validar Mensualidad Activa" as UC2
    usecase "CU-03: Asignar Celda Disponible" as UC3
    usecase "CU-04: Registrar Novedad / Daño" as UC4
    usecase "CU-05: Emitir Ticket de Ingreso" as UC5
    
    usecase "CU-06: Registrar Salida de Vehículo" as UC6
    usecase "CU-07: Calcular Duración y Tarifa" as UC7
    usecase "CU-08: Liberar Celda" as UC8
    usecase "CU-09: Gestionar Cobro y Pago" as UC9
    
    usecase "CU-10: Monitorear Tablero de Celdas" as UC10
    usecase "CU-11: Gestionar Tarifas y Celdas" as UC11
}

Operador --> UC1
Operador --> UC6
Operador --> UC10
Operador --> UC4

Admin --> UC10
Admin --> UC11
Admin --> UC4

UC1 ..> UC2 : <<include>>
UC1 ..> UC3 : <<include>>
UC1 ..> UC5 : <<include>>
UC4 ..> UC1 : <<extend>>

UC6 ..> UC2 : <<include>>
UC6 ..> UC7 : <<include>>
UC6 ..> UC8 : <<include>>
UC6 ..> UC9 : <<include>>
@enduml
```
