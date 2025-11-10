# ShelterLink Developer Documentation

## How to Obtain the Source Code

### Prerequisites:
- Python 3.8 or higher
- Node.js 14.0 or higher
- Git
- Bash (for windows to run the ./install.sh file)

### Steps:

To obtain the source code for ShelterLink and set up a personal copy of the ShelterLink1 repository, first ensure that you have Git installed on your system. Navigate to the ShelterLink repository, https://github.com/lxllegion/ShelterLink1.git Copy the URL by clicking on the green "Code" button on the main page of the repository, and select "HTTPS". Open your command prompt or terminal application on your device. Use the "cd" command to navigate to the desired directory on your machine to store the source code. Clone the ShelterLink repository by typing "git clone" followed by our URL and enter. Access the source code by navigating into the repository using the "cd ShelterLink1" command.

## The Layout of Our Directory Structure

Our directory structure is as follows:

### Root Directory:
```
ShelterLink1/
├── backend/                  # FastAPI Python backend
├── frontend/                 # React TypeScript frontend
├── reports/
├── install.sh                # Automated setup script
├── README.md                 # Project overview
└── coding-guidelines.md      # Code style and quality guidelines
```

### Backend:
```
backend/
├── main.py
├── requirements.txt          # Python dependencies
├── pytest.ini                # pytest configuration file
├── routers/
│   ├── register.py
│   └── forms.py
├── schemas/                  # Pydantic models for data
│   ├── donor.py
│   ├── shelter.py
│   └── forms.py
├── services/                 # Logic layer
│   ├── signup.py
│   ├── forms.py
│   └── match.py              # Matching algorithm
├── data/                     # Mock/test data files
│   ├── mock_data.json        # Sample user data
│   ├── mock_donations.json   # Sample donation posts
│   └── mock_requests.json    # Sample request posts
└── tests/                    # Test suite
    └── test_example.py       # Example/basic tests
```

### Frontend:
```
frontend/
├── public/                   # Static assets
├── src/                      # Source code
│   ├── index.tsx
│   ├── App.tsx               # Main component with routing
│   ├── firebase.ts           # Firebase SDK initialization
│   ├── index.css
│   ├── api/                  # Backend API integration
│   │   ├── auth.ts
│   │   └── backend.ts
│   ├── components/           # Reusable React components
│   │   ├── NavBar.tsx
│   │   └── AuthNavBar.tsx
│   ├── contexts/             # React context providers
│   │   └── AuthContext.tsx
│   ├── pages/                # Page-level components
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   └── Form.tsx
│   └── tests/                # Test suite
│       └── App.test.tsx
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## How to Build the Software

Run the install.sh file:
```bash
./install.sh
```

Create .env files in the backend and frontend:
- for the frontend: email fpazaran@uw.edu for these or follow the steps to create a firebase project at https://firebase.google.com/docs/web/setup#add-sdk-and-initialize
- for the backend: email fpazaran@uw.edu for these or create a postgreSQL database

Then to build and run the frontend enter the following commands in the terminal (from the frontend folder):
```bash
npm run build
npm run start
```

The backend does not require a build step, but the backend can be run with the following commands in the terminal (from the backend folder):
```bash
python3 -m venv venv
`venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
source venv/bin/activate
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
def sample_donor():
    return {
        "email": "donor@example.com",
        "userType": "donor"
    }
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
2. Run linters for code quality and fix any issues
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

