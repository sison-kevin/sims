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

export class InventoryError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "InventoryError";
    this.status = status;
  }
}

type ProductFilters = { query?: string; category?: string; lowStockOnly?: boolean };
type MovementFilters = { productId?: string; type?: StockMovementType };
type WorkspaceSettings = import("./schemas").WorkspaceSettingsFormValues;

type SaleWithItems = Prisma.salesGetPayload<{ include: { sale_items: { include: { products: true } } } }>;

function isPrismaConnectionError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const name = typeof error === "object" && error && "name" in error
    ? String((error as { name?: unknown }).name ?? "")
    : "";
  const message = typeof error === "object" && error && "message" in error
    ? String((error as { message?: unknown }).message ?? "")
    : typeof error === "string"
      ? error
      : "";

  if (code === "P1001" || code === "P1002" || code === "P2021") {
    return true;
  }

  if (name === "PrismaClientInitializationError" || name === "PrismaClientUnknownRequestError") {
    return /can't reach database server|database server at .*:\d+|server selection timeout|ECONNREFUSED|ETIMEDOUT/i.test(message);
  }

  return /can't reach database server|database server at .*:\d+|server selection timeout|ECONNREFUSED|ETIMEDOUT/i.test(message);
}

function isMissingWorkspaceSettingsTableError(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = String((error as { code?: string }).code ?? "");
    return code === "42P01";
  }

  return typeof error === "string" && error.includes("relation \"workspace_settings\" does not exist");
}

async function withDbFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isPrismaConnectionError(error) || fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function asFloat(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function asDateString(value: Date) {
  return value.toISOString();
}

function toUserRecord(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  // Prisma may return either `passwordHash` (camelCase) or `password_hash` (snake_case)
  passwordHash?: string;
  password_hash?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}): UserRecord {
  const passwordHash = user.passwordHash ?? user.password_hash ?? "";
  const avatarUrl = user.avatarUrl ?? user.avatar_url ?? null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    passwordHash,
    avatarUrl,
  };
}

function toProductRecord(product: {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: Prisma.Decimal;
  cost_price: Prisma.Decimal;
  stock_quantity: number;
  reorder_level: number;
  created_at: Date;
}): ProductRecord {
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

function toMovementRecord(movement: {
  id: string;
  product_id: string;
  user_id: string;
  type: string;
  quantity: number;
  reason: string;
  balance_after: number;
  timestamp: Date;
}): StockMovementRecord {
  return {
    id: movement.id,
    product_id: movement.product_id,
    user_id: movement.user_id,
    type: movement.type as StockMovementType,
    quantity: movement.quantity,
    reason: movement.reason,
    balance_after: movement.balance_after,
    timestamp: asDateString(movement.timestamp),
  };
}

function toAuditLogRecord(log: {
  id: string;
  user_id: string;
  action: string;
  description: string;
  timestamp: Date;
}): AuditLogRecord {
  return {
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    description: log.description,
    timestamp: asDateString(log.timestamp),
  };
}

function toSaleRecord(sale: SaleWithItems): SaleRecord {
  return {
    id: sale.id,
    sale_number: sale.sale_number,
    user_id: sale.user_id,
    customer_name: sale.customer_name,
    subtotal: asFloat(sale.subtotal),
    total: asFloat(sale.total),
    created_at: asDateString(sale.created_at),
    items: sale.sale_items.map((item) => ({
      product_id: item.product_id,
      product_name: item.products.name,
      sku: item.products.sku,
      quantity: item.quantity,
      unit_price: asFloat(item.unit_price),
      line_total: asFloat(item.line_total),
    })),
  };
}

async function logAction(user: SessionUser, action: string, description: string) {
  await prisma.audit_logs.create({
    data: {
      user_id: user.id,
      action,
      description,
    },
  });
}

function makeSaleNumber(seed: number) {
  return `SAL-${1000 + seed + 1}`;
}

async function findProductOrThrow(productId: string) {
  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) {
    throw new InventoryError("Product not found", 404);
  }

  return product;
}

