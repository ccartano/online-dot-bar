import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outdir: 'dist',
  minify: isProduction,
  sourcemap: !isProduction,
  target: ['es2020'],
  format: 'esm',
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
    'import.meta.env.PROD': isProduction ? 'true' : 'false',
    'import.meta.env.DEV': isProduction ? 'false' : 'true',
  },
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.ts': 'tsx',
    '.tsx': 'tsx',
  },
}).catch(() => process.exit(1)); 