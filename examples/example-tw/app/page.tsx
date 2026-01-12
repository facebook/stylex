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
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center justify-start p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/50 transition-all duration-300 text-center no-underline"
    >
      <h2 className="text-lg font-semibold text-blue-400 mb-2">
        {title}{' '}
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
          →
        </span>
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[30ch] text-balance">
        {body}
      </p>
    </a>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center justify-center gap-3 p-1 rounded-2xl border border-blue-600">
      <button
        onClick={() => setCount((c) => c - 1)}
        className="flex items-center justify-center h-24 aspect-square text-blue-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-0 rounded-xl cursor-pointer text-4xl transition-transform hover:scale-105 active:scale-95"
      >
        -
      </button>
      <div
        className={`min-w-24 text-center font-mono font-thin text-lime-600 ${
          Math.abs(count) > 99 ? 'text-3xl' : 'text-4xl'
        }`}
      >
        {count}
      </div>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="flex items-center justify-center h-24 aspect-square text-blue-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-0 rounded-xl cursor-pointer text-4xl transition-transform hover:scale-105 active:scale-95"
      >
        +
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      {/* Description bar */}
      <div className="w-full max-w-5xl flex justify-center">
        <p className="px-4 py-3 text-sm font-mono bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg backdrop-blur">
          Get started by editing&nbsp;
          <code className="font-bold">app/page.tsx</code>
        </p>
      </div>

      {/* Hero section */}
      <div className="flex-grow flex flex-col items-center justify-center gap-12 py-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-center flex flex-col md:flex-row gap-2 md:gap-4 whitespace-nowrap">
          <span>Tailwind</span>
          <span className="animate-pulse text-pink-500">♥️</span>
          <span>StyleX</span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 text-center max-w-md">
          Write familiar Tailwind classes, compile to optimized atomic StyleX
          CSS
        </p>

        <Counter />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        <Card
          title="Docs"
          body="Learn how to use StyleX to build UIs"
          href={`${HOMEPAGE}/docs/learn/`}
        />
        <Card
          title="API"
          body="Browse through the StyleX API reference"
          href={`${HOMEPAGE}/docs/api/`}
        />
        <Card
          title="Playground"
          body="Play with StyleX and look at the compile outputs"
          href={`${HOMEPAGE}/playground/`}
        />
        <Card
          title="Templates"
          body="Get started with a NextJS+StyleX project"
          href="https://github.com/nmn/nextjs-app-dir-stylex"
        />
      </div>
    </main>
  );
}