function matchesCategory(productCategory: string, category?: string) {
  if (!category) {
    return true;
  }

  return productCategory.toLowerCase() === category.trim().toLowerCase();
}

async function ensureWorkspaceSettingsTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS workspace_settings (
        id text PRIMARY KEY DEFAULT 'singleton',
        profile jsonb NOT NULL DEFAULT '{}'::jsonb,
        company jsonb NOT NULL DEFAULT '{}'::jsonb,
        security jsonb NOT NULL DEFAULT '{}'::jsonb,
        notifications jsonb NOT NULL DEFAULT '{}'::jsonb,
        inventory_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
        appearance jsonb NOT NULL DEFAULT '{}'::jsonb,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await prisma.$executeRaw`
      INSERT INTO workspace_settings (
        id,
        profile,
        company,
        security,
        notifications,
        inventory_rules,
        appearance
      ) VALUES (
        'singleton',
        ${JSON.stringify(defaultWorkspaceSettings.profile)}::jsonb,
        ${JSON.stringify(defaultWorkspaceSettings.company)}::jsonb,
        ${JSON.stringify(defaultWorkspaceSettings.security)}::jsonb,
        ${JSON.stringify(defaultWorkspaceSettings.notifications)}::jsonb,
        ${JSON.stringify(defaultWorkspaceSettings.inventoryRules)}::jsonb,
        ${JSON.stringify(defaultWorkspaceSettings.appearance)}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
    `;
  } catch (error) {
    if (isMissingWorkspaceSettingsTableError(error)) {
      return;
    }

    throw error;
  }
}

const defaultWorkspaceSettings: WorkspaceSettings = {
  profile: { fullName: "Maya Chen", email: "maya@simventory.com" },
  company: {
    companyName: "Simventory Retail Group",
    businessAddress: "24 Makati Avenue, Makati City, Metro Manila",
    currency: "PHP",
    timezone: "Asia/Manila",
    logoUrl: undefined,
  },
  security: { twoFactor: true, requireSessionConfirm: true },
  notifications: { lowStock: true, sales: true, inventory: true, email: false },
  inventoryRules: { reorderLevel: 12, lowStockThreshold: 8, autoDeduct: true, skuFormat: "SKU-{category}-{number}" },
  appearance: defaultAppearancePreferences,
};

let ensureUsersTableReadyPromise: Promise<void> | null = null;

async function ensureUsersTableReady() {
  if (!ensureUsersTableReadyPromise) {
    ensureUsersTableReadyPromise = prisma.$executeRaw`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text
    `.then(() => undefined);
  }

  return ensureUsersTableReadyPromise;
}

function toWorkspaceSettings(record: {
  profile: Prisma.JsonValue;
  company: Prisma.JsonValue;
  security: Prisma.JsonValue;
  notifications: Prisma.JsonValue;
  inventory_rules: Prisma.JsonValue;
  appearance: Prisma.JsonValue;
}): WorkspaceSettings {
  const parsed = workspaceSettingsSchema.safeParse({
    profile: record.profile,
    company: record.company,
    security: record.security,
    notifications: record.notifications,
    inventoryRules: record.inventory_rules,
    appearance: record.appearance,
  });

  return parsed.success ? parsed.data : defaultWorkspaceSettings;
}

export async function getUserByEmail(email: string) {
  await ensureUsersTableReady();
  const parsed = loginSchema.pick({ email: true }).safeParse({ email });
  if (!parsed.success) {
    return undefined;
  }

  const user = await withDbFallback(
    () => prisma.users.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    }),
    null,
  );

  return user ? toUserRecord(user) : undefined;
}

export async function listUsers() {
  await ensureUsersTableReady();
  const users = await withDbFallback(
    () => prisma.users.findMany({ orderBy: { created_at: "asc" } }),
    [],
  );
  return users.map(toUserRecord);
}

export async function getCurrentUser(userId: string) {
  await ensureUsersTableReady();
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) {
    throw new InventoryError("User not found", 404);
  }

  return toUserRecord(user);
}

