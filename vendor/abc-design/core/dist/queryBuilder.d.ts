/** 规则字段数据类型 */
export type AbcRuleFieldType = 'string' | 'number' | 'boolean' | 'enum' | 'date';
/** 规则条件支持的操作符枚举 */
export type AbcRuleOperator = 'eq' | 'neq' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
/** 运算符元信息：arity 表示右值输入项个数（0=无需输入，1=单值/多选数组，2=起止区间） */
export interface AbcRuleOperatorOption {
    value: AbcRuleOperator;
    label: string;
    arity: 0 | 1 | 2;
}
/** 规则构建器可选字段 Schema */
export interface AbcRuleFieldSchema {
    name: string;
    label: string;
    type: AbcRuleFieldType;
    options?: Array<{
        label: string;
        value: string | number;
    }>;
    unit?: string;
    placeholder?: string;
}
/** 单条原子规则条件节点 */
export interface AbcRuleCondition {
    id: string;
    type: 'condition';
    field: string;
    operator: AbcRuleOperator;
    value?: any;
    valueTo?: any;
    disabled?: boolean;
}
/** 嵌套 AND / OR / NOT 条件组节点 */
export interface AbcRuleGroup {
    id: string;
    type: 'group';
    combinator: 'AND' | 'OR';
    not?: boolean;
    disabled?: boolean;
    children: Array<AbcRuleCondition | AbcRuleGroup>;
}
/** 按字段数据类型返回匹配的有效运算符列表 */
export declare function getOperatorsForFieldType(fieldType: AbcRuleFieldType): AbcRuleOperatorOption[];
/** 查询运算符的输入元信息 */
export declare function getRuleOperatorMeta(operator: AbcRuleOperator): AbcRuleOperatorOption;
/** 创建一条合法的初始单条条件（默认取首字段及其类型下的默认运算符） */
export declare function createDefaultCondition(fields: AbcRuleFieldSchema[], id?: string): AbcRuleCondition;
/** 创建带有一条默认条件的嵌套规则组 */
export declare function createDefaultRuleGroup(fields: AbcRuleFieldSchema[], id?: string): AbcRuleGroup;
/**
 * 对单条业务记录执行嵌套 AND / OR / NOT 规则树求值
 * @param fields 可选字段 Schema（用于精确对齐数值、日期与布尔比较语义）
 */
export declare function evaluateRuleGroup(record: Record<string, any>, group: AbcRuleGroup, fields?: AbcRuleFieldSchema[]): boolean;
/** 将规则 AST 树格式化为面向审核/日志查看器的可读逻辑表达式摘要 */
export declare function formatRuleGroupSummary(group: AbcRuleGroup, fields: AbcRuleFieldSchema[]): string;
//# sourceMappingURL=queryBuilder.d.ts.map