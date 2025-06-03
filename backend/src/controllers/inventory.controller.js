import { inventoryService } from "../services/inventory.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import Joi from "joi";

// Esquemas de validación
const itemStockSchema = Joi.object({
  itemTypeId: Joi.number().integer().required(),
  color: Joi.string().required(),
  hexColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  size: Joi.string().optional(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).optional(),
  minStock: Joi.number().integer().min(0).optional()
});

const itemStockUpdateSchema = Joi.object({
  color: Joi.string().optional(),
  hexColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  size: Joi.string().optional(),
  quantity: Joi.number().integer().min(0).optional(),
  price: Joi.number().positive().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  minStock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
});
const itemTypeSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().allow(" ").optional(),
  category: Joi.string().valid("clothing", "object").required(),
  hasSizes: Joi.boolean().default(false),
  printingMethods: Joi.array().items(Joi.string().min(1)).optional(),
  sizesAvailable: Joi.array().items(Joi.string().min(1)).min(1).when("hasSizes", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional().empty(Joi.array().length(0))
  })
});

export const inventoryController = {
  async createItemType(req, res) {
    try {
      const { error } = itemTypeSchema.validate(req.body);
      if (error) {
        return handleErrorClient(res, 400, "Error de validación", error.details);
      }

      const [newItemType, serviceError] = await inventoryService.createItemType(req.body);
      if (serviceError) return handleErrorClient(res, 400, serviceError);
      
      handleSuccess(res, 201, "Tipo de ítem creado", newItemType);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async getItemTypes(req, res) {
    try {
      const [itemTypes, error] = await inventoryService.getItemTypes();
      if (error) return handleErrorClient(res, 404, error);
      
      handleSuccess(res, 200, "Tipos de ítem obtenidos", itemTypes);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

  async getItemStock(req, res) {
    try {
      const { id, itemTypeId, color, size } = req.query;
      
      if (itemTypeId && isNaN(parseInt(itemTypeId))) {
        return handleErrorClient(res, 400, "itemTypeId debe ser un número");
      }

      const [items, error] = await inventoryService.getItemStock({
        id: id ? parseInt(id) : undefined,
        itemTypeId,
        color,
        size
      });
      
      if (error) return handleErrorClient(res, 404, error);
      
      handleSuccess(res, 200, "Inventario obtenido", items);
    } catch (error) {
      console.error("Error en getItemStock controller:", error.message, error.stack);
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  },

  async getPublicStock(req, res) {
    try {
      const { itemTypeId, color, size } = req.query;
      if (itemTypeId && isNaN(parseInt(itemTypeId))) {
        return handleErrorClient(res, 400, "itemTypeId debe ser un número");
      }

      const [items, error] = await inventoryService.getItemStock({
        publicOnly: true,
        itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
        color,
        size
      });
      
      if (error) return handleErrorClient(res, 500, error);
      handleSuccess(res, 200, "Inventario público obtenido", items);
    } catch (error) {
      console.error("Error en getPublicStock controller:", error.message, error.stack);
      handleErrorServer(res, 500, `Error interno del servidor: ${error.message}`);
    }
  },

  async createItemStock(req, res) {
    try {
      const { error } = itemStockSchema.validate(req.body);
      if (error) {
        return handleErrorClient(res, 400, "Error de validación", error.details);
      }

      const [newItem, serviceError] = await inventoryService.createItemStock(req.body);
      if (serviceError) return handleErrorClient(res, 400, serviceError);
      
      handleSuccess(res, 201, "Item creado en inventario", newItem);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  },

async updateItemStock(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return handleErrorClient(res, 400, "ID debe ser un número");
    }

    const { error } = itemStockUpdateSchema.validate(req.body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.details);
    }

    const [updatedItem, serviceError] = await inventoryService.updateItemStock(parseInt(id), req.body);
    if (serviceError) return handleErrorClient(res, 400, serviceError);
    
    handleSuccess(res, 200, "Item actualizado", updatedItem);
  } catch (error) {
    console.error("Error en updateItemStock controller:", error.message, error.stack);
    handleErrorServer(res, 500, `Error interno del servidor: ${error.message}`);
  }
},

  async deleteItemStock(req, res) {
    try {
      const { id } = req.params;
      
      const [result, error] = await inventoryService.deleteItemStock(id);
      if (error) return handleErrorClient(res, 404, error);
      
      handleSuccess(res, 200, result.message, { id: result.id });
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
  }
};