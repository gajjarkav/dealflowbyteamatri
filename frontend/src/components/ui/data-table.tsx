"use client";
import React, { useState, useMemo } from "react"
import { Input } from "./input"
import { Button } from "./button"

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  searchKey?: keyof T | ((item: T) => string)
  title?: string
  subtitle?: string
  actionSlot?: React.ReactNode
  pageSize?: number
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchKey,
  title,
  subtitle,
  actionSlot,
  pageSize = 10
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data

    return data.filter((item) => {
      if (typeof searchKey === "function") {
        return searchKey(item).toLowerCase().includes(searchTerm.toLowerCase())
      }
      if (searchKey && item[searchKey]) {
        return String(item[searchKey]).toLowerCase().includes(searchTerm.toLowerCase())
      }
      // Fallback: search across all string values
      return Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [data, searchTerm, searchKey])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden flex flex-col">
      {/* Header bar */}
      {(title || actionSlot || searchPlaceholder) && (
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-text-primary">{title}</h2>}
            {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {searchPlaceholder && (
              <div className="w-full sm:w-64">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-9 text-xs"
                />
              </div>
            )}
            {actionSlot}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50 text-xs font-mono text-text-secondary uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-4 font-medium ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-background/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 text-text-primary ${col.className || ""}`}>
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-text-muted text-sm">
                  No records matching &ldquo;{searchTerm}&rdquo; found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <div className="py-3 px-4 border-t border-border bg-surface flex items-center justify-between text-xs text-text-secondary">
        <div>
          Showing <span className="font-mono font-medium text-text-primary">{paginatedData.length}</span> of{" "}
          <span className="font-mono font-medium text-text-primary">{filteredData.length}</span> items
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-7 px-2.5 text-xs"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            className="h-7 px-2.5 text-xs"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
