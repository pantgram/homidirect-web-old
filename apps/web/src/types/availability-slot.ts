export interface AvailabilitySlot {
  id: number;
  listingId: number;
  landlordId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  createdAt: string;
}

export interface CreateAvailabilitySlotRequest {
  listingId: number;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface UpdateAvailabilitySlotRequest {
  startTime?: string;
  endTime?: string;
  isBooked?: boolean;
}
