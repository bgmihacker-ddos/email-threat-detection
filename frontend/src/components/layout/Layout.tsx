import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-transparent text-gray-100 antialiased">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="relative flex-1 overflow-y-auto p-4 md:p-7 lg:p-9">
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-[#4bc9b5]/[0.035] to-transparent" />
          {children}
        </main>
      </div>
    </div>
  );
}
