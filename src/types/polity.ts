export type MapLayer = 'leaning' | 'system';

export type Region =
  | 'Americas'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Middle East & North Africa'
  | 'Sub-Saharan Africa';

export enum PoliticalLeaning {
  FarLeft = 'far-left',
  Left = 'left',
  CenterLeft = 'center-left',
  Center = 'center',
  CenterRight = 'center-right',
  Right = 'right',
  NonPartisan = 'non-partisan',
}

export enum PoliticalSystem {
  ParliamentaryRepublic = 'parliamentary-republic',
  PresidentialRepublic = 'presidential-republic',
  SemiPresidentialRepublic = 'semi-presidential-republic',
  ConstitutionalMonarchy = 'constitutional-monarchy',
  AbsoluteMonarchy = 'absolute-monarchy',
  OnePartyState = 'one-party-state',
  MilitaryTransitional = 'military-transitional',
}

export interface CountryPolity {
  /** ISO 3166-1 numeric code (3-digit string matching world-atlas) or canonical key */
  id: string;
  /** Optional fallback feature name in world-atlas when numeric ID is absent */
  atlasName?: string;
  iso3: string;
  name: string;
  region: Region;
  politicalSystem: PoliticalSystem;
  politicalLeaning: PoliticalLeaning;
  rulingParty: string;
  coalition?: string;
  leaderName: string;
  leaderTitle: string;
  lastElectionYear: number | null;
  legislature: string;
  summary: string;
}

export interface CategoryMeta {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  softBg: string;
  description: string;
}

export interface RegionCamera {
  region: Region | 'All';
  label: string;
  shortLabel: string;
  /** Center [lon, lat] for camera transform */
  center: [number, number];
  /** Zoom scale factor */
  scale: number;
}
