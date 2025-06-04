import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { googleAdsService } from '../lib/googleAdsService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

/**
 * Connection Status Indicator Component
 * 
 * Displays the current connection status to the Google Ads API
 * in the dashboard header.
 */
const ConnectionStatusIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastTestedTime, setLastTestedTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Check connection status on mount and periodically
    checkConnectionStatus();
    
    // Set up interval to check connection status every 5 minutes
    const interval = setInterval(checkConnectionStatus, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  const checkConnectionStatus = async () => {
    // Get the connection status from the service
    const status = googleAdsService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setLastTestedTime(status.lastChecked);
    
    // If we haven't checked connection yet, do it now
    if (!status.lastChecked) {
      await googleAdsService.testConnection();
      // Update status after test
      const newStatus = googleAdsService.getConnectionStatus();
      setIsConnected(newStatus.isConnected);
      setLastTestedTime(newStatus.lastChecked);
    }
  };
  
  // Format the last tested time
  const getFormattedTime = () => {
    if (!lastTestedTime) return 'Never tested';
    
    const now = new Date();
    const diffMs = now.getTime() - lastTestedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };
  
  // Determine the status color and icon
  const getStatusDetails = () => {
    if (isConnected === null) {
      return {
        icon: <WifiOff className="h-4 w-4 text-gray-500" />,
        label: 'Not Connected',
        color: 'bg-gray-100 text-gray-700',
        description: 'API connection has not been tested'
      };
    }
    
    if (isConnected) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        label: 'Connected',
        color: 'bg-green-100 text-green-700',
        description: 'API connection is active'
      };
    }
    
    return {
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
      label: 'Connection Failed',
      color: 'bg-amber-100 text-amber-700',
      description: 'API connection test failed'
    };
  };
  
  const status = getStatusDetails();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color} text-xs font-medium cursor-help`}>
            {status.icon}
            <span>{status.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-medium">{status.description}</p>
            <p className="text-xs text-gray-500 mt-1">Last tested: {getFormattedTime()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusIndicator;
