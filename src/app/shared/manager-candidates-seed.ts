export type ManagerCandidateOption = { id: string; label: string };

/**
 * Seed managers for «المدير المباشر» when the API is empty or offline.
 * IDs match register-page defaults so `managerId` stays consistent across flows.
 */
export const MANAGER_CANDIDATES_SEED: ManagerCandidateOption[] = [
  { id: 'amin-abu-qurs', label: 'أمين عزيز أبو قرص' },
  { id: 'ziad-al-bargouthi', label: 'زياد البرغوثي' },
  { id: 'yusef-al-bargouthi', label: 'يوسف البرغوثي' },
  { id: 'mohammed-al-shara', label: 'محمد الشرع' },
  { id: 'ahmad-abu-zaid', label: 'أحمد أبو زيد' }
];

/** Merge seed first, then API users not already present (by id). */
export function mergeManagerCandidates(
  fromApi: ManagerCandidateOption[]
): ManagerCandidateOption[] {
  const seen = new Set<string>();
  const out: ManagerCandidateOption[] = [];
  for (const s of MANAGER_CANDIDATES_SEED) {
    seen.add(s.id);
    out.push({ ...s });
  }
  for (const u of fromApi) {
    if (u.id && !seen.has(u.id)) {
      seen.add(u.id);
      out.push({ id: u.id, label: u.label });
    }
  }
  return out;
}
