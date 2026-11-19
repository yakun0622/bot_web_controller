/**
 * ABC Design 品牌色预设、密度档位与圆角规格定义
 * 提供 JS/TS 运行时访问与 CSS 自定义属性的一一映射
 */
/** 支持的内置品牌主色标识 */
export type AbcBrandColor = 'blue' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose';
/** 颜色模式：亮色、暗色或跟随系统 */
export type AbcThemeMode = 'light' | 'dark' | 'system';
/** 实际解析生效的明暗模式 */
export type AbcResolvedTheme = 'light' | 'dark';
/** 界面信息密度档位 */
export type AbcDensity = 'compact' | 'default' | 'comfortable';
/** 通用基础组件四档尺寸规格 */
export type AbcSize = 'xs' | 'sm' | 'md' | 'lg';
/** 统一组件四档交互动效规格 */
export type AbcMotionPreset = 'none' | 'subtle' | 'smooth' | 'spring';
/** 圆角视觉风格档位 */
export type AbcRadius = 'none' | 'sm' | 'md' | 'lg';
/** 页面切换过渡动效类型 */
export type AbcPageTransition = 'fade-slide' | 'fade' | 'zoom' | 'slide-left' | 'none';
/** 全局字号缩放档位 */
export type AbcFontScale = 'sm' | 'md' | 'lg';
/** 无障碍与特殊视觉色彩模式 */
export type AbcVisualMode = 'default' | 'color-weak' | 'gray';
/** 视觉表面质感人格档位：enterprise（内部运营严谨实色态） | spotlight（外部消费/开发者云产品聚光微光态） */
export type AbcSurfaceProfile = 'enterprise' | 'spotlight';
/** 品牌色板阶梯结构 */
export interface AbcPaletteScale {
    label: string;
    swatch: string;
    scale: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        950: string;
    };
}
/** 6 套企业级高对比度品牌色板 */
export declare const ABC_BRAND_PRESETS: Record<AbcBrandColor, AbcPaletteScale>;
/** 信息密度规格说明 */
export declare const ABC_DENSITY_PRESETS: Record<AbcDensity, {
    label: string;
    controlHeightSm: string;
    controlHeightMd: string;
    cellPaddingY: string;
}>;
/** 圆角档位规格说明 */
export declare const ABC_RADIUS_PRESETS: Record<AbcRadius, {
    label: string;
    controlRadius: string;
    panelRadius: string;
}>;
/** 通用四档基础组件规格说明 */
export declare const ABC_SIZE_PRESETS: Record<AbcSize, {
    label: string;
    heightVar: string;
    fontSize: string;
}>;
/** 统一四档组件微交互动效规格说明 */
export declare const ABC_MOTION_PRESETS: Record<AbcMotionPreset, {
    label: string;
    description: string;
    durationBase: string;
}>;
/** 视觉表面质感人格规格说明（区分内部高密度运营台与外部消费级/开发者云工作台） */
export declare const ABC_SURFACE_PRESETS: Record<AbcSurfaceProfile, {
    label: string;
    description: string;
}>;
//# sourceMappingURL=presets.d.ts.map