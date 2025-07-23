import { AppDataSource } from "../config/configDb.js";
import Pack from "../entity/pack.entity.js";
import PackItem from "../entity/packItem.entity.js";
import ItemStock from "../entity/itemStock.entity.js";
import InventoryMovement from "../entity/InventoryMovementSchema.js";
import { createItemSnapshot, generateInventoryReason } from "../helpers/inventory.helpers.js";

export const packService = {
  async createPack(packData) {
    return await AppDataSource.transaction(async transactionalEntityManager => {
      const { name, description, price, discount, validFrom, validUntil, items, createdById } = packData;

      const packRepo = transactionalEntityManager.getRepository(Pack);
      const packItemRepo = transactionalEntityManager.getRepository(PackItem);
      const itemStockRepo = transactionalEntityManager.getRepository(ItemStock);
      const movementRepo = transactionalEntityManager.getRepository(InventoryMovement);

      if (!name || price == null || !items || items.length === 0) {
        return [null, "Faltan campos obligatorios"];
      }
      if (discount < 0 || discount > 1) {
        return [null, "El descuento debe ser un valor decimal entre 0 y 1 (ej: 0.2 para 20%)"];
      }
      if (price < 0 || discount < 0) {
        return [null, "El precio y el descuento deben ser no negativos"];
      }

      let totalPrice = 0;
      const validItems = [];

      for (const itemData of items) {
        const item = await itemStockRepo.findOne({ where: { id: itemData.itemStockId } });
        if (!item) {
          return [null, `El ítem con ID ${itemData.itemStockId} no existe o está inactivo`];
        }

        const requestedQty = itemData.quantity;
        if (
          typeof requestedQty !== "number" 
          || !Number.isInteger(requestedQty) 
          || requestedQty <= 0
        ) {
          return [null, `La cantidad para el ítem '${item.name || item.id}' debe ser un número entero positivo`];
        }

        if (requestedQty > item.stock) {
          return [null, `Stock insuficiente para el ítem '${item.name 
            || item.id}'. Disponible: ${item.stock}, requerido: ${requestedQty}`];
        }


        if (item.stock < requestedQty) {
          return [null, `Stock insuficiente para el ítem '${item.name 
          || item.id}'. Disponible: ${item.stock}, requerido: ${requestedQty}`];
        }

        totalPrice += (item.price || 0) * (itemData.quantity || 1);
        validItems.push({ item, quantity: itemData.quantity || 1 });
      }

      const finalPrice = Math.round(totalPrice * (1 - discount));

      const newPack = packRepo.create({
        name,
        description,
        price: finalPrice,
        discount,
        validFrom,
        validUntil,
        createdBy: createdById ? { id: createdById } : null,
      });

      const savedPack = await packRepo.save(newPack);

      for (const { item, quantity } of validItems) {
        const packItem = packItemRepo.create({
          pack: savedPack,
          itemStock: item,
          quantity,
        });
        await packItemRepo.save(packItem);
      }

      const { operation, reason } = generateInventoryReason("create");

      for (const { item, quantity } of validItems) {
        await movementRepo.save({
          type: "entrada",
          reason,
          operation,
          quantity,
          itemStock: item,
          createdBy: { id: createdById },
          ...createItemSnapshot(item),
        });
      }

      return [savedPack, null];
    }).catch(error => {
      console.error("Error en createPack:", error.message, error.stack);
      return [null, `Error al crear el pack: ${error.message}`];
    });
  },

  async getPacks(filters = {}) {
    try {
      const repo = AppDataSource.getRepository(Pack);
      const where = {};

      if (filters.id) where.id = filters.id;
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive === "false" ? false : filters.isActive === "true" ? true : filters.isActive;
      }

      const packs = await repo.find({
        where,
        relations: ["packItems", "packItems.itemStock", "packItems.itemStock.itemType"],
        order: { createdAt: "DESC" },
      });

      return [packs, null];
    } catch (error) {
      console.error("Error en getPacks:", error);
      return [null, "Error al obtener los packs"];
    }
  },

  async updatePack(id, updateData) {
    return await AppDataSource.transaction(async transactionalEntityManager => {
      const repo = transactionalEntityManager.getRepository(Pack);
      const packItemRepo = transactionalEntityManager.getRepository(PackItem);
      const itemStockRepo = transactionalEntityManager.getRepository(ItemStock);
      const movementRepo = transactionalEntityManager.getRepository(InventoryMovement);

      const pack = await repo.findOne({
        where: { id },
        relations: ["packItems", "packItems.itemStock"],
      });

      if (!pack) return [null, "Pack no encontrado"];
      if (updateData.price !== undefined && updateData.price < 0) return [null, "Precio inválido"];

      const updatableFields = ["name", "description", "price", "discount", "validFrom", "validUntil", "isActive"];
      for (const field of updatableFields) {
        if (updateData[field] !== undefined) {
          pack[field] = updateData[field];
        }
      }

      pack.updatedBy = updateData.updatedById ? { id: updateData.updatedById } : null;

      const updatedPack = await repo.save(pack);

      
      if (Array.isArray(updateData.items)) {
        const { operation, reason } = generateInventoryReason("update");

        for (const oldPackItem of pack.packItems) {
          await movementRepo.save({
            type: "ajuste",
            reason,
            operation,
            quantity: oldPackItem.quantity || 1,
            itemStock: oldPackItem.itemStock,
            createdBy: { id: updateData.updatedById },
            ...createItemSnapshot(pack),
          });
        }

        await packItemRepo.delete({ pack: { id: pack.id } });

        for (let itemData of updateData.items) {
          const item = await itemStockRepo.findOne({ where: { id: itemData.itemStockId } });
          if (!item) return [null, `El ítem con ID ${itemData.itemStockId} no existe`];

           const requestedQty = itemData.quantity;

            if (
              typeof requestedQty !== "number" 
              || !Number.isInteger(requestedQty) 
              || requestedQty <= 0
            ) {
              return [null, `La cantidad para el ítem '${item.name || item.id}' debe ser un número entero positivo`];
            }

            if (requestedQty > item.stock) {
              return [null, `Stock insuficiente para el ítem '${item.name 
                || item.id}'. Disponible: ${item.stock}, requerido: ${requestedQty}`];
            }


            if (item.stock < requestedQty) {
              return [null, `Stock insuficiente para el ítem '${item.name 
              || item.id}'. Disponible: ${item.stock}, requerido: ${requestedQty}`];
            }

          const newPackItem = packItemRepo.create({
            pack,
            itemStock: item,
            quantity: itemData.quantity || 1,
          });

          await packItemRepo.save(newPackItem);

          await movementRepo.save({
            type: "ajuste",
            reason,
            operation,
            quantity: itemData.quantity || 1,
            itemStock: item,
            createdBy: { id: updateData.updatedById },
            ...createItemSnapshot(pack),
          });
        }
      }

      return [updatedPack, null];
    }).catch(error => {
      console.error("Error en updatePack:", error);
      return [null, "Error al actualizar el pack"];
    });
  },

  async deletePack(id, userId) {
    try {
      const repo = AppDataSource.getRepository(Pack);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);

      const pack = await repo.findOne({
        where: { id },
        relations: ["packItems", "packItems.itemStock"],
      });

      if (!pack) {
        return [null, "Pack no encontrado"];
      }

      pack.isActive = false;
      pack.deletedAt = new Date();

      const updatedPack = await repo.save(pack);

      const { operation, reason } = generateInventoryReason("deactivate");

      // ➖ Registrar salida del inventario por cada ítem del pack
      for (const packItem of pack.packItems) {
        await movementRepo.save({
          type: "ajuste",
          reason,
          operation,
          quantity: packItem.quantity || 1,
          itemStock: packItem.itemStock,
          createdBy: { id: userId },
          ...createItemSnapshot(updatedPack),
        });
      }

      return [{ id: updatedPack.id, message: "Pack desactivado correctamente" }, null];
    } catch (error) {
      console.error("Error en deletePack:", error);
      return [null, "Error al desactivar el pack"];
    }
  },

  async restorePack(id, userId) {
    try {
      const repo = AppDataSource.getRepository(Pack);
      const movementRepo = AppDataSource.getRepository(InventoryMovement);

      const pack = await repo.findOne({ 
        where: { id },
        relations: ["packItems", "packItems.itemStock"] 
      });

      if (!pack) {
        return [null, "Pack no encontrado"];
      }

      if (pack.isActive) {
        return [null, "El pack ya está activo"];
      }

      pack.isActive = true;
      pack.deletedAt = null;

      const restoredPack = await repo.save(pack);

      const { operation, reason } = generateInventoryReason("reactivate");

      // ➕ Registrar reingreso al inventario por cada ítem del pack
      for (const packItem of pack.packItems) {
        await movementRepo.save({
          type: "ajuste",
          operation,
          reason,
          quantity: packItem.quantity || 1,
          itemStock: packItem.itemStock,
          createdBy: { id: userId },
          ...createItemSnapshot(restoredPack),
        });
      }

      return [restoredPack, null];
    } catch (error) {
      console.error("Error en restorePack:", error);
      return [null, "Error al restaurar el pack"];
    }
  },

  async forceDeletePack(id, userId) {
  try {
    const repo = AppDataSource.getRepository(Pack);
    const movementRepo = AppDataSource.getRepository(InventoryMovement);

    const pack = await repo.findOne({
      where: { id },
      relations: ["packItems", "packItems.itemStock"],
    });

    if (!pack) {
      return [null, "Pack no encontrado"];
    }

    const { operation, reason } = generateInventoryReason("delete");

    // 🔁 Registrar salida de inventario por cada ítem del pack
    for (const packItem of pack.packItems) {
      await movementRepo.save({
        type: "ajuste",
        operation,
        reason,
        quantity: packItem.quantity || 1,
        itemStock: packItem.itemStock,
        createdBy: { id: userId },
        ...createItemSnapshot(pack),
      });
    }

    const packItemRepo = AppDataSource.getRepository(PackItem);
    await packItemRepo.delete({ pack: { id: pack.id } });

    await repo.remove(pack);


    return [{ id: pack.id, message: "Pack eliminado permanentemente" }, null];
  } catch (error) {
    console.error("Error en forceDeletePack:", error);
    return [null, "Error al eliminar permanentemente el pack"];
  }
  },

async emptyTrash(userId) {
  return await AppDataSource.transaction(async transactionalEntityManager => {
    const repo = transactionalEntityManager.getRepository(Pack);
    const packItemRepo = transactionalEntityManager.getRepository(PackItem);
    const movementRepo = transactionalEntityManager.getRepository(InventoryMovement);

    const packsToDelete = await repo.find({
      where: { isActive: false },
      relations: ["packItems", "packItems.itemStock"],
    });

    if (!packsToDelete.length) {
      return [0, null];
    }

    const { operation, reason } = generateInventoryReason("purge");

    for (const pack of packsToDelete) {
      for (const packItem of pack.packItems) {
        await movementRepo.save({
          type: "ajuste",
          operation,
          reason,
          quantity: packItem.quantity || 1,
          itemStock: packItem.itemStock,
          createdBy: { id: userId },
          ...createItemSnapshot(pack),
        });
      }

      await packItemRepo.delete({ pack: { id: pack.id } });
    }

    await repo.remove(packsToDelete);

    return [packsToDelete.length, null];
  }).catch(error => {
    console.error("Error en emptyTrash:", error);
    return [null, "Error al vaciar la papelera"];
  });
}

};
