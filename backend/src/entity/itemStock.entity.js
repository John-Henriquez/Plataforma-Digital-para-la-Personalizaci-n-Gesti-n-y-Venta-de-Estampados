"use strict";
import { EntitySchema } from "typeorm";

const ItemStockSchema = new EntitySchema({
  name: "ItemStock",
  tableName: "item_stocks",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    color: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    hexColor: {
      type: "varchar",
      length: 7,
      nullable: true,
    },
    size: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    quantity: {
      type: "int",
      default: 0,
      nullable: false,
    },
    price: {
      type: "int", 
      nullable: false,
    },
    images: {
      type: "jsonb",
      nullable: true,
      transformer: {
        to: (value) => value ? JSON.stringify(value) : null,
        from: (value) => {
          if (!value) return [];
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        }
      }
    },
    minStock: {
      type: "int",
      default: 5,
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    itemType: {
      type: "many-to-one",
      target: "ItemType",
      joinColumn: {
        name: "item_type_id",
      },
      nullable: false,
    },
  },
});

export default ItemStockSchema;