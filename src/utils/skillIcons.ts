// Skill icon utilities
import skillsData from '../assets/skills.json';
import masterySkillsData from '../assets/weaponMasterySkills.json';
import skillCoresData from '../assets/skillCores.json';
import playerSkillsData from '../assets/playerSkills.json';
import weaponSpecializationsData from '../assets/weaponSpecializations.json';

// Import all icon assets using Vite's glob import
const iconAssets = import.meta.glob<string>(
  '../assets/icons/{crossbow,daggers,greatsword,longbow,mastery,orb,spear,staff,sword-shield,wand,skill-cores,skills,weapon-specializations}/**/*',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
) as Record<string, string>;

interface SkillMeta {
  name: string;
  iconPath: string | null;
}

interface MasterySkillMeta {
  name: string;
  iconPath: string;
}

interface SkillCoreMeta {
  name: string;
  image: string;
}

interface PlayerSkillMeta {
  name: string;
  icon: string;
  weapon: string;
  type: string;
}

interface WeaponSpecializationMeta {
  name: string;
  icon: string;
  weapon: string;
  type: string;
}

// Normalize a name so we can match "Detonation Mark" with
// "Detonation Mark Active Deals 280% of Base Damage..."
const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '');

// Try to trim suffixes like " Active", " Common", " Weapon Mastery..."
const getBaseSkillName = (name: string) => {
  const cutMarkers = [' Active', ' Common', ' Weapon Mastery'];
  for (const marker of cutMarkers) {
    const idx = name.indexOf(marker);
    if (idx > 0) {
      return name.slice(0, idx);
    }
  }
  return name;
};

const resolveIconAssetUrl = (rawPath: string): string | undefined => {
  let cleaned = rawPath.replace(/^src\//, '');

  if (!cleaned.startsWith('assets/')) {
    if (cleaned.startsWith('icons/') || cleaned.startsWith('images/')) {
      cleaned = `assets/${cleaned}`;
    }
  }

  const assetKey = `../${cleaned}`;
  return iconAssets[assetKey];
};

const skillIconMap = (() => {
  const map = new Map<string, string>();

  // Combine all skill data sources
  const entries: Array<SkillMeta | MasterySkillMeta | SkillCoreMeta> = [
    ...(skillsData as SkillMeta[]),
    ...(masterySkillsData as MasterySkillMeta[]),
    ...(skillCoresData as SkillCoreMeta[]),
  ];

  // Add player skills from questlog.gg
  const playerSkillsObj = playerSkillsData as Record<string, PlayerSkillMeta>;
  Object.values(playerSkillsObj).forEach((skill) => {
    const iconPath = skill.icon;
    if (!iconPath) return;

    const assetUrl = resolveIconAssetUrl(iconPath);
    if (!assetUrl) return;

    const fullNorm = normalizeName(skill.name);
    if (!map.has(fullNorm)) {
      map.set(fullNorm, assetUrl);
    }

    const baseName = getBaseSkillName(skill.name);
    const baseNorm = normalizeName(baseName);
    if (baseNorm && !map.has(baseNorm)) {
      map.set(baseNorm, assetUrl);
    }
  });

  // Add weapon specializations from questlog.gg
  const weaponSpecsObj = weaponSpecializationsData as Record<string, WeaponSpecializationMeta>;
  Object.values(weaponSpecsObj).forEach((spec) => {
    const iconPath = spec.icon;
    if (!iconPath) return;

    const assetUrl = resolveIconAssetUrl(iconPath);
    if (!assetUrl) return;

    const fullNorm = normalizeName(spec.name);
    if (!map.has(fullNorm)) {
      map.set(fullNorm, assetUrl);
    }

    const baseName = getBaseSkillName(spec.name);
    const baseNorm = normalizeName(baseName);
    if (baseNorm && !map.has(baseNorm)) {
      map.set(baseNorm, assetUrl);
    }
  });

  // Process original entries
  entries.forEach((s) => {
    const iconPath = 'iconPath' in s ? s.iconPath : s.image;
    if (!iconPath) return;

    const assetUrl = resolveIconAssetUrl(iconPath);
    if (!assetUrl) return;

    const fullNorm = normalizeName(s.name);
    if (!map.has(fullNorm)) {
      map.set(fullNorm, assetUrl);
    }

    const baseName = getBaseSkillName(s.name);
    const baseNorm = normalizeName(baseName);
    if (baseNorm && !map.has(baseNorm)) {
      map.set(baseNorm, assetUrl);
    }
  });

  return map;
})();

export const getSkillIconPath = (skillName: string): string | undefined => {
  const norm = normalizeName(skillName);
  return (
    skillIconMap.get(norm) ??
    skillIconMap.get(normalizeName(getBaseSkillName(skillName)))
  );
};

export const hasSkillIcon = (skillName: string): boolean => {
  return getSkillIconPath(skillName) !== undefined;
};
