// --- Bank List DTOs ---
export interface BankDTO {
  enabled: 1 | 0; // 1 for enabled, 0 for disabled
  name: string;
  value: string; // This is the bank code (e.g., "BOCM01") to be sent to the backend
}

export interface FetchBankListRequestBodyDTO {
  mode: "01" | "02"; // "01" for individual, "02" for corporate
}

export interface FetchBankListResponseDTO {
  banks: BankDTO[];
  success: boolean;
  respCode?: number;
  respDesc?: string;
}

// --- Payment Method Option Type (Frontend State) ---
export type PaymentMethodOption = "card" | "fpx-individual" | "fpx-corporate";

// --- Order Placement DTOs ---
export interface OrderTicketDTO {
  ticketId: string;
  qty: number;
}

// Base DTO for common fields in both paid and free orders
interface BaseOrderTicketGroupRequestBodyDTO {
  ticketGroupId: number;
  identificationNo?: string;
  fullName?: string;
  email?: string;
  contactNo?: string;
  date: string; // Visit date, formatted as "yyyy-MM-dd"
  tickets: OrderTicketDTO[];
}

// DTO for regular (paid) orders
export interface OrderTicketGroupRequestBodyDTO extends BaseOrderTicketGroupRequestBodyDTO {
  paymentType: "fpx" | "credit/debit";
  mode?: "individual" | "corporate"; // Required if paymentType is "fpx"
  bankCode?: string; // Required if paymentType is "fpx"
}

// DTO for free orders (inherits base, excludes payment fields)
export interface FreeOrderTicketGroupRequestBodyDTO extends BaseOrderTicketGroupRequestBodyDTO {
  // No paymentType, mode, or bankCode needed for free orders
}

// Define the expected structure for the 'result' object in a successful PAID order response
export interface PaidOrderPlacementResultDTO {
  orderID?: number; // Corresponds to orderTicketGroupId from backend for paid orders
  redirectURL?: string;
}

// Define the expected structure for the 'result' object in a successful FREE order response
export interface FreeOrderPlacementResultDTO {
  orderNo: string;
  transactionStatus: string;
  orderTicketGroupId: number; // This is the equivalent of orderID for free orders
}

// Define the expected response structure for placing a PAID order
export interface PaidOrderTicketGroupResponseDTO {
  respCode: number;
  respDesc: string;
  result?: PaidOrderPlacementResultDTO;
}

// Define the expected response structure for placing a FREE order
export interface FreeOrderTicketGroupResponseDTO {
  respCode: number;
  respDesc: string;
  result?: FreeOrderPlacementResultDTO;
}

// Generic API Error DTO (can be used by various services)
export interface ApiErrorDTO {
  respCode: number;
  respDesc: string;
  message?: string; // Optional more detailed message
  errors?: Array<{ field: string; message: string }>; // Optional field-specific errors
}

// --- DTOs for fetching Order Ticket Group Details (SINGLE ORDER - for PaymentRedirectPage) ---

export interface ConfirmedOrderTicketInfoDTO {
  orderTicketInfoId: number;
  orderTicketGroupId: number;
  itemId: string;
  unitPrice: number;
  itemDesc1: string;
  itemDesc2?: string;
  printType?: string;
  quantityBought: number;
  encryptedId?: string;
  admitDate: string; // "yyyy-MM-dd"
  variant?: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface ConfirmedOrderProfileDTO {
  orderTicketGroupId: number;
  ticketGroupId: number;
  custId?: string;
  transactionId: string;
  orderNo: string;
  transactionStatus: string; // "success", "failed", "pending"
  statusMessage?: string;
  transactionDate: string; // "yyyy-MM-dd HH:mm:ss" or ISO
  bankCode?: string;
  bankName?: string;
  msgToken?: string;
  billId?: string;
  productId?: string;
  totalAmount: number;
  buyerName: string;
  buyerEmail: string;
  productDesc?: string;
  orderTicketInfo: ConfirmedOrderTicketInfoDTO[];
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  qrCodeUrl?: string;
}

export interface OrderAssociatedTicketProfileDTO {
  ticketGroupId: number;
  groupName: string;
  groupDesc?: string;
  operatingHours?: string;
  uniqueExtension?: string;
}

export interface FetchedOrderDetailsResultDTO {
  orderProfile: ConfirmedOrderProfileDTO;
  ticketProfile: OrderAssociatedTicketProfileDTO;
}

export interface FetchOrderDetailsSuccessResponseDTO {
  respCode: 2000;
  respDesc: string;
  result: FetchedOrderDetailsResultDTO;
}

export interface FetchOrderDetailsErrorResponseDTO {
  respCode: number;
  respDesc: string;
  result: null;
}

export type FetchOrderDetailsResponseDTO = FetchOrderDetailsSuccessResponseDTO | FetchOrderDetailsErrorResponseDTO;

// --- DTOs for fetching Order History (LIST OF ORDERS - for OrderConfirmationPage) ---

export interface OrderHistoryItemDTO {
  orderProfile: ConfirmedOrderProfileDTO;
  ticketProfile: OrderAssociatedTicketProfileDTO;
}

export interface FetchOrderHistoryResultDTO {
  orderTicketGroups: OrderHistoryItemDTO[];
}

export interface FetchOrderHistorySuccessResponseDTO {
  respCode: 2000;
  respDesc: string;
  result: FetchOrderHistoryResultDTO;
}

export interface FetchOrderHistoryErrorResponseDTO {
  respCode: number;
  respDesc: string;
  result: null;
}

export type FetchOrderHistoryResponseDTO = FetchOrderHistorySuccessResponseDTO | FetchOrderHistoryErrorResponseDTO;
