import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  ArrowUpDown, 
  Search, 
  Calendar, 
  ArrowUp,
  ArrowDown,
  Building,
  Loader2
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Client } from "../lib/clientsService";
import { googleAdsApiRealClient } from "../lib/googleAdsApiRealClient";

// Extended client interface to include Google Ads accounts
interface ExtendedClient extends Partial<Client> {
  id: string;
  name: string;
  company: string;
  totalConversions: number;
  costPerLead: number;
  totalSpend: number;
  dateOnboarded: string;
  trends: {
    totalConversions: number;
    costPerLead: number;
    totalSpend: number;
  };
  isGoogleAdsAccount?: boolean;
}

interface ClientListProps {
  clients: Client[];
  onClientSelect: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onClientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalConversions' | 'costPerLead' | 'totalSpend' | 'dateOnboarded'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [allClients, setAllClients] = useState<ExtendedClient[]>([...clients]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real Google Ads accounts on component mount
  useEffect(() => {
    const fetchRealAccounts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch accounts from the real API client
        const result = await googleAdsApiRealClient.fetchAccounts();
        
        if (result.success && result.accounts.length > 0) {
          // Convert Google Ads accounts to client format
          const googleAdsClients: ExtendedClient[] = result.accounts.map(account => ({
            id: account.id,
            name: account.name,
            company: `Google Ads Account`,
            totalConversions: 0, // Will be populated when selected
            costPerLead: 0,
            totalSpend: 0,
            dateOnboarded: new Date().toISOString().split('T')[0], // Today's date
            trends: {
              totalConversions: 0,
              costPerLead: 0,
              totalSpend: 0
            },
            isGoogleAdsAccount: true, // Mark as real Google Ads account
            // Add required fields with default values
            formConversions: 0,
            callConversions: 0,
            assignedTeamMember: 'Unassigned',
            isArchived: false
          }));
          
          // Merge with existing clients, prioritizing real accounts
          const existingClientIds = new Set(clients.map(client => client.id));
          const newGoogleAdsClients = googleAdsClients.filter(client => !existingClientIds.has(client.id));
          
          setAllClients([...newGoogleAdsClients, ...clients]);
          console.log('Found accounts:', newGoogleAdsClients.length);
        } else {
          console.log('No real Google Ads accounts found or connection failed');
          // Keep existing clients
          setAllClients([...clients]);
        }
      } catch (err) {
        console.error('Error fetching real Google Ads accounts:', err);
        setError('Failed to fetch Google Ads accounts');
        // Keep existing clients
        setAllClients([...clients]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealAccounts();
  }, [clients]);

  // Filter clients based on search term
  const filteredClients = allClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort clients based on selected criteria
  const sortedClients = [...filteredClients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'totalConversions':
        comparison = a.totalConversions - b.totalConversions;
        break;
      case 'costPerLead':
        comparison = a.costPerLead - b.costPerLead;
        break;
      case 'totalSpend':
        comparison = a.totalSpend - b.totalSpend;
        break;
      case 'dateOnboarded':
        comparison = new Date(a.dateOnboarded).getTime() - new Date(b.dateOnboarded).getTime();
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Toggle sort direction
  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Render trend indicator
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-500">
          <ArrowUp className="h-3 w-3 mr-1" />
          {value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-500">
          <ArrowDown className="h-3 w-3 mr-1" />
          {Math.abs(value)}%
        </span>
      );
    }
    return <span>0%</span>;
  };

  // Handle client selection
  const handleClientSelect = (client: ExtendedClient) => {
    // If this is a Google Ads account, set it as the selected account
    if (client.isGoogleAdsAccount) {
      googleAdsApiRealClient.setSelectedAccountId(client.id);
    }
    
    // Call the parent handler
    onClientSelect(client.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as typeof sortBy)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Client Name</SelectItem>
              <SelectItem value="totalConversions">Total Conversions</SelectItem>
              <SelectItem value="costPerLead">Cost Per Lead</SelectItem>
              <SelectItem value="totalSpend">Total Spend</SelectItem>
              <SelectItem value="dateOnboarded">Date Onboarded</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading Google Ads accounts...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 mb-4">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] cursor-pointer" onClick={() => toggleSort('name')}>
                Client Name
                {sortBy === 'name' && (
                  <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                )}
              </TableHead>
              <TableHead className="w-[180px]">
                <div className="flex items-center">
                  Company
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('totalConversions')}>
                <div className="flex items-center">
                  Conversions
                  {sortBy === 'totalConversions' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => toggleSort('costPerLead')}>
                <div className="flex items-center">
                  Cost Per Lead
                  {sortBy === 'costPerLead' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('totalSpend')}>
                <div className="flex items-center">
                  Total Spend
                  {sortBy === 'totalSpend' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hidden lg:table-cell" onClick={() => toggleSort('dateOnboarded')}>
                <div className="flex items-center">
                  Date Onboarded
                  {sortBy === 'dateOnboarded' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No clients found. Try adjusting your search.
                </TableCell>
              </TableRow>
            ) : (
              sortedClients.map((client) => (
                <TableRow key={client.id} className={client.isGoogleAdsAccount ? 'bg-blue-50' : ''}>
                  <TableCell className="font-medium">
                    {client.name}
                    {client.isGoogleAdsAccount && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Google Ads
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      {client.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{client.totalConversions}</span>
                      <span className="text-xs text-muted-foreground">
                        {renderTrend(client.trends.totalConversions)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="font-semibold">${client.costPerLead.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {renderTrend(-client.trends.costPerLead)} {/* Invert since lower is better */}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">${client.totalSpend.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {renderTrend(client.trends.totalSpend)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {client.dateOnboarded}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClientSelect(client)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        Showing {sortedClients.length} of {allClients.length} clients
        {allClients.filter(c => c.isGoogleAdsAccount).length > 0 && (
          <span className="ml-1">
            (including {allClients.filter(c => c.isGoogleAdsAccount).length} Google Ads accounts)
          </span>
        )}
      </div>
    </div>
  );
};

export default ClientList;
