import type { CombatLogEntry } from '@/types/combatLog';

export interface UploadedFile {
  id: string;
  fileName: string;
  entries: CombatLogEntry[];
  rawContent: string;
  uploadedAt: Date;
}