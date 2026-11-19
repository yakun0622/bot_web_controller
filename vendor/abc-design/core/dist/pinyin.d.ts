/**
 * 零外部依赖的中文拼音首字母边界匹配引擎
 * 基于标准 GB2312 汉字编码区间提取首字母，供全局指令面板、Select、Tree 与表格本地过滤共用
 */
/** 提取单个字符的拼音首字母，非中文字符原样转小写返回 */
export declare function getCharInitial(ch: string): string;
/** 提取完整字符串的连续拼音首字母串（例如：“角色权限管理” -> “jsqxgl”） */
export declare function getPinyinInitials(text: string): string;
/** 判断目标文本是否命中关键字（同时支持不区分大小写的原文包含与拼音首字母包含） */
export declare function matchKeywordWithPinyin(target: string, keyword: string): boolean;
//# sourceMappingURL=pinyin.d.ts.map