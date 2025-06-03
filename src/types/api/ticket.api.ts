
/**
 * Represents a single tag associated with a ticket group.
 */
export interface TicketTagDTO {
    tagId: number;
    tagName: string;
    tagDesc: string;
}

/**
 * Represents a gallery image for a ticket group.
 */
export interface TicketGroupGalleryImageDTO {
    groupGalleryId: number;
    attachmentName: string; // Per API spec, even if dummy for now
    attachmentPath: string; // Per API spec
    attachmentSize: number; // Per API spec
    contentType: string; // Per API spec
    uniqueExtension: string; // Used for constructing image URL
}

/**
 * Represents a single detail item (like Introduction, Highlights) for a ticket.
 */
export interface TicketDetailItemDTO {
    ticketDetailId: number;
    title: string;
    titleIcon: string; // Name of the Lucide icon
    rawHtml: string;
    displayFlag: boolean;
}

/**
 * Represents the detailed ticket profile data received from the
 * GET /api/ticketGroups/ticketProfile endpoint.
 */
export interface TicketProfileDataDTO {
    ticketGroupId: number;
    groupType: string;
    groupName: string;
    groupDesc: string;
    operatingHours: string;
    pricePrefix: string;
    priceSuffix: string;
    attachmentName: string; // Main image attachment name (dummy)
    attachmentPath: string; // Main image attachment path (dummy)
    attachmentSize: number; // Main image attachment size (dummy)
    contentType: string;  // Main image content type (dummy)
    uniqueExtension: string; // Main image unique extension (for URL)
    isActive: boolean;
    isTicketInternal: "0" | "1"; // String "0" for false, "1" for true
    isTicketInternalBoolean?: boolean; // Derived in the component/queryFn for convenience
    ticketIds: string; // Semicolon-separated string of ticket IDs
    tags: TicketTagDTO[];
    groupGallery: TicketGroupGalleryImageDTO[];
    ticketDetails: TicketDetailItemDTO[];
    locationAddress: string;
    locationMapEmbedUrl: string;
    organiserName: string;
    organiserAddress: string;
    organiserDescriptionHtml: string;
    organiserContact: string;
    organiserEmail: string;
    organiserWebsite: string;
    organiserOperatingHours: string;
    organiserFacilities: string[];
    createdAt?: string; // ISO Date string
    updatedAt?: string; // ISO Date string

    // These might not be in the ticketProfile API but were in previous mocks.
    // If needed for DatePicker, ensure backend provides them or handle their absence.
    activeStartDate?: string;
    activeEndDate?: string;
}

/**
 * Represents the 'result' part of the API response for fetching a single ticket profile.
 */
export interface FetchTicketProfileResultDTO {
    ticketProfile: TicketProfileDataDTO;
}

/**
 * Represents the overall structure of the API response for fetching a single ticket profile.
 */
export interface FetchTicketProfileResponseDTO {
    respCode: number; // Expect 2000 for success
    respDesc: string;
    result: FetchTicketProfileResultDTO;
}


// --- DTOs for listing all ticket groups (from previous task, ensure they are correct) ---

/**
 * Represents a single ticket group item from the API for the listing page.
 */
export interface TicketGroupDTO {
    ticketGroupId: number;
    groupType: string;
    groupName: string;
    groupDesc: string;
    operatingHours: string;
    pricePrefix: string;
    priceSuffix: string;
    attachmentName: string;
    attachmentPath: string;
    attachmentSize: number;
    contentType: string;
    uniqueExtension: string;
    isActive: boolean;
    tags: TicketTagDTO[];
}

/**
 * Represents the 'result' part of the API response for fetching all ticket groups.
 */
export interface FetchTicketGroupsResultDTO {
    ticketGroups: TicketGroupDTO[];
}

/**
 * Represents the overall structure of the API response for fetching all ticket groups.
 */
export interface FetchTicketGroupsResponseDTO {
    respCode: number; // Expect 2000 for success
    respDesc: string;
    result: FetchTicketGroupsResultDTO;
}



/**
 * Represents a single ticket variant item from the
 * GET /api/ticketGroups/ticketVariants endpoint.
 */
export interface TicketVariantDTO {
    ticketId: string;
    unitPrice: number;
    itemDesc1: string; // Primary description/name for the ticket variant
    itemDesc2: string; // Additional description (optional)
    itemDesc3: string; // Potentially localized description or other info
    printType: string; // Meaning of this field might need clarification from backend
    qty: number;       // Available quantity/stock for this variant on the given date
}

/**
 * Represents the 'result' part of the API response for fetching ticket variants.
 */
export interface FetchTicketVariantsResultDTO {
    ticketVariants: TicketVariantDTO[];
}

/**
 * Represents the overall structure of the API response for fetching ticket variants.
 */
export interface FetchTicketVariantsResponseDTO {
    respCode: number; // Expect 2000 for success
    respDesc: string;
    result: FetchTicketVariantsResultDTO;
}
