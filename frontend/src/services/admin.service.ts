export class AdminService {
  private static ADMIN_TOKEN_KEY = 'admin_token';

  static isAdmin(): boolean {
    return !!this.getAdminToken();
  }

  static login(token: string): void {
    // Store the token - validation will happen on the server side
    localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
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
    console.log(`[AdminService] Hashing "${str}" to: ${hash}`);
    return hash;
  }

  // Helper method to get headers with hashed admin token
  static async getAdminHeaders(): Promise<Record<string, string>> {
    const token = this.getAdminToken();
    if (!token) {
      console.log('[AdminService] No token found');
      return {};
    }
    const hashedToken = await this.hashString(token);
    console.log(`[AdminService] Generated headers with hash: ${hashedToken}`);
    return {
      'x-admin-token': hashedToken
    };
  }
} 