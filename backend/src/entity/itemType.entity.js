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
      nullable: true
    },
    sizesAvailable: {
      type: "simple-array",
      nullable: true
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
    hasSizes: {  
      type: "boolean",
      default: false,
      nullable: false
    },
    baseImageUrl: {
      type: "varchar",
      length: 255,
      nullable: true,
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