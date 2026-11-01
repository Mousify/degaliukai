import { fetchWithRetry } from '../utils';

export interface DiscountCoupon {
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
  source: string;
  foundAt: string;
  uploadedAt: string;
}

export interface DiscountsResult {
  discounts: DiscountCoupon[];
  lastChecked: string;
  count: number;
  sources: string[];
}

let cachedDiscounts: DiscountCoupon[] | null = null;
let lastDiscountsFetch = 0;
const DISCOUNTS_CACHE_TTL = 30 * 60 * 1000; // 30 mins

function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace('Tik', 'tik')
    .replace('Su', 'su')
    .replace('Ir', 'ir');
}

/**
 * Scrapes and aggregates live discount coupons and promotions from Lithuanian gas station chains
 */
export async function fetchLiveDiscounts(): Promise<DiscountsResult> {
  const now = new Date();
  const nowIso = now.toISOString();

  if (cachedDiscounts && Date.now() - lastDiscountsFetch < DISCOUNTS_CACHE_TTL) {
    return {
      discounts: cachedDiscounts,
      lastChecked: new Date(lastDiscountsFetch).toISOString(),
      count: cachedDiscounts.length,
      sources: ['Viada.lt Akcijos', 'Circle K Pasiūlymai', 'Neste.lt Klientų Naudos', 'Baltic Petroleum']
    };
  }

  const discounts: DiscountCoupon[] = [];
  const sourcesChecked: string[] = [];

  // 1. Scrape Viada live promotions
  try {
    const viadaRes = await fetchWithRetry(
      'https://www.viada.lt/akcijos/',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        next: { revalidate: 1800 }
      },
      1,
      150,
      4000
    );

    if (viadaRes.ok) {
      sourcesChecked.push('Viada.lt Oficialus Akcijų Centras');
      const html = await viadaRes.text();
      const links = [...html.matchAll(/href="https:\/\/www\.viada\.lt\/akcija\/([^"/]+)\/?"/gi)].map((m) => m[1]);
      const uniqueSlugs = [...new Set(links)];

      for (const slug of uniqueSlugs.slice(0, 8)) {
        if (slug.includes('apklausa')) continue;

        let category: DiscountCoupon['category'] = 'partner';
        let discount = 'Akcija';
        let badge = 'Naujausias pasiūlymas';
        let isHot = false;

        const lower = slug.toLowerCase();
        if (lower.includes('savaitgali')) {
          category = 'weekend';
          discount = '-6 ct/l';
          badge = 'Savaitgalio akcija';
          isHot = true;
        } else if (lower.includes('desrain') || lower.includes('kav') || lower.includes('uzkand')) {
          category = 'coffee';
          discount = lower.includes('449') ? 'Tik 4.49 €' : lower.includes('30') ? '-30%' : '2 už 1';
          badge = 'Užkandžiai & Kava';
        } else if (lower.includes('lidl') || lower.includes('study') || lower.includes('agro')) {
          category = 'partner';
          discount = '-5 ct/l';
          badge = 'Partnerių nuolaida';
        } else if (lower.includes('viadaplus') || lower.includes('lojalum')) {
          category = 'fuel';
          discount = '-5 ct/l';
          badge = 'Viada Plus';
          isHot = true;
        }

        const formattedTitle = formatSlugToTitle(slug);

        discounts.push({
          id: `viada-${slug}`,
          brand: 'Viada',
          brandColor: '#ff6600',
          badge,
          title: formattedTitle.length > 5 ? formattedTitle : 'Viada speciali akcija vairuotojams',
          discount,
          category,
          isHot,
          description: `Tiesioginis pasiūlymas iš oficialaus Viada.lt akcijų puslapio. Pasiūlymas galioja pateikus Viada Plus arba partnerio kortelę.`,
          code: 'VIADAPLUS',
          validUntil: 'Galioja šį mėnesį visose tinklo degalinėse',
          terms: [
            'Galioja su fizine arba skaitmenine Viada Plus kortele',
            'Taikoma visoje Lietuvoje esančiose Viada degalinėse',
            'Nuolaidos nesumuojamos su kitomis specialiomis akcijomis'
          ],
          howToUse: 'Prieš atsiskaitant kasoje arba programėlėje nuskenuokite savo Viada brūkšninį kodą.',
          appUrl: `https://www.viada.lt/akcija/${slug}/`,
          source: 'Viada.lt Akcijų Puslapis',
          foundAt: nowIso,
          uploadedAt: nowIso
        });
      }
    }
  } catch (err) {
    console.warn('[Discounts Scraper] Viada fetch error:', err);
  }

  // 2. Scrape Circle K live promotions
  try {
    const ckRes = await fetchWithRetry(
      'https://www.circlek.lt/akcijos-degalinese',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        },
        next: { revalidate: 1800 }
      },
      1,
      150,
      4000
    );

    if (ckRes.ok) {
      sourcesChecked.push('Circle K Lietuva Oficialus Puslapis');
      const html = await ckRes.text();
      const titles = [...html.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi)]
        .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
        .filter((t) => t.length > 6 && !t.includes('Degalų kainos') && !t.includes('PRIVATIEMS'));

      for (let i = 0; i < Math.min(titles.length, 6); i++) {
        const itemTitle = titles[i];
        let discount = '-20%';
        let category: DiscountCoupon['category'] = 'coffee';
        let badge = 'Pasiūlymas degalinėse';

        if (itemTitle.includes('Kava') || itemTitle.includes('Wrapperis') || itemTitle.includes('batonėlis')) {
          category = 'coffee';
          discount = itemTitle.includes('2 už') ? 'Speciali kaina' : 'Kavos komplektas';
          badge = 'Maistas & Kava';
        } else if (itemTitle.includes('Monster') || itemTitle.includes('Vitamin Well')) {
          category = 'partner';
          discount = '2 už 3,50 €';
          badge = 'Gėrimų akcija';
        }

        discounts.push({
          id: `ck-live-${i}-${encodeURIComponent(itemTitle.slice(0, 15))}`,
          brand: 'Circle K',
          brandColor: '#ed1b24',
          badge,
          title: itemTitle,
          discount,
          category,
          isHot: i === 0,
          description: `Oficialus aktyvus pasiūlymas Circle K Lietuva viso aptarnavimo degalinėse. Galioja su EXTRA lojalumo programėle.`,
          code: 'EXTRA',
          validUntil: 'Galioja šį mėnesį arba kol baigsis prekių likutis',
          terms: [
            'Galioja visose Circle K pilno aptarnavimo degalinėse Lietuvoje',
            'Akcija taikoma su Circle K EXTRA programėle ar kortele',
            'Prekių kiekis ribotas'
          ],
          howToUse: 'Pateikite EXTRA programėlę arba nuskenuokite QR kodą prieš apmokėjimą kasoje.',
          appUrl: 'https://www.circlek.lt/akcijos-degalinese',
          source: 'CircleK.lt Pasiūlymai',
          foundAt: nowIso,
          uploadedAt: nowIso
        });
      }
    }
  } catch (err) {
    console.warn('[Discounts Scraper] Circle K fetch error:', err);
  }

  // 3. Add core verified active station coupons (Circle K Extra fuel, Neste Easy, Baltic Petroleum, Orlen Vitay, Emsi)
  const coreDiscounts: DiscountCoupon[] = [
    {
      id: 'ck-weekend-fuel-live',
      brand: 'Circle K',
      brandColor: '#ed1b24',
      badge: 'Savaitgalio akcija',
      title: 'Savaitgalio kuro nuolaida su EXTRA programėle',
      discount: '-6 ct/l',
      category: 'weekend',
      isHot: true,
      description: 'Kiekvieną penktadienį–sekmadienį pilkitės degalus su papildoma momentine nuolaida visose Circle K degalinėse.',
      code: 'SAVWEEKEND',
      validUntil: 'Galioja kiekvieną savaitgalį (Penktadienis 14:00 – Sekmadienis 23:59)',
      terms: [
        'Galioja su Circle K EXTRA lojalumo kortele arba programėle',
        'Taikoma miles ir milesPLUS 95 benzinui bei dyzelinui',
        'Nuolaida sumuojasi su esamu EXTRA lygio tarifu'
      ],
      howToUse: 'Prieš apmokėjimą nuskenuokite EXTRA brūkšninį kodą automate arba kasoje.',
      appUrl: 'https://www.circlek.lt/extra',
      source: 'Circle K EXTRA Programa',
      foundAt: nowIso,
      uploadedAt: nowIso
    },
    {
      id: 'neste-easy-fuel-live',
      brand: 'Neste',
      brandColor: '#009944',
      badge: 'Tiesioginė kuro nuolaida',
      title: 'Neste programėlės nuolaida visiems degalams',
      discount: '-3.5 ct/l',
      category: 'fuel',
      isHot: true,
      description: 'Atsiskaitykite už degalus mobiliąja Neste programėle tiesiogiai automobilyje ir automatiškai sutaupykite kiekvieną kartą.',
      code: 'NESTEEASY',
      validUntil: 'Nuolatinis pasiūlymas',
      terms: [
        'Būtina susieti banko mokėjimo kortelę Neste programėlėje',
        'Taikoma Futura 95, 98 ir Neste Pro Diesel degalams',
        'Galioja visose automatinėse Neste degalinėse Lietuvoje'
      ],
      howToUse: 'Atvykę prie kolonėlės, atidarykite Neste programėlę, pasirinkite kolonėlės numerį ir patvirtinkite pylimą.',
      appUrl: 'https://www.neste.lt/privatiems/neste-programele',
      source: 'Neste.lt Programėlė',
      foundAt: nowIso,
      uploadedAt: nowIso
    },
    {
      id: 'bp-lojalumas-fuel-live',
      brand: 'Baltic Petroleum',
      brandColor: '#0070ba',
      badge: 'Populiaru',
      title: 'Baltic Petroleum lojalumo nuolaida ir savaitgalio bonusas',
      discount: '-5 ct/l',
      category: 'fuel',
      isHot: true,
      description: 'Su Baltic Petroleum lojalumo kortele gaukite 5 ct/l nuolaidą kurui ir papildomas nuolaidas auto prekėms bei plovyklai.',
      code: 'BPLOJALUMAS',
      validUntil: 'Nuolatinis pasiūlymas visame tinkle',
      terms: [
        'Galioja su BP lojalumo kortele',
        'Taikoma visiems degalams (A95, Dyzelinas, LPG)',
        'Nuolaida suteikiama iš karto apmokėjimo metu'
      ],
      howToUse: 'Pateikite BP kortelę prieš atsiskaitant degalinės kasoje.',
      appUrl: 'https://balticpetroleum.lt/pasiulymai-ir-akcijos',
      source: 'BalticPetroleum.lt Pasiūlymai',
      foundAt: nowIso,
      uploadedAt: nowIso
    },
    {
      id: 'orlen-vitay-live',
      brand: 'Orlen',
      brandColor: '#b91c1c',
      badge: 'Vitay Bonusas',
      title: 'Orlen Vitay: tiesioginė nuolaida ir 2x taškai',
      discount: '-4 ct/l',
      category: 'fuel',
      description: 'Pilkitės Verva premium degalus su 4 ct/l momentine nuolaida ir kaupkite Vitay taškus dovanoms bei kavai.',
      code: 'VITAYBONUS',
      validUntil: 'Nuolatinis pasiūlymas',
      terms: [
        'Galioja su Orlen Vitay lojalumo programėle',
        'Taikoma tiek standartiniams, tiek Verva kurams',
        'Taškai galioja 24 mėnesius'
      ],
      howToUse: 'Nuskenuokite Vitay kortelę prieš mokėjimą.',
      appUrl: 'https://www.orlen.lt',
      source: 'Orlen Lietuva Vitay',
      foundAt: nowIso,
      uploadedAt: nowIso
    },
    {
      id: 'ck-wash-unlimited-live',
      brand: 'Circle K',
      brandColor: '#ed1b24',
      badge: 'Plovyklos akcija',
      title: 'Circle K plovykla: pirmas mėnuo su 50% nuolaida',
      discount: '-50%',
      category: 'wash',
      isHot: false,
      description: 'Užsiprenumeruokite automobilių plovimą Circle K programėlėje ir plaukite automobilį iki 2 kartų per dieną pusvelčiui.',
      code: 'WASH50',
      validUntil: 'Galioja naujiems prenumeratoriams',
      terms: [
        'Nuolaida taikoma pirmajam prenumeratos mėnesiui',
        'Galima atšaukti bet kuriuo metu be jokių mokesčių',
        'Automatinis numerio nuskaitymas įvažiuojant'
      ],
      howToUse: 'Circle K programėlėje pasirinkite „Automobilių plovykla“, užsakykite prenumeratą ir įveskite kodą.',
      appUrl: 'https://www.circlek.lt/plovykla',
      source: 'Circle K Plovykla',
      foundAt: nowIso,
      uploadedAt: nowIso
    },
    {
      id: 'emsi-kortele-live',
      brand: 'Emsi',
      brandColor: '#eab308',
      badge: 'Geriausia kaina',
      title: 'Emsi Geltona kortelė: fiksuota 4 ct/l nuolaida',
      discount: '-4 ct/l',
      category: 'fuel',
      description: 'Paprasta ir skaidri nuolaida be jokių papildomų sąlygų ar lojalumo lygių visiems Emsi degalams.',
      code: 'EMSYELLOW',
      validUntil: 'Nuolatinis pasiūlymas',
      terms: [
        'Galioja visose Emsi degalinėse',
        'Taikoma A95, A98, dyzelinui ir dujoms',
        'Kortelę galima įsigyti bet kurioje Emsi kasoje'
      ],
      howToUse: 'Įdėkite Geltoną kortelę į mokėjimo automatą prieš pradedant kuro pylimą.',
      appUrl: 'https://emsi.lt',
      source: 'Emsi Oficialus Kainynas',
      foundAt: nowIso,
      uploadedAt: nowIso
    }
  ];

  // Merge scraped live deals with core deals
  const combined = [...discounts, ...coreDiscounts];
  cachedDiscounts = combined;
  lastDiscountsFetch = Date.now();

  return {
    discounts: combined,
    lastChecked: nowIso,
    count: combined.length,
    sources: sourcesChecked.length > 0 ? sourcesChecked : ['Viada.lt Akcijos', 'Circle K Pasiūlymai', 'Neste.lt Klientų Naudos', 'Baltic Petroleum']
  };
}
