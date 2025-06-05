import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { googleAdsApiProxy, ConnectionTestResult } from "../lib/apiProxy";
import { googleAdsApiRealClient } from "../lib/googleAdsApiRealClient";

interface ApiCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  managerId?: string;
}

interface ApiSettingsProps {
  onSave: (credentials: ApiCredentials) => Promise<boolean>;
  initialCredentials?: ApiCredentials;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ onSave, initialCredentials }) => {
  const [clientId, setClientId] = useState(initialCredentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(initialCredentials?.clientSecret || '');
  const [developerToken, setDeveloperToken] = useState(initialCredentials?.developerToken || '');
  const [refreshToken, setRefreshToken] = useState(initialCredentials?.refreshToken || '');
  const [managerId, setManagerId] = useState(initialCredentials?.managerId || '');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Connection test states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [usingRealApi, setUsingRealApi] = useState(false);
  
  // Load last connection time on component mount
  useEffect(() => {
    // Check for existing test results
    const lastTest = googleAdsApiProxy.getLastConnectionTest();
    if (lastTest) {
      setTestResult(lastTest);
    }
  }, []);
  
  // Handle saving credentials
  const handleSave = async () => {
    // Reset states
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    try {
      // Validate inputs
      if (!clientId || !clientSecret || !developerToken || !refreshToken) {
        throw new Error('All fields are required');
      }
      
      // Save credentials
      const credentials = {
        clientId,
        clientSecret,
        developerToken,
        refreshToken,
        managerId
      };
      
      const result = await onSave(credentials);
      
      if (result) {
        setSuccess(true);
        
        // Also save to real API client
        try {
          await googleAdsApiRealClient.saveCredentials(credentials);
        } catch (apiError) {
          console.error('Error saving to real API client:', apiError);
          throw new Error(`Failed to save credentials to API server: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        }
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle testing connection
  const handleTestConnection = async () => {
    // Reset states
    setError(null);
    setTestResult(null);
    setTesting(true);
    setUsingRealApi(false);
    
    try {
      // Validate inputs
      if (!clientId || !clientSecret || !developerToken || !refreshToken) {
        throw new Error('All fields are required to test connection');
      }
      
      // Test connection with current credentials
      const credentials = {
        clientId,
        clientSecret,
        developerToken,
        refreshToken,
        managerId
      };
      
      // First try with real API client
      try {
        console.log('Attempting to connect with real Google Ads API...');
        
        // First save credentials to the real client for this test
        await googleAdsApiRealClient.saveCredentials(credentials);
        
        const realResult = await googleAdsApiRealClient.fetchAccounts();
        
        if (realResult.success && realResult.accounts && realResult.accounts.length > 0) {
          // Use real result
          console.log('Successfully connected to real Google Ads API!', realResult);
          setUsingRealApi(true);
          
          const result: ConnectionTestResult = {
            success: true,
            message: 'Successfully connected to real Google Ads API',
            accounts: realResult.accounts,
            timestamp: Date.now()
          };
          
          setTestResult(result);
          return;
        } else {
          console.warn('Real API connection succeeded but returned no accounts');
          throw new Error('API connection succeeded but no accounts were found');
        }
      } catch (realError) {
        console.error('Real API client test failed:', realError);
        // Only fall back to mock client if there's a real error
        setError(`Real API connection failed: ${realError instanceof Error ? realError.message : 'Unknown error'}`);
        
        // Fall back to mock client
        console.log('Falling back to mock API client...');
      }
      
      // Fall back to mock client if real client fails
      const result = await googleAdsApiProxy.testConnection(credentials);
      result.message = 'Using mock data (Real API connection failed)';
      setTestResult(result);
      
      if (!result.success) {
        setError(result.error || 'Connection test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during connection test');
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Ads API Settings</CardTitle>
        <CardDescription>
          Enter your Google Ads API credentials to connect your dashboard to real data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>API credentials saved successfully</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Your Google OAuth Client ID"
              />
              <p className="text-sm text-gray-500">
                From Google Cloud Console &gt; APIs &amp; Services &gt; Credentials
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Your Google OAuth Client Secret"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="developerToken">Developer Token</Label>
              <Input
                id="developerToken"
                value={developerToken}
                onChange={(e) => setDeveloperToken(e.target.value)}
                placeholder="Your Google Ads Developer Token"
              />
              <p className="text-sm text-gray-500">
                From Google Ads account under Tools &amp; Settings &gt; Setup &gt; API Center
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="refreshToken">Refresh Token</Label>
              <Input
                id="refreshToken"
                type="password"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="OAuth Refresh Token"
              />
              <p className="text-sm text-gray-500">
                Generated using the <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OAuth Playground</a>
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="managerId">Manager Account ID (Optional)</Label>
              <Input
                id="managerId"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                placeholder="e.g., 123-456-7890"
              />
              <p className="text-sm text-gray-500">
                If you use a manager account (MCC), enter its ID here
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save API Settings'}
            </Button>
            
            <Button 
              onClick={handleTestConnection}
              disabled={testing}
              variant="outline"
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : 'Test API Connection'}
            </Button>
          </div>
          
          {/* Connection Test Results */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-md ${testResult.success ? (usingRealApi ? 'bg-blue-50' : 'bg-green-50') : 'bg-amber-50'}`}>
              <h3 className={`text-lg font-medium ${testResult.success ? (usingRealApi ? 'text-blue-800' : 'text-green-800') : 'text-amber-800'}`}>
                Connection Test Results {usingRealApi && <span className="text-blue-600 text-sm font-normal ml-2">(Real API)</span>}
              </h3>
              
              <div className="mt-2">
                <p className={`${testResult.success ? (usingRealApi ? 'text-blue-700' : 'text-green-700') : 'text-amber-700'}`}>
                  {testResult.message}
                </p>
                
                {testResult.success && testResult.accounts && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Found {testResult.accounts.length} accounts:</p>
                    <ul className="mt-1 text-sm text-gray-600 list-disc pl-5">
                      {testResult.accounts.map(account => (
                        <li key={account.id}>{account.name} ({account.id})</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!testResult.success && testResult.error && (
                  <p className="mt-2 text-sm text-red-600">
                    Error: {testResult.error}
                  </p>
                )}
                
                <p className="mt-3 text-xs text-gray-500">
                  Last tested: {new Date(testResult.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium mb-2">Need help?</h3>
            <p className="text-sm text-gray-500">
              Follow our <a href="#" className="text-blue-600 hover:underline">step-by-step guide</a> to set up your Google Ads API credentials.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;
