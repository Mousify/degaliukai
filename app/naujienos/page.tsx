'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Newspaper, Calendar, Clock, User, ArrowRight, Search, Tag,
  TrendingUp, TrendingDown, Sparkles, CheckCircle2, ChevronRight,
  Share2, Bookmark, Lightbulb, ShieldAlert, Zap, Filter, BookOpen,
  Mail, ThumbsUp, Fuel
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: 'trends' | 'analysis' | 'law' | 'tips' | 'ev';
  categoryLabel: string;
  categoryColor: string;
  publishedAt: string;
  readTime: string;
  author: string;
  source: string;
  isFeatured?: boolean;
  content: string[];
  keyTakeaways: string[];
  tags: string[];
}

const ARTICLES_DATA: Article[] = [
  {
    id: 'kainu-prognoze-ruduo-2026',
    title: 'Kuro kainų prognozė: kodėl dyzelino ir 95 benzino kainų skirtumas vėl didėja?',
    slug: 'kainu-prognoze-ruduo-2026',
    summary: 'Pastarosiomis savaitėmis stebimas spartesnis dyzelino kainų augimas Lietuvos degalinėse. Energetikos ekspertai aiškina, kokie veiksniai lems kainas artimiausiais mėnesiais.',
    category: 'trends',
    categoryLabel: 'Kainų tendencijos',
    categoryColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    publishedAt: '2026-10-24',
    readTime: '4 min.',
    author: 'Degalai.lt Analitikai',
    source: 'Lietuvos energetikos agentūra (LEA)',
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
    publishedAt: '2026-10-21',
    readTime: '3 min.',
    author: 'Mantas Jankauskas',
    source: 'LR Finansų ministerija',
    tags: ['Akcizai', 'CO2 dedamoji', 'Mokesčiai', 'Teisė'],
    keyTakeaways: [
      'CO2 dedamoji bus didinama laipsniškai kasmet, siekiant skatinti tvarias transporto alternatyvas.',
      'Didžiausią įtaką mokesčių pasikeitimas turės labiau taršiems degalams su mažu biopriedų kiekiu.',
      'Suskystintoms naftos dujoms (LPG) taikomi specialūs pereinamojo laikotarpio tarifai.'
    ],
    content: [
      'Pagal patvirtintą Akcizų įstatymo paketą, Lietuva tęsia žaliosios mokesčių reformos įgyvendinimą. Pagrindinis tikslas – suderinti degalų apmokestinimą su jų išmetamo anglies dvideginio (CO2) kiekiu.',
      'Vairuotojams tai reiškia, kad didesnę taršą keliantis iškastinis kuras ilgainiui brangs sparčiau nei alternatyvūs degalai ar elektros energija. Naftos perdirbėjai aktyviai investuoja į antros kartos biodegalus (HVO), kurie padeda sumažinti CO2 dedamosios poveikį.',
      'Degalinių atstovai pabrėžia, kad mokesčių pokyčiai diegiami etapais, todėl staigaus vienos nakties kainų šoko pirkėjai nepajus.'
    ]
  },
  {
    id: 'degalu-taupymo-patarimai-realybe',
    title: 'Kaip sutaupyti iki 20% kuro: 5 realiai veikiantys vairavimo įpročiai',
    slug: 'degalu-taupymo-patarimai-realybe',
    summary: 'Praktiniai patarimai ir bandymų rezultatai, įrodantys, kad teisingas greičio pasirinkimas ir padangų slėgis gali sutaupyti šimtus eurų per metus.',
    category: 'tips',
    categoryLabel: 'Patarimai',
    categoryColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    publishedAt: '2026-10-18',
    readTime: '5 min.',
    author: 'Techninis skyrius',
    source: 'Degalai.lt bandymai',
    tags: ['Kuro taupymas', 'Eko-vairavimas', 'Praktika'],
    keyTakeaways: [
      'Nepakankamas padangų slėgis padidina kuro sąnaudas 3–5% ir greitina padangų nusidėvėjimą.',
      'Važiavimas 110 km/h vietoje 130 km/h greitkelyje sumažina kuro sąnaudas net iki 15–18%.',
      'Nereikalingas bagažinės svoris ir nenuimti stogo skersiniai sukuria papildomą oro pasipriešinimą.'
    ],
    content: [
      'Dažnas vairuotojas ieško pigiausios degalinės mieste, tačiau pamiršta, kad didžiausias rezervas sutaupyti slypi paties vairuotojo elgesyje prie vairo. Mūsų atliktas 1 000 km testas parodė akivaizdžius skirtumus tarp agresyvaus ir tolygaus vairavimo.',
      'Visų pirma, tolygus greičio palaikymas ir išankstinis situacijos numatymas (kuomet stabdoma varikliu, o ne staigiais stabdžių paspaudimais prie šviesoforo) leido sutaupyti vidutiniškai 1.2 l/100 km.',
      'Antras svarbus aspektas – padangų slėgis. Net 0.3 bar mažesnis slėgis už gamintojo rekomenduojamą nepastebimai padidina pasipriešinimą riedėjimui. Patikrinkite slėgį bent kartą per mėnesį bet kurioje degalinėje nemokamai.'
    ]
  },
  {
    id: 'baltijos-saliu-palyginimas-spalis',
    title: 'Baltijos šalių degalų kainų apžvalga: kur kuras pigiausias šį rudenį?',
    slug: 'baltijos-saliu-palyginimas-spalis',
    summary: 'Palyginome Lietuvos, Latvijos, Estijos ir kaimyninės Lenkijos vidutines degalų kainas. Lietuva išlaiko stabilias pozicijas regione.',
    category: 'analysis',
    categoryLabel: 'Rinkos analizė',
    categoryColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    publishedAt: '2026-10-15',
    readTime: '4 min.',
    author: 'Dovilė Petrauskaitė',
    source: 'Europos Komisijos kuro biuletenis',
    tags: ['Baltijos šalys', 'Latvija', 'Estija', 'Lenkija', 'Palyginimas'],
    keyTakeaways: [
      'Estijoje degalų kainos tradiciškai išlieka aukščiausios tarp Baltijos šalių dėl didesnių mokesčių.',
      'Lietuvoje benzinas ir dyzelinas vidutiniškai 5–8 ct/l pigesnis nei Latvijoje.',
      'Kelionėms į Lenkiją vairuotojai vis dar pasinaudoja valiutos ir konkurenciniais pranašumais pasienyje.'
    ],
    content: [
      'Kassavaitinė Europos Komisijos naftos biuletenio statistika atskleidžia įdomių tendencijų Baltijos regione. Estijoje litras 95 markės benzino vidutiniškai kainuoja 1.68 €, Latvijoje – 1.62 €, o Lietuvoje – apie 1.54 €.',
      'Dyzelino kainų kreivė panaši: mažiausios vidutinės kainos fiksuojamos Lietuvoje. Tokį skirtumą lemia ne tik mokesčių politikos niuansai, bet ir vietinė konkurencinė aplinka tarp automatinių degalinių ir didžiųjų tarptautinių tinklų.',
      'Lenkijos pasienio zonose kainos išlieka konkurencingos, tačiau dėl kuro vežimo taisyklių ir laiko sąnaudų masinis kuro turizmas yra sumažėjęs palyginus su ankstesniais metais.'
    ]
  },
  {
    id: 'elektromobilis-vs-vidaus-degimas-skaiciai',
    title: 'Elektra ar Dyzelinas: Kiek šiandien kainuoja nuvažiuoti 100 kilometrų?',
    slug: 'elektromobilis-vs-vidaus-degimas-skaiciai',
    summary: 'Palyginome realias sąnaudas kraunant elektromobilį namuose bei greitojo įkrovimo stotelėse su ekonomišku dyzeliniu automobiliu.',
    category: 'ev',
    categoryLabel: 'Elektromobiliai',
    categoryColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    publishedAt: '2026-10-10',
    readTime: '6 min.',
    author: 'Gediminas V.',
    source: 'Degalai.lt tyrimas',
    tags: ['Elektromobiliai', 'Įkrovimas', 'Sąnaudų analizė', '100 km kaina'],
    keyTakeaways: [
      'Kraunantis naktiniu tarifu namuose (0.13 €/kWh), 100 km kaina siekia vos 2.30–2.80 €.',
      'Ekonomiško dyzelinio automobilio 100 km kaina šiuo metu siekia apie 7.50–9.00 €.',
      'Viešojo greitojo įkrovimo (DC) stotelėse kaina gali viršyti dyzelinio automobilio sąnaudas.'
    ],
    content: [
      'Diskusija apie elektromobilių ekonominę naudą tampa vis aštresnė. Atsakymas, kas labiau apsimoka, tiesiogiai priklauso nuo to, kur automobilis įkraunamas.',
      'Vairuotojai, turintys galimybę krauti elektromobilį namuose naktį arba naudojantys nuosavą saulės elektrinę, džiaugiasi iki 3 kartų mažesnėmis išlaidomis nei važiuojant dyzeliu.',
      'Tačiau važinėjantiems ilgais atstumais magistralėse ir priklausomiems nuo komercinių 150–350 kW greitojo įkrovimo stotelių (kur tarifas siekia 0.45–0.60 €/kWh), 100 km kaina beveik susilygina su benzinu ar dyzelinu.'
    ]
  }
];

