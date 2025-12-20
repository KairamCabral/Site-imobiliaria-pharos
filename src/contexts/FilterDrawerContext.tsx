'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface FilterDrawerContextType {
  openFilterDrawer: () => void;
}

const FilterDrawerContext = createContext<FilterDrawerContextType>({
  openFilterDrawer: () => {},
});

interface FilterDrawerProviderProps {
  children: ReactNode;
}

export function FilterDrawerContextProvider({ children }: FilterDrawerProviderProps) {
  // Utilizaremos o evento personalizado para comunicação entre componentes
  const handleOpenFilterDrawer = () => {
    // Disparar um evento personalizado que o componente SearchFilter escutará
    const event = new CustomEvent('openFilterDrawer');
    window.dispatchEvent(event);
  };

  const value = {
    openFilterDrawer: handleOpenFilterDrawer,
  };

  return (
    <FilterDrawerContext.Provider value={value}>
      {children}
    </FilterDrawerContext.Provider>
  );
}

export function useFilterDrawer() {
  const context = React.useContext(FilterDrawerContext);
  if (context === undefined) {
    throw new Error('useFilterDrawer must be used within a FilterDrawerProvider');
  }
  return context;
}

export { FilterDrawerContext }; 