export interface AbcCalendarCell {
    /** YYYY-MM-DD 格式日期字符串 */
    iso: string;
    day: number;
    inCurrentMonth: boolean;
    isToday: boolean;
}
/** 将年月日格式化为标准 YYYY-MM-DD */
export declare function formatIsoDate(year: number, monthZeroBased: number, day: number): string;
/** 生成 6 行 × 7 列（共 42 格，周日为首列）的日历面板网格数据 */
export declare function buildCalendarMonthGrid(year: number, monthZeroBased: number, today?: Date): AbcCalendarCell[];
//# sourceMappingURL=calendar.d.ts.map