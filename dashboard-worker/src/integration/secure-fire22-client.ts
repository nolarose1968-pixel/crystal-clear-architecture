/**
 * Secure Fire22 Client with Bun.secrets integration
 * Uses OS-native credential storage for API tokens
 */

import { secrets } from "bun";

export class SecureFire22Client {
  private static SERVICE_NAME = "fire22-dashboard";
  private baseURL = 'https://fire22.ag/cloud/api/Manager';
  private customerURL = 'https://fire22.ag/cloud/api/Customer';
  private authToken: string | null = null;
  private sessionCookies: string | null = null;
  
  /**
   * Initialize client with secure credentials
   */
  async initialize(): Promise<boolean> {
    try {
      // Try to get credentials from Bun.secrets
      console.log('🔐 Retrieving secure credentials...');
      
      this.authToken = await secrets.get({
        service: SecureFire22Client.SERVICE_NAME,
        name: "fire22-api-token"
      });
      
      if (!this.authToken) {
        console.warn('⚠️ Fire22 API token not found in secure storage');
        console.log('💡 Run: bun run scripts/setup-secure-credentials.ts');
        
        // Fallback to environment variable
        this.authToken = process.env.FIRE22_TOKEN || null;
        
        if (!this.authToken) {
          console.error('❌ No Fire22 API token available');
          return false;
        }
      }
      
      // Get session cookies if available
      this.sessionCookies = await secrets.get({
        service: SecureFire22Client.SERVICE_NAME,
        name: "fire22-session"
      }) || process.env.FIRE22_SESSION || '';
      
      console.log('✅ Secure Fire22 client initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize secure client:', error);
      return false;
    }
  }
  
  /**
   * Store new credentials securely
   */
  async updateCredentials(token: string, session?: string): Promise<boolean> {
    try {
      await secrets.set({
        service: SecureFire22Client.SERVICE_NAME,
        name: "fire22-api-token",
        value: token
      });
      
      if (session) {
        await secrets.set({
          service: SecureFire22Client.SERVICE_NAME,
          name: "fire22-session",
          value: session
        });
      }
      
      this.authToken = token;
      this.sessionCookies = session || this.sessionCookies;
      
      console.log('✅ Credentials updated securely');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to update credentials:', error);
      return false;
    }
  }
  
  /**
   * Make authenticated API call
   */
  async callAPI(operation: string, params: any = {}): Promise<any> {
    if (!this.authToken) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize secure client');
      }
    }
    
    const baseParams = {
      agentID: 'BLAKEPPH',
      agentOwner: 'BLAKEPPH',
      agentSite: '1',
      RRO: '1',
      ...params
    };
    
    const formData = new URLSearchParams(baseParams);
    const baseUrl = operation === 'getHierarchy' ? this.customerURL : this.baseURL;
    const url = `${baseUrl}/${operation}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': `Bearer ${this.authToken}`,
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Pragma': 'no-cache',
          'User-Agent': 'Fire22-Dashboard/3.0.9',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': this.sessionCookies || '',
          'Referer': `https://fire22.ag/manager.html?v=${Date.now()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error(`Fire22 API error (${operation}):`, error);
      throw error;
    }
  }
  
  /**
   * Test connection with secure credentials
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.callAPI('getAuthorizations');
      console.log('✅ Fire22 API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Fire22 API connection failed:', error);
      return false;
    }
  }
  
  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await secrets.delete({
        service: SecureFire22Client.SERVICE_NAME,
        name: "fire22-api-token"
      });
      
      await secrets.delete({
        service: SecureFire22Client.SERVICE_NAME,
        name: "fire22-session"
      });
      
      this.authToken = null;
      this.sessionCookies = null;
      
      console.log('✅ Credentials cleared');
      
    } catch (error) {
      console.warn('⚠️ Failed to clear some credentials:', error);
    }
  }
  
  /**
   * Get weekly figures with secure auth
   */
  async getWeeklyFigureByAgentLite(params: {
    agentID?: string;
    week?: string | number;
    type?: string;
    layout?: string;
  }): Promise<any> {
    return this.callAPI('getWeeklyFigureByAgentLite', {
      week: params.week || '0',
      type: params.type || 'A',
      layout: params.layout || 'byDay',
      operation: 'getWeeklyFigureByAgentLite'
    });
  }
  
  /**
   * Get agent performance with secure auth
   */
  async getAgentPerformance(params: {
    agentID?: string;
    start?: string;
    end?: string;
    type?: string;
  }): Promise<any> {
    return this.callAPI('getAgentPerformance', params);
  }
  
  /**
   * Get player info with secure auth
   */
  async getPlayerInfo(playerID: string, agentID?: string): Promise<any> {
    return this.callAPI('getInfoPlayer', {
      playerID,
      agentID: agentID || 'BLAKEPPH'
    });
  }
}

// Export singleton instance
export const secureFire22Client = new SecureFire22Client();

// CLI test interface
if (import.meta.main) {
  console.log(`
╔════════════════════════════════════════════════════════╗
║        Secure Fire22 Client Test                      ║
╚════════════════════════════════════════════════════════╝
`);
  
  const client = new SecureFire22Client();
  
  console.log('1. Initializing secure client...');
  const initialized = await client.initialize();
  
  if (!initialized) {
    console.log('\n❌ Failed to initialize. Please set up credentials first:');
    console.log('   bun run scripts/setup-secure-credentials.ts');
    process.exit(1);
  }
  
  console.log('2. Testing API connection...');
  const connected = await client.testConnection();
  
  if (connected) {
    console.log('3. Fetching weekly figures...');
    try {
      const data = await client.getWeeklyFigureByAgentLite({ week: 0 });
      console.log('✅ Weekly figures retrieved successfully');
      console.log('   Summary:', data.summary || 'No data');
    } catch (error) {
      console.error('❌ Failed to fetch weekly figures:', error);
    }
  }
  
  console.log('\n✨ Test complete');
}