export async function getWorkspaceSettings() {
  const settings = await withDbFallback(
    async () => {
      await ensureWorkspaceSettingsTable();
      const rows = await prisma.$queryRaw<Array<{
        id: string;
        profile: Prisma.JsonValue;
        company: Prisma.JsonValue;
        security: Prisma.JsonValue;
        notifications: Prisma.JsonValue;
        inventory_rules: Prisma.JsonValue;
        appearance: Prisma.JsonValue;
      }>>`
        SELECT id, profile, company, security, notifications, inventory_rules, appearance
        FROM workspace_settings
        WHERE id = 'singleton'
        LIMIT 1
      `;

      return rows[0] ?? null;
    },
    null,
  );

  if (!settings) {
    return defaultWorkspaceSettings;
  }

  return toWorkspaceSettings(settings);
}

export async function upsertWorkspaceSettings(values: WorkspaceSettings, actor?: SessionUser) {
  const parsed = workspaceSettingsSchema.parse(values);
  await ensureWorkspaceSettingsTable();
  const [saved] = await prisma.$queryRaw<Array<{
    id: string;
    profile: Prisma.JsonValue;
    company: Prisma.JsonValue;
    security: Prisma.JsonValue;
    notifications: Prisma.JsonValue;
    inventory_rules: Prisma.JsonValue;
    appearance: Prisma.JsonValue;
  }>>`
    INSERT INTO workspace_settings (
      id,
      profile,
      company,
      security,
      notifications,
      inventory_rules,
      appearance
    ) VALUES (
      'singleton',
      ${JSON.stringify(parsed.profile)}::jsonb,
      ${JSON.stringify(parsed.company)}::jsonb,
      ${JSON.stringify(parsed.security)}::jsonb,
      ${JSON.stringify(parsed.notifications)}::jsonb,
      ${JSON.stringify(parsed.inventoryRules)}::jsonb,
      ${JSON.stringify(parsed.appearance)}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      profile = EXCLUDED.profile,
      company = EXCLUDED.company,
      security = EXCLUDED.security,
      notifications = EXCLUDED.notifications,
      inventory_rules = EXCLUDED.inventory_rules,
      appearance = EXCLUDED.appearance,
      updated_at = NOW()
    RETURNING id, profile, company, security, notifications, inventory_rules, appearance
  `;

  if (actor) {
    await logAction(actor, "SETTINGS_UPDATED", "Updated workspace settings.");
  }

  return toWorkspaceSettings(saved);
}

export async function createUser(values: unknown, actor?: { id: string; name: string }) {
  await ensureUsersTableReady();
  const payload = values as { name?: string; email?: string; password?: string; role?: string };
  if (!payload.name || !payload.email || !payload.password) {
    throw new InventoryError("Name, email and password are required", 400);
  }

  const email = payload.email.trim().toLowerCase();
  const role = (payload.role ?? "staff") as string;

  try {
    const created = await prisma.users.create({
      data: {
        id: `usr_${randomUUID()}`,
        name: payload.name,
        email,
        role,
        password_hash: hashPassword(payload.password),
      },
    });

    if (actor) {
      await prisma.audit_logs.create({
        data: {
          user_id: actor.id,
          action: "USER_CREATED",
          description: `Created user ${created.email} (${created.role})`,
        },
      });
    }

    return toUserRecord(created);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new InventoryError("Email already exists", 409);
    }

    throw error;
  }
}

export async function updateUserRole(userId: string, role: string, actor?: SessionUser) {
  await ensureUsersTableReady();
  const updated = await prisma.users.update({
    where: { id: userId },
    data: { role },
  });

  if (actor) {
    await logAction(actor, "USER_ROLE_UPDATED", `Updated ${updated.email} role to ${updated.role}.`);
  }

  return toUserRecord(updated);
}

export async function deleteUserById(userId: string, actor?: SessionUser) {
  await ensureUsersTableReady();
  const deleted = await prisma.users.delete({ where: { id: userId } });

  if (actor) {
    await logAction(actor, "USER_DELETED", `Deleted user ${deleted.email}.`);
  }

  return toUserRecord(deleted);
}

