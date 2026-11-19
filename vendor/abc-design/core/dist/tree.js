import { matchKeywordWithPinyin } from './pinyin.js';
/** 递归收集节点及其全部未禁用后代节点的 key */
function collectDescendantKeys(node, out = []) {
    if (!node.disabled) {
        out.push(node.key);
    }
    if (node.children) {
        for (const child of node.children) {
            collectDescendantKeys(child, out);
        }
    }
    return out;
}
/**
 * 计算树形结构在级联模式下的精确选中集与半选（indeterminate）祖先集
 */
export function computeTreeCheckState(nodes, rawCheckedKeys, checkStrictly = false) {
    const checkedSet = new Set(rawCheckedKeys);
    const halfCheckedSet = new Set();
    if (checkStrictly) {
        return {
            checkedKeys: Array.from(checkedSet),
            halfCheckedKeys: [],
        };
    }
    function visit(node) {
        if (!node.children || node.children.length === 0) {
            const isChecked = checkedSet.has(node.key);
            return { allChecked: isChecked, someChecked: isChecked };
        }
        const enabledChildren = node.children.filter((c) => !c.disabled);
        if (enabledChildren.length === 0) {
            const isChecked = checkedSet.has(node.key);
            return { allChecked: isChecked, someChecked: isChecked };
        }
        let all = true;
        let some = false;
        for (const child of enabledChildren) {
            const res = visit(child);
            if (!res.allChecked)
                all = false;
            if (res.someChecked)
                some = true;
        }
        if (all) {
            checkedSet.add(node.key);
            halfCheckedSet.delete(node.key);
        }
        else if (some) {
            checkedSet.delete(node.key);
            halfCheckedSet.add(node.key);
        }
        else {
            checkedSet.delete(node.key);
            halfCheckedSet.delete(node.key);
        }
        return { allChecked: all, someChecked: some };
    }
    for (const root of nodes) {
        visit(root);
    }
    return {
        checkedKeys: Array.from(checkedSet),
        halfCheckedKeys: Array.from(halfCheckedSet),
    };
}
/**
 * 切换指定树节点的勾选状态，并在非严格模式下自动级联更新子孙与祖先节点状态
 */
export function toggleTreeNodeChecked(nodes, currentCheckedKeys, targetNode, nextChecked, checkStrictly = false) {
    const nextSet = new Set(currentCheckedKeys);
    if (checkStrictly) {
        if (nextChecked)
            nextSet.add(targetNode.key);
        else
            nextSet.delete(targetNode.key);
        return { checkedKeys: Array.from(nextSet), halfCheckedKeys: [] };
    }
    const affected = collectDescendantKeys(targetNode);
    for (const k of affected) {
        if (nextChecked)
            nextSet.add(k);
        else
            nextSet.delete(k);
    }
    return computeTreeCheckState(nodes, Array.from(nextSet), false);
}
/**
 * 按关键字（含拼音首字母）过滤树形结构，并自动保留命中节点的祖先路径及需要自动展开的 key 列表
 */
export function filterTreeNodes(nodes, keyword) {
    const kw = keyword.trim();
    if (!kw) {
        return { filteredNodes: nodes, autoExpandedKeys: [] };
    }
    const expanded = [];
    function walk(list) {
        const out = [];
        for (const node of list) {
            const childMatches = node.children ? walk(node.children) : [];
            const selfMatches = matchKeywordWithPinyin(node.title, kw);
            if (selfMatches || childMatches.length > 0) {
                if (childMatches.length > 0) {
                    expanded.push(node.key);
                }
                out.push({
                    ...node,
                    children: childMatches.length > 0 ? childMatches : node.children && selfMatches ? node.children : undefined,
                });
            }
        }
        return out;
    }
    return {
        filteredNodes: walk(nodes),
        autoExpandedKeys: expanded,
    };
}
/** 提取整棵树的全部可展开父节点 key（用于“展开全部”） */
export function collectAllExpandableKeys(nodes) {
    const keys = [];
    function walk(list) {
        for (const n of list) {
            if (n.children && n.children.length > 0) {
                keys.push(n.key);
                walk(n.children);
            }
        }
    }
    walk(nodes);
    return keys;
}
function extractNodeText(raw, labelKey, fallbackValue) {
    const candidate = raw[labelKey] !== undefined
        ? raw[labelKey]
        : raw.label !== undefined
            ? raw.label
            : raw.title;
    if (typeof candidate === 'string' || typeof candidate === 'number') {
        return { title: String(candidate), rawLabel: candidate };
    }
    if (typeof raw.title === 'string' || typeof raw.title === 'number') {
        return { title: String(raw.title), rawLabel: candidate ?? raw.title };
    }
    return { title: String(fallbackValue), rawLabel: candidate ?? String(fallbackValue) };
}
/**
 * 将嵌套 treeData（含自定义 fieldNames）或扁平 simpleMode 数组归一化为标准树形索引结构
 */
