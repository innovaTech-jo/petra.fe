/**
 * Arabic wording (تفقيط) for Jordanian dinar + fils (0–999 fils per dinar).
 * Dinars use masculine agreement; fils block uses feminine agreement where needed.
 */

const M_ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const F_ONES = ['', 'واحدة', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];
const M_TEENS = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر'
];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

function joinParts(parts: string[]): string {
  const p = parts.filter(Boolean);
  if (p.length === 0) return '';
  if (p.length === 1) return p[0];
  return p.slice(0, -1).join(' و') + ' و' + p[p.length - 1];
}

function belowHundred(n: number, feminine: boolean): string {
  if (n <= 0) return '';
  const ones = feminine ? F_ONES : M_ONES;
  if (n < 10) return ones[n];
  if (n < 20) return M_TEENS[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return TENS[t];
  return `${ones[u]} و${TENS[t]}`;
}

function hundredsBlock(n: number, feminine: boolean): string {
  if (n <= 0) return '';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h === 1) parts.push('مائة');
  else if (h === 2) parts.push('مائتان');
  else if (h > 2) parts.push(`${M_ONES[h]}مائة`);
  const r = belowHundred(rest, feminine);
  if (r) parts.push(r);
  return joinParts(parts);
}

/** Integer 0..999999 to Arabic words (masculine, for dinars). */
export function arabicIntegerMasculine(n: number): string {
  const v = Math.max(0, Math.min(999_999, Math.floor(n)));
  if (v === 0) return 'صفر';
  const th = Math.floor(v / 1000);
  const rem = v % 1000;
  const parts: string[] = [];
  if (th === 1) parts.push('ألف');
  else if (th === 2) parts.push('ألفان');
  else if (th > 2 && th < 11) parts.push(`${M_ONES[th]} آلاف`);
  else if (th >= 11) parts.push(`${arabicIntegerMasculine(th)} ألف`);
  const block = hundredsBlock(rem, false);
  if (block) parts.push(block);
  return joinParts(parts);
}

/** Integer 0..999 to Arabic words (feminine, for fils). */
export function arabicIntegerFeminine(n: number): string {
  const v = Math.max(0, Math.min(999, Math.floor(n)));
  if (v === 0) return 'صفر';
  return hundredsBlock(v, true);
}

/**
 * Full phrase similar to official vouchers: dinars in words + fils (words) + فقط لاغير.
 */
export function jodToTafket(totalDinars: number, totalFils: number): string {
  const d = Math.max(0, Math.floor(totalDinars));
  const f = Math.max(0, Math.min(999, Math.floor(totalFils)));
  let phrase = '';
  if (d === 0 && f === 0) {
    phrase = 'صفر دينار';
  } else if (d === 0) {
    phrase = `${arabicIntegerFeminine(f)} فلساً`;
  } else if (f === 0) {
    phrase = `${arabicIntegerMasculine(d)} ديناراً`;
  } else {
    phrase = `${arabicIntegerMasculine(d)} ديناراً و${arabicIntegerFeminine(f)} فلساً`;
  }
  return `${phrase} فقط لاغير`;
}
