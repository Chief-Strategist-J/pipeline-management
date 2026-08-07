"use client";

import React from "react";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage = "No items found." }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-slate-500 text-sm">
        {emptyMessage}
      </GlassCard>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40 backdrop-blur-md">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-white/10 bg-white/5 uppercase text-slate-400 font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-white/5 transition-colors">
              {columns.map((col, idx) => (
                <td key={idx} className="px-4 py-3">
                  {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? "") : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
