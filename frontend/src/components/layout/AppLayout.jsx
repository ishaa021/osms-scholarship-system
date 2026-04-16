import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* 🌞 LIGHT MODE BG */}
      <div
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundColor: '#6482ad',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/dirty-old-black-shirt.png")`,
        }}
      />

      {/* 🌙 DARK MODE BG */}
      <div
        className="absolute inset-0 -z-10 hidden dark:block"
        style={{
          backgroundColor: '#876ecc',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/dirty-old-black-shirt.png")`,
        }}
      />

      {/* 🔥 LIGHT OVERLAY (FIXED) */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/10 -z-10" />

      {/* 🔥 GLOW BLOBS */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-blue-400/20 blur-[100px] rounded-full bottom-[-100px] right-[-100px] animate-pulse" />

      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <div className="lg:ml-64 flex flex-col min-h-screen">

        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>

      </div>
    </div>
  );
}