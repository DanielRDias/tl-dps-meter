# QuestLog.gg Data Assets

This document provides an overview of all skill and specialization data fetched from questlog.gg for the Throne and Liberty DPS Meter project.

## Overview

Successfully fetched and organized **649 total skills** with icons from questlog.gg:

### 1. Weapon Specializations (370 skills)
- **Source**: https://questlog.gg/throne-and-liberty/en/db/weapon-specializations
- **Pages Scraped**: 13
- **Icons Downloaded**: 366 (4 had 404 errors)
- **JSON File**: [src/assets/weaponSpecializations.json](src/assets/weaponSpecializations.json)
- **Icons Directory**: [src/assets/icons/weapon-specializations/](src/assets/icons/weapon-specializations/)
- **Documentation**: [WEAPON_SPECIALIZATIONS_README.md](WEAPON_SPECIALIZATIONS_README.md)

### 2. Player Skills (279 skills)
- **Source**: https://questlog.gg/throne-and-liberty/en/db/skill-sets
- **Pages Scraped**: 8
- **Icons Downloaded**: 244
- **JSON File**: [src/assets/playerSkills.json](src/assets/playerSkills.json)
- **Icons Directory**: [src/assets/icons/skills/](src/assets/icons/skills/)
- **Documentation**: [PLAYER_SKILLS_README.md](PLAYER_SKILLS_README.md)

## Data Structure

### Weapon Specializations
```json
{
  "Skill Name": {
    "name": "Skill Name",
    "icon": "icons/weapon-specializations/Skill-Name.webp",
    "weapon": "Weapon Type",
    "type": "attack|defense|tactic|util",
    "questlogUrl": "https://questlog.gg/.../weapon-specialization/...",
    "iconUrl": "https://cdn.questlog.gg/..."
  }
}
```

### Player Skills
```json
{
  "Weapon_Skill Name": {
    "name": "Skill Name",
    "icon": "icons/skills/Skill-Name.webp",
    "weapon": "Weapon Type",
    "type": "active|passive|defensive",
    "level": "Unlock Level",
    "questlogUrl": "",
    "iconUrl": "https://cdn.questlog.gg/..."
  }
}
```

## Weapon Coverage

Both datasets cover all major weapon types:

- **Longbow** - Ranged DPS weapon
- **Crossbow** - Ranged DPS weapon
- **Daggers** - Melee DPS weapon
- **Spear** - Melee DPS/Tank weapon
- **Greatsword** - Melee DPS/Tank weapon
- **Staff** - Magic DPS weapon
- **Sword** - Tank/Support weapon
- **Wand** - Healer/DPS weapon
- **Orb** - Support weapon
- **Passive** - General passive skills (weapon specializations only)

## Scripts

Two Python scripts using Selenium WebDriver were created to scrape the data:

1. **[fetch-weapon-specializations.py](fetch-weapon-specializations.py)** - Scrapes weapon specialization data
2. **[fetch-player-skills.py](fetch-player-skills.py)** - Scrapes player skill data

### Requirements
```bash
pip install selenium requests webdriver-manager
```

### Usage
```bash
# Fetch weapon specializations
python fetch-weapon-specializations.py

# Fetch player skills
python fetch-player-skills.py
```

## Integration Examples

### TypeScript/React Usage

```typescript
import weaponSpecs from './assets/weaponSpecializations.json';
import playerSkills from './assets/playerSkills.json';

// Get all Longbow weapon specializations
const longbowSpecs = Object.values(weaponSpecs).filter(
  spec => spec.weapon === 'Longbow'
);

// Get all active Longbow skills
const longbowActiveSkills = Object.values(playerSkills).filter(
  skill => skill.weapon === 'Longbow' && skill.type === 'active'
);

// Display skill icon
const SkillIcon = ({ skillName }: { skillName: string }) => {
  const skill = playerSkills[skillName];
  return <img src={skill.icon} alt={skill.name} />;
};
```

### Finding Skills by Name

```typescript
// Search across all skills
const findSkill = (skillName: string) => {
  // Check weapon specializations
  const spec = weaponSpecs[skillName];
  if (spec) return { ...spec, category: 'specialization' };
  
  // Check player skills (need to search values since keys include weapon)
  const playerSkill = Object.values(playerSkills).find(
    s => s.name === skillName
  );
  if (playerSkill) return { ...playerSkill, category: 'skill' };
  
  return null;
};
```

## File Organization

```
tl-dps-meter/
├── src/
│   └── assets/
│       ├── weaponSpecializations.json       # 370 weapon specs
│       ├── playerSkills.json                # 279 player skills
│       └── icons/
│           ├── weapon-specializations/      # 366 icons
│           └── skills/                      # 244 icons
├── fetch-weapon-specializations.py          # Scraper script
├── fetch-player-skills.py                   # Scraper script
├── WEAPON_SPECIALIZATIONS_README.md         # Detailed docs
├── PLAYER_SKILLS_README.md                  # Detailed docs
└── QUESTLOG_DATA_SUMMARY.md                 # This file
```

## Notes

- All icon files are in WebP format
- File names are sanitized (spaces → hyphens, special chars removed)
- Skills with duplicate names across weapons use "{Weapon}_{SkillName}" as keys
- Some weapon spec icons (4) returned 404 errors from the CDN
- Player skills include unlock level requirements
- All data includes direct CDN URLs for reference

## Future Updates

To update the data:

1. Run the Python scripts again
2. The scripts will skip already-downloaded icons
3. New skills will be added automatically
4. Review the output for any new 404 errors or issues

## Date

Data fetched: **December 21, 2025**

---

For detailed information about each dataset, see:
- [WEAPON_SPECIALIZATIONS_README.md](WEAPON_SPECIALIZATIONS_README.md)
- [PLAYER_SKILLS_README.md](PLAYER_SKILLS_README.md)
