import axios from 'axios';
import { ExtendedClient, GoogleAdsClient, GoogleAdsMetrics, ConversionData } from './googleAdsApiClient';

// Function to get the API base URL based on the environment
const getApiBaseUrl = (): string => {
  // For Heroku deployment - update this with your actual Heroku app URL
  return 'https://google-ads-api-server-8752abf48e8e.herokuapp.com/api';
};

// Real Google Ads API client implementation
export const googleAdsApiRealClient: GoogleAdsClient = {
  // Test the connection to the Google Ads API
  testConnection: async ( ) => {
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
  },

  // Get a list of all Google Ads accounts
  getAccounts: async () => {
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
  },

  // Get metrics for a specific account
  getMetrics: async (accountId: string) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/metrics/${accountId}`);
      return response.data as GoogleAdsMetrics;
    } catch (error) {
      console.error('Error fetching real metrics:', error);
      throw new Error('Failed to fetch metrics from Google Ads API');
    }
  },

  // Get conversion data for a specific account
  getConversionData: async (accountId: string) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/conversions/${accountId}`);
      return response.data as ConversionData;
    } catch (error) {
      console.error('Error fetching real conversion data:', error);
      throw new Error('Failed to fetch conversion data from Google Ads API');
    }
  },

  // Save API credentials
  saveCredentials: async (credentials: {
    developerToken: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  }) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/credentials`, credentials);
      return response.data.success;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  },

  // Check if credentials exist
  checkCredentials: async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/credentials`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking credentials:', error);
      return false;
    }
  },

  // Delete API credentials
  deleteCredentials: async () => {
    try {
      const response = await axios.delete(`${getApiBaseUrl()}/credentials`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  }
};

export default googleAdsApiRealClient;
