"use strict";
import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";
import ItemStock from "../entity/itemStock.entity.js";

export const inventoryService = {

  async createItemType(itemTypeData) {
    try {
      const repo = AppDataSource.getRepository(ItemType);
      
      // Verificar si ya existe un tipo con el mismo nombre
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
  // GET ALL ITEM TYPES
  async getItemTypes() {
    try {
      const repo = AppDataSource.getRepository(ItemType);
      const itemTypes = await repo.find({
        where: { isActive: true },
        order: { name: "ASC" }
      });
      
      if (!itemTypes || itemTypes.length === 0) {
        return [null, "No se encontraron tipos de ítem"];
      }
      
      return [itemTypes, null];
    } catch (error) {
      console.error("Error en getItemTypes:", error);
      return [null, "Error al obtener los tipos de ítem"];
    }
  },
  // GET ITEM STOCK WITH FILTERS
async createItemStock(itemData) {
  try {
    const { itemTypeId, color, hexColor, size, quantity, price, images, minStock } = itemData;
    const itemStockRepo = AppDataSource.getRepository(ItemStock);
    const itemTypeRepo = AppDataSource.getRepository(ItemType);

    // Verificar tipo de item
    const itemType = await itemTypeRepo.findOne({ 
      where: { id: itemTypeId, isActive: true } 
    });
    
    if (!itemType) {
      return [null, "Tipo de artículo no encontrado o inactivo"];
    }

    // Validar talla si el tipo requiere
    if (itemType.hasSizes && !size) {
      return [null, "Este tipo de artículo requiere especificar talla"];
    }

    // Asegurar que images sea un array
    const processedImages = Array.isArray(images) ? images : (images ? [images] : []);

    const newItem = itemStockRepo.create({
      color,
      hexColor,
      size: itemType.hasSizes ? size : null,
      quantity,
      price,
      images: processedImages,
      minStock: minStock || (itemType.category === "clothing" ? 10 : 20),
      itemType
    });

    const savedItem = await itemStockRepo.save(newItem);
    return [savedItem, null];
  } catch (error) {
    console.error("Error en createItemStock:", error);
    return [null, "Error al crear el item en inventario"];
  }
  },
  // CREATE ITEM STOCK
async getItemStock(filters = {}) {
  try {
    const repo = AppDataSource.getRepository(ItemStock);
    
    // Construcción segura del objeto where
    const where = {};
    if (filters.id) where.id = filters.id;
    if (filters.itemTypeId) where.itemType = { id: filters.itemTypeId };
    if (filters.color) where.color = filters.color;
    if (filters.size !== undefined) {
      where.size = filters.size === "N/A" ? null : filters.size;
    }
    if (filters.publicOnly) where.isActive = true;

    const items = await repo.find({
      where,
      relations: ["itemType"],
      order: { createdAt: "DESC" }
    });

    if (!items || items.length === 0) {
      return [null, "No se encontraron items con los filtros proporcionados"];
    }

    // Procesar imágenes para asegurar que siempre sean arrays
    const processedItems = items.map(item => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : [])
    }));

    return [processedItems, null];
  } catch (error) {
    console.error("Error detallado en getItemStock:", error);
    return [null, "Error al obtener el inventario"];
  }
},

  // UPDATE ITEM STOCK
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

      // Actualizar solo campos permitidos
      const updatableFields = ["color", "hexColor", "size", "quantity", "price", "images", "minStock", "isActive"];
      updatableFields.forEach(field => {
        if (updateData[field] !== undefined) {
          item[field] = updateData[field];
        }
      });

      item.updatedAt = new Date();
      const updatedItem = await repo.save(item);
      return [updatedItem, null];
    } catch (error) {
      console.error("Error en updateItemStock:", error);
      return [null, "Error al actualizar el item de inventario"];
    }
  },

  // DELETE ITEM STOCK (soft delete)
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