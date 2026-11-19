/** 差异类型：新增、移除、修改、无变化 */
export type AbcDiffKind = 'added' | 'removed' | 'modified' | 'unchanged';
/** 结构化配置对象字段级差异条目 */
export interface AbcFieldDiffEntry {
    key: string;
    label: string;
    kind: AbcDiffKind;
    beforeValue: any;
    afterValue: any;
    beforeText: string;
    afterText: string;
    masked?: boolean;
}
/** 逐行文本/代码差异条目 */
export interface AbcLineDiffEntry {
    type: 'context' | 'add' | 'remove';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
}
export interface ComputeObjectDiffOptions {
    /** 字段键名到中文语义标签的映射表 */
    labels?: Record<string, string>;
    /** 是否对疑似密钥/令牌字段自动掩码（默认 true） */
    maskSecrets?: boolean;
    /** 自定义敏感键名正则 */
    secretPattern?: RegExp;
    /** 是否在结果中包含未变化字段（默认 false） */
    includeUnchanged?: boolean;
}
/**
 * 对比变更前后两个结构化配置对象，输出按字段归类的精确变更摘要
 */
export declare function computeObjectDiff(before: Record<string, any> | null | undefined, after: Record<string, any> | null | undefined, options?: ComputeObjectDiffOptions): AbcFieldDiffEntry[];
/**
 * 基于 LCS（最长公共子序列）计算两段多行文本或 JSON 串的精确逐行差异与双侧行号
 */
export declare function computeLineDiff(beforeText: string, afterText: string): AbcLineDiffEntry[];
//# sourceMappingURL=diff.d.ts.map