export function generateInventoryReason(action) {
  const metadata = {
    create: {
      operation: "create",
      reason: "Ingreso inicial de stock",
    },
    adjust: {
      operation: "adjust",
      reason: "Ajuste de inventario",
    },
    update: {
      operation: "update",
      reason: "Actualización de información del ítem",
    },
    deactivate: {
      operation: "deactivate",
      reason: "Desactivación lógica del ítem",
    },
    reactivate: {
      operation: "reactivate",
      reason: "Reactivación del ítem previamente desactivado",
    },
    delete: {
      operation: "delete",
      reason: "Eliminación permanente del ítem",
    },
    sale: {
      operation: "sale",
      reason: "Salida por venta",
    },
    return: {
      operation: "return",
      reason: "Ingreso por devolución",
    },
    purge: {
      operation: "purge",
      reason: "Eliminación masiva de ítems inactivos",
    },
  };

 const result = metadata[action] || {
    operation: "unspecified",
    reason: "Movimiento generado automáticamente",
  };

  if (result.operation === "unspecified") {
    console.warn(`No se encontró un metadata válido para la acción: ${action}`);
  }

  return result;
}

export function createItemSnapshot(itemStock) {
  return {
    snapshotItemName: itemStock?.itemType?.name || "Desconocido",
    snapshotItemColor: itemStock?.hexColor || null,
    snapshotItemSize: itemStock?.size || null,
    snapshotPrice: itemStock?.price || null,
  };
}


