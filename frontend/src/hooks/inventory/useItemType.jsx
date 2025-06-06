import { createItemType, getItemTypes } from '@services/inventory.service';
import { useState } from 'react';

export const useItemTypes = () => {
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    const fetched = await getItemTypes();
    setTypes(fetched);
  };

  const addType = async (typeData) => {
    return await createItemType(typeData);
  };

  return {
    types,
    fetchTypes,
    addType,
  };
};
