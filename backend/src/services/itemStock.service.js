import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";
import InventoryMovement from "../entity/InventoryMovementSchema.js";
import { createItemSnapshot, generateInventoryReason } from "../helpers/inventory.helpers.js";

import { Not } from "typeorm";

export const itemStockService = {
  async createItemStock(itemData) {
    return await AppDataSource.transaction(async transactionalEntityManager => {
      const { itemTypeId, hexColor, size, quantity, price, images, minStock } = itemData;
      const itemStockRepo = transactionalEntityManager.getRepository(ItemStock);
      const itemTypeRepo = transactionalEntityManager.getRepository(ItemType);
      const movementRepo = transactionalEntityManager.getRepository(InventoryMovement);

      if (!itemTypeId || !hexColor || quantity == null || price == null) {
        return [null, "Faltan campos obligatorios"];
      }
      if (quantity < 0 || price < 0) {
        return [null, "La cantidad y el precio deben ser no negativos"];
      }

      const itemType = await itemTypeRepo.findOne({ 
        where: { id: itemTypeId, isActive: true } 
      });
      
      if (!itemType) {
        return [null, "Tipo de artículo no encontrado o inactivo"];
      }

      if (itemType.hasSizes && !size) {
        return [null, "Este tipo de artículo requiere especificar talla"];
      }

    const existing = await itemStockRepo.findOne({
      where: {
        itemType: { id: itemTypeId },
        hexColor,
        size: itemType.hasSizes ? size : null
      },
      relations: ["itemType"]
    });

    if (existing) {
      return [null, "Ya existe un stock con ese nombre y color"];
    }

      const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i;
      const processedImages = Array.isArray(images)
        ? images.filter(url => url && urlRegex.test(url))
        : (images && urlRegex.test(images) ? [images] : []);

      const MIN_STOCK_DEFAULTS = {
        clothing: 10,
        default: 20
      };
      const minStockValue = minStock || MIN_STOCK_DEFAULTS[itemType.category] || MIN_STOCK_DEFAULTS.default;

      const newItem = itemStockRepo.create({
        hexColor,
        size: itemType.hasSizes ? size : null,
        quantity,
        price,
        images: processedImages,
        minStock: minStockValue,
        itemType
      });

      const savedItem = await itemStockRepo.save(newItem);

      const { operation, reason } = generateInventoryReason("create");
      await movementRepo.save({
        type: "entrada",
        operation,  
        reason, 
        quantity: newItem.quantity,
        itemStock: savedItem,
        createdBy: { id: itemData.createdById }, 
        ...createItemSnapshot(savedItem),
      });

      return [savedItem, null];
    }).catch(error => {
      console.error("Error en createItemStock:", error.message, error.stack);
      return [null, `Error al crear el item en inventario: ${error.message}`];
    });
  },

  async getItemStock(filters = {}) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const where = {};
      const parsedFilters = {
      ...filters,
      isActive:
        filters.isActive === "false"
          ? false
          : filters.isActive === "true"
          ? true
          : filters.isActive,
        };
      if (parsedFilters.id) where.id = parsedFilters.id;
      if (parsedFilters.itemTypeId) where.itemType = { id: parsedFilters.itemTypeId };
      if (parsedFilters.size !== undefined) {
        where.size = parsedFilters.size === "N/A" ? null : parsedFilters.size;
      }

      if (parsedFilters.isActive !== undefined) {
        where.isActive = parsedFilters.isActive;
      } else if (parsedFilters.publicOnly !== false) {
        where.isActive = true;
      }
      const items = await repo.find({
        where,
        relations: ["itemType"],
        order: { createdAt: "DESC" }
      });

      return [items, null];
    } catch (error) {
      console.error("Error detallado en getItemStock:", error);
      return [null, "Error al obtener el inventario"];
    }
  },

  async updateItemStock(id, updateData) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const item = await repo.findOne({ 
      where: { id },
      relations: ["itemType"]
    });

    if (!item) {
      return [null, "Item de inventario no encontrado"];
    }

    const { updatedById } = updateData;

    if (updateData.quantity !== undefined && !updatedById) {
      return [null, "El ID del usuario que actualiza es obligatorio para cambios de cantidad"];
    }
    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      return [null, "La cantidad no puede ser negativa"];
    }
    if (updateData.price !== undefined && updateData.price < 0) {
      return [null, "El precio no puede ser negativo"];
    }
    if (updateData.size !== undefined && item.itemType.hasSizes && !updateData.size) {
      return [null, "Este tipo de artículo requiere especificar talla"];
    }

    if (
      (updateData.hexColor && updateData.hexColor !== item.hexColor) 
      || (updateData.itemTypeId && updateData.itemTypeId !== item.itemType.id)
    ) {
      const duplicate = await repo.findOne({
        where: {
          id: Not(id), 
          itemType: { id: updateData.itemTypeId || item.itemType.id },
          hexColor: updateData.hexColor || item.hexColor,
          size: updateData.size || item.size
        },
        relations: ["itemType"]
      });

      if (duplicate) {
        return [null, "Ya existe otro stock con ese nombre y color"];
      }
    }

    const originalQuantity = item.quantity;
    const updatableFields = ["hexColor", "size", "quantity", "price", "images", "minStock", "isActive"];
    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
      }
    });

    const updatedItem = await repo.save(item);

    const { operation, reason } = generateInventoryReason("update");

    if (updateData.quantity !== undefined && updateData.quantity !== originalQuantity) {
      const diff = updateData.quantity - originalQuantity;
      await movementRepo.save({
        type: diff > 0 ? "entrada" : "salida",
        quantity: Math.abs(diff),
        itemStock: item,
        createdBy: { id: updatedById }, 
        operation,
        reason,
        ...createItemSnapshot(item),
      });
    } else if (updatedById) {
      await movementRepo.save({
        type: "ajuste", 
        quantity: 0,
        itemStock: item,
        createdBy: { id: updatedById },
        operation,
        reason,
        ...createItemSnapshot(item),
      });
    }
    return [updatedItem, null];
    } catch (error) {
      console.error("Error en updateItemStock:", error.message, error.stack);
      return [null, `Error al actualizar el item de inventario: ${error.message}`];
    }
  },

  async deleteItemStock(id, userId) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const item = await repo.findOne({ 
        where: { id },
        relations: ["itemType"] 
      });
      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }
      if (!item.isActive) {
      return [null, "El item ya está desactivado"];
      }

      item.isActive = false;
      item.deletedAt = new Date();

      const updated = await repo.save(item);

      const { operation, reason } = generateInventoryReason("deactivate");

      await movementRepo.save({
        type: "ajuste",
        quantity: 0,
        itemStock: item,
        createdBy: { id: userId },
        operation,
        reason,
        ...createItemSnapshot(item),
      });
      
      return [{ id: updated.id, message: "Item desactivado correctamente" }, null];
      } catch (error) {
        console.error("Error en deleteItemStock:", error);
        return [null, "Error al eliminar el item de inventario"];
      }
  },
    
  async restoreItemStock(id, userId) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const item = await repo.findOne({ 
        where: { id }, 
        relations: ["itemType"] 
      });

      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }
      if (item.isActive) {
        return [null, "El item ya está activo"];
      }

      if (!item.itemType?.isActive) {
        return [null, "No se puede restaurar un stock cuyo tipo de ítem está desactivado"];
      }

      item.isActive = true;
      item.deletedAt = null;

      const restoredItem = await repo.save(item);

      const { operation, reason } = generateInventoryReason("reactivate");

      await movementRepo.save({
        type: "ajuste",
        quantity: 0,
        itemStock: restoredItem,
        createdBy: { id: userId },
        operation,
        reason,
        ...createItemSnapshot(restoredItem),
      });

      return [restoredItem, null];
    } catch (error) {
      console.error("Error en restoreItemStock:", error);
      return [null, "Error al restaurar el item"];
    }
  },
  
  async forceDeleteItemStock(id, userId) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const item = await repo.findOne({ 
        where: { id },
        relations: ["itemType"]
      });

      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }

      const { operation, reason } = generateInventoryReason("delete");

      await movementRepo.save({
        type: "ajuste",
        quantity: 0,
        itemStock: item,
        createdBy: { id: userId },
        operation,
        reason,
        ...createItemSnapshot(item),
      });

      await repo.remove(item);

      return [{ id: item.id, message: "Item eliminado permanentemente" }, null];
    } catch (error) {
      console.error("Error en forceDeleteItemStock:", error);
      return [null, "Error al eliminar permanentemente el item"];
    }
  },

  async emptyTrash(userId) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const itemsToDelete = await repo.find({ 
        where: { isActive: false },
        relations: ["itemType"]
      });

      if (itemsToDelete.length === 0) {
        return [0, null]; 
      }

      const { operation, reason } = generateInventoryReason("purge");

      for (const item of itemsToDelete) {
        await movementRepo.save({
          type: "ajuste",
          quantity: 0,
          itemStock: item,
          createdBy: { id: userId },
          operation,
          reason,
          ...createItemSnapshot(item),
        });
      }
      
      await repo.remove(itemsToDelete);
      return [itemsToDelete.length, null];
    } catch (error) {
      console.error("Error en emptyTrash:", error);
      return [null, "Error al vaciar la papelera"];
    }
  }
}