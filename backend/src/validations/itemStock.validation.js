import Joi from "joi";

const itemStockSchema = Joi.object({
  itemTypeId: Joi.number().integer().required(),
  color: Joi.string().required(),
  hexColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  size: Joi.string().optional(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().required(),
  images: Joi.array().items(Joi.string().uri()).min(1).optional(),
  minStock: Joi.number().integer().min(0).optional()
});

const itemStockUpdateSchema = Joi.object({
  color: Joi.string().optional(),
  hexColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  size: Joi.string().optional(),
  quantity: Joi.number().integer().min(0).optional(),
  price: Joi.number().positive().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  minStock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
});

export { itemStockSchema, itemStockUpdateSchema };
