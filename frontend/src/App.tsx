import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { clientsService, Client, UserRole } from './lib/clientsService';
import { credentialsService } from './lib/credentialsService';
import ClientList from './components/ClientList';
import DashboardLayout from './components/DashboardLayout';
import MetricsOverview from './components/MetricsOverview';
import ConversionChart from './components/ConversionChart';
import CostPerLeadChart from './components/CostPerLeadChart';
import ConversionDetails from './components/ConversionDetails';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import { Loader2, Building } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { UserProvider } from './lib/UserContext';

// Home page component with client list
const HomePage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load client data
    const loadClients = () => {
      const clientData = clientsService.getClients();
      setClients(clientData);
    };
    
    loadClients();
  }, []);
  
  const handleClientSelect = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6 px-6">
        <h1 className="text-2xl font-bold mb-2">PPC Client Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all client accounts and performance metrics
        </p>
      </div>
      
      <ClientList 
        clients={clients} 
        onClientSelect={handleClientSelect} 
      />
    </DashboardLayout>
  );
};

// Client detail page component
const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<string>('30days');
  const [client, setClient] = useState<Client | null>(null);
  
  // State for all data
  const [metricsData, setMetricsData] = useState<any>(null);
  const [conversionChartData, setConversionChartData] = useState<any[]>([]);
  const [costPerLeadData, setCostPerLeadData] = useState<any[]>([]);
  const [recentConversions, setRecentConversions] = useState<any[]>([]);

  useEffect(() => {
    const loadClientData = () => {
      if (!clientId) {
        navigate('/');
        return;
      }
      
      // Load client info
      const clientData = clientsService.getClientById(clientId);
      if (!clientData) {
        navigate('/');
        return;
      }
      
      setClient(clientData);
      loadDashboardData(activePeriod);
    };
    
    loadClientData();
  }, [clientId, navigate]);

  // Load all dashboard data
  const loadDashboardData = async (period: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate with mock data
      setTimeout(() => {
        // Mock metrics data
        setMetricsData({
          totalConversions: client?.totalConversions || 0,
          formConversions: client?.formConversions || 0,
          callConversions: client?.callConversions || 0,
          costPerLead: client?.costPerLead || 0,
          totalSpend: client?.totalSpend || 0,
          trends: client?.trends || {
            totalConversions: 0,
            costPerLead: 0,
            totalSpend: 0
          }
        });
        
        // Mock conversion chart data
        const mockConversionData = [];
        const days = period === '7days' ? 7 : period === '30days' ? 30 : 30;
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          mockConversionData.push({
            date: date.toISOString().split('T')[0],
            forms: Math.floor(Math.random() * 10) + 1,
            calls: Math.floor(Math.random() * 8) + 1
          });
        }
        setConversionChartData(mockConversionData);
        
        // Mock cost per lead data
        const mockCostData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          mockCostData.push({
            date: date.toISOString().split('T')[0],
            cost: Math.floor(Math.random() * 50) + 20,
            benchmark: 35
          });
        }
        setCostPerLeadData(mockCostData);
        
        // Mock recent conversions
        const mockConversions = [];
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setDate(today.getDate() - Math.floor(Math.random() * days));
          date.setHours(Math.floor(Math.random() * 24));
          date.setMinutes(Math.floor(Math.random() * 60));
          
          mockConversions.push({
            id: `conv-${i}`,
            type: Math.random() > 0.5 ? 'Form Submission' : 'Phone Call',
            source: ['Google Search', 'Google Display', 'Facebook', 'Direct'][Math.floor(Math.random() * 4)],
            campaign: ['Brand', 'Generic', 'Remarketing', 'Display'][Math.floor(Math.random() * 4)],
            date: date.toISOString(),
            value: Math.floor(Math.random() * 200) + 50
          });
        }
        setRecentConversions(mockConversions);
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    loadDashboardData(period);
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  // Show loading state
  if (isLoading && !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading client data...</span>
      </div>
    );
  }

  // Render client dashboard with data
  return (
    <DashboardLayout>
      <div className="mb-6 px-6">
        <button 
          onClick={handleBackToHome}
          className="text-sm text-muted-foreground mb-2 hover:underline flex items-center"
        >
          ← Back to all clients
        </button>
        <h1 className="text-2xl font-bold">{client?.name}</h1>
        <div className="flex items-center text-muted-foreground">
          <Building className="h-4 w-4 mr-1" />
          {client?.company}
        </div>
        {client?.assignedTeamMember && (
          <div className="mt-1 text-sm text-muted-foreground">
            Team Member: {client.assignedTeamMember}
          </div>
        )}
      </div>

      {/* Time Period Selector */}
      <div className="px-6">
        <Tabs value={activePeriod} onValueChange={handlePeriodChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Dashboard Content */}
      <div className="mt-6 px-6">
        {metricsData && (
          <MetricsOverview 
            totalConversions={metricsData.totalConversions}
            formConversions={metricsData.formConversions}
            callConversions={metricsData.callConversions}
            costPerLead={metricsData.costPerLead}
            totalSpend={metricsData.totalSpend}
            trends={metricsData.trends}
          />
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 px-6">
        {conversionChartData.length > 0 && (
          <ConversionChart data={conversionChartData} />
        )}
        
        {costPerLeadData.length > 0 && (
          <CostPerLeadChart data={costPerLeadData} />
        )}
      </div>

      <div className="mt-6 px-6">
        {recentConversions.length > 0 && (
          <ConversionDetails conversions={recentConversions} />
        )}
      </div>
    </DashboardLayout>
  );
};

// Admin Dashboard component
const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear credentials from localStorage
    credentialsService.clearCredentials();
    
    // Clear user role
    localStorage.removeItem('userRole');
    
    console.log('User logged out, credentials cleared');
    
    // Navigate to home and force a reload to reset state
    navigate('/');
    setTimeout(() => window.location.reload(), 100);
  };
  
  return <AdminDashboard onLogout={handleLogout} />;
};

// Main App component with routing
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if credentials exist in localStorage
        const hasCredentials = credentialsService.hasCredentials();
        const validCredentials = credentialsService.getValidCredentials();
        
        console.log('Checking authentication...', { hasCredentials, validCredentials: !!validCredentials });
        
        if (hasCredentials && validCredentials) {
          // Auto-login if valid credentials exist
          console.log('Valid credentials found, auto-logging in');
          setIsAuthenticated(true);
          
          // Set user role from localStorage or default to admin for now
          const userRole = localStorage.getItem('userRole') as UserRole || 'admin';
          localStorage.setItem('userRole', userRole);
        } else {
          console.log('No valid credentials found, requiring login');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (_username: string, role: UserRole) => {
    console.log('Login success with role:', role);
    setIsAuthenticated(true);
    
    // Update the UserContext with the user role - direct approach
    localStorage.setItem('userRole', role);
    
    // Note: If credentials were entered via API Settings, they would already be saved
    // This login is more for role-based access, the actual API credentials
    // are managed separately via the credentialsService
    
    // Add a small delay to ensure state updates before navigation
    setTimeout(() => {
      console.log('Navigating after login, role is:', role);
      navigate('/');
    }, 100);
  };

  // Show login form if not authenticated
  if (!isAuthenticated && !isLoading) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // Render app with routing
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/client/:clientId" element={<ClientDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
