/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import { mkdir } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist');
const htmlTemplate = path.resolve(__dirname, '..', 'src', 'index.dev.html');
const htmlOutput = path.resolve(distDir, 'index.dev.html');

async function dev() {
  await mkdir(distDir, { recursive: true });
  await Bun.write(htmlOutput, await Bun.file(htmlTemplate).text());
  const homepage = (await import(pathToFileURL(htmlOutput).href)).default;

  const port = Number(process.env.PORT) || 3000;

  const server = Bun.serve({
    port,
    development: true,
    routes: {
      '/': homepage,
    },
  });

  console.log(`Dev server running at http://localhost:${server.port}`);
}
dev();
