// Salesforce REST API endpoints
const SF_LOGIN_URL = import.meta.env.VITE_SF_LOGIN_URL || 'https://login.salesforce.com';
const SF_CLIENT_ID = import.meta.env.VITE_SF_CLIENT_ID;
const SF_CLIENT_SECRET = import.meta.env.VITE_SF_CLIENT_SECRET;

class SalesforceClient {
  private static instance: SalesforceClient;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  private constructor() {}

  public static getInstance(): SalesforceClient {
    if (!SalesforceClient.instance) {
      SalesforceClient.instance = new SalesforceClient();
    }
    return SalesforceClient.instance;
  }

  public async login(username: string, password: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        grant_type: 'password',
        client_id: SF_CLIENT_ID,
        client_secret: SF_CLIENT_SECRET,
        username: username,
        password: password
      });

      const response = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Salesforce');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.instanceUrl = data.instance_url;
      
      console.log('Connected to Salesforce');
    } catch (error) {
      console.error('Failed to connect to Salesforce:', error);
      throw error;
    }
  }

  public async createAppointment(appointmentData: {
    Subject: string;
    StartDateTime: string;
    EndDateTime: string;
    Description?: string;
  }): Promise<string> {
    if (!this.accessToken || !this.instanceUrl) {
      throw new Error('Not authenticated with Salesforce');
    }

    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Event`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment in Salesforce');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  }
}

export const salesforce = SalesforceClient.getInstance();