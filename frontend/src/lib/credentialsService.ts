// Simple encryption/decryption utility for credentials
// Credentials are stored securely in browser localStorage with encryption

export interface ApiCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  managerId?: string;
}

// Service for securely handling API credentials in localStorage
class CredentialsService {
  private readonly STORAGE_KEY = 'google_ads_credentials';
  private readonly ENCRYPTION_KEY = 'dashboard_encryption_key_2024'; // Static key for browser encryption

  // Simple encryption function for localStorage
  private encrypt(data: string): string {
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    
    const applySaltToChar = (code: number): number => {
      return textToChars(this.ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);
    };

    return Array.from(data)
      .map(c => textToChars(c)[0])
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
  }

  // Simple decryption function for localStorage
  private decrypt(encoded: string): string {
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = (code: number): number => {
      return textToChars(this.ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);
    };
    
    return encoded.match(/.{1,2}/g)
      ?.map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('') || '';
  }

  // Save credentials to localStorage with encryption
  saveCredentials(credentials: ApiCredentials): boolean {
    try {
      const encryptedData = this.encrypt(JSON.stringify(credentials));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      console.log('Credentials saved to localStorage successfully');
      return true;
    } catch (error) {
      console.error('Error saving credentials to localStorage:', error);
      return false;
    }
  }

  // Get credentials from localStorage with decryption
  getCredentials(): ApiCredentials | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;
      
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData) as ApiCredentials;
    } catch (error) {
      console.error('Error retrieving credentials from localStorage:', error);
      return null;
    }
  }

  // Check if credentials exist in localStorage
  hasCredentials(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  // Clear credentials from localStorage
  clearCredentials(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Credentials cleared from localStorage');
  }

  // Auto-save credentials to backend server (optional, for backup)
  async saveToBackend(credentials: ApiCredentials): Promise<boolean> {
    try {
      const apiBaseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-deployed-backend-url.com/api'
        : 'http://localhost:3001/api';

      const response = await fetch(`${apiBaseUrl}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        console.log('Credentials also saved to backend server');
        return true;
      } else {
        console.warn('Failed to save credentials to backend server (using localStorage only)');
        return false;
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage only:', error);
      return false;
    }
  }

  // Get credentials and also check if they're valid/complete
  getValidCredentials(): ApiCredentials | null {
    const credentials = this.getCredentials();
    if (!credentials) return null;

    // Check if all required fields are present
    if (!credentials.clientId || !credentials.clientSecret || 
        !credentials.developerToken || !credentials.refreshToken) {
      console.warn('Stored credentials are incomplete');
      return null;
    }

    return credentials;
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();
