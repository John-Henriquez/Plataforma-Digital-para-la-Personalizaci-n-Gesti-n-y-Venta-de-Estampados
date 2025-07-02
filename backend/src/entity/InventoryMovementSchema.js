"use strict";
import { EntitySchema } from "typeorm";

const InventoryMovementSchema = new EntitySchema({
  name: "InventoryMovement",
  tableName: "inventory_movements",
  columns: {
    id: { 
        type: "int", 
        primary: true, 
        generated: true 
    },
    type: {
      type: "enum",
      enum: ["entrada", "salida", "ajuste"],
      nullable: false,
    },
    operation: { 
      type: "varchar",
      length: 50,
      nullable: false,
      default: "unspecified",
    },
    quantity: { 
        type: "int", 
        nullable: false 
    },
    reason: { 
        type: "text", 
        nullable: true 
    },
    createdAt: { 
        type: "timestamp", 
        createDate: true 
    },
    //snapshot fields
    snapshotItemName: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    snapshotItemColor: {
      type: "varchar",
      length: 7,
      nullable: true,
    },
    snapshotItemSize: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    snapshotPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
  },
  relations: {
    itemStock: {
      type: "many-to-one",
      target: "ItemStock",
      joinColumn: { name: "item_stock_id" },
      nullable: true,
      onDelete: "SET NULL",
    },
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "created_by" },
      nullable: false,
    },
  },
});

export default InventoryMovementSchema;
