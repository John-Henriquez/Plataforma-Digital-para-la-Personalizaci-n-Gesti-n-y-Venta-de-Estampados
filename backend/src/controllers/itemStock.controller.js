import { itemStockService } from "../services/itemStock.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { itemStockSchema, itemStockUpdateSchema } from "../validations/itemStock.validation.js";

export const itemStockController = {
    async getItemStock(req, res) {
        try {
            const { id, itemTypeId, size } = req.query;
            
            if (itemTypeId && isNaN(parseInt(itemTypeId))) {
                return handleErrorClient(res, 400, "itemTypeId debe ser un número");
            }

            const [items, error] = await itemStockService.getItemStock({
                id: id ? parseInt(id) : undefined,
                itemTypeId,
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
            const { itemTypeId, size } = req.query;
            if (itemTypeId && isNaN(parseInt(itemTypeId))) {
                return handleErrorClient(res, 400, "itemTypeId debe ser un número");
            }

            const [items, error] = await itemStockService.getItemStock({
                publicOnly: true,
                itemTypeId: itemTypeId ? parseInt(itemTypeId) : undefined,
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

        const [newItem, serviceError] = await itemStockService.createItemStock(req.body);
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

        const [updatedItem, serviceError] = await itemStockService.updateItemStock(parseInt(id), req.body);
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
            
            const [result, error] = await itemStockService.deleteItemStock(id);
            if (error) return handleErrorClient(res, 404, error);
            
            handleSuccess(res, 200, result.message, { id: result.id });
        } catch (error) {
            handleErrorServer(res, 500, error.message);
        }
    }
}