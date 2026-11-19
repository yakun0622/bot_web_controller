/**
 * 零外部依赖的中文拼音首字母边界匹配引擎
 * 基于标准 GB2312 汉字编码区间提取首字母，供全局指令面板、Select、Tree 与表格本地过滤共用
 */
const PINYIN_BOUNDARIES = [
    { letter: 'a', start: '啊' },
    { letter: 'b', start: '芭' },
    { letter: 'c', start: '擦' },
    { letter: 'd', start: '搭' },
    { letter: 'e', start: '蛾' },
    { letter: 'f', start: '发' },
    { letter: 'g', start: '噶' },
    { letter: 'h', start: '哈' },
    { letter: 'j', start: '击' },
    { letter: 'k', start: '喀' },
    { letter: 'l', start: '垃' },
    { letter: 'm', start: '妈' },
    { letter: 'n', start: '拿' },
    { letter: 'o', start: '哦' },
    { letter: 'p', start: '啪' },
    { letter: 'q', start: '期' },
    { letter: 'r', start: '然' },
    { letter: 's', start: '撒' },
    { letter: 't', start: '塌' },
    { letter: 'w', start: '挖' },
    { letter: 'x', start: '昔' },
    { letter: 'y', start: '压' },
    { letter: 'z', start: '匝' },
];
const ZH_COLLATOR = typeof Intl !== 'undefined' && typeof Intl.Collator === 'function'
    ? new Intl.Collator('zh-CN')
    : null;
const CHAR_INITIAL_CACHE = new Map();
const MAX_CHAR_CACHE_SIZE = 4096;
/** 提取单个字符的拼音首字母，非中文字符原样转小写返回 */
export function getCharInitial(ch) {
    if (!/[\u4e00-\u9fa5]/.test(ch)) {
        return ch.toLowerCase();
    }
    const cached = CHAR_INITIAL_CACHE.get(ch);
    if (cached !== undefined)
        return cached;
    let resolved = ch.toLowerCase();
    for (let i = PINYIN_BOUNDARIES.length - 1; i >= 0; i--) {
        const cmp = ZH_COLLATOR
            ? ZH_COLLATOR.compare(ch, PINYIN_BOUNDARIES[i].start)
            : ch.localeCompare(PINYIN_BOUNDARIES[i].start, 'zh-CN');
        if (cmp >= 0) {
            resolved = PINYIN_BOUNDARIES[i].letter;
            break;
        }
    }
    if (CHAR_INITIAL_CACHE.size >= MAX_CHAR_CACHE_SIZE) {
        CHAR_INITIAL_CACHE.clear();
    }
    CHAR_INITIAL_CACHE.set(ch, resolved);
    return resolved;
}
const STRING_INITIALS_CACHE = new Map();
const MAX_STRING_CACHE_SIZE = 2048;
/** 提取完整字符串的连续拼音首字母串（例如：“角色权限管理” -> “jsqxgl”） */
export function getPinyinInitials(text) {
    const cached = STRING_INITIALS_CACHE.get(text);
    if (cached !== undefined)
        return cached;
    const computed = Array.from(text).map(getCharInitial).join('');
    if (STRING_INITIALS_CACHE.size >= MAX_STRING_CACHE_SIZE) {
        STRING_INITIALS_CACHE.clear();
    }
    STRING_INITIALS_CACHE.set(text, computed);
    return computed;
}
/** 判断目标文本是否命中关键字（同时支持不区分大小写的原文包含与拼音首字母包含） */
export function matchKeywordWithPinyin(target, keyword) {
    const cleanKw = keyword.trim().toLowerCase();
    if (!cleanKw)
        return true;
    const cleanTarget = target.toLowerCase();
    if (cleanTarget.includes(cleanKw))
        return true;
    // 搜索词含汉字或目标串无汉字时，拼音首字母不可能额外命中，直接短路避免重复字符分配
    if (/[\u4e00-\u9fa5]/.test(cleanKw) || !/[\u4e00-\u9fa5]/.test(target)) {
        return false;
    }
    return getPinyinInitials(target).includes(cleanKw);
}
//# sourceMappingURL=pinyin.js.map