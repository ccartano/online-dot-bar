export class AdminService {
  private static ADMIN_TOKEN_KEY = 'admin_token';
  private static ENV_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

  // Add log here to check env variable on load
  static {
    console.log('[AdminService] Loaded VITE_ADMIN_TOKEN:', this.ENV_ADMIN_TOKEN);
  }

  static isAdmin(): boolean {
    return !!localStorage.getItem(this.ADMIN_TOKEN_KEY);
  }

  static login(token: string): void {
    if (token === this.ENV_ADMIN_TOKEN) {
      localStorage.setItem(this.ADMIN_TOKEN_KEY, token);
    } else {
      throw new Error('Invalid admin token');
    }
  }

  static logout(): void {
    localStorage.removeItem(this.ADMIN_TOKEN_KEY);
  }

  static getAdminToken(): string | null {
    const token = localStorage.getItem(this.ADMIN_TOKEN_KEY);
    if (!token) {
      return null;
    }
    return token;
  }
} 