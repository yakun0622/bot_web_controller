/**
 * 纯函数无头列表重排与暂存顺序对账内核
 */
/**
 * 在不修改原数组的前提下，将 `fromIndex` 处元素移动至 `toIndex` 位置
 */
export declare function arrayMove<T>(items: ReadonlyArray<T>, fromIndex: number, toIndex: number): T[];
/**
 * 比对当前暂存列表与已持久化列表的顺序是否发生变更
 */
export declare function isOrderDirty<T>(committed: ReadonlyArray<T>, staged: ReadonlyArray<T>, getKey: (item: T) => string | number): boolean;
/**
 * 将服务端最新列表数据（含单条字段更新、新增项或已删除项）与本地暂存的排序 Key 序列合并对账：
 * - 已存在于暂存序列中的条目保留其暂存先后顺序，但内容更新为服务端最新对象；
 * - 服务端已被删除的条目自动剔除；
 * - 服务端新增的条目追加至末尾。
 */
export declare function reconcileStagedOrder<T>(committed: ReadonlyArray<T>, stagedKeys: ReadonlyArray<string | number>, getKey: (item: T) => string | number): T[];
//# sourceMappingURL=sortable.d.ts.map