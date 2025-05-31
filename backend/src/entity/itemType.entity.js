"use strict";
import { EntitySchema } from "typeorm";

const ItemTypeSchema = new EntitySchema({
  name: "ItemType",
  tableName: "item_types",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    category: {
      type: "enum",
      enum: ["clothing", "object"],
      nullable: false,
    },
    printingMethods: {
      type: "simple-array",
      nullable: true,
      transformer: {
        to: (value) => Array.isArray(value) ? value.join(",") : value,
        from: (value) => typeof value === "string" ? value.split(",") : []
      }
    },
    sizesAvailable: {
      type: "simple-array",
      nullable: true,
      transformer: {
        to: (value) => Array.isArray(value) ? value.join(",") : value,
        from: (value) => typeof value === "string" ? value.split(",") : []
      }
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
    stocks: {
      type: "one-to-many",
      target: "ItemStock",
      inverseSide: "itemType",
    },
  },
});

export default ItemTypeSchema;