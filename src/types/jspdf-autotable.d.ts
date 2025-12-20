/**
 * Type definitions for jspdf-autotable
 */

import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  interface UserOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    columnStyles?: any;
    alternateRowStyles?: any;
    margin?: { top?: number; right?: number; bottom?: number; left?: number } | number;
    pageBreak?: 'auto' | 'avoid' | 'always';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: number | number[];
    tableLineWidth?: number;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}

