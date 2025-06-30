import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";
import InventoryMovement from "../entity/InventoryMovementSchema.js";
import { generateInventoryReason } from "../helpers/inventory.helpers.js";
import { Not } from "typeorm";

export const itemStockService = {
  async createItemStock(itemData) {
    return await AppDataSource.transaction(async transactionalEntityManager => {
      const { itemTypeId, hexColor, size, quantity, price, images, minStock } = itemData;
      const itemStockRepo = transactionalEntityManager.getRepository(ItemStock);
      const itemTypeRepo = transactionalEntityManager.getRepository(ItemType);

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
        hexColor
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
      
      const movementRepo = transactionalEntityManager.getRepository(InventoryMovement);
      await movementRepo.save({
        type: "entrada",
        quantity: newItem.quantity,
        itemStock: savedItem,
        createdBy: { id: itemData.createdById }, 
        reason: generateInventoryReason("create")
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
      
      if (filters.id) where.id = filters.id;
      if (filters.itemTypeId) where.itemType = { id: filters.itemTypeId };
      if (filters.size !== undefined) {
        where.size = filters.size === "N/A" ? null : filters.size;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      } else if (filters.publicOnly !== false) {
        where.isActive = true;
      }
      const items = await repo.find({
        where,
        relations: ["itemType"],
        order: { createdAt: "DESC" }
      });

      if (!items || items.length === 0) {
        return [[], null];
      }

      return [items, null];
    } catch (error) {
      console.error("Error detallado en getItemStock:", error);
      return [null, "Error al obtener el inventario"];
    }
  },

  async updateItemStock(id, updateData) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const item = await repo.findOne({ 
      where: { id },
      relations: ["itemType"]
    });

    if (!item) {
      return [null, "Item de inventario no encontrado"];
    }
    if (updateData.quantity !== undefined && !updateData.updatedById) {
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
          hexColor: updateData.hexColor || item.hexColor
        },
        relations: ["itemType"]
      });

      if (duplicate) {
        return [null, "Ya existe otro stock con ese nombre y color"];
      }
    }

    const updatableFields = ["hexColor", "size", "quantity", "price", "images", "minStock", "isActive"];
    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
      }
    });

    if (updateData.quantity !== undefined && updateData.quantity !== item.quantity) {

      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      const diff = updateData.quantity - item.quantity;

      await movementRepo.save({
        type: diff > 0 ? "entrada" : "salida",
        quantity: Math.abs(diff),
        itemStock: item,
        createdBy: { id: updateData.updatedById }, 
        reason: generateInventoryReason("adjust"),
      });

    item.quantity = updateData.quantity;
    } else if (updateData.updatedById) {
      const movementRepo = AppDataSource.getRepository(InventoryMovement);
      await movementRepo.save({
        type: "ajuste", 
        quantity: 0,
        itemStock: item,
        createdBy: { id: updateData.updatedById },
        reason: generateInventoryReason("update"), 
      });
    }
    const updatedItem = await repo.save(item);
    return [updatedItem, null];
  } catch (error) {
    console.error("Error en updateItemStock:", error.message, error.stack);
    return [null, `Error al actualizar el item de inventario: ${error.message}`];
  }
    },

    async deleteItemStock(id) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const item = await repo.findOne({ where: { id } });

      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }

      item.isActive = false;
      item.deletedAt = new Date();
      await repo.save(item);
      
      return [{ id: item.id, message: "Item desactivado correctamente" }, null];
      } catch (error) {
        console.error("Error en deleteItemStock:", error);
        return [null, "Error al eliminar el item de inventario"];
      }
    },

  async emptyTrash() {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const itemsToDelete = await repo.find({ where: { isActive: false } });
      if (itemsToDelete.length === 0) {
        return [0, null]; 
      }
      await repo.remove(itemsToDelete);
      return [itemsToDelete.length, null];
    } catch (error) {
      console.error("Error en emptyTrash:", error);
      return [null, "Error al vaciar la papelera"];
    }
  },

  async restoreItemStock(id) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const item = await repo.findOne({ where: { id } });

      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }
      if (item.isActive) {
        return [null, "El item ya está activo"];
      }

      item.isActive = true;
      item.deletedAt = null;
      const restoredItem = await repo.save(item);

      return [restoredItem, null];
    } catch (error) {
      console.error("Error en restoreItemStock:", error);
      return [null, "Error al restaurar el item"];
    }
  },
  
  async forceDeleteItemStock(id) {
    try {
      const repo = AppDataSource.getRepository(ItemStock);
      const item = await repo.findOne({ where: { id } });

      if (!item) {
        return [null, "Item de inventario no encontrado"];
      }

      await repo.remove(item);

      return [{ id: item.id, message: "Item eliminado permanentemente" }, null];
    } catch (error) {
      console.error("Error en forceDeleteItemStock:", error);
      return [null, "Error al eliminar permanentemente el item"];
    }
  }

}