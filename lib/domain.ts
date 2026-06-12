export type Role = "admin" | "manager" | "staff";
export type StockMovementType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  avatarUrl?: string | null;
}

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
}

export interface StockMovementRecord {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  user_id: string;
  timestamp: string;
  balance_after: number;
}

export interface SaleItemRecord {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface SaleRecord {
  id: string;
  sale_number: string;
  user_id: string;
  customer_name: string;
  subtotal: number;
  total: number;
  created_at: string;
  items: SaleItemRecord[];
}

export interface AuditLogRecord {
  id: string;
  user_id: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalSales: number;
  lowStockItems: number;
  inventoryValue: number;
  stockIn: number;
  stockOut: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}