export async function updateCurrentUserProfile(userId: string, values: unknown) {
  await ensureUsersTableReady();
  const parsed = profileSchema.parse(values);

  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      name: parsed.fullName,
      email: parsed.email.toLowerCase(),
      avatar_url: parsed.avatarUrl,
    },
  });

  return toUserRecord(updated);
}

export async function changeCurrentUserPassword(userId: string, values: unknown) {
  await ensureUsersTableReady();
  const parsed = passwordChangeSchema.parse(values);
  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user) {
    throw new InventoryError("User not found", 404);
  }

  if (user.password_hash !== hashPassword(parsed.currentPassword)) {
    throw new InventoryError("Current password is incorrect", 400);
  }

  await prisma.users.update({
    where: { id: user.id },
    data: { password_hash: hashPassword(parsed.newPassword) },
  });

  return toUserRecord(user);
}

export async function listProducts(filters?: ProductFilters) {
  const query = filters?.query?.trim();
  const category = filters?.category?.trim();

  const products = await withDbFallback(
    () => prisma.products.findMany({
      orderBy: { created_at: "desc" },
    }),
    [],
  );

  return products
    .map(toProductRecord)
    .filter((product) => {
      const matchesQuery = !query
        || [product.name, product.sku, product.barcode].some((value) => value.toLowerCase().includes(query.toLowerCase()));
      const matchesSelectedCategory = matchesCategory(product.category, category);
      const matchesStock = !filters?.lowStockOnly || product.stock_quantity <= product.reorder_level;

      return matchesQuery && matchesSelectedCategory && matchesStock;
    });
}

export async function listCategories() {
  const products = await withDbFallback(
    () => prisma.products.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    [],
  );

  return products.map((product) => product.category).sort();
}

