import axios from 'axios';
import { GoogleAdsApiClient, GoogleAdsAccount, GoogleAdsMetrics } from './googleAdsApiClient';

/**
 * Real Google Ads API Client implementation
 * Connects to the actual Google Ads API through our backend proxy
 */
export class GoogleAdsApiRealClient implements GoogleAdsApiClient {
  private credentials: {
    clientId: string;
    clientSecret: string;
    developerToken: string;
    refreshToken: string;
  } | null = null;

  /**
   * Get the appropriate API base URL based on the current environment
   */
  private getApiBaseUrl(): string {
    const hostname = window.location.hostname;
    
    // For production deployments
    if (hostname.includes('manus.space')) {
      // TODO: Replace with your actual deployed backend URL
      return 'https://your-deployed-backend-url.com/api';
    }
    
    // For development environments
    if (hostname.includes('manusvm.computer')) {
      // Extract the unique ID from the hostname for the backend URL
      const uniqueId = hostname.split('-')[1];
      if (uniqueId) {
        return `https://3001-${uniqueId}-07af5fe8.manusvm.computer/api`;
      }
    }
    
    // Fallback to localhost for local development
    return 'http://localhost:3001/api';
  }

  /**
   * Set API credentials
   */
  setCredentials(credentials: {
    clientId: string;
    clientSecret: string;
    developerToken: string;
    refreshToken: string;
  }): void {
    this.credentials = credentials;
  }

  /**
   * Save API credentials to the backend
   */
  async saveCredentials(): Promise<boolean> {
    if (!this.credentials) {
      console.error('No credentials to save');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.getApiBaseUrl()}/credentials`,
        this.credentials
      );
      
      return response.data.success;
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw new Error(`Failed to save API credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test connection to the Google Ads API
   */
  async testConnection(): Promise<{ success: boolean; accounts?: GoogleAdsAccount[]; message: string }> {
    if (!this.credentials) {
      return { 
        success: false, 
        message: 'No credentials provided' 
      };
    }

    try {
      console.log('Testing connection to real Google Ads API...');
      const response = await axios.post(
        `${this.getApiBaseUrl()}/test-connection`,
        this.credentials,
        { timeout: 15000 } // 15 second timeout
      );
      
      if (response.data.success) {
        return {
          success: true,
          accounts: response.data.accounts,
          message: 'Successfully connected to Google Ads API'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Real API connection failed: ${errorMessage}`);
    }
  }

  /**
   * Get list of Google Ads accounts
   */
  async getAccounts(): Promise<GoogleAdsAccount[]> {
    try {
      const response = await axios.get(`${this.getApiBaseUrl()}/accounts`);
      
      if (response.data.success) {
        return response.data.accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          type: 'google_ads',
          status: account.status || 'active'
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error(`Failed to fetch Google Ads accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get metrics for a specific account
   */
  async getMetrics(accountId: string, period: string): Promise<GoogleAdsMetrics> {
    try {
      const response = await axios.get(
        `${this.getApiBaseUrl()}/metrics/${accountId}?period=${period}`
      );
      
      if (response.data.success) {
        return {
          impressions: response.data.metrics.impressions,
          clicks: response.data.metrics.clicks,
          cost: response.data.metrics.cost,
          conversions: response.data.metrics.conversions,
          costPerLead: response.data.metrics.costPerLead,
          period: response.data.metrics.period
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw new Error(`Failed to fetch account metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
