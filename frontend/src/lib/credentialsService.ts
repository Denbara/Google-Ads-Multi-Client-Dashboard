// Service for handling API credentials via backend server
// Credentials are now stored securely on the server instead of localStorage

export interface ApiCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  managerId?: string;
}

// Function to get the API base URL
const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    // In production, this should be replaced with your actual Heroku app URL
    // The GitHub Actions workflow will update this automatically
    return 'https://your-deployed-backend-url.com/api';
  }
  return 'http://localhost:3001/api';
};

// Service for securely handling API credentials via backend
class CredentialsService {
  private credentials: ApiCredentials | null = null;
  private isLoaded = false;

  // Save credentials to backend server
  async saveCredentials(credentials: ApiCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        this.credentials = credentials;
        this.isLoaded = true;
        console.log('Credentials saved to server successfully');
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to save credentials to server:', error);
        return false;
      }
    } catch (error) {
      console.error('Error saving credentials to server:', error);
      return false;
    }
  }

  // Get credentials from backend server
  async getCredentials(): Promise<ApiCredentials | null> {
    try {
      // If we already loaded credentials in this session, return them
      if (this.isLoaded && this.credentials) {
        return this.credentials;
      }

      // First check if credentials exist on the server
      const checkResponse = await fetch(`${getApiBaseUrl()}/credentials`);
      const checkData = await checkResponse.json();

      if (!checkData.exists) {
        this.isLoaded = true;
        this.credentials = null;
        return null;
      }

      // For security, we don't return the actual credentials from the server
      // Instead, we indicate that they exist and the server will use them for API calls
      // Return a placeholder that indicates credentials are available on server
      this.credentials = {
        clientId: 'stored_on_server',
        clientSecret: 'stored_on_server',
        developerToken: 'stored_on_server',
        refreshToken: 'stored_on_server',
      };
      this.isLoaded = true;
      return this.credentials;
    } catch (error) {
      console.error('Error retrieving credentials from server:', error);
      this.isLoaded = true;
      this.credentials = null;
      return null;
    }
  }

  // Synchronous version for backward compatibility (checks cached result)
  getCredentialsSync(): ApiCredentials | null {
    if (!this.isLoaded) {
      // If not loaded yet, trigger async load
      this.getCredentials();
      return null;
    }
    return this.credentials;
  }

  // Check if credentials exist on server
  async hasCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/credentials`);
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking credentials on server:', error);
      return false;
    }
  }

  // Synchronous version for backward compatibility
  hasCredentialsSync(): boolean {
    return this.isLoaded && this.credentials !== null;
  }

  // Clear credentials from server
  async clearCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/credentials`, {
        method: 'DELETE',
      });

      if (response.ok) {
        this.credentials = null;
        this.isLoaded = true;
        console.log('Credentials cleared from server successfully');
        return true;
      } else {
        console.error('Failed to clear credentials from server');
        return false;
      }
    } catch (error) {
      console.error('Error clearing credentials from server:', error);
      return false;
    }
  }

  // Load credentials on app startup
  async initialize(): Promise<void> {
    await this.getCredentials();
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();
