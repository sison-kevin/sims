import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import type {
  AuditLogRecord,
  DashboardMetrics,
  ProductRecord,
  Role,
  SaleRecord,
  SessionUser,
  StockMovementRecord,
  StockMovementType,
  UserRecord,
} from "./domain";

import { hashPassword } from "./auth";
import { prisma } from "./prisma";

import {
  loginSchema,
  productSchema,
  profileSchema,
  passwordChangeSchema,
  saleSchema,
  stockMovementSchema,
  workspaceSettingsSchema,
} from "./schemas";

import { defaultAppearancePreferences } from "./appearance";

/* =========================
   ERROR CLASS
========================= */
export class InventoryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "InventoryError";
    this.status = status;
  }
}

/* =========================
   TYPES
========================= */
type ProductFilters = {
  query?: string;
  category?: string;
  lowStockOnly?: boolean;
};

type MovementFilters = {
  productId?: string;
  type?: StockMovementType;
};

type WorkspaceSettings = import("./schemas").WorkspaceSettingsFormValues;

/* FIX: removed Prisma.salesGetPayload (build-safe) */
type SaleWithItems = any;

/* =========================
   HELPERS
========================= */
function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function asFloat(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function asDateString(value: Date) {
  return value.toISOString();
}

/* =========================
   USER MAPPING
========================= */
function toUserRecord(user: any): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    passwordHash: user.password_hash,
    avatarUrl: user.avatar_url ?? null,
  };
}

/* =========================
   PRODUCT MAPPING
========================= */
function toProductRecord(product: any): ProductRecord {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    category: product.category,
    price: asFloat(product.price),
    cost_price: asFloat(product.cost_price),
    stock_quantity: product.stock_quantity,
    reorder_level: product.reorder_level,
    created_at: asDateString(product.created_at),
  };
}

/* =========================
   MOVEMENT MAPPING
========================= */
function toMovementRecord(m: any): StockMovementRecord {
  return {
    id: m.id,
    product_id: m.product_id,
    user_id: m.user_id,
    type: m.type as StockMovementType,
    quantity: m.quantity,
    reason: m.reason,
    balance_after: m.balance_after,
    timestamp: asDateString(m.timestamp),
  };
}

/* =========================
   AUDIT LOG
========================= */
function toAuditLogRecord(log: any): AuditLogRecord {
  return {
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    description: log.description,
    timestamp: asDateString(log.timestamp),
  };
}

/* =========================
   SALE MAPPING
========================= */
function toSaleRecord(sale: any): SaleRecord {
  return {
    id: sale.id,
    sale_number: sale.sale_number,
    user_id: sale.user_id,
    customer_name: sale.customer_name,
    subtotal: asFloat(sale.subtotal),
    total: asFloat(sale.total),
    created_at: asDateString(sale.created_at),
    items: sale.sale_items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.products.name,
      sku: item.products.sku,
      quantity: item.quantity,
      unit_price: asFloat(item.unit_price),
      line_total: asFloat(item.line_total),
    })),
  };
}

/* =========================
   CORE DB HELPERS
========================= */
async function findProductOrThrow(productId: string) {
  const product = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new InventoryError("Product not found", 404);
  }

  return product;
}

function matchesCategory(productCategory: string, category?: string) {
  if (!category) return true;
  return productCategory.toLowerCase() === category.toLowerCase();
}

/* =========================
   USERS
========================= */
export async function getUserByEmail(email: string) {
  const user = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  return user ? toUserRecord(user) : undefined;
}

export async function listUsers() {
  const users = await prisma.users.findMany({
    orderBy: { created_at: "asc" },
  });

  return users.map(toUserRecord);
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) throw new InventoryError("User not found", 404);

  return toUserRecord(user);
}

/* =========================
   PRODUCTS
========================= */
export async function listProducts(filters?: ProductFilters) {
  const products = await prisma.products.findMany({
    orderBy: { created_at: "desc" },
  });

  return products
    .map(toProductRecord)
    .filter((p) => {
      const query = filters?.query?.toLowerCase();
      const category = filters?.category;

      const matchesQuery =
        !query ||
        [p.name, p.sku, p.barcode].some((v) =>
          v.toLowerCase().includes(query)
        );

      const matchesCat = matchesCategory(p.category, category);

      const matchesStock =
        !filters?.lowStockOnly ||
        p.stock_quantity <= p.reorder_level;

      return matchesQuery && matchesCat && matchesStock;
    });
}

export async function getProductById(id: string) {
  const product = await findProductOrThrow(id);
  return toProductRecord(product);
}

/* =========================
   STOCK MOVEMENTS
========================= */
export async function listMovements(filters?: MovementFilters) {
  const movements = await prisma.stock_movements.findMany({
    where: {
      product_id: filters?.productId,
      type: filters?.type,
    },
    orderBy: { timestamp: "desc" },
  });

  return movements.map(toMovementRecord);
}

/* =========================
   SALES
========================= */
export async function listSales() {
  const sales = await prisma.sales.findMany({
    orderBy: { created_at: "desc" },
    include: { sale_items: { include: { products: true } } },
  });

  return sales.map(toSaleRecord);
}

/* =========================
   DASHBOARD
========================= */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [products, sales, movements] = await Promise.all([
    prisma.products.findMany(),
    prisma.sales.findMany({ select: { id: true } }),
    prisma.stock_movements.findMany({
      select: { type: true, quantity: true },
    }),
  ]);

  const lowStockItems = products.filter(
    (p) => p.stock_quantity <= p.reorder_level
  );

  const stockIn = movements
    .filter((m) => m.type === "STOCK_IN")
    .reduce((a, b) => a + b.quantity, 0);

  const stockOut = movements
    .filter((m) => m.type === "STOCK_OUT")
    .reduce((a, b) => a + b.quantity, 0);

  return {
    totalProducts: products.length,
    totalSales: sales.length,
    lowStockItems: lowStockItems.length,
    inventoryValue: products.reduce(
      (sum, p) => sum + asFloat(p.cost_price) * p.stock_quantity,
      0
    ),
    stockIn,
    stockOut,
  };
}

/* =========================
   EXPORT SAFE DEFAULT
========================= */
export async function getStoreSnapshot() {
  const [users, products, movements, sales] = await Promise.all([
    listUsers(),
    listProducts(),
    listMovements(),
    listSales(),
  ]);

  return { users, products, movements, sales };
}