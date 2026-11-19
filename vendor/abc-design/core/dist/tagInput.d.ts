/** 默认触发标签分词的分隔符（支持英文/中文逗号、分号、换行、回车与制表符） */
export declare const DEFAULT_TAG_SEPARATORS: readonly string[];
/** 标签分词与归一化选项 */
export interface ParseTagTokensOptions {
    /** 分隔符集合或正则；默认 DEFAULT_TAG_SEPARATORS */
    separators?: ReadonlyArray<string> | RegExp;
    /** 提交前归一化转换（例如 trim / toLowerCase），默认 (raw) => raw.trim() */
    transformTag?: (raw: string) => string;
}
/** 标签被拒绝的原因枚举 */
export type TagRejectReason = 'empty' | 'duplicate' | 'maxTags' | 'maxTagLength' | 'invalid';
/** 被拒绝标签条目明细 */
export interface RejectedTagItem {
    tag: string;
    reason: TagRejectReason;
    message?: string;
}
/** 批量提交合并选项 */
export interface CommitTagsOptions extends ParseTagTokensOptions {
    /** 是否允许重复标签（默认 false） */
    allowDuplicates?: boolean;
    /** 最大标签数量上限 */
    maxTags?: number;
    /** 单个标签最大字符长度上限 */
    maxTagLength?: number;
    /** 自定义校验：返回 true / undefined / null 表示通过；返回 false 或非空错误文案表示拒绝 */
    validateTag?: (tag: string, currentTags: ReadonlyArray<string>) => boolean | string | null | undefined;
}
/** 批量合并结果 */
export interface CommitTagsResult {
    nextTags: string[];
    added: string[];
    rejected: RejectedTagItem[];
    changed: boolean;
}
/** 根据分隔符配置构造无状态正则（避免全局标志 lastIndex 副作用） */
export declare function buildTagSeparatorRegExp(separators?: ReadonlyArray<string> | RegExp): RegExp | null;
/**
 * 将原始输入或粘贴文本按分隔符拆解为候选标签数组（默认自动 trim 并过滤空串）
 */
export declare function splitTagInputText(raw: string, options?: ParseTagTokensOptions): string[];
/**
 * 输入过程中即时检测分隔符并拆分已闭合片段与末尾未完成草稿
 */
export declare function splitTagDraftOnInput(raw: string, options?: ParseTagTokensOptions): {
    committed: string[];
    remainingDraft: string;
};
/**
 * 批量合并候选标签至现有列表，严格按以下顺序执行：
 * transformTag -> 非空判断 -> 去重 -> maxTagLength -> validateTag -> maxTags
 */
export declare function mergeTagTokens(currentTags: ReadonlyArray<string>, candidates: ReadonlyArray<string>, options?: CommitTagsOptions): CommitTagsResult;
//# sourceMappingURL=tagInput.d.ts.map