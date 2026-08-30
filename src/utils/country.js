/**
 * Country normalization for the country filter (P2 #15).
 *
 * Sources disagree on how they spell a country: Refuge free-text
 * ("United States", "US"), OSM addr:country (ISO-2 by convention but
 * not enforced), city open-data (hardcoded "US"). Collapse the common
 * spellings so one dropdown entry matches them all.
 */

const ALIASES = {
  "USA": "US",
  "UNITED STATES": "US",
  "UNITED STATES OF AMERICA": "US",
  "U.S.": "US",
  "U.S.A.": "US",
  "UNITED KINGDOM": "GB",
  "UK": "GB",
  "GREAT BRITAIN": "GB",
  "CANADA": "CA",
  "MEXICO": "MX",
  "MÉXICO": "MX",
  "DEUTSCHLAND": "DE",
  "GERMANY": "DE",
  "FRANCE": "FR",
  "ESPAÑA": "ES",
  "SPAIN": "ES",
  "JAPAN": "JP",
  "日本": "JP",
};

/** → ISO-2-ish uppercase code, or null when unknown/blank. */
export function normalizeCountry(raw) {
  if (!raw) return null;
  const v = String(raw).trim().toUpperCase();
  if (!v) return null;
  return ALIASES[v] || v;
}
