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

export interface UpdateDonationForm {
  donor_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

export interface UpdateRequestForm {
  shelter_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

// Database Types
export interface Donation {
  donation_id: string;
  donor_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

export interface Request {
  request_id: string;
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

export interface DonorUpdateForm {
  name: string;
  username: string;
  phone_number: string;
}

export interface ShelterUpdateForm {
  shelter_name: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
}

// Update API calls
export const updateDonor = async (donorId: string, data: DonorUpdateForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donor/${donorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update donor: ' + error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating donor:', error);
    throw error;
  }
};

export const updateShelter = async (shelterId: string, data: ShelterUpdateForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/shelter/${shelterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update shelter: ' + error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating shelter:', error);
    throw error;
  }
};

export const deleteDonor = async (donorId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/donor/${donorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete donor');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting donor:', error);
    throw error;
  }
};

export const deleteShelter = async (shelterId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/shelter/${shelterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete shelter');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting shelter:', error);
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

export const getDonations = async (donorId: string): Promise<Donation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donations?user_id=${donorId}`, {
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

export const getRequests = async (shelterId: string): Promise<Request[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/requests?user_id=${shelterId}`, {
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
  donation_id: string;
  donor_username: string;
  shelter_id: string;
  request_id: string;
  shelter_name: string;
  item_name: string;
  quantity: number;
  category: string;
  matched_at: string;
  status: string;
}

export const getMatches = async (user_id: string, user_type: string): Promise<Match[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/matches/${user_id}/${user_type}`, {
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

export const resolveMatch = async (matchId: string, user_id: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/match/resolve/${matchId}/${user_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: user_id }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to resolve match');
    }

    return await response.json();
  } catch (error) {
    console.error('Error resolving match:', error);
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

export interface ShelterRequest {
  id: string;
  shelter_id: string;
  item_name: string;
  quantity: number;
  category: string;
}

export const getShelterRequests = async (shelterId: string): Promise<ShelterRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/shelters/${shelterId}/requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch shelter requests');
    }

    const data = await response.json();
    return data.requests || [];
  } catch (error) {
    console.error('Error fetching shelter requests:', error);
    throw error;
  }
};

export const deleteDonation = async (donationId: string, donorId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donation/${donationId}/${donorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete donation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
};

export const deleteRequest = async (requestId: string, shelterId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/request/${requestId}/${shelterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

export const updateDonation = async (donationId: string, data: UpdateDonationForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/donation/${donationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update donation: ' + error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
};

export const updateRequest = async (requestId: string, data: UpdateRequestForm) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forms/request/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update request: ' + error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};