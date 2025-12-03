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
    Send email to specific email address.

    Args:
        to_email: email address to send to.
        subject: the topic of the email.
        body: the email body.
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

def send_match_emails(
    donor_email: Optional[str],
    shelter_email: Optional[str],
    match: Dict[str, Any],
) -> None:
    """
    Send email to the donor and shelter of a match being made.

    Args:
        donor_email: email address of the donor user to send to.
        shelter_email: email address of the shelter user to send to.
        match: details of the matching.
    """
    subject = "New match found on ShelterLink!"

    base = (
        f"Item: {match['item_name']}\n"
        f"Quantity: {match['quantity']}\n"
        f"Category: {match['category']}\n"
        f"Match ID: {match['id']}\n\n"
        "You can view the full details by logging into ShelterLink."
    )

    if donor_email:
        donor_body = (
            f"Hi {match.get('donor_username') or 'donor'},\n\n"
            "Good news! We've found a shelter that matches your donation.\n\n"
            f"{base}"
        )
        send_email(donor_email, subject, donor_body)

    if shelter_email:
        shelter_body = (
            f"Hi {match.get('shelter_name') or 'shelter'},\n\n"
            "Good news! We've found a donor whose items match your request.\n\n"
            f"{base}"
        )
        send_email(shelter_email, subject, shelter_body)
