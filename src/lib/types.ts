export interface DailyRecord {
  date: string;
  seda: number;
  usd: number;
  price: number | null;
}

export interface DashboardData {
  records: DailyRecord[];
  fastRequestsSold: number;
  lastUpdated: string;
}

export type TimeRange = '1D' | '7D' | '1M' | '1Y' | 'ALL';
