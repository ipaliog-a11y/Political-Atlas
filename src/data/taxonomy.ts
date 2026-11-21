import {
  CategoryMeta,
  PoliticalLeaning,
  PoliticalSystem,
  Region,
  RegionCamera,
} from '../types/polity';

export const LEANING_ORDER: PoliticalLeaning[] = [
  PoliticalLeaning.FarLeft,
  PoliticalLeaning.Left,
  PoliticalLeaning.CenterLeft,
  PoliticalLeaning.Center,
  PoliticalLeaning.CenterRight,
  PoliticalLeaning.Right,
  PoliticalLeaning.NonPartisan,
];

export const SYSTEM_ORDER: PoliticalSystem[] = [
  PoliticalSystem.ParliamentaryRepublic,
  PoliticalSystem.PresidentialRepublic,
  PoliticalSystem.SemiPresidentialRepublic,
  PoliticalSystem.ConstitutionalMonarchy,
  PoliticalSystem.AbsoluteMonarchy,
  PoliticalSystem.OnePartyState,
  PoliticalSystem.MilitaryTransitional,
];

export const REGIONS: Region[] = [
  'Europe',
  'Americas',
  'Asia-Pacific',
  'Middle East & North Africa',
  'Sub-Saharan Africa',
];

export const LEANING_META: Record<PoliticalLeaning, CategoryMeta> = {
  [PoliticalLeaning.FarLeft]: {
    id: PoliticalLeaning.FarLeft,
    label: 'Far-Left / Socialist',
    shortLabel: 'Far-Left',
    color: '#881337',
    softBg: '#FFF1F2',
    description:
      'State-socialist, Marxist-Leninist, or radical left administrations emphasizing state ownership, planned economic sectors, or single-party socialist governance.',
  },
  [PoliticalLeaning.Left]: {
    id: PoliticalLeaning.Left,
    label: 'Left',
    shortLabel: 'Left',
    color: '#DC2626',
    softBg: '#FEF2F2',
    description:
      'Democratic socialist, progressive, or left-populist governing parties advocating broad social redistribution, public-sector expansion, and labor protections.',
  },
  [PoliticalLeaning.CenterLeft]: {
    id: PoliticalLeaning.CenterLeft,
    label: 'Center-Left',
    shortLabel: 'Center-Left',
    color: '#EA6A47',
    softBg: '#FFF7ED',
    description:
      'Social-democratic and progressive-liberal governments balancing regulated market economies with robust welfare states and social investment.',
  },
  [PoliticalLeaning.Center]: {
    id: PoliticalLeaning.Center,
    label: 'Center / Broad Coalition',
    shortLabel: 'Center',
    color: '#D49A1A',
    softBg: '#FEFCE8',
    description:
      'Centrist, technocratic, big-tent, or ideologically mixed grand coalitions bridging left and right policy platforms.',
  },
  [PoliticalLeaning.CenterRight]: {
    id: PoliticalLeaning.CenterRight,
    label: 'Center-Right',
    shortLabel: 'Center-Right',
    color: '#3B82F6',
    softBg: '#EFF6FF',
    description:
      'Christian-democratic, liberal-conservative, and market-oriented administrations emphasizing fiscal restraint, enterprise, and institutional continuity.',
  },
  [PoliticalLeaning.Right]: {
    id: PoliticalLeaning.Right,
    label: 'Right / Nationalist',
    shortLabel: 'Right',
    color: '#1E3A8A',
    softBg: '#EEF2FF',
    description:
      'National-conservative, right-populist, or strongly traditionalist governments prioritizing national sovereignty, deregulation, and cultural conservatism.',
  },
  [PoliticalLeaning.NonPartisan]: {
    id: PoliticalLeaning.NonPartisan,
    label: 'Non-Partisan / Royal / Military',
    shortLabel: 'Non-Partisan',
    color: '#64748B',
    softBg: '#F8FAFC',
    description:
      'Executive monarchies, military juntas, clerical states, or transitional authorities operating outside conventional left-right party competition.',
  },
};

