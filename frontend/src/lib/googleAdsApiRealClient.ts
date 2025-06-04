import axios from 'axios';
import { ExtendedClient, GoogleAdsClient, GoogleAdsMetrics, ConversionData } from './googleAdsApiClient';

// Function to get the API base URL based on the environment
const getApiBaseUrl = (): string => {
  // For Heroku deployment - update this with your actual Heroku app URL
  return 'https://google-ads-api-server-8752abf48e8e.herokuapp.com/api';
};

// Real Google Ads API client implementation
class RealGoogleAdsApiClient implements GoogleAdsClient {
  private selectedAccountId: string | null = null;

  // Set selected account ID
  setSelectedAccountId(accountId: string): void {
    this.selectedAccountId = accountId;
  }

  // Get selected account ID
  getSelectedAccountId(): string | null {
    return this.selectedAccountId;
  }

  // Fetch accounts from Google Ads API
  async fetchAccounts(): Promise<{ success: boolean; accounts: any[]; error?: string }> {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/accounts`);
      return {
        success: true,
        accounts: response.data || []
      };
    } catch (error) {
      console.error('Error fetching real accounts:', error);
      return {
        success: false,
        accounts: [],
        error: error instanceof Error ? error.message : 'Failed to fetch accounts'
      };
    }
  }

  // Fetch metrics for a specific period
  async fetchMetrics(period: string): Promise<any> {
    try {
      if (!this.selectedAccountId) {
        throw new Error('No account selected');
      }
      const response = await axios.get(`${getApiBaseUrl()}/metrics/${this.selectedAccountId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching real metrics:', error);
      throw new Error('Failed to fetch metrics from Google Ads API');
    }
  }

  // Test the connection to the Google Ads API
  async testConnection(): Promise<{ success: boolean; accounts?: any[]; error?: string }> {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/test-connection`);
      if (response.data.success) {
        return {
          success: true,
          accounts: response.data.accounts || []
        };
      } else {
        return { success: false, error: 'Connection failed' };
      }
    } catch (error) {
      console.error('Real API connection failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network Error' 
      };
    }
  }

  // Get a list of all Google Ads accounts
  async getAccounts(): Promise<ExtendedClient[]> {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/accounts`);
      const accounts = response.data.map((account: any) => ({
        ...account,
        isRealAccount: true
      }));
      return accounts as ExtendedClient[];
    } catch (error) {
      console.error('Error fetching real accounts:', error);
      throw new Error('Failed to fetch accounts from Google Ads API');
    }
  }

  // Get metrics for a specific account
  async getMetrics(accountId: string): Promise<GoogleAdsMetrics> {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/metrics/${accountId}`);
      return response.data as GoogleAdsMetrics;
    } catch (error) {
      console.error('Error fetching real metrics:', error);
      throw new Error('Failed to fetch metrics from Google Ads API');
    }
  }

  // Get conversion data for a specific account
  async getConversionData(accountId: string): Promise<ConversionData> {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/conversions/${accountId}`);
      return response.data as ConversionData;
    } catch (error) {
      console.error('Error fetching real conversion data:', error);
      throw new Error('Failed to fetch conversion data from Google Ads API');
    }
  }

  // Save API credentials
  async saveCredentials(credentials: {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }): Promise<boolean> {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/credentials`, credentials);
      return response.data.success;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  }

  // Check if credentials exist
  async checkCredentials(): Promise<boolean> {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/credentials`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking credentials:', error);
      return false;
    }
  }

  // Delete API credentials
  async deleteCredentials(): Promise<boolean> {
    try {
      const response = await axios.delete(`${getApiBaseUrl()}/credentials`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleAdsApiRealClient = new RealGoogleAdsApiClient();
export default googleAdsApiRealClient;
