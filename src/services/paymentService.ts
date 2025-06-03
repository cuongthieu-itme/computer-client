// src/services/paymentService.ts
import apiClient from '@/lib/apiClient';
import axios from 'axios';
import {
  FetchBankListRequestBodyDTO,
  FetchBankListResponseDTO,
  OrderTicketGroupRequestBodyDTO,
  FreeOrderTicketGroupRequestBodyDTO,
  PaidOrderTicketGroupResponseDTO,
  FreeOrderTicketGroupResponseDTO,
  FetchOrderDetailsResponseDTO,
  FetchOrderDetailsErrorResponseDTO, 
  FetchOrderHistoryResponseDTO,
  FetchOrderHistoryErrorResponseDTO,
} from '@/types/api/payment.api';

// Request DTO for non-member order inquiry (used for query params)
export interface NonMemberOrderInquiryRequestParamsDTO { // Renamed for clarity as it's for GET params
  orderNo: string;
  email: string;
}

// Response for non-member inquiry remains the same as FetchOrderDetailsResponseDTO
export type NonMemberOrderInquiryResponseDTO = FetchOrderDetailsResponseDTO;


/**
 * Fetches the list of banks for FPX payment.
 * API: POST /payment/bankList
 */
export const fetchBankList = async (
  mode: "01" | "02"
): Promise<FetchBankListResponseDTO> => {
  const requestBody: FetchBankListRequestBodyDTO = { mode };
  try {
    const response = await apiClient.post<FetchBankListResponseDTO>('/payment/bankList', requestBody); 
    
    if (response.data.respCode !== 2000 && !response.data.success) { 
        const errorMsg = response.data.respDesc || 'Failed to fetch bank list or no banks available for the selected mode.';
        console.error("Bank list API error:", errorMsg, response.data);
        throw new Error(errorMsg);
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching bank list for mode ${mode}:`, error);
    throw error; 
  }
};

/**
 * Places an order for a ticket group (paid order).
 * API: POST /api/orderTicketGroup
 */
export const placeOrderTicketGroup = async (
  payload: OrderTicketGroupRequestBodyDTO
): Promise<PaidOrderTicketGroupResponseDTO> => { 
  try {
    const processedPayload = { ...payload, ticketGroupId: Number(payload.ticketGroupId) };
    const response = await apiClient.post<PaidOrderTicketGroupResponseDTO>('/api/orderTicketGroup', processedPayload);
    return response.data;
  } catch (error) {
    console.error("Error placing paid order:", error);
    throw error;
  }
};

/**
 * Places a free order for a ticket group.
 * API: POST /api/orderTicketGroup/free
 */
export const placeFreeOrderTicketGroup = async (
    payload: FreeOrderTicketGroupRequestBodyDTO
): Promise<FreeOrderTicketGroupResponseDTO> => { 
    try {
        const processedPayload = {
            ...payload,
            ticketGroupId: Number(payload.ticketGroupId)
        };
        const response = await apiClient.post<FreeOrderTicketGroupResponseDTO>('/api/orderTicketGroup/free', processedPayload);
        return response.data;
    } catch (error) {
        console.error("Error placing free order in service:", error);
        throw error;
    }
};


/**
 * Fetches the details of a specific order ticket group by its ID.
 * Used by PaymentRedirectPage.
 * API: GET /api/orderTicketGroup?orderTicketGroupId={id}
 */
export const fetchOrderDetails = async (
  orderTicketGroupId: string
): Promise<FetchOrderDetailsResponseDTO> => {
  if (!orderTicketGroupId || orderTicketGroupId.trim() === "") {
    return Promise.resolve({
      respCode: 400, 
      respDesc: "Order Ticket Group ID is required.",
      result: null,
    } as FetchOrderDetailsErrorResponseDTO);
  }
  try {
    const response = await apiClient.get<FetchOrderDetailsResponseDTO>(`/api/orderTicketGroup`, {
        params: { orderTicketGroupId: orderTicketGroupId } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for ID ${orderTicketGroupId}:`, error);
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      return error.response.data as FetchOrderDetailsErrorResponseDTO;
    }
    return Promise.resolve({
      respCode: 500, 
      respDesc: "Failed to fetch order details due to a network or server error.",
      result: null,
    } as FetchOrderDetailsErrorResponseDTO);
  }
};

/**
 * Fetches the order history for the logged-in user.
 * API: GET /api/orderTicketGroups
 */
export const fetchUserOrderHistory = async (): Promise<FetchOrderHistoryResponseDTO> => {
  try {
    const response = await apiClient.get<FetchOrderHistoryResponseDTO>('/api/orderTicketGroups');
    return response.data;
  } catch (error) {
    console.error("Error fetching user order history:", error);
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      return error.response.data as FetchOrderHistoryErrorResponseDTO;
    }
    return Promise.resolve({
      respCode: 500, 
      respDesc: "Failed to fetch order history due to a network or server error.",
      result: null,
    } as FetchOrderHistoryErrorResponseDTO);
  }
};

/**
 * Fetches order details for a non-member using order number and email.
 * API: GET /api/orderNonMemberInquiry - Updated Endpoint and Method
 * Params: { orderNo: string, email: string }
 */
export const fetchNonMemberOrderInquiry = async (
  params: NonMemberOrderInquiryRequestParamsDTO // Changed from payload to params for GET
): Promise<NonMemberOrderInquiryResponseDTO> => {
  if (!params.orderNo || !params.email) { 
    return Promise.resolve({
      respCode: 400, 
      respDesc: "Order Number (orderNo) and Email are required.",
      result: null,
    } as FetchOrderDetailsErrorResponseDTO); 
  }
  try {
    // Changed from apiClient.post to apiClient.get
    // The second argument to apiClient.get is the config, where `params` is used for query parameters
    const response = await apiClient.get<NonMemberOrderInquiryResponseDTO>('/api/orderNonMemberInquiry', { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching non-member order inquiry for order ${params.orderNo}:`, error);
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      return error.response.data as FetchOrderDetailsErrorResponseDTO;
    }
    return Promise.resolve({
      respCode: 500, 
      respDesc: "Failed to fetch order details due to a network or server error.",
      result: null,
    } as FetchOrderDetailsErrorResponseDTO);
  }
};