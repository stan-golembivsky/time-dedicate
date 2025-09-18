export interface ITimeEntry {
    id: string;
    name: string;
    color: string;
    percentage: number;
    children?: ITimeEntry[];
}

export type TimeUnit = 'minute' |'hour' | 'day' | 'week' | 'month' | 'year' | 'decade';

export const unitsInAUnit = {
    minute: { list: ['hour', 'day', 'week', 'month', 'year', 'decade'], default: 'hour' },
    hour: { list: ['day', 'week', 'month', 'year', 'decade'], default: 'week'},
    day: { list: ['week', 'month', 'year', 'decade'], default: 'month' },
    week: { list: ['month', 'year', 'decade'], default: 'month' },
    month: { list: ['year', 'decade'], default: 'year' },
    year: { list: ['decade'], default: 'decade' }
}