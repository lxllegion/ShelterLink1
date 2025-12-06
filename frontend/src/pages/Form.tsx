import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { createDonation, createRequest, findMatchVectorDonation, findMatchVectorRequest, Donation, Request, Match } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import MatchMadeModal, { MatchData } from '../components/MatchMadeModal';

function Form() {
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userInfo, donations, requests, matches, updateDonations, updateRequests, updateMatches } = useAuth();

  // Modal state for match made notification
  const [isMatchMadeModalOpen, setIsMatchMadeModalOpen] = useState(false);
  const [matchMadeData, setMatchMadeData] = useState<MatchData | null>(null);

  // Get user type from auth context (fetched from backend)
  const userType = userInfo?.userType || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = currentUser?.uid || '';
      let createdId = '';
      const quantityValue = typeof quantity === 'number' ? quantity : parseInt(quantity) || 1;

      if (userType === 'donor') {
        const result = await createDonation({
          donor_id: userId,
          item_name: description,
          quantity: quantityValue,
          category: category,
        });
        createdId = result.donation_id;

        // Add the new donation to frontend state
        const newDonation: Donation = {
          donation_id: createdId,
          donor_id: userId,
          item_name: description,
          quantity: quantityValue,
          category: category,
        };
        updateDonations([...donations, newDonation]);

        // Find best match for the donation
        try {
          const matchResult = await findMatchVectorDonation(createdId);
          if (matchResult.best_match) {
            const match = matchResult.best_match;
            
            // Add the new match to frontend state
            const newMatch: Match = {
              id: match.id || `match-${Date.now()}`,
              donor_id: userId,
              donation_id: createdId,
              donor_username: match.donor_username || '',
              donor_email: match.donor_email,
              donor_phone: match.donor_phone,
              shelter_id: match.shelter_id,
              request_id: match.request_id,
              shelter_name: match.shelter_name || 'Unknown',
              shelter_email: match.shelter_email,
              shelter_phone: match.shelter_phone,
              shelter_address: match.shelter_address,
              shelter_city: match.shelter_city,
              shelter_state: match.shelter_state,
              shelter_zip_code: match.shelter_zip_code,
              item_name: match.item_name,
              quantity: match.quantity,
              category: match.category || category,
              matched_at: match.matched_at || new Date().toISOString(),
              status: match.status || 'pending',
            };
            updateMatches([...matches, newMatch]);

            // Show match made modal
            setMatchMadeData({
              shelter_name: match.shelter_name,
              item_name: match.item_name,
              quantity: match.quantity,
              category: match.category || category,
              similarity_score: match.similarity_score,
              can_fulfill: match.can_fulfill,
            });
            setIsMatchMadeModalOpen(true);
            return; // Don't navigate yet, let modal close first
          }
        } catch (matchError) {
          console.error('Error finding match:', matchError);
        }
        
        // Increment donation counter (temporary mock functionality)
        const currentCount = parseInt(localStorage.getItem('donationCount') || '0');
        localStorage.setItem('donationCount', (currentCount + 1).toString());
      } else {
        const result = await createRequest({
          shelter_id: userId,
          item_name: description,
          quantity: quantityValue,
          category: category,
        });
        createdId = result.request_id;

        // Add the new request to frontend state
        const newRequest: Request = {
          request_id: createdId,
          shelter_id: userId,
          item_name: description,
          quantity: quantityValue,
          category: category,
        };
        updateRequests([...requests, newRequest]);

        // Find best match for the request
        try {
          const matchResult = await findMatchVectorRequest(createdId);
          if (matchResult.best_match) {
            const match = matchResult.best_match;
            
            // Add the new match to frontend state
            const newMatch: Match = {
              id: match.id || `match-${Date.now()}`,
              donor_id: match.donor_id,
              donation_id: match.donation_id,
              donor_username: match.donor_username || match.donor_name || 'Unknown',
              donor_email: match.donor_email,
              donor_phone: match.donor_phone,
              shelter_id: userId,
              request_id: createdId,
              shelter_name: match.shelter_name || '',
              shelter_email: match.shelter_email,
              shelter_phone: match.shelter_phone,
              shelter_address: match.shelter_address,
              shelter_city: match.shelter_city,
              shelter_state: match.shelter_state,
              shelter_zip_code: match.shelter_zip_code,
              item_name: match.item_name,
              quantity: match.quantity,
              category: match.category || category,
              matched_at: match.matched_at || new Date().toISOString(),
              status: match.status || 'pending',
            };
            updateMatches([...matches, newMatch]);

            // Show match made modal
            setMatchMadeData({
              donor_name: match.donor_name,
              donor_username: match.donor_username,
              item_name: match.item_name,
              quantity: match.quantity,
              category: match.category || category,
              similarity_score: match.similarity_score,
              can_fulfill: match.can_fulfill,
            });
            setIsMatchMadeModalOpen(true);
            return; // Don't navigate yet, let modal close first
          }
        } catch (matchError) {
          console.error('Error finding match:', matchError);
        }
        
        // Increment request counter (temporary mock functionality)
        const currentCount = parseInt(localStorage.getItem('requestCount') || '0');
        localStorage.setItem('requestCount', (currentCount + 1).toString());
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(`Failed to submit ${userType === 'donor' ? 'donation' : 'request'}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food',
    'Clothing',
    'Toiletries',
    'Blankets',
    'Medical Supplies',
    'Books',
    'Toys',
    'Furniture',
    'Electronics',
    'Other'
  ];

  const pageTitle = userType === 'donor' ? 'Create Donation Post' : 'Create Request Post';
  const pageSubtitle = userType === 'donor' 
    ? 'Share what you can give to help those in need' 
    : 'Let donors know what your shelter needs';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavBar />

      {/* Form Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {pageTitle}
            </h1>
            <p className="text-sm text-gray-600">
              {pageSubtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-10 transition-all text-sm"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Item Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Canned soup, Winter jackets, Blankets"
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-10 transition-all placeholder-gray-400 text-sm"
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-10 transition-all text-sm"
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Additional Notes
                  <span className="ml-2 text-xs font-normal text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black focus:ring-opacity-10 transition-all placeholder-gray-400 resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading 
                    ? 'Submitting...' 
                    : userType === 'donor' 
                      ? 'Submit Donation' 
                      : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Your {userType === 'donor' ? 'donation' : 'request'} will be visible to {userType === 'donor' ? 'shelters' : 'donors'} in your area
          </p>
        </div>
      </div>

      {/* Match Made Modal */}
      <MatchMadeModal
        isOpen={isMatchMadeModalOpen}
        onClose={() => {
          setIsMatchMadeModalOpen(false);
          navigate('/dashboard');
        }}
        matchData={matchMadeData}
        userType={(userType as 'donor' | 'shelter') || 'donor'}
        actionType="created"
      />
    </div>
  );
}

export default Form;