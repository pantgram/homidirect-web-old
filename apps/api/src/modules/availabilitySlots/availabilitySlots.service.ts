import { eq, and, lt, gte } from "drizzle-orm";
import { db } from "config/db";
import { availabilitySlots } from "./availabilitySlots.model";
import {
  CreateAvailabilitySlotDTO,
  UpdateAvailabilitySlotDTO,
  AvailabilitySlotResponse,
} from "./availabilitySlots.types";

export const AvailabilitySlotService = {
  async getAvailabilitySlotsByListingId(
    listingId: number
  ): Promise<AvailabilitySlotResponse[]> {
    const slots = await db
      .select({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      })
      .from(availabilitySlots)
      .where(eq(availabilitySlots.listingId, listingId))
      .orderBy(availabilitySlots.startTime);

    return slots;
  },

  async getAvailabilitySlotsByLandlordId(
    landlordId: number
  ): Promise<AvailabilitySlotResponse[]> {
    const slots = await db
      .select({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      })
      .from(availabilitySlots)
      .where(eq(availabilitySlots.landlordId, landlordId))
      .orderBy(availabilitySlots.startTime);

    return slots;
  },

  async getAvailabilitySlotById(
    id: number
  ): Promise<AvailabilitySlotResponse | null> {
    const [slot] = await db
      .select({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      })
      .from(availabilitySlots)
      .where(eq(availabilitySlots.id, id))
      .limit(1);

    return slot || null;
  },

  async createAvailabilitySlot(
    data: CreateAvailabilitySlotDTO
  ): Promise<AvailabilitySlotResponse> {
    data.startTime = new Date(data.startTime);
    data.endTime = new Date(data.endTime);
    const [newSlot] = await db.insert(availabilitySlots).values(data).returning({
      id: availabilitySlots.id,
      listingId: availabilitySlots.listingId,
      landlordId: availabilitySlots.landlordId,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
      isBooked: availabilitySlots.isBooked,
      createdAt: availabilitySlots.createdAt,
    });

    return newSlot;
  },

  async updateAvailabilitySlot(
    id: number,
    data: UpdateAvailabilitySlotDTO
  ): Promise<AvailabilitySlotResponse | null> {
    if (data.startTime) {
      data.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      data.endTime = new Date(data.endTime);
    }

    const [updatedSlot] = await db
      .update(availabilitySlots)
      .set(data)
      .where(eq(availabilitySlots.id, id))
      .returning({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      });

    return updatedSlot || null;
  },

  async markSlotAsBooked(id: number): Promise<AvailabilitySlotResponse | null> {
    const [updatedSlot] = await db
      .update(availabilitySlots)
      .set({ isBooked: true })
      .where(eq(availabilitySlots.id, id))
      .returning({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      });

    return updatedSlot || null;
  },

  async markSlotAsAvailable(id: number): Promise<void> {
    await db
      .update(availabilitySlots)
      .set({ isBooked: false })
      .where(eq(availabilitySlots.id, id));
  },

  async deleteAvailabilitySlot(id: number): Promise<boolean> {
    const result = await db
      .delete(availabilitySlots)
      .where(eq(availabilitySlots.id, id))
      .returning({ id: availabilitySlots.id });

    return result.length > 0;
  },

  async getAvailableSlotsByListingId(
    listingId: number
  ): Promise<AvailabilitySlotResponse[]> {
    const now = new Date();
    const slots = await db
      .select({
        id: availabilitySlots.id,
        listingId: availabilitySlots.listingId,
        landlordId: availabilitySlots.landlordId,
        startTime: availabilitySlots.startTime,
        endTime: availabilitySlots.endTime,
        isBooked: availabilitySlots.isBooked,
        createdAt: availabilitySlots.createdAt,
      })
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.listingId, listingId),
          eq(availabilitySlots.isBooked, false),
          gte(availabilitySlots.startTime, now)
        )
      )
      .orderBy(availabilitySlots.startTime);

    return slots;
  },
};
