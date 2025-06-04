// Enhanced Client data model with team assignment and archive status
export interface Client {
  id: string;
  name: string;
  company: string;
  dateOnboarded: string;
  totalConversions: number;
  formConversions: number;
  callConversions: number;
  costPerLead: number;
  totalSpend: number;
  trends: {
    totalConversions: number;
    costPerLead: number;
    totalSpend: number;
  };
  // New fields for admin features
  assignedTeamMember: string;
  isArchived: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

// User roles and authentication
export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
}

// Mock client data service with admin functionality
class ClientsService {
  private clients: Client[] = [];
  private users: User[] = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'demo123', role: 'user' }
  ];
  
  constructor() {
    this.generateMockClients();
  }
  
  // Generate mock client data
  private generateMockClients(): void {
    this.clients = [];
    
    const teamMembers = ['Sarah Johnson', 'Michael Chen', 'Priya Patel', 'David Rodriguez'];
    
    // Generate 40 mock clients
    for (let i = 1; i <= 40; i++) {
      const totalConversions = Math.round(Math.random() * 200) + 20;
      const formConversions = Math.round(totalConversions * (0.5 + Math.random() * 0.3));
      const callConversions = totalConversions - formConversions;
      const costPerLead = 20 + Math.random() * 60;
      const totalSpend = totalConversions * costPerLead;
      
      // Generate a random onboarding date within the last 2 years
      const today = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      const randomDate = new Date(
        twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime())
      );
      
      this.clients.push({
        id: `client-${i}`,
        name: `Client ${i}`,
        company: `Company ${String.fromCharCode(65 + (i % 26))}`,
        dateOnboarded: randomDate.toISOString().split('T')[0],
        totalConversions,
        formConversions,
        callConversions,
        costPerLead,
        totalSpend,
        trends: {
          totalConversions: Math.round((Math.random() * 40) - 20),
          costPerLead: Math.round((Math.random() * 30) - 15),
          totalSpend: Math.round((Math.random() * 30) - 10)
        },
        // New fields
        assignedTeamMember: teamMembers[Math.floor(Math.random() * teamMembers.length)],
        isArchived: Math.random() > 0.9, // 10% of clients are archived
        contactName: `Contact ${i}`,
        contactEmail: `contact${i}@company${String.fromCharCode(65 + (i % 26))}.com`,
        contactPhone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        notes: Math.random() > 0.7 ? `Notes for client ${i}` : undefined
      });
    }
  }
  
  // Get all clients (filtered by archive status)
  getClients(includeArchived: boolean = false): Client[] {
    return this.clients.filter(client => includeArchived || !client.isArchived);
  }
  
  // Get archived clients only
  getArchivedClients(): Client[] {
    return this.clients.filter(client => client.isArchived);
  }
  
  // Get a specific client by ID
  getClientById(id: string): Client | undefined {
    return this.clients.find(client => client.id === id);
  }
  
  // Add a new client
  addClient(client: Omit<Client, 'id'>): Client {
    const newClient = {
      ...client,
      id: `client-${Date.now()}` // Generate a unique ID
    };
    
    this.clients.push(newClient);
    return newClient;
  }
  
  // Update an existing client
  updateClient(id: string, updates: Partial<Client>): Client | undefined {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) return undefined;
    
    this.clients[index] = { ...this.clients[index], ...updates };
    return this.clients[index];
  }
  
  // Archive a client
  archiveClient(id: string): boolean {
    return this.updateClient(id, { isArchived: true }) !== undefined;
  }
  
  // Unarchive a client
  unarchiveClient(id: string): boolean {
    return this.updateClient(id, { isArchived: false }) !== undefined;
  }
  
  // Delete a client permanently (should be used sparingly)
  deleteClient(id: string): boolean {
    const index = this.clients.findIndex(client => client.id === id);
    if (index === -1) return false;
    
    this.clients.splice(index, 1);
    return true;
  }
  
  // Get all team members
  getTeamMembers(): string[] {
    const teamMembers = new Set<string>();
    this.clients.forEach(client => {
      if (client.assignedTeamMember) {
        teamMembers.add(client.assignedTeamMember);
      }
    });
    return Array.from(teamMembers);
  }
  
  // Authentication methods
  authenticateUser(username: string, password: string): User | null {
    const user = this.users.find(u => u.username === username && u.password === password);
    return user || null;
  }
  
  isAdmin(username: string): boolean {
    const user = this.users.find(u => u.username === username);
    return user?.role === 'admin';
  }
}

// Export singleton instance
export const clientsService = new ClientsService();