export const SYSTEM_META: Record<PoliticalSystem, CategoryMeta> = {
  [PoliticalSystem.ParliamentaryRepublic]: {
    id: PoliticalSystem.ParliamentaryRepublic,
    label: 'Parliamentary Republic',
    shortLabel: 'Parliamentary',
    color: '#0D9488',
    softBg: '#F0FDFA',
    description:
      'A republic where executive authority rests with a cabinet and prime minister accountable to an elected parliament, alongside a largely ceremonial president.',
  },
  [PoliticalSystem.PresidentialRepublic]: {
    id: PoliticalSystem.PresidentialRepublic,
    label: 'Presidential Republic',
    shortLabel: 'Presidential',
    color: '#2563EB',
    softBg: '#EFF6FF',
    description:
      'A republic where an independently elected president serves as both head of state and head of government, separate from the legislative branch.',
  },
  [PoliticalSystem.SemiPresidentialRepublic]: {
    id: PoliticalSystem.SemiPresidentialRepublic,
    label: 'Semi-Presidential Republic',
    shortLabel: 'Semi-Presidential',
    color: '#4F46E5',
    softBg: '#EEF2FF',
    description:
      'A dual-executive system combining a directly elected president with a prime minister and cabinet responsible to the national legislature.',
  },
  [PoliticalSystem.ConstitutionalMonarchy]: {
    id: PoliticalSystem.ConstitutionalMonarchy,
    label: 'Constitutional Monarchy',
    shortLabel: 'Const. Monarchy',
    color: '#B45309',
    softBg: '#FFFBEB',
    description:
      'A state with a hereditary monarch serving as head of state within constitutional limits, where elected parliaments and ministers typically govern.',
  },
  [PoliticalSystem.AbsoluteMonarchy]: {
    id: PoliticalSystem.AbsoluteMonarchy,
    label: 'Absolute Monarchy',
    shortLabel: 'Abs. Monarchy',
    color: '#7C2D12',
    softBg: '#FFF7ED',
    description:
      'A monarchy in which the ruling sovereign exercises primary executive, legislative, or judicial authority without binding parliamentary control.',
  },
  [PoliticalSystem.OnePartyState]: {
    id: PoliticalSystem.OnePartyState,
    label: 'One-Party State',
    shortLabel: 'One-Party',
    color: '#9F1239',
    softBg: '#FFF1F2',
    description:
      'A state in which a single political party holds constitutional or de facto monopoly over government institutions and executive leadership.',
  },
  [PoliticalSystem.MilitaryTransitional]: {
    id: PoliticalSystem.MilitaryTransitional,
    label: 'Military / Transitional',
    shortLabel: 'Military / Trans.',
    color: '#475569',
    softBg: '#F8FAFC',
    description:
      'Nations governed by military councils, caretaker juntas, clerical supreme authorities, or interim administrations during constitutional suspension.',
  },
};

export const REGION_CAMERAS: RegionCamera[] = [
  {
    region: 'All',
    label: 'Global View',
    shortLabel: 'Global',
    center: [12, 16],
    scale: 1,
  },
  {
    region: 'Europe',
    label: 'Europe',
    shortLabel: 'Europe',
    center: [16, 53],
    scale: 3.1,
  },
  {
    region: 'Americas',
    label: 'Americas',
    shortLabel: 'Americas',
    center: [-78, 12],
    scale: 1.55,
  },
  {
    region: 'Asia-Pacific',
    label: 'Asia-Pacific',
    shortLabel: 'Asia-Pacific',
    center: [108, 18],
    scale: 1.9,
  },
  {
    region: 'Middle East & North Africa',
    label: 'Middle East & North Africa',
    shortLabel: 'MENA',
    center: [28, 26],
    scale: 2.55,
  },
  {
    region: 'Sub-Saharan Africa',
    label: 'Sub-Saharan Africa',
    shortLabel: 'Sub-Saharan Africa',
    center: [20, -4],
    scale: 2.15,
  },
];

export const SPOTLIGHT_COUNTRY_IDS = ['840', '826', '276', '392', '076', '356', '250', '032'];
