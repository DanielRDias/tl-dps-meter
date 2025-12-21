# Weapon Specializations Data

This document describes the weapon specialization data that was fetched from questlog.gg.

## Summary

- **Total Skills**: 370
- **Total Icons Downloaded**: 366 (4 icons had 404 errors on the source website)
- **Source**: https://questlog.gg/throne-and-liberty/en/db/weapon-specializations
- **Date Fetched**: December 21, 2025

## Data Structure

The data is stored in `src/assets/weaponSpecializations.json` with the following structure:

```json
{
  "Skill Name": {
    "name": "Skill Name",
    "icon": "icons/weapon-specializations/Skill-Name.webp",
    "weapon": "Weapon Type",
    "type": "attack|defense|tactic|util",
    "questlogUrl": "https://questlog.gg/throne-and-liberty/en/db/weapon-specialization/...",
    "iconUrl": "https://cdn.questlog.gg/..."
  }
}
```

## Skills by Weapon

- **Longbow**: 51 skills
- **Crossbow**: 35 skills
- **Daggers**: 41 skills
- **Spear**: 36 skills
- **Greatsword**: 36 skills
- **Staff**: 38 skills
- **Sword**: 32 skills
- **Wand**: 34 skills
- **Orb**: 45 skills
- **Passive**: 22 skills

## Files

- **JSON Data**: `src/assets/weaponSpecializations.json`
- **Icon Directory**: `src/assets/icons/weapon-specializations/`
- **Fetch Script**: `fetch-weapon-specializations.py`

## Usage

To use this data in your application:

```typescript
import weaponSpecs from './assets/weaponSpecializations.json';

// Access a specific skill
const lethalStacks = weaponSpecs['Lethal Stacks'];
console.log(lethalStacks.icon); // icons/weapon-specializations/Lethal-Stacks.webp
console.log(lethalStacks.questlogUrl); // Link to questlog.gg

// Get all Longbow skills
const longbowSkills = Object.values(weaponSpecs).filter(
  skill => skill.weapon === 'Longbow'
);
```

## Notes

- 4 icons failed to download due to 404 errors on the source CDN:
  - Resonant Heavy Attack
  - Stellar Flare
  - Galactic Acceleration
  - Coordinated Fracture
  
- All skill names have been sanitized for use as filenames (spaces converted to hyphens, special characters removed)
- Icon files are in WebP format
- Each skill includes a direct link to its questlog.gg page for detailed information
