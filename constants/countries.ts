// src/constants/countries.ts
export interface Country {
  code: string;
  name: string;
  hasStates: boolean;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', hasStates: true },
  { code: 'CA', name: 'Canada', hasStates: true },
  { code: 'UK', name: 'United Kingdom', hasStates: true },
  { code: 'AU', name: 'Australia', hasStates: true },
  { code: 'DE', name: 'Germany', hasStates: false },
  { code: 'FR', name: 'France', hasStates: false },
  { code: 'JP', name: 'Japan', hasStates: false },
  { code: 'CN', name: 'China', hasStates: false },
  { code: 'IN', name: 'India', hasStates: true },
  { code: 'BR', name: 'Brazil', hasStates: true },
  { code: 'MX', name: 'Mexico', hasStates: true },
  { code: 'ZA', name: 'South Africa', hasStates: false },
  { code: 'NG', name: 'Nigeria', hasStates: true },
  { code: 'RU', name: 'Russia', hasStates: true },
  { code: 'AR', name: 'Argentina', hasStates: true },
  // Add more countries as needed
];
