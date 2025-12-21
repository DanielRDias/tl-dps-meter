# Player Skills Data

This document describes the player skills data that was fetched from questlog.gg.

## Summary

- **Total Skills**: 279
- **Total Icons Downloaded**: 244 (35 icons had download issues or already existed)
- **Source**: https://questlog.gg/throne-and-liberty/en/db/skill-sets
- **Date Fetched**: December 21, 2025
- **Pages Scraped**: 8

## Data Structure

The data is stored in `src/assets/playerSkills.json` with the following structure:

```json
{
  "Weapon_Skill Name": {
    "name": "Skill Name",
    "icon": "icons/skills/Skill-Name.webp",
    "weapon": "Weapon Type",
    "type": "active|passive|defensive",
    "level": "Unlock Level",
    "questlogUrl": "Link to questlog.gg (if available)",
    "iconUrl": "https://cdn.questlog.gg/..."
  }
}
```

## Skills by Weapon

- **Longbow**: 21 skills
- **Crossbow**: 21 skills
- **Daggers**: 21 skills
- **Spear**: 21 skills
- **Greatsword**: 21 skills
- **Staff**: 21 skills
- **Sword**: 21 skills
- **Wand**: 21 skills
- **Orb**: 21 skills
- **tl.undefined**: 90 skills (cross-weapon or special skills)

## Skills by Type

- **Active**: 207 skills
- **Passive**: 63 skills
- **Defensive**: 9 skills

## Files

- **JSON Data**: `src/assets/playerSkills.json`
- **Icon Directory**: `src/assets/icons/skills/`
- **Fetch Script**: `fetch-player-skills.py`

## Usage

To use this data in your application:

```typescript
import playerSkills from './assets/playerSkills.json';

// Access a specific skill
const deadlyMarker = playerSkills['Longbow_Deadly Marker'];
console.log(deadlyMarker.icon); // icons/skills/Deadly-Marker.webp
console.log(deadlyMarker.level); // "30"

// Get all Longbow skills
const longbowSkills = Object.values(playerSkills).filter(
  skill => skill.weapon === 'Longbow'
);

// Get all active skills
const activeSkills = Object.values(playerSkills).filter(
  skill => skill.type === 'active'
);

// Find a skill by name (regardless of weapon)
const findSkillByName = (name: string) => {
  return Object.values(playerSkills).find(skill => skill.name === name);
};
```

## Key Information

### Skills per Weapon
Each main weapon type has exactly 21 skills documented, which includes a mix of active, passive, and defensive abilities.

### tl.undefined Skills
90 skills are marked as "tl.undefined" for their weapon type. These appear to be:
- Cross-weapon skills (usable with multiple weapons)
- Special abilities
- General combat skills
- Skills that don't belong to a specific weapon category

### Skill Levels
Each skill includes its unlock level requirement, ranging from level 1 (starting skills) to level 50+ (advanced skills).

### Icon Files
- All skill names have been sanitized for use as filenames
- Spaces converted to hyphens
- Special characters removed
- Icon files are in WebP format

## Examples

### Longbow Skill
```json
{
  "name": "Deadly Marker",
  "icon": "icons/skills/Deadly-Marker.webp",
  "weapon": "Longbow",
  "type": "active",
  "level": "30",
  "questlogUrl": "",
  "iconUrl": "https://cdn.questlog.gg/.../S_WP_BO_AttackMark.webp"
}
```

### Crossbow Skill
```json
{
  "name": "Quick Fire",
  "icon": "icons/skills/Quick-Fire.webp",
  "weapon": "Crossbow",
  "type": "active",
  "level": "1",
  "questlogUrl": "",
  "iconUrl": "https://cdn.questlog.gg/.../S_WP_CR_RapidShot_AA.webp"
}
```

### Daggers Skill
```json
{
  "name": "Assassin's Step",
  "icon": "icons/skills/Assassin's-Step.webp",
  "weapon": "Daggers",
  "type": "passive",
  "level": "3",
  "questlogUrl": "",
  "iconUrl": "https://cdn.questlog.gg/.../S_AS_CO_Acceleration_AA.webp"
}
```

## Notes

- Some skills may appear multiple times if they're available for different weapons
- The key format is "{Weapon}_{SkillName}" to handle duplicate skill names across weapons
- QuestLog URLs are empty in the current dataset (the scraper couldn't extract them from this page format)
- Icon URLs point directly to the CDN for reference
