import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Users, 
  Archive, 
  PlusCircle, 
  Search, 
  Building, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  ArrowLeft,
  Save,
  RefreshCw,
  Settings
} from "lucide-react";
import { Client, clientsService } from "../lib/clientsService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { useClientValidation, useConfirmation } from "./DialogUtils";
import { useToast } from "./ui/use-toast";
import ApiSettings from "./ApiSettings";
import { credentialsService } from "../lib/credentialsService";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [archivedClients, setArchivedClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState<boolean>(false);
  const [newTeamMember, setNewTeamMember] = useState<string>("");
  
  // Validation and confirmation hooks
  const { validateClient, showValidationErrors } = useClientValidation();
  const { openConfirmation, ConfirmationDialogComponent } = useConfirmation();
  const { toast } = useToast();
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setClients(clientsService.getClients(false));
    setArchivedClients(clientsService.getArchivedClients());
    setTeamMembers(clientsService.getTeamMembers());
  };
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.assignedTeamMember.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredArchivedClients = archivedClients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.assignedTeamMember.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle client editing
  const handleEditClient = (client: Client) => {
    setEditingClient({...client});
    setIsAddingClient(false);
  };
  
  // Handle client creation
  const handleAddClient = () => {
    const newClient: Omit<Client, 'id'> = {
      name: "",
      company: "",
      dateOnboarded: new Date().toISOString().split('T')[0],
      totalConversions: 0,
      formConversions: 0,
      callConversions: 0,
      costPerLead: 0,
      totalSpend: 0,
      trends: {
        totalConversions: 0,
        costPerLead: 0,
        totalSpend: 0
      },
      assignedTeamMember: teamMembers.length > 0 ? teamMembers[0] : "",
      isArchived: false,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: ""
    };
    
    setEditingClient(newClient as Client);
    setIsAddingClient(true);
  };
  
  // Handle client save
  const handleSaveClient = () => {
    if (!editingClient) return;
    
    // Validate client data
    const { isValid, errors } = validateClient(editingClient);
    
    if (!isValid) {
      showValidationErrors(errors);
      return;
    }
    
    if (isAddingClient) {
      const { id, ...clientWithoutId } = editingClient;
      clientsService.addClient(clientWithoutId);
      toast({
        title: "Client Added",
        description: `${editingClient.name} has been successfully added.`,
      });
    } else {
      clientsService.updateClient(editingClient.id, editingClient);
      toast({
        title: "Client Updated",
        description: `${editingClient.name} has been successfully updated.`,
      });
    }
    
    setEditingClient(null);
    setIsAddingClient(false);
    loadData();
  };
  
  // Handle client archive/unarchive
  const handleArchiveClient = (client: Client) => {
    openConfirmation({
      title: "Archive Client",
      description: `Are you sure you want to archive ${client.name}? This client will be moved to the archived section.`,
      confirmText: "Archive",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: () => {
        clientsService.archiveClient(client.id);
        loadData();
        toast({
          title: "Client Archived",
          description: `${client.name} has been moved to the archived section.`,
        });
      }
    });
  };
  
  const handleUnarchiveClient = (client: Client) => {
    openConfirmation({
      title: "Unarchive Client",
      description: `Are you sure you want to unarchive ${client.name}? This client will be moved back to active clients.`,
      confirmText: "Unarchive",
      cancelText: "Cancel",
      onConfirm: () => {
        clientsService.unarchiveClient(client.id);
        loadData();
        toast({
          title: "Client Unarchived",
          description: `${client.name} has been moved back to active clients.`,
        });
      }
    });
  };
  
  // Handle adding new team member
  const handleAddTeamMember = () => {
    if (newTeamMember.trim() && !teamMembers.includes(newTeamMember.trim())) {
      // In a real app, we would add this to a database
      // For now, we'll just add a client with this team member to make it show up
      const dummyClient = clientsService.getClients()[0];
      clientsService.addClient({
        ...dummyClient,
        assignedTeamMember: newTeamMember.trim(),
        isArchived: true // Hide it from the main view
      });
      
      setTeamMembers([...teamMembers, newTeamMember.trim()]);
      setNewTeamMember("");
      loadData();
      
      toast({
        title: "Team Member Added",
        description: `${newTeamMember.trim()} has been added to the team.`,
      });
    } else if (teamMembers.includes(newTeamMember.trim())) {
      toast({
        title: "Team Member Exists",
        description: `${newTeamMember.trim()} is already on the team.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid team member name.",
        variant: "destructive",
      });
    }
  };
  
  // Render client form
  const renderClientForm = () => {
    if (!editingClient) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              setEditingClient(null);
              setIsAddingClient(false);
            }}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold">
            {isAddingClient ? "Add New Client" : "Edit Client"}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={handleSaveClient}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Client
            </Button>
            {!isAddingClient && (
              <Button 
                variant="destructive" 
                onClick={() => handleArchiveClient(editingClient)}
                className="flex items-center"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Basic information about the client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input 
                  id="name" 
                  value={editingClient.name} 
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input 
                  id="company" 
                  value={editingClient.company} 
                  onChange={(e) => setEditingClient({...editingClient, company: e.target.value})}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOnboarded">Date Onboarded</Label>
                <Input 
                  id="dateOnboarded" 
                  type="date"
                  value={editingClient.dateOnboarded} 
                  onChange={(e) => setEditingClient({...editingClient, dateOnboarded: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTeamMember">Assigned Team Member</Label>
                <Select 
                  value={editingClient.assignedTeamMember} 
                  onValueChange={(value) => setEditingClient({...editingClient, assignedTeamMember: value})}
                >
                  <SelectTrigger id="assignedTeamMember">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Contact details for this client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input 
                  id="contactName" 
                  value={editingClient.contactName || ''} 
                  onChange={(e) => setEditingClient({...editingClient, contactName: e.target.value})}
                  placeholder="Enter contact name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  value={editingClient.contactEmail || ''} 
                  onChange={(e) => setEditingClient({...editingClient, contactEmail: e.target.value})}
                  placeholder="Enter contact email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input 
                  id="contactPhone" 
                  value={editingClient.contactPhone || ''} 
                  onChange={(e) => setEditingClient({...editingClient, contactPhone: e.target.value})}
                  placeholder="Enter contact phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={editingClient.notes || ''} 
                  onChange={(e) => setEditingClient({...editingClient, notes: e.target.value})}
                  placeholder="Enter any notes about this client"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Render client list
  const renderClientList = (clients: Client[], isArchived: boolean) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {!isArchived && (
            <Button onClick={handleAddClient} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          )}
        </div>
        
        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {isArchived 
                  ? "No archived clients found." 
                  : "No clients found. Add your first client to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{client.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        {client.company}
                      </CardDescription>
                    </div>
                    <Badge variant={isArchived ? "outline" : "default"}>
                      {isArchived ? "Archived" : "Active"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.assignedTeamMember}</span>
                    </div>
                    {client.contactName && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{client.contactPhone}</span>
                      </div>
                    )}
                    {client.contactEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{client.contactEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Onboarded: {client.dateOnboarded}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="border-t p-4 bg-muted/50">
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditClient(client)}
                    >
                      Edit Details
                    </Button>
                    {isArchived ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnarchiveClient(client)}
                        className="flex items-center"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Unarchive
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArchiveClient(client)}
                        className="flex items-center"
                      >
                        <Archive className="mr-1 h-3 w-3" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render team management
  const renderTeamManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Team Members</h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="New team member name"
              value={newTeamMember}
              onChange={(e) => setNewTeamMember(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleAddTeamMember}>Add</Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Team Members</CardTitle>
            <CardDescription>
              Team members who can be assigned to clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground">No team members found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        <span>{member}</span>
                      </div>
                      <Badge variant="outline">
                        {clients.filter(c => c.assignedTeamMember === member && !c.isArchived).length} clients
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </div>
      
      {editingClient ? (
        renderClientForm()
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="clients" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Active Clients
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center">
              <Archive className="mr-2 h-4 w-4" />
              Archived Clients
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              API Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="space-y-4">
            {renderClientList(filteredClients, false)}
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-4">
            {renderClientList(filteredArchivedClients, true)}
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4">
            {renderTeamManagement()}
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <ApiSettings 
              initialCredentials={credentialsService.getCredentials() || undefined}
              onSave={async (credentials) => {
                try {
                  // Store credentials securely using the credentials service
                  const success = credentialsService.saveCredentials(credentials);
                  
                  if (success) {
                    // Show success message
                    toast({
                      title: "API Settings Saved",
                      description: "Your Google Ads API credentials have been saved successfully.",
                      variant: "default"
                    });
                  } else {
                    throw new Error("Failed to save credentials");
                  }
                  
                  return success;
                } catch (error) {
                  console.error('Error saving API credentials:', error);
                  return false;
                }
              }}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Render confirmation dialog */}
      <ConfirmationDialogComponent />
    </div>
  );
};

export default AdminDashboard;
