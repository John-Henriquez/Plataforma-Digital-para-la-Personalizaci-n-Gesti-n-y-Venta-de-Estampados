import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";
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
      if (filters.publicOnly) where.isActive = true;
      if (filters.size !== undefined) {
        where.size = filters.size === "N/A" ? null : filters.size;
      }

      const items = await repo.find({
        where: { isActive: true },
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

      await repo.remove(item);
      
      return [{ id: item.id, message: "Item desactivado correctamente" }, null];
    } catch (error) {
      console.error("Error en deleteItemStock:", error);
      return [null, "Error al eliminar el item de inventario"];
    }
    }
}