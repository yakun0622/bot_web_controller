const DEFAULT_SECRET_PATTERN = /(password|passwd|secret|token|apikey|api_key|private_key|access_key)/i;
function isPlainEqual(a, b) {
    if (Object.is(a, b))
        return true;
    if (a == null || b == null)
        return a === b;
    if (typeof a !== typeof b)
        return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, idx) => isPlainEqual(item, b[idx]));
    }
    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length)
            return false;
        return keysA.every((k) => Object.prototype.hasOwnProperty.call(b, k) && isPlainEqual(a[k], b[k]));
    }
    return false;
}
function formatDiffValueText(val, shouldMask) {
    if (val === undefined)
        return '— (未设置)';
    if (val === null)
        return 'null';
    if (shouldMask)
        return '••••••••';
    if (typeof val === 'string')
        return val === '' ? '"" (空字符串)' : val;
    if (typeof val === 'boolean')
        return val ? 'true (开启)' : 'false (关闭)';
    if (typeof val === 'number')
        return String(val);
    try {
        return JSON.stringify(val);
    }
    catch {
        return String(val);
    }
}
/**
 * 对比变更前后两个结构化配置对象，输出按字段归类的精确变更摘要
 */
export function computeObjectDiff(before, after, options = {}) {
    const { labels = {}, maskSecrets = true, secretPattern = DEFAULT_SECRET_PATTERN, includeUnchanged = false, } = options;
    const prev = before ?? {};
    const next = after ?? {};
    const orderedKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]));
    const entries = [];
    for (const key of orderedKeys) {
        const hasPrev = Object.prototype.hasOwnProperty.call(prev, key) && prev[key] !== undefined;
        const hasNext = Object.prototype.hasOwnProperty.call(next, key) && next[key] !== undefined;
        const prevVal = hasPrev ? prev[key] : undefined;
        const nextVal = hasNext ? next[key] : undefined;
        let kind = 'unchanged';
        if (!hasPrev && hasNext)
            kind = 'added';
        else if (hasPrev && !hasNext)
            kind = 'removed';
        else if (!isPlainEqual(prevVal, nextVal))
            kind = 'modified';
        if (kind === 'unchanged' && !includeUnchanged)
            continue;
        const masked = Boolean(maskSecrets && secretPattern.test(key));
        entries.push({
            key,
            label: labels[key] ?? key,
            kind,
            beforeValue: masked ? '••••••••' : prevVal,
            afterValue: masked ? '••••••••' : nextVal,
            beforeText: formatDiffValueText(prevVal, masked && hasPrev),
            afterText: formatDiffValueText(nextVal, masked && hasNext),
            masked,
        });
    }
    return entries;
}
/**
 * 基于 LCS（最长公共子序列）计算两段多行文本或 JSON 串的精确逐行差异与双侧行号
 */
export function computeLineDiff(beforeText, afterText) {
    const oldLines = beforeText === '' ? [] : beforeText.replace(/\r\n/g, '\n').split('\n');
    const newLines = afterText === '' ? [] : afterText.replace(/\r\n/g, '\n').split('\n');
    // 超大文本防护：避免在浏览器主线程分配百万级 DP 矩阵
    if (oldLines.length * newLines.length > 250_000) {
        return [
            ...oldLines.map((content, idx) => ({
                type: 'remove',
                content,
                oldLineNumber: idx + 1,
            })),
            ...newLines.map((content, idx) => ({
                type: 'add',
                content,
                newLineNumber: idx + 1,
            })),
        ];
    }
    const m = oldLines.length;
    const n = newLines.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (oldLines[i] === newLines[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            }
            else {
                dp[i][j] = dp[i + 1][j] >= dp[i][j + 1] ? dp[i + 1][j] : dp[i][j + 1];
            }
        }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
        if (oldLines[i] === newLines[j]) {
            out.push({
                type: 'context',
                content: oldLines[i],
                oldLineNumber: i + 1,
                newLineNumber: j + 1,
            });
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push({
                type: 'remove',
                content: oldLines[i],
                oldLineNumber: i + 1,
            });
            i++;
        }
        else {
            out.push({
                type: 'add',
                content: newLines[j],
                newLineNumber: j + 1,
            });
            j++;
        }
    }
    while (i < m) {
        out.push({ type: 'remove', content: oldLines[i], oldLineNumber: i + 1 });
        i++;
    }
    while (j < n) {
        out.push({ type: 'add', content: newLines[j], newLineNumber: j + 1 });
        j++;
    }
    return out;
}
//# sourceMappingURL=diff.js.map