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
