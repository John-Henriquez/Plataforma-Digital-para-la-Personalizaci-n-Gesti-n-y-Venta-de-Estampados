export function generateInventoryReason(action) {
  const reasons = {
    create: "Ingreso inicial de stock",
    adjust: "Ajuste de inventario",
    delete: "Salida por eliminación",
    sale: "Salida por venta",
    return: "Ingreso por devolución",
    update: "Actualización de información del ítem",
  };

  return reasons[action] || "Movimiento generado automáticamente";
}
