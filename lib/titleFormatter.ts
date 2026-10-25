/**
 * Capitalizes each word in a clinical presentation title while preserving
 * standard medical acronyms (UTI, DVT, CKD, COPD, etc.) and punctuation.
 */
export function formatPresentationTitle(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => {
      const m = w.match(/^([(\[{'"]*)(.*?)([)\]}'",.:;!?]*)$/);
      if (!m) return w;
      const [, pre, core, suf] = m;
      if (!core) return w;
      if (/^(uti|dvt|ckd|copd|bph|luts|gord|ecg|fbc|esr|crp|gp|rcgp|nice|cks)$/i.test(core)) {
        return pre + core.toUpperCase() + suf;
      }
      if (core.includes('/')) {
        return pre + core.split('/').map(p => p ? p.charAt(0).toUpperCase() + p.slice(1) : '').join('/') + suf;
      }
      if (core.includes('-')) {
        return pre + core.split('-').map(p => p ? p.charAt(0).toUpperCase() + p.slice(1) : '').join('-') + suf;
      }
      return pre + core.charAt(0).toUpperCase() + core.slice(1) + suf;
    })
    .join(' ');
}
