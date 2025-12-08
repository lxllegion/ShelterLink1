import { render, screen, fireEvent } from '@testing-library/react';
import ItemList from '../components/ItemList';
import { Donation, Request } from '../api/backend';

describe('ItemList Component', () => {
  const mockDonations: Donation[] = [
    {
      donation_id: '1',
      donor_id: 'donor-1',
      item_name: 'Winter Coats',
      quantity: 10,
      category: 'Clothing',
    },
    {
      donation_id: '2',
      donor_id: 'donor-1',
      item_name: 'Blankets',
      quantity: 5,
      category: 'Bedding',
    },
  ];

  const mockRequests: Request[] = [
    {
      request_id: '1',
      shelter_id: 'shelter-1',
      item_name: 'Canned Food',
      quantity: 50,
      category: 'Food',
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    render(
      <ItemList
        items={[]}
        itemType="donation"
        userType="donor"
        isLoading={true}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    expect(screen.getByText(/Loading donations/i)).toBeInTheDocument();
  });

  test('renders donations list for donors', () => {
    render(
      <ItemList
        items={mockDonations}
        itemType="donation"
        userType="donor"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    expect(screen.getByText('My Donations (2)')).toBeInTheDocument();
    expect(screen.getByText('Winter Coats')).toBeInTheDocument();
    expect(screen.getByText('Blankets')).toBeInTheDocument();
  });

  test('renders requests list for shelters', () => {
    render(
      <ItemList
        items={mockRequests}
        itemType="request"
        userType="shelter"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    expect(screen.getByText('My Requests (1)')).toBeInTheDocument();
    expect(screen.getByText('Canned Food')).toBeInTheDocument();
  });

  test('displays empty state when no items', () => {
    render(
      <ItemList
        items={[]}
        itemType="donation"
        userType="donor"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    expect(screen.getByText(/No donations yet/i)).toBeInTheDocument();
  });

  test('shows item details correctly', () => {
    render(
      <ItemList
        items={mockDonations}
        itemType="donation"
        userType="donor"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    expect(screen.getByText(/Clothing/)).toBeInTheDocument();
    expect(screen.getByText(/Quantity: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Bedding/)).toBeInTheDocument();
    expect(screen.getByText(/Quantity: 5/)).toBeInTheDocument();
  });

  test('calls onEditItem when edit button is clicked', () => {
    render(
      <ItemList
        items={mockDonations}
        itemType="donation"
        userType="donor"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(0, 'donation');
  });

  test('calls onDeleteItem when delete button is clicked', () => {
    render(
      <ItemList
        items={mockDonations}
        itemType="donation"
        userType="donor"
        isLoading={false}
        onEditItem={mockOnEdit}
        onDeleteItem={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(0, 'donation');
  });
});
