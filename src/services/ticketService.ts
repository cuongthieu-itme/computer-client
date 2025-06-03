import apiClient from '@/lib/apiClient';
import {
  FetchTicketGroupsResponseDTO,
  FetchTicketProfileResponseDTO,
  FetchTicketVariantsResponseDTO,
} from '@/types/api/ticket.api';
import { format } from 'date-fns';

/**
 * Fetches all ticket groups from the API.
 * (This function is from previous tasks)
 */
export const fetchAllTicketGroups = async (): Promise<FetchTicketGroupsResponseDTO> => {
  try {
    const response = await apiClient.get<FetchTicketGroupsResponseDTO>('/api/ticketGroups');
    return response.data;
  } catch (error) {
    console.error("Error fetching all ticket groups:", error);
    throw error;
  }
};

/**
 * Fetches a specific ticket profile by its ID.
 * (This function is from previous tasks)
 */
export const fetchTicketProfileById = async (ticketGroupId: string): Promise<FetchTicketProfileResponseDTO> => {
  if (!ticketGroupId) {
    throw new Error("Ticket Group ID is required to fetch a profile.");
  }
  try {
    const response = await apiClient.get<FetchTicketProfileResponseDTO>(`/api/ticketGroups/ticketProfile`, {
      params: {
        ticketGroupId: ticketGroupId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ticket profile for ID ${ticketGroupId}:`, error);
    throw error;
  }
};

/**
 * Fetches ticket variants for a specific ticket group and date.
 * API: GET /api/ticketGroups/ticketVariants?ticketGroupId={id}&date={yyyy-MM-dd}
 * @param ticketGroupId The ID of the ticket group.
 * @param date The selected date for which to fetch variants.
 * @returns A promise that resolves to the API response containing ticket variants.
 */
export const fetchTicketVariants = async (
  ticketGroupId: string,
  date: Date
): Promise<FetchTicketVariantsResponseDTO> => {
  if (!ticketGroupId) {
    throw new Error("Ticket Group ID is required.");
  }
  if (!date) {
    throw new Error("Date is required to fetch ticket variants.");
  }

  // Format the date to "yyyy-MM-dd" as expected by the API
  const formattedDate = format(date, 'yyyy-MM-dd');

  try {
    const response = await apiClient.get<FetchTicketVariantsResponseDTO>('/api/ticketGroups/ticketVariants', {
      params: {
        ticketGroupId: ticketGroupId,
        date: formattedDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ticket variants for group ID ${ticketGroupId} and date ${formattedDate}:`, error);
    throw error;
  }
};
