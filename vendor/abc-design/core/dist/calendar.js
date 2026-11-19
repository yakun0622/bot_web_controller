/** 将年月日格式化为标准 YYYY-MM-DD */
export function formatIsoDate(year, monthZeroBased, day) {
    const d = new Date(year, monthZeroBased, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
/** 生成 6 行 × 7 列（共 42 格，周日为首列）的日历面板网格数据 */
export function buildCalendarMonthGrid(year, monthZeroBased, today = new Date()) {
    const todayIso = formatIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
    const firstDayWeek = new Date(year, monthZeroBased, 1).getDay();
    const daysInCurrent = new Date(year, monthZeroBased + 1, 0).getDate();
    const daysInPrev = new Date(year, monthZeroBased, 0).getDate();
    const cells = [];
    // 补齐上月尾部日期
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        const day = daysInPrev - i;
        const iso = formatIsoDate(year, monthZeroBased - 1, day);
        cells.push({ iso, day, inCurrentMonth: false, isToday: iso === todayIso });
    }
    // 当月日期
    for (let day = 1; day <= daysInCurrent; day++) {
        const iso = formatIsoDate(year, monthZeroBased, day);
        cells.push({ iso, day, inCurrentMonth: true, isToday: iso === todayIso });
    }
    // 补齐下月头部日期至 42 格，保证日历弹层高度恒定不抖动
    let nextDay = 1;
    while (cells.length < 42) {
        const iso = formatIsoDate(year, monthZeroBased + 1, nextDay);
        cells.push({ iso, day: nextDay, inCurrentMonth: false, isToday: iso === todayIso });
        nextDay += 1;
    }
    return cells;
}
//# sourceMappingURL=calendar.js.map