import json
import os
from schemas.forms import DonationForm, RequestForm
from typing import List

# File paths - storing data
DONATIONS_FILE = "donations.json"
REQUESTS_FILE = "requests.json"

# Initialize JSON files if they don't exist
def init_files():
    if not os.path.exists(DONATIONS_FILE):
        with open(DONATIONS_FILE, "w") as f:
            json.dump([], f)
    if not os.path.exists(REQUESTS_FILE):
        with open(REQUESTS_FILE, "w") as f:
            json.dump([], f)

# Save donation form
def save_donation(donation: DonationForm) -> DonationForm:
    init_files()
    with open(DONATIONS_FILE, "r") as f:
        donations = json.load(f)
    donation_dict = donation.dict()
    donations.append(donation_dict)
    with open(DONATIONS_FILE, "w") as f:
        json.dump(donations, f, indent=2)
    return donation

# Save req form
def save_request(request: RequestForm) -> RequestForm:
    init_files()
    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)
    request_dict = request.dict()
    requests.append(request_dict)
    with open(REQUESTS_FILE, "w") as f:
        json.dump(requests, f, indent=2)
    return request

# Get all donations
def get_donations() -> List[DonationForm]:
    init_files()
    with open(DONATIONS_FILE, "r") as f:
        donations = json.load(f)
    return [DonationForm(**donation) for donation in donations]

# Get all reqs
def get_requests() -> List[RequestForm]:
    init_files()
    with open(REQUESTS_FILE, "r") as f:
        requests = json.load(f)
    return [RequestForm(**request) for request in requests]