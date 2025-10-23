import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

function Form() {
  const [userType, setUserType] = useState<string | null>(null);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user type from localStorage
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Submit to backend API
    console.log({
      userType,
      category,
      description,
      quantity,
      notes,
    });

    // TODO: remove after backend is implemented
    if (userType === 'donor') {
      localStorage.setItem('donation', JSON.stringify({
        userType,
        category,
        description,
        quantity,
        notes,
      }));
    } else {
      localStorage.setItem('request', JSON.stringify({
        userType,
        category,
        description,
        quantity,
        notes,
      }));
    }

    // TODO: remove after backend is implemented
    setTimeout(() => {
      setLoading(false);
      alert(`${userType === 'donor' ? 'Donation' : 'Request'} submitted successfully!`);
      navigate('/dashboard');
    }, 1000);
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
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="0"
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
    </div>
  );
}

export default Form;