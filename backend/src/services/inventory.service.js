"use strict";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";
import { AppDataSource } from "../config/configDb.js";

// GET ONE ITEM STOCK
export async function getItemStockService(query) {
  try {
    const { id, itemTypeId, color, size } = query;

    const repo = AppDataSource.getRepository(ItemStock);

    const itemFound = await repo.findOne({
      where: [
        { id },
        { itemType: { id: itemTypeId }, color, size },
      ],
      relations: ["itemType"],
    });

    if (!itemFound) return [null, "Stock no encontrado"];

    return [itemFound, null];
  } catch (error) {
    console.error("Error al obtener stock:", error);
    return [null, "Error interno del servidor"];
  }
}

// GET ALL ITEM STOCKS
export async function getAllItemStockService() {
  try {
    const repo = AppDataSource.getRepository(ItemStock);

    const results = await repo.find({ relations: ["itemType"] });

    if (!results || results.length === 0)
      return [null, "No hay stock disponible"];

    return [results, null];
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [null, "Error interno del servidor"];
  }
}

// CREATE ITEM STOCK
export async function createItemStockService(data) {
  try {
    const itemStockRepo = AppDataSource.getRepository(ItemStock);
    const itemTypeRepo = AppDataSource.getRepository(ItemType);

    const itemType = await itemTypeRepo.findOne({ where: { id: data.itemTypeId } });
    if (!itemType) return [null, "Tipo de artículo no encontrado"];

    const newStock = itemStockRepo.create({
      color: data.color,
      size: data.size,
      quantity: data.quantity,
      itemType,
    });

    const saved = await itemStockRepo.save(newStock);
    return [saved, null];
  } catch (error) {
    console.error("Error al crear stock:", error);
    return [null, "Error al crear stock"];
  }
}

// UPDATE ITEM STOCK
export async function updateItemStockService(query, data) {
  try {
    const { id } = query;
    const itemStockRepo = AppDataSource.getRepository(ItemStock);

    const item = await itemStockRepo.findOne({ where: { id }, relations: ["itemType"] });
    if (!item) return [null, "Stock no encontrado"];

    if (data.itemTypeId) {
      const itemTypeRepo = AppDataSource.getRepository(ItemType);
      const itemType = await itemTypeRepo.findOne({ where: { id: data.itemTypeId } });
      if (!itemType) return [null, "Tipo de artículo no encontrado"];
      item.itemType = itemType;
    }

    item.color = data.color ?? item.color;
    item.size = data.size ?? item.size;
    item.quantity = data.quantity ?? item.quantity;
    item.updatedAt = new Date();

    const updated = await itemStockRepo.save(item);
    return [updated, null];
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return [null, "Error al actualizar stock"];
  }
}

// DELETE ITEM STOCK
export async function deleteItemStockService(query) {
  try {
    const { id } = query;
    const repo = AppDataSource.getRepository(ItemStock);

    const item = await repo.findOne({ where: { id }, relations: ["itemType"] });
    if (!item) return [null, "Stock no encontrado"];

    const deleted = await repo.remove(item);
    return [deleted, null];
  } catch (error) {
    console.error("Error al eliminar stock:", error);
    return [null, "Error al eliminar stock"];
  }
}
