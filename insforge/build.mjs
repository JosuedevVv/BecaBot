// Empaqueta cada edge function en un unico archivo ESM.
// Las edge functions de InsForge (Deno Subhosting) suben solo el entry, por lo
// que los imports relativos de ./_shared deben quedar embebidos. El SDK se deja
// como import "npm:@insforge/sdk" (Deno lo resuelve en tiempo de ejecucion).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const funciones = ['ingest-beca', 'ask', 'guardar-conocimiento', 'enviar-recordatorios'];
const distDir = path.join(dir, 'dist');
mkdirSync(distDir, { recursive: true });

for (const nombre of funciones) {
  const entry = path.join(dir, 'functions', `${nombre}.ts`);
  const out = path.join(distDir, `${nombre}.js`);
  console.log(`\n> empaquetando ${nombre}.ts -> dist/${nombre}.js`);
  execFileSync(
    'npx',
    [
      '--yes',
      'esbuild@0.28.2',
      entry,
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      '--target=es2022',
      '--external:npm:@insforge/sdk',
      '--external:deno',
      `--outfile=${out}`,
      '--log-level=info',
    ],
    { stdio: 'inherit' },
  );
}

console.log('\nListo. Bundles generados en insforge/dist/');