export async function createProduct(values: unknown, actor: SessionUser) {
  const parsed = productSchema.parse(values);

  let product;
  try {
    product = await prisma.products.create({
      data: {
        id: parsed.id ?? `prd_${randomUUID()}`,
        name: parsed.name,
        sku: parsed.sku,
        barcode: parsed.barcode,
        category: parsed.category,
        price: parsed.price,
        cost_price: parsed.cost_price,
        stock_quantity: parsed.stock_quantity,
        reorder_level: parsed.reorder_level,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new InventoryError("SKU or barcode already exists", 409);
    }

    throw error;
  }

  await prisma.stock_movements.create({
    data: {
      product_id: product.id,
      user_id: actor.id,
      type: "STOCK_IN",
      quantity: product.stock_quantity,
      reason: "New product onboarding",
      balance_after: product.stock_quantity,
    },
  });

  await prisma.audit_logs.create({
    data: {
      user_id: actor.id,
      action: "PRODUCT_CREATED",
      description: `Created product ${product.name} (${product.sku}).`,
    },
  });

  return toProductRecord(product);
}

export async function updateProduct(values: unknown, actor: SessionUser) {
  const parsed = productSchema.parse(values);
  if (!parsed.id) {
    throw new InventoryError("Product id is required", 400);
  }

  const product = await prisma.products.findUnique({ where: { id: parsed.id } });
  if (!product) {
    throw new InventoryError("Product not found", 404);
  }

  let updated;
  try {
    updated = await prisma.products.update({
      where: { id: product.id },
      data: {
        name: parsed.name,
        sku: parsed.sku,
        barcode: parsed.barcode,
        category: parsed.category,
        price: parsed.price,
        cost_price: parsed.cost_price,
        stock_quantity: parsed.stock_quantity,
        reorder_level: parsed.reorder_level,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new InventoryError("SKU or barcode already exists", 409);
    }

    throw error;
  }

  await prisma.audit_logs.create({
    data: {
      user_id: actor.id,
      action: "PRODUCT_UPDATED",
      description: `Updated product ${updated.name} (${updated.sku}).`,
    },
  });

  return toProductRecord(updated);
}

export async function deleteProduct(productId: string, actor: SessionUser) {
  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) {
    throw new InventoryError("Product not found", 404);
  }

  const deleted = await prisma.products.delete({ where: { id: product.id } });
  await prisma.audit_logs.create({
    data: {
      user_id: actor.id,
      action: "PRODUCT_DELETED",
      description: `Deleted product ${deleted.name} (${deleted.sku}).`,
    },
  });

  return toProductRecord(deleted);
}

export async function adjustStock(values: unknown, actor: SessionUser) {
  const parsed = stockMovementSchema.parse(values);
  const product = await findProductOrThrow(parsed.product_id);
  const delta = parsed.type === "STOCK_OUT" ? -parsed.quantity : parsed.quantity;
  const nextBalance = product.stock_quantity + delta;

  if (nextBalance < 0) {
    throw new InventoryError("Stock cannot go below zero", 400);
  }

  const movement = await prisma.$transaction(async (tx) => {
    await tx.products.update({
      where: { id: product.id },
      data: { stock_quantity: nextBalance },
    });

    const created = await tx.stock_movements.create({
      data: {
        product_id: product.id,
        user_id: actor.id,
        type: parsed.type,
        quantity: parsed.quantity,
        reason: parsed.reason,
        balance_after: nextBalance,
      },
    });

    await tx.audit_logs.create({
      data: {
        user_id: actor.id,
        action: "STOCK_MOVEMENT",
        description: `${parsed.type} recorded for ${product.name}: ${parsed.quantity}.`,
      },
    });

    return created;
  });

  return toMovementRecord(movement);
}

export async function createSale(values: unknown, actor: SessionUser) {
  const parsed = saleSchema.parse(values);
  const sale = await prisma.$transaction(async (tx) => {
    const productSnapshots = await Promise.all(
      parsed.items.map(async (item) => ({
        product: await tx.products.findUnique({ where: { id: item.product_id } }),
        quantity: item.quantity,
      })),
    );

    for (const snapshot of productSnapshots) {
      if (!snapshot.product) {
        throw new InventoryError("Product not found", 404);
      }
      if (snapshot.product.stock_quantity < snapshot.quantity) {
        throw new InventoryError(`Insufficient stock for ${snapshot.product.name}`, 400);
      }
    }

    const saleCount = await tx.sales.count();
    const saleItemsData = productSnapshots.map(({ product, quantity }) => {
      if (!product) {
        throw new InventoryError("Product not found", 404);
      }

      const lineTotal = asFloat(product.price) * quantity;
      return {
        product,
        quantity,
        lineTotal,
      };
    });

    const subtotal = saleItemsData.reduce((sum, item) => sum + item.lineTotal, 0);
    const createdSale = await tx.sales.create({
      data: {
        sale_number: makeSaleNumber(saleCount),
        user_id: actor.id,
        customer_name: parsed.customer_name ?? "Walk-in customer",
        subtotal,
        total: subtotal,
        sale_items: {
          create: saleItemsData.map(({ product, quantity, lineTotal }) => ({
            product_id: product.id,
            quantity,
            unit_price: product.price,
            line_total: lineTotal,
          })),
        },
      },
      include: { sale_items: { include: { products: true } } },
    });

    for (const { product, quantity } of saleItemsData) {
      await tx.products.update({
        where: { id: product.id },
        data: { stock_quantity: product.stock_quantity - quantity },
      });

      await tx.stock_movements.create({
        data: {
          product_id: product.id,
          user_id: actor.id,
          type: "STOCK_OUT",
          quantity,
          reason: "Sale transaction",
          balance_after: product.stock_quantity - quantity,
        },
      });
    }

    await tx.audit_logs.create({
      data: {
        user_id: actor.id,
        action: "SALE_CREATED",
        description: `Recorded sale ${createdSale.sale_number} with ${createdSale.sale_items.length} line items.`,
      },
    });

    return createdSale;
  });

  return toSaleRecord(sale);
}

export async function listSales() {
  const sales = await withDbFallback(
    () => prisma.sales.findMany({
      orderBy: { created_at: "desc" },
      include: { sale_items: { include: { products: true } } },
    }),
    [],
  );

  return sales.map(toSaleRecord);
}

export async function listMovements(filters?: MovementFilters) {
  const movements = await withDbFallback(
    () => prisma.stock_movements.findMany({
      where: {
        product_id: filters?.productId,
        type: filters?.type,
      },
      orderBy: { timestamp: "desc" },
    }),
    [],
  );

  return movements.map(toMovementRecord);
}

export async function listAuditLogs() {
  const logs = await withDbFallback(
    () => prisma.audit_logs.findMany({
      orderBy: { timestamp: "desc" },
    }),
    [],
  );

  return logs.map(toAuditLogRecord);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [products, sales, movements] = await Promise.all([
    withDbFallback(() => prisma.products.findMany(), []),
    withDbFallback(() => prisma.sales.findMany({ select: { id: true } }), []),
    withDbFallback(() => prisma.stock_movements.findMany({ select: { type: true, quantity: true } }), []),
  ]);

  const lowStockItems = products.filter((product) => product.stock_quantity <= product.reorder_level);
  const stockIn = movements.filter((movement) => movement.type === "STOCK_IN").reduce((sum, item) => sum + item.quantity, 0);
  const stockOut = movements.filter((movement) => movement.type === "STOCK_OUT").reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalProducts: products.length,
    totalSales: sales.length,
    lowStockItems: lowStockItems.length,
    inventoryValue: products.reduce((sum, product) => sum + asFloat(product.cost_price) * product.stock_quantity, 0),
    stockIn,
    stockOut,
  };
}

export async function getAnalyticsSeries() {
  const sales = await withDbFallback(() => prisma.sales.findMany({ select: { created_at: true, total: true } }), []);
  const movements = await withDbFallback(() => prisma.stock_movements.findMany({ select: { timestamp: true, type: true, quantity: true } }), []);

  const salesByDate = new Map<string, number>();
  for (const sale of sales) {
    const date = sale.created_at.toISOString().slice(0, 10);
    salesByDate.set(date, (salesByDate.get(date) ?? 0) + asFloat(sale.total));
  }

  const stockInByDate = new Map<string, number>();
  const stockOutByDate = new Map<string, number>();
  for (const movement of movements) {
    const date = movement.timestamp.toISOString().slice(0, 10);
    if (movement.type === "STOCK_IN") {
      stockInByDate.set(date, (stockInByDate.get(date) ?? 0) + movement.quantity);
    }
    if (movement.type === "STOCK_OUT") {
      stockOutByDate.set(date, (stockOutByDate.get(date) ?? 0) + movement.quantity);
    }
  }

  return Array.from(
    new Set([...salesByDate.keys(), ...stockInByDate.keys(), ...stockOutByDate.keys()]),
  )
    .sort()
    .map((date) => ({
      date,
      sales: salesByDate.get(date) ?? 0,
      stockIn: stockInByDate.get(date) ?? 0,
      stockOut: stockOutByDate.get(date) ?? 0,
    }));
}

export async function getAlertProducts() {
  const products = await listProducts();
  return products.filter((product) => product.stock_quantity <= product.reorder_level);
}

export async function getLowStockCritical() {
  const products = await getAlertProducts();
  return products.filter((product) => product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)));
}

export async function listProductsWithStatus(filters?: ProductFilters) {
  const products = await listProducts(filters);
  return products.map((product) => ({
    ...product,
    low_stock: product.stock_quantity <= product.reorder_level,
  }));
}

export async function getProductById(productId: string) {
  return findProductOrThrow(productId).then(toProductRecord);
}

export function getRolesByPath(pathname: string): Role[] {
  if (pathname.startsWith("/users")) {
    return ["admin"];
  }

  if (pathname.startsWith("/analytics") || pathname.startsWith("/audit-logs") || pathname.startsWith("/products")) {
    return ["admin", "manager"];
  }

  return ["admin", "manager", "staff"];
}

export async function getStoreSnapshot() {
  const [users, products, movements, sales, auditLogs] = await Promise.all([
    listUsers(),
    listProducts(),
    listMovements(),
    listSales(),
    listAuditLogs(),
  ]);

  return {
    users,
    products,
    movements,
    sales,
    auditLogs,
  };
}
