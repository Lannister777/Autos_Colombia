# Entregable 7: Diagrama de Clases (STARUML)
## Parqueadero "Autos Colombia" - Iteración 1

---

### 1. Descripción de Clases del Dominio y Responsabilidades

1. **`Vehiculo`**: Representa la unidad móvil que ingresa al parqueadero. Contiene la placa (identificador único natural), tipo de vehículo, marca, color y referencia al cliente si está registrado como abonado.
2. **`Celda`**: Representa el espacio físico delimitado donde se estaciona el automotor. Mantiene el estado en tiempo real (LIBRE, OCUPADA, MANTENIMIENTO) y el tipo de vehículo para el cual está dimensionada.
3. **`RegistroAcceso`**: Es la entidad transaccional central que registra la estancia de un vehículo, calculando la fecha/hora de entrada, fecha/hora de salida, duración en minutos y liquidación del valor.
4. **`Novedad`**: Registra cualquier daño físico previo (rayones, golpes, accesorios faltantes) o incidente reportado durante la estadía para deslinde de responsabilidades legales.
5. **`Cliente`**: Propietario o conductor recurrente suscrito al servicio de mensualidad.
6. **`Mensualidad`**: Suscripción temporal (generalmente 30 días) que ampara a un vehículo para ingresar sin generar cobro por minutos.
7. **`Tarifa`**: Define los costos de hora/fracción, día y mensualidad según la tipología del automotor.
8. **`Pago`**: Representa la transacción económica de salida o renovación de mensualidad, con medio de pago y folio fiscal.
9. **`Usuario` / `Operador`**: Usuario del sistema con credenciales de acceso y permisos operativos.

---

### 2. Diagrama de Clases UML

```mermaid
classDiagram
    direction TB

    class Usuario {
        -int idUsuario
        -String nombreCompleto
        -String username
        -String passwordHash
        -RolUsuario rol
        -Boolean activo
        +autenticar(user, pass) Boolean
        +tienePermiso(permiso) Boolean
    }

    class Operador {
        -String turno
        +registrarEntrada(placa, tipo) RegistroAcceso
        +registrarSalida(placa) Pago
        +registrarNovedad(novedad) void
    }

    class Administrador {
        +configurarTarifa(tarifa) void
        +crearCelda(celda) void
        +consultarAuditoria() List
    }

    class Cliente {
        -int idCliente
        -String documento
        -String tipoDoc
        -String nombreCompleto
        -String telefono
        -String email
        +consultarMensualidades() List~Mensualidad~
        +vincularVehiculo(v: Vehiculo) void
    }

    class Vehiculo {
        -int idVehiculo
        -String placa
        -TipoVehiculo tipoVehiculo
        -String marca
        -String lineaModelo
        -String color
        +validarPlaca() Boolean
        +tieneMensualidadVigente() Boolean
        +getPlaca() String
    }

    class Celda {
        -int idCelda
        -String codigoCelda
        -TipoVehiculo tipoPermitido
        -EstadoCelda estado
        -String sector
        +asignar() void
        +liberar() void
        +estaLibre() Boolean
    }

    class Mensualidad {
        -int idMensualidad
        -Date fechaInicio
        -Date fechaFin
        -Decimal valorMensual
        -EstadoMensualidad estado
        +estaVigente() Boolean
        +renovar(dias) void
    }

    class RegistroAcceso {
        -int idRegistro
        -String folioTicket
        -DateTime fechaHoraEntrada
        -DateTime fechaHoraSalida
        -ModalidadAcceso modalidad
        -int minutosEstancia
        -Decimal valorTotal
        -EstadoAcceso estado
        +calcularMinutos() int
        +liquidarSalida(tarifa: Tarifa) Decimal
        +cerrarRegistro() void
    }

    class Novedad {
        -int idNovedad
        -MomentoRegistro momento
        -String tipoNovedad
        -String descripcion
        -NivelSeveridad severidad
        -DateTime fechaHora
        +obtenerDetalle() String
    }

    class Tarifa {
        -int idTarifa
        -TipoVehiculo tipoVehiculo
        -Decimal valorHoraFraccion
        -Decimal valorDia
        -Decimal valorMensualidad
        -int tiempoGraciaMinutos
        +calcularCobro(minutos: int) Decimal
    }

    class Pago {
        -int idPago
        -String numeroComprobante
        -Decimal montoPagado
        -MetodoPago metodoPago
        -DateTime fechaHoraPago
        -String referencia
        +procesarPago() Boolean
        +imprimirRecibo() String
    }

    Usuario <|-- Operador
    Usuario <|-- Administrador

    Cliente "1" -- "0..*" Vehiculo : posee
    Cliente "1" -- "0..*" Mensualidad : suscribe
    Vehiculo "1" -- "0..*" Mensualidad : amparado_por
    
    Vehiculo "1" -- "0..*" RegistroAcceso : registra
    Celda "1" -- "0..*" RegistroAcceso : aloja
    
    RegistroAcceso "1" *-- "0..*" Novedad : contiene
    RegistroAcceso "1" -- "0..1" Pago : genera
    Mensualidad "1" -- "1..*" Pago : genera
    
    Tarifa "1" ..> RegistroAcceso : calcula
    Operador "1" ..> RegistroAcceso : atiende
```

