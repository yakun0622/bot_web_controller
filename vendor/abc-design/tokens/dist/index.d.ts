import { ABC_BRAND_PRESETS, ABC_DENSITY_PRESETS, ABC_MOTION_PRESETS, ABC_RADIUS_PRESETS, ABC_SIZE_PRESETS, ABC_SURFACE_PRESETS, type AbcBrandColor, type AbcDensity, type AbcFontScale, type AbcMotionPreset, type AbcPageTransition, type AbcPaletteScale, type AbcRadius, type AbcResolvedTheme, type AbcSize, type AbcSurfaceProfile, type AbcThemeMode, type AbcVisualMode } from './presets';
export { ABC_BRAND_PRESETS, ABC_DENSITY_PRESETS, ABC_MOTION_PRESETS, ABC_RADIUS_PRESETS, ABC_SIZE_PRESETS, ABC_SURFACE_PRESETS, type AbcBrandColor, type AbcDensity, type AbcFontScale, type AbcMotionPreset, type AbcPageTransition, type AbcPaletteScale, type AbcRadius, type AbcResolvedTheme, type AbcSize, type AbcSurfaceProfile, type AbcThemeMode, type AbcVisualMode, };
/** 主题引擎完整配置对象 */
export interface AbcThemeConfig {
    mode: AbcThemeMode;
    brand: AbcBrandColor;
    density: AbcDensity;
    radius: AbcRadius;
    /** 视觉表面质感人格：'enterprise'（内部运营后台默认） | 'spotlight'（外部开发者/消费级云工作台） */
    surface?: AbcSurfaceProfile;
    /** 可选自定义任意 HEX 品牌色（如 '#0ea5e9'），设置后通过 color-mix 自动合成 50-950 全色阶 */
    customBrandColor?: string;
    /** 全局字号缩放比例（默认 'md'） */
    fontScale?: AbcFontScale;
    /** 特殊视觉/无障碍模式（默认 'default'） */
    visualMode?: AbcVisualMode;
    /** 全局基础组件默认尺寸覆盖（不设置时各组件维持各自语义默认值，显式设置后统一接管未传局部 size 的基础组件） */
    componentSize?: AbcSize;
    /** 全局组件交互动效规格（默认 'smooth'） */
    motion?: AbcMotionPreset;
}
/** 默认企业级主题配置 */
export declare const DEFAULT_ABC_THEME: AbcThemeConfig;
/** 根据用户选择的 mode 与系统偏好解析当前实际生效的明暗态 */
export declare function resolveAbcThemeMode(mode: AbcThemeMode): AbcResolvedTheme;
/** 将主题 Token 配置写入根文档节点属性 */
export declare function applyAbcThemeToDocument(config: AbcThemeConfig): AbcResolvedTheme;
/**
 * 支持 View Transitions API 圆形扩散遮罩动画的主题切换执行器
 * 在不支持 View Transitions 或用户开启减少动态效果偏好时自动无感降级
 */
export declare function transitionAbcTheme(applyFn: () => void, origin?: {
    clientX: number;
    clientY: number;
}): void;
//# sourceMappingURL=index.d.ts.map