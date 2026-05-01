import nodemailer from "nodemailer";
import { config } from "../config/env";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const transporter = nodemailer.createTransport({
  host: config.email.smtpHost,
  port: config.email.smtpPort,
  secure: true,
  auth: {
    user: config.email.smtpUser,
    pass: config.email.smtpPass,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: email,
    subject: "Reset Your HomiDirect Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password for your HomiDirect account.</p>
        <p>Your reset code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <code style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${token}</code>
        </div>
        <p>Or click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomiDirect - Find Your Perfect Rental</p>
      </div>
    `,
  });
}

export interface ContactOwnerEmailData {
  ownerEmail: string;
  ownerName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  listingTitle: string;
  listingId: number;
}

export async function sendContactOwnerEmail(
  data: ContactOwnerEmailData,
): Promise<void> {
  const listingUrl = `${config.frontendUrl}/listings/${data.listingId}`;

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: data.ownerEmail,
    replyTo: data.senderEmail,
    subject: `New inquiry about your property: ${data.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Property Inquiry</h2>
        <p>Hello ${escapeHtml(data.ownerName)},</p>
        <p>You have received a new inquiry about your property listing on HomiDirect.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Property: ${escapeHtml(data.listingTitle)}</h3>
          <p><a href="${listingUrl}" style="color: #007bff;">View Listing</a></p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Message from ${escapeHtml(data.senderName)}:</h3>
          <p style="white-space: pre-line; color: #555;">${escapeHtml(data.message)}</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(data.senderName)}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(data.senderEmail)}</p>
          ${data.senderPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${escapeHtml(data.senderPhone)}</p>` : ""}
        </div>

        <p>You can reply directly to this email to respond to ${escapeHtml(data.senderName)}.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          This message was sent via HomiDirect.
          <a href="${config.frontendUrl}" style="color: #007bff;">Visit HomiDirect</a>
        </p>
      </div>
    `,
  });
}

export interface BookingCreatedEmailData {
  landlordEmail: string;
  landlordName: string;
  tenantName: string;
  listingTitle: string;
  listingId: number;
  scheduledAt: Date;
  bookingId: number;
}

export async function sendBookingCreatedEmail(
  data: BookingCreatedEmailData,
): Promise<void> {
  const listingUrl = `${config.frontendUrl}/listings/${data.listingId}`;
  const formattedDate = new Date(data.scheduledAt).toLocaleString();

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: data.landlordEmail,
    subject: `New viewing request: ${data.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Viewing Request</h2>
        <p>Hello ${escapeHtml(data.landlordName)},</p>
        <p>${escapeHtml(data.tenantName)} has requested to view your property.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Property: ${escapeHtml(data.listingTitle)}</h3>
          <p><a href="${listingUrl}" style="color: #007bff;">View Listing</a></p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Scheduled For:</h4>
          <p style="font-size: 18px; font-weight: bold; color: #007bff;">${formattedDate}</p>
        </div>

        <p>Please log in to your HomiDirect account to confirm or decline this viewing request.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomiDirect - Find Your Perfect Rental</p>
      </div>
    `,
  });
}

export interface BookingConfirmedEmailData {
  tenantEmail: string;
  tenantName: string;
  landlordName: string;
  listingTitle: string;
  listingId: number;
  scheduledAt: Date;
  meetLink?: string;
}

export async function sendBookingConfirmedEmail(
  data: BookingConfirmedEmailData,
): Promise<void> {
  const listingUrl = `${config.frontendUrl}/listings/${data.listingId}`;
  const formattedDate = new Date(data.scheduledAt).toLocaleString();

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: data.tenantEmail,
    subject: `Viewing confirmed: ${data.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Viewing Confirmed!</h2>
        <p>Hello ${escapeHtml(data.tenantName)},</p>
        <p>${escapeHtml(data.landlordName)} has confirmed your viewing request.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Property: ${escapeHtml(data.listingTitle)}</h3>
          <p><a href="${listingUrl}" style="color: #007bff;">View Listing</a></p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Scheduled For:</h4>
          <p style="font-size: 18px; font-weight: bold; color: #007bff;">${formattedDate}</p>
          ${
            data.meetLink
              ? `
            <p style="margin-top: 15px;">
              <a href="${escapeHtml(data.meetLink)}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Join Video Call</a>
            </p>
          `
              : ""
          }
        </div>

        <p>We look forward to seeing you at the viewing!</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomiDirect - Find Your Perfect Rental</p>
      </div>
    `,
  });
}

export interface BookingDeclinedEmailData {
  tenantEmail: string;
  tenantName: string;
  landlordName: string;
  listingTitle: string;
  listingId: number;
  scheduledAt: Date;
}

export async function sendBookingDeclinedEmail(
  data: BookingDeclinedEmailData,
): Promise<void> {
  const listingUrl = `${config.frontendUrl}/listings/${data.listingId}`;
  const formattedDate = new Date(data.scheduledAt).toLocaleString();

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: data.tenantEmail,
    subject: `Viewing declined: ${data.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Viewing Declined</h2>
        <p>Hello ${escapeHtml(data.tenantName)},</p>
        <p>${escapeHtml(data.landlordName)} has declined your viewing request.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Property: ${escapeHtml(data.listingTitle)}</h3>
          <p><a href="${listingUrl}" style="color: #007bff;">View Listing</a></p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Requested For:</h4>
          <p style="font-size: 16px; font-weight: bold; color: #555;">${formattedDate}</p>
        </div>

        <p>You can try booking another viewing slot for this property.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomiDirect - Find Your Perfect Rental</p>
      </div>
    `,
  });
}

export interface BookingCancelledEmailData {
  recipientEmail: string;
  recipientName: string;
  cancelledByName: string;
  listingTitle: string;
  listingId: number;
  scheduledAt: Date;
}

export async function sendBookingCancelledEmail(
  data: BookingCancelledEmailData,
): Promise<void> {
  const listingUrl = `${config.frontendUrl}/listings/${data.listingId}`;
  const formattedDate = new Date(data.scheduledAt).toLocaleString();

  await transporter.sendMail({
    from: config.email.emailFrom,
    to: data.recipientEmail,
    subject: `Viewing cancelled: ${data.listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Viewing Cancelled</h2>
        <p>Hello ${escapeHtml(data.recipientName)},</p>
        <p>${escapeHtml(data.cancelledByName)} has cancelled the viewing.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Property: ${escapeHtml(data.listingTitle)}</h3>
          <p><a href="${listingUrl}" style="color: #007bff;">View Listing</a></p>
        </div>

        <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Scheduled For:</h4>
          <p style="font-size: 16px; font-weight: bold; color: #555;">${formattedDate}</p>
        </div>

        <p>If you still wish to view this property, you can book another slot.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">HomiDirect - Find Your Perfect Rental</p>
      </div>
    `,
  });
}
