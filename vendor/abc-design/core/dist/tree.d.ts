/** 通用树节点数据结构 */
export interface AbcTreeNode {
    key: string | number;
    title: string;
    disabled?: boolean;
    icon?: string;
    badge?: string | number;
    children?: AbcTreeNode[];
    [extra: string]: unknown;
}
export interface AbcTreeCheckResult {
    checkedKeys: Array<string | number>;
    halfCheckedKeys: Array<string | number>;
}
/**
 * 计算树形结构在级联模式下的精确选中集与半选（indeterminate）祖先集
 */
export declare function computeTreeCheckState(nodes: AbcTreeNode[], rawCheckedKeys: ReadonlyArray<string | number>, checkStrictly?: boolean): AbcTreeCheckResult;
/**
 * 切换指定树节点的勾选状态，并在非严格模式下自动级联更新子孙与祖先节点状态
 */
export declare function toggleTreeNodeChecked(nodes: AbcTreeNode[], currentCheckedKeys: ReadonlyArray<string | number>, targetNode: AbcTreeNode, nextChecked: boolean, checkStrictly?: boolean): AbcTreeCheckResult;
/**
 * 按关键字（含拼音首字母）过滤树形结构，并自动保留命中节点的祖先路径及需要自动展开的 key 列表
 */
export declare function filterTreeNodes(nodes: AbcTreeNode[], keyword: string): {
    filteredNodes: AbcTreeNode[];
    autoExpandedKeys: Array<string | number>;
};
/** 提取整棵树的全部可展开父节点 key（用于“展开全部”） */
export declare function collectAllExpandableKeys(nodes: AbcTreeNode[]): Array<string | number>;
/** TreeSelect 自定义字段映射配置 */
export interface AbcTreeFieldNames {
    label?: string;
    value?: string;
    children?: string;
}
/** 扁平数组自动构树模式配置（id/pId 关联） */
export interface AbcTreeSimpleModeConfig {
    id?: string;
    pId?: string;
    rootPId?: string | number | null;
}
/** 多选复选模式下受控值与胶囊标签回填策略 */
export type AbcCheckedStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD';
/** 归一化后的 TreeSelect 标准树节点 */
export interface AbcTreeSelectNode extends AbcTreeNode {
    key: string | number;
    value: string | number;
    title: string;
    /** 保留原始非纯文本 label（如 ReactNode），搜索时统一使用字符串 title */
    rawLabel?: unknown;
    disabled?: boolean;
    selectable?: boolean;
    checkable?: boolean;
    isLeaf?: boolean;
    icon?: string;
    badge?: string | number;
    children?: AbcTreeSelectNode[];
    raw?: Record<string, unknown>;
}
/** 展平后的可见树节点行（用于虚拟滚动切片与键盘导航） */
export interface AbcFlattenedTreeNode {
    node: AbcTreeSelectNode;
    keyStr: string;
    depth: number;
    posInSet: number;
    setSize: number;
    hasChildren: boolean;
    isExpanded: boolean;
    parentKey: string | number | null;
}
export interface NormalizeTreeSelectResult {
    treeNodes: AbcTreeSelectNode[];
    nodeMap: Map<string, AbcTreeSelectNode>;
    parentMap: Map<string, string | null>;
}
/**
 * 将嵌套 treeData（含自定义 fieldNames）或扁平 simpleMode 数组归一化为标准树形索引结构
 */
export declare function normalizeTreeSelectData(rawData?: ReadonlyArray<Record<string, unknown>>, options?: {
    fieldNames?: AbcTreeFieldNames;
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
}): NormalizeTreeSelectResult;
/**
 * 从外部受控 value 解析完整的复选态（含父节点 value 自动向下传播子孙与半选态推导）
 */
export declare function resolveTreeCheckedStateFromValue(nodes: AbcTreeSelectNode[], valueKeys: ReadonlyArray<string | number>, checkStrictly?: boolean): AbcTreeCheckResult;
/**
 * 按指定策略（SHOW_ALL / SHOW_PARENT / SHOW_CHILD）收敛全选节点集合为对外输出数组
 */
export declare function formatTreeCheckedStrategy(nodes: AbcTreeSelectNode[], checkedKeys: ReadonlyArray<string | number>, strategy?: AbcCheckedStrategy, checkStrictly?: boolean): Array<string | number>;
/**
 * 过滤归一化后的 TreeSelect 节点，支持按标题（含拼音首字母）与节点值匹配并自动推导需展开祖先 key
 */
export declare function filterTreeSelectNodes(nodes: AbcTreeSelectNode[], keyword: string, filterProp?: 'title' | 'value' | 'both'): {
    filteredNodes: AbcTreeSelectNode[];
    autoExpandedKeys: Array<string | number>;
};
/**
 * 将当前处于展开链路上的可见树节点前序展平，直接驱动固定行高虚拟滚动与键盘焦点移动
 */
export declare function flattenVisibleTreeNodes(nodes: AbcTreeSelectNode[], expandedKeyStrSet: ReadonlySet<string>, isNodeExpandable?: (node: AbcTreeSelectNode) => boolean): AbcFlattenedTreeNode[];
//# sourceMappingURL=tree.d.ts.map