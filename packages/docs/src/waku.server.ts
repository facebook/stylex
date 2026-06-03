/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { fsRouter } from 'waku/router/server';
// Use the default adapter - it auto-selects:
// - Vercel adapter when process.env.VERCEL is set
// - Netlify adapter when process.env.NETLIFY is set
// - Node adapter otherwise (for local `waku start`)
import adapter from 'waku/adapters/default';

// Lazy loaders for API modules (avoids top-level await issues)
const apiModules = import.meta.glob('./pages/api/*.ts') as Record<
  string,
  () => Promise<{ GET?: () => Promise<Response> }>
>;

// Configuration for static API routes served at custom paths (outside /api/)
// Maps: URL path -> file path (relative to this file, matching the glob above)
const customApiRoutes: Record<string, string> = {
  '/llms-full.txt': './pages/api/llms-full.txt.ts',
  '/blog/rss.xml': './pages/api/blog-rss.xml.ts',
  '/blog/atom.xml': './pages/api/blog-atom.xml.ts',
};

// Cache for loaded handlers
const handlerCache = new Map<string, () => Promise<Response>>();

async function getCustomHandler(
  pathname: string,
): Promise<(() => Promise<Response>) | null> {
  const filePath = customApiRoutes[pathname];
  if (!filePath) return null;

  // Check cache first
  if (handlerCache.has(pathname)) {
    return handlerCache.get(pathname)!;
  }

  // Load the module
  const loader = apiModules[filePath];
  if (!loader) {
    console.warn(`Custom API route: ${filePath} not found in glob`);
    return null;
  }

  const mod = await loader();
  if (!mod.GET) {
    console.warn(`Custom API route: ${filePath} has no GET export`);
    return null;
  }

  handlerCache.set(pathname, mod.GET);
  return mod.GET;
}

// File-system based routes
const fsRoutes = fsRouter(
  import.meta.glob('./**/*.{tsx,ts}', { base: './pages' }),
);

// Wrap fsRouter to add custom routes
const combinedRouter = {
  handleRequest: async (...args: Parameters<typeof fsRoutes.handleRequest>) => {
    const [input] = args;
    const url = new URL(input.req.url);

    // Check for custom API routes first
    const handler = await getCustomHandler(url.pathname);
    if (handler) {
      return handler();
    }

    // Fall back to file-system routes
    return fsRoutes.handleRequest(...args);
  },
  handleBuild: async (...args: Parameters<typeof fsRoutes.handleBuild>) => {
    const [utils] = args;

    // Build custom static API routes
    for (const [urlPath, _filePath] of Object.entries(customApiRoutes)) {
      const handler = await getCustomHandler(urlPath);
      if (handler) {
        const response = await handler();
        const body = await response.text();
        // Remove leading slash for file path
        await utils.generateFile(urlPath.slice(1), body);
      }
    }

    // Build file-system routes
    await fsRoutes.handleBuild(...args);
  },
};

export default adapter(combinedRouter, { static: true });
