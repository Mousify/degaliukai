'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Tag, Percent, Sparkles, Gift, Coffee, Car, Clock, CheckCircle2,
  Copy, ExternalLink, Calculator, ChevronRight, Filter, Search,
  Award, AlertCircle, Info, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';

interface Coupon {
  id: string;
  brand: string;
  brandColor: string;
  badge: string;
  title: string;
  discount: string;
  category: 'fuel' | 'coffee' | 'wash' | 'partner' | 'weekend';
  description: string;
  code?: string;
  validUntil: string;
  isHot?: boolean;
  terms: string[];
  howToUse: string;
  appUrl?: string;
}

const COUPONS_DATA: Coupon[] = [
  {
    id: 'ck-weekend-fuel',
    brand: 'Circle K',
    brandColor: '#ed1b24',
    badge: 'Savaitgalio akcija',
    title: 'Savaitgalio kuro nuolaida su EXTRA programėle',
    discount: '-6 ct/l',
    category: 'weekend',
    isHot: true,
    description: 'Kiekvieną penktadienį–sekmadienį pilkitės degalus su papildoma nuolaida visose Circle K degalinėse.',
    code: 'SAVWEEKEND',
    validUntil: 'Galioja kiekvieną savaitgalį',
    terms: [
      'Galioja su Circle K EXTRA lojalumo kortele arba programėle',
      'Taikoma miles ir milesPLUS 95 benzinui bei dyzelinui',
      'Nuolaida sumuojasi su esamu lojalumo lygiu'
    ],
    howToUse: 'Prieš atsiskaitydami nuskenuokite Circle K programėlės brūkšninį kodą arba įdėkite EXTRA kortelę į mokėjimo automatą.',
    appUrl: 'https://www.circlek.lt/extra'
  },
  {
    id: 'neste-easy-fuel',
    brand: 'Neste',
    brandColor: '#009944',
    badge: 'Nuolatinė',
    title: 'Neste programėlės nuolaida visiems degalams',
    discount: '-3.5 ct/l',
    category: 'fuel',
    isHot: true,
    description: 'Atsiskaitykite už degalus mobiliąja Neste programėle tiesiogiai automobilyje ir sutaupykite kiekvieną kartą.',
    code: 'NESTEEASY',
    validUntil: 'Galioja iki 2026-12-31',
    terms: [
      'Būtina susieti mokėjimo kortelę Neste programėlėje',
      'Taikoma Futura 95, 98 ir Neste Pro Diesel degalams',
      'Galioja visose automatinėse Neste degalinėse Lietuvoje'
    ],
    howToUse: 'Atvykę prie kolonėlės, atidarykite Neste programėlę, pasirinkite kolonėlės numerį ir patvirtinkite mokėjimą.',
    appUrl: 'https://www.neste.lt/programle'
  },
  {
    id: 'viada-plus-fuel',
    brand: 'Viada',
    brandColor: '#ff6600',
    badge: 'Lojalumas',
    title: 'Viada Plus taškai + tiesioginė kuro nuolaida',
    discount: '-5 ct/l',
    category: 'fuel',
    isHot: true,
    description: 'Su Viada Plus lojalumo kortele gaukite 5 ct/l nuolaidą kurui ir kaupkite 2% vertės taškais kitiems pirkiniams.',
    code: 'VIADAPLUS',
    validUntil: 'Nuolatinis pasiūlymas',
    terms: [
      'Galioja pateikus fizinę arba skaitmeninę Viada Plus kortelę',
      'Kiekvienam litrui taikoma momentinė nuolaida',
      'Kaupiami taškai galioja 12 mėnesių'
    ],
    howToUse: 'Pateikite Viada kortelę kasoje arba nuskenuokite programėlėje prieš kuro pylimą.',
    appUrl: 'https://www.viada.lt/lojalumas'
  },
  {
    id: 'orlen-vitay-fuel',
    brand: 'Orlen',
    brandColor: '#b91c1c',
    badge: 'Populiaru',
    title: 'Orlen Vitay: nuolaida kurui ir dvigubi taškai',
    discount: '-4 ct/l',
    category: 'fuel',
    description: 'Pilkitės Verva premium degalus su 4 ct/l nuolaida ir gaukite 2x Vitay taškų, kuriuos galite keisti į vertingus prizus.',
    code: 'VITAYBONUS',
    validUntil: 'Galioja iki 2026-11-30',
    terms: [
      'Galioja registruotiems Orlen Vitay nariams',
      'Taikoma visiems degalų tipams, papildoma nuolaida Verva kurui',
      'Taškai įskaitomi per 24 valandas'
    ],
    howToUse: 'Nuskenuokite Vitay kortelę atsiskaitydami degalinės kasoje.',
    appUrl: 'https://www.orlen.lt'
  },
  {
    id: 'ck-free-coffee',
    brand: 'Circle K',
    brandColor: '#ed1b24',
    badge: 'Kava',
    title: 'Kas 6-tas karštas gėrimas NEMOKAMAI',
    discount: '100% NEMOKAMAI',
    category: 'coffee',
    description: 'Pirkite bet kokį kavos ar karšto gėrimo puodelį ir rinkite virtualius antspaudus Circle K programėlėje.',
    validUntil: 'Nuolatinė lojalumo nauda',
    terms: [
      'Galioja visų dydžių kavai ir arbatai',
      'Antspaudai automatiškai kaupiasi EXTRA paskyroje',
      'Nemokamą puodelį galima atsiimti per 30 dienų nuo surinkimo'
    ],
    howToUse: 'Kaskart pirkdami kavą nuskenuokite programėlę. Pasiekus 5 puodelius, 6-tasis pasirodys kaip nemokamas kuponas.',
    appUrl: 'https://www.circlek.lt'
  },
  {
    id: 'viada-carwash-deal',
    brand: 'Viada',
    brandColor: '#ff6600',
    badge: 'Plovykla',
    title: '50% nuolaida aukščiausios klasės automobilių plovimui',
    discount: '-50%',
    category: 'wash',
    isHot: true,
    description: 'Įsipylus bent 30 litrų bet kokių degalų, Premium plovimo programai suteikiama 50% nuolaida!',
    code: 'PLAUTI50',
    validUntil: 'Galioja iki 2026-11-15',
    terms: [
      'Reikalingas vienkartinis ne mažiau kaip 30 litrų kuro pirkimas',
      'Kuponas atspausdinamas ant čekio arba atsiranda programėlėje',
      'Kuponas galioja 14 dienų nuo išdavimo'
    ],
    howToUse: 'Pasiimkite kuro kvitą su plovimo kodu ir suveskite jį prie plovyklos terminalo.',
    appUrl: 'https://www.viada.lt'
  },
  {
    id: 'saurida-loyalty',
    brand: 'Saurida',
    brandColor: '#0284c7',
    badge: 'Gera kaina',
    title: 'Saurida lojalumo kortelė – iki 7 ct/l nuolaida',
    discount: 'iki -7 ct/l',
    category: 'fuel',
    description: 'Saurida kortelės turėtojams taikoma momentinė nuolaida benzinui, dyzelinui ir suskystintoms dujoms (LPG).',
    validUntil: 'Nuolatinis pasiūlymas',
    terms: [
      'Galioja visose Saurida degalinėse',
      'Nuolaidos dydis priklauso nuo praėjusio mėnesio pirkimų kiekio',
      'LPG dujoms taikoma speciali papildoma nuolaida'
    ],
    howToUse: 'Pateikite Saurida kortelę kasoje prieš atsiskaitymą.',
    appUrl: 'https://www.saurida.lt'
  },
  {
    id: 'baltic-petroleum-card',
    brand: 'Baltic Petroleum',
    brandColor: '#059669',
    badge: 'Kortelė',
    title: 'Baltic Petroleum Kliento kortelė – fiksuota nuolaida',
    discount: '-4.5 ct/l',
    category: 'fuel',
    description: 'Gaukite momentinę nuolaidą kurui bei 15% nuolaidą autokosmetikai ir langų skysčiams.',
    validUntil: 'Galioja visus metus',
    terms: [
      'Kortelė išduodama nemokamai bet kurioje BP degalinėje',
      'Nuolaida taikoma nuo pirmo įsipylimo litro',
      'Galioja visoje Lietuvoje'
    ],
    howToUse: 'Nuskenuokite Baltic Petroleum kortelę mokėjimo terminale.',
    appUrl: 'https://balticpetroleum.lt'
  },
  {
    id: 'ck-hotdog-combo',
    brand: 'Circle K',
    brandColor: '#ed1b24',
    badge: 'Užkandžiai',
    title: 'Didysis dešrainis + Kava tik už 3.49 €',
    discount: 'Sutaupote 2.20 €',
    category: 'partner',
    description: 'Mėgaukitės sotumu kelyje: didelis traškus dešrainis su pasirinktu padažu ir bet kokia M dydžio kava už specialią kainą.',
    code: 'COMBO349',
    validUntil: 'Galioja iki 2026-11-20',
    terms: [
      'Galioja visose visą parą veikiančiose Circle K degalinėse',
      'Nuolaida taikoma kasoje nuskenavus EXTRA programėlę'
    ],
    howToUse: 'Užsisakykite dešrainį su kava ir kasoje nuskenuokite programėlę.',
    appUrl: 'https://www.circlek.lt'
  }
];

