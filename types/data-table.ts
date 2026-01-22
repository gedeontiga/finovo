import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    label?: string;
    filterable?: boolean;
    filterVariant?: "text" | "select" | "date" | "range";
  }
}