export function normalizeTreeSelectData(rawData = [], options) {
    const fieldNames = options?.fieldNames ?? {};
    const labelField = fieldNames.label ?? 'label';
    const valueField = fieldNames.value ?? 'value';
    const childrenField = fieldNames.children ?? 'children';
    const nodeMap = new Map();
    const parentMap = new Map();
    const simpleModeCfg = options?.treeDataSimpleMode;
    if (simpleModeCfg) {
        const idKey = (typeof simpleModeCfg === 'object' ? simpleModeCfg.id : undefined) ?? 'id';
        const pIdKey = (typeof simpleModeCfg === 'object' ? simpleModeCfg.pId : undefined) ?? 'pId';
        const rootPId = typeof simpleModeCfg === 'object' && 'rootPId' in simpleModeCfg ? simpleModeCfg.rootPId : null;
        const entries = [];
        const idMap = new Map();
        rawData.forEach((raw, idx) => {
            const idVal = raw[valueField] !== undefined
                ? raw[valueField]
                : raw[idKey] !== undefined
                    ? raw[idKey]
                    : raw.value !== undefined
                        ? raw.value
                        : raw.key !== undefined
                            ? raw.key
                            : idx;
            const normalizedVal = typeof idVal === 'string' || typeof idVal === 'number' ? idVal : String(idVal ?? idx);
            const { title, rawLabel } = extractNodeText(raw, labelField, normalizedVal);
            const idFieldVal = raw[idKey] !== undefined ? raw[idKey] : normalizedVal;
            const pIdRaw = raw[pIdKey];
            const node = {
                key: normalizedVal,
                value: normalizedVal,
                title,
                rawLabel,
                disabled: Boolean(raw.disabled),
                selectable: raw.selectable,
                checkable: raw.checkable,
                isLeaf: raw.isLeaf,
                icon: typeof raw.icon === 'string' ? raw.icon : undefined,
                badge: typeof raw.badge === 'string' || typeof raw.badge === 'number' ? raw.badge : undefined,
                raw,
            };
            const idStr = String(idFieldVal);
            const nodeKeyStr = String(node.key);
            nodeMap.set(nodeKeyStr, node);
            const entry = {
                idStr,
                pIdRaw,
                pIdStr: pIdRaw === null || pIdRaw === undefined || pIdRaw === '' ? null : String(pIdRaw),
                node,
            };
            entries.push(entry);
            idMap.set(idStr, entry);
        });
        const roots = [];
        const rootPIdStr = rootPId === null || rootPId === undefined ? null : String(rootPId);
        for (const entry of entries) {
            const parentEntry = entry.pIdStr !== null && entry.pIdStr !== rootPIdStr ? idMap.get(entry.pIdStr) : undefined;
            // 防范自指向或祖先环：仅当父节点存在且不指向自身时挂入父节点 children
            if (parentEntry && parentEntry !== entry) {
                if (!parentEntry.node.children) {
                    parentEntry.node.children = [];
                }
                parentEntry.node.children.push(entry.node);
                parentMap.set(String(entry.node.key), String(parentEntry.node.key));
            }
            else {
                roots.push(entry.node);
                parentMap.set(String(entry.node.key), null);
            }
        }
        return { treeNodes: roots, nodeMap, parentMap };
    }
    function convertList(list, parentKeyStr, pathPrefix) {
        return list.map((raw, idx) => {
            const hasCustomVal = fieldNames.value !== undefined && raw[valueField] !== undefined;
            const rawVal = hasCustomVal
                ? raw[valueField]
                : raw.value !== undefined
                    ? raw.value
                    : raw.key !== undefined
                        ? raw.key
                        : `${pathPrefix}-${idx}`;
            const normalizedVal = typeof rawVal === 'string' || typeof rawVal === 'number' ? rawVal : String(rawVal);
            const { title, rawLabel } = extractNodeText(raw, labelField, normalizedVal);
            const keyStr = String(normalizedVal);
            const rawChildren = raw[childrenField] ?? raw.children;
            const children = Array.isArray(rawChildren)
                ? convertList(rawChildren, keyStr, `${pathPrefix}-${idx}`)
                : undefined;
            const node = {
                key: normalizedVal,
                value: normalizedVal,
                title,
                rawLabel,
                disabled: Boolean(raw.disabled),
                selectable: raw.selectable,
                checkable: raw.checkable,
                isLeaf: raw.isLeaf,
                icon: typeof raw.icon === 'string' ? raw.icon : undefined,
                badge: typeof raw.badge === 'string' || typeof raw.badge === 'number' ? raw.badge : undefined,
                children,
                raw,
            };
            nodeMap.set(keyStr, node);
            parentMap.set(keyStr, parentKeyStr);
            return node;
        });
    }
    const treeNodes = convertList(rawData, null, 'root');
    return { treeNodes, nodeMap, parentMap };
}
function collectSeedKeysFromParent(node, out) {
    if (!node.disabled && node.checkable !== false) {
        out.push(node.key);
    }
    if (node.children) {
        for (const child of node.children) {
            collectSeedKeysFromParent(child, out);
        }
    }
}
/**
 * 从外部受控 value 解析完整的复选态（含父节点 value 自动向下传播子孙与半选态推导）
 */
