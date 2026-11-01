'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatRelativeTimeLt } from '@/lib/utils';
import {
  Newspaper, Calendar, Clock, User, ArrowRight, Search, Tag,
  TrendingUp, TrendingDown, Sparkles, CheckCircle2, ChevronRight,
  Share2, Bookmark, Lightbulb, ShieldAlert, Zap, Filter, BookOpen,
  Mail, ThumbsUp, Fuel, RefreshCw, Loader2, ExternalLink
} from 'lucide-react';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: 'trends' | 'analysis' | 'law' | 'tips' | 'ev';
  categoryLabel: string;
  categoryColor: string;
  publishedAt: string;
  uploadedAt?: string;
  foundAt?: string;
  readTime: string;
  author: string;
  source: string;
  sourceUrl?: string;
  isFeatured?: boolean;
  content: string[];
  keyTakeaways: string[];
  tags: string[];
}

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'kainu-prognoze-ruduo-2026',
    title: 'Kuro kainų prognozė: kodėl dyzelino ir 95 benzino kainų skirtumas vėl didėja?',
    slug: 'kainu-prognoze-ruduo-2026',
    summary: 'Pastarosiomis savaitėmis stebimas spartesnis dyzelino kainų augimas Lietuvos degalinėse. Energetikos ekspertai aiškina, kokie veiksniai lems kainas artimiausiais mėnesiais.',
    category: 'trends',
    categoryLabel: 'Kainų tendencijos',
    categoryColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    publishedAt: '2026-11-01T18:00:00.000Z',
    uploadedAt: '2026-11-01T18:00:00.000Z',
    foundAt: '2026-11-01T18:00:00.000Z',
    readTime: '4 min.',
    author: 'Degalai.lt Analitikai',
    source: 'Lietuvos energetikos agentūra (LEA)',
    sourceUrl: 'https://www.ena.lt',
    isFeatured: true,
    tags: ['Dyzelinas', 'Benzinas 95', 'Rinkos prognozė', 'Brent nafta'],
    keyTakeaways: [
      'Dyzelino paklausa Europoje rudenį tradiciškai išauga dėl šildymo sezono ir pramonės aktyvumo.',
      'Brent naftos kaina pasaulinėse biržose svyruoja 78–83 USD už barelį ribose.',
      'Degalų kainų skirtumas tarp pigiausių ir brangiausių degalinių Lietuvoje siekia net iki 18 ct/l.'
    ],
    content: [
      'Lietuvos degalinėse pastarąjį mėnesį stebima tendencija, kuomet dyzelino didmeninė kaina lenkia A95 benzino kainą. Pagrindinis šio reiškinio veiksnys – artėjantis žiemos sezonas Europoje, kuomet dalis naftos perdirbimo pajėgumų nukreipiama krosnių kurui ir dyzelino atsargų kaupimui.',
      'Lietuvos energetikos agentūros (LEA) naujausiais duomenimis, vidutinė dyzelino kaina Lietuvoje šiuo metu išlieka viena mažiausių Baltijos regione, nusileisdama tik Lenkijos rinkai. Tačiau skirtumas tarp atskirų degalinių tinklų yra didžiulis: Vilniaus ir Kauno didžiosiose magistralėse kainos gali skirtis iki 15–18 centų už litrą.',
      'Ekspertų teigimu, artimiausias 4–6 savaites staigaus kainų šuolio nesitikima, jei geopolitinė situacija Artimuosiuose Rytuose išliks stabili. Vairuotojams rekomenduojama atkreipti dėmesį į savaitgalio nuolaidas, kuomet dauguma tinklų taiko 4–6 ct/l papildomas nuolaidas.'
    ]
  },
  {
    id: 'akcizo-pakeitimai-vairuotojams',
    title: 'Akcizų pokyčiai ir CO2 dedamoji: ką kiekvienam vairuotojui būtina žinoti?',
    slug: 'akcizo-pakeitimai-vairuotojams',
    summary: 'Valstybinės institucijos primena apie laipsnišką CO2 dedamosios įsigaliojimą degalų akcizų struktūroje. Kaip tai atsilieps galutinei kainai prie kolonėlės?',
    category: 'law',
    categoryLabel: 'Teisės aktai',
    categoryColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    publishedAt: '2026-10-31T12:00:00.000Z',
    uploadedAt: '2026-11-01T12:00:00.000Z',
    foundAt: '2026-11-01T12:00:00.000Z',
    readTime: '3 min.',
    author: 'Mantas Jankauskas',
    source: 'LR Finansų ministerija',
    sourceUrl: 'https://finmin.lrv.lt',
    tags: ['Akcizai', 'CO2 dedamoji', 'Mokesčiai', 'Teisė'],
    keyTakeaways: [
      'CO2 dedamoji bus didinama laipsniškai kasmet, siekiant skatinti tvarias transporto alternatyvas.',
      'Didžiausią įtaką mokesčių pasikeitimas turės labiau taršiems degalams su mažu biopriedų kiekiu.',
      'Suskystintoms naftos dujoms (LPG) taikomi specialūs pereinamojo laikotarpio tarifai.'
    ],
    content: [
      'Pagal patvirtintą Akcizų įstatymo paketą, Lietuva tęsia žaliosios mokesčių reformos įgyvendinimą. Pagrindinis tikslas – suderinti degalų apmokestinimą su jų išmetamo anglies dvideginio (CO2) kiekiu.',
      'Vairuotojams tai reiškia, kad didesnę taršą keliantis iškastinis kuras ilgainiui brangs sparčiau nei alternatyvūs degalai ar elektros energija.',
      'Degalinių atstovai pabrėžia, kad mokesčių pokyčiai diegiami etapais, todėl staigaus vienos nakties kainų šoko pirkėjai nepajus.'
    ]
  }
];