export default function NaujienosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  const featuredArticle = ARTICLES_DATA.find(a => a.isFeatured) || ARTICLES_DATA[0];

  const filteredArticles = useMemo(() => {
    return ARTICLES_DATA.filter(article => {
      if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = article.title.toLowerCase().includes(q);
        const inSummary = article.summary.toLowerCase().includes(q);
        const inTags = article.tags.some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inTags) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribedSuccess(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold mb-4 text-emerald-400">
                <Newspaper className="w-4 h-4" />
                Degalų rinkos naujienos ir analizė
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Naujienos, Tyrimai ir <br />
                Kainų Prognozės
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
                Sekite naujausius naftos biržos pokyčius, degalų kainų tendencijas Lietuvoje, akcizų teisės aktus bei praktinius ekspertų patarimus.
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          
          {/* Featured Article Card */}
          {featuredArticle && (
            <div
              onClick={() => setActiveArticle(featuredArticle)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group mb-12"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                      Karščiausia tema
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${featuredArticle.categoryColor}`}>
                      {featuredArticle.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {featuredArticle.publishedAt}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {featuredArticle.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 self-end lg:self-center">
                  <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 group-hover:bg-emerald-500 transition-colors">
                    <span>Skaityti straipsnį</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ieškoti straipsnių ar temų..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'all', label: 'Visos temos' },
                  { id: 'trends', label: 'Kainų tendencijos' },
                  { id: 'analysis', label: 'Rinkos analizė' },
                  { id: 'law', label: 'Teisės aktai' },
                  { id: 'tips', label: 'Patarimai' },
                  { id: 'ev', label: 'Elektromobiliai' },
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${article.categoryColor}`}>
                      {article.categoryLabel}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      {article.author.charAt(0)}
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">{article.author}</span>
                  </div>

                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Skaityti</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Interactive Fuel Savings Guide Section */}
          <div className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
                <Lightbulb className="w-3.5 h-3.5" />
                Vairuotojo atmintinė
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                6 Auksinės taisyklės: kaip realiai sumažinti degalų sąnaudas
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Pritaikę šiuos kasdienius patarimus galite sutaupyti iki 150–300 € per metus nekeisdami automobilio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  num: '01',
                  title: 'Tikrinkite padangų slėgį kas mėnesį',
                  desc: 'Net 0.3 bar per mažas slėgis padidina pasipriešinimą riedėjimui ir kuro sąnaudas padidina iki 5%.',
                  saving: 'Sutaupote: ~30 €/metus'
                },
                {
                  num: '02',
                  title: 'Tolygus greitėjimas ir numatymas',
                  desc: 'Venkite staigių startų ir staigių stabdymų. Prieš raudoną šviesoforą iš anksto stabdykite varikliu (įjungta pavara).',
                  saving: 'Sutaupote: ~80 €/metus'
                },
                {
                  num: '03',
                  title: 'Optimalus greitis greitkelyje',
                  desc: 'Važiuojant 110 km/h vietoje 130 km/h sutaupoma apie 15% kuro, o kelionės laikas pailgėja vos keliomis minutėmis.',
                  saving: 'Sutaupote: ~60 €/metus'
                },
                {
                  num: '04',
                  title: 'Nuimkite nenaudojamus stogo laikiklius',
                  desc: 'Stogo bagažinės ir skersiniai sukuria didelį aerodinaminį pasipriešinimą, didindami sąnaudas iki 1 l/100 km.',
                  saving: 'Sutaupote: ~50 €/metus'
                },
                {
                  num: '05',
                  title: 'Protingas oro kondicionieriaus naudojimas',
                  desc: 'Mieste esant nedideliam greičiui kartais pravartu atverti langus, o greitkelyje – naudoti vėdinimą, nes atviri langai gadina aerodinamiką.',
                  saving: 'Sutaupote: ~25 €/metus'
                },
                {
                  num: '06',
                  title: 'Kuro kainų palyginimas su Degalai.lt',
                  desc: 'Užsipildami kurą pigesnėje degalinėje sutaupote iki 10–15 ct/l kiekvieno pildymo metu.',
                  saving: 'Sutaupote: ~120 €/metus'
                }
              ].map((tip) => (
                <div key={tip.num} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mb-2 font-mono">
                      {tip.num}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                      {tip.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                    {tip.saving}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
              <Mail className="w-96 h-96" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-xs font-bold mb-3 border border-white/10">
                <Mail className="w-3.5 h-3.5" />
                Savaitinis Degalai.lt biuletenis
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Gaukite degalų kainų apžvalgą kiekvieną pirmadienį
              </h3>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                Pranešime apie savaitgalio akcijas, naftos kainų kryptį bei kur mieste piltis pigiausiai. Jokių šiukšlių – tik svarbūs faktai.
              </p>

              <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Jūsų el. pašto adresas..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 w-full"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shrink-0 shadow-lg"
                >
                  Prenumeruoti
                </button>
              </form>

              {subscribedSuccess && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-200 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Ačiū! Sėkmingai užsiprenumeravote savaitinį kainų biuletenį.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative my-8">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${activeArticle.categoryColor}`}>
                {activeArticle.categoryLabel}
              </span>
              <span className="text-xs text-slate-400">
                {activeArticle.publishedAt} • {activeArticle.readTime}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              {activeArticle.title}
            </h2>

            {/* Author bar */}
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                {activeArticle.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{activeArticle.author}</p>
                <p className="text-[11px] text-slate-400">Šaltinis: {activeArticle.source}</p>
              </div>
            </div>

            {/* Key takeaways */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 mb-6 space-y-2 text-xs">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Svarbiausi akcentai:
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                {activeArticle.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main content body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              {activeArticle.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