export function resolveTreeCheckedStateFromValue(nodes, valueKeys, checkStrictly = false) {
    const inputStrSet = new Set(valueKeys.map((k) => String(k)));
    if (checkStrictly) {
        const matchedInTree = new Set();
        const resolved = [];
        function walkStrict(list) {
            for (const node of list) {
                const keyStr = String(node.key);
                if (inputStrSet.has(keyStr) && !matchedInTree.has(keyStr)) {
                    matchedInTree.add(keyStr);
                    resolved.push(node.key);
                }
                if (node.children)
                    walkStrict(node.children);
            }
        }
        walkStrict(nodes);
        // 保留异步懒加载尚未挂载入树的外部受控 key
        for (const ext of valueKeys) {
            if (!matchedInTree.has(String(ext))) {
                resolved.push(ext);
            }
        }
        return { checkedKeys: resolved, halfCheckedKeys: [] };
    }
    const expandedSeedKeys = [];
    const matchedInTree = new Set();
    function propagateDown(list) {
        for (const node of list) {
            const keyStr = String(node.key);
            if (inputStrSet.has(keyStr) && !node.disabled && node.checkable !== false) {
                matchedInTree.add(keyStr);
                collectSeedKeysFromParent(node, expandedSeedKeys);
            }
            else if (node.children && node.children.length > 0) {
                propagateDown(node.children);
            }
        }
    }
    propagateDown(nodes);
    const state = computeTreeCheckState(nodes, expandedSeedKeys, false);
    // 保留暂未进入当前树视图（例如未加载的异步子节点）的受控 key，防止外部值丢失
    const resultStrSet = new Set(state.checkedKeys.map((k) => String(k)));
    const externalKeys = [];
    for (const ext of valueKeys) {
        const extStr = String(ext);
        if (!matchedInTree.has(extStr) && !resultStrSet.has(extStr)) {
            // 只有当节点完全不在当前树中时才保留
            let foundInTree = false;
            function existsInTree(list) {
                for (const n of list) {
                    if (String(n.key) === extStr)
                        return true;
                    if (n.children && existsInTree(n.children))
                        return true;
                }
                return false;
            }
            foundInTree = existsInTree(nodes);
            if (!foundInTree) {
                externalKeys.push(ext);
            }
        }
    }
    return {
        checkedKeys: [...state.checkedKeys, ...externalKeys],
        halfCheckedKeys: state.halfCheckedKeys,
    };
}
/**
 * 按指定策略（SHOW_ALL / SHOW_PARENT / SHOW_CHILD）收敛全选节点集合为对外输出数组
 */
