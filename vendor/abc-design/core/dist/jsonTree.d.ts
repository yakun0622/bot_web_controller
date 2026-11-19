/** JSON 节点语义值类型 */
export type AbcJsonValueType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
/** JSON 路径格式化风格 */
export type AbcJsonPathFormat = 'jsonpath' | 'dot';
/** JSON 输入解析结果 */
export type AbcJsonParseResult = {
    ok: true;
    value: unknown;
    isEmptyInput: boolean;
} | {
    ok: false;
    error: string;
    raw: string;
};
/** JSON 树搜索匹配结果 */
export interface AbcJsonTreeSearchResult {
    matchedPaths: Set<string>;
    visiblePaths: Set<string>;
    autoExpandedPaths: Set<string>;
    matchCount: number;
    /** 是否因达到 maxVisitedNodes 上限而提前截断扫描 */
    truncated: boolean;
}
/**
 * 解析任意 data 输入：支持原值透传与可选字符串 JSON.parse（含空串与异常兜底）
 */
export declare function parseJsonTreeInput(data: unknown, parseString?: boolean): AbcJsonParseResult;
/**
 * 判定 JSON 节点语义类型
 */
export declare function getJsonValueType(value: unknown): AbcJsonValueType;
/**
 * 将路径段格式化为标准 JSONPath（$.a.b[0]["x.y"]）或点路径（a.b[0]["x.y"]）
 */
export declare function formatJsonPath(segments: ReadonlyArray<string | number>, format?: AbcJsonPathFormat): string;
/**
 * 序列化单个节点值用于剪贴板复制（内置循环引用与 BigInt 保护）
 */
export declare function formatJsonCopyValue(value: unknown, indent?: number): string;
/**
 * 收集指定深度内的可展开容器路径（供 defaultExpandDepth 与“全部展开”使用）
 */
export declare function collectJsonExpandablePaths(root: unknown, options?: {
    maxDepth?: number;
    maxNodes?: number;
}): string[];
/**
 * 检索 JSON 树中匹配关键字的节点路径、可见路径集合与需自动展开的祖先容器路径
 */
export declare function searchJsonTree(root: unknown, query: string, options?: {
    maxDepth?: number;
    maxVisitedNodes?: number;
}): AbcJsonTreeSearchResult;
//# sourceMappingURL=jsonTree.d.ts.map