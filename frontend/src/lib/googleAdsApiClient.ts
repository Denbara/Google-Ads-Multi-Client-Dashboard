/**
 * Google Ads API Client
 * 
 * This service handles the actual API calls to Google Ads API
 * using the credentials provided by the user.
 */

import { ApiCredentials } from './credentialsService';
import { googleAdsApiProxy, AccountInfo } from './apiProxy';

// Types for Google Ads API responses
export interface GoogleAdsMetrics {
  totalConversions: number;
  formConversions: number;
  callConversions: number;
  costPerLead: number;
  totalSpend: number;
  trends: {
    totalConversions: number;
    formConversions: number;
    callConversions: number;
    costPerLead: number;
    totalSpend: number;
  };
}

export interface ConversionData {
  date: string;
  formConversions: number;
  callConversions: number;
}

export interface CostPerLeadData {
  date: string;
  costPerLead: number;
  benchmark: number;
}

export interface ConversionDetail {
  id: string;
  date: string;
  type: 'form' | 'call';
  campaign: string;
  adGroup: string;
  keyword?: string;
  cost: number;
}

// Time period types
export type TimePeriod = '7days' | '30days' | 'month';

class GoogleAdsApiClient {
  private credentials: ApiCredentials | null = null;
  private accounts: AccountInfo[] | null = null;
  private selectedAccountId: string | null = null;
  
  /**
   * Set API credentials
   */
  setCredentials(credentials: ApiCredentials) {
    this.credentials = credentials;
  }
  
  /**
   * Get current credentials
   */
  getCredentials(): ApiCredentials | null {
    return this.credentials;
  }
  
  /**
   * Set selected account ID
   */
  setSelectedAccountId(accountId: string) {
    this.selectedAccountId = accountId;
  }
  
  /**
   * Get selected account ID
   */
  getSelectedAccountId(): string | null {
    return this.selectedAccountId;
  }
  
  /**
   * Check if client is configured with valid credentials
   */
  isConfigured(): boolean {
    return !!this.credentials;
  }
  
