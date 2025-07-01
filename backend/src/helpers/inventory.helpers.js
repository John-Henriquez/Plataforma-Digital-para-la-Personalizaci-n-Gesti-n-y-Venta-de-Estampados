export function generateInventoryReason(action) {
  const reasons = {
    create: "Ingreso inicial de stock",
    adjust: "Ajuste de inventario",
    update: "Actualización de información del ítem",
    deactivate: "Desactivación lógica del ítem",
    reactivate: "Reactivación del ítem previamente desactivado",
    delete: "Eliminación permanente del ítem",
    sale: "Salida por venta",
    return: "Ingreso por devolución",
    purge: "Eliminación masiva de ítems inactivos",
  };

  return reasons[action] || "Movimiento generado automáticamente";
}