---

### 3. Código Fuente PlantUML del Diagrama de Clases

```plantuml
@startuml Diagrama_Clases_Autos_Colombia
skinparam classAttributeIconSize 0
skinparam roundcorner 5

enum TipoVehiculo {
    AUTOMOVIL
    MOTO
    CAMIONETA
    BICICLETA
}

enum EstadoCelda {
    LIBRE
    OCUPADA
    MANTENIMIENTO
}

enum ModalidadAcceso {
    OCASIONAL
    MENSUALIDAD
}

enum EstadoAcceso {
    EN_CURSO
    FINALIZADO
}

enum MetodoPago {
    EFECTIVO
    NEQUI
    DAVIPLATA
    TARJETA
}

class Usuario {
    - idUsuario: Integer
    - nombreCompleto: String
    - username: String
    - passwordHash: String
    - rol: String
    - activo: Boolean
    + autenticar(pass: String): Boolean
}

class Operador {
    - turno: String
    + registrarEntrada(placa: String, tipo: TipoVehiculo): RegistroAcceso
    + registrarSalida(placa: String): Pago
    + registrarNovedad(n: Novedad): void
}

class Administrador {
    + configurarTarifas(): void
    + crearCeldas(): void
}

Usuario <|-- Operador
Usuario <|-- Administrador

class Cliente {
    - idCliente: Integer
    - documento: String
    - nombreCompleto: String
    - telefono: String
    - email: String
    + consultarMensualidades(): List<Mensualidad>
}

class Vehiculo {
    - idVehiculo: Integer
    - placa: String
    - tipoVehiculo: TipoVehiculo
    - marca: String
    - color: String
    + tieneMensualidadVigente(): Boolean
}

class Celda {
    - idCelda: Integer
    - codigoCelda: String
    - tipoPermitido: TipoVehiculo
    - estado: EstadoCelda
    - sector: String
    + asignar(): void
    + liberar(): void
    + estaLibre(): Boolean
}

class Mensualidad {
    - idMensualidad: Integer
    - fechaInicio: Date
    - fechaFin: Date
    - valorMensual: Decimal
    - estado: String
    + estaVigente(): Boolean
}

class RegistroAcceso {
    - idRegistro: Integer
    - folioTicket: String
    - fechaHoraEntrada: DateTime
    - fechaHoraSalida: DateTime
    - modalidad: ModalidadAcceso
    - minutosEstancia: Integer
    - valorTotal: Decimal
    - estado: EstadoAcceso
    + calcularMinutos(): Integer
    + liquidarSalida(tarifa: Tarifa): Decimal
}

class Novedad {
    - idNovedad: Integer
    - momento: String
    - tipoNovedad: String
    - descripcion: String
    - severidad: String
    - fechaHora: DateTime
}

class Tarifa {
    - idTarifa: Integer
    - tipoVehiculo: TipoVehiculo
    - valorHoraFraccion: Decimal
    - valorDia: Decimal
    - valorMensualidad: Decimal
    - tiempoGraciaMinutos: Integer
    + calcularCobro(minutos: Integer): Decimal
}

class Pago {
    - idPago: Integer
    - numeroComprobante: String
    - montoPagado: Decimal
    - metodoPago: MetodoPago
    - fechaHoraPago: DateTime
    + imprimirRecibo(): String
}

Cliente "1" o-- "0..*" Vehiculo
Cliente "1" *-- "0..*" Mensualidad
Vehiculo "1" -- "0..*" Mensualidad

Vehiculo "1" <-- "0..*" RegistroAcceso
Celda "1" <-- "0..*" RegistroAcceso
RegistroAcceso "1" *-- "0..*" Novedad
RegistroAcceso "1" --> "0..1" Pago
Tarifa ..> RegistroAcceso : aplica
@enduml
```
