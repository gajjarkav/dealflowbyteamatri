import smtplib
from email.message import EmailMessage
from app.core.config import settings
import logging
import resend

logger = logging.getLogger(__name__)

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY

def send_email(to_email: str, subject: str, html_content: str):
    if settings.EMAIL_BACKEND == "console":
        logger.info(f"--- EMAIL TO {to_email} ---")
        logger.info(f"SUBJECT: {subject}")
        logger.info(f"CONTENT: {html_content}")
        logger.info("---------------------------")
        return

    from_email = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>" if settings.EMAILS_FROM_NAME else settings.EMAILS_FROM_EMAIL

    if settings.EMAIL_BACKEND == "resend":
        if not settings.RESEND_API_KEY:
            logger.error("RESEND_API_KEY not configured for resend backend.")
            return
        try:
            r = resend.Emails.send({
                "from": from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content
            })
            logger.info(f"Email sent via Resend: {r}")
        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
        return

    # SMTP logic
    if not settings.SMTP_HOST:
        logger.error("SMTP_HOST not configured.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>" if settings.EMAILS_FROM_NAME else settings.EMAILS_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
