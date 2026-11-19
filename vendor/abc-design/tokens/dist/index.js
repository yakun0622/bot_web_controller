import { ABC_BRAND_PRESETS, ABC_DENSITY_PRESETS, ABC_MOTION_PRESETS, ABC_RADIUS_PRESETS, ABC_SIZE_PRESETS, ABC_SURFACE_PRESETS, } from './presets';
export { ABC_BRAND_PRESETS, ABC_DENSITY_PRESETS, ABC_MOTION_PRESETS, ABC_RADIUS_PRESETS, ABC_SIZE_PRESETS, ABC_SURFACE_PRESETS, };
/** 默认企业级主题配置 */
export const DEFAULT_ABC_THEME = {
    mode: 'system',
    brand: 'blue',
    density: 'default',
    radius: 'md',
    surface: 'enterprise',
    fontScale: 'md',
    visualMode: 'default',
    motion: 'smooth',
};
const BRAND_SCALE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
/** 基于单一 HEX 品牌主色动态推导 50-950 语义色阶并注入根元素内联变量 */
function syncCustomBrandScale(root, hex) {
    const trimmed = hex?.trim();
    if (!trimmed || !/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
        for (const stop of BRAND_SCALE_STOPS) {
            root.style.removeProperty(`--abc-brand-${stop}`);
        }
        return;
    }
    const mixMap = {
        50: `color-mix(in srgb, ${trimmed} 8%, #ffffff)`,
        100: `color-mix(in srgb, ${trimmed} 16%, #ffffff)`,
        200: `color-mix(in srgb, ${trimmed} 30%, #ffffff)`,
        300: `color-mix(in srgb, ${trimmed} 48%, #ffffff)`,
        400: `color-mix(in srgb, ${trimmed} 70%, #ffffff)`,
        500: `color-mix(in srgb, ${trimmed} 88%, #ffffff)`,
        600: trimmed,
        700: `color-mix(in srgb, ${trimmed} 84%, #020617)`,
        800: `color-mix(in srgb, ${trimmed} 68%, #020617)`,
        900: `color-mix(in srgb, ${trimmed} 52%, #020617)`,
        950: `color-mix(in srgb, ${trimmed} 34%, #020617)`,
    };
    for (const stop of BRAND_SCALE_STOPS) {
        root.style.setProperty(`--abc-brand-${stop}`, mixMap[stop]);
    }
}
/** 根据用户选择的 mode 与系统偏好解析当前实际生效的明暗态 */
export function resolveAbcThemeMode(mode) {
    if (mode === 'light' || mode === 'dark')
        return mode;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}
/** 同步更新 head 中的 <meta name="color-scheme"> 原生提示 */
function syncColorSchemeMeta(mode) {
    if (typeof document === 'undefined')
        return;
    const contentValue = mode === 'system' ? 'light dark' : mode;
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'color-scheme';
        document.head.prepend(meta);
    }
    if (meta.content !== contentValue) {
        meta.content = contentValue;
    }
}
/** 将主题 Token 配置写入根文档节点属性 */
export function applyAbcThemeToDocument(config) {
    const resolved = resolveAbcThemeMode(config.mode);
    if (typeof document === 'undefined')
        return resolved;
    const root = document.documentElement;
    syncColorSchemeMeta(config.mode);
    root.setAttribute('data-abc-theme', resolved);
    root.setAttribute('data-abc-theme-mode', config.mode);
    root.setAttribute('data-abc-brand', config.brand);
    root.setAttribute('data-abc-density', config.density);
    root.setAttribute('data-abc-radius', config.radius);
    root.setAttribute('data-abc-surface', config.surface ?? 'enterprise');
    root.setAttribute('data-abc-font-scale', config.fontScale ?? 'md');
    root.setAttribute('data-abc-visual', config.visualMode ?? 'default');
    root.setAttribute('data-abc-size', config.componentSize ?? 'sm');
    root.setAttribute('data-abc-motion', config.motion ?? 'smooth');
    root.classList.toggle('dark', resolved === 'dark');
    syncCustomBrandScale(root, config.customBrandColor);
    return resolved;
}
/**
 * 支持 View Transitions API 圆形扩散遮罩动画的主题切换执行器
 * 在不支持 View Transitions 或用户开启减少动态效果偏好时自动无感降级
 */
export function transitionAbcTheme(applyFn, origin) {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        applyFn();
        return;
    }
    const docWithTransition = document;
    const prefersReduced = typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!origin || typeof docWithTransition.startViewTransition !== 'function' || prefersReduced) {
        applyFn();
        return;
    }
    const x = origin.clientX;
    const y = origin.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = docWithTransition.startViewTransition(() => {
        applyFn();
    });
    transition.ready
        .then(() => {
        document.documentElement.animate({
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        }, {
            duration: 380,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
        });
    })
        .catch(() => {
        // View Transition 被中断时保持最终状态即可，不吞掉业务错误
    });
}
//# sourceMappingURL=index.js.map