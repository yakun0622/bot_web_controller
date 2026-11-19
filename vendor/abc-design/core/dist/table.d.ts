export type AbcSortOrder = 'asc' | 'desc' | null;
export interface AbcClientFilterOptions<T extends Record<string, any>> {
    rows: T[];
    searchableKeys?: string[];
    quickKeyword?: string;
    fieldFilters?: Record<string, any>;
    sortField?: string;
    sortOrder?: AbcSortOrder;
}
/**
 * 纯函数客户端表格过滤与排序管道
 * 支持全局关键字（含拼音首字母）、单值/多选数组/日期区间组合筛选与中英文自然排序
 */
export declare function filterAndSortClientRows<T extends Record<string, any>>({ rows, searchableKeys, quickKeyword, fieldFilters, sortField, sortOrder, }: AbcClientFilterOptions<T>): T[];
/** 清理查询参数中的空字符串、空数组、null 与 undefined */
export declare function cleanQueryObject<T extends Record<string, any>>(raw: T): Partial<T>;
/** 从 URL search 字符串安全提取允许同步的查询字段 */
export declare function readQueryFromUrlSearch(search: string, allowedKeys?: ReadonlyArray<string>): Record<string, string>;
/** 将查询参数序列化回 URLSearchParams 字符串（保留无关历史参数） */
export declare function writeQueryToUrlSearch(currentSearch: string, managedKeys: ReadonlyArray<string>, values: Record<string, any>): string;
//# sourceMappingURL=table.d.ts.map