"use client";

import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface AccordionItemProps {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ 
  items, 
  allowMultiple = false, 
  defaultOpen = [],
  className 
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems(prev => prev.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className={twMerge('space-y-3', className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <div 
            key={item.id}
            className="border border-pharos-slate-300 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-md"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-pharos-blue-500 focus:ring-inset transition-colors hover:bg-pharos-offwhite"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <span className="font-semibold text-pharos-navy-900 text-base">
                {item.title}
              </span>
              
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={twMerge(
                  'transition-transform duration-200 text-pharos-blue-500 flex-shrink-0 ml-4',
                  isOpen && 'rotate-180'
                )}
              >
                <path 
                  d="M5 7.5L10 12.5L15 7.5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <div
              id={`accordion-content-${item.id}`}
              className={twMerge(
                'overflow-hidden transition-all duration-200',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
              aria-hidden={!isOpen}
            >
              <div className="px-6 pb-4 text-pharos-slate-700 text-base leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Accordion };

