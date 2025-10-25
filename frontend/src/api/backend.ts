const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Registration Types
export interface DonorRegistration {
  userID: string;
  username: string;
  email: string;
  phone_number: string;
}

export interface ShelterRegistration {
  userID: string;
  username: string;
  shelter_name: string;
  email: string;
  phone_number: string;
}

// Form Types
export interface DonationForm {
  donor_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

export interface RequestForm {
  donor_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

// Registration API calls
export const registerDonor = async (data: DonorRegistration) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/donor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to register donor');
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering donor:', error);
    throw error;
  }
};

export const registerShelter = async (data: ShelterRegistration) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/shelter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to register shelter');
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering shelter:', error);
    throw error;
  }
};

// Forms API calls
export const createDonation = async (data: DonationForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create donation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

export const createRequest = async (data: RequestForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const getDonations = async (): Promise<DonationForm[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch donations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
};

export const getRequests = async (): Promise<RequestForm[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};
