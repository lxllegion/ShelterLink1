# ShelterLink Developer Documentation

## How to Obtain the Source Code

### Prerequisites:
- Python 3.8 or higher
- Node.js 14.0 or higher
- Git
- Bash (for windows to run the ./install.sh file)

### Steps:
1. Clone the repository (`git@github.com:lxllegion/ShelterLink1.git`)
2. Make sure Python 3.8 or higher and Node.js 14.0 or higher are installed for the program to run
3. Install bash if on Windows to run the install file
4. Run the install file in the terminal by running `./install.sh` while in the root directory (ShelterLink1/)
5. Email either xllegion@uw.edu or fpazaran@uw.edu for the `.env` file for email notification functionality. Place the `.env` file in backend/services. 
6. Create Firebase and Supabase projects, detailed in the section after ShelterLink's directory structure

## The Layout of Our Directory Structure

Our directory structure is as follows:

### Root Directory:
```
ShelterLink1/
├── backend/                  # FastAPI Python backend
├── frontend/                 # React TypeScript frontend
├── reports/                  # Team weekly reports
├── install.sh                # Automated setup script
├── README.md                 # Project overview
├── SHELTERS_NEAR_ME_SETUP.md # Nearby shelters feature guide
├── user-documentation        # User manual
├── developer-documentation   # Developer manual
└── coding-guidelines.md      # Code style and quality guidelines
```

### Backend:
```
backend/
├── add_test_shelters.py               # Adds mock test shelters
├── add_mock_requests.py               # Adds mock requests to shelters
├── database.py                        # Database table information
├── main.py                            # Main
├── pytest.ini                         # Pytest configuration file
├── requirements.txt                   # Python dependencies
├── routers/
│   ├── forms.py                       # Endpoints to GET/POST new/retrieve forms
│   ├── match.py                       # Endpoints to GET /match to trigger matching
│   ├── register.py                    # Endpoints to POST register new accounts
│   ├── shelters.py                    # Endpoints to GET /shelters for shelter data
│   ├── user.py                        # Token verification
│   └── vector_match.py                # Endpoints for vector matching 
│ 
├── schemas/                           # Pydantic models for data
│   ├── donor.py                       # Pydantic models for donor data
│   ├── forms.py                       # Pydantic models for form data
│   ├── match.py                       # Pydantic models for match data
│   └── shelter.py                     # Pydantic models for shelter data
│ 
├── services/                          # Logic layer
│   ├── email_utils.py                 # Utility functions for sending match emails
│   ├── embeddings.py                  # Generates embeddings for the database
│   ├── forms.py                       # Saves/retrieves form data 
│   ├── match.py                       # Matching algorithm
│   ├── shelters.py                    # Retrieves shelter info from database
│   ├── signup.py                      # Saves donor/shelter info to database
│   ├── user.py                        # Retrieves user info from database
│   └── vector_match.py                # Vector matching for similarity between donation/requests
│ 
├── tests/                             # Test suite
│   ├── test_create_routers.py         # Donation/Request form creation tests
│   ├── test_forms_router.py           # GET, DELETE, UPDATE Donation/Request form tests
│   ├── test_forms_schemas.py          # Donation/Request forms and Shelter/Donor update tests
│   ├── test_register_router.py        # Donor and Shelter registration tests
│   ├── test_resolve_match.py          # Resolve match tests
│   ├── test_shelters_router.py        # Shelter router tests
│   ├── test_valid_users.py            # Donor/Shelter schema tests
│   ├── test_vector_match.py           # Router/Service vector match tests
└── firebase.py                        # Firebase utilities




```

