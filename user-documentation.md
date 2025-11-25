# ShelterLink User Manual

## High Level Description

ShelterLink is a web application designed to connect donors with homeless shelters in need of particular resources. This system helps bridge the gap between people that want to donate resources and the shelters that require them.

### What the system does:
- Allows shelters to create posts to request supplies under several general categories including food, medical supplies, and clothing.
- Allows donors to make respective posts detailing the resources that are available for them to donate to these shelters.
- Automatically matches donations and requests based on supply category, amount, and location to help shelters.

### Why use ShelterLink?
- A user may be interested in using ShelterLink to help shelters keep a running supply of important resources to serve their audience.
- ShelterLink also simplifies the process of finding a homeless shelter in need.

## How to Install the Software

1. Clone the repository (`git@github.com:lxllegion/ShelterLink1.git`)
2. Make sure Python 3.8 or higher and Node.js 14.0 or higher are installed for the program to run
3. Install bash if on Windows to run the install file
4. Run the install file in the terminal by running `./install.sh` while in the root directory (ShelterLink1/)
5. Create Firebase and Supabase projects

## How to create a Firebase project
1. Create a `.env` file in the frontend folder. Add `.env` to the `.gitignore` frontend file.
   An alternative to setting up a personal Firebase project is to email fpazaran@uw.edu for the Firebase credentials ShelterLink used during development. Otherwise, continue to step 2.
2. Follow along with the steps detailed at https://firebase.google.com/docs/web/setup#add-sdk-and-initialize to create a Firebase project.
   - Navigate to Firebase Console and sign in with your Google account if prompted
   - Create a new project by entering a name for the project, then click "continue" and "create project"
   - Register the ShelterLink webapp with your project by entering an identifiable nickname in the web icon `(</>)` to add ShelterLink, then click "register app"
   - You will see a console display a code snippet - that is your Firebase Configuration Object. It should look like:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_APP_ID=your_app_id
   ```
   - Copy the <ins>**entire**</ins> code snippet and paste it into your `.env` file in the frontend folder. It should look exactly as it is pictured above.
   - Click "continue to console" to return to your project dashboard.

## How to create a Supabase project
1. Create a `.env` file in the backend folder. Add `.env` to the `.gitignore` backend file.
   An alternative to setting up a personal Supabase project is to email fpazaran@uw.edu for the database URL/API key ShelterLink used during development. Otherwise, continue to step 2.
2. Follow along with the steps detailed at https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows to create a Supabase project
   - Start a new Supabase project from the Dashboard
   - Create the project by inputting a project name, and setting a database password
   - Get your project credentials by going to your API settings (Settings > API) and copying the project URL. It should look like:
   ```
   DATABASE_URL=your_database_URL
   ```
   - Copy the <ins>**entire**</ins> URL and paste it into your `.env` file in the backend folder. It should look exactly as it is pictured above.

   
## How to Run the Software

### Running the Frontend
(Follow steps given after running install.sh or from the frontend folder):
1. Ensure that a Firebase project has been created, and the `.env` file with the Firebase credentials is placed in the frontend folder
2. Run `npm start`
3. Then open http://localhost:3000 to view the app

### Running the Backend
(Follow steps given after running install.sh or from the backend folder):
1. Ensure that a Supabase project has been created, and the `.env` file with the database URL/API key is placed in the backend folder
2. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Run `uvicorn main:app --reload`

## How to Use the Software

### Understanding User Roles

#### Donor Account
As a donor, you will be able to create donation posts by clicking on the "+ New Donation" button on the Dashboard, as well as being able to view your Active Matches, and your Donation Posts. You will also be able to edit your profile as needed under the "Profile" page, and view homeless shelters in your area, with an adjustable radius, using the "Shelters Near Me" page. 

#### Shelter Account
As a Shelter, you will be able to create request posts by "+ New Request" button on the Dashboard, as well as being able to view your Active Matches, and your Request Posts. You will also be able to edit your profile as needed under the "Profile" page. 

### Register/Login:
Visit http://localhost:3000 and click "login" or "signup" from the landing page to either login to an existing account or create a donor or shelter account, filling in the required fields.

### Dashboard:
Once logged in/registered, you will be redirected to the dashboard where you can view request or donation details depending on the account type and matches with shelters or donors.

If you want to make a request or donation, click the "+ New Request" or "+ New Donation" button if you are a shelter or donor respectively.

### Form Page:
Once you choose to make a donation or request, fill in the required fields.

Once required fields are filled, press the "submit" button to submit the form and get matched with donors (if logged in as a shelter) or shelters (if logged in as a donor). If a match is made, you will see a notification at the top of your screen displaying your match information, including your match score and if the match is partial, or complete. If a match isn't found, you will see a message confirming that your form was submitted successfully, but no matches have been made yet.

**Note:** Currently, this functionality is under development, so no emails will be sent to shelters/donors.

## How to Report a Bug

1. Go to https://github.com/lxllegion/ShelterLink1
2. Click the "Issues" tab, then "New Issue"
3. Provide specific details:
   - **Title**: A clear and concise description (e.g., unresponsive "+ New Donation" button)
   - **Description**: A detailed explanation of the issue occurring
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

## Known Bugs

There are no known bugs at this time.
