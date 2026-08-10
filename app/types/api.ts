export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'store_keeper' | 'cashier';
  mfaEnabled: boolean;
  branchId: string;
  branchName?: string;
  profileImageUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  mfaToken?: string;
  requiresMfa: boolean;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface SetupMfaResponse {
  qrCodeUrl: string;
  manualEntryKey: string;
}

export interface VerifyMfaRequest {
  code: string;
  mfaToken?: string;
}

export interface MfaEnableRequest {
  code: string;
}

export interface MfaDisableRequest {
  password: string;
  code: string;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

export interface Session {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface LoginHistoryEntry {
  id: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  createdAt: string;
}

export interface LoginHistoryResponse {
  data: LoginHistoryEntry[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UpdateNameRequest {
  name: string;
}

export interface UpdateNameResponse {
  user: User;
}

export interface UploadImageResponse {
  profileImageUrl: string;
}

export interface ApiError {
  status: number;
  data: {
    message: string;
    error?: string;
  };
}

export interface Item {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  unit: string;
  strength?: string;
  reorderLevel: number;
  isControlledSubstance: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  name: string;
  genericName?: string;
  category?: string;
  unit: string;
  reorderLevel?: number;
  isControlledSubstance?: boolean;
}

export type UpdateItemDto = Partial<CreateItemDto>;

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  licenseNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  address?: string;
  licenseNo?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export interface Batch {
  id: string;
  goodsReceiptId: string;
  itemId: string;
  itemName: string;
  batchNo: string;
  expiryDate: string;
  quantityReceived: number;
  unitCost: number;
  sellingPrice?: number;
  markupPercentage?: number;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentDueDateType =
  | 'one_month'
  | 'two_months'
  | 'six_months'
  | 'one_year'
  | 'other';

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  receiptDate: string;
  totalCost: number;
  invoiceDocumentUrl?: string;
  taxPaid: boolean;
  paymentDueDate: string;
  paymentDueDateType: PaymentDueDateType;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptDetail extends GoodsReceipt {
  supplierPhone?: string;
  branchName?: string;
  createdBy?: string;
  items: Batch[];
}

export interface CreateGoodsReceiptItemDto {
  itemId: string;
  batchNo: string;
  expiryDate: string;
  quantityReceived: number;
  unitCost: number;
  markupPercentage?: number;
  sellingPrice?: number;
}

export interface CreateGoodsReceiptDto {
  supplierId: string;
  branchId?: string;
  grnNumber?: string;
  receiptDate: string;
  items: CreateGoodsReceiptItemDto[];
  taxPaid?: boolean;
  paymentDueDateType?: PaymentDueDateType;
  paymentDueDate?: string;
}

export interface Payment {
  id: string;
  supplierId: string;
  grnId: string;
  grnNumber: string;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  notes?: string;
  createdAt: string;
}

export interface CreatePaymentDto {
  supplierId: string;
  grnId: string;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  notes?: string;
}

export interface SupplierBalance {
  supplierId: string;
  supplierName: string;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
}

export interface GrnBalance {
  grnId: string;
  grnNumber: string;
  totalCost: number;
  totalPaid: number;
  outstanding: number;
}

export interface SupplierBalanceSummary {
  supplierId: string;
  supplierName: string;
  totalOwed: number;
  totalPaid: number;
  outstanding: number;
  grnCount: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'store' | 'dispatcher';
  branchId: string;
}

export interface Transfer {
  id: string;
  batchId: string;
  batchNo: string;
  itemId: string;
  itemName: string;
  quantity: number;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  transferredBy: string;
  transferredByName: string;
  transferDate: string;
  createdAt: string;
}

export interface CreateTransferDto {
  batchId: string;
  quantity: number;
  fromLocationId?: string;
  toLocationId?: string;
}

export interface StockByLocationRow {
  itemId: string;
  itemName: string;
  storeQuantity: number;
  dispatcherQuantity: number;
  totalQuantity: number;
  totalValueAtCost?: number;
  sellingPrice?: number;
}

export interface FefoSuggestion {
  batchId: string;
  batchNo: string;
  expiryDate: string;
  availableQuantity: number;
  daysUntilExpiry: number;
  sellingPrice: number;
}

export interface FefoSuggestionResponse {
  itemId: string;
  locationId: string;
  quantityNeeded: number;
  suggestions: FefoSuggestion[];
  totalAvailable: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export interface SaleItem {
  id: string;
  saleId: string;
  itemId: string;
  itemName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  returnedQuantity: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string | null;
  customerName: string | null;
  branchId: string;
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'credit';
  totalAmount: number;
  soldById: string;
  soldByName: string;
  saleDate: string;
  receiptGenerated: boolean;
  createdAt: string;
}

export interface SaleDetail extends Sale {
  items: SaleItem[];
  receiptUrl?: string;
}

export interface CreateSaleItemDto {
  itemId: string;
  quantity: number;
  batchId?: string;
}

export interface CreateSaleDto {
  customerId?: string;
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'credit';
  items: CreateSaleItemDto[];
}

export interface SaleReturn {
  id: string;
  saleId: string;
  saleItemId: string;
  quantity: number;
  reason: string;
  processedById: string;
  processedByName: string;
  returnDate: string;
  createdAt: string;
}

export interface CreateSaleReturnDto {
  saleItemId: string;
  quantity: number;
  reason: string;
}

export interface CustomerPurchaseHistory {
  saleId: string;
  saleNumber: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
  items: { itemName: string; quantity: number; unitPrice: number }[];
}

export interface TraceResult {
  batchId: string;
  batchNumber: string;
  itemName: string;
  itemGenericName?: string;
  expiryDate: string;
  supplierName: string;
  supplierPhone?: string;
  supplierLicenseNumber?: string;
  grnNumber: string;
  receiptDate: string;
  invoiceDocumentUrl?: string;
  documentUnavailable?: boolean;
  totalCost: number;
  paidAmount: number;
  outstanding: number;
  storeQuantity: number;
  dispatcherQuantity: number;
  totalSold: number;
  salesHistory: TraceSaleEntry[];
  transferHistory: TraceTransferEntry[];
}

export interface TraceSaleEntry {
  saleId: string;
  saleNumber: string;
  saleDate: string;
  quantity: number;
  customerName: string | null;
  soldByName: string;
}

export interface TraceTransferEntry {
  transferId: string;
  transferDate: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  transferredByName: string;
}

export interface RecallImpact {
  batchId: string;
  batchNumber: string;
  itemName: string;
  expiryDate: string;
  currentStock: { store: number; dispatcher: number };
  salesRecipients: RecallRecipient[];
}

export interface RecallRecipient {
  customerName: string | null;
  customerPhone?: string;
  saleNumber: string;
  saleDate: string;
  quantityReceived: number;
}

export interface Notification {
  id: string;
  type: 'zero_stock' | 'low_stock' | 'near_expiry' | 'expired';
  message: string;
  itemId?: string;
  itemName?: string;
  batchId?: string;
  batchNumber?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  zeroStock: number;
  lowStock: number;
  nearExpiry: number;
  expired: number;
}
 
export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  profit: number;
  expenses: number;
  creditSales: number;
}
 
export interface SparklinePoint {
  date: string;
  sales: number;
  profit: number;
  creditSales: number;
  stockOnHand: number;
  lowStockAlerts: number;
  expiringSoonAlerts: number;
  auditEntries: number;
}
 
export interface CategoryBreakdownPoint {
  category: string;
  count: number;
}
 
export interface DashboardSummary {
  todaySales: { totalAmount: number; transactionCount: number };
  todayProfit: { estimatedProfit: number; margin: number };
  expiringStock: { within30Days: number; within60Days: number; within90Days: number };
  topSellers: { itemId: string; itemName: string; revenue: number; quantity: number }[];
  notificationSummary: NotificationSummary;
}

export interface ReorderSuggestion {
  itemId: string;
  itemName: string;
  genericName?: string;
  currentStock: number;
  reorderLevel: number;
  suggestedQuantity: number;
  lastSupplierName?: string;
  lastSupplierId?: string;
  daysOutOfStock: number;
}

export interface DeadStockItem {
  itemId: string;
  itemName: string;
  genericName?: string;
  currentStock: number;
  totalValue: number;
  lastSoldDate: string | null;
  daysSinceLastSale: number | null;
}

export interface ExpiryBatch {
  batchId: string;
  batchNo: string;
  expiryDate: string;
  itemName: string;
  locationName: string;
  quantity: number;
  unitCost: number;
  isExpired: boolean;
}

export interface SalesReportLine {
  saleId: string;
  saleDate: string;
  itemName: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  totalAmount: number;
  paymentMethod: string;
  soldByName: string;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalProfit: number;
  totalItems: number;
  transactionCount: number;
}

export interface ExpiryReportBatch {
  batchId: string;
  batchNo: string;
  expiryDate: string;
  itemName: string;
  locationName: string;
  quantity: number;
  unitCost: number;
  isExpired: boolean;
}

export interface DeadStockItem {
  itemId: string;
  itemName: string;
  totalQuantityOnHand: number;
  tiedUpValue: number;
  daysSinceLastSale: number | null;
}