export default function NaujienosPage() {
  const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('2026-11-01T20:00:00.000Z');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  const fetchNews = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
        }
        if (data.lastChecked) setLastChecked(data.lastChecked);
      }
    } catch (e) {
      console.warn('Could not fetch dynamic news, keeping fallback:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-refresh news every 30 minutes
    const interval = setInterval(() => {
      fetchNews();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.isFeatured) || articles[0];
  }, [articles]);

  const regularArticles = useMemo(() => {
    return articles.filter((a) => a.id !== featuredArticle?.id);
  }, [articles, featuredArticle]);

  const filteredArticles = useMemo(() => {
    return regularArticles.filter((article) => {
      if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = article.summary.toLowerCase().includes(q);
        const matchesTag = article.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTag) return false;
      }
      return true;
    });
  }, [regularArticles, selectedCategory, searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSent(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/30 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-semibold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Gyvas naujienų srautas • Atnaujinta: {formatRelativeTimeLt(lastChecked)}
              </div>

              <button
                onClick={() => fetchNews(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition-all text-xs font-bold"
                title="Atnaujinti naujienas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Nuskaitoma...' : 'Atnaujinti dabar'}</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl leading-tight">
              Kuro Rinkos Žinios, <br className="hidden sm:inline" />
              Ekspertų Analizė ir Įstatymai
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Tiesiogiai iš LEA, nacionalinių verslo naujienų kanalų ir naftos biuletenių. Sužinokite, kodėl keičiasi kainos prie kolonėlių.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          {/* Featured Article Card */}
          {featuredArticle && (
            <div
              onClick={() => setActiveArticle(featuredArticle)}
              className="mb-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Svarbiausia naujiena
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${featuredArticle.categoryColor}`}>
                        {featuredArticle.categoryLabel}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {featuredArticle.title}
                    </h2>

                    <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <User className="w-4 h-4 text-emerald-500" />
                        {featuredArticle.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatRelativeTimeLt(featuredArticle.publishedAt)}
                      </span>
                      {featuredArticle.foundAt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                          Rasta: {formatRelativeTimeLt(featuredArticle.foundAt)}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                      Skaityti straipsnį <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-4">
                      <Lightbulb className="w-4 h-4" />
                      Svarbiausi faktai ir išvados:
                    </h3>
                    <ul className="space-y-3">
                      {featuredArticle.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Šaltinis: {featuredArticle.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Categories Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ieškoti straipsnio ar temos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'Visos temos' },
                { id: 'trends', label: 'Tendencijos' },
                { id: 'analysis', label: 'Analizė' },
                { id: 'law', label: 'Mokesčiai & Teisė' },
                { id: 'tips', label: 'Patarimai' },
                { id: 'ev', label: 'Elektromobiliai' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Nuskaitomos naujausios rinkos žinios...</p>
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${article.categoryColor}`}>
                      {article.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>{article.author}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatRelativeTimeLt(article.publishedAt)}
                    </span>
                  </div>
                  {article.foundAt && (
                    <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Šaltinis: {article.source}</span>
                      <span>Rasta: {formatRelativeTimeLt(article.foundAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pagal paiešką straipsnių nerasta</h3>
              <p className="text-xs text-slate-500 mt-1">Pabandykite pasirinkti kitą kategoriją arba išvalyti paieškos laukelį.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Atstatyti filtrus
              </button>
            </div>
          )}

          {/* Newsletter Subscribe */}
          <div className="mt-16 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3">
                <Mail className="w-3.5 h-3.5" />
                Savaitinis kuro kainų biuletenis
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Gaukite kainų prognozes ir nuolaidas tiesiai į paštą
              </h2>
              <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
                Kiekvieną pirmadienį apibendriname naftos rinkos pokyčius, degalinių kainų indeksą ir atsiunčiame geriausius savaitgalio kuponus.
              </p>

              <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Jūsų el. pašto adresas"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/10 placeholder:text-emerald-200 border border-white/20 text-white focus:outline-none focus:bg-white/20"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md"
                >
                  {newsletterSent ? 'Ačiū! Užregistruota' : 'Prenumeruoti'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Article Detail Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeArticle.categoryColor}`}>
                {activeArticle.categoryLabel}
              </span>
              <span className="text-xs text-slate-400">
                Paskelbta: {formatRelativeTimeLt(activeArticle.publishedAt)}
              </span>
              {activeArticle.foundAt && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                  Rasta sistemoje: {formatRelativeTimeLt(activeArticle.foundAt)}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              {activeArticle.title}
            </h2>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 mb-6">
              <span>Autorius: <strong className="text-slate-700 dark:text-slate-300">{activeArticle.author}</strong></span>
              <span>Šaltinis: <strong className="text-slate-700 dark:text-slate-300">{activeArticle.source}</strong></span>
              <span>Skaitymo laikas: {activeArticle.readTime}</span>
            </div>

            {/* Key takeaways in modal */}
            {activeArticle.keyTakeaways && activeArticle.keyTakeaways.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 mb-6 text-xs sm:text-sm text-emerald-900 dark:text-emerald-100 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Lightbulb className="w-4 h-4" />
                  Pagrindiniai punktai:
                </div>
                <ul className="space-y-1.5 pl-2">
                  {activeArticle.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content Paragraphs */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed mb-6">
              {activeArticle.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Source link if available */}
            {activeArticle.sourceUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Pirminis šaltinis: {activeArticle.source}</span>
                <a
                  href={activeArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <span>Atidaryti originalų straipsnį</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