### Frontend:
```
frontend/
├── public/                               # Static assets
├── src/                                  # Source code
│   ├── index.tsx
│   ├── App.tsx                           # Main component with routing
│   ├── firebase.ts                       # Firebase SDK initialization
│   ├── index.css                         # Global CSS File
│   ├── index.tsx                         # Launches React
│   │ 
│   ├── api/                              # Backend API integration
│   │   ├── auth.ts                       # Calls backend to /register and /login
│   │   └── backend.ts                    # Calls backend
│   │
│   ├── components/                       # Reusable React components
│   │   ├── AuthNavBar.tsx                # Navigation bar for signup/login flow
│   │   ├── DeleteAccountModal.tsx        # Delete account
│   │   ├── DeleteItemModal.tsx           # Delete items
│   │   ├── EditItemModal.tsx             # Edit items
│   │   ├── ItemList.tsx                  # List items
│   │   ├── MatchList.tsx                 # List matches
│   │   ├── MatchMadeModal.tsx            # Match Made
│   │   ├── NavBar.tsx                    # Navigation bar for authenticated flow
│   │   └── ResolveMatchModal.tsx         # Resolve Match
│   │
│   ├── contexts/                         # React context providers
│   │   └── AuthContext.tsx               # Global authentication
│   │
│   ├── pages/                            # Page-level components
│   │   ├── Dashboard.tsx                 # User dashboard page
│   │   ├── Form.tsx                      # Donation/request form page
│   │   ├── LandingPage.tsx               # Home page
│   │   ├── Login.tsx                     # Login page
│   │   ├── Profile.tsx                   # User profile page
│   │   ├── Register.tsx                  # Registration page
│   │   └── SheltersNearMe.tsx            # Shelters near me page
│   │
│   └── tests/                            # Test suite
│       ├── App.test.tsx                  # Tests main app component
│       ├── ItemList.test.tsx             # Tests item list
│       ├── LandingPage.test.tsx          # Tests landing page
│       └── NavBar.test.tsx               # Unit/integration tests
│ 
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## How to Build the Software

Run the install.sh file:
```bash
./install.sh
```

Create `.env` files in the backend and frontend:
- For the frontend: Email fpazaran@uw.edu for the Firebase credentials ShelterLink used during development or follow the steps in the following section to create a Firebase project. Place in the frontend folder. 
- For the backend: Email fpazaran@uw.edu for the database URL/API key ShelterLink used during development or create a Supabase database. Place in the backend folder. If you haven't emailed either xllegion@uw.edu or fpazaran@uw.edu for the `.env` file ShelterLink used for email notification functionality, do so now, and place in backend/services.

### How to create a Firebase project
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

### How to create a Supabase project
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

Then to build and run the frontend enter the following commands in the terminal (from the frontend folder):
```bash
npm run build
npm run start
```

The backend does not require a build step, but the backend can be run with the following commands in the terminal (from the backend folder):
```bash
python3 -m venv venv
`venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload
```

## How to Test the Software

### Backend Testing

To test the backend run the following (from the backend folder):
```bash
`venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
pytest                # For all tests
pytest tests/*.py     # For specific tests
```

### Frontend Testing

To test the frontend run the following (from the frontend folder):
```bash
cd frontend
npm test                      # Run all tests
npm test -- --watchAll=false  # CI mode
```

## How to Add New Tests

### Backend:

All tests must go in the `backend/tests/` directory.

**Naming conventions:**
- Test files must be named `test_*.py`
- Test functions must start with `test_` (e.g. `test_matching`)

Import necessary modules in new test files and create tests:
```python
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)
```

Write functions:
```python
def test_donor():
    response = client.post("/donor", json={
        "userID": "1234567890",
        "name": "John Doe",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "phone_number": "1234567890",
    })
    assert response.status_code == 200
    assert response.json() == {"message": "Donor registered successfully"}
```

### Frontend:

All tests must go in `frontend/src/tests`.

**Naming conventions:**
- Test files must be named `*.test.tsx`

Import necessary modules in new test files and create tests:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
```

## How to Build a Release of the Software

### Pre-Release Steps

1. Run all tests and ensure they all pass
2. Check our coding guidelines for code quality and fix any issues
3. Update dependencies:
   - `pip list --outdated` (in backend)
   - `npm outdated` (in frontend)

### Building (Same as before):

Run the install.sh file:
```bash
./install.sh
```

Then to build the frontend run the following commands in the terminal (from the root directory):
```bash
cd frontend
npm run build
```

The backend does not require a build step, but the backend can be run with the following commands in the terminal (from the root directory):
```bash
cd backend
python3 -m venv venv        // python instead of python3 if on windows
source venv/bin/activate    // venv\Scripts\activate if on windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Continuous Integration
The ShelterLink CI pipeline is configured with GitHub Actions. The workflow file which will run on every push/pull request can be found at 
```
ShelterLink1/.github/workflows/ci.yml
```

#### Pipeline Summary

##### Backend Tests
- Runs all pytests in
```
backend/tests/
```
- Executes unit tests for service logic and endpoint tests
- Ensures that the backend builds, imports, and runs with no errors

##### Frontend Tests
- Runs all component and page tests in
```
frontend/src/tests/
```
- Ensures that the components render and behave as expected

#### CI Passing
All pull requests must pass the CI before they can be merged into the ShelterLink main branch. Running the same CI tests locally will help from failing CI after pushing changes. You can do so by following the directions detailed in the previous "How to Test the Software" section of this documentation. 

#### Viewing CI Results
1. Go to the ShelterLink GitHub repo at https://github.com/lxllegion/ShelterLink1
2. Click the "Actions" tab at the top of the menu bar
3. Select any workflow run to see the failed/passed tests, and what jobs were triggered


### Release Steps

1. Test running application
2. Create a git tag:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```
3. Draft release in GitHub:
   - Go to https://github.com/lxllegion/ShelterLink1/releases
   - Click "Create a new release"
   - Fill in details and enter tag created
   - Publish release

### Sanity Checks:
- Functional tests
- Visual tests
- Backend tests
- Configuration checks (Environment variables, Firebase config, Supabase connection, no API keys in repo)