const LOYALTY_COMPARISON = [
  {
    brand: 'Circle K',
    program: 'EXTRA',
    color: '#ed1b24',
    baseDiscount: '3.0 – 6.0 ct/l',
    weekendBonus: 'Papildomi +3 ct/l penkt-sekm',
    coffeeBonus: 'Kas 6-tas puodelis nemokamai',
    carWashBonus: 'Kas 4-tas plovimas -50%',
    appFeatures: 'Mokėjimas prie kolonėlės, automatinis numerių atpažinimas'
  },
  {
    brand: 'Neste',
    program: 'Neste programėlė',
    color: '#009944',
    baseDiscount: '3.5 ct/l',
    weekendBonus: 'Specialios savaitgalio akcijos',
    coffeeBonus: '— (automatinės degalinės)',
    carWashBonus: 'Partnerių nuolaidos',
    appFeatures: 'Greičiausias atsiskaitymas programėle, jokių eilių'
  },
  {
    brand: 'Viada',
    program: 'Viada Plus',
    color: '#ff6600',
    baseDiscount: '4.0 – 6.0 ct/l',
    weekendBonus: 'Laimės valandos savaitgaliais',
    coffeeBonus: 'Kas 7-tas puodelis nemokamai',
    carWashBonus: 'Iki 50% nuolaida su kuro pirkimu',
    appFeatures: 'Virtuali kortelė, taškų kaupimas ir keitimas į prekes'
  },
  {
    brand: 'Orlen',
    program: 'Vitay',
    color: '#b91c1c',
    baseDiscount: '3.0 – 5.0 ct/l',
    weekendBonus: 'Dvigubi Vitay taškai',
    coffeeBonus: 'Taškai už kiekvieną pirkinį',
    carWashBonus: 'Plovyklos programos už taškus',
    appFeatures: 'Katalogas prizams, kelionių draudimas ir akcijos'
  },
  {
    brand: 'Saurida',
    program: 'Saurida Lojalumas',
    color: '#0284c7',
    baseDiscount: 'iki 7.0 ct/l',
    weekendBonus: 'Kuro dienų akcijos',
    coffeeBonus: 'Pigiausia kava kelyje',
    carWashBonus: 'Savitarnos plovyklų žetonų nuolaidos',
    appFeatures: 'Fizinė ir skaitmeninė kortelė, didelės LPG nuolaidos'
  }
];

