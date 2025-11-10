# ShelterLink User Manual

## High Level Description

ShelterLink is a web application designed to connect donors with homeless shelters in need of particular resources. This system helps bridge the gap between people that want to donate resources and the shelters that require them.

### What the system does:
- Allows shelters to create posts to request supplies under several general categories including food, medical supplies, and clothing.
- Allows donors to make respective posts detailing the resources that are available for them to donate to these shelters.
- Automatically matches donations and requests based on supply category, amount, and location to help shelters.

### Why use ShelterLink?
- A user may be interested in using ShelterLink to help shelters keep a running supply of important resources to serve their audience.
- It also simplifies the process of finding a homeless shelter in need.

## How to Install the Software

1. Clone the repository (`git@github.com:lxllegion/ShelterLink1.git`)
2. Make sure Python 3.8 or higher and Node.js 14.0 or higher are installed for the program to run
3. Install bash if on Windows to run the install file
4. Run the install file in the terminal by running `./install.sh` while in the root directory (ShelterLink1/)
5. Create Firebase and Supabase projects



## How to Run the Software

### Running the Frontend
(Follow steps given after running install.sh or from the frontend folder):
1. Create a `.env` file with Firebase credentials (Email fpazaran@uw.edu for these or follow the steps to create a firebase project at https://firebase.google.com/docs/web/setup#add-sdk-and-initialize)
2. Run `npm start`
3. Then open http://localhost:3000 to view the app

### Running the Backend
(Follow steps given after running install.sh or from the backend folder):
2. Create a `.env` file with database URL/API key (Email fpazaran@uw.edu for these or create a postgreSQL database)
3. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Run `uvicorn main:app --reload`

## How to Use the Software

### Register/Login:
Visit http://localhost:3000 and click "login" or "signup" from the landing page to either login to an existing account or create a donor or shelter account, filling in the required fields.

### Dashboard:
Once logged in/registered, you will be redirected to the dashboard where you can view request or donation details depending on the account type and matches with shelters or donors.

If you want to make a request or donation, click the "+ New Request" or "+ New Donation" button if you are a shelter or donor respectively.

### Form Page:
Once you choose to make a donation or request, fill in the required fields.

Once required fields are filled, press the "submit" button to submit the form and get matched with donors (if logged in as a shelter) or shelters (if logged in as a donor). 

**Note:** Currently, this functionality is under development, so no matches will be made or saved, and no emails will be sent to shelters/donors.

## How to Report a Bug

1. Go to https://github.com/lxllegion/ShelterLink1
2. Click the "Issues" tab, then "New Issue"
3. Provide specific details:
   - **Title**: A clear and concise description (e.g., unresponsive "+ New Donation" button)
   - **Description**: A detailed explanation of the issue occurring
   - **Steps to Reproduce**:
     1. Go to Dashboard
     2. Refresh the page
     3. Click on "+ New Donation" button
   - **Environment Information**:
     - Operating System (e.g., Windows 11, macOS)
     - Browser (e.g., Chrome 115, Safari 16)
     - Account type (shelter or donor)
     - Device type (e.g., desktop, tablet, mobile)
   - **Optional** (if applicable):
     - Screenshots/recordings for visual problems
     - Errors from the browser console
4. Submit the issue

## Known Bugs

There are no known bugs at this time.
