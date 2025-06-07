import { inventoryService } from "../services/inventory.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { itemStockSchema, itemStockUpdateSchema } from "../validations/itemStock.validation.js";
import { itemTypeSchema } from "../validations/itemType.validation.js";

export const inventoryController = {
async createItemType(req, res) {
  console.log("=== createItemType ===");

  console.log("req.body antes de parsear:", req.body);
  console.log("req.file:", req.file);

  try {
    if (req.body.baseImage) delete req.body.baseImage;
    if (typeof req.body.hasSizes === "string") {
      req.body.hasSizes = JSON.parse(req.body.hasSizes); 
      console.log("hasSizes parseado:", req.body.hasSizes);
    }

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      req.body.baseImageUrl = `/uploads/${req.file.filename}`;

      console.log("Imagen subida, baseImageUrl seteado:", req.body.baseImageUrl);
    } else {
      console.log("No se recibió archivo baseImage");
    }

    if (typeof req.body.printingMethods === "string") {
      req.body.printingMethods = JSON.parse(req.body.printingMethods);
      console.log("printingMethods parseado:", req.body.printingMethods);
    }
    if (typeof req.body.sizesAvailable === "string") {
      req.body.sizesAvailable = JSON.parse(req.body.sizesAvailable);
      console.log("sizesAvailable parseado:", req.body.sizesAvailable);
    }

    if (Array.isArray(req.body.printingMethods)) {
      req.body.printingMethods = req.body.printingMethods.flat(Infinity);
      console.log("printingMethods flatten:", req.body.printingMethods);
    }

    if (Array.isArray(req.body.sizesAvailable)) {
      req.body.sizesAvailable = req.body.sizesAvailable.flat(Infinity);
      console.log("sizesAvailable flatten:", req.body.sizesAvailable);
    }

    const { error } = itemTypeSchema.validate(req.body);
    if (error) {
      console.error("Error de validación Joi:", error.details);
      return handleErrorClient(res, 400, "Error de validación", error.details);
    }
    console.log("Validación Joi OK");

    const [newItemType, serviceError] = await inventoryService.createItemType(req.body);
    if (serviceError) {
      console.error("Error en inventoryService.createItemType:", serviceError);
      return handleErrorClient(res, 400, serviceError);
    }

    console.log("Tipo de ítem creado exitosamente:", newItemType);
    handleSuccess(res, 201, "Tipo de ítem creado", newItemType);

  } catch (error) {
    console.error("Error en createItemType catch:", error);
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