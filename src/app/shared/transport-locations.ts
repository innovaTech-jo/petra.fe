/** Preset trip / location options for the transportation voucher dropdown. */
export interface TransportLocationOption {
  key: string;
  label: string;
  /**
   * مسافة تُستخدم مع شاشة/إعدادات التعرفة (سعر الكيلوم + مضاعف العطل).
   * غير مُعرّف لمسار «أخرى» — لا يُملأ السعر تلقائياً.
   */
  tariffDistanceKm?: number;
}

export const TRANSPORT_LOCATIONS: TransportLocationOption[] = [
  { key: 'return_dhahibah_sahab', label: 'عودة إخوان - ذهيبة - سحاب', tariffDistanceKm: 18 },
  { key: 'irbid_electricity', label: 'كهرباء إربد', tariffDistanceKm: 90 },
  { key: 'amman_hq', label: 'العودة إلى المقر — عمان', tariffDistanceKm: 14 },
  { key: 'zarqa_trip', label: 'زيارة ميدانية — الزرقاء', tariffDistanceKm: 28 },
  { key: 'aqaba_trip', label: 'مشوار عمل — العقبة', tariffDistanceKm: 330 },
  { key: 'other', label: 'أخرى (يُذكر في الملاحظات لاحقاً)' }
];

export function locationLabel(key: string): string {
  return TRANSPORT_LOCATIONS.find((l) => l.key === key)?.label ?? key;
}
