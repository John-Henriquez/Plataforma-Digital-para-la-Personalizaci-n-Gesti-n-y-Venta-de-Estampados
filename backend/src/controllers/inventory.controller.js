"use strict";
import {
  createItemStockService,
  deleteItemStockService,
  getAllItemStockService,
  getItemStockService,
  updateItemStockService,
} from "../services/inventory.service.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

// Crear tipo de artículo
export async function createItemType(req, res) {
  try {
    const { error } = itemTypeBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

    const [created, serviceError] = await createItemTypeService(req.body);
    if (serviceError) return handleErrorClient(res, 400, serviceError);

    handleSuccess(res, 201, "Tipo de artículo creado", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Obtener tipos de artículo
export async function getItemTypes(req, res) {
  try {
    const [types, errorTypes] = await getItemTypesService();
    if (errorTypes) return handleErrorClient(res, 404, errorTypes);

    types.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Tipos de artículo encontrados", types);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Crear stock
export async function createItemStock(req, res) {
  try {
    const { error } = itemStockBodyValidation.validate(req.body);
    if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

    const [created, serviceError] = await createItemStockService(req.body);
    if (serviceError) return handleErrorClient(res, 400, serviceError);

    handleSuccess(res, 201, "Stock creado", created);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Obtener stock
export async function getItemStock(req, res) {
  try {
    const { itemTypeId, color, size } = req.query;

    const { error } = itemStockQueryValidation.validate({ itemTypeId, color, size });
    if (error) return handleErrorClient(res, 400, "Error de validación en la consulta", error.message);

    const [items, errorItems] = await getItemStockService({ itemTypeId, color, size });
    if (errorItems) return handleErrorClient(res, 404, errorItems);

    items.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Stock encontrado", items);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Obtener stock público (sin auth)
export async function getItemStockPublic(req, res) {
  try {
    const [items, errorItems] = await getAllItemStockService();
    if (errorItems) return handleErrorClient(res, 404, errorItems);

    items.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Stock público encontrado", items);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Actualizar stock
export async function updateItemStock(req, res) {
  try {
    const { id } = req.query;
    const { body } = req;

    const { error: queryError } = itemStockQueryValidation.validate({ id });
    if (queryError) return handleErrorClient(res, 400, "Error en la consulta", queryError.message);

    const { error: bodyError } = itemStockBodyValidation.validate(body);
    if (bodyError) return handleErrorClient(res, 400, "Error en los datos enviados", bodyError.message);

    const [updated, errorUpdated] = await updateItemStockService({ id }, body);
    if (errorUpdated) return handleErrorClient(res, 400, errorUpdated);

    handleSuccess(res, 200, "Stock actualizado", updated);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Eliminar stock
export async function deleteItemStock(req, res) {
  try {
    const { id } = req.query;

    const { error } = itemStockQueryValidation.validate({ id });
    if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

    const [deleted, errorDeleted] = await deleteItemStockService({ id });
    if (errorDeleted) return handleErrorClient(res, 404, errorDeleted);

    handleSuccess(res, 200, "Stock eliminado correctamente", deleted);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
