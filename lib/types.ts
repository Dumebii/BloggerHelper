export interface CampaignDay {
  day: number;
  x: string;
  linkedin: string;
  discord: string;
  slack: string; // new
  // This index signature is vital for dynamic platform access
  [key: string]: string | number;
}
