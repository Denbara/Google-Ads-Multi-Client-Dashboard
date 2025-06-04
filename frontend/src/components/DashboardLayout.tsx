import React, { useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardDescription, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../lib/UserContext";
import ConnectionStatusIndicator from './ConnectionStatusIndicator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  // Use direct context access instead of hook for debugging
  const userContext = useContext(UserContext);
  const isAdmin = userContext?.isAdmin || false;
  
  console.log('DashboardLayout rendering, isAdmin:', isAdmin);
  
  const handleAdminNavigation = () => {
    console.log('Admin navigation button clicked');
    navigate('/admin');
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Google Ads Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator />
            
            {isAdmin && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleAdminNavigation}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Custom Date
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 px-4">
        {/* Time Period Selector */}
        <div className="mb-6">
          <Tabs defaultValue="30days" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            <TabsContent value="7days">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0">
                  <CardDescription>Data for the last 7 days</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="30days">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0">
                  <CardDescription>Data for the last 30 days</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="month">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0">
                  <CardDescription>Data for the current calendar month</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Google Ads Dashboard. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
