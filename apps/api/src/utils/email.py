import html
from email.message import EmailMessage
from aiosmtplib import SMTP
from src.config.settings import settings


def _escape(text: str) -> str:
    return html.escape(text, quote=True)


def _build_message(to: str, subject: str, body: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = settings.email_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(body, subtype="html")
    return msg


async def _send_email(to: str, subject: str, body: str) -> None:
    msg = _build_message(to, subject, body)
    async with SMTP(
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        use_tls=True,
    ) as smtp:
        await smtp.login(settings.smtp_user, settings.smtp_pass)
        await smtp.send_message(msg)


async def send_password_reset_email(to: str, token: str) -> None:
    reset_link = f"{settings.frontend_url}/reset-password?token={token}"
    body = f"""
    <html><body>
    <h2>Password Reset</h2>
    <p>You requested a password reset. Use the code below or click the link:</p>
    <p><strong>{_escape(token)}</strong></p>
    <p><a href="{reset_link}">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you did not request this, ignore this email.</p>
    </body></html>
    """
    await _send_email(to, "Password Reset - HomiDirect", body)


async def send_contact_owner_email(
    owner_email: str,
    sender_name: str,
    sender_email: str,
    sender_phone: str,
    message: str,
) -> None:
    body = f"""
    <html><body>
    <h2>New Inquiry About Your Listing</h2>
    <p><strong>Name:</strong> {_escape(sender_name)}</p>
    <p><strong>Email:</strong> {_escape(sender_email)}</p>
    <p><strong>Phone:</strong> {_escape(sender_phone)}</p>
    <p><strong>Message:</strong></p>
    <p>{_escape(message)}</p>
    </body></html>
    """
    await _send_email(owner_email, "New Listing Inquiry - HomiDirect", body)


async def send_booking_created_email(
    landlord_email: str,
    landlord_name: str,
    tenant_name: str,
    listing_title: str,
    listing_id: int,
    scheduled_at: str,
    booking_id: int,
) -> None:
    body = f"""
    <html><body>
    <h2>New Booking Request</h2>
    <p>Hi {_escape(landlord_name)},</p>
    <p><strong>{_escape(tenant_name)}</strong> has requested a viewing for:</p>
    <p><strong>{_escape(listing_title)}</strong></p>
    <p><strong>Scheduled:</strong> {_escape(scheduled_at)}</p>
    <p><strong>Booking ID:</strong> {booking_id}</p>
    </body></html>
    """
    await _send_email(landlord_email, f"New Booking Request - {_escape(listing_title)}", body)


async def send_booking_confirmed_email(
    tenant_email: str,
    tenant_name: str,
    landlord_name: str,
    listing_title: str,
    scheduled_at: str,
    meet_link: str | None = None,
) -> None:
    meet_btn = f'<p><a href="{_escape(meet_link)}">Join Google Meet</a></p>' if meet_link else ""
    body = f"""
    <html><body>
    <h2>Booking Confirmed!</h2>
    <p>Hi {_escape(tenant_name)},</p>
    <p>Your viewing for <strong>{_escape(listing_title)}</strong> has been confirmed.</p>
    <p><strong>Landlord:</strong> {_escape(landlord_name)}</p>
    <p><strong>Scheduled:</strong> {_escape(scheduled_at)}</p>
    {meet_btn}
    </body></html>
    """
    await _send_email(tenant_email, f"Booking Confirmed - {_escape(listing_title)}", body)


async def send_booking_declined_email(
    tenant_email: str,
    tenant_name: str,
    landlord_name: str,
    listing_title: str,
    scheduled_at: str,
) -> None:
    body = f"""
    <html><body>
    <h2>Booking Update</h2>
    <p>Hi {_escape(tenant_name)},</p>
    <p>Your viewing request for <strong>{_escape(listing_title)}</strong> was declined by {_escape(landlord_name)}.</p>
    <p>Please try booking another available time slot.</p>
    </body></html>
    """
    await _send_email(tenant_email, f"Booking Update - {_escape(listing_title)}", body)


async def send_booking_cancelled_email(
    recipient_email: str,
    recipient_name: str,
    cancelled_by_name: str,
    listing_title: str,
    scheduled_at: str,
) -> None:
    body = f"""
    <html><body>
    <h2>Booking Cancelled</h2>
    <p>Hi {_escape(recipient_name)},</p>
    <p>The booking for <strong>{_escape(listing_title)}</strong> scheduled at {_escape(scheduled_at)} has been cancelled by {_escape(cancelled_by_name)}.</p>
    </body></html>
    """
    await _send_email(recipient_email, f"Booking Cancelled - {_escape(listing_title)}", body)
