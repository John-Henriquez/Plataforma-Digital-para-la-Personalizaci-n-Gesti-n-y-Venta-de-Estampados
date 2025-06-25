import { AppDataSource } from "../config/configDb.js";
import ItemType from "../entity/itemType.entity.js";

export const itemTypeService = {
    async createItemType(itemTypeData, userId) {
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
            sizesAvailable: itemTypeData.hasSizes ? itemTypeData.sizesAvailable : [],
            iconName: itemTypeData.iconName || null,
            createdBy: { id: userId }
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
    async getItemTypeById(id) {
    try {
        const repo = AppDataSource.getRepository(ItemType);
        const itemType = await repo.findOne({
            where: { id: parseInt(id), isActive: true },
        });

        if (!itemType) {
            return [null, "Tipo de ítem no encontrado o no está activo"];
        }

        return [itemType, null];
    } catch (error) {
        console.error("Error en getItemTypeById:", error);
        return [null, "Error al obtener el tipo de ítem"];
    }
    },
    async updateItemType(id, itemTypeData, userId) {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const itemType = await repo.findOne({ where: { id: parseInt(id), isActive: true } });

            if (!itemType) {
                return [null, "Tipo de ítem no encontrado o no está activo"];
            }

            const existingType = await repo.findOne({
                where: { name: itemTypeData.name, id: Not(parseInt(id)) },
            });

            if (existingType) {
                return [null, "Ya existe un tipo de ítem con este nombre"];
            }
            repo.merge(itemType, {
                name: itemTypeData.name || itemType.name,
                description: itemTypeData.description || itemType.description,
                category: itemTypeData.category || itemType.category,
                hasSizes: itemTypeData.hasSizes !== undefined ? itemTypeData.hasSizes : itemType.hasSizes,
                printingMethods: itemTypeData.printingMethods || itemType.printingMethods,
                sizesAvailable: itemTypeData.hasSizes ? (itemTypeData.sizesAvailable || itemType.sizesAvailable) : [],
                iconName: itemTypeData.iconName || itemType.iconName,
                updatedBy: { id: userId }
            });

            const updatedItemType = await repo.save(itemType);
            return [updatedItemType, null];
        } catch (error) {
            console.error("Error en updateItemType:", error);
            return [null, "Error al actualizar el tipo de ítem"];
        }
    },
    async deleteItemType(id) {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const itemType = await repo.findOne({ where: { id: parseInt(id), isActive: true } });

            if (!itemType) {
                return [null, "Tipo de ítem no encontrado o ya está desactivado"];
            }

            itemType.isActive = false;
            await repo.save(itemType);

            return [{ id: parseInt(id) }, null];
        } catch (error) {
            console.error("Error en deleteItemType:", error);
            return [null, "Error al desactivar el tipo de ítem"];
        }
    },
    async restoreItemType(id) {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const itemType = await repo.findOne({ where: { id: parseInt(id), isActive: false } });

            if (!itemType) {
                return [null, "Tipo de ítem no encontrado o ya está activo"];
            }

            itemType.isActive = true;
            const restoredItemType = await repo.save(itemType);

            return [restoredItemType, null];
        } catch (error) {
            console.error("Error en restoreItemType:", error);
            return [null, "Error al restaurar el tipo de ítem"];
        }
    },
    async getDeletedItemTypes() {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const itemTypes = await repo.find({
            where: { isActive: false },
            order: { name: "ASC" },
            });
            return [itemTypes, null];
        } catch (error) {
            console.error("Error en getDeletedItemTypes:", error);
            return [null, "Error al obtener ítems eliminados"];
        }
    },
    async forceDeleteItemType(id) {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const itemType = await repo.findOne({ where: { id: parseInt(id) } });

            if (!itemType) {
            return [null, "Tipo de ítem no encontrado"];
            }

            await repo.remove(itemType); 
            return [{ id: parseInt(id) }, null];
        } catch (error) {
            console.error("Error en forceDeleteItemType:", error);
            return [null, "Error al eliminar permanentemente el tipo de ítem"];
        }
    },
    async emptyTrash() {
        try {
            const repo = AppDataSource.getRepository(ItemType);
            const deletedItems = await repo.find({ where: { isActive: false } });

            if (deletedItems.length === 0) {
            return [[], null];
            }

            await repo.remove(deletedItems);
            return [deletedItems.map(item => ({ id: item.id })), null];
        } catch (error) {
            console.error("Error en emptyTrash:", error);
            return [null, "Error al vaciar la papelera"];
        }
    },
}