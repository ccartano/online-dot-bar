declare module 'vite' {
  import { UserConfig } from 'vite';
  export function defineConfig(config: UserConfig): UserConfig;
} 