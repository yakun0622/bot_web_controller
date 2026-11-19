/**
 * ABC Design 品牌色预设、密度档位与圆角规格定义
 * 提供 JS/TS 运行时访问与 CSS 自定义属性的一一映射
 */
/** 6 套企业级高对比度品牌色板 */
export const ABC_BRAND_PRESETS = {
    blue: {
        label: '科技蓝 (Blue)',
        swatch: '#2563eb',
        scale: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
        },
    },
    indigo: {
        label: '深邃靛 (Indigo)',
        swatch: '#4f46e5',
        scale: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
        },
    },
    violet: {
        label: '极光紫 (Violet)',
        swatch: '#7c3aed',
        scale: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
        },
    },
    emerald: {
        label: '翡翠绿 (Emerald)',
        swatch: '#059669',
        scale: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
            950: '#022c22',
        },
    },
    amber: {
        label: '琥珀金 (Amber)',
        swatch: '#d97706',
        scale: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
        },
    },
    rose: {
        label: '绯红 (Rose)',
        swatch: '#e11d48',
        scale: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
            700: '#be123c',
            800: '#9f1239',
            900: '#881337',
            950: '#4c0519',
        },
    },
};
/** 信息密度规格说明 */
export const ABC_DENSITY_PRESETS = {
    compact: {
        label: '紧凑 (30px)',
        controlHeightSm: '30px',
        controlHeightMd: '34px',
        cellPaddingY: '0.5rem',
    },
    default: {
        label: '标准企业 (34px)',
        controlHeightSm: '34px',
        controlHeightMd: '38px',
        cellPaddingY: '0.75rem',
    },
    comfortable: {
        label: '宽松舒适 (38px)',
        controlHeightSm: '38px',
        controlHeightMd: '42px',
        cellPaddingY: '0.95rem',
    },
};
/** 圆角档位规格说明 */
export const ABC_RADIUS_PRESETS = {
    none: { label: '直角硬朗 (0px)', controlRadius: '0px', panelRadius: '0px' },
    sm: { label: '微圆角 (6px)', controlRadius: '6px', panelRadius: '8px' },
    md: { label: '标准圆角 (8px)', controlRadius: '8px', panelRadius: '12px' },
    lg: { label: '柔和圆角 (12px)', controlRadius: '12px', panelRadius: '16px' },
};
/** 通用四档基础组件规格说明 */
export const ABC_SIZE_PRESETS = {
    xs: { label: '超小 xs', heightVar: 'var(--abc-control-h-xs)', fontSize: '12px' },
    sm: { label: '紧凑 sm', heightVar: 'var(--abc-control-h-sm)', fontSize: '12px' },
    md: { label: '标准 md', heightVar: 'var(--abc-control-h-md)', fontSize: '14px' },
    lg: { label: '宽松 lg', heightVar: 'var(--abc-control-h-lg)', fontSize: '14px' },
};
/** 统一四档组件微交互动效规格说明 */
export const ABC_MOTION_PRESETS = {
    none: { label: '静默无动效', description: '零动画即时反馈，无障碍极速模式', durationBase: '0ms' },
    subtle: { label: '克制微动', description: '轻量化高速阻尼，无回弹高效率', durationBase: '140ms' },
    smooth: { label: '丝滑阻尼', description: '标准企业级物理缓动曲线', durationBase: '220ms' },
    spring: { label: '灵动弹簧', description: '带物理过冲感的高阶弹性微交互', durationBase: '280ms' },
};
/** 视觉表面质感人格规格说明（区分内部高密度运营台与外部消费级/开发者云工作台） */
export const ABC_SURFACE_PRESETS = {
    enterprise: {
        label: '企业严谨 (Enterprise)',
        description: '纯平实色高对比画布与清晰实线边界，适合内部运营、审批与财务对账后台',
    },
    spotlight: {
        label: '消费聚光 (Spotlight)',
        description: '顶部品牌环境微光、黑曜石深邃暗色阶、1px 微高光描边与毛玻璃浮层，适合外部开发者与 SaaS 控制台',
    },
};
//# sourceMappingURL=presets.js.map