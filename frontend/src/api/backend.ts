const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Registration Types
export interface DonorRegistration {
  userID: string;
  username: string;
  name: string;
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
  shelter_id: string;
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

// Match Type
export interface Match {
  id: string;
  donor_id: string;
  donor_username: string;
  shelter_id: string;
  shelter_name: string;
  item_name: string;
  quantity: number;
  category: string;
  matched_at: string;
  status: string;
}

export const getMatches = async (): Promise<Match[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch matches');
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export const findMatchVectorDonation = async (donationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vector-match/donation/${donationId}/best-match`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to find match vector donation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error finding match vector:', error);
    throw error;
  }
};

export const findMatchVectorRequest = async (requestId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vector-match/request/${requestId}/best-match`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to find match vector request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error finding match vector:', error);
    throw error;
  }
};

// User Info Type
export interface UserInfo {
  userType: 'donor' | 'shelter' | null;
  userData: any;
  error?: string;
}

export const getUserInfo = async (userId: string): Promise<UserInfo> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/user_info/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Shelter Type
export interface Shelter {
  id: string;
  uid: string;
  shelter_name: string;
  email: string;
  phone_number: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: string;
  longitude?: string;
}

export const getShelters = async (): Promise<Shelter[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shelters/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch shelters');
    }

    const data = await response.json();
    return data.shelters || [];
  } catch (error) {
    console.error('Error fetching shelters:', error);
    throw error;
  }
};