export default function NuolaidosPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalCoupon, setActiveModalCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Calculator states
  const [litersPerMonth, setLitersPerMonth] = useState<number>(100);
  const [fuelPriceEst, setFuelPriceEst] = useState<number>(1.55);
  const [discountPerLiter, setDiscountPerLiter] = useState<number>(0.05);

  const calculatedMonthlySavings = (litersPerMonth * discountPerLiter).toFixed(2);
  const calculatedYearlySavings = (litersPerMonth * discountPerLiter * 12).toFixed(2);

  const brands = useMemo(() => {
    const list = Array.from(new Set(COUPONS_DATA.map(c => c.brand)));
    return ['all', ...list];
  }, []);

  const filteredCoupons = useMemo(() => {
    return COUPONS_DATA.filter(coupon => {
      if (selectedBrand !== 'all' && coupon.brand !== selectedBrand) return false;
      if (selectedCategory !== 'all' && coupon.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = coupon.title.toLowerCase().includes(q);
        const matchesBrand = coupon.brand.toLowerCase().includes(q);
        const matchesDesc = coupon.description.toLowerCase().includes(q);
        const matchesCode = coupon.code?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesDesc && !matchesCode) return false;
      }
      return true;
    });
  }, [selectedBrand, selectedCategory, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold mb-4 text-emerald-100">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  Aktyvios kuro nuolaidos ir lojalumo pasiūlymai
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Kuponai ir Nuolaidos <br className="hidden sm:inline" />
                  Lietuvos Degalinėse
                </h1>
                <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
                  Sutaupykite iki <strong className="text-white underline decoration-amber-400 decoration-2">6–7 ct/l</strong> kiekvieno pildymo metu. Čia rasite patikrintus Circle K, Neste, Viada, Orlen ir kitų tinklų nuolaidų kodus bei akcijas.
                </p>
                
                <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Patikrinta šiandien</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>{COUPONS_DATA.length} aktyvūs pasiūlymai</span>
                  </div>
                </div>
              </div>

              {/* Quick Fuel Savings Calculator */}
              <div className="w-full lg:w-96 bg-white dark:bg-slate-900 rounded-2xl p-6 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Kuro sutaupymo skaičiuoklė</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Kiek sutaupysite su kortele?</p>
                  </div>
                </div>

                <div className="space-y-4 mt-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Litražas per mėnesį:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{litersPerMonth} L</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={litersPerMonth}
                      onChange={(e) => setLitersPerMonth(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Kortelės nuolaida:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(discountPerLiter * 100).toFixed(1)} ct/l</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0.03, 0.04, 0.05, 0.06].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setDiscountPerLiter(rate)}
                          className={`py-1 rounded-lg text-center font-bold text-xs transition-colors ${
                            discountPerLiter === rate
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {(rate * 100).toFixed(0)} ct
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Sutaupote per mėnesį:</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{calculatedMonthlySavings} €</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-600 dark:text-slate-400">Sutaupote per metus:</span>
                      <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">+{calculatedYearlySavings} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ieškoti kupono ar degalinės..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'all', label: 'Visi pasiūlymai', icon: Tag },
                  { id: 'fuel', label: 'Degalai', icon: Flame },
                  { id: 'weekend', label: 'Savaitgalio', icon: Clock },
                  { id: 'coffee', label: 'Kava', icon: Coffee },
                  { id: 'wash', label: 'Plovykla', icon: Car },
                  { id: 'partner', label: 'Užkandžiai', icon: Gift },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Degalinių tinklas:</span>
              <div className="flex gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedBrand === b
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {b === 'all' ? 'Visi tinklai' : b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with brand stripe */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: coupon.brandColor }}
                        />
                        <span className="font-black text-sm tracking-wide text-slate-900 dark:text-white">
                          {coupon.brand}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {coupon.isHot && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Hot
                          </span>
                        )}
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {coupon.badge}
                        </span>
                      </div>
                    </div>

                    {/* Discount Callout */}
                    <div className="mb-2">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {coupon.discount}
                      </div>
                      <h2 className="font-bold text-base text-slate-900 dark:text-white leading-snug mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {coupon.title}
                      </h2>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {coupon.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {coupon.validUntil}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {coupon.code ? (
                      <button
                        onClick={() => handleCopyCode(coupon.code!)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          copiedCode === coupon.code
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700'
                        }`}
                        title="Nukopijuoti kupono kodą"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCode === coupon.code ? 'Nukopijuota!' : coupon.code}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveModalCoupon(coupon)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center"
                      >
                        Lojalumo pasiūlymas
                      </button>
                    )}

                    <button
                      onClick={() => setActiveModalCoupon(coupon)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                      title="Kaip pasinaudoti"
                    >
                      Informacija
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pagal paieškos kriterijus kuponų nerasta</h3>
              <p className="text-xs text-slate-500 mt-1">Pabandykite pasirinkti kitą degalinę arba išvalyti paiešką.</p>
              <button
                onClick={() => { setSelectedBrand('all'); setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Atstatyti filtrus
              </button>
            </div>
          )}

          {/* Loyalty Programs Comparison Table */}
          <div className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                <Award className="w-3.5 h-3.5" />
                Lojalumo programų gidas
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Kurio degalinių tinklo kortelė apsimoka labiausiai?
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Palyginome didžiausių Lietuvos degalinių lojalumo taisykles ir teikiamas papildomas vertes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tinklas & Programa</th>
                    <th className="py-3 px-4">Kuro nuolaida</th>
                    <th className="py-3 px-4">Savaitgalio bonusas</th>
                    <th className="py-3 px-4">Kavos akcija</th>
                    <th className="py-3 px-4">Programėlės privalumai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {LOYALTY_COMPARISON.map((row) => (
                    <tr key={row.brand} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">{row.brand}</span>
                            <span className="text-[11px] text-slate-500">{row.program}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {row.baseDiscount}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        {row.weekendBonus}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        {row.coffeeBonus}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {row.appFeatures}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community Tips Box */}
          <div className="mt-12 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Pastebėjote naują akciją ar turite nuolaidos kodą?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Degalai.lt bendruomenė kasdien dalijasi naujausiomis degalinių akcijomis ir nuolaidomis. Padėkite kitiems vairuotojams sutaupyti!
              </p>
            </div>
            <Link
              href="mailto:info@degalai.lt?subject=Nauja%20akcija%20degalineje"
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shrink-0 shadow-md"
            >
              Pranešti apie nuolaidą
            </Link>
          </div>

        </div>
      </main>

      {/* Coupon Modal */}
      {activeModalCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setActiveModalCoupon(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeModalCoupon.brandColor }}
              />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {activeModalCoupon.brand}
              </span>
            </div>

            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
              {activeModalCoupon.discount}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight mb-3">
              {activeModalCoupon.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {activeModalCoupon.description}
            </p>

            {/* How to use */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-4 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-500" />
                Kaip pasinaudoti:
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeModalCoupon.howToUse}
              </p>
            </div>

            {/* Terms */}
            <div className="mb-6 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                Sąlygos ir taisyklės:
              </h4>
              <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                {activeModalCoupon.terms.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              {activeModalCoupon.code && (
                <button
                  onClick={() => handleCopyCode(activeModalCoupon.code!)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedCode === activeModalCoupon.code ? 'Kopijuota!' : `Kodas: ${activeModalCoupon.code}`}</span>
                </button>
              )}

              {activeModalCoupon.appUrl && (
                <a
                  href={activeModalCoupon.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <span>Atidaryti tinklalapį</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
