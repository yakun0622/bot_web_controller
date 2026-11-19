/**
 * 纯函数无头列表重排与暂存顺序对账内核
 */
/**
 * 在不修改原数组的前提下，将 `fromIndex` 处元素移动至 `toIndex` 位置
 */
export function arrayMove(items, fromIndex, toIndex) {
    const len = items.length;
    if (len <= 1 ||
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= len ||
        toIndex < 0 ||
        toIndex >= len) {
        return items.slice();
    }
    const next = items.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}
/**
 * 比对当前暂存列表与已持久化列表的顺序是否发生变更
 */
export function isOrderDirty(committed, staged, getKey) {
    if (committed.length !== staged.length)
        return true;
    for (let i = 0; i < committed.length; i += 1) {
        if (String(getKey(committed[i])) !== String(getKey(staged[i]))) {
            return true;
        }
    }
    return false;
}
/**
 * 将服务端最新列表数据（含单条字段更新、新增项或已删除项）与本地暂存的排序 Key 序列合并对账：
 * - 已存在于暂存序列中的条目保留其暂存先后顺序，但内容更新为服务端最新对象；
 * - 服务端已被删除的条目自动剔除；
 * - 服务端新增的条目追加至末尾。
 */
export function reconcileStagedOrder(committed, stagedKeys, getKey) {
    if (stagedKeys.length === 0) {
        return committed.slice();
    }
    const byKey = new Map();
    for (const item of committed) {
        byKey.set(String(getKey(item)), item);
    }
    const result = [];
    const visited = new Set();
    for (const rawKey of stagedKeys) {
        const key = String(rawKey);
        if (visited.has(key))
            continue;
        const found = byKey.get(key);
        if (found !== undefined) {
            result.push(found);
            visited.add(key);
        }
    }
    for (const item of committed) {
        const key = String(getKey(item));
        if (!visited.has(key)) {
            result.push(item);
            visited.add(key);
        }
    }
    return result;
}
//# sourceMappingURL=sortable.js.map