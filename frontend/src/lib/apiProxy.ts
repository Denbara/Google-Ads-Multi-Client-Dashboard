/**
 * API Proxy for Google Ads API
 * 
 * This service handles secure communication with the Google Ads API
 * by proxying requests through a server-side component.
 */

import { ApiCredentials } from './credentialsService';

// Response types
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  accounts?: AccountInfo[];
  error?: string;
  timestamp: number;
}

export interface AccountInfo {
  id: string;
  name: string;
  currencyCode: string;
  timeZone: string;
}

class GoogleAdsApiProxy {
  // Store the last connection test result
  private lastConnectionTest: ConnectionTestResult | null = null;
  
  /**
   * Test connection to Google Ads API with provided credentials
   */
  async testConnection(credentials: ApiCredentials): Promise<ConnectionTestResult> {
    console.log('Testing connection with credentials:', credentials);
    
    try {
      // In a real implementation, this would make an API call to your backend
      // which would then attempt to connect to Google Ads API
      
      // For demo purposes, we'll simulate a network request with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful connection if credentials look valid
      // In reality, this would be determined by the actual API response
      const hasValidFormat = this.validateCredentialFormat(credentials);
      
      if (hasValidFormat) {
        // Simulate successful connection
        const result: ConnectionTestResult = {
          success: true,
          message: 'Successfully connected to Google Ads API',
          accounts: this.generateMockAccounts(),
          timestamp: Date.now()
        };
        
        // Store the result
        this.lastConnectionTest = result;
        
        // Store connection timestamp
        localStorage.setItem('last_connection_timestamp', Date.now().toString());
        
        return result;
      } else {
        // Simulate connection failure
        const result: ConnectionTestResult = {
          success: false,
          message: 'Failed to connect to Google Ads API',
          error: 'Invalid credential format or authentication failed',
          timestamp: Date.now()
        };
        
        // Store the result
        this.lastConnectionTest = result;
        
        return result;
      }
    } catch (error) {
      // Handle any errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const result: ConnectionTestResult = {
        success: false,
        message: 'Error connecting to Google Ads API',
        error: errorMessage,
        timestamp: Date.now()
      };
      
      // Store the result
      this.lastConnectionTest = result;
      
      return result;
    }
  }
  
  /**
   * Get the last connection test result
   */
  getLastConnectionTest(): ConnectionTestResult | null {
    return this.lastConnectionTest;
  }
  
  /**
   * Get the last successful connection timestamp
   */
  getLastConnectionTimestamp(): number | null {
    const timestamp = localStorage.getItem('last_connection_timestamp');
    return timestamp ? parseInt(timestamp, 10) : null;
  }
  
  /**
   * Check if credentials have valid format
   * This is a simple validation and would be much more robust in production
   */
  private validateCredentialFormat(credentials: ApiCredentials): boolean {
    // Check if required fields are present and have reasonable formats
    if (!credentials.clientId || !credentials.clientId.includes('.apps.googleusercontent.com')) {
      return false;
    }
    
    if (!credentials.clientSecret || credentials.clientSecret.length < 10) {
      return false;
    }
    
    if (!credentials.developerToken || credentials.developerToken.length < 10) {
      return false;
    }
    
    if (!credentials.refreshToken || credentials.refreshToken.length < 10) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Generate mock accounts for demo purposes
   * In a real implementation, this would come from the API
   */
  private generateMockAccounts(): AccountInfo[] {
    return [
      {
        id: '1234567890',
        name: 'Main Marketing Account',
        currencyCode: 'USD',
        timeZone: 'America/New_York'
      },
      {
        id: '2345678901',
        name: 'West Coast Campaigns',
        currencyCode: 'USD',
        timeZone: 'America/Los_Angeles'
      },
      {
        id: '3456789012',
        name: 'European Campaigns',
        currencyCode: 'EUR',
        timeZone: 'Europe/London'
      }
    ];
  }
}

// Export singleton instance
export const googleAdsApiProxy = new GoogleAdsApiProxy();
