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
} 