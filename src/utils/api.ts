const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ShareResponse {
  success: boolean;
  shareId: string;
  shareUrl: string;
}

export interface SharedLogData {
  playerName: string;
  totalDamage: number;
  damagePerSecond: number;
  duration: number;
  timestamp: number;
  logData: any[];
  createdAt: string;
}

export interface RetrieveResponse {
  success: boolean;
  data: SharedLogData;
}

export async function shareLog(
  playerName: string,
  totalDamage: number,
  damagePerSecond: number,
  duration: number,
  timestamp: number,
  logData: any[]
): Promise<ShareResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerName,
        totalDamage,
        damagePerSecond,
        duration,
        timestamp,
        logData: JSON.stringify(logData),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sharing log:', error);
    throw error;
  }
}

export async function retrieveSharedLog(shareId: string): Promise<RetrieveResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/share/${shareId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving shared log:', error);
    throw error;
  }
}
