const VALID_IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
/**
 * 解析任意 data 输入：支持原值透传与可选字符串 JSON.parse（含空串与异常兜底）
 */
export function parseJsonTreeInput(data, parseString = true) {
    if (data === undefined) {
        return { ok: true, value: undefined, isEmptyInput: true };
    }
    if (typeof data === 'string') {
        if (!parseString) {
            return { ok: true, value: data, isEmptyInput: data.length === 0 };
        }
        const trimmed = data.trim();
        if (trimmed === '') {
            return { ok: true, value: undefined, isEmptyInput: true };
        }
        try {
            const parsed = JSON.parse(trimmed);
            return { ok: true, value: parsed, isEmptyInput: false };
        }
        catch (err) {
            return {
                ok: false,
                error: err instanceof Error ? err.message : 'JSON 解析失败',
                raw: data,
            };
        }
    }
    return { ok: true, value: data, isEmptyInput: false };
}
/**
 * 判定 JSON 节点语义类型
 */
export function getJsonValueType(value) {
    if (value === null || value === undefined)
        return 'null';
    if (Array.isArray(value))
        return 'array';
    const t = typeof value;
    if (t === 'string')
        return 'string';
    if (t === 'number')
        return 'number';
    if (t === 'boolean')
        return 'boolean';
    if (t === 'object')
        return 'object';
    return 'string';
}
/**
 * 将路径段格式化为标准 JSONPath（$.a.b[0]["x.y"]）或点路径（a.b[0]["x.y"]）
 */
export function formatJsonPath(segments, format = 'jsonpath') {
    if (segments.length === 0) {
        return '$';
    }
    if (format === 'dot') {
        let out = '';
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (typeof seg === 'number') {
                out += `[${seg}]`;
            }
            else if (VALID_IDENTIFIER_RE.test(seg)) {
                out += i === 0 ? seg : `.${seg}`;
            }
            else {
                out += `[${JSON.stringify(seg)}]`;
            }
        }
        return out;
    }
    let out = '$';
    for (const seg of segments) {
        if (typeof seg === 'number') {
            out += `[${seg}]`;
        }
        else if (VALID_IDENTIFIER_RE.test(seg)) {
            out += `.${seg}`;
        }
        else {
            out += `[${JSON.stringify(seg)}]`;
        }
    }
    return out;
}
function isPlainContainer(value) {
    return value !== null && typeof value === 'object';
}
/**
 * 序列化单个节点值用于剪贴板复制（内置循环引用与 BigInt 保护）
 */
export function formatJsonCopyValue(value, indent = 2) {
    if (typeof value === 'string')
        return value;
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
    const ancestors = [];
    try {
        const serialized = JSON.stringify(value, function (_key, val) {
            if (typeof val === 'bigint') {
                return val.toString();
            }
            if (isPlainContainer(val)) {
                const parentIdx = ancestors.indexOf(this);
                if (parentIdx !== -1) {
                    ancestors.length = parentIdx + 1;
                }
                else if (ancestors.length === 0 && typeof this === 'object' && this !== null) {
                    ancestors.push(this);
                }
                if (ancestors.includes(val)) {
                    return '[Circular]';
                }
                ancestors.push(val);
            }
            return val;
        }, indent);
        return serialized ?? String(value);
    }
    catch {
        return String(value);
    }
}
/**
 * 收集指定深度内的可展开容器路径（供 defaultExpandDepth 与“全部展开”使用）
 */
export function collectJsonExpandablePaths(root, options = {}) {
    const { maxDepth = Infinity, maxNodes = 5000 } = options;
    if (maxDepth <= 0 || !isPlainContainer(root))
        return [];
    const paths = [];
    let visited = 0;
    const activeAncestors = new Set();
    const walk = (node, segments, depth) => {
        if (visited >= maxNodes || depth >= maxDepth || !isPlainContainer(node))
            return;
        if (activeAncestors.has(node))
            return;
        const entries = Array.isArray(node)
            ? node.map((v, i) => [i, v])
            : Object.entries(node);
        if (entries.length === 0)
            return;
        paths.push(formatJsonPath(segments, 'jsonpath'));
        visited += 1;
        activeAncestors.add(node);
        for (const [key, child] of entries) {
            if (visited >= maxNodes)
                break;
            if (isPlainContainer(child)) {
                walk(child, [...segments, key], depth + 1);
            }
        }
        activeAncestors.delete(node);
    };
    walk(root, [], 0);
    return paths;
}
/**
 * 检索 JSON 树中匹配关键字的节点路径、可见路径集合与需自动展开的祖先容器路径
 */
export function searchJsonTree(root, query, options = {}) {
    const matchedPaths = new Set();
    const visiblePaths = new Set();
    const autoExpandedPaths = new Set();
    const needle = query.trim().toLowerCase();
    if (!needle || root === undefined) {
        return { matchedPaths, visiblePaths, autoExpandedPaths, matchCount: 0, truncated: false };
    }
    const { maxDepth = 20, maxVisitedNodes = 20000 } = options;
    let visited = 0;
    let truncated = false;
    const activeAncestors = new Set();
    const markMatch = (path, ancestorPaths) => {
        matchedPaths.add(path);
        visiblePaths.add(path);
        for (const anc of ancestorPaths) {
            visiblePaths.add(anc);
            autoExpandedPaths.add(anc);
        }
    };
    const walk = (node, keyName, segments, ancestorPaths, depth) => {
        if (depth > maxDepth)
            return;
        // 根节点不占用子节点配额，避免刚好等于 maxVisitedNodes 规模时漏检末尾节点
        if (depth > 0) {
            if (visited >= maxVisitedNodes) {
                truncated = true;
                return;
            }
            visited += 1;
        }
        const currentPath = formatJsonPath(segments, 'jsonpath');
        const keyMatched = keyName !== null && String(keyName).toLowerCase().includes(needle);
        if (!isPlainContainer(node)) {
            const valText = node === null ? 'null' : node === undefined ? 'undefined' : String(node);
            const valueMatched = valText.toLowerCase().includes(needle);
            if (keyMatched || valueMatched) {
                markMatch(currentPath, ancestorPaths);
            }
            return;
        }
        if (keyMatched) {
            markMatch(currentPath, ancestorPaths);
        }
        if (activeAncestors.has(node) || depth >= maxDepth)
            return;
        activeAncestors.add(node);
        const nextAncestors = [...ancestorPaths, currentPath];
        if (Array.isArray(node)) {
            for (let i = 0; i < node.length; i++) {
                if (visited >= maxVisitedNodes) {
                    truncated = true;
                    break;
                }
                walk(node[i], i, [...segments, i], nextAncestors, depth + 1);
            }
        }
        else {
            for (const [k, v] of Object.entries(node)) {
                if (visited >= maxVisitedNodes) {
                    truncated = true;
                    break;
                }
                walk(v, k, [...segments, k], nextAncestors, depth + 1);
            }
        }
        activeAncestors.delete(node);
    };
    walk(root, null, [], [], 0);
    return {
        matchedPaths,
        visiblePaths,
        autoExpandedPaths,
        matchCount: matchedPaths.size,
        truncated,
    };
}
//# sourceMappingURL=jsonTree.js.map