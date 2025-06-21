'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="h-dvh w-screen flex flex-col items-center justify-center gap-2 p-4 rounded-lg">
      <h2 className="text-3xl font-bold">Path Tracing</h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 rounded-lg">
        <button className="w-48 sm:w-32 cursor-pointer bg-gray-800 relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-700 text-gray-300 hover:text-cyan-400 h-9 rounded-md px-3">
          <Link href="/webgl">WebGL 1.0</Link>
        </button>
        <button className="w-48 sm:w-32 cursor-pointer bg-gray-800 relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-700 text-gray-300 hover:text-blue-400 h-9 rounded-md px-3">
          <Link href="/webgl2">WebGL 12.0</Link>
        </button>
      </div>
    </main>
  );
}
