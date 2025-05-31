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
    hasSize: {
      type: "boolean",
      default: false,
      nullable: false,
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
