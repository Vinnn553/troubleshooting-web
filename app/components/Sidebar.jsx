'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tutorial List', href: '/tutorialDashboard', icon: BookOpen },
  ];

  return (
    <aside 
      className={`sticky top-0 flex flex-col h-screen bg-slate-900 text-slate-100 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } p-4 border-r border-slate-800 z-50`}
    >
      {/* Tombol Toggle Collapse */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 text-slate-300 rounded-full p-1 hover:text-white hover:bg-slate-700 transition-colors shadow-md"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
          A
        </div>
        {!isCollapsed && <span className="font-semibold text-lg tracking-wide text-white">App Admin</span>}
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Tombol Logout di bagian paling bawah */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;