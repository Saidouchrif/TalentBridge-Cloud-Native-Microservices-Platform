import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import direct des composants
const EnterprisesPage = require('../src/pages/EnterprisesPage.jsx').default;
const OffersPage = require('../src/pages/OffersPage.jsx').default;
const api = require('../src/api/client.js').default;

// Mock API
jest.mock('../src/api/client');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('EnterprisesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render enterprises page', () => {
    api.get.mockResolvedValue({
      data: { enterprises: [] }
    });

    renderWithProviders(<EnterprisesPage />);
    
    expect(screen.getByText('Entreprises (0)')).toBeInTheDocument();
    expect(screen.getByText('➕ Créer une entreprise')).toBeInTheDocument();
  });

  it('should display enterprises list', async () => {
    const mockEnterprises = [
      {
        id: 1,
        name: 'Test Enterprise',
        sector: 'Technology',
        description: 'Test description',
        city: 'Paris'
      }
    ];

    api.get.mockResolvedValue({
      data: { enterprises: mockEnterprises }
    });

    renderWithProviders(<EnterprisesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  it('should create new enterprise', async () => {
    const newEnterprise = {
      id: 1,
      name: 'New Enterprise',
      sector: 'Technology'
    };

    api.get.mockResolvedValue({ data: { enterprises: [] } });
    api.post.mockResolvedValue({ data: { enterprise: newEnterprise } });

    renderWithProviders(<EnterprisesPage />);
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Nom de l\'entreprise *'), {
      target: { value: 'New Enterprise' }
    });
    fireEvent.change(screen.getByPlaceholderText('Secteur d\'activité'), {
      target: { value: 'Technology' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Créer l\'entreprise'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/entreprises', {
        name: 'New Enterprise',
        sector: 'Technology',
        description: '',
        addressLine1: '',
        city: '',
        postalCode: '',
        country: 'France',
        phone: '',
        website: ''
      });
    });
  });

  it('should delete enterprise', async () => {
    const mockEnterprises = [
      { id: 1, name: 'Test Enterprise' }
    ];

    api.get.mockResolvedValue({ data: { enterprises: mockEnterprises } });
    api.delete.mockResolvedValue({ data: { message: 'Enterprise deleted' } });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    renderWithProviders(<EnterprisesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Enterprise')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Supprimer'));
    
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/entreprises/1');
    });
  });
});

describe('OffersPage', () => {
  const mockEnterprise = {
    id: 1,
    name: 'Test Enterprise'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render offers page', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/api/entreprises/1')) {
        return Promise.resolve({ data: { enterprise: mockEnterprise } });
      }
      if (url.includes('/offers')) {
        return Promise.resolve({ data: { offers: [] } });
      }
      if (url.includes('/applications')) {
        return Promise.resolve({ data: { applications: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithProviders(<OffersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Offres de Test Enterprise/)).toBeInTheDocument();
      expect(screen.getByText('➕ Créer une offre')).toBeInTheDocument();
    });
  });

  it('should create new offer', async () => {
    const newOffer = {
      id: 1,
      title: 'Developer Position',
      description: 'Test description'
    };

    api.get.mockImplementation((url) => {
      if (url.includes('/api/entreprises/1')) {
        return Promise.resolve({ data: { enterprise: mockEnterprise } });
      }
      return Promise.resolve({ data: { offers: [], applications: [] } });
    });
    
    api.post.mockResolvedValue({ data: { offer: newOffer } });

    renderWithProviders(<OffersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Titre de l\'offre *')).toBeInTheDocument();
    });
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Titre de l\'offre *'), {
      target: { value: 'Developer Position' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description détaillée de l\'offre'), {
      target: { value: 'Test description' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Publier l\'offre'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/entreprises/1/offers', {
        title: 'Developer Position',
        description: 'Test description',
        requiredSkills: '',
        location: '',
        status: 'published'
      });
    });
  });

  it('should apply to offer', async () => {
    const mockOffers = [
      { id: 1, title: 'Test Offer', status: 'published' }
    ];

    api.get.mockImplementation((url) => {
      if (url.includes('/api/entreprises/1')) {
        return Promise.resolve({ data: { enterprise: mockEnterprise } });
      }
      if (url.includes('/offers')) {
        return Promise.resolve({ data: { offers: mockOffers } });
      }
      return Promise.resolve({ data: { applications: [] } });
    });
    
    api.post.mockResolvedValue({ data: { application: { id: 1 } } });

    renderWithProviders(<OffersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Offer')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('🎓 Candidater'));
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/offers/1/applications', {});
    });
  });
});
