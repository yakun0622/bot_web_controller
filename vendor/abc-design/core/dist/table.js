import { matchKeywordWithPinyin } from './pinyin.js';
function isRangeFilterObject(val) {
    return (typeof val === 'object' &&
        val !== null &&
        !Array.isArray(val) &&
        ('start' in val || 'end' in val));
}
function readCellByPath(row, key) {
    if (!row || typeof row !== 'object')
        return undefined;
    if (key in row)
        return row[key];
    if (!key.includes('.'))
        return undefined;
    return key.split('.').reduce((acc, seg) => (acc == null ? undefined : acc[seg]), row);
}
/**
 * 纯函数客户端表格过滤与排序管道
 * 支持全局关键字（含拼音首字母）、单值/多选数组/日期区间组合筛选与中英文自然排序
 */
export function filterAndSortClientRows({ rows, searchableKeys, quickKeyword = '', fieldFilters = {}, sortField, sortOrder, }) {
    let list = [...rows];
    const trimmedKw = quickKeyword.trim();
    if (trimmedKw) {
        list = list.filter((row) => {
            const keys = searchableKeys && searchableKeys.length > 0 ? searchableKeys : Object.keys(row);
            return keys.some((k) => {
                const val = readCellByPath(row, k);
                return val !== undefined && val !== null && matchKeywordWithPinyin(String(val), trimmedKw);
            });
        });
    }
    for (const [k, filterVal] of Object.entries(fieldFilters)) {
        if (filterVal === undefined || filterVal === null)
            continue;
        if (Array.isArray(filterVal)) {
            if (filterVal.length === 0)
                continue;
            list = list.filter((row) => {
                const cellVal = readCellByPath(row, k);
                if (cellVal === undefined || cellVal === null)
                    return false;
                if (Array.isArray(cellVal)) {
                    return filterVal.some((v) => cellVal.map(String).includes(String(v)));
                }
                return filterVal.some((v) => String(cellVal) === String(v) || matchKeywordWithPinyin(String(cellVal), String(v)));
            });
            continue;
        }
        if (isRangeFilterObject(filterVal)) {
            const start = (filterVal.start ?? '').trim();
            const end = (filterVal.end ?? '').trim();
            if (!start && !end)
                continue;
            list = list.filter((row) => {
                const cellVal = readCellByPath(row, k);
                if (cellVal === undefined || cellVal === null)
                    return false;
                const datePart = String(cellVal).slice(0, 10);
                if (start && datePart < start)
                    return false;
                if (end && datePart > end)
                    return false;
                return true;
            });
            continue;
        }
        if (String(filterVal).trim() === '')
            continue;
        list = list.filter((row) => {
            const cellVal = readCellByPath(row, k);
            if (cellVal === undefined || cellVal === null)
                return false;
            return matchKeywordWithPinyin(String(cellVal), String(filterVal));
        });
    }
    if (sortField && sortOrder) {
        const dir = sortOrder === 'asc' ? 1 : -1;
        list.sort((a, b) => {
            const va = readCellByPath(a, sortField);
            const vb = readCellByPath(b, sortField);
            if (typeof va === 'number' && typeof vb === 'number')
                return (va - vb) * dir;
            return String(va ?? '').localeCompare(String(vb ?? ''), 'zh-CN') * dir;
        });
    }
    return list;
}
/** 清理查询参数中的空字符串、空数组、null 与 undefined */
export function cleanQueryObject(raw) {
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
        if (v === undefined || v === null || v === '')
            continue;
        if (Array.isArray(v) && v.length === 0)
            continue;
        if (isRangeFilterObject(v) && !v.start && !v.end)
            continue;
        out[k] = v;
    }
    return out;
}
/** 从 URL search 字符串安全提取允许同步的查询字段 */
export function readQueryFromUrlSearch(search, allowedKeys) {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    const result = {};
    const allowSet = allowedKeys ? new Set(allowedKeys) : null;
    params.forEach((val, key) => {
        if (!val)
            return;
        if (allowSet && !allowSet.has(key))
            return;
        result[key] = val;
    });
    return result;
}
/** 将查询参数序列化回 URLSearchParams 字符串（保留无关历史参数） */
export function writeQueryToUrlSearch(currentSearch, managedKeys, values) {
    const params = new URLSearchParams(currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch);
    for (const key of managedKeys) {
        params.delete(key);
    }
    for (const [k, v] of Object.entries(values)) {
        if (v === undefined || v === null || Array.isArray(v) || typeof v === 'object')
            continue;
        if (String(v).trim() !== '') {
            params.set(k, String(v));
        }
    }
    const str = params.toString();
    return str ? `?${str}` : '';
}
//# sourceMappingURL=table.js.map