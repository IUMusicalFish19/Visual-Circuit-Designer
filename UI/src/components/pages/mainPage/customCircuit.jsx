import React, { createContext, useState, useContext, useEffect } from "react";

// Контекст для управления кастомными блоками
const CustomBlocksContext = createContext();

export const CustomBlocksProvider = ({ children }) => {
  const [customBlocks, setCustomBlocks] = useState([]);

  // Загрузка блоков из localStorage при инициализации
  useEffect(() => {
    const blocks = JSON.parse(localStorage.getItem("customBlocks") || "[]");
    setCustomBlocks(blocks);
  }, []);

  // Сохранение блоков в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("customBlocks", JSON.stringify(customBlocks));
  }, [customBlocks]);

  // Добавление нового блока
  const addBlock = (block) => {
    setCustomBlocks((prev) => [...prev, block]);
  };

  // Удаление блока
  const deleteBlock = (blockId) => {
    setCustomBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const getBlockById = (id) => customBlocks.find((block) => block.id === id);

  return (
    <CustomBlocksContext.Provider
      value={{
        customBlocks,
        addBlock,
        deleteBlock,
        getBlockById,
      }}
    >
      {children}
    </CustomBlocksContext.Provider>
  );
};

export const useCustomBlocks = () => useContext(CustomBlocksContext);

export default CustomBlocksProvider;