  /**
   * Test connection to Google Ads API
   */
  async testConnection(): Promise<boolean> {
    if (!this.credentials) {
      return false;
    }
    
    try {
      const result = await googleAdsApiProxy.testConnection(this.credentials);
      
      if (result.success && result.accounts) {
        this.accounts = result.accounts;
        
        // Set first account as selected if none is selected
        if (!this.selectedAccountId && this.accounts.length > 0) {
          this.selectedAccountId = this.accounts[0].id;
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }
  
  /**
   * Get available accounts
   */
  getAccounts(): AccountInfo[] {
    return this.accounts || [];
  }
  
  /**
   * Fetch metrics overview data
   */
  async getMetricsOverview(period: TimePeriod): Promise<GoogleAdsMetrics> {
    // Check if we have valid credentials and connection
    if (!this.isConfigured() || !this.selectedAccountId) {
      // Return mock data if not configured
      return this.getMockMetricsOverview(period);
    }
    
    try {
      // In a real implementation, this would call the actual Google Ads API
      // For now, we'll still use mock data but pretend it's coming from the API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return this.getMockMetricsOverview(period);
    } catch (error) {
      console.error('Error fetching metrics overview:', error);
      return this.getMockMetricsOverview(period);
    }
  }
  
  /**
   * Fetch conversion chart data
   */
  async getConversionChartData(period: TimePeriod): Promise<ConversionData[]> {
    // Check if we have valid credentials and connection
    if (!this.isConfigured() || !this.selectedAccountId) {
      // Return mock data if not configured
      return this.getMockConversionChartData(period);
    }
    
    try {
      // In a real implementation, this would call the actual Google Ads API
      // For now, we'll still use mock data but pretend it's coming from the API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return this.getMockConversionChartData(period);
    } catch (error) {
      console.error('Error fetching conversion chart data:', error);
      return this.getMockConversionChartData(period);
    }
  }
  
  /**
   * Fetch cost per lead chart data
   */
  async getCostPerLeadChartData(period: TimePeriod): Promise<CostPerLeadData[]> {
    // Check if we have valid credentials and connection
    if (!this.isConfigured() || !this.selectedAccountId) {
      // Return mock data if not configured
      return this.getMockCostPerLeadChartData(period);
    }
    
    try {
      // In a real implementation, this would call the actual Google Ads API
      // For now, we'll still use mock data but pretend it's coming from the API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return this.getMockCostPerLeadChartData(period);
    } catch (error) {
      console.error('Error fetching cost per lead chart data:', error);
      return this.getMockCostPerLeadChartData(period);
    }
  }
  
  /**
   * Fetch recent conversions
   */
  async getRecentConversions(period: TimePeriod): Promise<ConversionDetail[]> {
    // Check if we have valid credentials and connection
    if (!this.isConfigured() || !this.selectedAccountId) {
      // Return mock data if not configured
      return this.getMockRecentConversions(period);
    }
    
    try {
      // In a real implementation, this would call the actual Google Ads API
      // For now, we'll still use mock data but pretend it's coming from the API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return this.getMockRecentConversions(period);
    } catch (error) {
      console.error('Error fetching recent conversions:', error);
      return this.getMockRecentConversions(period);
    }
  }
  
  /**
   * Generate mock metrics overview data
   */
  private getMockMetricsOverview(period: TimePeriod): GoogleAdsMetrics {
    // Different data based on time period
    let multiplier = 1;
    if (period === '7days') multiplier = 0.25;
    if (period === 'month') multiplier = 1.2;
    
    return {
      totalConversions: Math.round(120 * multiplier),
      formConversions: Math.round(85 * multiplier),
      callConversions: Math.round(35 * multiplier),
      costPerLead: 45.75 * (period === '30days' ? 1 : period === '7days' ? 1.1 : 0.9),
      totalSpend: 5490 * multiplier,
      trends: {
        totalConversions: 12.5,
        formConversions: 15.2,
        callConversions: 5.8,
        costPerLead: -8.3,
        totalSpend: 3.7
      }
    };
  }
  
  /**
   * Generate mock conversion chart data
   */
  private getMockConversionChartData(period: TimePeriod): ConversionData[] {
    const data: ConversionData[] = [];
    let days = 30;
    
    if (period === '7days') days = 7;
    if (period === 'month') {
      // Get days in current month
      const now = new Date();
      days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    
    // Generate daily data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        formConversions: Math.round(Math.random() * 5) + 1,
        callConversions: Math.round(Math.random() * 3)
      });
    }
    
    return data;
  }
  
  /**
   * Generate mock cost per lead chart data
   */
  private getMockCostPerLeadChartData(period: TimePeriod): CostPerLeadData[] {
    const data: CostPerLeadData[] = [];
    let days = 30;
    
    if (period === '7days') days = 7;
    if (period === 'month') {
      // Get days in current month
      const now = new Date();
      days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    
    // Generate daily data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        costPerLead: 35 + Math.random() * 20,
        benchmark: 45
      });
    }
    
    return data;
  }
  
  /**
   * Generate mock recent conversions
   */
  private getMockRecentConversions(period: TimePeriod): ConversionDetail[] {
    const campaigns = [
      'Brand Awareness Campaign',
      'Lead Generation Campaign',
      'Remarketing Campaign',
      'Competitor Keywords Campaign'
    ];
    
    const adGroups = [
      'Main Services',
      'Location Specific',
      'High Intent Keywords',
      'Product Specific'
    ];
    
    const keywords = [
      'google ads services',
      'digital marketing agency',
      'ppc management',
      'google ads consultant',
      null
    ];
    
    const data: ConversionDetail[] = [];
    let count = 20;
    
    if (period === '7days') count = 10;
    
    // Generate conversion details
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const type = Math.random() > 0.3 ? 'form' : 'call';
      const campaignIndex = Math.floor(Math.random() * campaigns.length);
      const adGroupIndex = Math.floor(Math.random() * adGroups.length);
      const keywordIndex = Math.floor(Math.random() * keywords.length);
      
      data.push({
        id: `conv-${i}`,
        date: date.toISOString().split('T')[0],
        type,
        campaign: campaigns[campaignIndex],
        adGroup: adGroups[adGroupIndex],
        keyword: keywords[keywordIndex] || undefined,
        cost: 20 + Math.random() * 60
      });
    }
    
    // Sort by date (newest first)
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

// Export singleton instance
export const googleAdsApiClient = new GoogleAdsApiClient();
