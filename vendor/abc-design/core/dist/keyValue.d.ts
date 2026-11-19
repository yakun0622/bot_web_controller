/** 结构化键值对单行数据 */
export interface AbcKeyValueEntry {
    id: string;
    key: string;
    value: string;
    enabled?: boolean;
    secret?: boolean;
    description?: string;
}
/** 批量导入导出文本格式 */
export type AbcKeyValueFormat = 'dotenv' | 'headers' | 'json';
/**
 * 将 .env、HTTP Headers 或 JSON 对象文本解析为标准键值对数组
 */
export declare function parseKeyValueText(raw: string, format?: 'auto' | AbcKeyValueFormat): AbcKeyValueEntry[];
/**
 * 将键值对列表序列化为指定格式文本（支持仅导出已启用条目）
 */
export declare function serializeKeyValueEntries(entries: ReadonlyArray<AbcKeyValueEntry>, format: AbcKeyValueFormat, options?: {
    onlyEnabled?: boolean;
}): string;
/** 返回存在重复出现的非空 Key 名称列表（按出现顺序去重） */
export declare function findDuplicateKeys(entries: ReadonlyArray<AbcKeyValueEntry>): string[];
//# sourceMappingURL=keyValue.d.ts.map