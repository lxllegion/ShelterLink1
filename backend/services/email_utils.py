"""
Utility functions for sending email to users once a match has been made.
"""
import os
import smtplib
from email.message import EmailMessage
from typing import Optional, Dict, Any

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Send an email to a specific address.

    - Uses SMTP server defined in environment variables
    - Sends plain text email with subject and body
    """
    if not to_email:
        return

    msg = EmailMessage()
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)


def _contact_section(
    donor_email: Optional[str],
    shelter_email: Optional[str],
    donor_phone: Optional[str] = None,
    shelter_phone: Optional[str] = None,
) -> str:
    lines = ["\n\nContact details (for coordinating this match):"]

    if donor_email:
        lines.append(f"- Donor email: {donor_email}")
    if donor_phone:
        lines.append(f"- Donor phone: {donor_phone}")

    if shelter_email:
        lines.append(f"- Shelter email: {shelter_email}")
    if shelter_phone:
        lines.append(f"- Shelter phone: {shelter_phone}")

    return "\n".join(lines)


def send_match_emails(
    donor_email: Optional[str],
    shelter_email: Optional[str],
    match: Dict[str, Any],
    donor_phone: Optional[str] = None,
    shelter_phone: Optional[str] = None,
) -> None:
    """
    Send match notification emails to donor and shelter.

    - Includes match details and contact information
    - Sends separate emails to donor and shelter if emails are provided
    """
    subject = "New match found on ShelterLink!"

    base = (
        f"Item: {match['item_name']}\n"
        f"Quantity: {match['quantity']}\n"
        f"Category: {match['category']}\n"
        f"Match ID: {match['id']}\n\n"
        "You can view the full details by logging into ShelterLink."
    )

    contacts = _contact_section(
        donor_email=donor_email,
        shelter_email=shelter_email,
        donor_phone=donor_phone,
        shelter_phone=shelter_phone,
    )

    if donor_email:
        donor_body = (
            f"Hi {match.get('donor_username') or 'donor'},\n\n"
            "Good news! We've found a shelter that matches your donation.\n\n"
            f"{base}"
            f"{contacts}"
        )
        send_email(donor_email, subject, donor_body)

    if shelter_email:
        shelter_body = (
            f"Hi {match.get('shelter_name') or 'shelter'},\n\n"
            "Good news! We've found a donor whose items match your request.\n\n"
            f"{base}"
            f"{contacts}"
        )
        send_email(shelter_email, subject, shelter_body)
