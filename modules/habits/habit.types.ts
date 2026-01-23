
export interface ReportResult {
    startDate?: string;
    endDate?: string;
    daily?: any;
    weekly?: any;
    monthly?: any;
    weeklyStreak?: Record<string, boolean>;
}