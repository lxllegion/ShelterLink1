# ShelterLink 🏠

ShelterLink is a web app designed to help Seattle-based shelters effectively receive items they need while allowing donors to easily contribute. Shelters will post real-time needs and ShelterLink enables donors to match those shelter requests with items that donors already have through an automatic matching system paired with an email notification once a match is found. ShelterLink is intended to faciliate matching between shelters and donors, further communication beyond the initial match is left up to the users. 

## Features

- **Authentication & Profiles:**  
  A login system for both donors and shelters, with user profiles showing:
  - For donors: Active matches and current donations.
  - For shelters: Active matches and current requests.

- **Shelter posts:**  
  Homeless shelter representatives can create posts listing current needs, which can be matched to donations.

- **Donor posts:**  
  Donors can publish posts describing supplies they can donate, which can be matched to shelter requests.

- **Matching system:**  
  Automatic matching between shelter needs and donor offerings when items align.  
  Email confirmations are sent to both the shelter and the donor once a match is made.
  
- **Email notification:**
  Users will receive an email notification of their match and contact information of the other party. Communication will be left for the users to organize.

- **Shelters Near Me:**
  Donors may choose to share their location, and in turn see the nearest shelters to them, as well as the shelter's contact information, directions, and posted item requests. Filtering the closest shelters in terms of radius is also available. This feature isn't visible for shelter accounts. 

## Prerequisites
- Python 3.8 or higher
- Node.js 14.0 or higher
- Git
- Bash (for Windows to run the ./install.sh file)
  
## Building, Testing, Running
To use ShelterLink as a <ins>**user**</ins>, click the following link for the instructions: **[User Guide](/docs/user-documentation.md)**

To use ShelterLink as a <ins>**developer**</ins> (e.g. someone who would like to contribute to ShelterLink code), click the following link for the instructions:  **[Developer Guide](developer-documentation.md)**

## How to Report Issues
1. Go to https://github.com/lxllegion/ShelterLink1
2. Click the "Issues" tab, then "New Issue"
3. Provide specific details:
   - **Title**: A clear and concise description (e.g., unresponsive "+ New Donation" button)
   - **Description**: A detailed explanation of the issue occurring
   - **Expected Behavior**: What you expected to happen
   - **Actual Behavior**: What actually happened
   - **Steps to Reproduce**:
   - (e.g.
     1. Go to Dashboard
     2. Refresh the page
     3. Click on "+ New Donation" button)
   - **Environment Information**:
     - Operating System (e.g., Windows 11, macOS)
     - Browser (e.g., Chrome 115, Safari 16)
     - Account type (e.g., shelter or donor)
     - Device type (e.g., desktop, tablet, mobile)
   - **Optional** (if applicable):
     - Screenshots/recordings for visual problems
     - Errors from the browser console
4. Submit the issue

## Documentation
* **[Living Document:](https://docs.google.com/document/d/1s5NMwjEzoDznN2sx6Q9rOc3J_6tVi-ZZtgh33FRwXoA/edit?usp=sharing)** Detailed information on ShelterLink's purpose, technical description, developmental timeline, and requirements. 
* **[Developer Guide:](developer-documentation.md)** Instructions for understanding ShelterLink's file directory, development environment, building and running the software. 
* **[User Guide:](user-documentation.md)** Instructions for installing, running, and using the ShelterLink web app.  