export function formatTreeCheckedStrategy(nodes, checkedKeys, strategy = 'SHOW_ALL', checkStrictly = false) {
    const checkedStrSet = new Set(checkedKeys.map((k) => String(k)));
    const seenOutput = new Set();
    const output = [];
    const knownTreeKeys = new Set();
    function collectKnown(list) {
        for (const n of list) {
            knownTreeKeys.add(String(n.key));
            if (n.children)
                collectKnown(n.children);
        }
    }
    collectKnown(nodes);
    if (checkStrictly || strategy === 'SHOW_ALL') {
        function walkAll(list) {
            for (const n of list) {
                const keyStr = String(n.key);
                if (checkedStrSet.has(keyStr) && !seenOutput.has(keyStr)) {
                    seenOutput.add(keyStr);
                    output.push(n.key);
                }
                if (n.children)
                    walkAll(n.children);
            }
        }
        walkAll(nodes);
    }
    else if (strategy === 'SHOW_PARENT') {
        function walkParent(list) {
            for (const n of list) {
                const keyStr = String(n.key);
                if (!n.disabled && n.checkable !== false && checkedStrSet.has(keyStr)) {
                    if (!seenOutput.has(keyStr)) {
                        seenOutput.add(keyStr);
                        output.push(n.key);
                    }
                    continue;
                }
                if (n.children && n.children.length > 0) {
                    walkParent(n.children);
                }
            }
        }
        walkParent(nodes);
    }
    else {
        // SHOW_CHILD：仅收敛输出没有可用子节点的末级选中节点
        function walkChild(list) {
            for (const n of list) {
                const enabledChildren = (n.children ?? []).filter((c) => !c.disabled && c.checkable !== false);
                if (enabledChildren.length === 0) {
                    const keyStr = String(n.key);
                    if (!n.disabled &&
                        n.checkable !== false &&
                        checkedStrSet.has(keyStr) &&
                        !seenOutput.has(keyStr)) {
                        seenOutput.add(keyStr);
                        output.push(n.key);
                    }
                }
                else {
                    walkChild(n.children ?? []);
                }
            }
        }
        walkChild(nodes);
    }
    for (const key of checkedKeys) {
        const keyStr = String(key);
        if (!knownTreeKeys.has(keyStr) && !seenOutput.has(keyStr)) {
            seenOutput.add(keyStr);
            output.push(key);
        }
    }
    return output;
}
/**
 * 过滤归一化后的 TreeSelect 节点，支持按标题（含拼音首字母）与节点值匹配并自动推导需展开祖先 key
 */
export function filterTreeSelectNodes(nodes, keyword, filterProp = 'both') {
    const kw = keyword.trim();
    if (!kw) {
        return { filteredNodes: nodes, autoExpandedKeys: [] };
    }
    const kwLower = kw.toLowerCase();
    const expanded = [];
    function walk(list) {
        const out = [];
        for (const node of list) {
            const childMatches = node.children ? walk(node.children) : [];
            const titleMatch = filterProp !== 'value' && matchKeywordWithPinyin(node.title, kw);
            const valueMatch = filterProp !== 'title' && String(node.value).toLowerCase().includes(kwLower);
            if (titleMatch || valueMatch || childMatches.length > 0) {
                if (childMatches.length > 0) {
                    expanded.push(node.key);
                }
                out.push({
                    ...node,
                    children: childMatches.length > 0
                        ? childMatches
                        : node.children && (titleMatch || valueMatch)
                            ? node.children
                            : undefined,
                });
            }
        }
        return out;
    }
    return {
        filteredNodes: walk(nodes),
        autoExpandedKeys: expanded,
    };
}
/**
 * 将当前处于展开链路上的可见树节点前序展平，直接驱动固定行高虚拟滚动与键盘焦点移动
 */
export function flattenVisibleTreeNodes(nodes, expandedKeyStrSet, isNodeExpandable) {
    const result = [];
    function walk(list, depth, parentKey) {
        const setSize = list.length;
        list.forEach((node, idx) => {
            const keyStr = String(node.key);
            const hasChildren = isNodeExpandable
                ? isNodeExpandable(node)
                : Boolean(node.children && node.children.length > 0);
            const isExpanded = hasChildren && expandedKeyStrSet.has(keyStr);
            result.push({
                node,
                keyStr,
                depth,
                posInSet: idx + 1,
                setSize,
                hasChildren,
                isExpanded,
                parentKey,
            });
            if (isExpanded && node.children && node.children.length > 0) {
                walk(node.children, depth + 1, node.key);
            }
        });
    }
    walk(nodes, 0, null);
    return result;
}
//# sourceMappingURL=tree.js.map