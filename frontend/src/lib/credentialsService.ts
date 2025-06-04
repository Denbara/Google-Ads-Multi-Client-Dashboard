// Simple encryption/decryption utility for credentials
// In production, this would be replaced with a proper encryption library or server-side handling

export interface ApiCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken: string;
  managerId?: string;
}

// Service for securely handling API credentials
class CredentialsService {
  private readonly STORAGE_KEY = 'google_ads_credentials';
  private readonly ENCRYPTION_KEY = 'dashboard_encryption_key'; // In production, this would be a secure server-side key

  // Simple encryption function for demo purposes
  // In production, use a proper encryption library or handle credentials server-side
  private encrypt(data: string): string {
    // This is a very basic encryption for demonstration
    // In a real app, use a proper encryption library or handle on server
    const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    
    // Fixed function to properly handle types
    const applySaltToChar = (code: number): number => {
      return textToChars(this.ENCRYPTION_KEY).reduce((a, b) => a ^ b, code);
    };

    return Array.from(data)
      .map(c => textToChars(c)[0])
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
  }

  // Simple decryption function for demo purposes
  private decrypt(encoded: string): string {
    // This is a very basic decryption for demonstration
    // In a real app, use a proper decryption library or handle on server
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

  // Save credentials with encryption
  saveCredentials(credentials: ApiCredentials): boolean {
    try {
      // In a production environment, these credentials should be sent to a secure backend
      // For this demo, we'll encrypt and store in localStorage
      const encryptedData = this.encrypt(JSON.stringify(credentials));
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      
      console.log('Credentials saved securely');
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  }

  // Get credentials with decryption
  getCredentials(): ApiCredentials | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY);
      if (!encryptedData) return null;
      
      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData) as ApiCredentials;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  // Check if credentials exist
  hasCredentials(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  // Clear credentials
  clearCredentials(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const credentialsService = new CredentialsService();
