let kvSeq = 0;
function nextKvId() {
    kvSeq += 1;
    return `kv_${kvSeq}`;
}
function unquoteEnvValue(raw) {
    const trimmed = raw.trim();
    if (trimmed.length >= 2) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
            const inner = trimmed.slice(1, -1);
            return first === '"' ? inner.replace(/\\n/g, '\n').replace(/\\"/g, '"') : inner;
        }
    }
    return trimmed;
}
/**
 * 将 .env、HTTP Headers 或 JSON 对象文本解析为标准键值对数组
 */
export function parseKeyValueText(raw, format = 'auto') {
    const trimmed = raw.trim();
    if (!trimmed)
        return [];
    if (format === 'json' || (format === 'auto' && trimmed.startsWith('{'))) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                return Object.entries(parsed).map(([k, v]) => ({
                    id: nextKvId(),
                    key: k,
                    value: v === null || v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v),
                    enabled: true,
                }));
            }
        }
        catch {
            if (format === 'json')
                return [];
        }
    }
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const entries = [];
    for (const line of lines) {
        const lineTrimmed = line.trim();
        if (!lineTrimmed || lineTrimmed.startsWith('#') || lineTrimmed.startsWith('//'))
            continue;
        const eqIdx = lineTrimmed.indexOf('=');
        const colonIdx = lineTrimmed.indexOf(':');
        const useHeaders = format === 'headers' ||
            (format === 'auto' && colonIdx > 0 && (eqIdx === -1 || colonIdx < eqIdx));
        if (useHeaders && colonIdx > 0) {
            const key = lineTrimmed.slice(0, colonIdx).trim();
            const value = lineTrimmed.slice(colonIdx + 1).trim();
            if (key) {
                entries.push({ id: nextKvId(), key, value, enabled: true });
            }
            continue;
        }
        if (eqIdx > 0) {
            const keyPart = lineTrimmed.slice(0, eqIdx).trim().replace(/^export\s+/i, '');
            const valPart = unquoteEnvValue(lineTrimmed.slice(eqIdx + 1));
            if (keyPart) {
                entries.push({ id: nextKvId(), key: keyPart, value: valPart, enabled: true });
            }
        }
    }
    return entries;
}
/**
 * 将键值对列表序列化为指定格式文本（支持仅导出已启用条目）
 */
export function serializeKeyValueEntries(entries, format, options = {}) {
    const { onlyEnabled = false } = options;
    const filtered = entries.filter((e) => e.key.trim() !== '' && (!onlyEnabled || e.enabled !== false));
    if (format === 'json') {
        const obj = {};
        for (const item of filtered) {
            obj[item.key.trim()] = item.value;
        }
        return JSON.stringify(obj, null, 2);
    }
    if (format === 'headers') {
        return filtered.map((item) => `${item.key.trim()}: ${item.value}`).join('\n');
    }
    return filtered
        .map((item) => {
        const val = item.value;
        const needsQuotes = /[\s#"']/.test(val) || val.includes('\n');
        const safeVal = needsQuotes ? `"${val.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"` : val;
        return `${item.key.trim()}=${safeVal}`;
    })
        .join('\n');
}
/** 返回存在重复出现的非空 Key 名称列表（按出现顺序去重） */
export function findDuplicateKeys(entries) {
    const seen = new Set();
    const duplicates = new Set();
    for (const item of entries) {
        const k = item.key.trim();
        if (!k)
            continue;
        if (seen.has(k))
            duplicates.add(k);
        else
            seen.add(k);
    }
    return Array.from(duplicates);
}
//# sourceMappingURL=keyValue.js.map