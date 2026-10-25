'use client';

import React from 'react';
import Link from 'next/link';
import { Fuel, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
                <Fuel className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                Degalai<span className="text-emerald-500">.lt</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Lietuvos degalų kainų stebėjimo platforma. Lyginame kainas realiu laiku iš kelių šaltinių, kad rasite pigiausius degalus.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Navigacija</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Kainų žemėlapis</Link></li>
              <li><Link href="/statistika" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Statistika</Link></li>
              <li><Link href="/nuolaidos" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Nuolaidos ir kuponai</Link></li>
              <li><Link href="/naujienos" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Naujienos</Link></li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Degalinių tinklai</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-600 dark:text-slate-400">Circle K</li>
              <li className="text-slate-600 dark:text-slate-400">Neste</li>
              <li className="text-slate-600 dark:text-slate-400">Viada</li>
              <li className="text-slate-600 dark:text-slate-400">Orlen</li>
              <li className="text-slate-600 dark:text-slate-400">Baltic Petroleum</li>
              <li className="text-slate-600 dark:text-slate-400">Saurida</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informacija</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  Duomenys pagal LEA
                </span>
              </li>
              <li className="text-slate-600 dark:text-slate-400">
                Žemėlapis: © OpenStreetMap
              </li>
              <li className="text-slate-600 dark:text-slate-400">
                Atnaujinima kasdien
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © 2026 Degalai.lt — Visos teisės saugomos
          </p>
          <p className="text-[11px] text-slate-400">
            Duomenys pateikiami informaciniais tikslais. Tikslias kainas tikrinkite degalinėse.
          </p>
        </div>
      </div>
    </footer>
  );
}
