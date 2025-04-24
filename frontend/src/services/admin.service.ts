export class AdminService {
  private static ADMIN_TOKEN_KEY = 'admin_token';

  static isAdmin(): boolean {
    return !!this.getAdminToken();
  }

  static async login(password: string): Promise<void> {
    // Hash the password
    const hashedPassword = await this.hashString(password);
    
    // Get the expected hash from environment
    const envToken = this.getEnvAdminToken();
    if (!envToken) {
      throw new Error('Admin authentication is not properly configured');
    }

    // Hash the environment token to compare
    const expectedHash = await this.hashString(envToken);

    // Validate the password hash
    if (hashedPassword !== expectedHash) {
      throw new Error('Invalid password');
    }

    // Only store the hash if validation passes
    localStorage.setItem(this.ADMIN_TOKEN_KEY, hashedPassword);
  }

  static logout(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  static getAdminToken(): string | null {
    return localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  static getEnvAdminToken(): string | undefined {
    return import.meta.env.VITE_ADMIN_TOKEN;
  }

  // Helper method to hash a string using SHA-256
  private static async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash;
  }

  // Helper method to get headers with hashed admin token
  static async getAdminHeaders(): Promise<Record<string, string>> {
    const token = this.getAdminToken();
    if (!token) {
      return {};
    }
    return {
      'x-admin-token': token
    };
  }
} 