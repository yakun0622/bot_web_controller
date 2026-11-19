/** 默认触发标签分词的分隔符（支持英文/中文逗号、分号、换行、回车与制表符） */
export const DEFAULT_TAG_SEPARATORS = [',', '，', ';', '；', '\n', '\r', '\t'];
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/** 根据分隔符配置构造无状态正则（避免全局标志 lastIndex 副作用） */
export function buildTagSeparatorRegExp(separators = DEFAULT_TAG_SEPARATORS) {
    if (separators instanceof RegExp) {
        const flags = separators.flags.replace(/g/g, '');
        return new RegExp(separators.source, flags);
    }
    const tokens = Array.from(new Set(separators.filter((s) => s.length > 0))).sort((a, b) => b.length - a.length);
    if (tokens.length === 0)
        return null;
    return new RegExp(`(?:${tokens.map(escapeRegExp).join('|')})`);
}
function normalizeTagCandidate(raw, transformTag) {
    const transformed = transformTag ? transformTag(raw) : raw;
    return transformed.trim();
}
/**
 * 将原始输入或粘贴文本按分隔符拆解为候选标签数组（默认自动 trim 并过滤空串）
 */
export function splitTagInputText(raw, options = {}) {
    if (!raw)
        return [];
    const { separators = DEFAULT_TAG_SEPARATORS, transformTag } = options;
    const sepRe = buildTagSeparatorRegExp(separators);
    const parts = sepRe ? raw.split(sepRe) : [raw];
    const out = [];
    for (const part of parts) {
        const normalized = normalizeTagCandidate(part, transformTag);
        if (normalized) {
            out.push(normalized);
        }
    }
    return out;
}
/**
 * 输入过程中即时检测分隔符并拆分已闭合片段与末尾未完成草稿
 */
export function splitTagDraftOnInput(raw, options = {}) {
    if (!raw)
        return { committed: [], remainingDraft: '' };
    const { separators = DEFAULT_TAG_SEPARATORS, transformTag } = options;
    const sepRe = buildTagSeparatorRegExp(separators);
    if (!sepRe || !sepRe.test(raw)) {
        return { committed: [], remainingDraft: raw };
    }
    const parts = raw.split(sepRe);
    const remainingDraft = parts.length > 0 ? parts[parts.length - 1] ?? '' : '';
    const headParts = parts.slice(0, -1);
    const committed = [];
    for (const part of headParts) {
        const normalized = normalizeTagCandidate(part, transformTag);
        if (normalized) {
            committed.push(normalized);
        }
    }
    return { committed, remainingDraft };
}
/**
 * 批量合并候选标签至现有列表，严格按以下顺序执行：
 * transformTag -> 非空判断 -> 去重 -> maxTagLength -> validateTag -> maxTags
 */
export function mergeTagTokens(currentTags, candidates, options = {}) {
    const { transformTag, allowDuplicates = false, maxTags, maxTagLength, validateTag, } = options;
    const nextTags = [...currentTags];
    const added = [];
    const rejected = [];
    for (const candidate of candidates) {
        const normalized = normalizeTagCandidate(candidate, transformTag);
        if (!normalized) {
            continue;
        }
        if (!allowDuplicates && nextTags.includes(normalized)) {
            rejected.push({
                tag: normalized,
                reason: 'duplicate',
                message: `标签「${normalized}」已存在`,
            });
            continue;
        }
        if (typeof maxTagLength === 'number' && maxTagLength > 0 && normalized.length > maxTagLength) {
            rejected.push({
                tag: normalized,
                reason: 'maxTagLength',
                message: `标签长度不能超过 ${maxTagLength} 个字符`,
            });
            continue;
        }
        if (validateTag) {
            const result = validateTag(normalized, nextTags);
            if (result === false) {
                rejected.push({
                    tag: normalized,
                    reason: 'invalid',
                });
                continue;
            }
            if (typeof result === 'string' && result.trim() !== '') {
                rejected.push({
                    tag: normalized,
                    reason: 'invalid',
                    message: result,
                });
                continue;
            }
        }
        if (typeof maxTags === 'number' && maxTags >= 0 && nextTags.length >= maxTags) {
            rejected.push({
                tag: normalized,
                reason: 'maxTags',
                message: `最多只能添加 ${maxTags} 个标签`,
            });
            continue;
        }
        nextTags.push(normalized);
        added.push(normalized);
    }
    return {
        nextTags,
        added,
        rejected,
        changed: added.length > 0,
    };
}
//# sourceMappingURL=tagInput.js.map