import { eq } from "drizzle-orm";
import { db } from "config/db";
import { bookings } from "./bookings.model";
import { users } from "modules/users/users.model";
import { listings } from "modules/listings/listings.model";
import { AvailabilitySlotService } from "modules/availabilitySlots/availabilitySlots.service";
import {
  CreateBookingDTO,
  UpdateBookingDTO,
  BookingResponse,
} from "./bookings.types";
import {
  sendBookingCreatedEmail,
  sendBookingConfirmedEmail,
  sendBookingDeclinedEmail,
  sendBookingCancelledEmail,
} from "utils/email";

export const BookingService = {
  async getAllBookings(): Promise<BookingResponse[]> {
    const allBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduledAt: bookings.scheduledAt,
        meetLink: bookings.meetLink,
        createdAt: bookings.createdAt,
        candidateId: bookings.candidateId,
        landlordId: bookings.landlordId,
        listingId: bookings.listingId,
        availabilitySlotId: bookings.availabilitySlotId,
      })
      .from(bookings);

    return allBookings;
  },

  async getBookingById(id: number): Promise<BookingResponse | null> {
    const [booking] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduledAt: bookings.scheduledAt,
        meetLink: bookings.meetLink,
        createdAt: bookings.createdAt,
        candidateId: bookings.candidateId,
        landlordId: bookings.landlordId,
        listingId: bookings.listingId,
        availabilitySlotId: bookings.availabilitySlotId,
      })
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    return booking || null;
  },

  async createBooking(data: CreateBookingDTO): Promise<BookingResponse> {
    data.scheduledAt = new Date(data.scheduledAt);
    console.log(data);
    const [newBooking] = await db.insert(bookings).values(data).returning({
      id: bookings.id,
      status: bookings.status,
      scheduledAt: bookings.scheduledAt,
      meetLink: bookings.meetLink,
      createdAt: bookings.createdAt,
      candidateId: bookings.candidateId,
      landlordId: bookings.landlordId,
      listingId: bookings.listingId,
      availabilitySlotId: bookings.availabilitySlotId,
    });

    try {
      if (newBooking.availabilitySlotId) {
        await AvailabilitySlotService.markSlotAsBooked(
          newBooking.availabilitySlotId,
        );
      }

      const [tenant] = await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, newBooking.candidateId))
        .limit(1);

      const [landlord] = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, newBooking.landlordId))
        .limit(1);

      const [listing] = await db
        .select({ title: listings.title })
        .from(listings)
        .where(eq(listings.id, newBooking.listingId))
        .limit(1);

      if (landlord && listing && tenant) {
        await sendBookingCreatedEmail({
          landlordEmail: landlord.email,
          landlordName: `${landlord.firstName} ${landlord.lastName}`,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          listingTitle: listing.title,
          listingId: newBooking.listingId,
          scheduledAt: newBooking.scheduledAt,
          bookingId: newBooking.id,
        });
      }
    } catch (emailError) {
      console.error("Failed to send booking email:", emailError);
    }

    return newBooking;
  },

  async updateBooking(
    id: number,
    data: UpdateBookingDTO,
  ): Promise<BookingResponse | null> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(data)
      .where(eq(bookings.id, id))
      .returning({
        id: bookings.id,
        status: bookings.status,
        scheduledAt: bookings.scheduledAt,
        meetLink: bookings.meetLink,
        createdAt: bookings.createdAt,
        candidateId: bookings.candidateId,
        landlordId: bookings.landlordId,
        listingId: bookings.listingId,
        availabilitySlotId: bookings.availabilitySlotId,
      });

    if (!updatedBooking) {
      return null;
    }

    try {
      const [tenant] = await db
        .select({
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, updatedBooking.candidateId))
        .limit(1);

      const [landlord] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, updatedBooking.landlordId))
        .limit(1);

      const [listing] = await db
        .select({ title: listings.title })
        .from(listings)
        .where(eq(listings.id, updatedBooking.listingId))
        .limit(1);

      if (
        tenant &&
        landlord &&
        listing &&
        updatedBooking.status === "CONFIRMED"
      ) {
        await sendBookingConfirmedEmail({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          landlordName: `${landlord.firstName} ${landlord.lastName}`,
          listingTitle: listing.title,
          listingId: updatedBooking.listingId,
          scheduledAt: updatedBooking.scheduledAt,
          meetLink: updatedBooking.meetLink || undefined,
        });
      } else if (
        tenant &&
        landlord &&
        listing &&
        updatedBooking.status === "DECLINED"
      ) {
        await sendBookingDeclinedEmail({
          tenantEmail: tenant.email,
          tenantName: `${tenant.firstName} ${tenant.lastName}`,
          landlordName: `${landlord.firstName} ${landlord.lastName}`,
          listingTitle: listing.title,
          listingId: updatedBooking.listingId,
          scheduledAt: updatedBooking.scheduledAt,
        });
      }
    } catch (emailError) {
      console.error("Failed to send booking update email:", emailError);
    }

    return updatedBooking;
  },

  async deleteBooking(id: number): Promise<boolean> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return false;
    }

    const result = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning({ id: bookings.id });

    if (result.length > 0) {
      try {
        const [tenant] = await db
          .select({
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(eq(users.id, booking.candidateId))
          .limit(1);

        const [landlord] = await db
          .select({
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(eq(users.id, booking.landlordId))
          .limit(1);

        const [listing] = await db
          .select({ title: listings.title })
          .from(listings)
          .where(eq(listings.id, booking.listingId))
          .limit(1);

        if (tenant && landlord && listing) {
          await sendBookingCancelledEmail({
            recipientEmail: landlord.email,
            recipientName: `${landlord.firstName} ${landlord.lastName}`,
            cancelledByName: `${tenant.firstName} ${tenant.lastName}`,
            listingTitle: listing.title,
            listingId: booking.listingId,
            scheduledAt: booking.scheduledAt,
          });
        }
      } catch (emailError) {
        console.error("Failed to send booking cancellation email:", emailError);
      }
    }

    return result.length > 0;
  },
};
