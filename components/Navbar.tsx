'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fuel, RefreshCw, Activity, ShieldCheck, ChevronRight, BarChart3, Newspaper, Tag, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SourceStatusModal } from './SourceStatusModal';
import { NationalAverage, SourceStatus } from '@/lib/types';

interface NavbarProps {
  sourcesOnlineCount?: number;
  totalSourcesCount?: number;
  sourceStatuses?: SourceStatus[];
  nationalAverages?: Record<string, NationalAverage>;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const NAV_LINKS = [
  { href: '/', label: 'Kainos', icon: Fuel },
  { href: '/statistika', label: 'Statistika', icon: BarChart3 },
  { href: '/nuolaidos', label: 'Nuolaidos', icon: Tag },
  { href: '/naujienos', label: 'Naujienos', icon: Newspaper },
];

export function Navbar({
  sourcesOnlineCount = 0,
  totalSourcesCount = 0,
  sourceStatuses = [],
  nationalAverages = {},
  lastUpdated,
  onRefresh,
  isRefreshing = false
}: NavbarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
                <Fuel className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                    Degalai<span className="text-emerald-500">.lt</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Lietuvos degalų kainų stebėjimas realiu laiku
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Source health pill — only on home page */}
              {pathname === '/' && onRefresh && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                    title="Peržiūrėti duomenų šaltinių būseną"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline">Šaltiniai:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {sourcesOnlineCount}/{totalSourcesCount}
                    </span>
                  </button>

                  <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
                    title="Atnaujinti kainas"
                    aria-label="Atnaujinti kainas"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
                    />
                  </button>
                </>
              )}

              <ThemeToggle />

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Sources modal */}
      <SourceStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        statuses={sourceStatuses}
        sourcesOnlineCount={sourcesOnlineCount}
        totalSourcesCount={totalSourcesCount}
      />
    </>
  );
}
