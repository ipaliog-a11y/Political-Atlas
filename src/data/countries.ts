import { CountryPolity } from '../types/polity';
import { COUNTRIES_WEST } from './countriesWest';
import { COUNTRIES_EAST } from './countriesEast';

export const COUNTRIES: CountryPolity[] = [
  ...COUNTRIES_WEST,
  ...COUNTRIES_EAST,
].sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_BY_ID: Record<string, CountryPolity> = {};
export const COUNTRY_BY_ATLAS_NAME: Record<string, CountryPolity> = {};

for (const country of COUNTRIES) {
  COUNTRY_BY_ID[country.id] = country;
  if (country.atlasName) {
    COUNTRY_BY_ATLAS_NAME[country.atlasName] = country;
  }
}

export function resolveCountryFromFeature(
  featureId: string | number | undefined,
  featureName?: string
): CountryPolity | undefined {
  if (featureId !== undefined && featureId !== null) {
    const padded = String(featureId).padStart(3, '0');
    if (COUNTRY_BY_ID[padded]) {
      return COUNTRY_BY_ID[padded];
    }
    const raw = String(featureId);
    if (COUNTRY_BY_ID[raw]) {
      return COUNTRY_BY_ID[raw];
    }
  }
  if (featureName && COUNTRY_BY_ATLAS_NAME[featureName]) {
    return COUNTRY_BY_ATLAS_NAME[featureName];
  }
  return undefined;
}
