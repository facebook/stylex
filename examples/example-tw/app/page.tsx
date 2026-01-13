/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use client';

import { useState } from 'react';

const HOMEPAGE = 'https://stylexjs.com';

function Card({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <a
      className="group flex flex-col items-center md:items-start p-4 rounded-lg bg-gray-100/5 border border-gray-400/30 hover:bg-gray-100/10 hover:border-gray-400/50 transition-all duration-200 text-center md:text-left no-underline"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className="text-[1.25rem] font-[600] mb-2 flex items-center gap-1">
        {title}
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </h2>
      <p className="text-[0.875rem] opacity-60 leading-relaxed max-w-[30ch] text-balance m-0">
        {body}
      </p>
    </a>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-0 rounded-lg border border-gray-400/30 overflow-hidden">
      <button
        className="flex items-center justify-center h-14 w-14 text-sky-500 bg-gray-100/5 hover:bg-gray-100/10 border-0 border-r border-gray-400/30 cursor-pointer text-[1.5rem] transition-colors"
        onClick={() => setCount((c) => c - 1)}
      >
        −
      </button>
      <div
        className={`min-w-16 text-center font-[300] px-4 ${
          Math.abs(count) > 99 ? 'text-[1.25rem]' : 'text-[1.5rem]'
        }`}
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        {count}
      </div>
      <button
        className="flex items-center justify-center h-14 w-14 text-sky-500 bg-gray-100/5 hover:bg-gray-100/10 border-0 border-l border-gray-400/30 cursor-pointer text-[1.5rem] transition-colors"
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen pt-16 pb-16 md:pb-6">
      {/* Description bar */}
      <div
        className="flex justify-center items-center text-[0.875rem] max-w-5xl w-full z-10"
        style={{ fontFamily: 'ui-monospace, monospace' }}
      >
        <p className="relative md:fixed md:top-0 md:left-0 md:right-0 flex justify-center items-center w-full m-0 px-4 py-3 md:py-4 bg-gray-100/50 dark:bg-gray-900/50 border border-gray-400/30 md:border-0 md:border-b md:border-gray-400/25 rounded-lg md:rounded-none backdrop-blur-sm">
          Get started by editing&nbsp;
          <code
            className="font-[700]"
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            app/page.tsx
          </code>
        </p>
      </div>

      {/* Hero section */}
      <div className="flex-grow flex flex-col items-center justify-center gap-12">
        <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-[400] text-center flex flex-col md:flex-row gap-4 whitespace-nowrap leading-none">
          <span className="text-7xl">Tailwind</span>
          <span className="text-7xl animate-heartbeat relative">♥️</span>
          <span className="text-7xl">StyleX</span>
        </h1>
        <Counter />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full max-w-5xl px-4">
        <Card
          body="Learn how to use StyleX to build UIs"
          href={`${HOMEPAGE}/docs/learn/`}
          title="Docs"
        />
        <Card
          body="Browse through the StyleX API reference"
          href={`${HOMEPAGE}/docs/api/`}
          title="API"
        />
        <Card
          body="Play with StyleX and look at the compile outputs"
          href={`${HOMEPAGE}/playground/`}
          title="Playground"
        />
        <Card
          body="Get started with a NextJS+StyleX project"
          href="https://github.com/nmn/nextjs-app-dir-stylex"
          title="Templates"
        />
      </div>
    </main>
  );
}
