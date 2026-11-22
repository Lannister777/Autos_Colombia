// Script para construir el archivo oficial StarUML .mdj con todos los modelos y diagramas de las Iteraciones 1, 2 y 3
const fs = require('fs');
const path = require('path');

function generateStarUMLProject() {
  const projectId = "AAAAAAGG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const project = {
    "_type": "Project",
    "_id": projectId,
    "name": "AutosColombia_Software_StarUML_Iteraciones_1_2_y_3",
    "ownedElements": []
  };

  // 1. MODELO DE ARQUITECTURA
  const archModelId = "AAAAARCH" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const archDiagramId = "AAAAARCHDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const archModel = {
    "_type": "UMLModel",
    "_id": archModelId,
    "_parent": { "$ref": projectId },
    "name": "Arquitectura del Sistema (Tier Architecture)",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": archDiagramId,
        "_parent": { "$ref": archModelId },
        "name": "Diagrama de Arquitectura en Capas",
        "ownedViews": []
      }
    ]
  };

  // 2. MODELO DE CASOS DE USO - ITERACIÓN 1
  const uc1ModelId = "AAAAAUC1" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const uc1DiagramId = "AAAAAUC1DIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const uc1Model = {
    "_type": "UMLModel",
    "_id": uc1ModelId,
    "_parent": { "$ref": projectId },
    "name": "Casos de Uso - Iteración 1 (Entrada y Salida de Vehículos)",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": uc1DiagramId,
        "_parent": { "$ref": uc1ModelId },
        "name": "Diagrama Casos de Uso - Entrada y Salida",
        "ownedViews": []
      }
    ]
  };

  const useCasesIt1 = [
    "CU01 - Registrar Entrada de Vehículo",
    "CU02 - Validar Suscripción de Mensualidad",
    "CU03 - Asignar Celda Disponible",
    "CU04 - Registrar Novedades e Inspección Física",
    "CU05 - Emitir Ticket de Entrada",
    "CU06 - Registrar Salida de Vehículo",
    "CU07 - Calcular Duración y Tarifa",
    "CU08 - Liberar Celda de Parqueo",
    "CU09 - Gestionar Pago y Recibo",
    "CU10 - Monitorear Tablero de Celdas en Tiempo Real"
  ];
  useCasesIt1.forEach(name => {
    uc1Model.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC1_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc1ModelId },
      "name": name
    });
  });

  // 3. MODELO DE CASOS DE USO - ITERACIÓN 2
  const uc2ModelId = "AAAAAUC2" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const uc2DiagramId = "AAAAAUC2DIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const uc2Model = {
    "_type": "UMLModel",
    "_id": uc2ModelId,
    "_parent": { "$ref": projectId },
    "name": "Casos de Uso - Iteración 2 (Gestión de Usuarios y Celdas)",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": uc2DiagramId,
        "_parent": { "$ref": uc2ModelId },
        "name": "Diagrama Casos de Uso - Usuarios y Celdas",
        "ownedViews": []
      }
    ]
  };

  const useCasesIt2 = [
    "CU-IT2-01: Iniciar Sesión / Autenticar Usuario",
    "CU-IT2-02: Registrar Nuevo Usuario Operador",
    "CU-IT2-03: Editar Información y Rol de Usuario",
    "CU-IT2-04: Activar o Desactivar Usuario",
    "CU-IT2-05: Cambiar Contraseña de Cuenta",
    "CU-IT2-06: Consultar y Filtrar Listado de Usuarios",
    "CU-IT2-07: Registrar Nueva Celda de Parqueo",
    "CU-IT2-08: Modificar Configuración de Celda",
    "CU-IT2-09: Cambiar Estado a Mantenimiento",
    "CU-IT2-10: Habilitar Celda desde Mantenimiento",
    "CU-IT2-11: Eliminar Celda sin Historial",
    "CU-IT2-12: Generar Reporte de Capacidad y Ocupación"
  ];
  useCasesIt2.forEach(name => {
    uc2Model.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC2_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc2ModelId },
      "name": name
    });
  });

  // 4. MODELO DE CASOS DE USO - ITERACIÓN 3 (GESTIÓN DE PAGOS)
  const uc3ModelId = "AAAAAUC3" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const uc3DiagramId = "AAAAAUC3DIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const uc3Model = {
    "_type": "UMLModel",
    "_id": uc3ModelId,
    "_parent": { "$ref": projectId },
    "name": "Casos de Uso - Iteración 3 (Gestión de Pagos, Mensualidades y Reportes)",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": uc3DiagramId,
        "_parent": { "$ref": uc3ModelId },
        "name": "Diagrama Casos de Uso - Pagos y Finanzas",
        "ownedViews": []
      }
    ]
  };

  const useCasesIt3 = [
    "CU-IT3-01: Registrar Pago de Salida de Vehículo",
    "CU-IT3-02: Registrar Pago y Activar Mensualidad Nueva",
    "CU-IT3-03: Renovar Mensualidad Vencida",
    "CU-IT3-04: Consultar y Filtrar Historial de Pagos",
    "CU-IT3-05: Ver Detalle y Reimprimir Comprobante",
    "CU-IT3-06: Anular Comprobante de Pago por Auditoría",
    "CU-IT3-07: Listar y Filtrar Suscripciones de Abonados",
    "CU-IT3-08: Cancelar Mensualidad Activa y Liberar Celda",
    "CU-IT3-09: Generar Reporte Diario de Ingresos y Cierre de Caja",
    "CU-IT3-10: Generar Balance Mensual de Cobros",
    "CU-IT3-11: Consultar Alertas de Vencimiento de Abonados"
  ];
  useCasesIt3.forEach(name => {
    uc3Model.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC3_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc3ModelId },
      "name": name
    });
  });

  // Actores Globales
  const actors = ["Operador de Caseta", "Administrador del Sistema", "Cliente Abonado"];
  actors.forEach(name => {
    const actorObj = {
      "_type": "UMLActor",
      "_id": "ACT_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": uc3ModelId },
      "name": name
    };
    uc1Model.ownedElements.push(actorObj);
    uc2Model.ownedElements.push(actorObj);
    uc3Model.ownedElements.push(actorObj);
  });

  // 5. MODELO DE CLASES (DOMINIO COMPLETO ITERACIONES 1, 2 Y 3)
  const classModelId = "AAAAACLASS" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const classDiagramId = "AAAAACLASSDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const classModel = {
    "_type": "UMLModel",
    "_id": classModelId,
    "_parent": { "$ref": projectId },
    "name": "Modelo de Clases del Dominio Completo",
    "ownedElements": [
      {
        "_type": "UMLClassDiagram",
        "_id": classDiagramId,
        "_parent": { "$ref": classModelId },
        "name": "Diagrama de Clases del Dominio",
        "ownedViews": []
      }
    ]
  };

  const domainClasses = [
    {
      name: "Usuario",
      attributes: ["+ id_usuario: Integer", "+ nombre_completo: String", "+ username: String", "+ password_hash: String", "+ rol: RolUsuario", "+ activo: Boolean", "+ fecha_creacion: DateTime"],
      operations: ["+ autenticar(clave): Boolean", "+ cambiarClave(nuevaClave): void", "+ toggleEstado(): void"]
    },
    {
      name: "Celda",
      attributes: ["+ id_celda: Integer", "+ codigo_celda: String", "+ tipo_permitido: TipoVehiculo", "+ estado: EstadoCelda", "+ sector: String"],
      operations: ["+ ocupar(): void", "+ liberar(): void", "+ ponerEnMantenimiento(): void", "+ habilitar(): void"]
    },
    {
      name: "Vehiculo",
      attributes: ["+ id_vehiculo: Integer", "+ placa: String", "+ tipo_vehiculo: TipoVehiculo", "+ marca: String", "+ linea_modelo: String", "+ color: String"],
      operations: ["+ tieneMensualidadActiva(): Boolean"]
    },
    {
      name: "Cliente",
      attributes: ["+ id_cliente: Integer", "+ documento: String", "+ tipo_documento: String", "+ nombre_completo: String", "+ telefono: String", "+ email: String", "+ direccion: String"],
      operations: ["+ obtenerVehiculos(): List<Vehiculo>", "+ obtenerMensualidades(): List<Mensualidad>"]
    },
    {
      name: "RegistroAcceso",
      attributes: ["+ id_registro: Integer", "+ folio_ticket: String", "+ fecha_hora_entrada: DateTime", "+ fecha_hora_salida: DateTime", "+ modalidad: ModalidadAcceso", "+ minutos_estancia: Integer", "+ valor_total: Decimal", "+ estado: EstadoAcceso"],
      operations: ["+ calcularMinutos(): Integer", "+ liquidarSalida(tarifa): Decimal", "+ registrarSalida(): void"]
    },
    {
      name: "Tarifa",
      attributes: ["+ id_tarifa: Integer", "+ tipo_vehiculo: TipoVehiculo", "+ valor_hora_fraccion: Decimal", "+ valor_dia: Decimal", "+ valor_mensualidad: Decimal", "+ tiempo_gracia_minutos: Integer", "+ activo: Boolean"],
      operations: ["+ calcularCobro(minutos): Decimal"]
    },
    {
      name: "Mensualidad",
      attributes: ["+ id_mensualidad: Integer", "+ fecha_inicio: Date", "+ fecha_fin: Date", "+ valor_mensual: Decimal", "+ estado: EstadoMensualidad"],
      operations: ["+ verificarVigencia(): Boolean", "+ renovar(dias, valor): void", "+ cancelar(): void", "+ diasRestantes(): Integer"]
    },
    {
      name: "Pago",
      attributes: ["+ id_pago: Integer", "+ numero_comprobante: String", "+ monto_pagado: Decimal", "+ metodo_pago: MetodoPago", "+ referencia_transaccion: String", "+ fecha_hora_pago: DateTime", "+ estado: EstadoPago", "+ motivo_anulacion: String"],
      operations: ["+ generarComprobante(): String", "+ anular(motivo, idAdmin): void", "+ reimprimir(): String"]
    },
    {
      name: "Novedad",
      attributes: ["+ id_novedad: Integer", "+ momento: MomentoNovedad", "+ tipo_novedad: String", "+ descripcion: String", "+ severidad: SeveridadNovedad", "+ fecha_hora: DateTime"],
      operations: ["+ registrar(): void"]
    }
  ];

  domainClasses.forEach(cls => {
    const classId = "CLS_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const umlClass = {
      "_type": "UMLClass",
      "_id": classId,
      "_parent": { "$ref": classModelId },
      "name": cls.name,
      "attributes": cls.attributes.map(attr => ({
        "_type": "UMLAttribute",
        "_id": "ATTR_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": attr
      })),
      "operations": cls.operations.map(op => ({
        "_type": "UMLOperation",
        "_id": "OP_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": op
      }))
    };
    classModel.ownedElements.push(umlClass);
  });

  // 6. MODELO DE DIAGRAMAS DE SECUENCIA (ITERACIONES 1, 2 Y 3)
  const seqModelId = "AAAAASEQ" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const seqDiagramId = "AAAAASEQDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const seqModel = {
    "_type": "UMLModel",
    "_id": seqModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagramas de Secuencia (Iteraciones 1, 2 y 3)",
    "ownedElements": [
      {
        "_type": "UMLSequenceDiagram",
        "_id": seqDiagramId,
        "_parent": { "$ref": seqModelId },
        "name": "Interacciones Dinámicas - Caseta, Usuarios, Celdas y Pagos",
        "ownedViews": []
      }
    ]
  };

  // 7. MODELO DE DIAGRAMA DE COMPONENTES (ITERACIONES 1, 2 Y 3)
  const compModelId = "AAAAACOMP" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const compDiagramId = "AAAAACOMPDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const compModel = {
    "_type": "UMLModel",
    "_id": compModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagrama de Componentes (Iteraciones 1, 2 y 3)",
    "ownedElements": [
      {
        "_type": "UMLComponentDiagram",
        "_id": compDiagramId,
        "_parent": { "$ref": compModelId },
        "name": "Arquitectura de Componentes del Sistema Completo",
        "ownedViews": []
      }
    ]
  };

  // 8. MODELO DE PAQUETES
  const pkgModelId = "AAAAAPKG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const pkgDiagramId = "AAAAAPKGDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const pkgModel = {
    "_type": "UMLModel",
    "_id": pkgModelId,
    "_parent": { "$ref": projectId },
    "name": "Diagrama de Paquetes del Sistema",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": pkgDiagramId,
        "_parent": { "$ref": pkgModelId },
        "name": "Estructura de Paquetes Modulares",
        "ownedViews": []
      }
    ]
  };

  // Ensamblar proyecto completo
  project.ownedElements = [archModel, uc1Model, uc2Model, uc3Model, classModel, seqModel, compModel, pkgModel];

  return project;
}

const starUmlProject = generateStarUMLProject();
const outputPath = path.join(__dirname, 'docs', 'staruml', 'autos_colombia_model.mdj');
fs.writeFileSync(outputPath, JSON.stringify(starUmlProject, null, 2), 'utf-8');
console.log('Archivo StarUML .mdj generado exitosamente con Iteraciones 1, 2 y 3 en:', outputPath);
