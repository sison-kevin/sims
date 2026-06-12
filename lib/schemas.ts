import { z } from "zod";

export const roleSchema = z.enum(["admin", "manager", "staff"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember: z.boolean().default(false),
});

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  sku: z.string().min(3),
  barcode: z.string().min(3),
  category: z.string().min(2),
  price: z.coerce.number().positive(),
  cost_price: z.coerce.number().nonnegative(),
  stock_quantity: z.coerce.number().int().nonnegative(),
  reorder_level: z.coerce.number().int().nonnegative(),
});

export const stockMovementSchema = z.object({
  product_id: z.string().min(1),
  type: z.enum(["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().min(2),
});

export const saleLineSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

export const saleSchema = z.object({
  customer_name: z.string().min(2).optional().default("Walk-in customer"),
  items: z.array(saleLineSchema).min(1),
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: roleSchema,
});

export const workspaceProfileSchema = z.object({
  fullName: z.string().min(3, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  avatarUrl: z.string().url().optional(),
});

export const profileSchema = workspaceProfileSchema;

export const workspaceCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  businessAddress: z.string().min(10, "Enter a complete business address."),
  currency: z.string().min(1, "Select a currency."),
  timezone: z.string().min(1, "Select a timezone."),
  logoUrl: z.string().url().optional(),
});

export const workspaceSecuritySchema = z.object({
  twoFactor: z.boolean(),
  requireSessionConfirm: z.boolean(),
});

export const workspaceNotificationsSchema = z.object({
  lowStock: z.boolean(),
  sales: z.boolean(),
  inventory: z.boolean(),
  email: z.boolean(),
});

export const workspaceInventoryRulesSchema = z.object({
  reorderLevel: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  autoDeduct: z.boolean(),
  skuFormat: z.string().min(1),
});

export const workspaceAppearanceSchema = z.object({
  themeMode: z.enum(["light", "dark"]),
  density: z.enum(["compact", "comfortable"]),
  accent: z.enum(["teal", "blue", "violet", "slate"]),
});

export const workspaceSettingsSchema = z.object({
  profile: workspaceProfileSchema,
  company: workspaceCompanySchema,
  security: workspaceSecuritySchema,
  notifications: workspaceNotificationsSchema,
  inventoryRules: workspaceInventoryRulesSchema,
  appearance: workspaceAppearanceSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Enter your current password."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;
export type SaleFormValues = z.infer<typeof saleSchema>;
export type WorkspaceSettingsFormValues = z.infer<typeof workspaceSettingsSchema>;