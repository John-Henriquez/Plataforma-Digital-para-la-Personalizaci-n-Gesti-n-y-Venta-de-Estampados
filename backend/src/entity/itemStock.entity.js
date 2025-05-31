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
  },
  relations: {
    itemType: {
      type: "many-to-one",
      target: "ItemType",
      joinColumn: true,
      nullable: false,
    },
  },
});

export default ItemStockSchema;
