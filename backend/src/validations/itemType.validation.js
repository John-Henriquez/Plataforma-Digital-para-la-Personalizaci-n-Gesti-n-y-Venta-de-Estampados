import Joi from "joi";

const itemTypeSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().allow("").optional(),  // Corregido: allow("") en lugar de allow(" ")
  category: Joi.string().valid("clothing", "object").required(),
  hasSizes: Joi.boolean().required(),  // Cambiado: .default(false) → .required()
  printingMethods: Joi.array()
    .items(Joi.string().valid("sublimación", "DTF", "vinilo").required())  // Validación explícita
    .min(1)
    .required(),
  baseImageUrl: Joi.string().pattern(/^\/uploads\/.+$/).allow(null).optional(),  
  sizesAvailable: Joi.array()
    .items(Joi.string().valid("S", "M", "L", "XL", "XXL"))  // Valores permitidos
    .when("hasSizes", {
      is: true,
      then: Joi.array().min(1).required(),  // Más estricto cuando hasSizes=true
      otherwise: Joi.forbidden()  // No permite el campo si hasSizes=false
    })
}).options({ stripUnknown: true });  // Elimina campos no definidos en el esquema

export { itemTypeSchema };