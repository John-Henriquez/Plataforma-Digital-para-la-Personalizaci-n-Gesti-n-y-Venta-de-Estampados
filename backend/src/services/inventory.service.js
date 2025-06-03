import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";

export const inventoryService = {

  async createItemType(itemTypeData) {
    try {
      const repo = AppDataSource.getRepository(ItemType);

      const existingType = await repo.findOne({ 
        where: { name: itemTypeData.name } 
      });
      
      if (existingType) {
        return [null, "Ya existe un tipo de ítem con este nombre"];
      }

      const newItemType = repo.create({
        name: itemTypeData.name,
        description: itemTypeData.description,
        category: itemTypeData.category,
        hasSizes: itemTypeData.hasSizes,
        printingMethods: itemTypeData.printingMethods || [],
        sizesAvailable: itemTypeData.hasSizes ? itemTypeData.sizesAvailable : []
      });

      const savedItemType = await repo.save(newItemType);
      return [savedItemType, null];
    } catch (error) {
      console.error("Error en createItemType:", error);
      return [null, "Error al crear el tipo de ítem"];
    }
  },

  async getItemTypes() {
    try {
      const repo = AppDataSource.getRepository(ItemType);
      const itemTypes = await repo.find({
        where: { isActive: true },
        order: { name: "ASC" }
      });
      if (!itemTypes || itemTypes.length === 0) {
        return [[], null];
      }
      return [itemTypes, null];
    } catch (error) {
      console.error("Error en getItemTypes:", error);
      return [null, "Error al obtener los tipos de ítem"];
    }
    },

async createItemStock(itemData) {
  return await AppDataSource.transaction(async transactionalEntityManager => {
    const { itemTypeId, color, hexColor, size, quantity, price, images, minStock } = itemData;
    const itemStockRepo = transactionalEntityManager.getRepository(ItemStock);
    const itemTypeRepo = transactionalEntityManager.getRepository(ItemType);

    if (!itemTypeId || !color || !hexColor || quantity == null || price == null) {
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
      color,
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
      if (filters.color) where.color = filters.color;
      if (filters.publicOnly) where.isActive = true;
      if (filters.size !== undefined) {
        where.size = filters.size === "N/A" ? null : filters.size;
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

    // Validar campos actualizados
    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      return [null, "La cantidad no puede ser negativa"];
    }
    if (updateData.price !== undefined && updateData.price < 0) {
      return [null, "El precio no puede ser negativo"];
    }
    if (updateData.size !== undefined && item.itemType.hasSizes && !updateData.size) {
      return [null, "Este tipo de artículo requiere especificar talla"];
    }

    const updatableFields = ["color", "hexColor", "size", "quantity", "price", "images", "minStock", "isActive"];
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

      // Soft delete
      item.isActive = false;
      item.updatedAt = new Date();
      await repo.save(item);
      
      return [{ id: item.id, message: "Item desactivado correctamente" }, null];
    } catch (error) {
      console.error("Error en deleteItemStock:", error);
      return [null, "Error al eliminar el item de inventario"];
    }
  }
};