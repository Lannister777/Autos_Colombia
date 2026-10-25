// Script para construir el archivo oficial StarUML .mdj con todos los modelos y diagramas
const fs = require('fs');
const path = require('path');

function generateStarUMLProject() {
  const projectId = "AAAAAAGG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Project Root
  const project = {
    "_type": "Project",
    "_id": projectId,
    "name": "AutosColombia_Software_StarUML",
    "ownedElements": []
  };

  // 1. MODELO DE ARQUITECTURA
  const archModelId = "AAAAARCH" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const archDiagramId = "AAAAARCHDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const archModel = {
    "_type": "UMLModel",
    "_id": archModelId,
    "_parent": { "$ref": projectId },
    "name": "Arquitectura del Sistema",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": archDiagramId,
        "_parent": { "$ref": archModelId },
        "name": "Diagrama de Arquitectura en Capas (Tier Architecture)",
        "ownedViews": []
      }
    ]
  };

  // 2. MODELO DE CASOS DE USO
  const ucModelId = "AAAAAUC" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const ucDiagramId = "AAAAAUCDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  
  const ucModel = {
    "_type": "UMLModel",
    "_id": ucModelId,
    "_parent": { "$ref": projectId },
    "name": "Modelo de Casos de Uso - Iteración 1",
    "ownedElements": [
      {
        "_type": "UMLUseCaseDiagram",
        "_id": ucDiagramId,
        "_parent": { "$ref": ucModelId },
        "name": "Casos de Uso - Entrada y Salida de Vehículos",
        "ownedViews": []
      }
    ]
  };

  // 3. MODELO DE CLASES
  const classModelId = "AAAAACLASS" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const classDiagramId = "AAAAACLASSDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const classModel = {
    "_type": "UMLModel",
    "_id": classModelId,
    "_parent": { "$ref": projectId },
    "name": "Modelo de Clases del Dominio",
    "ownedElements": [
      {
        "_type": "UMLClassDiagram",
        "_id": classDiagramId,
        "_parent": { "$ref": classModelId },
        "name": "Diagrama de Clases - Gestión Operativa",
        "ownedViews": []
      }
    ]
  };

  // 4. MODELO DE PAQUETES
  const pkgModelId = "AAAAAPKG" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const pkgDiagramId = "AAAAAPKGDIAG" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const pkgModel = {
    "_type": "UMLModel",
    "_id": pkgModelId,
    "_parent": { "$ref": projectId },
    "name": "Modelo de Paquetes Arquitectónicos",
    "ownedElements": [
      {
        "_type": "UMLPackageDiagram",
        "_id": pkgDiagramId,
        "_parent": { "$ref": pkgModelId },
        "name": "Diagrama de Paquetes y Modularidad",
        "ownedViews": []
      }
    ]
  };

  // Helper function to build classes
  function createUMLClass(parentRef, name, attributes, operations) {
    const classId = "CLS_" + name + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      "_type": "UMLClass",
      "_id": classId,
      "_parent": parentRef,
      "name": name,
      "attributes": attributes.map(attr => ({
        "_type": "UMLAttribute",
        "_id": "ATTR_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": attr.name,
        "visibility": attr.vis || "public",
        "type": attr.type
      })),
      "operations": operations.map(op => ({
        "_type": "UMLOperation",
        "_id": "OP_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        "name": op.name,
        "visibility": op.vis || "public",
        "parameters": (op.params || []).map(p => ({
          "_type": "UMLParameter",
          "_id": "PARAM_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
          "name": p.name,
          "type": p.type
        }))
      }))
    };
  }

  // Adding classes to classModel
  const classesData = [
    {
      name: "Vehiculo",
      attributes: [
        { name: "idVehiculo", type: "Integer", vis: "private" },
        { name: "placa", type: "String", vis: "private" },
        { name: "tipoVehiculo", type: "TipoVehiculo", vis: "private" },
        { name: "marca", type: "String", vis: "private" },
        { name: "color", type: "String", vis: "private" }
      ],
      operations: [
        { name: "validarPlaca", vis: "public" },
        { name: "tieneMensualidadVigente", vis: "public" },
        { name: "getPlaca", vis: "public" }
      ]
    },
    {
      name: "Celda",
      attributes: [
        { name: "idCelda", type: "Integer", vis: "private" },
        { name: "codigoCelda", type: "String", vis: "private" },
        { name: "tipoPermitido", type: "TipoVehiculo", vis: "private" },
        { name: "estado", type: "EstadoCelda", vis: "private" },
        { name: "sector", type: "String", vis: "private" }
      ],
      operations: [
        { name: "asignar", vis: "public" },
        { name: "liberar", vis: "public" },
        { name: "estaLibre", vis: "public" }
      ]
    },
    {
      name: "RegistroAcceso",
      attributes: [
        { name: "idRegistro", type: "Integer", vis: "private" },
        { name: "folioTicket", type: "String", vis: "private" },
        { name: "fechaHoraEntrada", type: "DateTime", vis: "private" },
        { name: "fechaHoraSalida", type: "DateTime", vis: "private" },
        { name: "modalidad", type: "ModalidadAcceso", vis: "private" },
        { name: "minutosEstancia", type: "Integer", vis: "private" },
        { name: "valorTotal", type: "Decimal", vis: "private" },
        { name: "estado", type: "EstadoAcceso", vis: "private" }
      ],
      operations: [
        { name: "calcularMinutosEstancia", vis: "public" },
        { name: "liquidarSalida", vis: "public", params: [{ name: "tarifa", type: "Tarifa" }] },
        { name: "generarTicket", vis: "public" }
      ]
    },
    {
      name: "Novedad",
      attributes: [
        { name: "idNovedad", type: "Integer", vis: "private" },
        { name: "momento", type: "MomentoRegistro", vis: "private" },
        { name: "tipoNovedad", type: "String", vis: "private" },
        { name: "descripcion", type: "String", vis: "private" },
        { name: "severidad", type: "NivelSeveridad", vis: "private" },
        { name: "fechaHora", type: "DateTime", vis: "private" }
      ],
      operations: [
        { name: "registrarObservacion", vis: "public" },
        { name: "obtenerDetalle", vis: "public" }
      ]
    },
    {
      name: "Cliente",
      attributes: [
        { name: "idCliente", type: "Integer", vis: "private" },
        { name: "documento", type: "String", vis: "private" },
        { name: "nombreCompleto", type: "String", vis: "private" },
        { name: "telefono", type: "String", vis: "private" },
        { name: "email", type: "String", vis: "private" }
      ],
      operations: [
        { name: "consultarMensualidades", vis: "public" },
        { name: "vincularVehiculo", vis: "public" }
      ]
    },
    {
      name: "Mensualidad",
      attributes: [
        { name: "idMensualidad", type: "Integer", vis: "private" },
        { name: "fechaInicio", type: "Date", vis: "private" },
        { name: "fechaFin", type: "Date", vis: "private" },
        { name: "valorMensual", type: "Decimal", vis: "private" },
        { name: "estado", type: "EstadoMensualidad", vis: "private" }
      ],
      operations: [
        { name: "estaVigente", vis: "public" },
        { name: "renovar", vis: "public" }
      ]
    },
    {
      name: "Tarifa",
      attributes: [
        { name: "idTarifa", type: "Integer", vis: "private" },
        { name: "tipoVehiculo", type: "TipoVehiculo", vis: "private" },
        { name: "valorHoraFraccion", type: "Decimal", vis: "private" },
        { name: "valorDia", type: "Decimal", vis: "private" },
        { name: "valorMensualidad", type: "Decimal", vis: "private" },
        { name: "tiempoGraciaMinutos", type: "Integer", vis: "private" }
      ],
      operations: [
        { name: "calcularCobro", vis: "public", params: [{ name: "minutos", type: "Integer" }] }
      ]
    },
    {
      name: "Pago",
      attributes: [
        { name: "idPago", type: "Integer", vis: "private" },
        { name: "numeroComprobante", type: "String", vis: "private" },
        { name: "montoPagado", type: "Decimal", vis: "private" },
        { name: "metodoPago", type: "MetodoPago", vis: "private" },
        { name: "fechaHoraPago", type: "DateTime", vis: "private" }
      ],
      operations: [
        { name: "procesarPago", vis: "public" },
        { name: "generarRecibo", vis: "public" }
      ]
    },
    {
      name: "Usuario",
      attributes: [
        { name: "idUsuario", type: "Integer", vis: "private" },
        { name: "nombreCompleto", type: "String", vis: "private" },
        { name: "username", type: "String", vis: "private" },
        { name: "rol", type: "RolUsuario", vis: "private" }
      ],
      operations: [
        { name: "autenticar", vis: "public" },
        { name: "tienePermiso", vis: "public" }
      ]
    }
  ];

  classesData.forEach(c => {
    classModel.ownedElements.push(createUMLClass({ "$ref": classModelId }, c.name, c.attributes, c.operations));
  });

  // Adding Actors & Use Cases to ucModel
  const actors = [
    { name: "Operador de Parqueadero" },
    { name: "Administrador del Sistema" },
    { name: "Cliente / Abonado" }
  ];
  actors.forEach(a => {
    ucModel.ownedElements.push({
      "_type": "UMLActor",
      "_id": "ACT_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": ucModelId },
      "name": a.name
    });
  });

  const useCases = [
    { name: "CU01 - Registrar Entrada de Vehículo" },
    { name: "CU02 - Validar Suscripción de Mensualidad" },
    { name: "CU03 - Asignar Celda Disponible" },
    { name: "CU04 - Registrar Novedades e Inspección Física" },
    { name: "CU05 - Emitir Ticket de Entrada" },
    { name: "CU06 - Registrar Salida de Vehículo" },
    { name: "CU07 - Calcular Duración y Tarifa" },
    { name: "CU08 - Liberar Celda de Parqueo" },
    { name: "CU09 - Gestionar Pago y Recibo" },
    { name: "CU10 - Monitorear Tablero de Celdas en Tiempo Real" },
    { name: "CU11 - Administrar Tarifas y Mensualidades" }
  ];
  useCases.forEach(uc => {
    ucModel.ownedElements.push({
      "_type": "UMLUseCase",
      "_id": "UC_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": ucModelId },
      "name": uc.name
    });
  });

  // Adding Packages to pkgModel
  const packages = [
    { name: "com.autoscolombia.presentation", desc: "Controladores Web, Vistas HTML5/Tailwind, Rutas API" },
    { name: "com.autoscolombia.service", desc: "Servicios de Negocio: AccesoService, CeldaService, BillingService, NovedadService" },
    { name: "com.autoscolombia.domain", desc: "Entidades del Negocio, Objetos de Valor, Interfaces de Repositorio" },
    { name: "com.autoscolombia.infrastructure", desc: "Persistencia SQLite, Conexiones a Base de Datos, Adaptadores de Impresión" }
  ];
  packages.forEach(p => {
    pkgModel.ownedElements.push({
      "_type": "UMLPackage",
      "_id": "PKG_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      "_parent": { "$ref": pkgModelId },
      "name": p.name
    });
  });

  // Assemble full project
  project.ownedElements = [archModel, ucModel, classModel, pkgModel];

  return project;
}

const starUmlProject = generateStarUMLProject();
const outputPath = path.join(__dirname, 'docs', 'staruml', 'autos_colombia_model.mdj');
fs.writeFileSync(outputPath, JSON.stringify(starUmlProject, null, 2), 'utf-8');
console.log('Archivo StarUML creado exitosamente en:', outputPath);
