import { AbcBrandColor } from '@abc-design/tokens';
import { AbcCheckedStrategy } from '@abc-design/core';
import { AbcDensity } from '@abc-design/tokens';
import { AbcDiffKind } from '@abc-design/core';
import { AbcFieldDiffEntry } from '@abc-design/core';
import { AbcFontScale } from '@abc-design/tokens';
import { AbcJsonPathFormat } from '@abc-design/core';
import { AbcKeyValueEntry } from '@abc-design/core';
import { AbcKeyValueFormat } from '@abc-design/core';
import { AbcLineDiffEntry } from '@abc-design/core';
import { AbcMotionPreset } from '@abc-design/tokens';
import { AbcPageTransition } from '@abc-design/tokens';
import { AbcRadius } from '@abc-design/tokens';
import { AbcResolvedTheme } from '@abc-design/tokens';
import { AbcRuleCondition } from '@abc-design/core';
import { AbcRuleFieldSchema } from '@abc-design/core';
import { AbcRuleFieldType } from '@abc-design/core';
import { AbcRuleGroup } from '@abc-design/core';
import { AbcRuleOperator } from '@abc-design/core';
import { AbcRuleOperatorOption } from '@abc-design/core';
import { AbcSize } from '@abc-design/tokens';
import { AbcSurfaceProfile } from '@abc-design/tokens';
import { AbcThemeConfig } from '@abc-design/tokens';
import { AbcThemeMode } from '@abc-design/tokens';
import { AbcTreeFieldNames } from '@abc-design/core';
import { AbcTreeNode } from '@abc-design/core';
import { AbcTreeSelectNode } from '@abc-design/core';
import { AbcTreeSimpleModeConfig } from '@abc-design/core';
import { AbcVisualMode } from '@abc-design/tokens';
import { ClassValue } from 'clsx';
import { Component } from 'react';
import { default as default_2 } from 'react';
import { ErrorInfo } from 'react';
import { JSX } from 'react';
import { JSXElementConstructor } from 'react';
import { LucideIcon } from 'lucide-react';
import * as React_2 from 'react';
import { ReactElement } from 'react';
import { ReactNode } from 'react';
import { ReactPortal } from 'react';
import { RejectedTagItem } from '@abc-design/core';
import { TagRejectReason } from '@abc-design/core';

export declare const ABC_HEADER_HEIGHT_BY_SIZE: Record<AbcSize, number>;

/** 随全局四档尺寸联动的默认侧边栏宽度与顶栏高度对照表 */
export declare const ABC_SIDEBAR_WIDTH_BY_SIZE: Record<AbcSize, number>;

/** 品牌信息协议（支持多租户动态 Logo/SVG/项目名与快捷编辑回调） */
export declare interface AbcBrandInfo {
    name: string;
    subtitle?: string;
    /** 支持图片 URL、内联 <svg> 字符串或自定义 React 节点 */
    logo?: string | default_2.ReactNode;
    onClick?: () => void;
    onEditBrand?: () => void;
}

/** 验证码拉取适配器：由宿主接入后端 /get-captcha 接口，不传时 SliderVerify 自动启用内置矢量拼图挑战 */
export declare type AbcCaptchaAdapter = () => Promise<AbcCaptchaData>;

/** 滑块拼图验证码后端载荷数据结构 */
export declare interface AbcCaptchaData {
    nonceStr: string;
    blockSrc: string;
    blockY: number;
    canvasSrc: string;
}

export declare interface AbcColumn<T = any> {
    key: string;
    title: string;
    dataIndex?: (NoInfer<keyof T> & string) | string | string[];
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    fixed?: 'left' | 'right';
    sortable?: boolean;
    /** 兼容排序配置别名 */
    sorter?: boolean | ((a: T, b: T) => number);
    /** 表头问号提示文案 */
    tooltip?: default_2.ReactNode;
    /** 是否支持表头快速过滤 */
    filterable?: boolean;
    filterType?: 'text' | 'select';
    filterOptions?: SelectOption[];
    /** 内置格式化语义类型（未传自定义 render 时自动格式化） */
    valueType?: AbcColumnValueType;
    /** 扩展声明式列类型配置（支持字符串简写或对象精细化配置，如交互式行内 switch） */
    type?: AbcColumnValueType | AbcColumnTypeConfig<T>;
    /** 状态/枚举映射字典选项（未传自定义 render 时自动渲染 StatusTag） */
    options?: AbcColumnOption[];
    /** 点击单元格直接唤起详情查看回调（传字符串时可作为跳转路径透传） */
    linkToView?: boolean | string;
    /** 超长文本单行省略并展示悬浮完整值 */
    ellipsis?: boolean;
    /** 点击一键复制单元格内容 */
    copyable?: boolean;
    /** 是否默认显示该列（默认 true） */
    visible?: boolean;
    hideInTable?: boolean;
    /** 列与派生字段排序权重（数值越小越靠前） */
    order?: number;
    /** 单源列派生搜索配置 */
    search?: boolean | AbcColumnSearchConfig;
    /** 快捷开启列搜索别名 */
    searchable?: boolean;
    /** 单源列派生新增/编辑表单配置 */
    form?: boolean | AbcColumnFormConfig;
    /** 单源列是否在详情弹窗中显示（默认 true） */
    view?: boolean;
    /** 详情弹窗中的列跨度 */
    viewSpan?: 1 | 2;
    /** 详情弹窗自定义渲染函数 */
    viewRender?: (value: any, record: T) => default_2.ReactNode;
    render?: (value: any, record: T, index: number, meta?: AbcColumnRenderMeta) => default_2.ReactNode;
}

export declare interface AbcColumnFormConfig {
    key?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean | ((isEdit: any, form?: any) => boolean);
    hidden?: boolean | ((isEdit: boolean, form: any) => boolean);
    options?: Array<{
        label: default_2.ReactNode;
        value: string | number;
        disabled?: boolean;
    }> | ((form: any, isEdit: boolean) => Array<{
        label: default_2.ReactNode;
        value: string | number;
        disabled?: boolean;
    }>);
    searchable?: boolean;
    multiple?: boolean;
    span?: number;
    order?: number;
    tooltip?: default_2.ReactNode;
    defaultValue?: any;
    onChange?: (value: any, form: any) => void;
    onFormReady?: (form: any, isEdit: boolean) => void;
    render?: (form: any, isEdit: boolean) => default_2.ReactNode;
    [key: string]: any;
}

export declare interface AbcColumnOption {
    label: string;
    value: string | number | boolean;
    status?: StatusTone | 'error' | 'default';
    color?: string;
}

export declare interface AbcColumnRenderMeta {
    depth: number;
    rowIndex: number;
    isExpanded: boolean;
}

export declare interface AbcColumnSearchConfig {
    key?: string;
    label?: string;
    type?: 'input' | 'select' | 'date' | 'datetimePicker' | 'dateRange';
    placeholder?: string;
    options?: AbcColumnOption[];
    searchable?: boolean;
    multiple?: boolean;
    span?: number;
    order?: number;
    format?: string;
    clearable?: boolean;
    [key: string]: any;
}

export declare interface AbcColumnTypeConfig<T = Record<string, any>> {
    type: AbcColumnValueType;
    options?: AbcColumnOption[];
    format?: string;
    imageWidth?: number | string;
    imageHeight?: number | string;
    target?: '_blank' | '_self';
    progressColor?: string;
    checkedValue?: any;
    checkedChildren?: default_2.ReactNode;
    unCheckedChildren?: default_2.ReactNode;
    onChange?: (checked: boolean, record: T) => void | Promise<void>;
}

export declare type AbcColumnValueType = 'text' | 'status' | 'tag' | 'badge' | 'money' | 'number' | 'date' | 'datetime' | 'image' | 'progress' | 'code' | 'copy' | 'link' | 'switch';

/**
 * 命令式 Promise 确认框 API
 * 用法：const ok = await abcConfirm({ title: '确认删除', message: '删除后不可恢复', tone: 'danger' })
 */
export declare function abcConfirm(options: ConfirmOptions | string): Promise<boolean>;

/** 全局命令式确认弹窗挂载器（由 AbcProvider 默认自动挂载，自动防重复渲染） */
export declare const AbcConfirmHost: default_2.FC;

/** 主内容区宽度策略 */
export declare type AbcContentWidth = 'fluid' | 'fixed';

/** AbcProvider 上下文暴露的完整能力接口 */
export declare interface AbcContextValue {
    theme: AbcThemeConfig;
    resolvedTheme: AbcResolvedTheme;
    pageTransition: AbcPageTransition;
    watermarkText?: string | string[];
    watermarkEnabled: boolean;
    setThemeMode: (mode: AbcThemeMode, origin?: {
        clientX: number;
        clientY: number;
    }) => void;
    toggleTheme: (origin?: {
        clientX: number;
        clientY: number;
    }) => void;
    setBrand: (brand: AbcBrandColor) => void;
    setCustomBrandColor: (hex?: string) => void;
    setDensity: (density: AbcDensity) => void;
    setRadius: (radius: AbcRadius) => void;
    setSurface: (surface: AbcSurfaceProfile) => void;
    setFontScale: (scale: AbcFontScale) => void;
    setVisualMode: (mode: AbcVisualMode) => void;
    setComponentSize: (size?: AbcSize) => void;
    setMotion: (motion: AbcMotionPreset) => void;
    updateTheme: (patch: Partial<AbcThemeConfig>) => void;
    setPageTransition: (transition: AbcPageTransition) => void;
    setWatermarkEnabled: (enabled: boolean) => void;
    resetTheme: () => void;
    toast: AbcToastAdapter;
    uploadAdapter?: AbcUploadAdapter;
    dictAdapter?: AbcDictAdapter;
    permissionAdapter?: AbcPermissionAdapter;
    captchaAdapter?: AbcCaptchaAdapter;
    iconRegistry: Record<string, AbcIconComponent>;
    /** 多级抽屉全局默认展示交互模式：'adjacent' 为平级并排展开（企业级推荐），'stack' 为传统向左层叠推挤 */
    defaultDrawerCascadeMode?: 'stack' | 'adjacent';
}

/** 数据字典适配器：按字典编码同步或异步返回选项列表 */
export declare type AbcDictAdapter = (dictCode: string) => AbcDictOption[] | Promise<AbcDictOption[]>;

export declare type AbcDictItem = AbcDictOption;

/** 通用字典项数据结构 */
export declare interface AbcDictOption {
    label: string;
    value: string | number;
    tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    disabled?: boolean;
}

export { AbcDiffKind }

export { AbcFieldDiffEntry }

/** 图标组件渲染签名 */
export declare type AbcIconComponent = default_2.ComponentType<{
    size?: number | string;
    className?: string;
    strokeWidth?: number;
}>;

export { AbcKeyValueEntry }

export { AbcKeyValueFormat }

/** 5 大标准企业级布局拓扑模式 */
export declare type AbcLayoutMode = 'sidebar' | 'top' | 'mix' | 'dual-column' | 'auth';

/** 布局壳层运行时可调配置项 */
export declare interface AbcLayoutSettings {
    mode: AbcLayoutMode;
    sidebarTone: AbcSidebarTone;
    sidebarCollapsed: boolean;
    sidebarAccordion: boolean;
    /** 是否在展开态侧边栏顶部渲染快捷菜单/组件过滤输入框 */
    sidebarSearch?: boolean;
    showTabs: boolean;
    tabStyle?: AbcTabStyle;
    keepAlive: boolean;
    contentWidth: AbcContentWidth;
    /** 侧边栏展开像素宽度（不指定时随 componentSize 自动联动，自定义时可设为 196-288） */
    sidebarWidth?: number;
    /** 顶栏像素高度（不指定时随 componentSize 自动联动，自定义时可设为 46-66） */
    headerHeight?: number;
    /** 是否启用顶栏毛玻璃半透明模糊质感 */
    headerBlur?: boolean;
    /** 是否在侧栏/双栏模式下显示顶栏面包屑路径 */
    showBreadcrumb?: boolean;
    /** 是否在主内容区底部展示应用页脚 */
    showFooter?: boolean;
    /** 是否在路由切换时显示顶部轻量加载进度条（默认 true） */
    routeProgress?: boolean;
}

export { AbcLineDiffEntry }

/** 路由无关的树形导航菜单节点协议 */
export declare interface AbcMenuItem {
    key: string;
    label: string;
    path?: string;
    icon?: string | default_2.ReactNode;
    badge?: string | number;
    /** 附加检索关键词（如本路由包含的组件符号、英文别名或业务术语，供侧栏筛选与 ⌘K 搜索匹配） */
    keywords?: string | string[];
    disabled?: boolean;
    groupTitle?: string;
    children?: AbcMenuItem[];
}

/** 权限校验适配器：判断当前用户是否具备指定权限码 */
export declare type AbcPermissionAdapter = (permission: string | string[], mode?: 'any' | 'all') => boolean;

/**
 * 零外部依赖的全局顶部路由加载进度条命令式控制器
 */
export declare const abcProgress: {
    start(): void;
    done(): void;
    set(value: number): void;
    subscribe(fn: ProgressListener): () => void;
};

/**
 * ABC Design 顶层全局配置与主题适配器容器
 */
export declare const AbcProvider: default_2.FC<AbcProviderProps>;

export declare interface AbcProviderProps {
    children: default_2.ReactNode;
    /** 初始主题配置 */
    defaultTheme?: Partial<AbcThemeConfig>;
    /** 默认页面切换动画 */
    defaultPageTransition?: AbcPageTransition;
    /** 全局水印文案 */
    watermarkText?: string | string[];
    /** 默认是否开启水印 */
    defaultWatermarkEnabled?: boolean;
    /** 是否持久化用户主题偏好到 localStorage（默认开启） */
    persist?: boolean;
    /** 自定义主题配置在 localStorage 中的存储键名（区分不同产品切面，如 admin vs console） */
    storageKey?: string;
    /** 自定义 Toast 适配器（不传则使用内置零依赖 ToastContainer / AbcToastViewport） */
    toastAdapter?: AbcToastAdapter;
    /** 全局 ToastContainer 属性配置（如挂载位置、最大数量、动效预设等） */
    toastContainerProps?: ToastContainerProps;
    /** 注入全局文件上传实现（供 ImageUpload / ProConfigForm 使用） */
    uploadAdapter?: AbcUploadAdapter;
    /** 注入数据字典查询实现（供 DictSelect / DictTag / ProTable 使用） */
    dictAdapter?: AbcDictAdapter;
    /** 注入权限码判定实现（供 PermissionGuard / ProTable 操作按钮使用） */
    permissionAdapter?: AbcPermissionAdapter;
    /** 注入滑块拼图验证码拉取实现（供 SliderVerify 使用） */
    captchaAdapter?: AbcCaptchaAdapter;
    /** 按需注入扩展图标注册表 */
    iconRegistry?: Record<string, AbcIconComponent>;
    /** 多级抽屉全局默认展示交互模式：'adjacent' 为平级并排展开（企业级推荐），'stack' 为传统向左层叠推挤 */
    defaultDrawerCascadeMode?: 'stack' | 'adjacent';
}

export declare interface AbcRowSelectionConfig<T = Record<string, any>> {
    selectedRowKeys?: Array<string | number>;
    onChange?: (keys: Array<string | number>, rows: T[]) => void;
    getCheckboxProps?: (record: T) => {
        disabled?: boolean;
        name?: string;
    };
}

export { AbcRuleCondition }

export { AbcRuleFieldSchema }

export { AbcRuleFieldType }

export { AbcRuleGroup }

export { AbcRuleOperator }

export { AbcRuleOperatorOption }

/** 侧边栏独立视觉色调（允许亮色工作区搭配深色专业侧栏，或全浅色通透侧栏） */
export declare type AbcSidebarTone = 'dark' | 'light';

/** 多页签项数据结构 */
export declare interface AbcTabItem {
    path: string;
    title: string;
    icon?: string | default_2.ReactNode;
    closable?: boolean;
    pinned?: boolean;
}

export declare type AbcTableDensity = 'compact' | 'default' | 'comfortable';

export declare interface AbcTableExpandableConfig<T = Record<string, any>> {
    /** 自定义展开子面板渲染函数 */
    expandedRowRender?: (record: T, index: number, depth?: number, expanded?: boolean) => default_2.ReactNode;
    /** 判断某行是否允许展开 */
    rowExpandable?: (record: T) => boolean;
    /** 树形子级属性名（默认 'children'） */
    childrenColumnName?: string;
    /** 树形缩进像素步长（默认 18px） */
    indentSize?: number;
    /** 初始默认展开全部可展开行 */
    defaultExpandAllRows?: boolean;
    /** 受控展开行主键集合 */
    expandedRowKeys?: Array<string | number>;
    /** 展开行变更回调 */
    onExpandedRowsChange?: (keys: Array<string | number>) => void;
    /** 单行展开/收起触发回调（可用于异步懒加载子节点） */
    onExpand?: (expanded: boolean, record: T) => void;
}

export declare interface AbcTablePersistedSettings {
    hiddenKeys: string[];
    columnOrder: string[];
    columnWidths: Record<string, number>;
    /** 用户自定义列左右固定覆盖（null 表示显式取消列默认固定，未设置则沿用列定义） */
    columnFixed: Record<string, 'left' | 'right' | null>;
    /** 用户自定义顶部检索字段显隐（false 表示从筛选栏隐藏，true 表示强制加入筛选栏） */
    searchVisible: Record<string, boolean>;
    /** 表头筛选激活态高亮色 */
    filterHighlightColor: string;
    density: AbcTableDensity;
}

/** 多页签导航栏视觉风格 */
export declare type AbcTabStyle = 'card' | 'pill' | 'underline';

/** 零外部依赖的内置全局轻量消息通知实例 */
export declare const abcToast: AbcToastMethods;

/** 轻量消息提示适配器协议 */
export declare interface AbcToastAdapter {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

export declare interface AbcToastMethods extends AbcToastAdapter {
    success: (messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    error: (messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    info: (messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    warning: (messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    loading: (messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    push: (tone: ToastTone, messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number) => string;
    dismiss: (id: string) => void;
    clear: () => void;
}

/** 全局消息队列挂载宿主（由 AbcProvider 默认渲染，底层基于 ToastContainer） */
export declare const AbcToastViewport: default_2.FC<AbcToastViewportProps>;

/** 兼容导出命名 */
export declare interface AbcToastViewportProps extends ToastContainerProps {
}

export { AbcTreeNode }

export declare const abcUiClasses: {
    readonly input: "w-full h-8.5 rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] px-3 py-1.5 text-xs text-[var(--abc-fg)] placeholder:text-[var(--abc-fg-placeholder)] hover:border-[var(--abc-border-strong)] focus:border-[var(--abc-primary)] focus:ring-2 focus:ring-[var(--abc-ring)] focus:outline-none transition-all disabled:bg-[var(--abc-bg-muted)] disabled:text-[var(--abc-fg-muted)] disabled:cursor-not-allowed";
    readonly textarea: "w-full rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-3 text-xs text-[var(--abc-fg)] placeholder:text-[var(--abc-fg-placeholder)] hover:border-[var(--abc-border-strong)] focus:border-[var(--abc-primary)] focus:ring-2 focus:ring-[var(--abc-ring)] focus:outline-none transition-all disabled:bg-[var(--abc-bg-muted)] disabled:text-[var(--abc-fg-muted)] disabled:cursor-not-allowed";
    readonly button: "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] bg-[var(--abc-primary)] hover:bg-[var(--abc-primary-hover)] active:bg-[var(--abc-primary-active)] px-3.5 py-1.5 text-xs font-medium text-[var(--abc-primary-fg)] transition-all shadow-2xs active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none";
    readonly secondary: "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] text-[var(--abc-fg-secondary)] hover:bg-[var(--abc-bg-subtle)] hover:border-[var(--abc-border-strong)] px-3.5 py-1.5 text-xs font-medium transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer select-none";
    readonly dangerButton: "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] bg-[var(--abc-danger)] hover:opacity-90 active:opacity-95 px-3.5 py-1.5 text-xs font-medium text-white transition-all shadow-2xs active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none";
    readonly textButton: "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-sm,0.375rem)] bg-transparent text-[var(--abc-fg-secondary)] hover:bg-[var(--abc-bg-subtle)] hover:text-[var(--abc-primary)] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer select-none";
    readonly panel: "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-4 shadow-[var(--abc-shadow-card)]";
    readonly filterCard: "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-4 shadow-[var(--abc-shadow-card)]";
    readonly tableCard: "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] shadow-[var(--abc-shadow-card)] overflow-hidden";
    readonly tableHead: "bg-[var(--abc-bg-muted)] border-b border-[var(--abc-border)] text-xs font-semibold text-[var(--abc-fg-secondary)]";
    readonly tableHeaderCell: "px-4 py-3 text-xs font-semibold text-[var(--abc-fg-secondary)] whitespace-nowrap";
    readonly tableCell: "px-4 py-3 text-xs text-[var(--abc-fg-secondary)]";
    readonly pageHeader: "flex flex-col sm:flex-row sm:items-center justify-between gap-3";
    readonly pageTitle: "text-base font-bold text-[var(--abc-fg)] tracking-tight";
    readonly pageSubTitle: "text-xs text-[var(--abc-fg-muted)] mt-0.5";
    readonly label: "block text-xs font-medium text-[var(--abc-fg-secondary)] mb-1.5";
};

/** 文件上传适配器：接收 File 并返回可访问 URL */
export declare type AbcUploadAdapter = (file: File) => Promise<string>;

/** 顶栏登录用户信息协议 */
export declare interface AbcUserInfo {
    name: string;
    role?: string;
    avatar?: string;
    menuItems?: DropdownMenuItem[];
}

export declare type ActionButtonConfig<T = Record<string, any>> = ProActionButtonConfig<T>;

/**
 * 快捷入口与工作台导航卡片 (ActionCard)
 * 基于 ::after 拉伸点击热区实现语义化整卡可点击（主动作落在真实 <a> / <button> 上，次要按钮通过 z-10 隔离冒泡）
 */
export declare const ActionCard: default_2.FC<ActionCardProps>;

export declare interface ActionCardProps {
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    tags?: string[];
    /** 独立右上角次要动作插槽（z-10 独立捕获点击，不触发整卡主跳转） */
    extra?: default_2.ReactNode;
    href?: string;
    target?: string;
    /** 是否处于选中激活状态（用于预设档位/导航菜单卡片高亮） */
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
    'data-testid'?: string;
}

/** 全局活跃抽屉栈项：支撑多级抽屉自动计算宽度与平级并排/层叠推挤 */
export declare interface ActiveDrawerEntry {
    id: string;
    cascadeMode?: 'stack' | 'adjacent';
    widthPx: number;
}

/**
 * 多源联动筛选状态摘要栏 (ActiveFilterBar)
 *
 * 将来自图表下钻、左侧目录树、顶部工具栏、表头列筛选及规则引擎的激活条件
 * 汇总为统一可读胶囊条，支持单条精准撤销与一键全局重置。
 */
export declare const ActiveFilterBar: React_2.ForwardRefExoticComponent<ActiveFilterBarProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface ActiveFilterBarProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** 当前生效的筛选胶囊列表 */
    chips: ReadonlyArray<ActiveFilterChip>;
    /** 全量数据条数 */
    totalCount?: number;
    /** 筛选后命中条数 */
    filteredCount?: number;
    /** 统一移除回调（当单条 chip 未自带 onRemove 时回退触发） */
    onRemove?: (key: string) => void;
    /** 一键清空全部筛选回调 */
    onClearAll?: () => void;
    /** 清空按钮文案（默认 '清空筛选'） */
    clearAllLabel?: string;
    /** 无任何筛选胶囊时是否自动隐藏整条状态栏（默认 true） */
    hideWhenEmpty?: boolean;
    /** 右侧附加操作或统计内容 */
    extra?: React_2.ReactNode;
}

export declare interface ActiveFilterChip {
    /** 筛选条件唯一标识 */
    key: string;
    /** 筛选字段名 */
    label: string;
    /** 当前生效值展示文本 */
    valueText: React_2.ReactNode;
    /** 筛选条件来源（用于自动匹配语义图标） */
    source?: ActiveFilterSource;
    /** 单条筛选移除回调（优先于 ActiveFilterBar.onRemove 执行） */
    onRemove?: () => void;
}

export declare type ActiveFilterSource = 'chart' | 'toolbar' | 'table' | 'tree' | 'rule' | 'custom';

/**
 * 页内提示横幅组件 (Alert)
 */
export declare const Alert: default_2.FC<AlertProps>;

export declare interface AlertProps {
    tone?: AlertTone;
    title?: default_2.ReactNode;
    description?: default_2.ReactNode;
    children?: default_2.ReactNode;
    showIcon?: boolean;
    closable?: boolean;
    onClose?: () => void;
    action?: default_2.ReactNode;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export declare function AsyncInlineError({ error, fallbackTitle, fallbackMessage, action, retry, retryLabel, isRetrying, className, ...props }: AsyncInlineErrorProps): React_2.JSX.Element | null;

export declare interface AsyncInlineErrorProps extends React_2.HTMLAttributes<HTMLDivElement> {
    error: unknown;
    fallbackTitle?: React_2.ReactNode;
    fallbackMessage?: React_2.ReactNode;
    action?: React_2.ReactNode;
    retry?: () => void;
    retryLabel?: React_2.ReactNode;
    isRetrying?: boolean;
}

export declare interface AttentionEntry {
    kind: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | string;
    count: number;
    label: string;
    href?: string;
    restriction?: string;
    onClick?: () => void;
}

/**
 * 重点待办与告警关注清单 (AttentionList)
 * 用于控制台仪表盘、运营概览中展示聚合的高危与中危告警信号
 */
export declare function AttentionList({ items, emptyMessage, className, }: AttentionListProps): JSX.Element;

export declare interface AttentionListProps {
    items: AttentionEntry[];
    emptyMessage?: string;
    className?: string;
}

/** 柔和极光背景装饰层（适配 Auth 登录布局及大屏视觉头部） */
export declare const AuroraBackground: default_2.FC<{
    motion?: AbcMotionPreset;
    className?: string;
}>;

/**
 * 登录 / SSO / 租户入驻独立认证页布局框架
 * 支持分屏品牌视觉展示与极简居中卡片两种主流企业范式
 */
export declare const AuthLayout: default_2.FC<AuthLayoutProps>;

export declare interface AuthLayoutProps {
    brand?: AbcBrandInfo;
    /** 分屏双栏 ('split') 或极简居中卡片 ('centered') */
    variant?: 'split' | 'centered';
    /** 左侧品牌大标题 */
    headline?: default_2.ReactNode;
    /** 左侧副标题描述 */
    subheadline?: default_2.ReactNode;
    /** 左侧企业特性卖点列表 */
    highlights?: string[];
    /** 右上角附加插槽（如语言/主题切换按钮） */
    topRightExtra?: default_2.ReactNode;
    /** 页脚版权说明 */
    copyright?: default_2.ReactNode;
    children: default_2.ReactNode;
    className?: string;
}

export declare const AUTO_OPTION_TONES: StatusTone[];

/** 用户/租户头像组件（图片加载失败时自动回退至名称首字符） */
export declare const Avatar: default_2.FC<AvatarProps>;

export declare interface AvatarProps {
    src?: string;
    name?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/** 数字/红点角标组件（兼具语义标签模式） */
export declare const Badge: default_2.FC<BadgeProps>;

export declare interface BadgeProps extends default_2.HTMLAttributes<HTMLSpanElement> {
    count?: number;
    maxCount?: number;
    dot?: boolean;
    tone?: 'danger' | 'primary' | 'success';
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    size?: AbcSize;
    motion?: AbcMotionPreset;
    children?: default_2.ReactNode;
    className?: string;
}

export declare const baseFieldControlClass = "w-full rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] text-[var(--abc-fg)] placeholder:text-[var(--abc-fg-placeholder)] leading-normal py-0 transition-[color,background-color,border-color,box-shadow] duration-[var(--abc-motion-fast,140ms)] ease-out enabled:hover:border-[var(--abc-border-strong)] focus-within:border-[var(--abc-primary)] focus-within:ring-2 focus-within:ring-[var(--abc-ring)] focus:border-[var(--abc-primary)] focus:ring-2 focus:ring-[var(--abc-ring)] focus:outline-none disabled:bg-[var(--abc-bg-muted)] disabled:text-[var(--abc-fg-muted)] disabled:cursor-not-allowed";

/**
 * 批量任务执行追踪器 (BatchActionTracker)
 *
 * 适用于批量启停、批量审批、多资源导出与异步批处理反馈：
 * - 支持 inline 内联面板与 floating 右下角悬浮可最小化浮窗双模式；
 * - 实时汇总完成进度条、状态过滤胶囊、失败原因诊断及单条/全量一键重试。
 */
export declare const BatchActionTracker: React_2.ForwardRefExoticComponent<BatchActionTrackerProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface BatchActionTrackerProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** 队列面板标题（默认 '批量执行队列'） */
    title?: React_2.ReactNode;
    /** 批量任务条目列表 */
    items: ReadonlyArray<BatchTaskItem>;
    /** 展现形态：inline 内联卡片，floating 右下角悬浮可折叠浮窗（默认 'inline'） */
    variant?: 'inline' | 'floating';
    /** 是否显示队列面板（默认 true） */
    open?: boolean;
    /** 关闭回调；传入时右上角显示关闭按钮 */
    onClose?: () => void;
    /** 一键重试全部失败项回调 */
    onRetryFailed?: (failedIds: string[]) => void;
    /** 单条失败任务重试回调 */
    onRetryItem?: (id: string) => void;
    /** 清理已完成（succeeded）任务回调 */
    onClearSucceeded?: () => void;
    /** 顶部重试失败项按钮文案（默认 '重试失败项'） */
    retryFailedLabel?: string;
}

export declare interface BatchTaskItem {
    /** 任务唯一标识 */
    id: string;
    /** 任务标题 */
    title: string;
    /** 次级说明文案（如目标资源 ID 或参数摘要） */
    subtitle?: string;
    /** 当前执行状态 */
    status: BatchTaskStatus;
    /** 失败原因详情（仅 failed 时高亮展示） */
    error?: string;
    /** 耗时（毫秒） */
    durationMs?: number;
}

export declare type BatchTaskStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/** Bento 网格单卡（支持跨列/跨行特性视觉呈现与微交互上浮） */
export declare const BentoCard: default_2.FC<BentoCardProps>;

export declare interface BentoCardProps extends Omit<default_2.HTMLAttributes<HTMLElement>, 'title'> {
    colSpan?: 1 | 2 | 3;
    rowSpan?: 1 | 2;
    eyebrow?: default_2.ReactNode;
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    graphic?: default_2.ReactNode;
    footer?: default_2.ReactNode;
    hoverable?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
}

/** 现代 Bento 异构仪表盘网格容器 */
export declare const BentoGrid: default_2.FC<BentoGridProps>;

export declare interface BentoGridProps extends default_2.HTMLAttributes<HTMLDivElement> {
    columns?: 2 | 3 | 4;
    gap?: AbcSize;
}

/** 流光边框装饰层（放置在 relative overflow-hidden 容器内部） */
export declare const BorderBeam: default_2.FC<BorderBeamProps>;

export declare interface BorderBeamProps {
    duration?: number;
    motion?: AbcMotionPreset;
    className?: string;
}

/**
 * 多品牌 / 多租户自适应前缀图标组件 (BrandIcon / TenantIcon)
 * 支持远程图片加载失败优雅回退矢量图标，以及基于 CSS mask-image 的 SVG 主题色动态着色。
 */
export declare const BrandIcon: default_2.FC<BrandIconProps>;

export declare interface BrandIconPreset {
    /** 渲染方式：常规图片（支持失败自动降级）或 CSS Mask 矢量主题着色 */
    mode?: 'image' | 'mask';
    /** 图片或 SVG 资源地址 */
    src: string;
    /** 无障碍替代文本（image 模式） */
    alt?: string;
    /** 图片加载失败时的降级图标节点 */
    fallbackIcon?: default_2.ReactNode;
    /** mask 模式下的着色类名（默认跟随主题品牌色 bg-[var(--abc-primary)]） */
    maskClassName?: string;
}

export declare interface BrandIconProps {
    /** 品牌或租户编码（匹配 presets 字典，大小写不敏感） */
    code?: string;
    /** 兼容业务侧 tenantCode 属性命名 */
    tenantCode?: string;
    /** 多租户/多品牌图标预设映射表 */
    presets?: Record<string, BrandIconPreset>;
    /** 单品牌直接指定图片 URL */
    src?: string;
    /** 单品牌直接指定 CSS Mask 矢量图标 URL */
    maskSrc?: string;
    /** mask 模式下的着色类名 */
    maskClassName?: string;
    /** 图片替代文字 */
    alt?: string;
    /** 未命中预设或图片加载失败时的兜底图标 */
    fallbackIcon?: default_2.ReactNode;
    /** 尺寸与自定义样式类名（默认 'w-4 h-4'） */
    className?: string;
}

/** 品牌 Logo 与项目名展示块（支持直链图片、内联 SVG、四档尺寸联动及多租户品牌快捷编辑按钮） */
export declare const BrandLogoBlock: default_2.FC<{
    brand: AbcBrandInfo;
    collapsed?: boolean;
    tone?: 'dark' | 'light';
    size?: AbcSize;
    className?: string;
}>;

/**
 * 语义化面包屑导航 (Breadcrumb)
 * 遵循无障碍规范：<nav> + <ol> 有序层级列表，末项标记 aria-current="page"，
 * 分隔符通过 CSS ::before content: "/" / "" 注入，对读屏器静默无噪音。
 */
export declare const Breadcrumb: default_2.FC<BreadcrumbProps>;

export declare interface BreadcrumbEntry {
    label: default_2.ReactNode;
    onClick?: () => void;
}

export declare interface BreadcrumbItem {
    key?: string;
    label: default_2.ReactNode;
    href?: string;
    icon?: default_2.ReactNode;
    onClick?: (e: default_2.MouseEvent<HTMLAnchorElement>) => void;
}

export declare interface BreadcrumbProps {
    items: BreadcrumbItem[];
    ariaLabel?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare function buildCsvContent<T extends Record<string, any>>(columns: AbcColumn<T>[], rows: T[]): string;

/**
 * 企业级通用按钮组件
 * 完全基于 --abc-* 语义化 Token 驱动，随品牌色、密度与圆角档位实时响应
 */
export declare const Button: default_2.ForwardRefExoticComponent<ButtonProps & default_2.RefAttributes<HTMLButtonElement>>;

/** 主要按钮样式 */
export declare const buttonClass = "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] bg-[var(--abc-primary)] hover:bg-[var(--abc-primary-hover)] active:bg-[var(--abc-primary-active)] px-3.5 py-1.5 text-xs font-medium text-[var(--abc-primary-fg)] transition-all shadow-2xs active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none";

export declare interface ButtonProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    /** 视觉语义变体 */
    variant?: ButtonVariant;
    /** 控件高度规格（默认对齐企业紧凑基线 sm = var(--abc-control-h-sm)，支持全局 componentSize 继承） */
    size?: ButtonSize;
    /** 组件交互动效规格（默认继承 AbcProvider.theme.motion） */
    motion?: AbcMotionPreset;
    /** 加载中状态 */
    loading?: boolean;
    /** 加载中文案 */
    loadingText?: default_2.ReactNode;
    /** 左侧前置图标 */
    icon?: default_2.ReactNode;
    /** icon 语义别名 */
    leftIcon?: default_2.ReactNode;
    /** 右侧后置图标 */
    rightIcon?: default_2.ReactNode;
    /** 正方形纯图标按钮（需配合 aria-label） */
    iconOnly?: boolean;
    /** 是否撑满父容器宽度 */
    block?: boolean;
    /** 是否将样式透传给子元素 */
    asChild?: boolean;
}

export declare type ButtonSize = AbcSize | 'default' | 'icon' | 'icon-sm';

export declare type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'ghost' | 'text' | 'default' | 'destructive' | 'link';

export declare function buttonVariants({ variant, size, iconOnly, className, }?: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    className?: string;
}): string;

export declare const BYTE_UNIT_FACTORS: Record<ByteUnit, number>;

export declare const BYTE_UNITS: readonly ByteUnit[];

export declare function ByteQuotaInput({ locale, zeroMeansUnlimited, defaultZeroUnit, allowedUnits, unitAriaLabel, ...rest }: ByteQuotaInputProps): React_2.JSX.Element;

export declare interface ByteQuotaInputProps extends QuotaUnitInputBaseProps {
    locale?: 'en' | 'zh';
    zeroMeansUnlimited?: boolean;
    defaultZeroUnit?: ByteUnit;
    allowedUnits?: readonly ByteUnit[];
    unitAriaLabel?: string;
}

export declare type ByteUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

/**
 * 标准企业级表面容器卡片
 * 统一取代零散的 panelClass / filterCardClass / tableCardClass，支持四档尺寸、五种视觉表面、封面图与容器查询
 */
export declare const Card: default_2.FC<CardProps>;

export declare const CardContent: default_2.ForwardRefExoticComponent<CardContentProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface CardContentProps extends default_2.HTMLAttributes<HTMLDivElement> {
}

export declare const CardDescription: default_2.ForwardRefExoticComponent<CardDescriptionProps & default_2.RefAttributes<HTMLParagraphElement>>;

export declare interface CardDescriptionProps extends default_2.HTMLAttributes<HTMLParagraphElement> {
}

export declare const CardFooter: default_2.ForwardRefExoticComponent<CardFooterProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface CardFooterProps extends default_2.HTMLAttributes<HTMLDivElement> {
}

export declare const CardHeader: default_2.ForwardRefExoticComponent<CardHeaderProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface CardHeaderProps extends default_2.HTMLAttributes<HTMLDivElement> {
}

export declare interface CardProps extends Omit<default_2.HTMLAttributes<HTMLElement>, 'title'> {
    /** 语义容器标签（默认 'div'，推荐在列表/仪表盘网格中设为 'article'） */
    as?: 'div' | 'article' | 'section';
    /** 卡片主标题 */
    title?: default_2.ReactNode;
    /** 标题旁辅助说明 */
    subtitle?: default_2.ReactNode;
    /** 右上角附加操作区 */
    extra?: default_2.ReactNode;
    /** 卡片底部区域 */
    footer?: default_2.ReactNode;
    /** 通用四档密度尺寸 */
    size?: AbcSize;
    /** 内容区内边距规格（未指定时默认跟随 size） */
    padding?: 'none' | AbcSize;
    /** 视觉表面变体 */
    variant?: CardVariant;
    /** 顶部固定比例封面图插槽（防布局偏移 CLS） */
    cover?: default_2.ReactNode;
    /** 右上角状态角标 */
    statusRibbon?: {
        text: string;
        tone?: StatusTone;
    };
    /** 加载态骨架占位 */
    loading?: boolean;
    /** 动效预设 */
    motion?: AbcMotionPreset;
    /** 鼠标悬停时是否轻微浮起高亮边框 */
    hoverable?: boolean;
    /** 内容容器附加类名 */
    bodyClassName?: string;
}

export declare const CardTitle: default_2.ForwardRefExoticComponent<CardTitleProps & default_2.RefAttributes<HTMLHeadingElement>>;

export declare interface CardTitleProps extends default_2.HTMLAttributes<HTMLHeadingElement> {
}

export declare type CardVariant = 'default' | 'bordered' | 'ghost' | 'elevated' | 'glass';

/**
 * 多列级联选择器 (Cascader)
 * 支持单选/多选、changeOnSelect、悬停或点击展开、异步懒加载 children、拼音全路径检索与键盘多列游走。
 */
export declare const Cascader: default_2.FC<CascaderProps>;

export declare type CascaderMultipleValue = Array<CascaderSingleValue>;

export declare interface CascaderOption {
    value: string | number;
    label: default_2.ReactNode;
    disabled?: boolean;
    children?: CascaderOption[];
    isLeaf?: boolean;
}

export declare interface CascaderProps {
    options: CascaderOption[];
    value?: CascaderValue;
    defaultValue?: CascaderValue;
    onChange?: (value: CascaderValue, selectedOptions?: CascaderOption[] | CascaderOption[][]) => void;
    multiple?: boolean;
    /** 单选模式下允许点击非叶子节点直接选中（默认 false） */
    changeOnSelect?: boolean;
    /** 开启搜索与拼音首字母路径匹配 */
    searchable?: boolean;
    clearable?: boolean;
    expandTrigger?: 'click' | 'hover';
    separator?: string;
    showFullPath?: boolean;
    maxTagCount?: number;
    loadData?: (selectedOptions: CascaderOption[]) => Promise<void>;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    matchWidth?: boolean;
    emptyText?: default_2.ReactNode;
    ariaLabel?: string;
    id?: string;
    className?: string;
}

export declare type CascaderSingleValue = Array<string | number>;

export declare type CascaderValue = CascaderSingleValue | CascaderMultipleValue;

/** 可勾选胶囊标签 (CheckableTag) */
export declare const CheckableTag: default_2.ForwardRefExoticComponent<CheckableTagProps & default_2.RefAttributes<HTMLInputElement>>;

/** 声明式多选胶囊标签组 (CheckableTagGroup) */
export declare function CheckableTagGroup<T extends string = string>({ options, value, values, onValueChange, onValuesChange, mono, size, className, ...props }: CheckableTagGroupProps<T>): default_2.JSX.Element;

export declare interface CheckableTagGroupProps<T extends string = string> extends Omit<default_2.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: ReadonlyArray<T | CheckableTagOption<T>>;
    value?: ReadonlyArray<T>;
    values?: ReadonlyArray<T>;
    onValueChange?: (next: T[]) => void;
    onValuesChange?: (next: T[]) => void;
    mono?: boolean;
    size?: 'sm' | 'md';
}

export declare interface CheckableTagOption<T extends string = string> {
    value: T;
    label?: default_2.ReactNode;
    disabled?: boolean;
}

export declare interface CheckableTagProps extends Omit<default_2.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    label?: default_2.ReactNode;
    onCheckedChange?: (checked: boolean) => void;
    mono?: boolean;
    size?: 'sm' | 'md';
    labelClassName?: string;
}

/** 复选框组件（支持四档尺寸、动效规格、半选态 indeterminate、辅助描述与键盘无障碍操作） */
export declare const Checkbox: default_2.ForwardRefExoticComponent<CheckboxProps & default_2.RefAttributes<HTMLInputElement>>;

export declare interface CheckboxProps extends Omit<default_2.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean, e: default_2.ChangeEvent<HTMLInputElement>) => void;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    label?: default_2.ReactNode;
    description?: default_2.ReactNode;
    wrapperClassName?: string;
    className?: string;
}

/**
 * 可勾选卡片 (CheckCard)
 * 选中态仅改变边框颜色与微阴影/背景，绝不改变 border-width、padding 或 font-weight 以彻底消除重排抖动
 */
export declare const CheckCard: default_2.FC<CheckCardProps>;

/**
 * 表单选择卡片组 (CheckCardGroup)
 * 支持单选与多选模式，通过原生语义 input 保证键盘方向键/空格操作与读屏器兼容
 */
export declare const CheckCardGroup: default_2.FC<CheckCardGroupProps>;

export declare interface CheckCardGroupProps {
    multiple?: boolean;
    value?: CheckCardValue | CheckCardValue[];
    defaultValue?: CheckCardValue | CheckCardValue[];
    onChange?: (nextValue: CheckCardValue | CheckCardValue[]) => void;
    disabled?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
    children: default_2.ReactNode;
}

export declare interface CheckCardProps {
    value?: CheckCardValue;
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    avatar?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    extra?: default_2.ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
    children?: default_2.ReactNode;
}

export declare type CheckCardValue = string | number;

/** 清空当前所有进行中的 Toast 通知 */
export declare function clearToasts(): void;

/** 合并条件类名并自动消解 Tailwind 工具类冲突 */
export declare function cn(...inputs: ClassValue[]): string;

/**
 * 统一终端/代码块展示组件 (CodeBlock)
 * 支持深色终端风格与亮/暗双主题语义表面风格、行号、折行、折叠与一键复制
 */
export declare function CodeBlock({ code, title, language, variant, copyable, copyLabel, copiedLabel, copyAriaLabel, onCopySuccess, onCopyError, headerAction, preClassName, maxHeightClassName, maxHeight, collapsible, defaultCollapsed, emptyText, showLineNumbers, wrapLongLines, className, children, ...props }: CodeBlockProps): React_2.JSX.Element;

export declare interface CodeBlockProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** 代码文本内容（同时作为一键复制的数据源） */
    code: string;
    /** 顶部标题或接口路径说明 */
    title?: React_2.ReactNode;
    /** 语言或格式标识（如 bash / json / ts） */
    language?: string;
    /** 外观变体：'terminal' 深色终端（默认） | 'surface' 跟随亮/暗语义表面 */
    variant?: 'terminal' | 'surface';
    /** 是否显示一键复制按钮，默认开启 */
    copyable?: boolean;
    /** 未复制时的按钮文案 */
    copyLabel?: string;
    /** 复制成功后的按钮文案 */
    copiedLabel?: string;
    /** 复制按钮的无障碍名称 */
    copyAriaLabel?: string;
    /** 复制成功回调 */
    onCopySuccess?: () => void;
    /** 复制失败回调 */
    onCopyError?: () => void;
    /** 顶部右侧附加操作区插槽 */
    headerAction?: React_2.ReactNode;
    /** pre 元素附加样式（如高度限制 max-h-96） */
    preClassName?: string;
    /** pre 元素最大高度限制类名（兼容别名） */
    maxHeightClassName?: string;
    /** 代码区最大滚动高度（数字按 px 处理） */
    maxHeight?: number | string;
    /** 是否支持折叠/展开代码块内容 */
    collapsible?: boolean;
    /** 初始是否折叠（配合 collapsible 使用） */
    defaultCollapsed?: boolean;
    /** code 为空字符串且未传 children 时的占位内容 */
    emptyText?: React_2.ReactNode;
    /** 是否展示行号列（仅在未传自定义 children 时生效） */
    showLineNumbers?: boolean;
    /** 是否允许长行自动折行 */
    wrapLongLines?: boolean;
    /** 自定义渲染子节点 */
    children?: React_2.ReactNode;
}

/**
 * 原生 <details> + <summary> 手风琴/折叠面板 (Collapse)
 * 遵循现代 Web 标准：指示箭头紧邻标题文本左侧便于视觉垂直扫读，不在 <summary> 内嵌套标题标签避免读屏器吞语义
 */
export declare const Collapse: default_2.FC<CollapseProps>;

export declare interface CollapseItem {
    key: string;
    label: default_2.ReactNode;
    extra?: default_2.ReactNode;
    children: default_2.ReactNode;
    disabled?: boolean;
}

export declare interface CollapseProps {
    items: CollapseItem[];
    /** 是否开启排他手风琴模式（一次仅允许展开一项） */
    accordion?: boolean;
    defaultActiveKeys?: string[];
    activeKeys?: string[];
    onChange?: (activeKeys: string[]) => void;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/**
 * 可折叠详情分组卡片 (CollapsibleCard)
 * 使用 CSS Grid 0fr -> 1fr 平滑高度过渡，适合参数配置高级选项与多区块巡检详情
 */
export declare const CollapsibleCard: default_2.FC<CollapsibleCardProps>;

export declare interface CollapsibleCardProps {
    title: default_2.ReactNode;
    subtitle?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    extra?: default_2.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
    bodyClassName?: string;
    children: default_2.ReactNode;
}

export declare const COLOR_ALIAS_TO_TONE: Record<string, StatusTone>;

export declare type ColorSchemePreference = 'system' | 'light' | 'dark';

export declare interface CommandActionItem {
    id: string;
    title: string;
    /** 可选精确组件或 API 符号名（如 'Select'、'JsonTreeViewer'），用于精确符号搜索置顶提权与侧栏直达展示 */
    symbol?: string;
    group?: string;
    subtitle?: string;
    /** 右侧附加胶囊角标（如所属 npm 包名或 New 标记） */
    badge?: string;
    icon?: string | default_2.ReactNode;
    keywords?: string;
    /** 基础排序权重微调（数值越大越靠前） */
    priority?: number;
    onTrigger: () => void;
}

/**
 * 企业级 Spotlight 全局指令、组件与菜单快速跳转中心
 * 支持 ⌘K / Ctrl+K 唤醒、多分词中文拼音首字母检索、精确前缀相关度排序、分组筛选与最近访问记忆
 */
export declare const CommandPalette: default_2.FC<CommandPaletteProps>;

export declare interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    menuItems?: AbcMenuItem[];
    onNavigate?: (path: string, item: AbcMenuItem) => void;
    extraActions?: CommandActionItem[];
    /** 搜索输入框占位提示文案 */
    placeholder?: string;
    /** 打开面板时预填的初始搜索词（如从侧边栏筛选框一键升级至全局精准搜索时透传） */
    initialQuery?: string;
}

/**
 * 放置在顶部 Header 栏的全局命令唤醒按钮
 */
export declare function CommandTriggerButton({ onClick, placeholder, mobilePlaceholder, ariaLabel, className, ...props }: CommandTriggerButtonProps): React_2.JSX.Element;

export declare interface CommandTriggerButtonProps extends React_2.ButtonHTMLAttributes<HTMLButtonElement> {
    onClick: () => void;
    placeholder?: string;
    mobilePlaceholder?: string;
    ariaLabel?: string;
}

/**
 * 根据操作列当前可用像素宽度与各按钮自然宽度，计算可内联展示的按钮数量（0..N）：
 * - 当所有按钮总宽 <= availableWidth 且未超出 maxInline 时，全量内联展示（不渲染三个点）；
 * - 当宽度不足时，预留三个点按钮宽度（28px），随列宽逐一展示可容纳的前 K 项，极限窄宽返回 0（仅展示三个点）。
 */
export declare function computeAutoFitVisibleCount(availableWidth: number, widths: number[], maxInline?: number): number;

/**
 * 配置变更差异审阅面板 (ConfigDiffViewer)
 * 支持结构化对象字段语义对比与 LCS 逐行源码对比，内置敏感字段脱敏提示与实时变更筛选开关。
 */
export declare const ConfigDiffViewer: default_2.FC<ConfigDiffViewerProps>;

export declare interface ConfigDiffViewerProps {
    /** 变更前配置对象 */
    before?: Record<string, any> | null;
    /** 变更后配置对象 */
    after?: Record<string, any> | null;
    /** 变更前源码/配置文件文本 */
    beforeCode?: string;
    /** 变更后源码/配置文件文本 */
    afterCode?: string;
    /** 字段键名到中文语义展示名称的映射表 */
    labels?: Record<string, string>;
    /** 展示模式：字段对比 / 源码对比 / 双标签切换 */
    mode?: 'fields' | 'code' | 'tabs';
    /** 源码逐行对比布局（默认 unified） */
    codeLayout?: 'unified' | 'split';
    /** 是否默认仅显示存在变更的条目（默认 true） */
    onlyChanges?: boolean;
    /** 是否对敏感字段（password/secret/token/api_key 等）自动脱敏（默认 true） */
    maskSecrets?: boolean;
    /** 顶部标题 */
    title?: default_2.ReactNode;
    /** 无变更时的空状态提示文案 */
    emptyText?: default_2.ReactNode;
    /** 无障碍区域标签 */
    ariaLabel?: string;
    className?: string;
}

export declare type ConfigFieldSchema<T extends Record<string, any> = Record<string, any>> = ProConfigPageFieldSchema<T>;

export declare type ConfigOptionItem = ProConfigOptionItem;

export declare type ConfigTabSchema<T extends Record<string, any> = Record<string, any>> = ProConfigTabSchema<T>;

/** abcConfirm 简短别名 */
declare const confirm_2: typeof abcConfirm;
export { confirm_2 as confirm }

/**
 * 结构化二次确认对话框 (ConfirmDialog)
 * 相比命令式 confirm()，支持自定义表单内容、破坏性警示样式、异步加载中与完全无障碍支持
 */
export declare function ConfirmDialog({ open, title, description, cancelLabel, confirmLabel, workingLabel, variant, loading, closeLabel, className, onCancel, onConfirm, children, }: ConfirmDialogProps): React_2.JSX.Element;

export declare interface ConfirmDialogProps {
    open: boolean;
    title: React_2.ReactNode;
    description?: React_2.ReactNode;
    cancelLabel?: React_2.ReactNode;
    confirmLabel?: React_2.ReactNode;
    workingLabel?: React_2.ReactNode;
    variant?: 'default' | 'destructive';
    loading?: boolean;
    closeLabel?: string;
    className?: string;
    onCancel: () => void;
    onConfirm: () => void;
    children?: React_2.ReactNode;
}

export declare interface ConfirmOptions {
    title?: string;
    message?: default_2.ReactNode;
    /** message 语义别名 */
    content?: default_2.ReactNode;
    confirmText?: string;
    cancelText?: string;
    tone?: 'danger' | 'warning' | 'primary' | 'success';
    /** tone 语义别名 */
    type?: 'warning' | 'info' | 'success' | 'error' | 'danger';
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}

/** 兼容包裹容器（若外层已存在 AbcProvider，内部自动去重不会重复挂载弹窗） */
export declare const ConfirmProvider: default_2.FC<{
    children: default_2.ReactNode;
}>;

export declare function ContextQuickBar({ badge, title, contextTags, actions, className, ...props }: ContextQuickBarProps): React_2.JSX.Element;

export declare interface ContextQuickBarAction {
    key?: string;
    href: string;
    label: React_2.ReactNode;
}

export declare interface ContextQuickBarProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    badge: React_2.ReactNode;
    title: React_2.ReactNode;
    contextTags?: ContextQuickBarTag[];
    actions: ContextQuickBarAction[];
}

export declare interface ContextQuickBarTag {
    key?: string;
    text?: React_2.ReactNode;
    label?: React_2.ReactNode;
    value?: React_2.ReactNode;
}

export declare type ControlSize = AbcSize | 'default';

export declare const CopyableCode: React_2.ForwardRefExoticComponent<CopyableCodeProps & React_2.RefAttributes<HTMLSpanElement>>;

export declare interface CopyableCodeProps extends React_2.HTMLAttributes<HTMLSpanElement> {
    value: string;
    displayValue?: React_2.ReactNode;
    copyLabel?: string;
    copiedLabel?: string;
    hideCopyButton?: boolean;
    codeClassName?: string;
}

/**
 * 一键点击复制文本组件
 * 通过 AbcProvider.toast 发送反馈，阻止事件冒泡避免误触表格行点击
 */
export declare const CopyableText: default_2.FC<CopyableTextProps>;

export declare interface CopyableTextProps {
    /** 实际要写入剪贴板的文本 */
    text: string;
    /** 可选自定义展示内容（例如脱敏或截断显示），默认展示 text */
    displayText?: default_2.ReactNode;
    children?: default_2.ReactNode;
    /** 是否显示右侧复制状态图标（默认 true） */
    showIcon?: boolean;
    /** 是否仅渲染复制图标按钮 */
    iconOnly?: boolean;
    /** 是否等宽字体渲染（适合订单号、ID、IP） */
    mono?: boolean;
    /** 复制成功提示文案 */
    successMessage?: string;
    /** successMessage 别名 */
    successText?: string;
    /** 悬停 title 文案 */
    tooltip?: string;
    /** 复制成功回调 */
    onCopy?: (text: string) => void;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/**
 * 独立的轻量复制图标按钮
 * 广泛用于表格列、卡片、代码块内快速复制 ID/Key 等场景
 */
export declare const CopyButton: default_2.FC<CopyButtonProps>;

export declare interface CopyButtonProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    title?: string;
    copyLabel?: string;
    copiedLabel?: string;
    successDuration?: number;
    iconOnly?: boolean;
    onCopySuccess?: () => void;
    onCopyError?: () => void;
}

/**
 * 写入文本至系统剪贴板（优先使用 Clipboard API，非安全上下文下自动回退至隐藏 textarea）
 */
export declare function copyToClipboard(text: string): Promise<boolean>;

/**
 * 纯函数表格 API 规范化工厂：消除分页字段名差异、空参污染与二进制导出样板代码
 */
export declare function createProTableApi<T = any>(input: ProTableApiInput<T>, options?: Omit<ProTableApiOptions<T>, 'list'>): ProCrudApiConfig<T>;

export declare const createTableApi: typeof createProTableApi;

export declare type CrudApiConfig<T = any, Q = any, F = any> = ProCrudApiConfig<T, Q, F>;

export declare const CrudConfigPage: typeof ProConfigPage;

export declare type CrudConfigPageProps<T extends Record<string, any> = Record<string, any>> = ProConfigPageProps<T>;

export declare const CrudFormLayout: typeof ProCrudFormLayout;

export declare const CrudSearchForm: default_2.FC<ProCrudSearchFormProps>;

export declare type CrudSearchFormProps = ProCrudSearchFormProps;

export declare const CrudTable: typeof ProTable;

/** 游标流式分页器（专用于 CDP 抓包、高频作业队列等无深总数的大数据场景） */
export declare const CursorPagination: default_2.FC<PaginationProps>;

export declare type CursorPaginationProps = PaginationProps;

/** 危险操作按钮样式 */
export declare const dangerButtonClass = "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] bg-[var(--abc-danger)] hover:opacity-90 active:opacity-95 px-3.5 py-1.5 text-xs font-medium text-white transition-all shadow-2xs active:scale-[0.99] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none";

/**
 * 轻量级通用数据表格 (DataTable)
 * 内置结构化骨架态加载、空状态表头保留开关、键盘可访问行选择以及可选双模分页条。
 */
export declare function DataTable<T>({ columns, data, rows, keyExtractor, rowKey, emptyNode, emptyTitle, emptyDescription, emptyIcon, emptyAction, onEmptyReset, emptyResetText, loading, skeletonRows, loadingStatusText, keepHeaderWhenEmpty, framed, onRowClick, selectedRowKey, scrollLabel, stickyHeader, density, pagination, caption, className, }: DataTableProps<T>): default_2.JSX.Element;

export declare namespace DataTable {
    var displayName: string;
}

export declare interface DataTableColumn<T> {
    /** 列唯一标识 */
    key: string;
    /** 列标题（与 title 等价，兼容两种写法） */
    header?: default_2.ReactNode;
    /** 列标题别名 */
    title?: default_2.ReactNode;
    /** 单元格自定义渲染（与 cell 等价，兼容两种写法） */
    render?: (item: T, index: number) => default_2.ReactNode;
    /** 单元格自定义渲染别名 */
    cell?: (item: T, index: number) => default_2.ReactNode;
    /** 对齐方式 */
    align?: 'left' | 'center' | 'right';
    /** 是否使用等宽字体展示单元格 */
    mono?: boolean;
    /** 固定宽度或 Tailwind 宽度类名 */
    width?: string | number;
    /** 最小宽度或 Tailwind 最小宽度类名 */
    minWidth?: string | number;
    /** 单元格额外样式类 */
    className?: string;
    /** 单元格内容额外样式类（className 别名） */
    cellClassName?: string;
    /** 表头额外样式类 */
    headerClassName?: string;
}

export declare interface DataTableProps<T> {
    /** 列定义 */
    columns: DataTableColumn<T>[];
    /** 数据行（与 rows 等价，兼容两种写法） */
    data?: T[];
    /** 数据行别名 */
    rows?: T[];
    /** 行主键提取函数（与 rowKey 等价） */
    keyExtractor?: (item: T, index: number) => string | number;
    /** 行主键提取函数别名 */
    rowKey?: (item: T, index: number) => string | number;
    /** 空状态自定义节点（传入后覆盖 emptyTitle / emptyDescription） */
    emptyNode?: default_2.ReactNode;
    /** 默认空状态主标题 */
    emptyTitle?: default_2.ReactNode;
    /** 默认空状态副标题 */
    emptyDescription?: default_2.ReactNode;
    /** 默认空状态自定义图标 */
    emptyIcon?: default_2.ReactNode;
    /** 默认空状态底部操作区 */
    emptyAction?: default_2.ReactNode;
    /** 空状态快捷重置回调 */
    onEmptyReset?: () => void;
    /** 空状态重置按钮文案 */
    emptyResetText?: string;
    /** 加载中状态（展示结构化骨架行并广播 aria-live 状态） */
    loading?: boolean;
    /** 骨架行数（默认 5） */
    skeletonRows?: number;
    /** 屏幕阅读器加载态提示文案 */
    loadingStatusText?: string;
    /** 空数据时是否保留表头（默认 false） */
    keepHeaderWhenEmpty?: boolean;
    /** 是否渲染外框与背景卡片（默认 true） */
    framed?: boolean;
    /** 行点击回调（自动启用键盘 Enter / Space 激活支持） */
    onRowClick?: (item: T) => void;
    /** 当前选中行主键值 */
    selectedRowKey?: string | number | null;
    /** 横向滚动区域的无障碍标签 */
    scrollLabel?: string;
    /** 是否开启吸顶表头 */
    stickyHeader?: boolean;
    /** 表格行距密度 */
    density?: 'compact' | 'comfortable' | 'relaxed' | AbcSize;
    /** 可选集成底部分页条（支持页码 / 游标双模 SmartPagination） */
    pagination?: PaginationProps;
    /** 表格语义标题（sr-only） */
    caption?: string;
    className?: string;
}

export declare const DatePicker: default_2.ForwardRefExoticComponent<DatePickerProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface DatePickerProps {
    value?: string;
    defaultValue?: string;
    onChange?: (dateStr: string) => void;
    placeholder?: string;
    allowClear?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    format?: string;
    shortcuts?: boolean | DatePickerShortcut[];
    id?: string;
    name?: string;
    minDate?: string;
    maxDate?: string;
    size?: ControlSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare interface DatePickerShortcut {
    label: string;
    value: string | (() => string);
}

/**
 * 企业级单日期选择器 (DatePicker)
 * 基于 @abc-design/core 42 格月历算法 + Portal 浮层定位，支持年/月四向切换、快捷预设与深色模式
 */
export declare interface DateRange {
    start: string;
    end: string;
}

export declare type DateRangeInput = DateRangeTuple | {
    start?: string;
    end?: string;
} | null;

export declare const DateRangePicker: default_2.ForwardRefExoticComponent<DateRangePickerProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface DateRangePickerProps {
    value?: DateRangeInput;
    defaultValue?: DateRangeInput;
    /** 根据传入 value/defaultValue 形态自动返回对象 { start, end } 或元组 [start, end] */
    onChange?: (range: any) => void;
    placeholder?: string | [string, string];
    allowClear?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    format?: string;
    shortcuts?: boolean | DateRangeShortcut[];
    id?: string;
    minDate?: string;
    maxDate?: string;
    size?: ControlSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare interface DateRangeShortcut {
    label: string;
    getValue: () => DateRangeTuple | DateRange;
}

export declare type DateRangeTuple = [string, string];

export declare const DEFAULT_ABC_LAYOUT_SETTINGS: AbcLayoutSettings;

export declare const DEFAULT_JSON_TREE_LABELS: Required<JsonTreeViewerLabels>;

export declare const DENSITY_CELL_PY: Record<AbcTableDensity, string>;

export declare const DescriptionItem: React_2.ForwardRefExoticComponent<DescriptionItemProps & React_2.RefAttributes<HTMLDivElement>>;

declare interface DescriptionItem_2 {
    key?: string;
    label: default_2.ReactNode;
    children: default_2.ReactNode;
    /** 占据的网格列数（默认 1） */
    span?: number;
}

export declare interface DescriptionItemData {
    key?: React_2.Key;
    label: React_2.ReactNode;
    value: React_2.ReactNode;
    mono?: boolean;
    copyValue?: string;
    emptyText?: React_2.ReactNode;
    span?: 1 | 2 | 3 | 4 | 'full';
    className?: string;
}

export declare interface DescriptionItemProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    label: React_2.ReactNode;
    value?: React_2.ReactNode;
    mono?: boolean;
    copyValue?: string;
    emptyText?: React_2.ReactNode;
    span?: 1 | 2 | 3 | 4 | 'full';
    variant?: 'default' | 'cards' | 'divided' | 'compact';
    valueClassName?: string;
}

/**
 * 结构化元数据描述列表组件
 * 基于语义化 dl/dt/dd 标签，支持多列网格、卡片化、分隔线与紧凑排版
 */
export declare const DescriptionList: React_2.ForwardRefExoticComponent<DescriptionListProps & React_2.RefAttributes<HTMLDListElement>>;

export declare const DescriptionListItem: React_2.ForwardRefExoticComponent<DescriptionItemProps & React_2.RefAttributes<HTMLDivElement>>;

export declare type DescriptionListItemProps = DescriptionItemProps;

export declare interface DescriptionListProps extends React_2.HTMLAttributes<HTMLDListElement> {
    columns?: 1 | 2 | 3 | 4;
    variant?: 'default' | 'cards' | 'divided' | 'compact';
    density?: 'default' | 'compact';
    bordered?: boolean;
    /** 当项值为 null / undefined / '' 时的统一占位内容（默认 '-'） */
    emptyText?: React_2.ReactNode;
    items?: DescriptionItemData[];
}

/**
 * 详情键值对描述列表 (Descriptions)
 * 用于用户画像抽屉、订单详情弹窗与配置参数核对面板
 */
export declare const Descriptions: default_2.FC<DescriptionsProps>;

export declare interface DescriptionsProps {
    title?: default_2.ReactNode;
    extra?: default_2.ReactNode;
    items: DescriptionItem_2[];
    column?: 1 | 2 | 3 | 4;
    bordered?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/**
 * 企业级模态对话框
 *
 * 【交互与容器选型规范】
 * 1. 专用于小表单操作与轻量确认（如重命名、状态流转、单字段修改、二次确认等少字段场景），居中聚焦单一任务。
 * 2. 天然支持多级遮罩堆叠（通过多层 Dialog 依次弹出与关闭）。
 * 3. 严禁承载大表单或复杂长表单（大表单必须使用 Drawer，避免顶部被顶出视口）。
 *
 * 采用原生 HTML <dialog> + showModal() 顶层渲染，天然具备背景 inert 隔离、焦点锁与归还能力；
 * 结合 CSS overscroll-behavior: contain 杜绝滚动穿透且不篡改 body overflow 导致页面滚动条跳动。
 */
export declare const Dialog: default_2.FC<DialogProps>;

export declare function DialogContent({ className, children, closeLabel, closeDisabled, closable, onClose: contentOnClose, ...props }: DialogContentProps): default_2.JSX.Element;

export declare interface DialogContentProps extends default_2.HTMLAttributes<HTMLDivElement> {
    closeLabel?: string;
    closeDisabled?: boolean;
    closable?: boolean;
    onClose?: () => void;
}

export declare const DialogContext: default_2.Context<DialogContextValue | null>;

export declare interface DialogContextValue {
    isOpen: boolean;
    handleClose: () => void;
    closeDisabled: boolean;
    hasHeader: boolean;
    titleId: string;
}

export declare function DialogDescription({ className, children, ...props }: default_2.HTMLAttributes<HTMLParagraphElement>): default_2.JSX.Element;

export declare function DialogFooter({ className, children, ...props }: default_2.HTMLAttributes<HTMLDivElement>): default_2.JSX.Element;

export declare function DialogHeader({ className, children, ...props }: default_2.HTMLAttributes<HTMLDivElement>): default_2.JSX.Element;

export declare interface DialogProps extends Omit<default_2.DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open' | 'onClose' | 'onCancel' | 'children'> {
    /** 允许透传自定义 data-* 属性至原生 <dialog> 节点 */
    [dataAttr: `data-${string}`]: string | number | boolean | undefined;
    /** 控制模态框显隐（兼容 open / visible / isOpen 三种命名习惯） */
    open?: boolean;
    visible?: boolean;
    isOpen?: boolean;
    /** 请求关闭回调（兼容 onClose / onCancel） */
    onClose?: () => void;
    onCancel?: () => void;
    /** 兼容 onOpenChange 签名 */
    onOpenChange?: (open: boolean) => void;
    /** 是否展示右上角关闭按钮（默认 true） */
    closable?: boolean;
    /** 是否禁用关闭按钮（如表单提交中） */
    closeDisabled?: boolean;
    /** 关闭按钮无障碍文案，默认 '关闭' */
    closeLabel?: string;
    /** 标题内容 */
    title?: default_2.ReactNode;
    /** 副标题或辅助描述 */
    description?: default_2.ReactNode;
    /** 主体内容 */
    children: default_2.ReactNode;
    /** 底部操作区 */
    footer?: default_2.ReactNode;
    /** 预设宽度规格 */
    size?: DialogSize | string;
    /** size 语义别名 */
    maxWidth?: DialogSize | string;
    /** 自定义宽度 CSS 值（如 '680px'） */
    width?: string;
    /** 点击遮罩空白处是否允许关闭（默认 true） */
    closeOnClickModal?: boolean;
    /** 是否支持按住标题栏拖拽位移（默认 true） */
    draggable?: boolean;
    /** 是否显示最大化/还原全屏按钮（默认 true） */
    fullscreenable?: boolean;
    /** 受控全屏状态 */
    fullscreen?: boolean;
    /** 全屏状态变化回调 */
    onFullscreenChange?: (fullscreen: boolean) => void;
    /** 是否启用焦点锁定（原生 showModal 天然支持，保留字段兼容既有调用） */
    focusTrap?: boolean;
    /** 面板显隐动效规格 */
    motion?: AbcMotionPreset;
    /** 面板附加类名 */
    className?: string;
}

/**
 * 企业级高保真模态弹窗组件 (Dialog / Modal)
 *
 * 【容器交互选型与多级交互铁律】
 * 1. 对于大表单交互操作展示必须使用抽屉（Drawer），全高右侧贴合具备吸附 Header/Footer 与原生垂直滚动流，避免居中 Modal 在大表单下顶部被顶出可视区。
 * 2. 打开一层抽屉是大表单、在该表单上需要打开另一个表单也是大表单的情况，必须使用子级抽屉（二级抽屉 L1 -> L2），优先使用 cascadeMode="adjacent"（平级并排对比展示），避免多层遮罩覆盖与内容割裂。
 * 3. 如果是小表单或轻量确认操作（操作项较小、步骤简单），使用 Modal/Dialog，支持多级堆叠展示（z-index 自动高于抽屉）。
 * 4. Dialog 内部采用显式绝对居中规范，彻底避免在非标准视口或长内容下被顶出可视区。
 */
export declare type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export declare const DialogTitle: default_2.ForwardRefExoticComponent<default_2.HTMLAttributes<HTMLHeadingElement> & default_2.RefAttributes<HTMLHeadingElement>>;

/** 字典驱动下拉框（通过 AbcProvider.dictAdapter 解耦具体业务接口） */
export declare const DictSelect: default_2.FC<DictSelectProps>;

export declare interface DictSelectProps extends Omit<SelectProps, 'options'> {
    dictCode?: string;
    /** dictCode 语义别名 */
    dictKey?: string;
    /** 前置扩展静态选项（如“全部”） */
    prependOptions?: SelectOption[];
    /** 后置扩展静态选项 */
    appendOptions?: SelectOption[];
}

/** 字典值自动映射状态标签 */
export declare const DictTag: default_2.FC<DictTagProps>;

export declare interface DictTagProps {
    dictCode?: string;
    /** dictCode 语义别名 */
    dictKey?: string;
    value: string | number | undefined | null;
    dot?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    emptyText?: string;
    fallbackTone?: StatusTone;
    className?: string;
}

/** 关闭并销毁指定 ID 的 Toast 通知 */
export declare function dismissToast(id: string): void;

/** 分割线组件 */
export declare const Divider: default_2.FC<DividerProps>;

export declare interface DividerProps extends default_2.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    label?: default_2.ReactNode;
}

export declare function downloadTableCsv<T extends Record<string, any>>(filename: string, columns: AbcColumn<T>[], rows: T[]): string;

/**
 * 企业级多级可调宽抽屉组件
 *
 * 【容器交互选型与多级交互铁律】
 * 1. 对于大表单交互操作展示必须使用抽屉（Drawer），全高右侧贴合具备吸附 Header/Footer 与原生垂直滚动流，避免居中 Modal 在大表单下顶部被顶出可视区。
 * 2. 打开一层抽屉是大表单、在该表单上需要打开另一个表单也是大表单的情况，必须使用子级抽屉（二级抽屉 L1 -> L2），优先使用 cascadeMode="adjacent"（平级并排对比展示），避免多层遮罩覆盖与内容割裂。
 * 3. 如果是小表单或轻量确认操作（操作项较小、步骤简单），使用 Modal/Dialog，支持多级堆叠展示（z-index 自动高于抽屉）。
 * 4. 支持多抽屉栈自动协同管理、视口宽度碰撞自适应等比缩放、拖拽边缘无级调宽与本地记忆。
 */
export declare const Drawer: default_2.FC<DrawerProps>;

export declare function DrawerBody({ className, ...props }: default_2.HTMLAttributes<HTMLDivElement>): default_2.JSX.Element;

export declare function DrawerDescription({ className, ...props }: default_2.HTMLAttributes<HTMLParagraphElement>): default_2.JSX.Element;

export declare function DrawerFooter({ className, ...props }: default_2.HTMLAttributes<HTMLDivElement>): default_2.JSX.Element;

export declare function DrawerHeader({ className, ...props }: default_2.HTMLAttributes<HTMLDivElement>): default_2.JSX.Element;

export declare interface DrawerNavigation {
    /** 当前条目位置（1-based，若无匹配则 <= 0） */
    current: number;
    /** 总条目数 */
    total: number;
    onPrev: () => void;
    onNext: () => void;
    prevLabel?: string;
    nextLabel?: string;
}

export declare interface DrawerProps {
    open?: boolean;
    visible?: boolean;
    onClose: () => void;
    title?: default_2.ReactNode;
    description?: default_2.ReactNode;
    /** 标题右侧状态徽标 */
    badge?: default_2.ReactNode;
    /** 顶栏行上下快速切换器（上一条 / 下一条 与位置指示） */
    navigation?: DrawerNavigation;
    /** 顶栏右侧扩展操作区（如“清除选择”或快捷动作） */
    headerActions?: default_2.ReactNode;
    /** 关闭按钮无障碍文案 */
    closeLabel?: string;
    /** 全宽展开按钮无障碍文案 */
    expandLabel?: string;
    /** 还原默认宽度按钮无障碍文案 */
    restoreLabel?: string;
    children: default_2.ReactNode;
    footer?: default_2.ReactNode;
    size?: DrawerSize;
    motion?: AbcMotionPreset;
    width?: number | string;
    placement?: 'right' | 'left';
    closeOnClickModal?: boolean;
    /** 是否允许拖拽边缘调节宽度（默认开启） */
    resizable?: boolean;
    /** 拖拽调节的最小像素宽度 */
    minWidth?: number;
    /** 持久化记忆抽屉宽度的存储键 */
    storageKey?: string;
    /** 打开子抽屉时当前抽屉是否自动向左层叠推移（默认开启） */
    push?: boolean;
    /** 每层子抽屉推移像素值（stack 模式下生效，默认 140） */
    pushDistance?: number;
    /** 多级抽屉展示交互模式：'stack' 为传统向左堆叠推挤缩放，'adjacent' 为平级并排展开以便两级同时清晰观测 */
    cascadeMode?: 'stack' | 'adjacent';
    /** 平级并排展示模式下的向左推移间距（默认 560px） */
    adjacentOffset?: number;
    bodyClassName?: string;
    panelClassName?: string;
    className?: string;
    role?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}

export declare type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export declare function DrawerTitle({ className, ...props }: default_2.HTMLAttributes<HTMLHeadingElement>): default_2.JSX.Element;

/**
 * 视口感知顶层下拉菜单与气泡浮层组件 (Dropdown / Popover)
 * 遵循无障碍规范：
 * 1. 当使用 hover 触发时，同时保留点击、触控与键盘激活能力，并配备安全悬停桥接延迟与 Esc 关闭（WCAG 2.1.1 / 1.4.13）；
 * 2. 声明式菜单模式完整实现上下方向键、Home/End 焦点巡航契约；自定义面板模式不滥用 role="menu"。
 */
export declare const Dropdown: default_2.FC<DropdownProps>;

/**
 * 复合下拉菜单容器 (DropdownMenu)
 */
export declare function DropdownMenu({ open: controlledOpen, defaultOpen, onOpenChange, children, }: DropdownMenuProps): default_2.JSX.Element;

declare interface DropdownMenuCompoundItemProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    inset?: boolean;
}

export declare const DropdownMenuContent: default_2.ForwardRefExoticComponent<DropdownMenuContentProps & default_2.RefAttributes<HTMLDivElement>>;

declare interface DropdownMenuContentProps extends default_2.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'end';
    sideOffset?: number;
}

export declare const DropdownMenuGroup: default_2.FC<default_2.HTMLAttributes<HTMLDivElement>>;

export declare const DropdownMenuItem: default_2.ForwardRefExoticComponent<DropdownMenuCompoundItemProps & default_2.RefAttributes<HTMLButtonElement>>;

export declare interface DropdownMenuItem {
    key: string;
    label: default_2.ReactNode;
    icon?: default_2.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    /** 独立分割线菜单项 */
    divider?: boolean;
    dividerAbove?: boolean;
    onClick?: (event: default_2.MouseEvent<HTMLButtonElement>) => void;
    /** 可选自定义菜单项节点（如包裹路由 Link） */
    render?: (close: () => void) => default_2.ReactNode;
}

export declare const DropdownMenuLabel: default_2.ForwardRefExoticComponent<default_2.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
} & default_2.RefAttributes<HTMLDivElement>>;

declare interface DropdownMenuProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: default_2.ReactNode;
}

export declare const DropdownMenuSeparator: default_2.ForwardRefExoticComponent<default_2.HTMLAttributes<HTMLDivElement> & default_2.RefAttributes<HTMLDivElement>>;

export declare const DropdownMenuShortcut: default_2.FC<default_2.HTMLAttributes<HTMLSpanElement>>;

export declare const DropdownMenuTrigger: default_2.ForwardRefExoticComponent<DropdownMenuTriggerProps & default_2.RefAttributes<HTMLButtonElement>>;

declare interface DropdownMenuTriggerProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

export declare interface DropdownProps {
    items?: DropdownMenuItem[];
    /** 自定义弹层面板内容（未传 items 或需要复杂布局时使用） */
    content?: default_2.ReactNode;
    align?: 'left' | 'right';
    /** 弹出方位（兼容 bottomLeft / bottomRight / topLeft / topRight） */
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
    trigger?: 'click' | 'hover';
    /** 受控打开状态 */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    motion?: AbcMotionPreset;
    children: default_2.ReactNode;
    className?: string;
    panelClassName?: string;
}

/** 双栏紧凑导航（左侧极窄主轨 Rail + 右侧二级子菜单面板，同步响应四档尺寸与动效规格） */
export declare const DualColumnNav: default_2.FC<{
    brand?: AbcBrandInfo;
    items: AbcMenuItem[];
    pathname: string;
    tone?: AbcSidebarTone;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
    onNavigate: (path: string, item: AbcMenuItem) => void;
}>;

export declare const DURATION_UNIT_FACTORS: Record<DurationUnit, number>;

export declare const DURATION_UNITS: readonly DurationUnit[];

export declare function DurationQuotaInput({ locale, zeroMeansUnlimited, defaultZeroUnit, allowedUnits, unitAriaLabel, ...rest }: DurationQuotaInputProps): React_2.JSX.Element;

export declare interface DurationQuotaInputProps extends QuotaUnitInputBaseProps {
    locale?: 'en' | 'zh';
    zeroMeansUnlimited?: boolean;
    defaultZeroUnit?: DurationUnit;
    allowedUnits?: readonly DurationUnit[];
    unitAriaLabel?: string;
}

export declare type DurationUnit = 's' | 'm' | 'h' | 'd';

export declare interface EditableProColumn<T = Record<string, any>> {
    key: string;
    title: default_2.ReactNode;
    dataIndex?: keyof T & string;
    width?: number | string;
    align?: 'left' | 'center' | 'right';
    /** 当前单元格是否允许编辑（默认 true） */
    editable?: boolean | ((row: T, index: number) => boolean);
    /** 内置编辑器类型（默认 'text'） */
    valueType?: EditableProEditorType;
    /** select 类型选项列表 */
    options?: Array<{
        label: default_2.ReactNode;
        value: string | number;
        disabled?: boolean;
    }>;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    /** 列级校验函数，返回错误文案字符串表示校验失败 */
    validator?: (value: any, row: T, rows: T[]) => string | undefined;
    /** 只读展示态自定义渲染 */
    render?: (value: any, row: T, index: number) => default_2.ReactNode;
    /** 编辑态自定义控件渲染 */
    renderEditor?: (value: any, row: T, onChange: (val: any) => void, index: number) => default_2.ReactNode;
}

export declare type EditableProEditorType = 'text' | 'number' | 'select' | 'switch' | 'date';

export declare interface EditableProRecordCreatorProps<T = Record<string, any>> {
    position?: 'top' | 'bottom';
    record: () => T;
    label?: default_2.ReactNode;
    maxRows?: number;
}

/**
 * 企业级行内/整表可编辑表格 (EditableProTable)
 * 支持 'row'（逐行编辑/校验拦截/取消回滚）与 'table'（整表实时编辑与校验）双模式，内置脏数据检测与行增删
 */
export declare function EditableProTable<T = Record<string, any>>({ value, defaultValue, onChange, columns, rowKey, mode, recordCreatorProps, deletable, summaryRender, onSaveRow, className, }: EditableProTableProps<T>): default_2.ReactElement;

export declare interface EditableProTableProps<T = Record<string, any>> {
    /** 受控行数据列表 */
    value?: T[];
    /** 非受控初始行数据列表 */
    defaultValue?: T[];
    /** 数据变更回调 */
    onChange?: (next: T[]) => void;
    /** 可编辑列配置 */
    columns: EditableProColumn<T>[];
    /** 主键字段名（默认 'id'） */
    rowKey?: keyof T & string;
    /** 编辑模式：'row' 单行点击编辑保存/取消回滚 | 'table' 整表实时编辑（默认 'row'） */
    mode?: 'row' | 'table';
    /** 新增行配置；传入 false 关闭新增按钮 */
    recordCreatorProps?: false | EditableProRecordCreatorProps<T>;
    /** 是否允许删除行（默认 true） */
    deletable?: boolean;
    /** 表格底部汇总行自定义渲染 */
    summaryRender?: (rows: T[]) => default_2.ReactNode;
    /** 单行保存钩子（返回 Promise 时自动呈现加载态） */
    onSaveRow?: (row: T, index: number) => void | Promise<void>;
    className?: string;
}

declare interface EmojiTextSegment {
    type: 'text' | 'emoji';
    value: string;
    srText?: string;
}

/** 空状态占位组件（支持多尺寸层级与一键重置筛选交互） */
export declare const EmptyState: default_2.FC<EmptyStateProps>;

export declare interface EmptyStateProps {
    title?: default_2.ReactNode;
    /** title 语义兼容别名 */
    message?: default_2.ReactNode;
    description?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    action?: default_2.ReactNode;
    /** 快捷重置筛选回调（未传自定义 action 时自动渲染重置按钮） */
    onReset?: () => void;
    /** 重置按钮文案 */
    resetText?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    compact?: boolean;
    className?: string;
}

/**
 * 全局或容器级应用异常兜底边界 (ErrorBoundary)
 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState;
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentDidUpdate(prevProps: ErrorBoundaryProps): void;
    reset: () => void;
    private handleHome;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | JSX.Element | null | undefined;
}

export declare interface ErrorBoundaryProps {
    children: ReactNode;
    /** 展示形态：全屏兜底或局部容器兜底 */
    variant?: 'fullscreen' | 'panel';
    /** 路由或模块标识变更时自动复位异常状态 */
    resetKey?: string | number;
    title?: string;
    /** 兼容模块级标题配置 */
    tabTitle?: string;
    description?: string;
    reloadText?: string;
    homeText?: string;
    /** 自定义重试回调；与 onReset 均未传时默认刷新当前浏览器页面 */
    onReload?: () => void;
    /** 模块内局部重置回调（传入时不触发整页 window.location.reload） */
    onReset?: () => void;
    /** 自定义返回首页回调；未传时默认跳转至 '/' */
    onNavigateHome?: () => void;
    /** 是否隐藏返回首页按钮（局部模块边界默认不展示全站跳转） */
    showHomeButton?: boolean;
    /** 异常上报钩子 */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** 自定义降级渲染节点或函数 */
    fallback?: ReactNode | ((error: Error, reset: () => void, errorInfo: ErrorInfo | null) => ReactNode);
    className?: string;
}

declare interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export declare function extractLeadingEmojiToken(text: string): {
    prefix: string;
    token: string | null;
    rest: string;
};

/**
 * 通用多文件拖拽上传与校验列表组件 (FileUpload)
 * 严格遵循原生按钮焦点触发、类型/大小/数量前置校验、上传进度展示与无障碍错误广播。
 */
export declare const FileUpload: default_2.FC<FileUploadProps>;

export declare interface FileUploadItem {
    uid: string;
    name: string;
    size: number;
    type?: string;
    url?: string;
    status?: FileUploadStatus;
    percent?: number;
    error?: string;
}

export declare interface FileUploadProps {
    value?: FileUploadItem[];
    defaultValue?: FileUploadItem[];
    onChange?: (files: FileUploadItem[]) => void;
    /** 自定义上传执行器（缺省时降级使用 AbcProvider.uploadAdapter 或本地对象 URL 预览） */
    customUpload?: (file: File, onProgress?: (percent: number) => void) => Promise<string | {
        url: string;
    }>;
    accept?: string;
    multiple?: boolean;
    maxCount?: number;
    maxSizeMB?: number;
    disabled?: boolean;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: default_2.ReactNode;
    required?: boolean;
    dragTitle?: default_2.ReactNode;
    dragHint?: default_2.ReactNode;
    id?: string;
    className?: string;
}

export declare type FileUploadStatus = 'uploading' | 'done' | 'error';

export declare const FILTER_HIGHLIGHT_SWATCHES: {
    color: string;
    label: string;
}[];

/**
 * 嵌套可视化规则筛选构建器 (FilterBuilder / RuleBuilder)
 * 驱动 @abc-design/core AST 节点树，支持三段式联动、多级嵌套与只读逻辑表达式预览。
 */
export declare const FilterBuilder: default_2.FC<FilterBuilderProps>;

export declare interface FilterBuilderProps {
    /** 可用字段 Schema 定义列表 */
    fields: AbcRuleFieldSchema[];
    /** 受控规则组树 */
    value?: AbcRuleGroup;
    /** 非受控初始规则组树 */
    defaultValue?: AbcRuleGroup;
    /** 规则树任意节点变更时触发 */
    onChange?: (next: AbcRuleGroup) => void;
    /** 最大嵌套深度（默认 2；0 表示不允许添加子条件组） */
    maxDepth?: number;
    /** 是否在底部展示只读逻辑表达式摘要与复制按钮（默认 true） */
    showSummary?: boolean;
    /** 全局禁用态 */
    disabled?: boolean;
    /** 无障碍区域标签 */
    ariaLabel?: string;
    className?: string;
}

/** 搜索筛选卡片样式 */
export declare const filterCardClass = "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-4 shadow-[var(--abc-shadow-card)]";

/**
 * 分类胶囊单选/多选组 (FilterPillGroup)
 * 用于状态过滤（单选互斥）或标签集合勾选（multiple 多选）的快速切换
 */
export declare function FilterPillGroup<T extends string = string>(props: FilterPillGroupSingleProps<T>): React_2.ReactElement;

export declare function FilterPillGroup<T extends string = string>(props: FilterPillGroupMultipleProps<T>): React_2.ReactElement;

export declare interface FilterPillGroupMultipleProps<T extends string = string> extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /** 开启多选胶囊模式（点击已选胶囊取消选中，点击未选胶囊追加选中） */
    multiple: true;
    options: ReadonlyArray<FilterPillOption<T>>;
    value: ReadonlyArray<string>;
    onValueChange: (value: T[]) => void;
    size?: 'xs' | 'sm' | 'md';
}

export declare type FilterPillGroupProps<T extends string = string> = FilterPillGroupSingleProps<T> | FilterPillGroupMultipleProps<T>;

export declare interface FilterPillGroupSingleProps<T extends string = string> extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /** 是否开启多选模式（默认 false 为单选互斥模式） */
    multiple?: false;
    options: ReadonlyArray<FilterPillOption<T>>;
    value: T;
    onValueChange: (value: T) => void;
    size?: 'xs' | 'sm' | 'md';
}

export declare interface FilterPillOption<T extends string = string> {
    value: T;
    label: React_2.ReactNode;
    count?: number;
    icon?: React_2.ReactNode;
    disabled?: boolean;
}

/**
 * 筛选工具栏 (FilterToolbar)
 * 用于统一容纳快速搜索框、筛选项下拉组、枚举胶囊组与全局重置按钮
 */
export declare const FilterToolbar: React_2.ForwardRefExoticComponent<FilterToolbarProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface FilterToolbarProps extends React_2.HTMLAttributes<HTMLDivElement> {
    surface?: boolean;
    hasActiveFilters?: boolean;
    onReset?: () => void;
    resetLabel?: React_2.ReactNode;
    search?: React_2.ReactNode;
    filters?: React_2.ReactNode;
    trailing?: React_2.ReactNode;
}

export declare function findBreadcrumbChain(items: AbcMenuItem[], pathname: string, acc?: AbcMenuItem[]): AbcMenuItem[];

export declare interface FlattenedRow<T> {
    record: T;
    key: string | number;
    rowIdx: number;
    depth: number;
    hasTreeChildren: boolean;
}

export declare function flattenNodeText(node: default_2.ReactNode): string;

export declare type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right' | 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'rightStart';

export declare interface FloatingPositionResult {
    style: default_2.CSSProperties;
    actualSide: FloatingSide;
    /** 箭头在主轴方向相对浮层左上角的像素偏移量 */
    arrowOffset: number;
    portalContainer: HTMLElement | null;
    update: () => void;
}

export declare type FloatingSide = 'top' | 'bottom' | 'left' | 'right';

export declare function formatFilterText(field: ProCrudSearchFieldItem, value: unknown): string;

export declare function formatQuotaBytes(bytes: number, _locale?: 'en' | 'zh', zeroLabel?: string): string;

export declare function formatQuotaDuration(seconds: number, locale?: 'en' | 'zh', zeroLabel?: string): string;

export declare const FormDrawerDialog: typeof ProFormContainer;

export declare type FormDrawerDialogInlineRenderProps = ProFormContainerInlineRenderProps;

export declare type FormDrawerDialogProps = ProFormContainerProps;

export declare type FormDrawerDialogSummaryRenderProps = ProFormContainerSummaryRenderProps;

/**
 * 标准表单项包装容器
 * 既支持包裹自定义控件 children，也支持直接作为带 Label / Hint / Error 的独立输入框使用
 */
export declare const FormField: default_2.ForwardRefExoticComponent<FormFieldProps & default_2.RefAttributes<HTMLInputElement>>;

export declare interface FormFieldProps extends Omit<InputProps, 'size' | 'error'> {
    /** 字段名称标签 */
    label?: default_2.ReactNode;
    /** 标签右侧附加内容（兼容 extra 语义别名） */
    labelExtra?: default_2.ReactNode;
    /** 关联表单控件的 htmlFor ID */
    htmlFor?: string;
    /** 是否必填标识 */
    required?: boolean;
    /** 标签右侧悬浮说明提示 */
    tooltip?: default_2.ReactNode;
    /** 校验错误提示文本 */
    error?: default_2.ReactNode;
    /** 底部辅助说明信息 */
    helperText?: default_2.ReactNode;
    /** 辅助说明文本（传入独立输入模式时渲染于输入框上方并关联 aria-describedby） */
    hint?: default_2.ReactNode;
    /** 右上角附加信息（如字数统计、快捷填充链接） */
    extra?: default_2.ReactNode;
    /** 排版方向 */
    layout?: 'vertical' | 'horizontal';
    /** 控件标签与间距规格（xs | sm | md | lg） */
    size?: AbcSize;
    /** 组件交互动效规格 */
    motion?: AbcMotionPreset;
    /** 暗色背景外观（用于认证页等深色容器） */
    dark?: boolean;
    /** 外层容器附加类名 */
    containerClassName?: string;
    className?: string;
    children?: default_2.ReactNode;
}

export declare function getNestedValue(obj: any, path: string | string[] | undefined): any;

/**
 * 解析浮层挂载的顶层安全容器：
 * 当触发器位于通过 showModal() 晋升至浏览器 #top-layer 的原生 <dialog open> 内部时，
 * 若盲目 Portal 到 document.body，会被模态层的背景 inert 机制拦截点击且绘制在遮罩下方；
 * 挂载到最近的 dialog[open] 既能逃逸内部滚动区的 overflow 裁剪，又保留在同一个 #top-layer 中。
 */
export declare function getOverlayPortalContainer(anchor?: Element | null): HTMLElement | null;

export declare const HeaderColumnFilterPopover: default_2.FC<HeaderColumnFilterPopoverProps>;

export declare interface HeaderColumnFilterPopoverProps {
    title: string;
    filterType?: 'text' | 'input' | 'number' | 'select' | 'treeSelect' | 'date' | 'datetimePicker' | 'dateRange';
    filterOptions?: SelectOption[];
    treeData?: Record<string, any>[];
    multiple?: boolean;
    searchable?: boolean;
    placeholder?: string;
    format?: string;
    /** 当前列是否因存在激活筛选而处于实底高亮态（自动切换触发图标为反白高对比色） */
    highlighted?: boolean;
    /** 触发器图标形态：'search' 用于表头筛选模式，'filter' 用于常规列过滤 */
    iconType?: 'filter' | 'search';
    confirmText?: string;
    value: any;
    onApply: (nextValue: any) => void;
}

/**
 * 模块聚合子导航栏 (HubNavBar)
 */
export declare function HubNavBar({ badge, layerBadge, badgeTone, layerTone, title, meta, navLabel, variant, children, className, ...props }: HubNavBarProps): React_2.JSX.Element;

export declare interface HubNavBarProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    badge?: React_2.ReactNode;
    layerBadge?: React_2.ReactNode;
    badgeTone?: 'indigo' | 'slate' | 'primary' | 'dark';
    layerTone?: 'indigo' | 'slate' | 'primary' | 'dark';
    title?: React_2.ReactNode;
    meta?: React_2.ReactNode;
    navLabel?: string;
    variant?: 'compact' | 'layered' | 'pill';
    children: React_2.ReactNode;
}

export declare function hubNavTabClassName(active: boolean, variant?: 'compact' | 'layered' | 'pill'): string;

export declare const Icon: default_2.FC<IconProps>;

export declare const ICON_CATALOG: IconItem[];

/**
 * 图标徽标组件 (IconBadge)
 */
export declare function IconBadge({ token, icon, label, variant, tone, size, iconSize, iconClassName, srText, className, ...props }: IconBadgeProps): React_2.JSX.Element;

export declare interface IconBadgeProps extends React_2.HTMLAttributes<HTMLSpanElement> {
    token?: string;
    icon?: React_2.ReactNode;
    label?: React_2.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    tone?: IconBadgeTone;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    iconSize?: number;
    iconClassName?: string;
    srText?: string;
}

export declare type IconBadgeTone = 'indigo' | 'emerald' | 'violet' | 'sky' | 'amber' | 'cyan' | 'fuchsia' | 'rose' | 'teal' | 'slate';

export declare interface IconItem {
    name: string;
    label: string;
    category: string;
}

/**
 * 企业级可视化菜单图标选择器 (IconPicker)
 * 同时支持两种调用模式：
 * 1. 受控弹窗模式：<IconPicker open={open} current={val} onClose={...} onSelect={...} />
 * 2. 内联表单控件模式：<IconPicker value={val} onChange={setVal} />
 */
export declare const IconPicker: default_2.FC<IconPickerProps>;

export declare interface IconPickerProps {
    /** 受控模态窗打开状态；若省略则自动渲染为带触发器的表单选择控件 */
    open?: boolean;
    /** 当前图标值（兼容旧版受控模态属性名） */
    current?: string;
    /** 受控表单图标值 */
    value?: string;
    /** 关闭模态回调 */
    onClose?: () => void;
    /** 选择图标回调（兼容旧版受控模态属性名） */
    onSelect?: (iconName: string) => void;
    /** 表单值变更回调 */
    onChange?: (iconName: string) => void;
    /** 内联触发器占位提示 */
    placeholder?: string;
    /** 是否允许一键清空 */
    clearable?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 内联触发器尺寸规格 */
    size?: AbcSize;
    /** 组件交互动效规格 */
    motion?: AbcMotionPreset;
    className?: string;
}

export declare interface IconProps {
    /** 图标注册名称（支持 Lucide 名、语义短名或 el-icon-* 历史名称） */
    name?: string;
    /** 可选传入菜单文本用于智能语义推导最佳图标 */
    text?: string;
    /** 像素尺寸 */
    size?: number | string;
    /** 线条粗细 */
    strokeWidth?: number;
    /** 自定义类名 */
    className?: string;
    /** 局部注入的额外注册表 */
    registry?: Record<string, AbcIconComponent>;
}

/**
 * 统一图形缩略图与灯箱预览组件
 * 原生兼容常规图片 URL 与内联 SVG 源码字符串，并在 src 变更时自动复位加载异常状态
 */
export declare const ImagePreview: default_2.FC<ImagePreviewProps>;

export declare interface ImagePreviewProps {
    /** 支持远程图片直链、DataURL 或原始内联 <svg>...</svg> 代码 */
    src?: string | null;
    alt?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    width?: number | string;
    height?: number | string;
    rounded?: boolean;
    fit?: 'cover' | 'contain';
    placeholder?: default_2.ReactNode;
    className?: string;
    /** 是否允许点击打开灯箱放大旋转查看（默认开启） */
    zoomable?: boolean;
}

/**
 * 零业务耦合图片/SVG 上传组件
 * 通过 AbcProvider.uploadAdapter 或 customUpload 注入上传逻辑，彻底剥离固定后端 API 耦合
 */
export declare const ImageUpload: default_2.FC<ImageUploadProps>;

export declare interface ImageUploadProps {
    /** 当前图片 URL 或内联 <svg> 字符串 */
    value?: string;
    /** 上传成功或清空后的回调 */
    onChange?: (nextUrl: string) => void;
    /** 可选内联表单标签 */
    label?: default_2.ReactNode;
    /** 底部辅助说明文案 */
    helperText?: default_2.ReactNode;
    /** 校验错误信息 */
    error?: string;
    /** 允许的 MIME 类型 */
    accept?: string;
    /** 最大单文件体积（MB） */
    maxSizeMB?: number;
    /** 是否禁用 */
    disabled?: boolean;
    /** 局部自定义上传函数（优先级高于 AbcProvider.uploadAdapter；若均未注入则自动转 DataURL 预览用于原型演练） */
    customUpload?: (file: File) => Promise<string>;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    placeholder?: string;
    className?: string;
}

/**
 * 企业级文本输入框
 * 支持受控/非受控、前置/后置插槽、一键清空并自动回焦、密码明密文切换、字数统计与内联校验提示
 */
export declare const Input: default_2.ForwardRefExoticComponent<InputProps & default_2.RefAttributes<HTMLInputElement>>;

/** 输入框基础样式（紧凑高度，与次要/主按钮对齐） */
export declare const inputClass = "w-full h-8.5 rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] px-3 py-1.5 text-xs text-[var(--abc-fg)] placeholder:text-[var(--abc-fg-placeholder)] hover:border-[var(--abc-border-strong)] focus:border-[var(--abc-primary)] focus:ring-2 focus:ring-[var(--abc-ring)] focus:outline-none transition-all disabled:bg-[var(--abc-bg-muted)] disabled:text-[var(--abc-fg-muted)] disabled:cursor-not-allowed";

/** 步进数值输入框（等宽数字对齐） */
export declare const InputNumber: default_2.FC<InputNumberProps>;

export declare interface InputNumberProps {
    value?: number | null;
    defaultValue?: number;
    onChange?: (val: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    size?: ControlSize;
    motion?: AbcMotionPreset;
    disabled?: boolean;
    placeholder?: string;
    invalid?: boolean;
    className?: string;
}

export declare interface InputProps extends Omit<default_2.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
    size?: ControlSize;
    /** 组件交互动效规格 */
    motion?: AbcMotionPreset;
    /** 内联字段标签（亦可配合外层 FormField 使用） */
    label?: default_2.ReactNode;
    /** 校验错误提示文案，存在时自动开启危险态高亮 */
    error?: string;
    /** 底部辅助提示说明 */
    helperText?: default_2.ReactNode;
    /** 前置插槽 */
    prefix?: default_2.ReactNode;
    /** 前置图标别名 */
    prefixIcon?: default_2.ReactNode;
    /** 后置插槽 */
    suffix?: default_2.ReactNode;
    /** 后置图标别名 */
    suffixIcon?: default_2.ReactNode;
    /** 是否支持一键清空 */
    allowClear?: boolean;
    /** allowClear 语义别名 */
    clearable?: boolean;
    /** 当 type="password" 时是否展示明密文切换按钮（默认开启） */
    passwordToggle?: boolean;
    /** 切换显示明文时的提示或无障碍标签 */
    showPasswordLabel?: string;
    /** 切换隐藏明文时的提示或无障碍标签 */
    hidePasswordLabel?: string;
    /** 是否展示底部字数统计 */
    showCount?: boolean;
    /** 清空按钮的无障碍标签 */
    clearLabel?: string;
    onClear?: () => void;
    invalid?: boolean;
    wrapperClassName?: string;
}

/**
 * 右侧检视面板 (InspectorPanel)
 * 用于承载右侧选定项的字段详情、状态流转和关联操作
 */
export declare const InspectorPanel: React_2.ForwardRefExoticComponent<InspectorPanelProps & React_2.RefAttributes<HTMLElement>>;

export declare interface InspectorPanelProps extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title'> {
    'aria-label'?: string;
    title?: React_2.ReactNode;
    subtitle?: React_2.ReactNode;
    badge?: React_2.ReactNode;
    headerActions?: React_2.ReactNode;
    showClear?: boolean;
    onClear?: () => void;
    clearLabel?: string;
    loading?: boolean;
    loadingText?: React_2.ReactNode;
    error?: React_2.ReactNode;
    isEmpty?: boolean;
    hasSelection?: boolean;
    emptyIcon?: React_2.ReactNode;
    emptyMessage?: React_2.ReactNode;
    emptyDescription?: React_2.ReactNode;
    footer?: React_2.ReactNode;
}

export declare const isFieldRequired: typeof isSchemaFieldRequired;

/**
 * 判断后端响应信封是否为业务错误码（兼容 code: 0 / 200 / '0' / '200' 成功约定）
 */
export declare function isProApiFailure(res: any): boolean;

/**
 * 鸭子类型探测校验 Schema（兼容 Zod v3 / v4）中的字段是否为必填项，无需引入 zod 运行时依赖
 */
export declare function isSchemaFieldRequired(schema: ProSchemaLike | undefined, fieldKey: string): boolean;

export declare function isSvgSource(src?: string | null): boolean;

/** JsonTreeViewer 复制事件回调载荷 */
export declare interface JsonTreeCopyInfo {
    kind: 'root' | 'value' | 'path';
    text: string;
    path: string;
}

/**
 * 通用结构化 JSON 树形检视与路径/值复制组件 (JsonTreeViewer)
 * 支持字符串自动解析与错误兜底、搜索高亮与祖先自动展开、路径/值一键复制、大列表分批展开与键盘无障碍树导航
 */
export declare const JsonTreeViewer: default_2.FC<JsonTreeViewerProps>;

/** JsonTreeViewer 文案国际化覆盖接口 */
export declare interface JsonTreeViewerLabels {
    searchPlaceholder?: string;
    clearSearchLabel?: string;
    expandAllLabel?: string;
    collapseAllLabel?: string;
    copyJsonLabel?: string;
    copyValueLabel?: string;
    copyPathLabel?: string;
    copiedLabel?: string;
    parseErrorTitle?: string;
    emptyText?: string;
    noMatchText?: string;
    expandTextLabel?: string;
    collapseTextLabel?: string;
    expandNodeLabel?: string;
    collapseNodeLabel?: string;
    maxDepthNotice?: string;
    searchTruncatedLabel?: string;
    showMoreItemsLabel?: (remaining: number) => string;
    matchCountLabel?: (count: number) => string;
}

export declare interface JsonTreeViewerProps extends Omit<default_2.HTMLAttributes<HTMLDivElement>, 'onCopy'> {
    /** 数据源：支持任意 JSON 值（对象/数组/原始值）或 JSON 原始字符串 */
    data: unknown;
    /** 当 data 为字符串时是否自动 JSON.parse（默认 true；解析失败自动渲染错误提示与原文兜底） */
    parseString?: boolean;
    /** 可选根节点展示键名（如 'root'），默认不显示根键名 */
    rootLabel?: string;
    /** 默认展开层级（默认 2；0 表示全部折叠，Infinity 表示全展开） */
    defaultExpandDepth?: number;
    /** 受控已展开路径集合（如 ['$', '$.items']） */
    expandedPaths?: string[];
    /** 非受控初始展开路径集合（传值时优先于 defaultExpandDepth） */
    defaultExpandedPaths?: string[];
    /** 展开路径变更回调 */
    onExpandedPathsChange?: (paths: string[]) => void;
    /** 是否显示顶部工具栏（默认 true） */
    showToolbar?: boolean;
    /** 工具栏扩展插槽 */
    toolbarExtra?: default_2.ReactNode;
    /** 是否开启搜索框（默认 true，受 showToolbar 控制显示） */
    searchable?: boolean;
    /** 受控搜索关键词 */
    searchQuery?: string;
    /** 非受控初始搜索关键词 */
    defaultSearchQuery?: string;
    /** 搜索关键词变更回调 */
    onSearchQueryChange?: (query: string) => void;
    /** 搜索时是否仅显示匹配节点及其祖先路径（默认 true；false 时保留整树仅高亮并展开匹配分支） */
    filterOnSearch?: boolean;
    /** 复制路径格式：'jsonpath'（$.a.b[0]）或 'dot'（a.b[0]），默认 'jsonpath' */
    pathFormat?: AbcJsonPathFormat;
    /** 是否开启复制操作（工具栏复制整段 JSON + 行内复制值与复制路径，默认 true） */
    copyable?: boolean;
    /** 复制成功回调 */
    onCopy?: (info: JsonTreeCopyInfo) => void;
    /** 单容器默认最大渲染直接子节点数（默认 100，支持点击分批追加） */
    maxChildren?: number;
    /** 长字符串默认折叠字符阈值（默认 240，超出显示展开/收起切换） */
    maxStringLength?: number;
    /** 最大递归深度保护（默认 20） */
    maxDepth?: number;
    /** 树内容滚动区域最大高度（数字按 px 处理，或传 CSS 长度如 '60dvh'） */
    maxHeight?: number | string;
    /** 是否展示容器摘要计数（如 {4 keys} / Array(12)，默认 true） */
    showItemCount?: boolean;
    /** 空数据提示文案（data === undefined 或空串时显示） */
    emptyText?: default_2.ReactNode;
    /** 国际化文案覆盖 */
    labels?: JsonTreeViewerLabels;
    /** 是否渲染外边框与卡片底色（默认 true） */
    bordered?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    ariaLabel?: string;
}

/** 键盘快捷键徽标 */
export declare const Kbd: default_2.FC<KbdProps>;

export declare interface KbdProps extends default_2.HTMLAttributes<HTMLElement> {
    size?: AbcSize;
    motion?: AbcMotionPreset;
}

/**
 * 路由无关的视图 DOM 保活、实时滚动高度记忆与单页签异常隔离容器
 * 通过 passive scroll 实时记录各路由滚动偏移并在 useLayoutEffect 同步复原，防止切页后容器高度坍缩导致 scrollTop 丢失。
 */
export declare const KeepAliveContainer: default_2.FC<KeepAliveContainerProps>;

export declare interface KeepAliveContainerProps {
    /** 当前激活视图唯一键（通常为路由 pathname） */
    activeKey: string;
    /** 是否开启缓存保活；为 false 时仅渲染当前视图 */
    enabled?: boolean;
    /** 最大缓存实例上限（超出后按最近最少访问淘汰） */
    maxCached?: number;
    /** 允许保留的活跃 key 白名单（如关闭页签后同步剔除缓存） */
    aliveKeys?: string[];
    /** 外部滚动容器引用，用于在切换回旧页签时精准恢复离开前的滚动高度 */
    scrollContainerRef?: default_2.RefObject<HTMLElement | null>;
    /** 当前激活页签的强制刷新计数器：变化时销毁重建对应实例 */
    refreshSeed?: number;
    /** 按路由键索引的刷新计数器字典（与 refreshSeed 兼容） */
    refreshKeys?: Record<string, number>;
    /** 当前激活视图容器的附加过渡动效类名 */
    activeClassName?: string;
    /** 是否自动为每个页签独立包裹 TabErrorBoundary 异常隔离边界（默认 false） */
    isolateError?: boolean;
    /** 页签异常边界点击“重新加载本页”时的回调 */
    onTabReload?: (key: string) => void;
    /** 页签异常边界点击“关闭此页签”时的回调 */
    onTabClose?: (key: string) => void;
    /** 页签异常边界点击“返回仪表盘”时的回调 */
    onNavigateHome?: () => void;
    children: default_2.ReactNode;
}

/**
 * 企业级环境变量与请求头键值对编辑器 (KeyValueInput)
 * 内置重复 Key 实时告警、单行启用开关、密文遮罩切换、智能粘贴拆行及 .env / Headers / JSON 双向批量编辑
 */
export declare const KeyValueInput: default_2.FC<KeyValueInputProps>;

/** KeyValueInput 国际化文案配置 */
export declare interface KeyValueInputLabels {
    countLabel?: (count: number) => string;
    limitedCountLabel?: (count: number, max: number) => string;
    duplicateCountLabel?: (count: number) => string;
    duplicateBannerLabel?: (keys: string[]) => string;
    modeGroupAriaLabel?: string;
    structuredModeLabel?: string;
    bulkModeLabel?: string;
    bulkFormatHint?: string;
    bulkEditorAriaLabel?: string;
    cancelLabel?: string;
    applyLabel?: string;
    emptyText?: string;
    addLabel?: string;
    enableItemLabel?: (index: number) => string;
    keyAriaLabel?: (index: number) => string;
    valueAriaLabel?: (index: number) => string;
    removeItemLabel?: (index: number) => string;
    removeItemTitle?: string;
    showSecretLabel?: (index: number) => string;
    hideSecretLabel?: (index: number) => string;
    showSecretTitle?: string;
    hideSecretTitle?: string;
    invalidJsonObjectError?: string;
    invalidJsonSyntaxError?: string;
}

export declare interface KeyValueInputProps {
    /** 受控键值对列表 */
    value?: AbcKeyValueEntry[];
    /** 非受控初始键值对列表 */
    defaultValue?: AbcKeyValueEntry[];
    /** 列表变更回调 */
    onChange?: (next: AbcKeyValueEntry[]) => void;
    /** 是否在每行左侧展示启用/停用开关（默认 true） */
    allowEnableToggle?: boolean;
    /** 是否允许每行切换明文/密文遮罩查看（默认 false） */
    allowSecretMask?: boolean;
    /** 是否在右上角提供“结构化行 / 批量文本”编辑器切换（默认 true） */
    allowBulkEdit?: boolean;
    /** 批量文本编辑器默认格式（默认 'dotenv'） */
    defaultBulkFormat?: AbcKeyValueFormat;
    /** 是否允许在 Key 输入框粘贴多行 .env / Headers / JSON 时自动拆行导入（默认 true） */
    smartPaste?: boolean;
    /** Key 输入框占位符 */
    keyPlaceholder?: string;
    /** Value 输入框占位符 */
    valuePlaceholder?: string;
    /** 空列表占位文案（优先级高于 labels.emptyText） */
    emptyText?: default_2.ReactNode;
    /** 国际化文案覆盖 */
    labels?: KeyValueInputLabels;
    /** 最大允许条目数 */
    maxItems?: number;
    /** 是否禁用全部输入与操作 */
    disabled?: boolean;
    /** 是否只读展示（保留明密文查看与批量只读浏览，禁止增删改） */
    readOnly?: boolean;
    /** 控件尺寸规格 */
    size?: AbcSize;
    className?: string;
}

/**
 * 独立的表单控件文本标签 (Label)
 * 语义化 label 标签，保持与 FormField 完全一致的字体规范、必填星号与色值
 */
export declare const Label: default_2.ForwardRefExoticComponent<LabelProps & default_2.RefAttributes<HTMLLabelElement>>;

/** 表单字段标签统一样式 */
export declare const labelClass = "block text-xs font-medium text-[var(--abc-fg-secondary)] mb-1.5";

export declare interface LabelProps extends default_2.LabelHTMLAttributes<HTMLLabelElement> {
    size?: AbcSize;
    required?: boolean;
}

/** 轻量加载指示器与局部容器遮罩组件 */
export declare const Loading: default_2.FC<LoadingProps>;

export declare interface LoadingProps {
    /** 是否处于加载态（包裹 children 时作为遮罩开关） */
    spinning?: boolean;
    /** 提示文字 */
    tip?: string;
    /** tip 语义别名 */
    text?: string;
    /** 尺寸规格 */
    size?: AbcSize;
    /** 动效规格 */
    motion?: AbcMotionPreset;
    /** 是否铺满全屏居中 */
    fullscreen?: boolean;
    /** fullscreen 驼峰别名 */
    fullScreen?: boolean;
    className?: string;
    children?: default_2.ReactNode;
}

export declare function LoadingStateCard({ message, paused, size, className, ...props }: LoadingStateCardProps): React_2.JSX.Element;

export declare interface LoadingStateCardProps extends React_2.HTMLAttributes<HTMLDivElement> {
    message: React_2.ReactNode;
    paused?: boolean;
    size?: 'sm' | 'md';
}

/**
 * 通用双语切换器组件 (LocaleSwitcher)
 */
export declare const LocaleSwitcher: React_2.ForwardRefExoticComponent<LocaleSwitcherProps & React_2.RefAttributes<HTMLButtonElement>>;

export declare interface LocaleSwitcherProps extends Omit<React_2.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    /** 当前语言代码（如 'zh-CN' | 'zh' | 'en'） */
    locale: string;
    /** 切换语言回调（toggle 模式） */
    onToggle?: () => void;
    /** 直接选择指定语言回调（segmented 模式优先调用） */
    onSelectLocale?: (nextLocale: 'en' | 'zh') => void;
    /** 展示模式：单按钮切换 ('toggle') 或分段双按钮组 ('segmented') */
    mode?: 'toggle' | 'segmented';
    /** 是否使用暗色外观 */
    dark?: boolean;
    /** 无障碍标题 */
    label?: string;
}

export declare interface LogEntry {
    seq?: number;
    level?: string;
    message: string;
    detail?: Record<string, unknown>;
    created_at?: string;
}

export declare function menuContainsPath(item: AbcMenuItem, pathname: string): boolean;

/**
 * 轻量级 KPI 指标卡 (MetricCard)
 * 内置趋势箭头徽标与纯 SVG 迷你折线走势图，无需加载重量级图表库即可用于密集仪表盘网格
 */
export declare const MetricCard: default_2.FC<MetricCardProps>;

export declare interface MetricCardProps extends Omit<default_2.HTMLAttributes<HTMLElement>, 'title' | 'prefix'> {
    title: default_2.ReactNode;
    value: default_2.ReactNode;
    prefix?: default_2.ReactNode;
    suffix?: default_2.ReactNode;
    trend?: MetricCardTrend;
    /** 轻量迷你走势折线数值序列（零 ECharts 依赖，直接渲染响应式内联 SVG） */
    sparkline?: number[];
    icon?: default_2.ReactNode;
    footer?: default_2.ReactNode;
    loading?: boolean;
    hoverable?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
}

export declare interface MetricCardTrend {
    value: string | number;
    direction?: 'up' | 'down' | 'flat';
    label?: string;
}

export declare const Modal: default_2.FC<DialogProps>;

export declare type ModalProps = DialogProps;

export declare const MultiImageFieldControl: default_2.FC<ProMultiImageUploadProps>;

/**
 * 企业级多页签导航栏
 * 支持卡片式 (card)、胶囊式 (pill)、极简下划线 (underline) 三种视觉风格，同步响应四档尺寸与动效规格
 */
export declare const MultiTabBar: default_2.FC<MultiTabBarProps>;

export declare interface MultiTabBarProps {
    tabs: AbcTabItem[];
    activePath: string;
    variant?: AbcTabStyle;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    onSelect: (path: string) => void;
    onClose?: (path: string) => void;
    onCloseOthers?: (path: string) => void;
    onCloseRight?: (path: string) => void;
    onCloseAll?: () => void;
    onTogglePin?: (path: string) => void;
    onRefresh?: (path: string) => void;
    className?: string;
}

/**
 * 统一解析常见后端分页/数组响应结构（data.records / data.list / records / list / 数组直出）
 */
export declare function normalizeProListResponse<T = any>(res: any, transformRecord?: (row: any) => T): {
    list: T[];
    total: number;
    raw: any;
};

/**
 * 统一页内通知横幅
 * 支持 4 种语义状态、状态码与请求 ID 追踪徽章、操作按钮与关闭能力
 */
export declare const NotificationBanner: React_2.ForwardRefExoticComponent<NotificationBannerProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface NotificationBannerProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    variant?: NotificationVariant;
    title?: React_2.ReactNode;
    message?: React_2.ReactNode;
    description?: React_2.ReactNode;
    code?: string;
    status?: number;
    requestId?: string;
    actionHint?: React_2.ReactNode;
    action?: React_2.ReactNode;
    onDismiss?: () => void;
    dismissLabel?: string;
    hideIcon?: boolean;
}

export declare type NotificationVariant = 'error' | 'warning' | 'success' | 'info';

/** 页码偏移分页器（英文默认 Prev/Next 标签兼容别名） */
export declare const OffsetPagination: default_2.FC<OffsetPaginationProps>;

export declare type OffsetPaginationProps = PaginationProps;

/**
 * 一次性敏感密钥/凭证展示弹窗 (OneTimeSecretDialog)
 * 专用于只下发一次的 API Key、Token、临时密码，强制提醒管理员及时安全保存
 */
export declare function OneTimeSecretDialog({ title, secret, open, secretValue, description, secretLabel, metadata, closeLabel, acknowledgeLabel, copyLabel, copiedLabel, copyErrorMessage, className, onClose, }: OneTimeSecretDialogProps): React_2.JSX.Element | null;

export declare interface OneTimeSecretDialogProps {
    title: string;
    secret?: string | null;
    open?: boolean;
    secretValue?: string | null;
    description?: string;
    secretLabel?: string;
    metadata?: OneTimeSecretMetadataItem[];
    closeLabel?: string;
    acknowledgeLabel?: string;
    copyLabel?: string;
    copiedLabel?: string;
    copyErrorMessage?: string;
    className?: string;
    onClose: () => void;
}

export declare interface OneTimeSecretMetadataItem {
    label: string;
    value: string;
}

/**
 * 标准业务页面布局容器
 * 统一封装企业后台页面的标题栏、面包屑、右上角动作按钮、KPI 摘要区与底部吸底提交栏
 */
export declare const PageContainer: default_2.FC<PageContainerProps>;

export declare interface PageContainerProps {
    /** 页面主标题 */
    title?: default_2.ReactNode;
    /** 页面副标题说明 */
    subtitle?: default_2.ReactNode;
    /** 标题旁状态徽标插槽 */
    tags?: default_2.ReactNode;
    /** 面包屑路径项 */
    breadcrumbs?: BreadcrumbEntry[];
    /** 右上角主操作按钮区 */
    extra?: default_2.ReactNode;
    /** 页头下方的数据指标/概览插槽 */
    headerContent?: default_2.ReactNode;
    /** 底部吸底固定操作栏（适合长表单保存/提交） */
    footer?: default_2.ReactNode;
    className?: string;
    children: default_2.ReactNode;
}

/**
 * 通用页面头部组件 (PageHeader)
 */
export declare function PageHeader({ backLink, eyebrow, title, badge, description, action, actions, className, ...props }: PageHeaderProps): React_2.JSX.Element;

/** 页面顶部标题栏容器样式 */
export declare const pageHeaderClass = "flex flex-col sm:flex-row sm:items-center justify-between gap-3";

export declare interface PageHeaderProps extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title'> {
    backLink?: React_2.ReactNode;
    eyebrow?: React_2.ReactNode;
    title: React_2.ReactNode;
    badge?: React_2.ReactNode;
    description?: React_2.ReactNode;
    action?: React_2.ReactNode;
    actions?: React_2.ReactNode;
}

/**
 * 统一页面卡片区块容器 (PageSection / Section)
 */
declare function PageSection({ title, badge, description, action, children, className, contentClassName, noPadding, ...props }: PageSectionProps): React_2.JSX.Element;
export { PageSection }
export { PageSection as Section }

export declare interface PageSectionProps extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title'> {
    title?: React_2.ReactNode;
    badge?: React_2.ReactNode;
    description?: React_2.ReactNode;
    action?: React_2.ReactNode;
    contentClassName?: string;
    noPadding?: boolean;
    children: React_2.ReactNode;
}

/** 页面副标题说明样式 */
export declare const pageSubTitleClass = "text-xs text-[var(--abc-fg-muted)] mt-0.5";

/** 页面主标题样式 */
export declare const pageTitleClass = "text-base font-bold text-[var(--abc-fg)] tracking-tight";

/**
 * 路由无关的页面切换过渡容器与顶部进度条联动组件 (PageTransition)
 */
export declare const PageTransition: default_2.FC<PageTransitionProps>;

export declare interface PageTransitionProps {
    /** 当前路由标识（如 location.pathname） */
    activeKey?: string;
    /** 过渡动效模式（默认继承 AbcProvider.pageTransition） */
    transition?: AbcPageTransition;
    /** 是否在切换 activeKey 时自动显示顶部加载进度条（默认 true） */
    showProgress?: boolean;
    className?: string;
    children: default_2.ReactNode;
}

/** 企业级紧凑数据分页器（支持快速页码跳转、边界自动 Clamp、双模游标流水与零数据优雅提示） */
export declare const Pagination: default_2.FC<PaginationProps>;

export declare interface PaginationCursorMeta {
    /** 游标模式：是否包含下一页数据 */
    hasNext?: boolean;
    /** 游标模式：是否包含上一页数据 */
    hasPrev?: boolean;
    /** 游标模式：是否有上一页（兼容别名） */
    hasPrevious?: boolean;
    /** 下一页游标标识符 */
    nextCursor?: string | null;
    /** 上一页游标标识符 */
    prevCursor?: string | null;
    /** 当前游标标识符 */
    currentCursor?: string | null;
    /** 已加载累计记录数 */
    loadedCount?: number;
    /** 当前页记录数（兼容别名） */
    count?: number;
    /** 当前页记录数（兼容别名） */
    currentCount?: number;
    /** 点击下一页游标回调 */
    onNext?: () => void;
    /** 点击上一页游标回调 */
    onPrev?: () => void;
    /** 点击上一页回调（兼容别名） */
    onPrevious?: () => void;
    /** 重置游标返回第一批/最新数据 */
    onResetCursor?: () => void;
}

export declare interface PaginationProps extends Partial<PaginationCursorMeta> {
    /** 分页模式：'offset' 页码偏移模式（默认） | 'cursor' 游标时间线模式 */
    mode?: 'offset' | 'cursor';
    current?: number;
    currentPage?: number;
    page?: number;
    pageSize?: number;
    /** 每页条数（兼容别名） */
    limit?: number;
    /** 每页条数（数字）或控件尺寸规格（xs/sm/md/lg） */
    size?: number | AbcSize;
    /** 分页器控件尺寸规格（避免与数字型 pageSize 冲突时的显式指定入口） */
    controlSize?: AbcSize;
    motion?: AbcMotionPreset;
    total?: number;
    pageSizeOptions?: number[];
    /** 可选每页大小列表（兼容别名） */
    limitOptions?: readonly number[];
    onChange?: (page: number, pageSize: number) => void;
    onPageChange?: (page: number) => void;
    onSizeChange?: (size: number) => void;
    onPageSizeChange?: (size: number) => void;
    /** 每页大小变更回调（兼容别名） */
    onLimitChange?: (limit: number) => void;
    showTotal?: boolean | ((total: number) => default_2.ReactNode);
    /** 左侧汇总文案（兼容别名） */
    summaryText?: default_2.ReactNode;
    /** 页码状态文案（兼容别名） */
    pageStatusText?: default_2.ReactNode;
    rowsPerPageLabel?: string;
    prevLabel?: default_2.ReactNode;
    nextLabel?: default_2.ReactNode;
    showQuickJumper?: boolean;
    className?: string;
    loading?: boolean;
}

/** 通用面板卡片样式 */
export declare const panelClass = "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-4 shadow-[var(--abc-shadow-card)]";

export declare interface ParsedSelectOption {
    value: string;
    rawValue: string | number;
    label: default_2.ReactNode;
    textLabel: string;
    disabled: boolean;
    description?: string;
    group?: string;
}

export declare function parseNumericWidth(w?: number | string, fallback?: number): number;

export declare function parseSelectChildren(children: default_2.ReactNode, groupLabel?: string): ParsedSelectOption[];

/** 暂停指定 Toast 的自动关闭倒计时 */
export declare function pauseToast(id: string): void;

/** PermissionGuard 简短语义别名 */
export declare const Permission: default_2.FC<PermissionGuardProps>;

/** 声明式细粒度权限守卫包装组件（支持无权限隐藏与置灰禁用双策略） */
export declare const PermissionGuard: default_2.FC<PermissionGuardProps>;

export declare interface PermissionGuardProps {
    /** 所需权限码（单个或多个） */
    permission?: string | string[];
    /** permission 语义别名 */
    code?: string | string[];
    /** 多权限判定模式：满足任一 ('any') 或全部满足 ('all') */
    mode?: 'any' | 'all';
    /** 无权限时的降级策略：'hide' 隐藏或渲染 fallback，'disable' 置灰禁用并展示气泡提示 */
    fallbackStrategy?: 'hide' | 'disable';
    /** 禁用策略下的 Tooltip 提示语 */
    disabledTip?: string;
    /** 无权限时的降级占位节点 */
    fallback?: default_2.ReactNode;
    /** fallback 语义别名 */
    fallbackNode?: default_2.ReactNode;
    children: default_2.ReactNode;
}

export declare function pickBestByteUnit(bytes: number, zeroUnit?: ByteUnit, allowedUnits?: readonly ByteUnit[]): {
    unit: ByteUnit;
    amount: string;
};

export declare function pickBestDurationUnit(seconds: number, zeroUnit?: DurationUnit, allowedUnits?: readonly DurationUnit[]): {
    unit: DurationUnit;
    amount: string;
};

/** 气泡卡片组件（基于顶层视口感知 Portal 引擎，承载富交互面板、筛选器或说明卡片） */
export declare const Popover: default_2.FC<PopoverProps>;

export declare interface PopoverProps extends Omit<DropdownProps, 'items' | 'align' | 'content'> {
    title?: default_2.ReactNode;
    content: default_2.ReactNode;
    align?: 'left' | 'right' | 'start' | 'end';
}

/**
 * SaaS 租户套餐订阅对比卡 (PricingCard)
 */
export declare const PricingCard: default_2.FC<PricingCardProps>;

export declare interface PricingCardProps {
    tier: default_2.ReactNode;
    price: default_2.ReactNode;
    period?: default_2.ReactNode;
    description?: default_2.ReactNode;
    features: Array<PricingFeatureItem | string>;
    recommended?: boolean;
    badge?: default_2.ReactNode;
    ctaText?: string;
    disabled?: boolean;
    loading?: boolean;
    onSelect?: () => void;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare interface PricingFeatureItem {
    text: default_2.ReactNode;
    included?: boolean;
}

export declare interface ProActionButtonConfig<T = Record<string, any>> {
    key: string;
    label?: default_2.ReactNode;
    icon?: default_2.ReactNode | string;
    className?: string;
    variant?: ButtonVariant;
    type?: ButtonVariant;
    show?: boolean | ((record: T) => boolean);
    disabled?: boolean | ((record: T) => boolean);
    title?: string | ((record: T) => string | undefined);
    permission?: string;
    onClick?: (record: T) => void | Promise<any>;
}

/**
 * 自适应 JSX 操作列容器 (ProAdaptiveActionCell)
 * 自动接管自定义 `render` 操作列返回的按钮组，当列宽不足时逐一折叠至 `...` 下拉菜单，最小仅保留 `...`。
 */
export declare const ProAdaptiveActionCell: default_2.FC<{
    children: default_2.ReactNode;
    align?: 'left' | 'right' | 'center';
    maxInline?: number;
    moreLabel?: string;
}>;

export declare function ProColumnSettingsPopover<T = Record<string, any>>({ columns, searchableFieldNames, settings, hasActionColumn, defaultActionWidth, motion, onToggleVisible, onSetAllVisible, onSetFixed, onSetWidth, onSetOrder, onSetSearchVisible, onReset, }: ProColumnSettingsPopoverProps<T>): JSX.Element;

export declare interface ProColumnSettingsPopoverProps<T = Record<string, any>> {
    columns: AbcColumn<T>[];
    searchableFieldNames: Set<string>;
    settings: AbcTablePersistedSettings;
    hasActionColumn?: boolean;
    defaultActionWidth?: number;
    motion?: AbcMotionPreset;
    onToggleVisible: (key: string) => void;
    onSetAllVisible: (allKeys: string[], visible: boolean) => void;
    onSetFixed: (key: string, fixed: 'left' | 'right' | null | undefined) => void;
    onSetWidth: (key: string, width: number) => void;
    onSetOrder: (order: string[]) => void;
    onSetSearchVisible: (key: string, visible: boolean) => void;
    onReset: () => void;
}

export declare interface ProCommandActionItem {
    id: string;
    label: string;
    group?: string;
    icon?: React_2.ReactNode;
    keywords?: string;
    danger?: boolean;
    onSelect: () => void;
}

export declare interface ProCommandEntityMatcher {
    /** 匹配规则唯一标识 */
    id: string;
    /** 前缀匹配规则（例如 "job_" / "org_"） */
    prefix?: string;
    /** 自定义匹配谓词（存在时覆盖 prefix） */
    match?: (trimmedQuery: string) => boolean;
    /** 左侧图标 */
    icon?: React_2.ReactNode;
    /** 高亮标签前缀文案 */
    labelPrefix?: string;
    /** 自定义高亮渲染函数 */
    renderLabel?: (trimmedQuery: string) => React_2.ReactNode;
    /** 高亮色调 */
    tone?: ProCommandEntityTone;
    /** 命中回车或点击时的回调 */
    onSelect: (trimmedQuery: string) => void;
}

export declare type ProCommandEntityTone = 'blue' | 'emerald' | 'purple' | 'amber';

export declare interface ProCommandPageItem {
    id?: string;
    to: string;
    label: string;
    group?: string;
    icon?: React_2.ReactNode;
    keywords?: string;
    onSelect?: () => void;
}

export declare function ProCommandPalette({ open: controlledOpen, onOpenChange, enableShortcut, entityMatchers, pages, onNavigate, actions, labels, searchQuery: controlledSearch, onSearchQueryChange, }: ProCommandPaletteProps): React_2.JSX.Element;

export declare interface ProCommandPaletteLabels {
    dialogLabel?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    entityGroupHeading?: string;
    pagesGroupHeading?: string;
    actionsGroupHeading?: string;
    navigateHint?: string;
    openHint?: string;
    footerBrand?: string;
    enterKeyLabel?: string;
}

export declare interface ProCommandPaletteProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** 是否注册全局 Cmd+K / Ctrl+K 快捷键（默认 true） */
    enableShortcut?: boolean;
    /** 实体 ID 直达规则集合 */
    entityMatchers?: ProCommandEntityMatcher[];
    /** 页面导航候选项 */
    pages?: ProCommandPageItem[];
    /** 选中页面时的默认导航处理 */
    onNavigate?: (to: string, page: ProCommandPageItem) => void;
    /** 系统快捷动作列表 */
    actions?: ProCommandActionItem[];
    /** 多语言与文案定制 */
    labels?: ProCommandPaletteLabels;
    /** 可选外部同步搜索词 */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
}

export declare interface ProConfigFieldSchema {
    name: string;
    label: string;
    type?: ProConfigFieldType;
    placeholder?: string;
    helperText?: string;
    required?: boolean;
    options?: SelectOption[];
    treeData?: Record<string, any>[];
    multiple?: boolean;
    treeCheckable?: boolean;
    treeCheckStrictly?: boolean;
    showCheckedStrategy?: AbcCheckedStrategy;
    selectableLeafOnly?: boolean;
    fieldNames?: AbcTreeFieldNames;
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
    maxTagCount?: number | 'responsive';
    /** image 类型：支持同时直接粘贴 URL/内联 SVG 源码并实时在左侧缩略框预览 */
    allowDirectUrlInput?: boolean;
}

export declare type ProConfigFieldType = 'text' | 'password' | 'number' | 'textarea' | 'switch' | 'select' | 'treeSelect' | 'image';

/**
 * Schema 驱动的企业级分组参数配置页组件 (ProConfigForm)
 * 原生支持图片直链、文件上传与内联 <svg> 源码的实时灯箱预览及脏数据重置
 */
export declare function ProConfigForm<T extends Record<string, any> = Record<string, any>>({ groups, initialValues, layoutMode, onSubmit, submitText, }: ProConfigFormProps<T>): default_2.JSX.Element;

export declare interface ProConfigFormProps<T extends Record<string, any> = Record<string, any>> {
    groups: ProConfigGroupSchema[];
    initialValues: T;
    layoutMode?: 'split' | 'grid';
    onSubmit: (values: T) => void | Promise<void>;
    submitText?: string;
}

export declare interface ProConfigGroupSchema {
    key: string;
    title: string;
    description?: string;
    columns?: 1 | 2;
    fields: ProConfigFieldSchema[];
}

export declare interface ProConfigOptionItem {
    label: string;
    value: string | number;
    /** 是否锁定勾选不可取消（如默认必选登录方式） */
    locked?: boolean;
}

/**
 * 声明式多选项卡配置页面框架组件 (ProConfigPage / CrudConfigPage)
 * 统一封装：垂直导航切换、远程配置拉取、Loading 遮罩、权限校验、保存成功状态反馈及全类型配置控件渲染
 */
export declare function ProConfigPage<T extends Record<string, any> = Record<string, any>>({ title, subTitle, permission, hasPermission: customHasPermission, customUpload, saveButtonText, defaultValues, fetchConfig, saveConfig, transformBeforeSave, tabs, }: ProConfigPageProps<T>): default_2.JSX.Element;

export declare interface ProConfigPageFieldSchema<T extends Record<string, any> = Record<string, any>> {
    /** 对应配置对象的字段名 */
    key: keyof T & string;
    /** 字段标题 */
    label: string;
    /** 控件类型 */
    type?: 'input' | 'password' | 'number' | 'textarea' | 'select' | 'switch' | 'radio' | 'checkbox-csv' | 'image-url' | 'custom';
    /** 占位提示 */
    placeholder?: string;
    /** 帮助提示文案 */
    tooltip?: string;
    /** 栅格跨度：1 占半行，2 占整行 */
    span?: 1 | 2;
    /** Textarea 行数 */
    rows?: number;
    /** 附加样式类 */
    className?: string;
    /** 单选/下拉/多选选项列表 */
    options?: ProConfigOptionItem[];
    /** 图片直链预览形状 */
    previewShape?: 'rounded' | 'circle';
    /** 是否允许点击上传按钮直接上传文件填入直链 */
    allowUpload?: boolean;
    /** 自定义渲染器 */
    render?: (values: T, setFieldValue: (key: keyof T & string, val: any) => void, setValues: default_2.Dispatch<default_2.SetStateAction<T>>) => default_2.ReactNode;
}

export declare interface ProConfigPageProps<T extends Record<string, any> = Record<string, any>> {
    /** 页面主标题 */
    title: string;
    /** 页面副标题描述 */
    subTitle?: string;
    /** 保存按钮权限标识 */
    permission?: string;
    /** 可选自定义权限断言器（未传时默认消费 AbcProvider.permissionAdapter） */
    hasPermission?: (code?: string) => boolean;
    /** 可选自定义文件上传适配器（未传时默认消费 AbcProvider.uploadAdapter） */
    customUpload?: (file: File) => Promise<{
        url: string;
    } | string | undefined>;
    /** 保存按钮文案 */
    saveButtonText?: string;
    /** 表单初始默认值 */
    defaultValues: T;
    /** 获取配置接口 */
    fetchConfig: () => Promise<any>;
    /** 保存配置接口 */
    saveConfig: (payload: any) => Promise<any>;
    /** 保存前的数据转换钩子 */
    transformBeforeSave?: (values: T) => any;
    /** Tab 与字段声明列表 */
    tabs: ProConfigTabSchema<T>[];
}

export declare interface ProConfigTabSchema<T extends Record<string, any> = Record<string, any>> {
    /** Tab 唯一标识 */
    key: string;
    /** 左侧导航显示名称 */
    label: string;
    /** 左侧导航图标组件 */
    icon?: default_2.ComponentType<{
        className?: string;
    }>;
    /** 右侧面板顶部区块标题 */
    sectionTitle: string;
    /** 右侧面板顶部区块副标题说明 */
    sectionDescription?: string;
    /** 表单栅格列数（默认 2 列） */
    columns?: 1 | 2;
    /** 当前 Tab 包含的表单字段声明 */
    fields: ProConfigPageFieldSchema<T>[];
}

export declare interface ProCrudApiConfig<T = any, Q = any, F = any> {
    list: (query: Q) => Promise<any>;
    get?: (id: number | string) => Promise<any>;
    view?: (id: number | string) => Promise<any>;
    add?: (data: F) => Promise<any>;
    create?: (data: F) => Promise<any>;
    update?: (data: F) => Promise<any>;
    edit?: (data: F) => Promise<any>;
    delete?: (ids: (string | number)[]) => Promise<any>;
    export?: (query: Q) => Promise<any>;
    children?: (row: T) => Promise<any>;
    [key: string]: any;
}

export declare type ProCrudFieldType = 'text' | 'input' | 'password' | 'number' | 'textarea' | 'select' | 'treeSelect' | 'radio' | 'checkbox' | 'switch' | 'date' | 'datetime' | 'datetimePicker' | 'dateRange' | 'image' | 'file' | 'upload' | 'cascader' | 'transfer' | 'color' | 'icon' | 'tags' | 'custom';

export declare interface ProCrudFormField<T extends Record<string, any> = any> {
    /** 字段键名（与 name 互为别名） */
    key?: (NoInfer<keyof T> & string) | string;
    /** 字段键名（兼容 ProTableFieldSchema） */
    name?: (NoInfer<keyof T> & string) | string;
    label: string;
    type?: ProCrudFieldType;
    placeholder?: string;
    helperText?: default_2.ReactNode;
    tooltip?: default_2.ReactNode;
    defaultValue?: any;
    required?: boolean;
    span?: number;
    order?: number;
    clearable?: boolean;
    maxLength?: number;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    searchable?: boolean;
    multiple?: boolean;
    format?: string;
    checkedChildren?: default_2.ReactNode;
    unCheckedChildren?: default_2.ReactNode;
    maxCount?: number;
    maxSize?: number;
    /** file / upload 专属：允许的文件扩展名或 MIME 类型（如 ".pdf,.json"） */
    accept?: string;
    /** cascader 专属：级联选项树 */
    cascaderOptions?: CascaderOption[] | ((form: ProFormInstance<any>, isEdit: boolean) => CascaderOption[]);
    /** transfer 专属：穿梭框列表项 */
    transferItems?: TransferItem[] | ((form: ProFormInstance<any>, isEdit: boolean) => TransferItem[]);
    width?: number | string;
    height?: number | string;
    presetIcons?: string[];
    formGroup?: ProCrudFormGroup;
    /** 标识该字段是否源自 ProTableFieldSchema（用于精确分派单参 disabled(editingRecord) 签名） */
    __fromFieldSchema?: boolean;
    options?: ProCrudSelectOption[] | ((form: ProFormInstance<any>, isEdit: boolean) => ProCrudSelectOption[]);
    /** treeSelect 专属：静态或动态树形数据源 */
    treeData?: Record<string, any>[] | ((form: ProFormInstance<any>, isEdit: boolean) => Record<string, any>[]);
    treeCheckable?: boolean;
    treeCheckStrictly?: boolean;
    showCheckedStrategy?: AbcCheckedStrategy;
    selectableLeafOnly?: boolean;
    fieldNames?: AbcTreeFieldNames;
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
    maxTagCount?: number | 'responsive';
    treeDefaultExpandAll?: boolean;
    loadData?: (node: AbcTreeSelectNode) => Promise<void>;
    disabled?: boolean | ((isEditOrRecord: any, form?: ProFormInstance<any>) => boolean);
    hidden?: boolean | ((isEdit: boolean, form: ProFormInstance<any>) => boolean);
    validator?: (value: any, allValues: Record<string, any>) => string | undefined;
    onChange?: (value: any, form: ProFormInstance<any>) => void;
    onFormReady?: (form: ProFormInstance<any>, isEdit: boolean) => void;
    customUpload?: (file: File) => Promise<{
        url: string;
    } | string | undefined>;
    render?: (form: ProFormInstance<any>, isEdit: boolean) => default_2.ReactNode;
    /** 内部标识：是否优先使用原生文本数字输入以保留尾零过渡态 */
    useRawDateInput?: boolean;
}

export declare function ProCrudFormFieldControl<T extends Record<string, any> = Record<string, any>>({ field, form, isEdit, editingRecord, }: ProCrudFormFieldRenderProps<T>): default_2.ReactElement | null;

export declare interface ProCrudFormFieldRenderProps<T extends Record<string, any> = Record<string, any>> {
    field: ProCrudFormField<T>;
    form: ProFormInstance<any>;
    isEdit: boolean;
    editingRecord: T | null;
}

export declare type ProCrudFormGroup = 'left' | 'right' | 'full' | 'hidden' | 'custom' | 'top' | 'bottom' | 'extra';

/**
 * 声明式 CRUD 表单布局器：支持自适应网格 (grid) 与五区左右分栏 (split: top/left/right/bottom/extra)
 */
export declare function ProCrudFormLayout<F = any>({ layout, columnsCount, fields, isEdit, form, errors, formSchema, columns, isFieldRequired: checkSchemaRequired, renderFormField, }: ProCrudFormLayoutProps<F>): default_2.JSX.Element;

export declare interface ProCrudFormLayoutProps<F = any> {
    layout?: 'grid' | 'split';
    columnsCount?: 1 | 2;
    fields: ProCrudFormField<any>[];
    isEdit: boolean;
    form?: ProFormInstance<any>;
    errors?: ProFormErrors;
    formSchema?: ProSchemaLike<F>;
    columns?: AbcColumn<any>[];
    isFieldRequired?: (schema: ProSchemaLike | undefined, fieldKey: string) => boolean;
    renderFormField: (field: ProCrudFormField<any>) => default_2.ReactNode;
}

export declare function ProCrudFormModal<T extends Record<string, any> = Record<string, any>>({ open, onClose, isEdit, currentRecord, container, dialogTitle, dialogSize, formLayout, formColumns, formFields, form, formSchema, columns, formSubmitting, formDetailLoading, formError, onSubmit, draftEnabled, showDraftButton, showDraftBanner, draftBannerMode, onSaveDraft, onRestoreDraft, onDiscardDraft, submitButtonText, renderFormExtra, renderCustomForm, onSuccessFetch, }: ProCrudFormModalProps<T>): default_2.JSX.Element;

export declare interface ProCrudFormModalProps<T extends Record<string, any> = Record<string, any>> {
    open: boolean;
    onClose: () => void;
    isEdit: boolean;
    currentRecord: T | null;
    container?: 'dialog' | 'drawer';
    dialogTitle?: {
        add?: string;
        edit?: string;
    };
    dialogSize?: DialogSize | string;
    formLayout?: 'grid' | 'split';
    formColumns?: 1 | 2;
    formFields: ProCrudFormField<T>[];
    form: ProFormInstance<any>;
    formSchema?: ProSchemaLike<any>;
    columns: AbcColumn<T>[];
    formSubmitting: boolean;
    formDetailLoading?: boolean;
    formError?: string | null;
    onSubmit: (e?: default_2.FormEvent) => void;
    draftEnabled?: boolean;
    showDraftButton?: boolean;
    showDraftBanner?: boolean;
    draftBannerMode?: 'auto-restored' | 'prompt';
    onSaveDraft?: () => void;
    onRestoreDraft?: () => void;
    onDiscardDraft?: () => void;
    submitButtonText?: string;
    renderFormExtra?: (form: ProFormInstance<any>, isEdit: boolean) => default_2.ReactNode;
    renderCustomForm?: (props: {
        open: boolean;
        onClose: () => void;
        record: T | null;
        isEdit: boolean;
        onSuccess: () => void;
    }) => default_2.ReactNode;
    onSuccessFetch?: () => void;
}

export declare interface ProCrudSearchFieldItem {
    key: string;
    label: string;
    type: 'input' | 'text' | 'number' | 'select' | 'date' | 'datetimePicker' | 'dateRange';
    columnKey?: string;
    placeholder?: string;
    options?: SelectOption[];
    searchable?: boolean;
    multiple?: boolean;
    span?: number;
    order?: number;
    format?: string;
    clearable?: boolean;
}

/**
 * 独立声明式多维筛选卡片：可单独挂载也可由 ProTable 内部统一编排，支持折叠、跨列与多类型日期/选择器
 */
export declare const ProCrudSearchForm: default_2.FC<ProCrudSearchFormProps>;

export declare interface ProCrudSearchFormProps {
    searchFields: ProCrudSearchFieldItem[];
    query: Record<string, any>;
    onQueryChange: (key: string, value: any) => void;
    onSearch: () => void;
    onReset: () => void;
    renderSearchExtra?: (ctx: {
        query: Record<string, any>;
        onQueryChange: (key: string, value: any) => void;
        isSearchVisible: (columnKey: string) => boolean;
    }) => default_2.ReactNode;
    isSearchVisible?: (columnKey: string) => boolean;
    defaultCollapsed?: boolean;
    collapsed?: boolean;
    onCollapseChange?: (collapsed: boolean) => void;
    className?: string;
}

export declare interface ProCrudSelectOption {
    label: default_2.ReactNode;
    value: string | number | boolean;
    disabled?: boolean;
}

export declare const ProCrudTable: typeof ProTable;

export declare type ProCrudTableProps<T extends Record<string, any> = any, Q extends Record<string, any> = Record<string, any>, F extends Record<string, any> = Record<string, any>> = ProTableProps<T, Q, F>;

export declare function ProCrudViewModal<T extends Record<string, any> = Record<string, any>>({ open, onClose, record, columns, viewTitle, viewSize, viewLoading, canEdit, onEditRecord, renderViewExtra, renderViewFooter, }: ProCrudViewModalProps<T>): default_2.JSX.Element;

export declare interface ProCrudViewModalProps<T extends Record<string, any> = Record<string, any>> {
    open: boolean;
    onClose: () => void;
    record: T | null;
    columns: AbcColumn<T>[];
    viewTitle?: string | ((record: T) => default_2.ReactNode);
    viewSize?: DialogSize | string;
    viewLoading?: boolean;
    canEdit?: boolean;
    onEditRecord?: (record: T) => void;
    renderViewExtra?: (record: T) => default_2.ReactNode;
    renderViewFooter?: (record: T, close: () => void) => default_2.ReactNode;
}

export declare interface ProDraftConfig {
    enabled?: boolean;
    autoSave?: boolean;
    autoSaveInterval?: number;
    showDraftButton?: boolean;
    enableVersions?: boolean;
    maxVersions?: number;
    showDraftList?: boolean;
}

export declare interface ProFieldError {
    type?: string;
    message?: string;
}

export declare function ProFloatingBatchBar<T = Record<string, any>>({ selectedKeys, selectedRows, batchActions, extraContent, onBatchDelete, onClear, motion, }: {
    selectedKeys: Array<string | number>;
    selectedRows: T[];
    batchActions?: ProTableBatchAction<T>[];
    extraContent?: default_2.ReactNode;
    onBatchDelete?: () => void;
    onClear: () => void;
    motion?: AbcMotionPreset;
}): default_2.JSX.Element | null;

export declare function ProFormContainer({ title, description, triggerLabel, triggerIcon, triggerVariant, mode, size, maxWidthClass, footer, open: controlledOpen, onOpenChange, summarySlot, emptySummaryHint, headerActions, modalHeaderActions, inlineInTestEnv, renderInlineContainer, renderSummaryContainer, closeLabel, className, children, }: ProFormContainerProps): default_2.JSX.Element;

export declare interface ProFormContainerInlineRenderProps {
    title: string;
    description?: string;
    headerActions?: default_2.ReactNode;
    modalHeaderActions?: default_2.ReactNode;
    summarySlot?: default_2.ReactNode;
    className?: string;
    children: default_2.ReactNode;
}

export declare interface ProFormContainerProps {
    /** 表单弹窗/抽屉标题 */
    title: string;
    /** 表单说明文案 */
    description?: string;
    /** 触发按钮文案 */
    triggerLabel: string;
    /** 触发按钮图标（默认加号图标） */
    triggerIcon?: default_2.ReactNode;
    /** 触发按钮视觉变体 */
    triggerVariant?: 'primary' | 'outline' | 'secondary' | 'default';
    /** 展示形态：右侧抽屉 (drawer) 或居中模态框 (modal) */
    mode?: 'drawer' | 'modal';
    /** Drawer 预设宽度档位 */
    size?: DrawerProps['size'];
    /** 抽屉或弹窗最大宽度类名 */
    maxWidthClass?: string;
    /** 抽屉/模态框底部操作区 */
    footer?: default_2.ReactNode;
    /** 受控打开状态（可选） */
    open?: boolean;
    /** 受控打开状态回调（可选） */
    onOpenChange?: (open: boolean) => void;
    /** 页面内紧凑摘要区域（抽屉关闭时在页面卡片中展示只读摘要） */
    summarySlot?: default_2.ReactNode;
    /** 无摘要时的默认引导提示文案（可选） */
    emptySummaryHint?: default_2.ReactNode;
    /** 触发栏右侧附加操作按钮 */
    headerActions?: default_2.ReactNode;
    /** 抽屉/模态框头部右侧附加控制项（如 Visual / JSON 切换按钮） */
    modalHeaderActions?: default_2.ReactNode;
    /** 是否在自动化单元测试环境下直接内联渲染表单 */
    inlineInTestEnv?: boolean;
    /** 自定义测试环境内联容器渲染函数 */
    renderInlineContainer?: (props: ProFormContainerInlineRenderProps) => default_2.ReactNode;
    /** 自定义浏览器环境摘要卡片容器渲染函数 */
    renderSummaryContainer?: (props: ProFormContainerSummaryRenderProps) => default_2.ReactNode;
    /** 抽屉或弹窗关闭按钮无障碍文案 */
    closeLabel?: string;
    /** 外层附加类名 */
    className?: string;
    /** 表单主体内容 */
    children: default_2.ReactNode;
}

export declare interface ProFormContainerSummaryRenderProps {
    title: string;
    description?: string;
    triggerButton: default_2.ReactNode;
    headerActions?: default_2.ReactNode;
    summarySlot?: default_2.ReactNode;
    emptySummaryHint?: default_2.ReactNode;
    className?: string;
}

/**
 * 声明式表单字段联动容器 (ProFormDependency)
 * 通过精细化字段对比避免无关重渲染与死循环，支持下游字段自动清空及防抖/竞态安全的异步加载
 */
export declare function ProFormDependency<TData = any>({ form: formProp, deps, resetFieldsOnChange, asyncLoader, debounceMs, children, }: ProFormDependencyProps<TData>): default_2.ReactElement;

export declare interface ProFormDependencyAsyncState<TData = any> {
    loading: boolean;
    data: TData | undefined;
    error: Error | null;
    reload: () => void;
    form: ProFormInstance<any> | null;
}

export declare interface ProFormDependencyProps<TData = any> {
    /** 显式传入的表单实例（未传时自动回退读取 useProFormContext()） */
    form?: ProFormInstance<any>;
    /** 声明监听的依赖字段名集合 */
    deps: string[];
    /** 任一依赖值发生变更时自动清空的下游字段名集合 */
    resetFieldsOnChange?: string[];
    /** 依赖值变化时触发的异步数据源加载器（支持 AbortSignal 竞态取消） */
    asyncLoader?: (depValues: Record<string, any>, signal: AbortSignal) => Promise<TData>;
    /** 异步加载防抖毫秒数（默认 0，> 0 时防抖触发并在新变化到来时中止旧请求） */
    debounceMs?: number;
    /** 渲染函数，接收当前依赖字段值快照及异步加载元信息 */
    children: (depValues: Record<string, any>, meta: ProFormDependencyAsyncState<TData>) => default_2.ReactNode;
}

export declare type ProFormErrors = Record<string, ProFieldError | undefined>;

export declare interface ProFormInstance<T extends Record<string, any> = Record<string, any>> {
    getValues: {
        (): T;
        <K extends keyof T & string>(name: K): T[K];
        (name: string): any;
    };
    setValue: (name: string, value: any, options?: {
        shouldValidate?: boolean;
        shouldDirty?: boolean;
    }) => void;
    watch: {
        (): T;
        <K extends keyof T & string>(name: K): T[K];
        (names: string[]): any[];
        (callback: (values: T, info: {
            name?: string;
        }) => void): ProFormWatchSubscription;
    };
    reset: (nextValues?: Partial<T>) => void;
    setError: (name: string, error: ProFieldError) => void;
    clearErrors: (name?: string | string[]) => void;
    trigger: (name?: string | string[]) => Promise<boolean>;
    handleSubmit: (onValid: (values: T) => void | Promise<void>) => (e?: default_2.FormEvent) => Promise<void>;
    formState: {
        errors: ProFormErrors;
        isDirty: boolean;
    };
}

/**
 * 企业级分组表单排版引擎
 * 支持 Vercel/Stripe 风格的左侧说明导览 + 右侧卡片分栏 ('split') 与经典多列卡片 ('grid')
 */
export declare const ProFormLayout: default_2.FC<ProFormLayoutProps>;

export declare interface ProFormLayoutProps {
    /** 排版形态：左右导览分栏 ('split') 或卡片网格堆叠 ('grid') */
    mode?: 'split' | 'grid';
    sections: ProFormSection[];
    className?: string;
}

/**
 * 动态结构化表单列表 (ProFormList)
 * 同时支持独立受控/非受控模式与 ProFormInstance 双向绑定，提供增删改、行复制、排序与行级校验
 */
export declare function ProFormList<T = Record<string, any>>({ name, form: formProp, label, value, defaultValue, onChange, initialItem, minItems, maxItems, variant, copyable, sortable, addLabel, rowValidator, summaryRender, disabled, className, children, }: ProFormListProps<T>): default_2.ReactElement;

export declare interface ProFormListItemHelpers<T = Record<string, any>> {
    /** 局部合并或函数式更新当前行数据 */
    update: (patchOrNext: Partial<T> | ((prev: T) => T)) => void;
    /** 删除当前行（受 minItems 约束） */
    remove: () => void;
    /** 复制当前行并插入到下一位置（受 maxItems 约束） */
    duplicate: () => void;
    /** 上移当前行 */
    moveUp: () => void;
    /** 下移当前行 */
    moveDown: () => void;
    /** 行级校验错误文本 */
    error?: string;
    canRemove: boolean;
    canAdd: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

export declare interface ProFormListProps<T = Record<string, any>> {
    /** 绑定 ProFormInstance 的字段路径（与 form 或 ProFormProvider 配合使用） */
    name?: string;
    /** 显式传入的表单实例（未传时自动读取 useProFormContext()） */
    form?: ProFormInstance<any>;
    /** 列表顶部标题 */
    label?: default_2.ReactNode;
    /** 受控列表值 */
    value?: T[];
    /** 非受控默认列表值 */
    defaultValue?: T[];
    /** 列表变更回调 */
    onChange?: (next: T[]) => void;
    /** 新增空白行默认对象或工厂函数 */
    initialItem?: T | (() => T);
    /** 最少保留条目数（默认 0） */
    minItems?: number;
    /** 最多允许条目数 */
    maxItems?: number;
    /** 渲染形态：'card' 独立卡片行 | 'inline' 紧凑行内布局（默认 'card'） */
    variant?: 'inline' | 'card';
    /** 是否允许复制单行插入下一位（默认 true） */
    copyable?: boolean;
    /** 是否允许上移/下移重排（默认 false） */
    sortable?: boolean;
    /** 新增按钮文案（默认 '添加一行'） */
    addLabel?: default_2.ReactNode;
    /** 单行校验函数 */
    rowValidator?: (item: T, index: number, all: T[]) => string | undefined;
    /** 列表底部汇总区域自定义渲染 */
    summaryRender?: (items: T[]) => default_2.ReactNode;
    /** 是否禁用全部操作 */
    disabled?: boolean;
    className?: string;
    /** 行内容渲染函数 */
    children: (item: T, index: number, helpers: ProFormListItemHelpers<T>) => default_2.ReactNode;
}

/**
 * 表单实例上下文提供者：允许深层嵌套的联动区块或列表组件无需逐层透传 form prop
 */
export declare const ProFormProvider: default_2.FC<ProFormProviderProps>;

export declare interface ProFormProviderProps {
    /** 需要向下透传的响应式表单实例 */
    form: ProFormInstance<any>;
    children: default_2.ReactNode;
}

export declare interface ProFormSection {
    key: string;
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    columns?: 1 | 2 | 3;
    children: default_2.ReactNode;
}

export declare interface ProFormWatchSubscription {
    unsubscribe: () => void;
}

/**
 * 线性与 SVG 环形进度条 (Progress)
 */
export declare const Progress: default_2.FC<ProgressProps>;

/**
 * 统一语义进度条 (ProgressBar)
 * 支持阈值自动变色 (auto) 与规范化 ARIA progressbar 属性
 */
export declare const ProgressBar: default_2.ForwardRefExoticComponent<ProgressBarProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface ProgressBarProps extends Omit<default_2.HTMLAttributes<HTMLDivElement>, 'children'> {
    value?: number | null;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'auto';
    dangerThreshold?: number;
    warningThreshold?: number;
    fillClassName?: string;
}

declare type ProgressListener = (event: {
    action: 'start' | 'done' | 'set';
    value?: number;
}) => void;

export declare interface ProgressProps {
    /** 0 ~ 100 进度百分比 */
    percent: number;
    type?: 'line' | 'circle';
    tone?: 'primary' | 'success' | 'warning' | 'danger';
    /** 自定义进度条填充颜色（覆盖默认 tone 色值） */
    strokeColor?: string;
    showInfo?: boolean;
    /** 环形直径 / 线性条高度（支持具体像素或通用 xs/sm/md/lg 规格） */
    size?: number | AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/**
 * 表单图标选择器增强控件：同时支持手动输入图标名、常用预设胶囊点选与唤起可视化图标库
 */
export declare const ProIconFieldControl: default_2.FC<ProIconFieldControlProps>;

export declare interface ProIconFieldControlProps {
    value: string;
    disabled?: boolean;
    placeholder?: string;
    presetIcons?: string[];
    onChange: (val: string) => void;
}

/**
 * ABC Design 企业级全功能自适应壳层 (ProLayout)
 * 一套统一 API 支持 5 种主流中后台布局拓扑（sidebar / top / mix / dual-column / auth）
 * 并内置移动端抽屉导航、多页签栏、KeepAlive 保活、⌘K 拼音/组件指令面板、防篡改水印与实时定制中心。
 */
export declare const ProLayout: default_2.FC<ProLayoutProps>;

export declare interface ProLayoutProps {
    /** 品牌标识与项目名称 */
    brand?: AbcBrandInfo;
    /** 树形菜单数据（路由无关） */
    menuItems: AbcMenuItem[];
    /** 当前路由路径 */
    pathname: string;
    /** 路由跳转处理回调 */
    onNavigate: (path: string, item?: AbcMenuItem) => void;
    /** 受控布局设置 */
    settings?: Partial<AbcLayoutSettings>;
    /** 默认初始布局设置 */
    defaultSettings?: Partial<AbcLayoutSettings>;
    /** 布局设置变更回调 */
    onSettingsChange?: (next: AbcLayoutSettings) => void;
    /** 当前登录用户信息与下拉菜单项 */
    user?: AbcUserInfo;
    /** 顶栏右侧扩展插槽（如多租户切换器、消息中心铃铛） */
    headerExtra?: default_2.ReactNode;
    /** 注入全局指令面板的自定义快捷动作（如全量组件直达索引） */
    commandActions?: CommandActionItem[];
    /** 顶栏右侧 ⌘K 按钮文案（默认 '搜索菜单...'） */
    searchPlaceholder?: string;
    /** ⌘K 全局指令面板输入框占位文案 */
    commandPlaceholder?: string;
    /** 是否在展开态侧边栏顶部渲染快捷筛选输入框（默认读取 settings.sidebarSearch） */
    sidebarSearch?: boolean;
    /** 侧边栏快捷筛选输入框占位文案 */
    sidebarSearchPlaceholder?: string;
    /** 受控页签列表（若不传则由 ProLayout 根据访问轨迹自动维护） */
    tabs?: AbcTabItem[];
    onTabsChange?: (tabs: AbcTabItem[]) => void;
    /** 当切换至 auth 模式时的认证卡片内容（若未提供则渲染当前 children） */
    authRender?: default_2.ReactNode;
    authProps?: Partial<AuthLayoutProps>;
    /** 是否显示右上角主题与布局配置触发器（默认开启） */
    showCustomizerTrigger?: boolean;
    /** 是否自动为多页签视图包裹 TabErrorBoundary 单页签异常隔离（默认 true） */
    isolateTabError?: boolean;
    /** 单页签异常边界点击“返回仪表盘”时的目标路径（默认 '/'） */
    homePath?: string;
    /** 覆写壳层、侧栏与导航控件尺寸规格（默认继承 AbcProvider.theme.componentSize） */
    size?: AbcSize;
    /** 覆写壳层交互动效规格（默认继承 AbcProvider.theme.motion） */
    motion?: AbcMotionPreset;
    children: default_2.ReactNode;
}

export declare function ProLogViewer({ logs, heightClass, estimateSize, overscan, defaultStickBottom, labels, className, }: ProLogViewerProps): React_2.JSX.Element;

export declare interface ProLogViewerLabels {
    searchPlaceholder?: string;
    stickBottomLabel?: string;
    copyLabel?: string;
    copiedLabel?: string;
    emptyText?: string;
    clearSearchLabel?: string;
    formatLineCount?: (filtered: number, total: number) => string;
}

export declare interface ProLogViewerProps {
    /** 日志条目列表（支持结构化 LogEntry 或纯文本行） */
    logs: Array<LogEntry | string>;
    /** 容器自定义高度类名（默认 h-[440px]） */
    heightClass?: string;
    /** 默认预估单行高度（像素，默认 26） */
    estimateSize?: number;
    /** 视口上下缓冲条数（默认 12） */
    overscan?: number;
    /** 是否默认开启粘滞贴底滚动（默认 false） */
    defaultStickBottom?: boolean;
    /** 多语言与文案定制 */
    labels?: ProLogViewerLabels;
    /** 额外的容器类名 */
    className?: string;
}

/**
 * 零业务耦合多图上传控件：通过 customUpload 或 AbcProvider.uploadAdapter 完成上传，支持灯箱预览与移除
 */
export declare const ProMultiImageUpload: default_2.FC<ProMultiImageUploadProps>;

export declare interface ProMultiImageUploadProps {
    /** 图片 URL 列表（兼容逗号分隔字符串或字符串数组） */
    value: string | string[];
    disabled?: boolean;
    maxCount?: number;
    customUpload?: (file: File) => Promise<{
        url: string;
    } | string | undefined>;
    onChange: (val: string) => void;
}

export declare interface ProPageGuide {
    /** 抽屉头部徽章文案（如 "工作流指南" / "Guide"） */
    badge?: default_2.ReactNode;
    /** 指南主标题 */
    title: default_2.ReactNode;
    /** 指南副标题 */
    subtitle?: default_2.ReactNode;
    /** 分步说明列表 */
    steps: ProPageGuideStep[];
    /** 底部总结提示或注意事项 */
    summary?: default_2.ReactNode;
    /** 自定义扩展区 */
    extra?: default_2.ReactNode;
}

export declare interface ProPageGuideStep {
    /** 步骤编号标签（省略时自动按 1, 2, 3... 递增） */
    step?: string | number;
    /** 步骤标题 */
    title: default_2.ReactNode;
    /** 步骤详细说明 */
    description?: default_2.ReactNode;
}

/**
 * 企业级页面头部组件 (ProPageHeader)
 * 集成语义化标题区、面包屑/状态徽标、右侧操作栏，以及标准化的右侧滑出“页面操作说明”抽屉与无障碍折叠摘要。
 */
export declare const ProPageHeader: default_2.FC<ProPageHeaderProps>;

export declare interface ProPageHeaderProps {
    /** 页面主标题 */
    title?: default_2.ReactNode;
    /** 副标题或简要描述 */
    description?: default_2.ReactNode;
    /** 可选面包屑导航栏 */
    breadcrumb?: default_2.ReactNode;
    /** 标题旁辅助状态标签 */
    tags?: default_2.ReactNode;
    /** 右侧主操作按钮区 */
    actions?: default_2.ReactNode;
    /** 页面操作说明指南配置，开启后提供右侧滑出说明抽屉与屏幕阅读器语义摘要 */
    guide?: ProPageGuide;
    /** 操作说明入口按钮文案（默认 "操作说明"） */
    guideButtonLabel?: default_2.ReactNode;
    /** 操作说明抽屉标题（省略时使用 guide.title 或 "操作说明"） */
    guideDrawerTitle?: default_2.ReactNode;
    /** 操作说明抽屉关闭按钮文案（默认 "关闭"） */
    guideCloseLabel?: default_2.ReactNode;
    /** 操作说明抽屉宽度（默认 480） */
    guideDrawerWidth?: number | string;
    /** 受控打开状态 */
    guideOpen?: boolean;
    /** 默认打开状态 */
    defaultGuideOpen?: boolean;
    /** 抽屉开关回调 */
    onGuideOpenChange?: (open: boolean) => void;
    /** 是否隐藏操作说明入口 */
    hideGuide?: boolean;
    /** 头部下方扩展槽位（常用于 Tab 切换条或指标汇总带） */
    children?: default_2.ReactNode;
    className?: string;
}

export declare const ProRowActionsOverflow: default_2.FC<{
    actions: ResolvedRowActionItem[];
    maxInline?: number;
    /** 在真实浏览器列宽受限时动态测量子按钮实际宽度自适应收纳（jsdom 宽度为 0 时回退至 jsdomFallbackMax） */
    autoFit?: boolean;
    jsdomFallbackMax?: number;
    align?: 'left' | 'right';
    moreLabel?: string;
}>;

export declare interface ProSchemaLike<T = any> {
    safeParse?: (data: any) => {
        success: boolean;
        data?: T;
        error?: {
            issues?: ReadonlyArray<{
                path?: ReadonlyArray<PropertyKey>;
                message?: string;
            }>;
            errors?: ReadonlyArray<{
                path?: ReadonlyArray<PropertyKey>;
                message?: string;
            }>;
        };
    };
    shape?: Record<string, any> | (() => Record<string, any>);
    _def?: {
        shape?: () => Record<string, any>;
    };
}

export declare interface ProSearchFieldConfig {
    key: string;
    label: string;
    type?: 'text' | 'input' | 'number' | 'select' | 'treeSelect' | 'date' | 'datetimePicker' | 'dateRange';
    /** 关联表格列 key（用于表头筛选状态联动与高亮） */
    columnKey?: string;
    placeholder?: string;
    options?: SelectOption[];
    treeData?: Record<string, any>[];
    treeCheckable?: boolean;
    treeCheckStrictly?: boolean;
    showCheckedStrategy?: AbcCheckedStrategy;
    selectableLeafOnly?: boolean;
    fieldNames?: AbcTreeFieldNames;
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
    maxTagCount?: number | 'responsive';
    treeDefaultExpandAll?: boolean;
    searchable?: boolean;
    multiple?: boolean;
    span?: number;
    order?: number;
    format?: string;
    clearable?: boolean;
    /** 内部标记：是否源自 ProTableFieldSchema */
    __fromFieldSchema?: boolean;
}

/**
 * 通用主从分栏工作台 (ProSplitWorkbench)
 *
 * 整合左侧可拖拽/可折叠导航树、中间主工作区与右侧按需内联挤压详情区（SplitDetailLayout），
 * 适用于分类树筛选列表、资产目录检视与主从联动审批等典型中后台高频工作台场景。
 */
export declare const ProSplitWorkbench: React_2.ForwardRefExoticComponent<ProSplitWorkbenchProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface ProSplitWorkbenchProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** 左侧分类树数据；传入时自动渲染带拼音搜索框的分类树与顶部“全部”快捷节点 */
    treeData?: AbcTreeNode[];
    /** 各树节点对应的统计数量映射（按 String(node.key) 匹配） */
    counts?: Record<string, number>;
    /** 顶部“全部”快捷节点文案（默认 '全部视图'） */
    allLabel?: React_2.ReactNode;
    /** 顶部“全部”快捷节点数量徽标 */
    allCount?: number;
    /** 受控当前选中节点 key（null 表示选中“全部”） */
    selectedKey?: string | number | null;
    /** 非受控初始选中节点 key（默认 null） */
    defaultSelectedKey?: string | number | null;
    /** 节点切换回调；点击“全部”时固定返回 null */
    onSelectKey?: (key: string | number | null, node?: AbcTreeNode) => void;
    /** 左侧边栏头部标题 */
    sidebarTitle?: React_2.ReactNode;
    /** 左侧边栏头部右侧扩展区域 */
    sidebarExtra?: React_2.ReactNode;
    /** 自定义左侧栏内容（传入时完整覆盖内置“全部”+ Tree 视图） */
    sidebarRender?: React_2.ReactNode;
    /** 左侧边栏初始宽度（px，默认 260） */
    sidebarWidth?: number;
    /** 左侧边栏最小拖拽宽度（px，默认 200） */
    minSidebarWidth?: number;
    /** 左侧边栏最大拖拽宽度（px，默认 440） */
    maxSidebarWidth?: number;
    /** 本地持久化记忆侧栏与详情宽度的存储键 */
    storageKey?: string;
    /** 右侧按需内联挤压详情面板节点 */
    detailPanel?: React_2.ReactNode;
    /** 是否打开右侧详情区（默认 false） */
    detailOpen?: boolean;
    /** 右侧详情区初始宽度 */
    detailWidth?: number | string;
    /** 右侧详情区是否处于沉浸全宽展开模式（默认 false） */
    detailExpanded?: boolean;
    /** 主工作区内容 */
    children: React_2.ReactNode;
}

/**
 * 跨步向导表单容器 (ProStepsForm)
 * 集成 Steps 分步引导条、同步/异步分步校验阻断、Alert 危险提示、提交防连点及跨步草稿无损保留。
 */
export declare function ProStepsForm<T = Record<string, any>>({ steps, initialValues, values, onValuesChange, current, onCurrentChange, onFinish, prevLabel, nextLabel, submitLabel, stepsDirection, ariaLabel, className, }: ProStepsFormProps<T>): default_2.JSX.Element | null;

export declare namespace ProStepsForm {
    var displayName: string;
}

export declare interface ProStepsFormProps<T = Record<string, any>> {
    /** 分步向导步骤配置数组 */
    steps: ReadonlyArray<ProWizardStepConfig<T>>;
    /** 初始表单草稿值 */
    initialValues: T;
    /** 受控表单值 */
    values?: T;
    /** 表单值变更回调 */
    onValuesChange?: (values: T) => void;
    /** 受控当前步骤下标（从 0 开始） */
    current?: number;
    /** 当前步骤变化回调 */
    onCurrentChange?: (step: number) => void;
    /** 全部步骤校验通过并点击提交时触发 */
    onFinish: (values: T) => void | Promise<void>;
    /** 上一步按钮文案（默认 "上一步"） */
    prevLabel?: default_2.ReactNode;
    /** 下一步按钮文案（默认 "下一步"） */
    nextLabel?: default_2.ReactNode;
    /** 末步提交按钮文案（默认 "提交"） */
    submitLabel?: default_2.ReactNode;
    /** 步骤条排版方向（默认 horizontal） */
    stepsDirection?: 'horizontal' | 'vertical';
    /** 无障碍区域标签 */
    ariaLabel?: string;
    className?: string;
}

export declare function ProTable<T extends Record<string, any> = Record<string, any>, Q extends Record<string, any> = Record<string, any>, F extends Record<string, any> = Record<string, any>>(props: ProTableProps<T, Q, F>): JSX.Element;

export declare type ProTableApiInput<T = any> = ((params: any) => Promise<any>) | ProTableApiOptions<T>;

export declare interface ProTableApiOptions<T = any> {
    /** 分页列表请求函数 */
    list: (params: any) => Promise<any>;
    /** 导出数据接口 */
    export?: (params: any) => Promise<any>;
    /** 导出文件名前缀（默认“数据导出”） */
    exportFileName?: string;
    /** 删除接口 */
    delete?: (params: any) => Promise<any>;
    /** 获取详情接口 */
    get?: (id: number | string) => Promise<any>;
    /** 查看详情接口 */
    view?: (id: number | string) => Promise<any>;
    /** 树形/子项异步加载接口 */
    children?: (row: T) => Promise<any>;
    /** 新增接口 */
    create?: (data: any) => Promise<any>;
    /** 新增接口别名 */
    add?: (data: any) => Promise<any>;
    /** 修改接口 */
    update?: (data: any) => Promise<any>;
    /** 修改接口别名 */
    edit?: (data: any) => Promise<any>;
    /** 查询参数额外处理钩子 */
    transformQuery?: (params: Record<string, any>) => Record<string, any>;
    /** 单行数据额外转换钩子 */
    transformRecord?: (row: any) => T;
    /** 外部绑定的固定查询参数 */
    defaultParams?: Record<string, any>;
}

export declare interface ProTableBatchAction<T = Record<string, any>> {
    key: string;
    label: default_2.ReactNode;
    icon?: default_2.ReactNode;
    variant?: ButtonVariant;
    /** 兼容 CrudTable BatchActionConfig 的 type 属性别名 */
    type?: ButtonVariant;
    permission?: string;
    onClick: (selectedKeys: Array<string | number>, selectedRows: T[]) => void | Promise<void>;
}

export declare interface ProTableFieldSchema {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'treeSelect' | 'textarea' | 'switch' | 'date' | 'dateRange' | 'tags' | 'icon' | 'password' | 'image' | 'color';
    options?: SelectOption[];
    treeData?: Record<string, any>[];
    treeCheckable?: boolean;
    treeCheckStrictly?: boolean;
    showCheckedStrategy?: AbcCheckedStrategy;
    selectableLeafOnly?: boolean;
    fieldNames?: AbcTreeFieldNames;
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
    maxTagCount?: number | 'responsive';
    treeDefaultExpandAll?: boolean;
    /** 下拉选择器是否启用多选模式 */
    multiple?: boolean;
    placeholder?: string;
    helperText?: string;
    defaultValue?: any;
    /** 栅格跨度（在双列表单或 4 列检索面板中可跨 2 列） */
    span?: 1 | 2;
    required?: boolean;
    disabled?: boolean | ((editingRecord: Record<string, any> | null) => boolean);
    /** 自定义同步校验器，返回错误提示字符串即拦截提交 */
    validator?: (value: any, allValues: Record<string, any>) => string | undefined;
    hideInSearch?: boolean;
    hideInForm?: boolean;
}

export declare type ProTablePaginationConfig = boolean | (PaginationProps & {
    mode?: 'offset' | 'cursor';
});

export declare interface ProTableProps<T extends Record<string, any> = any, Q extends Record<string, any> = Record<string, any>, F extends Record<string, any> = Record<string, any>> {
    /** 表格标识键（用于本地持久化列宽、列序、固定列、显隐与新建表单草稿） */
    storageKey?: string;
    /** storageKey 语义别名（兼容 CrudTable） */
    tableId?: string;
    title?: default_2.ReactNode;
    subTitle?: default_2.ReactNode;
    columns: AbcColumn<T>[];
    /** 搜索与新建/编辑弹窗共用的紧凑字段定义 */
    fields?: ProTableFieldSchema[];
    /** 独立声明的检索字段列表（自动与列定义 col.search 合并并按 order 排序） */
    searchFields?: ProSearchFieldConfig[];
    /** 独立声明的弹窗表单字段列表（自动与列定义 col.form 合并并按 order 排序） */
    formFields?: ProCrudFormField<T>[];
    /** 表单外部 Schema 校验器（鸭子类型兼容 Zod safeParse / shape） */
    formSchema?: ProSchemaLike<F>;
    /** 表单初始默认值 */
    defaultFormValues?: Partial<F>;
    /** 表单弹窗标题配置 */
    dialogTitle?: {
        add?: string;
        edit?: string;
    };
    /** 表单弹窗尺寸 */
    dialogSize?: DialogSize | string;
    /** 表单布局形态：自适应网格 ('grid') 或五区左右分栏 ('split') */
    formLayout?: 'grid' | 'split';
    /** 草稿缓存策略配置 */
    draftConfig?: ProDraftConfig;
    /** 静态数据源（纯前端模式或外层受控数据） */
    dataSource?: T[];
    /** 是否处于加载状态（支持受控外部 loading，默认在异步查询期间自驱动） */
    loading?: boolean;
    /** 异步服务端查询函数 */
    request?: (params: ProTableRequestParams) => Promise<ProTableRequestResult<T>>;
    /** 全生命周期 CRUD 接口集合或分页查询函数（支持 list/get/view/create/add/update/delete/export/children） */
    api?: ProCrudApiConfig<T, Q, F> | ProTableApiInput<T>;
    /** 默认固定附加查询参数 */
    defaultQuery?: Partial<NoInfer<Q>>;
    /** 列表加载完成回调 */
    onListLoaded?: (list: T[]) => void;
    rowKey?: (NoInfer<keyof T> & string) | string | ((record: T) => string | number);
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    /** 是否隐藏底部分页栏 */
    hidePagination?: boolean;
    /** 自定义分页器配置：传 false 隐藏底栏分页，或传具体 Pagination 配置 */
    pagination?: ProTablePaginationConfig;
    /** 自定义底部分页插槽渲染函数 */
    renderPagination?: (paginationMeta: {
        current: number;
        pageSize: number;
        total: number;
        mode: 'offset' | 'cursor';
    }) => default_2.ReactNode;
    /** 受控单行高亮键值（与 Drawer 抽屉详情联动） */
    selectedRowKey?: string | number | null;
    /** 行点击回调（单行点击唤起 Drawer 或选中） */
    onRowClick?: (record: T, event: default_2.MouseEvent<HTMLTableRowElement>) => void;
    /** 自定义行原生属性钩子 */
    onRow?: (record: T, rowIndex: number) => default_2.HTMLAttributes<HTMLTableRowElement>;
    /** 搜索面板展示形态：'card' 默认多维折叠卡片 | 'toolbar' 紧凑水平工具条 | 'none' 不展示搜索面板 */
    searchVariant?: 'card' | 'toolbar' | 'none';
    /** 搜索条件实时变更时的受控回调 */
    onSearchChange?: (filters: Record<string, any>) => void;
    /** 点击搜索按钮或提交检索时的回调 */
    onSearchSubmit?: (filters: Record<string, any>) => void;
    /** 点击重置按钮时的回调 */
    onSearchReset?: () => void;
    /** 受控表头内联筛选模式（不传则组件内部自管理） */
    headerFilterMode?: boolean;
    onHeaderFilterModeChange?: (enabled: boolean) => void;
    /** 是否在工具栏右侧显示表头筛选模式切换按钮（外部受控 headerFilterMode 时默认隐藏以避免重复） */
    showHeaderFilterToggle?: boolean;
    /** 是否启用当前数据本地前端筛选模式 */
    clientFilter?: boolean;
    /** 是否在工具栏展示“前端筛选 / 接口筛选”实时切换开关 */
    showClientFilterSwitch?: boolean;
    /** 搜索面板超出 3 项时初始是否自动折叠为单行（默认 true） */
    defaultSearchCollapsed?: boolean;
    /** 是否在工具栏显示定时自动轮询控件 */
    autoRefresh?: boolean;
    /** 细粒度自动轮询配置（兼容 CrudTable） */
    autoRefreshConfig?: {
        show?: boolean;
        defaultEnabled?: boolean;
        defaultInterval?: number;
    };
    /** 默认轮询间隔毫秒数 */
    refetchInterval?: number;
    /** 是否启用导出按钮 */
    exportable?: boolean;
    /** exportable 语义别名 */
    showExport?: boolean;
    /** 自定义导出回调（无 api 时接收当前可见数据行数组，传入 api 时接收清洗后的查询参数） */
    onExport?: (rowsOrQuery: any) => void | Promise<void>;
    /** 是否显示导入按钮 */
    showImport?: boolean;
    onImport?: () => void | Promise<void>;
    /** 是否将当前页码与筛选条件双向同步至浏览器 URL 查询参数 */
    syncToUrl?: boolean;
    /** 是否开启操作列“详情/查看”只读弹窗 */
    viewable?: boolean;
    /** viewable 语义别名 */
    showView?: boolean;
    viewTitle?: string | ((record: T) => default_2.ReactNode);
    viewSize?: DialogSize | string;
    renderViewExtra?: (record: T) => default_2.ReactNode;
    renderViewFooter?: (record: T, closeView: () => void) => default_2.ReactNode;
    /** 当列配置 linkToView 为路由路径时触发的外部导航回调 */
    onNavigate?: (path: string, record?: T) => void;
    /** 新建/编辑表单承载容器形态：模态弹窗 ('dialog') 或侧滑抽屉 ('drawer') */
    formContainer?: 'dialog' | 'drawer';
    /** 新建/编辑表单栅格列数（1 单列 / 2 双列并排） */
    formColumns?: 1 | 2;
    /** 是否允许展示新增按钮 */
    showAdd?: boolean;
    /** 新增按钮文案 */
    addButtonText?: string;
    /** 是否允许展示编辑按钮 */
    showEdit?: boolean;
    /** 是否允许展示删除按钮 */
    showDelete?: boolean;
    /** 是否在工具栏与悬浮栏启用批量删除 */
    showBatchDelete?: boolean;
    /** 操作列扩展自定义按钮（ProTable 风格） */
    rowActions?: ProTableRowAction<T>[];
    /** 操作列扩展自定义按钮（兼容 CrudTable 风格，支持覆盖内置 edit/delete、返回 Promise 自动刷新） */
    actionButtons?: ProActionButtonConfig<T>[];
    /** 操作列默认宽度 */
    actionColumnWidth?: number;
    /** 操作列最多平铺按钮数，超出自动收纳至 `...` 下拉菜单 */
    maxInlineActions?: number;
    /** 是否开启行多选框 */
    rowSelection?: boolean;
    /** rowSelection 语义别名 */
    showRowSelection?: boolean;
    /** 受控选中行主键列表 */
    selectedRowKeys?: Array<string | number>;
    /** 选中行变更回调 */
    onRowSelectionChange?: (keys: Array<string | number>, rows: T[]) => void;
    /** 悬浮批量操作栏扩展动作 */
    batchActions?: ProTableBatchAction<T>[];
    /** 自定义批量操作插槽 */
    renderBatchActions?: (selectedRowKeys: Array<string | number>, selectedRows: T[]) => default_2.ReactNode;
    /** 是否开启树形层级表格渲染 */
    treeData?: boolean;
    /** 展开详情子面板与树形数据配置 */
    expandable?: AbcTableExpandableConfig<T>;
    /** 行拖拽重排配置 */
    sortable?: {
        enabled: boolean;
        onSort: (items: T[]) => void | Promise<any>;
        handle?: boolean;
    };
    /** 是否展示列设置按钮（默认 true） */
    columnSettingsEnabled?: boolean;
    /** 表格纵向最大高度（开启后表头吸顶内滚） */
    maxHeight?: number | string;
    /** 是否根据当前视口剩余高度自动锁定表格内部纵向滚动区（使表头吸顶、底部分页常驻视口内） */
    autoFitHeight?: boolean;
    /** 细粒度 CRUD 权限码绑定（ProTable 风格） */
    permissions?: {
        create?: string;
        update?: string;
        delete?: string;
    };
    /** 细粒度 CRUD 权限码绑定（CrudTable 风格） */
    permission?: {
        add?: string;
        edit?: string;
        delete?: string;
        batchDelete?: string;
        query?: string;
        export?: string;
        view?: string;
    };
    /** 可选自定义权限断言器（未传时默认消费 AbcProvider.permissionAdapter） */
    hasPermission?: (code?: string) => boolean;
    /** 工具栏左侧附加按钮列表 */
    toolbarButtons?: ProToolbarButtonConfig[];
    /** 工具栏左侧附加节点插槽 */
    toolbarExtra?: default_2.ReactNode;
    renderToolbarExtra?: () => default_2.ReactNode;
    /** 页面顶部标题右侧扩展区 */
    headerExtra?: default_2.ReactNode;
    renderExtra?: () => default_2.ReactNode;
    /** 搜索卡片上方自定义统计或提示横幅插槽 */
    cardExtra?: default_2.ReactNode;
    renderCardExtra?: () => default_2.ReactNode;
    /** 搜索表单自定义扩展筛选项插槽 */
    renderSearchExtra?: (ctx: {
        query: Record<string, any>;
        onQueryChange: (key: string, value: any) => void;
        isSearchVisible: (columnKey: string) => boolean;
    }) => default_2.ReactNode;
    /** 表单弹窗底部扩展内容插槽 */
    renderFormExtra?: (form: ProFormInstance<any>, isEdit: boolean) => default_2.ReactNode;
    /** 完全接管新建/编辑表单弹窗渲染 */
    renderCustomForm?: (props: {
        open: boolean;
        onClose: () => void;
        record: T | null;
        isEdit: boolean;
        onSuccess: () => void;
    }) => default_2.ReactNode;
    /** 外部命令式控制引用 */
    onRefreshRef?: default_2.MutableRefObject<((resetToFirstPage?: boolean) => void) | null>;
    onAddWithValuesRef?: default_2.MutableRefObject<((values: Partial<F>) => void) | null>;
    openEditRef?: default_2.MutableRefObject<((record: T) => void) | null>;
    /** CRUD 生命周期拦截与回调钩子 */
    onAdd?: () => void;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onBeforeAdd?: (values: F) => boolean | F | Promise<boolean | F>;
    onBeforeEdit?: (values: F, record: T) => boolean | F | Promise<boolean | F>;
    onBeforeSubmit?: (values: F, isEdit: boolean, record: T | null) => boolean | Record<string, any> | Promise<boolean | Record<string, any>>;
    onBeforeDelete?: (record: T) => boolean | Promise<boolean>;
    onBeforeBatchDelete?: (ids: Array<string | number>) => boolean | Promise<boolean>;
    onAfterSave?: (record: any) => void;
    onAfterDelete?: () => void;
    onAfterBatchDelete?: () => void;
    /** 表格整体交互动效规格 */
    motion?: AbcMotionPreset;
    /** 右侧内联挤压式详情容器节点（通常传入 <SplitDetailPanel>） */
    splitPanel?: default_2.ReactNode;
    /** 是否在表格右侧挤出详情容器；关闭时表格自动恢复 100% 宽度 */
    splitPanelOpen?: boolean;
    /** 是否进入右侧详情沉浸全宽视图（同步隐藏搜索区与主表） */
    splitPanelExpanded?: boolean;
    /** 右侧挤压容器默认宽度（数字按 px 处理，默认 480） */
    splitPanelWidth?: number | string;
    splitPanelMinWidth?: number;
    splitPanelMaxWidth?: number;
    splitPanelResizable?: boolean;
    splitPanelStorageKey?: string;
    splitPanelSticky?: boolean;
    /** 新建/编辑保存回调（无 api 时的轻量直连模式） */
    onSaveRecord?: (values: Record<string, any>, editingRecord: T | null) => void | Promise<void>;
    /** 单行或批量删除回调（无 api 时的轻量直连模式） */
    onDeleteRecords?: (keys: Array<string | number>) => void | Promise<void>;
    /** 空状态主标题 */
    emptyText?: default_2.ReactNode;
    /** 空状态副标题描述 */
    emptyDescription?: default_2.ReactNode;
    /** 空状态底部操作区 */
    emptyAction?: default_2.ReactNode;
    /** 自定义空状态节点（覆盖内置 EmptyState） */
    emptyNode?: default_2.ReactNode;
    /** 空状态重置回调 */
    onEmptyReset?: () => void;
}

export declare interface ProTableRequestParams {
    current: number;
    pageSize: number;
    filters: Record<string, any>;
    sortField?: string;
    sortOrder?: SortDirection;
}

export declare interface ProTableRequestResult<T> {
    data: T[];
    total: number;
}

export declare interface ProTableRowAction<T = Record<string, any>> {
    key: string;
    label: default_2.ReactNode;
    icon?: default_2.ReactNode;
    danger?: boolean;
    permission?: string;
    hidden?: (record: T) => boolean;
    onClick: (record: T) => void | Promise<any>;
}

export declare interface ProToolbarButtonConfig {
    key: string;
    label: default_2.ReactNode;
    icon?: default_2.ReactNode;
    variant?: ButtonVariant;
    type?: ButtonVariant;
    permission?: string;
    onClick: () => void;
}

export declare interface ProWizardStepConfig<T = Record<string, any>> {
    key: string;
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    validate?: (values: T) => boolean | string | undefined | Promise<boolean | string | undefined>;
    render: (ctx: ProWizardStepRenderContext<T>) => default_2.ReactNode;
}

export declare interface ProWizardStepRenderContext<T = Record<string, any>> {
    values: T;
    setValues: (patch: Partial<T>) => void;
    setValue: <K extends keyof T>(key: K, val: T[K]) => void;
    error?: string | null;
}

/** 向全局队列推送一条 Toast 消息 */
export declare function pushToast(tone: ToastTone, messageOrOptions: default_2.ReactNode | ToastOptions, duration?: number): string;

/**
 * 快捷选择条 (QuickSelectBar)
 * 紧凑型水平快速筛选器
 */
export declare function QuickSelectBar({ label, items, selectedId, headerAction, onSelect, onClear, allLabel, className, }: QuickSelectBarProps): React_2.JSX.Element;

export declare interface QuickSelectBarItem {
    id?: string;
    key?: string;
    label: React_2.ReactNode;
    code?: string;
    active?: boolean;
    count?: number;
    onSelect?: () => void;
}

export declare interface QuickSelectBarProps {
    label: string;
    items: QuickSelectBarItem[];
    selectedId?: string | null;
    headerAction?: React_2.ReactNode;
    onSelect?: (id: string | null) => void;
    onClear?: () => void;
    allLabel?: string;
    className?: string;
}

export declare interface QuotaUnitInputBaseProps {
    id?: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    size?: 'default' | 'sm';
    disabled?: boolean;
    hideHint?: boolean;
    className?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
    placeholder?: string;
}

/** 单选组（支持常规圆点与分段胶囊卡片双样式、全四档尺寸规格及动效规格） */
export declare const RadioGroup: default_2.FC<RadioGroupProps>;

export declare interface RadioGroupOption {
    label: default_2.ReactNode;
    value: string | number;
    disabled?: boolean;
}

export declare interface RadioGroupProps {
    options: RadioGroupOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (val: string | number) => void;
    variant?: 'default' | 'segmented';
    size?: AbcSize;
    motion?: AbcMotionPreset;
    disabled?: boolean;
    className?: string;
}

/**
 * 零依赖复合下拉选择器 (RadixSelect / SelectTrigger / SelectValue / SelectContent / SelectItem)
 */
export declare function RadixSelect({ value, defaultValue, onValueChange, disabled, open: controlledOpen, defaultOpen, onOpenChange, children, }: RadixSelectProps): default_2.JSX.Element;

export declare interface RadixSelectProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: default_2.ReactNode;
}

export declare function ReadErrorBanner({ message, code, status, requestId, onRetry, retryLabel, pendingLabel, retryAriaLabel, pending, action, ...props }: ReadErrorBannerProps): React_2.JSX.Element;

export declare interface ReadErrorBannerProps extends Omit<NotificationBannerProps, 'action' | 'variant'> {
    onRetry?: () => void;
    retryLabel?: string;
    pendingLabel?: string;
    retryAriaLabel?: string;
    pending?: boolean;
    action?: React_2.ReactNode;
}

/**
 * 必填审计原因确认弹窗 (ReasonedActionDialog)
 * 专用于高安全等级操作（如删除租户、切换环境、强制变更配额、重置密钥等），强制要求填入审计说明
 */
export declare function ReasonedActionDialog({ open, title, description, confirmLabel, cancelLabel, onCancel, workingLabel, reasonLabel, reasonPlaceholder, reasonHint, reasonTooLongMessage, closeLabel, minReasonLength, maxReasonLength, destructive, variant, pending, confirmDisabled, error, maxWidthClass, className, children, onOpenChange, onConfirm, }: ReasonedActionDialogProps): React_2.JSX.Element;

export declare interface ReasonedActionDialogProps {
    open: boolean;
    title: React_2.ReactNode;
    description: React_2.ReactNode;
    confirmLabel: React_2.ReactNode;
    cancelLabel?: React_2.ReactNode;
    onCancel?: () => void;
    workingLabel?: React_2.ReactNode;
    reasonLabel?: React_2.ReactNode;
    reasonPlaceholder?: string;
    reasonHint?: React_2.ReactNode;
    reasonTooLongMessage?: React_2.ReactNode;
    closeLabel?: string;
    minReasonLength?: number;
    maxReasonLength?: number;
    destructive?: boolean;
    variant?: 'default' | 'destructive';
    pending?: boolean;
    confirmDisabled?: boolean;
    error?: string | null;
    maxWidthClass?: string;
    className?: string;
    children?: React_2.ReactNode;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
}

/**
 * 必填审计原因侧边抽屉 (ReasonedActionDrawer)
 * 专用于承载复杂大表单（如配额上限配置、权限清单）且需要强制填写审计原因的场景，支持与主抽屉平级并排展开
 */
export declare function ReasonedActionDrawer({ open, onClose, title, description, confirmLabel, cancelLabel, workingLabel, reasonLabel, reasonPlaceholder, reasonHint, reasonTooLongMessage, minReasonLength, maxReasonLength, destructive, pending, confirmDisabled, error, width, cascadeMode, children, onConfirm, }: ReasonedActionDrawerProps): React_2.JSX.Element;

export declare interface ReasonedActionDrawerProps {
    open: boolean;
    onClose: () => void;
    title: React_2.ReactNode;
    description?: React_2.ReactNode;
    confirmLabel: React_2.ReactNode;
    cancelLabel?: React_2.ReactNode;
    workingLabel?: React_2.ReactNode;
    reasonLabel?: React_2.ReactNode;
    reasonPlaceholder?: string;
    reasonHint?: React_2.ReactNode;
    reasonTooLongMessage?: React_2.ReactNode;
    minReasonLength?: number;
    maxReasonLength?: number;
    destructive?: boolean;
    pending?: boolean;
    confirmDisabled?: boolean;
    error?: string | null;
    width?: number | string;
    cascadeMode?: 'stack' | 'adjacent';
    children?: React_2.ReactNode;
    onConfirm: (reason: string) => void;
}

/** 全局注册自定义业务图标映射，供菜单路由配置按字符串名称动态解析 */
export declare function registerAbcIcons(icons: Record<string, AbcIconComponent>): void;

export { RejectedTagItem }

export declare function renderBuiltInValue<T extends Record<string, any>>(rawVal: any, record: T, col: AbcColumn<T>, onRowView?: (record: T, linkTarget?: string) => void): default_2.ReactNode;

/**
 * 可拖拽调节与折叠的双栏分割容器 (ResizableSplitPane)
 *
 * 支持水平/垂直方向拖拽、键盘方向键与 Home/End 调节、双击复位、
 * localStorage 尺寸记忆，并在窄屏（<768px）水平模式下自动退化为上下堆叠以保障可读性。
 */
export declare const ResizableSplitPane: React_2.ForwardRefExoticComponent<ResizableSplitPaneProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface ResizableSplitPaneProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** 分栏方向：horizontal 为左右分栏，vertical 为上下分栏（默认 horizontal） */
    direction?: 'horizontal' | 'vertical';
    /** 非受控初始尺寸（px，默认 260） */
    defaultSize?: number;
    /** 受控尺寸（px） */
    size?: number;
    /** 尺寸变更回调 */
    onSizeChange?: (next: number) => void;
    /** 最小尺寸限制（px，默认 180） */
    minSize?: number;
    /** 最大尺寸限制（px，默认 560） */
    maxSize?: number;
    /** 是否允许折叠主面板（默认 true） */
    collapsible?: boolean;
    /** 受控折叠状态 */
    collapsed?: boolean;
    /** 非受控初始折叠状态 */
    defaultCollapsed?: boolean;
    /** 折叠状态变更回调 */
    onCollapsedChange?: (collapsed: boolean) => void;
    /** 本地持久化记忆尺寸的存储键（自动捕获隐私模式等存储异常） */
    storageKey?: string;
    /** 第一分栏内容（左侧或上方） */
    firstPane: React_2.ReactNode;
    /** 第二分栏内容（右侧或下方，自动占满剩余空间） */
    secondPane: React_2.ReactNode;
    /** 折叠按钮无障碍文案 */
    collapseLabel?: string;
    /** 展开按钮无障碍文案 */
    expandLabel?: string;
    /** 第一分栏容器附加类名 */
    firstPaneClassName?: string;
    /** 第二分栏容器附加类名 */
    secondPaneClassName?: string;
}

export declare type ResolvedColorScheme = 'light' | 'dark';

export declare interface ResolvedRowActionItem {
    key: string;
    label?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    danger?: boolean;
    disabled?: boolean;
    title?: string;
    variant?: ButtonVariant;
    className?: string;
    onClick: () => void;
}

export declare function resolveFieldKey(field: {
    key?: string;
    name?: string;
}): string;

export declare function resolveSemanticLucideIcon(token?: string | null): LucideIcon;

export declare function resolveSortableKey<T>(item: T, rowKey?: SortableRowKey<T>): string | number;

export declare function resolveStatusBadgeVariant(status: string): StatusBadgeVariant;

/**
 * 企业级结果与异常状态反馈页 (Result: 403 / 404 / 500 / 成功 / 失败)
 */
export declare const Result: default_2.FC<ResultProps>;

export declare interface ResultProps {
    status?: ResultStatus;
    title: default_2.ReactNode;
    subTitle?: default_2.ReactNode;
    extra?: default_2.ReactNode;
    children?: default_2.ReactNode;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

export declare type ResultStatus = 'success' | 'info' | 'warning' | 'error' | '403' | '404' | '500';

/** 恢复指定 Toast 的自动关闭倒计时 */
export declare function resumeToast(id: string): void;

/**
 * 智能矢量图标文本解析组件 (RichIconText)
 */
export declare function RichIconText({ text, token, icon, iconSize, size, iconClassName, preserveSrToken, className, children, ...props }: RichIconTextProps): React_2.JSX.Element;

export declare interface RichIconTextProps extends React_2.HTMLAttributes<HTMLSpanElement> {
    text?: string;
    token?: string;
    icon?: string;
    iconSize?: number;
    size?: number;
    iconClassName?: string;
    preserveSrToken?: boolean;
}

export declare const RuleBuilder: default_2.FC<FilterBuilderProps>;

export declare type RuleBuilderProps = FilterBuilderProps;

export declare interface SavedFilterViewItem<TFilter = any> {
    id: string;
    name: string;
    filter: TFilter;
    builtIn?: boolean;
    count?: number;
}

/**
 * 常用筛选视图管理栏 (SavedFilterViews)
 * 支持内置锁定视图、自定义视图持久化（localStorage）、脏状态提示及内联另存为确认流。
 */
export declare function SavedFilterViews<TFilter = any>({ views, defaultViews, onViewsChange, activeViewId, onSelectView, currentFilter, isDirty, storageKey, onSaveAsView, onUpdateView, onDeleteView, ariaLabel, className, }: SavedFilterViewsProps<TFilter>): JSX.Element;

export declare namespace SavedFilterViews {
    var displayName: string;
}

export declare interface SavedFilterViewsProps<TFilter = any> {
    /** 受控视图列表 */
    views?: SavedFilterViewItem<TFilter>[];
    /** 非受控初始视图列表 */
    defaultViews?: SavedFilterViewItem<TFilter>[];
    /** 视图列表变更回调 */
    onViewsChange?: (views: SavedFilterViewItem<TFilter>[]) => void;
    /** 当前激活视图 ID（受控） */
    activeViewId?: string;
    /** 选中或新建激活视图回调 */
    onSelectView?: (view: SavedFilterViewItem<TFilter>) => void;
    /** 当前业务筛选器状态 */
    currentFilter: TFilter;
    /** 显式脏状态覆盖；省略时自动深度比对 currentFilter 与激活视图 */
    isDirty?: boolean;
    /** 非空时自动将自定义视图持久化到 localStorage */
    storageKey?: string;
    /** 另存为新视图回调 */
    onSaveAsView?: (name: string, filter: TFilter) => void;
    /** 更新当前自定义视图回调 */
    onUpdateView?: (viewId: string, filter: TFilter) => void;
    /** 删除自定义视图回调 */
    onDeleteView?: (viewId: string) => void;
    /** 无障碍区域标签 */
    ariaLabel?: string;
    className?: string;
}

export declare type SearchFieldConfig = ProSearchFieldConfig;

/**
 * 统一定制搜索框组件 (SearchInput)
 * 基于 Input 的原生 prefix/suffix 机制，图标垂直精确居中，支持一键清空与回车监听
 */
export declare const SearchInput: React_2.ForwardRefExoticComponent<SearchInputProps & React_2.RefAttributes<HTMLInputElement>>;

export declare interface SearchInputProps extends Omit<InputProps, 'prefix'> {
    containerClassName?: string;
    wrapperClassName?: string;
    onClear?: () => void;
    clearLabel?: string;
}

/** 次要按钮样式 */
export declare const secondaryClass = "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] text-[var(--abc-fg-secondary)] hover:bg-[var(--abc-bg-subtle)] hover:border-[var(--abc-border-strong)] px-3.5 py-1.5 text-xs font-medium transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer select-none";

/**
 * 分段选择器控件 (SegmentedControl)
 * 用于在多个互斥选项之间进行快捷切换，支持图标、角标、等宽/流式自适应布局
 */
export declare function SegmentedControl<T extends string | number>({ options, value, onChange, onValueChange, disabled, size, motion, block, className, ...props }: SegmentedControlProps<T>): React_2.JSX.Element;

export declare interface SegmentedControlProps<T extends string | number> extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: ReadonlyArray<SegmentedOption<T>>;
    value: T;
    onChange?: (value: T) => void;
    onValueChange?: (value: T) => void;
    disabled?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    block?: boolean;
}

export declare interface SegmentedOption<T extends string | number> {
    value: T;
    label: React_2.ReactNode;
    icon?: React_2.ReactNode;
    disabled?: boolean;
    badge?: React_2.ReactNode;
}

export declare const Select: default_2.ForwardRefExoticComponent<SelectProps & default_2.RefAttributes<HTMLSelectElement>>;

export declare const SelectContent: default_2.ForwardRefExoticComponent<SelectContentProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface SelectContentProps extends default_2.HTMLAttributes<HTMLDivElement> {
    position?: 'popper' | 'item-aligned';
}

/**
 * 声明式单选快捷字段封装 (SelectField)
 * 提供直接面向字符串的 onValueChange 回调与触发器/弹层类名透传
 */
export declare function SelectField({ value, defaultValue, onValueChange, onChange, options, label, error, helperText, placeholder, searchable, allowClear, clearable, 'aria-label': ariaLabel, id, disabled, triggerClassName, contentClassName, size, }: SelectFieldProps): default_2.JSX.Element;

export declare interface SelectFieldProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (val: string) => void;
    onChange?: (val: any) => void;
    options: ReadonlyArray<{
        value: string | number;
        label: default_2.ReactNode;
        disabled?: boolean;
        description?: string;
    }>;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: default_2.ReactNode;
    placeholder?: string;
    searchable?: boolean;
    allowClear?: boolean;
    clearable?: boolean;
    'aria-label'?: string;
    id?: string;
    disabled?: boolean;
    triggerClassName?: string;
    contentClassName?: string;
    size?: SelectSize;
}

export declare const SelectGroup: default_2.FC<default_2.HTMLAttributes<HTMLDivElement>>;

export declare const SelectItem: default_2.ForwardRefExoticComponent<SelectItemProps & default_2.RefAttributes<HTMLButtonElement>>;

export declare interface SelectItemProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    disabled?: boolean;
}

export declare const SelectLabel: default_2.ForwardRefExoticComponent<default_2.HTMLAttributes<HTMLDivElement> & default_2.RefAttributes<HTMLDivElement>>;

export declare interface SelectOption {
    label: default_2.ReactNode;
    value: string | number;
    disabled?: boolean;
    description?: string;
    group?: string;
}

export declare interface SelectProps extends Omit<default_2.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange' | 'value' | 'defaultValue' | 'onBlur' | 'onKeyDown'> {
    options?: ReadonlyArray<SelectOption>;
    value?: string | number | Array<string | number>;
    defaultValue?: string | number | Array<string | number>;
    onChange?: (valOrEvent: any) => void;
    onValueChange?: (value: string) => void;
    onBlur?: default_2.FocusEventHandler<HTMLElement>;
    onKeyDown?: default_2.KeyboardEventHandler<HTMLElement>;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: default_2.ReactNode;
    placeholder?: string;
    multiple?: boolean;
    searchable?: boolean;
    allowClear?: boolean;
    clearable?: boolean;
    invalid?: boolean;
    size?: SelectSize;
    motion?: AbcMotionPreset;
    /** 外层容器扩展样式类名（如控制宽度 w-32 或 shrink-0 等） */
    wrapperClassName?: string;
    /** wrapperClassName 语义别名 */
    containerClassName?: string;
    /** 下拉浮层容器扩展样式类名 */
    dropdownClassName?: string;
    /** dropdownClassName 语义别名 */
    popoverClassName?: string;
    /** 是否同步触发器宽度至下拉菜单最小宽度（默认 true） */
    matchWidth?: boolean;
    /** 是否隐藏右侧下拉箭头 */
    hideChevron?: boolean;
    /** 自定义 Portal 挂载容器（未传时自动探测祖先 dialog[open] 或 document.body） */
    container?: HTMLElement | null;
    children?: default_2.ReactNode;
}

export declare const SelectSeparator: default_2.ForwardRefExoticComponent<default_2.HTMLAttributes<HTMLDivElement> & default_2.RefAttributes<HTMLDivElement>>;

export declare type SelectSize = ControlSize | 'ghost';

export declare const SelectTrigger: default_2.ForwardRefExoticComponent<SelectTriggerProps & default_2.RefAttributes<HTMLButtonElement>>;

export declare interface SelectTriggerProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
}

export declare function SelectValue({ placeholder }: {
    placeholder?: default_2.ReactNode;
}): default_2.JSX.Element;

/**
 * 矢量语义图标组件 (SemanticIcon)
 */
export declare function SemanticIcon({ token, icon, size, strokeWidth, className, srText, ...props }: SemanticIconProps): React_2.JSX.Element;

export declare interface SemanticIconProps extends Omit<React_2.SVGProps<SVGSVGElement>, 'ref'> {
    token?: string;
    icon?: string;
    size?: number;
    strokeWidth?: number;
    srText?: string;
}

/**
 * 语义分割线组件 (Separator)
 */
export declare const Separator: React_2.ForwardRefExoticComponent<SeparatorProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface SeparatorProps extends React_2.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
}

/** 经典侧边栏树形菜单渲染器（支持深浅双色、内联菜单/组件检索、四档尺寸与动效、折叠 Portal 悬浮子菜单与平滑网格手风琴展开） */
export declare const SidebarNav: default_2.FC<{
    brand?: AbcBrandInfo;
    items: AbcMenuItem[];
    pathname: string;
    collapsed?: boolean;
    accordion?: boolean;
    tone?: AbcSidebarTone;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    /** 是否在展开态侧边栏顶部渲染快捷筛选框（同时检索路由名、路径与 keywords 组件词） */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** 可选注入全局组件/指令索引：在侧栏输入搜索词时直接展示匹配的组件直达列表，不再仅展示路由 */
    commandActions?: CommandActionItem[];
    /** 点击筛选区底部“全局定位 (⌘K)”时的回调（透传当前已输入的筛选词） */
    onOpenCommandPalette?: (prefillQuery?: string) => void;
    onNavigate: (path: string, item: AbcMenuItem) => void;
    className?: string;
}>;

/**
 * 骨架屏占位原语
 * 复用 @abc-design/tokens 全局声明的 .abc-skeleton-wave，零运行时内联 <style> 注入
 */
export declare const Skeleton: default_2.FC<SkeletonProps>;

export declare type SkeletonAnimation = 'wave' | 'pulse' | 'none';

/** 指标卡预设骨架屏（消除首屏 KPI 卡片 CLS 跳动） */
export declare const SkeletonCard: default_2.FC<SkeletonCardProps>;

export declare interface SkeletonCardProps extends default_2.HTMLAttributes<HTMLDivElement> {
    animation?: SkeletonAnimation;
}

/** 图表容器预设骨架屏（用于报表页异步加载阶段防 CLS） */
export declare const SkeletonChart: default_2.FC<SkeletonChartProps>;

export declare interface SkeletonChartProps extends default_2.HTMLAttributes<HTMLDivElement> {
    height?: number | string;
    animation?: SkeletonAnimation;
}

export declare interface SkeletonProps extends default_2.HTMLAttributes<HTMLDivElement> {
    variant?: SkeletonVariant;
    animation?: SkeletonAnimation;
    motion?: AbcMotionPreset;
    width?: number | string;
    height?: number | string;
}

/** 数据表格预设骨架屏 */
export declare const SkeletonTable: default_2.FC<SkeletonTableProps>;

export declare interface SkeletonTableProps extends default_2.HTMLAttributes<HTMLDivElement> {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
    animation?: SkeletonAnimation;
}

export declare type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export declare const SliderVerify: default_2.FC<SliderVerifyProps>;

export declare interface SliderVerifyProps {
    canvasWidth?: number;
    canvasHeight?: number;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    /** 验证通过回调，携带服务端 nonceStr 与滑块横向偏移像素值 */
    onSuccess: (data: {
        nonceStr: string;
        value: number;
    }) => void;
    onFail?: () => void;
    /** 局部自定义验证码拉取函数（优先级高于 AbcProvider.captchaAdapter；均未传时启用内置离线 SVG 拼图挑战） */
    captchaFetcher?: AbcCaptchaAdapter;
}

/** 智能双模分页器（自动根据是否提供 total 或游标属性平滑降级切换） */
export declare const SmartPagination: default_2.FC<PaginationProps>;

export declare interface SonnerCompatToastItem {
    id: string | number;
    renderFn?: (id: string | number) => React_2.ReactNode;
    title?: React_2.ReactNode;
    description?: React_2.ReactNode;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    delete?: boolean;
}

/**
 * 零三方依赖的 Sonner 兼容命令式 Toast 适配器
 */
export declare const sonnerToast: ((title: React_2.ReactNode, opts?: {
    id?: string | number;
    description?: React_2.ReactNode;
    duration?: number;
}) => string | number) & {
    custom: (renderFn: (id: string | number) => React_2.ReactNode, opts?: {
        id?: string | number;
        duration?: number;
    }) => string | number;
    success: (title: React_2.ReactNode, opts?: {
        id?: string | number;
        description?: React_2.ReactNode;
        duration?: number;
    }) => string | number;
    error: (title: React_2.ReactNode, opts?: {
        id?: string | number;
        description?: React_2.ReactNode;
        duration?: number;
    }) => string | number;
    warning: (title: React_2.ReactNode, opts?: {
        id?: string | number;
        description?: React_2.ReactNode;
        duration?: number;
    }) => string | number;
    info: (title: React_2.ReactNode, opts?: {
        id?: string | number;
        description?: React_2.ReactNode;
        duration?: number;
    }) => string | number;
    dismiss: (id?: string | number) => void;
};

export declare interface SortableItemRenderMeta {
    index: number;
    total: number;
    selected: boolean;
    dragging: boolean;
    grabbed: boolean;
}

/**
 * 可拖拽重排紧凑卡片列表原语 (SortableList)
 *
 * 遵循现代 Web 拖拽与动态排序无障碍规范：
 * 1. 独立拖拽手柄（限定 touch-action: none 与 user-select: none，保留正文选择与滚屏）；
 * 2. 单指针捕获 + 布局中点计算落点 + CSS ::before/::after 缝隙落点指示线（拖拽中不抖动重排 DOM，松手一次性提交）；
 * 3. 完整支持键盘 Space 抓取 / 方向键移动 / Esc 取消回滚及单条 sr-only role="status" 礼貌播报。
 */
export declare function SortableList<T>({ items, rowKey, onReorder, getItemLabel, selectedKey, onSelect, renderItem, renderActions, showMoveButtons, showIndexBadge, disabled, emptyNode, labels: customLabels, className, itemClassName, ...rest }: SortableListProps<T>): React_2.JSX.Element;

export declare namespace SortableList {
    var displayName: string;
}

export declare interface SortableListLabels {
    /** 拖拽手柄无障碍标签 */
    dragHandleLabel?: (itemLabel: string, position: number, total: number) => string;
    /** 键盘聚焦未抓取时的提示文案 */
    idleFocusHint?: string;
    /** 键盘抓取态提示文案 */
    grabbedHint?: string;
    /** 屏幕阅读器抓取播报 */
    grabbedAnnouncement?: (itemLabel: string, position: number, total: number) => string;
    /** 屏幕阅读器移动后播报 */
    movedAnnouncement?: (itemLabel: string, position: number, total: number) => string;
    /** 屏幕阅读器放下播报 */
    droppedAnnouncement?: (itemLabel: string, position: number, total: number) => string;
    /** 屏幕阅读器取消重排播报 */
    cancelledAnnouncement?: (itemLabel: string) => string;
    /** 显式上移按钮标签 */
    moveUpLabel?: (itemLabel: string) => string;
    /** 显式下移按钮标签 */
    moveDownLabel?: (itemLabel: string) => string;
}

export declare interface SortableListProps<T> extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
    /** 列表数据源 */
    items: ReadonlyArray<T>;
    /** 行唯一键字段名或提取器（默认 'id'） */
    rowKey?: SortableRowKey<T>;
    /** 重排完成回调 */
    onReorder: (nextItems: T[], meta: SortableMoveMeta) => void;
    /** 获取条目的纯文本名称（用于无障碍手柄命名与状态播报） */
    getItemLabel?: (item: T, index: number) => string;
    /** 当前激活/选中的条目键（用于配合右侧详情面板高亮） */
    selectedKey?: string | number | null;
    /** 点击条目主内容区触发选中回调 */
    onSelect?: (item: T, index: number) => void;
    /** 渲染条目紧凑摘要内容 */
    renderItem: (item: T, meta: SortableItemRenderMeta) => React_2.ReactNode;
    /** 渲染条目右侧独立快捷动作槽（点击不会触发行选中） */
    renderActions?: (item: T, meta: SortableItemRenderMeta) => React_2.ReactNode;
    /** 是否在右侧同时显示显式上移/下移微按钮（默认 false） */
    showMoveButtons?: boolean;
    /** 是否显示左侧序号徽标（默认 true） */
    showIndexBadge?: boolean;
    /** 禁用拖拽与排序操作 */
    disabled?: boolean;
    /** 空列表占位节点 */
    emptyNode?: React_2.ReactNode;
    /** 多语言与无障碍文案覆写 */
    labels?: SortableListLabels;
    /** 单条卡片附加类名 */
    itemClassName?: string;
}

export declare interface SortableMoveMeta {
    fromIndex: number;
    toIndex: number;
    key: string | number;
    trigger: 'pointer' | 'keyboard' | 'button';
}

export declare type SortableRowKey<T> = (keyof T & string) | ((item: T) => string | number);

/**
 * 紧凑可拖拽排序列表 × 右侧内联挤压编辑工作台 (SortableSplitEditor)
 *
 * 专为多卡片表单（如支付渠道配置、路由策略、通知钩子等）的空间压缩与顺序编排设计：
 * - 左侧仅展示单行高密度摘要卡片并支持拖拽/键盘重排；
 * - 拖拽后在前端暂存新顺序，顶栏自动浮现“顺序未保存”徽标与“重置顺序 / 保存排序”按钮统一提交；
 * - 点击任意条目或顶栏“新建”按钮时，在右侧平滑挤出非阻塞式 SplitDetailPanel（支持上下条快捷切换与一键收起释放全宽）。
 */
export declare function SortableSplitEditor<T>({ items, rowKey, title, description, headerExtra, getItemLabel, renderItem, renderItemActions, renderEditor, renderPanelFooter, renderPanelTitle, renderPanelSubtitle, renderPanelBadge, onSaveOrder, onStagedOrderChange, selectedKey: controlledSelectedKey, defaultSelectedKey, onSelectedKeyChange, allowCreate, creating: controlledCreating, onCreatingChange, showMoveButtons, showIndexBadge, disabled, loading, errorNode, emptyNode, panelWidth, storageKey, labels: customLabels, className, ...rest }: SortableSplitEditorProps<T>): React_2.JSX.Element;

export declare namespace SortableSplitEditor {
    var displayName: string;
}

export declare interface SortableSplitEditorLabels extends SortableListLabels {
    /** 顺序变更待保存徽标文案 */
    unsavedOrderBadge?: string;
    /** 保存排序按钮文案 */
    saveOrderButton?: string;
    /** 重置排序按钮文案 */
    resetOrderButton?: string;
    /** 新建按钮文案 */
    addButton?: string;
    /** 新建态右侧面板默认标题 */
    createPanelTitle?: string;
    /** 编辑态右侧面板默认标题 */
    editPanelTitle?: (itemLabel: string) => string;
    /** 右侧面板关闭按钮无障碍标签 */
    closePanelLabel?: string;
    /** 上一条按钮标签 */
    prevItemLabel?: string;
    /** 下一条按钮标签 */
    nextItemLabel?: string;
    /** 沉浸展开按钮标签 */
    expandPanelLabel?: string;
    /** 还原分栏按钮标签 */
    restorePanelLabel?: string;
}

export declare interface SortableSplitEditorProps<T> extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title' | 'onSelect' | 'children'> {
    /** 已持久化的基准列表数据 */
    items: ReadonlyArray<T>;
    /** 行唯一键（默认 'id'） */
    rowKey?: SortableRowKey<T>;
    /** 区块标题 */
    title?: React_2.ReactNode;
    /** 区块说明副标题 */
    description?: React_2.ReactNode;
    /** 顶栏右侧自定义扩展节点 */
    headerExtra?: React_2.ReactNode;
    /** 获取条目的纯文本名称 */
    getItemLabel?: (item: T, index: number) => string;
    /** 渲染左侧单行紧凑摘要内容 */
    renderItem: (item: T, meta: SortableItemRenderMeta) => React_2.ReactNode;
    /** 渲染左侧单行右侧独立动作区（如启停状态胶囊） */
    renderItemActions?: (item: T, meta: SortableItemRenderMeta) => React_2.ReactNode;
    /** 渲染右侧 SplitDetailPanel 内的详情/表单内容 */
    renderEditor: (ctx: SortableSplitEditorRenderContext<T>) => React_2.ReactNode;
    /** 渲染右侧 SplitDetailPanel 底部固定操作栏 */
    renderPanelFooter?: (ctx: SortableSplitEditorRenderContext<T>) => React_2.ReactNode;
    /** 自定义右侧面板标题 */
    renderPanelTitle?: (ctx: SortableSplitEditorRenderContext<T>) => React_2.ReactNode;
    /** 自定义右侧面板副标题 */
    renderPanelSubtitle?: (ctx: SortableSplitEditorRenderContext<T>) => React_2.ReactNode;
    /** 自定义右侧面板徽标 */
    renderPanelBadge?: (ctx: SortableSplitEditorRenderContext<T>) => React_2.ReactNode;
    /** 点击顶栏“保存排序”提交暂存顺序回调 */
    onSaveOrder?: (orderedItems: T[]) => void | Promise<void>;
    /** 暂存顺序变化通知回调 */
    onStagedOrderChange?: (orderedItems: T[], orderDirty: boolean) => void;
    /** 受控当前选中条目键 */
    selectedKey?: string | number | null;
    /** 初始选中条目键 */
    defaultSelectedKey?: string | number | null;
    /** 选中条目变更回调 */
    onSelectedKeyChange?: (key: string | number | null) => void;
    /** 是否允许顶栏显示“新建”按钮并切入右侧新建模式（默认 false） */
    allowCreate?: boolean;
    /** 受控新建模式开关 */
    creating?: boolean;
    /** 新建模式变更回调 */
    onCreatingChange?: (creating: boolean) => void;
    /** 是否显示左侧显式上下移微按钮（默认 false） */
    showMoveButtons?: boolean;
    /** 是否显示左侧序号徽标（默认 true） */
    showIndexBadge?: boolean;
    /** 禁用排序 */
    disabled?: boolean;
    /** 列表加载态 */
    loading?: boolean;
    /** 顶部错误提示节点 */
    errorNode?: React_2.ReactNode;
    /** 空列表占位节点 */
    emptyNode?: React_2.ReactNode;
    /** 右侧内联挤压详情面板初始宽度（默认 460） */
    panelWidth?: number | string;
    /** 持久化右侧面板宽度的存储键 */
    storageKey?: string;
    /** 多语言与无障碍文案覆写 */
    labels?: SortableSplitEditorLabels;
}

export declare interface SortableSplitEditorRenderContext<T> {
    mode: 'edit' | 'create';
    item: T | null;
    index: number;
    total: number;
    close: () => void;
}

export declare type SortDirection = 'asc' | 'desc' | null;

/** 弹性间距编排容器 */
export declare const Space: default_2.FC<SpaceProps>;

export declare interface SpaceProps extends default_2.HTMLAttributes<HTMLDivElement> {
    direction?: 'horizontal' | 'vertical';
    size?: AbcSize;
    wrap?: boolean;
    align?: 'start' | 'center' | 'end' | 'stretch';
}

export declare function SplitDetailBody({ className, ...props }: React_2.HTMLAttributes<HTMLDivElement>): React_2.JSX.Element;

export declare function SplitDetailFooter({ className, ...props }: React_2.HTMLAttributes<HTMLDivElement>): React_2.JSX.Element;

export declare function SplitDetailHeader({ className, ...props }: React_2.HTMLAttributes<HTMLDivElement>): React_2.JSX.Element;

/**
 * 主从内联挤压分栏布局 (SplitDetailLayout)
 *
 * 用于替代传统带全屏暗化遮罩的 Drawer，在表格或列表右侧挤出非阻塞式详情容器，
 * 使操作员可直接单击左侧不同行即时切换右侧详情，关闭后自动释放全部横向宽度。
 */
export declare const SplitDetailLayout: React_2.ForwardRefExoticComponent<SplitDetailLayoutProps & React_2.RefAttributes<HTMLDivElement>>;

export declare interface SplitDetailLayoutProps extends React_2.HTMLAttributes<HTMLDivElement> {
    /** 是否在右侧挤出详情容器；关闭时左侧主区域占满 100% 宽度 */
    open: boolean;
    /** 沉浸全宽模式：开启且 open=true 时隐藏左侧主内容，详情面板占满 100% 宽度 */
    expanded?: boolean;
    /** 右侧挤出的详情容器节点 */
    panel?: React_2.ReactNode;
    /** 桌面端右侧详情容器初始宽度（数字按 px 处理，默认 480） */
    panelWidth?: number | string;
    /** 拖拽调节的最小宽度（px，默认 360） */
    minPanelWidth?: number;
    /** 拖拽调节的最大宽度（px，默认 760） */
    maxPanelWidth?: number;
    /** 是否允许通过左边缘拖拽及键盘方向键调整详情宽度（默认 true） */
    resizable?: boolean;
    /** 本地持久化记忆调节宽度的存储键 */
    storageKey?: string;
    /** 桌面端右侧详情面板是否粘性随滚（默认 true） */
    stickyPanel?: boolean;
    /** 左右分栏间距（默认 'md'） */
    gap?: 'sm' | 'md' | 'lg';
    /** 左侧主容器附加类名 */
    masterClassName?: string;
    /** 右侧详情容器外层包装附加类名 */
    asideClassName?: string;
}

export declare interface SplitDetailNavigation {
    /** 当前条目位置（1-based，若无匹配则 <= 0） */
    current: number;
    /** 总条目数 */
    total: number;
    onPrev: () => void;
    onNext: () => void;
    prevLabel?: string;
    nextLabel?: string;
}

/**
 * 右侧内联挤压详情容器 (SplitDetailPanel)
 *
 * 采用单层紧凑顶栏与独立滚动正文设计，内置上下条目切换、沉浸全宽切换与一键关闭收起。
 */
export declare const SplitDetailPanel: React_2.ForwardRefExoticComponent<SplitDetailPanelProps & React_2.RefAttributes<HTMLElement>>;

export declare interface SplitDetailPanelProps extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title'> {
    'aria-label'?: string;
    /** 面板标题 */
    title?: React_2.ReactNode;
    /** 标题下方副标题 */
    subtitle?: React_2.ReactNode;
    /** 标题右侧状态徽标 */
    badge?: React_2.ReactNode;
    /** 可选行上下切换器（上一条 / 下一条 与位置指示） */
    navigation?: SplitDetailNavigation;
    /** 是否支持沉浸展开切换（与 SplitDetailLayout expanded 状态配合） */
    expandable?: boolean;
    expanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    expandLabel?: string;
    restoreLabel?: string;
    /** 顶部扩展操作区（如“清除选择”或快捷操作） */
    headerActions?: React_2.ReactNode;
    /** 是否渲染右上角关闭按钮（默认 true） */
    closable?: boolean;
    /** 关闭回调 */
    onClose?: () => void;
    closeLabel?: string;
    /** 加载中状态 */
    loading?: boolean;
    loadingText?: React_2.ReactNode;
    /** 底部吸底操作栏 */
    footer?: React_2.ReactNode;
    bodyClassName?: string;
    headerClassName?: string;
}

export declare function SplitDetailTitle({ className, ...props }: React_2.HTMLAttributes<HTMLHeadingElement>): React_2.JSX.Element;

/**
 * 主从分栏布局 (SplitInspectorLayout)
 * 广泛用于主表/右侧实时详情检视的工作台模式，默认常驻展示分隔线与拖拽胶囊手柄，支持自由拖拽宽度占比与双击复位
 */
export declare function SplitInspectorLayout({ children, inspector, ratio, stickyInspector, resizable, minInspectorWidth, maxInspectorWidth, storageKey, className, ...props }: SplitInspectorLayoutProps): React_2.JSX.Element;

export declare interface SplitInspectorLayoutProps extends React_2.HTMLAttributes<HTMLDivElement> {
    children: React_2.ReactNode;
    inspector?: React_2.ReactNode;
    ratio?: 'default' | 'balanced' | 'wide-master';
    stickyInspector?: boolean;
    /** 是否在主从面板中间展示常驻分隔线与胶囊拖拽手柄（默认 true） */
    resizable?: boolean;
    /** 右侧检视面板最小像素宽度（默认 320） */
    minInspectorWidth?: number;
    /** 右侧检视面板最大像素宽度（默认 720） */
    maxInspectorWidth?: number;
    /** 本地持久化记忆调节宽度的存储键 */
    storageKey?: string;
}

/** 聚光灯跟随交互卡片（常用于登录页、仪表盘核心指标卡与亮眼特性展示） */
export declare const SpotlightCard: default_2.FC<SpotlightCardProps>;

export declare interface SpotlightCardProps extends default_2.HTMLAttributes<HTMLDivElement> {
    spotlightColor?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    hoverable?: boolean;
}

/**
 * 统一指标与键值摘要卡片组件 (StatCard)
 * 零三方图表依赖，兼容嵌套在 <dl> 描述列表与网格布局中
 */
export declare const StatCard: React_2.FC<StatCardProps>;

export declare interface StatCardProps extends Omit<React_2.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** 指标或属性名称（渲染为语义化的 dt 标签，兼容嵌入 dl 描述列表） */
    label: React_2.ReactNode;
    /** 指标主数值或内容（渲染为 dd 标签） */
    value: React_2.ReactNode;
    /** 左侧装饰图标 */
    icon?: React_2.ReactNode;
    /** 底部辅助说明或次要提示 */
    hint?: React_2.ReactNode;
    /** 右上角徽标或附加标签 */
    badge?: React_2.ReactNode;
    /** 数值右侧趋势或对比说明 */
    trend?: React_2.ReactNode;
    /** 数值是否使用等宽字体（默认开启以保证 tabular-nums 垂直对齐） */
    mono?: boolean;
    /** 卡片语义色调 */
    tone?: StatCardTone;
    /** 尺寸规格 */
    size?: StatCardSize;
    /** 数值容器附加类名 */
    valueClassName?: string;
    /** 卡片底部扩展插槽（如进度条或补充指标） */
    children?: React_2.ReactNode;
}

export declare type StatCardSize = 'sm' | 'default' | 'lg';

export declare type StatCardTone = 'default' | 'surface' | 'primary' | 'success' | 'warning' | 'danger';

export declare const STATUS_VARIANTS: Record<string, StatusBadgeVariant>;

/**
 * 统一语义状态徽章组件 (StatusBadge)
 */
export declare function StatusBadge({ status, label, variant, dot, pulse, humanize, className, ...props }: StatusBadgeProps): React_2.JSX.Element;

export declare interface StatusBadgeProps extends Omit<React_2.HTMLAttributes<HTMLSpanElement>, 'children'> {
    status: string;
    label?: React_2.ReactNode;
    variant?: StatusBadgeVariant;
    dot?: boolean;
    pulse?: boolean;
    humanize?: boolean;
}

export declare type StatusBadgeVariant = NonNullable<BadgeProps['variant']>;

/** 语义化状态标签（兼容 tone / status / color 与 text / label / children） */
export declare const StatusTag: default_2.FC<StatusTagProps>;

export declare interface StatusTagProps extends default_2.HTMLAttributes<HTMLSpanElement> {
    tone?: StatusTone;
    /** tone 语义别名（如 'success' | 'warning' | 'error' | 'default' | 'info'） */
    status?: string;
    /** 自定义色板别名（如 'purple' | 'cyan' | 'orange' | 'teal' | 'pink'） */
    color?: string;
    /** 快捷文案属性（未传 children 时生效） */
    text?: default_2.ReactNode;
    /** text 别名 */
    label?: default_2.ReactNode;
    /** 是否显示前置圆点指示器 */
    dot?: boolean;
    /** 圆点是否带呼吸脉冲（适合运行中/处理中） */
    pulse?: boolean;
    size?: AbcSize;
    motion?: AbcMotionPreset;
}

export declare type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cyan' | 'orange' | 'teal' | 'pink';

export declare interface StepItem {
    key?: string;
    title: default_2.ReactNode;
    description?: default_2.ReactNode;
    icon?: default_2.ReactNode;
    status?: StepStatus;
    disabled?: boolean;
}

/**
 * 企业级分步引导条 (Steps)
 * 支持水平/垂直双向排布、错误中断态与可点击跳步
 */
export declare const Steps: default_2.FC<StepsProps>;

export declare interface StepsProps {
    items: StepItem[];
    /** 当前激活步骤索引（从 0 开始） */
    current?: number;
    /** 当前步骤整体状态 */
    status?: StepStatus;
    direction?: 'horizontal' | 'vertical';
    size?: AbcSize;
    motion?: AbcMotionPreset;
    onChange?: (nextStepIndex: number) => void;
    className?: string;
}

export declare type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export declare function stripLeadingEmoji(text: string): string;

/** 拨动开关组件（支持四档尺寸规格、动效规格、异步 loading 防重入态、无障碍标签描述与旧尺寸别名兼容） */
export declare const Switch: default_2.FC<SwitchProps>;

export declare interface SwitchProps {
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    loading?: boolean;
    size?: AbcSize | 'small' | 'default';
    motion?: AbcMotionPreset;
    label?: default_2.ReactNode;
    description?: default_2.ReactNode;
    checkedLabel?: default_2.ReactNode;
    uncheckedLabel?: default_2.ReactNode;
    checkedChildren?: default_2.ReactNode;
    unCheckedChildren?: default_2.ReactNode;
    ariaLabel?: string;
    'aria-label'?: string;
    className?: string;
}

/**
 * 单页签异常隔离边界 (TabErrorBoundary)
 * 将渲染期运行时错误封闭在故障页签内，避免穿透击毁整个应用壳层或丢失其他页签状态。
 */
export declare class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
    state: TabErrorBoundaryState;
    static getDerivedStateFromError(error: Error): Partial<TabErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    componentDidUpdate(prevProps: TabErrorBoundaryProps): void;
    reset: () => void;
    render(): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | JSX.Element | null | undefined;
}

export declare interface TabErrorBoundaryProps {
    /** 当前页签对应的路由路径标识 */
    path?: string;
    /** 路由或状态变更时自动复位异常边界的重置键 */
    resetKey?: string | number;
    /** 子视图组件 */
    children: ReactNode;
    /** 触发重新加载当前页签的回调 */
    onReload?: () => void;
    /** 兼容 onReset 回调命名 */
    onReset?: () => void;
    /** 关闭当前页签的回调 */
    onClose?: () => void;
    /** 返回首页/大盘的回调 */
    onNavigateHome?: () => void;
    /** 捕获到异常时的上报钩子 */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** 自定义标题文案 */
    title?: string;
    /** 自定义描述文案 */
    description?: string;
    /** 重载按钮文案 */
    reloadText?: string;
    /** 关闭页签按钮文案 */
    closeText?: string;
    /** 返回首页按钮文案 */
    homeText?: string;
    className?: string;
}

declare interface TabErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

export declare interface TabItem<K extends string = string> {
    key: K;
    label: default_2.ReactNode;
    icon?: default_2.ReactNode;
    badge?: default_2.ReactNode;
    disabled?: boolean;
    children?: default_2.ReactNode;
}

export declare const Table: React_2.ForwardRefExoticComponent<TableProps & React_2.RefAttributes<HTMLTableElement>>;

export declare type TableApiInput<T = any> = ProTableApiInput<T>;

export declare type TableApiOptions<T = any> = ProTableApiOptions<T>;

export declare const TableBody: React_2.ForwardRefExoticComponent<React_2.HTMLAttributes<HTMLTableSectionElement> & React_2.RefAttributes<HTMLTableSectionElement>>;

export declare const TableCaption: React_2.ForwardRefExoticComponent<React_2.HTMLAttributes<HTMLTableCaptionElement> & React_2.RefAttributes<HTMLTableCaptionElement>>;

/** 数据表格外层卡片样式 */
export declare const tableCardClass = "rounded-[var(--abc-radius-lg,0.75rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] shadow-[var(--abc-shadow-card)] overflow-hidden";

export declare const TableCell: React_2.ForwardRefExoticComponent<React_2.TdHTMLAttributes<HTMLTableCellElement> & React_2.RefAttributes<HTMLTableCellElement>>;

/** 数据表体单元格样式 */
export declare const tableCellClass = "px-4 py-3 text-xs text-[var(--abc-fg-secondary)]";

export declare function TableCore<T extends Record<string, any> = Record<string, any>>(props: TableCoreProps<T>): JSX.Element;

export declare interface TableCoreProps<T = Record<string, any>> {
    columns: AbcColumn<T>[];
    data?: T[];
    /** 兼容 dataSource 属性名 */
    dataSource?: T[];
    rowKey?: keyof T | ((record: T) => string | number);
    loading?: boolean;
    density?: AbcTableDensity;
    /** 选中行主键数组 */
    selectedKeys?: Array<string | number>;
    onSelectionChange?: (keys: Array<string | number>, rows: T[]) => void;
    /** 兼容对象式多选配置 */
    rowSelection?: AbcRowSelectionConfig<T>;
    /** 排序状态与回调 */
    sortState?: {
        key: string;
        direction: SortDirection;
    };
    onSortChange?: (key: string, direction: SortDirection) => void;
    /** 是否开启表头内联筛选行 */
    headerFilterMode?: boolean;
    headerFilters?: Record<string, any>;
    onHeaderFilterChange?: (key: string, value: any) => void;
    /** 表头单列气泡筛选器插槽 */
    headerFilterRender?: (col: AbcColumn<T>) => default_2.ReactNode;
    /** 当前处于激活筛选状态的列键列表（用于表头底色高亮提示） */
    activeFilterKeys?: string[];
    /** 当前处于激活筛选状态的列摘要标签映射 */
    activeFilterLabels?: Record<string, string>;
    /** 表头筛选激活态高亮色 */
    filterHighlightColor?: string;
    /** 右键菜单切换筛选高亮色回调 */
    onFilterHighlightColorChange?: (color: string) => void;
    /** 全量可配置列定义（用于右键菜单级联勾选显示/隐藏列） */
    allColumns?: AbcColumn<T>[];
    /** 当前已隐藏的列 key 集合 */
    hiddenColumnKeys?: string[];
    /** 右键级联子菜单切换任意列显隐回调 */
    onToggleColumnVisible?: (key: string) => void;
    /** 个性化列宽覆盖 */
    columnWidths?: Record<string, number>;
    onColumnResize?: (key: string, width: number) => void;
    /** 是否允许表头边缘拖拽调节列宽（默认传入 onColumnResize 时开启，也可显式 true 启用内部自适应列宽） */
    resizable?: boolean;
    /** 交互动效规格 */
    motion?: AbcMotionPreset;
    /** 个性化列左右固定覆盖（null 表示显式取消固定） */
    columnFixed?: Record<string, 'left' | 'right' | null>;
    onColumnPin?: (key: string, fixed: 'left' | 'right' | null) => void;
    /** 右键隐藏单列回调 */
    onColumnHide?: (key: string) => void;
    /** 右键重置列配置回调 */
    onResetColumns?: () => void;
    /** 拖拽调整列顺序回调 */
    onColumnReorder?: (nextOrder: string[]) => void;
    /** 行展开与树形 children 子行配置 */
    expandable?: AbcTableExpandableConfig<T>;
    /** 是否以树形层级模式渲染（开启后向 col.render 第三参数透传层级深度 depth，并支持异步懒加载子行展开） */
    treeData?: boolean;
    /** 是否开启行拖拽重排 */
    rowDraggable?: boolean;
    /** 兼容 draggable 属性名 */
    draggable?: boolean;
    /** 行拖拽放置排序完成回调 */
    onRowDragEnd?: (activeKey: string | number, overKey: string | number) => void;
    /** 兼容 onDragEnd 属性名 */
    onDragEnd?: (activeId: string, overId: string) => void;
    /** linkToView 列点击触发查看详情回调 */
    onRowView?: (record: T, linkTarget?: string) => void;
    /** 受控单行高亮键值（如与抽屉详情联动） */
    activeRowKey?: string | number | null;
    /** 行点击回调（单行点击唤起 Drawer 或选中） */
    onRowClick?: (record: T, event: default_2.MouseEvent<HTMLTableRowElement>) => void;
    /** 自定义行原生属性注入 */
    onRow?: (record: T, index: number) => default_2.HTMLAttributes<HTMLTableRowElement>;
    /** 空状态下一键清空筛选条件回调 */
    onEmptyReset?: () => void;
    /** 表格滚动区域最大高度（开启后表头纵向吸顶） */
    maxHeight?: number | string;
    ariaLabel?: string;
    /** 空状态主标题 */
    emptyText?: default_2.ReactNode;
    /** 空状态副标题描述 */
    emptyDescription?: default_2.ReactNode;
    /** 空状态底部操作区 */
    emptyAction?: default_2.ReactNode;
    /** 自定义空状态完整节点（传入后覆盖内置 EmptyState） */
    emptyNode?: default_2.ReactNode;
    className?: string;
}

export declare const TableFooter: React_2.ForwardRefExoticComponent<React_2.HTMLAttributes<HTMLTableSectionElement> & React_2.RefAttributes<HTMLTableSectionElement>>;

export declare const TableHead: React_2.ForwardRefExoticComponent<React_2.ThHTMLAttributes<HTMLTableCellElement> & React_2.RefAttributes<HTMLTableCellElement>>;

/** 数据表头行样式 */
export declare const tableHeadClass = "bg-[var(--abc-bg-muted)] border-b border-[var(--abc-border)] text-xs font-semibold text-[var(--abc-fg-secondary)]";

export declare const TableHeader: React_2.ForwardRefExoticComponent<TableHeaderProps & React_2.RefAttributes<HTMLTableSectionElement>>;

/** 数据表头单元格样式 */
export declare const tableHeaderCellClass = "px-4 py-3 text-xs font-semibold text-[var(--abc-fg-secondary)] whitespace-nowrap";

export declare interface TableHeaderProps extends React_2.HTMLAttributes<HTMLTableSectionElement> {
    sticky?: boolean;
}

export declare interface TableProps extends React_2.HTMLAttributes<HTMLTableElement> {
    scrollLabel?: string;
    wrapperClassName?: string;
}

export declare const TableRow: React_2.ForwardRefExoticComponent<React_2.HTMLAttributes<HTMLTableRowElement> & React_2.RefAttributes<HTMLTableRowElement>>;

/**
 * 响应式无障碍标签页组件
 * 同时支持声明式 items 模式与复合子组件 (TabsList / TabsTrigger / TabsContent) 模式
 */
export declare function Tabs<K extends string = string>({ items, activeKey, value, defaultActiveKey, defaultValue, onChange, onValueChange, variant, size, motion, ariaLabel, extra, className, panelClassName, children, }: TabsProps<K>): default_2.JSX.Element;

export declare const TabsContent: default_2.ForwardRefExoticComponent<TabsContentProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface TabsContentProps extends default_2.HTMLAttributes<HTMLDivElement> {
    value: string;
}

export declare const TabsList: default_2.ForwardRefExoticComponent<TabsListProps & default_2.RefAttributes<HTMLDivElement>>;

export declare interface TabsListProps extends default_2.HTMLAttributes<HTMLDivElement> {
}

export declare interface TabsProps<K extends string = string> {
    items?: TabItem<K>[];
    activeKey?: K;
    /** activeKey 受控别名 */
    value?: K;
    defaultActiveKey?: K;
    defaultValue?: K;
    onChange?: (key: K) => void;
    onValueChange?: (key: K) => void;
    variant?: 'line' | 'pills' | 'segmented';
    size?: AbcSize;
    motion?: AbcMotionPreset;
    ariaLabel?: string;
    extra?: default_2.ReactNode;
    className?: string;
    panelClassName?: string;
    children?: default_2.ReactNode;
}

export declare const TabsTrigger: default_2.ForwardRefExoticComponent<TabsTriggerProps & default_2.RefAttributes<HTMLButtonElement>>;

export declare interface TabsTriggerProps extends default_2.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

/**
 * 语义化标签组件 (Tag)
 * 完全集成自 ABC Design 的 StatusTag 规范体系
 */
export declare const Tag: default_2.FC<TagProps>;

/**
 * 企业级多标签胶囊输入框 (TagInput)
 * 支持四档规格、动效预设、多分隔符与粘贴批量导入、IME 组合防误触、去重/归一化/校验、只读与一键清空
 */
export declare const TagInput: default_2.ForwardRefExoticComponent<TagInputProps & default_2.RefAttributes<HTMLInputElement>>;

export declare interface TagInputProps {
    /** 受控标签列表 */
    value?: string[];
    /** 非受控初始标签列表（默认 []） */
    defaultValue?: string[];
    /** 标签列表变更回调 */
    onChange?: (tags: string[]) => void;
    /** onChange 语义别名 */
    onValueChange?: (tags: string[]) => void;
    /** 字段标识与无障碍关联 */
    id?: string;
    name?: string;
    label?: default_2.ReactNode;
    error?: default_2.ReactNode;
    helperText?: default_2.ReactNode;
    invalid?: boolean;
    required?: boolean;
    /** 占位提示文案 */
    placeholder?: string;
    /** 是否使用等宽字体展示芯片与输入文本 */
    mono?: boolean;
    /** 控件尺寸（兼容 ControlSize，默认继承上下文或 'sm'） */
    size?: ControlSize;
    /** 微交互动效规格 */
    motion?: AbcMotionPreset;
    /** 禁用与只读状态 */
    disabled?: boolean;
    readOnly?: boolean;
    /** 触发分词的分隔符（默认支持逗号、中文逗号、分号、换行、回车、Tab） */
    separators?: ReadonlyArray<string> | RegExp;
    /** 失焦时是否自动提交当前输入草稿（默认 true） */
    addOnBlur?: boolean;
    /** 粘贴含分隔符文本时是否自动批量拆解为多个标签（默认 true） */
    splitOnPaste?: boolean;
    /** 是否允许重复标签（默认 false） */
    allowDuplicates?: boolean;
    /** 最大标签数量限制（默认不设硬上限） */
    maxTags?: number;
    /** 单个标签最大字符长度限制 */
    maxTagLength?: number;
    /** 是否显示底部已选计数（配合 maxTags 显示 `N/M`） */
    showCount?: boolean;
    /** 归一化转换函数（在去重与校验之前执行） */
    transformTag?: (raw: string) => string;
    /** 自定义校验函数：返回 true / undefined / null 表示通过，返回 false 或错误文案表示拒绝 */
    validateTag?: (tag: string, currentTags: ReadonlyArray<string>) => boolean | string | null | undefined;
    /** 标签被拒绝时的回调 */
    onReject?: (rejected: RejectedTagItem[]) => void;
    /** 清空控制 */
    allowClear?: boolean;
    clearable?: boolean;
    onClear?: () => void;
    removeTagLabel?: (tag: string) => string;
    clearLabel?: string;
    /** 焦点与 ARIA 属性 */
    onFocus?: default_2.FocusEventHandler<HTMLInputElement>;
    onBlur?: default_2.FocusEventHandler<HTMLInputElement>;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
    className?: string;
    wrapperClassName?: string;
    chipClassName?: string;
    inputClassName?: string;
}

export declare interface TagProps extends default_2.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | string;
    dot?: boolean;
}

export { TagRejectReason }

export declare function tagVariants(_opts?: {
    variant?: string;
}): string;

export declare const TenantIcon: default_2.FC<BrandIconProps>;

export declare type TenantIconProps = BrandIconProps;

/** 多行文本域组件（支持四档尺寸、动效规格、内联标签、错误文案与实时字数统计） */
export declare const Textarea: default_2.ForwardRefExoticComponent<TextareaProps & default_2.RefAttributes<HTMLTextAreaElement>>;

/** 多行文本域统一样式 */
export declare const textareaClass = "w-full rounded-[var(--abc-radius-md,0.5rem)] border border-[var(--abc-border)] bg-[var(--abc-bg-surface)] p-3 text-xs text-[var(--abc-fg)] placeholder:text-[var(--abc-fg-placeholder)] hover:border-[var(--abc-border-strong)] focus:border-[var(--abc-primary)] focus:ring-2 focus:ring-[var(--abc-ring)] focus:outline-none transition-all disabled:bg-[var(--abc-bg-muted)] disabled:text-[var(--abc-fg-muted)] disabled:cursor-not-allowed";

export declare interface TextareaProps extends default_2.TextareaHTMLAttributes<HTMLTextAreaElement> {
    size?: ControlSize;
    motion?: AbcMotionPreset;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: default_2.ReactNode;
    showCount?: boolean;
    invalid?: boolean;
    mono?: boolean;
}

/** 文本轻量按钮样式 */
export declare const textButtonClass = "inline-flex items-center justify-center gap-1.5 rounded-[var(--abc-radius-sm,0.375rem)] bg-transparent text-[var(--abc-fg-secondary)] hover:bg-[var(--abc-bg-subtle)] hover:text-[var(--abc-primary)] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer select-none";

/**
 * 实时主题、微交互沙盒与多布局可视化定制中心 (ThemeCustomizer)
 * 支持一键场景预设、实时控件交互沙盒、自定义 HEX 品牌色阶合成、无级几何滑块、无障碍视觉滤镜及 JSON/JSX 双向流转
 */
export declare const ThemeCustomizer: default_2.FC<ThemeCustomizerProps>;

export declare interface ThemeCustomizerProps {
    open: boolean;
    onClose: () => void;
    layoutSettings: AbcLayoutSettings;
    onLayoutChange: (patch: Partial<AbcLayoutSettings>) => void;
    onResetAll?: () => void;
}

export declare const ThemeSwitcher: React_2.ForwardRefExoticComponent<ThemeSwitcherProps & React_2.RefAttributes<HTMLButtonElement>>;

export declare interface ThemeSwitcherProps extends Omit<React_2.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    locale?: string;
    mode?: 'toggle' | 'segmented';
    dark?: boolean;
    label?: string;
}

/**
 * 操作审计与工单流转垂直时间轴 (Timeline)
 */
export declare const Timeline: default_2.FC<TimelineProps>;

export declare interface TimelineItem {
    key?: string;
    title: default_2.ReactNode;
    time?: default_2.ReactNode;
    description?: default_2.ReactNode;
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    icon?: default_2.ReactNode;
}

export declare interface TimelineProps {
    items: TimelineItem[];
    size?: AbcSize;
    motion?: AbcMotionPreset;
    className?: string;
}

/** 兼容简短别名 */
export declare const toast: AbcToastMethods;

/**
 * 结构化诊断通知卡片 (ToastCard)
 */
export declare function ToastCard({ id, variant, title, message, code, status, requestId, actionHint, durationMs, paused, requestIdLabel, copyIdLabel, copiedIdLabel, dismissLabel, onDismiss, }: ToastCardProps): React_2.JSX.Element;

export declare interface ToastCardProps {
    id: string;
    variant: NotificationVariant;
    title: string;
    message: string;
    code?: string;
    status?: number;
    requestId?: string;
    actionHint?: string;
    durationMs: number | null;
    paused?: boolean;
    requestIdLabel?: string;
    copyIdLabel?: string;
    copiedIdLabel?: string;
    dismissLabel?: string;
    onDismiss: (id: string) => void;
}

/**
 * ToastContainer — 企业级轻量通知挂载容器
 * 支持 6 种视口定位、悬停倒计时暂停、图文/操作卡片排版、Portal 目标自定义与多容器隔离
 */
export declare const ToastContainer: default_2.FC<ToastContainerProps>;

export declare interface ToastContainerProps {
    /**
     * 挂载屏幕位置
     * @default 'top-right'
     */
    position?: ToastPosition;
    /**
     * 尺寸规格（xs | sm | md | lg），默认继承全局配置或 'sm'
     */
    size?: AbcSize;
    /**
     * 动效预设（none | subtle | smooth | spring），默认继承全局 motion
     */
    motion?: AbcMotionPreset;
    /**
     * 屏幕同屏最大展示数量
     * @default 5
     */
    maxCount?: number;
    /**
     * 鼠标悬停时是否暂停自动关闭计时
     * @default true
     */
    pauseOnHover?: boolean;
    /**
     * 是否新通知展示在最上方
     * @default false
     */
    newestOnTop?: boolean;
    /**
     * 是否默认显示关闭图标
     * @default true
     */
    closable?: boolean;
    /**
     * 外层悬浮定位容器类名
     */
    className?: string;
    /**
     * 外层悬浮定位容器样式
     */
    style?: default_2.CSSProperties;
    /**
     * 单条 Toast 附加类名
     */
    toastClassName?: string;
    /**
     * 单条 Toast 附加样式
     */
    toastStyle?: default_2.CSSProperties;
    /**
     * Portal 挂载目标 DOM 节点，默认 document.body
     */
    container?: HTMLElement | (() => HTMLElement | null) | null;
    /**
     * 容器隔离标识 ID（配合 ToastOptions.containerId 使用）
     */
    containerId?: string;
    /**
     * 自定义单项渲染器
     */
    renderItem?: (item: ToastItem, dismiss: (id: string) => void) => default_2.ReactNode;
    /**
     * 独立受控数据源（提供时脱离内置全局队列）
     */
    items?: ToastItem[];
    /**
     * 配合受控 items 时的关闭回调
     */
    onDismiss?: (id: string) => void;
}

/**
 * 零外部依赖的 Toaster 视口组件
 * 支持多通知叠放顶栏一键全部清除与 custom ToastCard 渲染
 */
export declare function Toaster({ position, visibleToasts, activeCount, onClearAll, clearAllLabel, clearAllThreshold, className, }: ToasterProps): React_2.ReactPortal | null;

export declare interface ToasterProps {
    position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
    visibleToasts?: number;
    gap?: number;
    expand?: boolean;
    richColors?: boolean;
    theme?: 'light' | 'dark' | 'system';
    offset?: number | string | {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    toastOptions?: {
        unstyled?: boolean;
        classNames?: Record<string, string>;
    };
    activeCount?: number;
    onClearAll?: () => void;
    clearAllLabel?: string;
    stackCountLabel?: (count: number) => string;
    clearAllThreshold?: number;
    className?: string;
}

export declare interface ToastItem extends ToastOptions {
    id: string;
    tone: ToastTone;
    message: default_2.ReactNode;
    duration: number;
    createdAt: number;
}

/** 单条 Toast 视图呈现组件 */
export declare const ToastItemView: default_2.FC<ToastItemViewProps>;

export declare interface ToastItemViewProps {
    item: ToastItem;
    resolvedSize: AbcSize;
    resolvedMotion: AbcMotionPreset;
    closable: boolean;
    pauseOnHover: boolean;
    toastClassName?: string;
    toastStyle?: default_2.CSSProperties;
    onDismiss: (id: string) => void;
}

export declare interface ToastOptions {
    /** 提示类型（success | error | warning | info | loading | danger） */
    tone?: ToastTone;
    /** 标题文本或自定义节点 */
    title?: default_2.ReactNode;
    /** 正文内容 */
    message?: default_2.ReactNode;
    /** message 语义别名 */
    content?: default_2.ReactNode;
    /** 辅助描述信息 */
    description?: default_2.ReactNode;
    /** 自定义显示时长（毫秒），0 为不自动关闭 */
    duration?: number;
    /** 是否展示关闭按钮（默认 true） */
    closable?: boolean;
    /** 自定义左侧图标（覆盖 tone 默认图标） */
    icon?: default_2.ReactNode;
    /** 操作区节点（如撤销按钮、详情链接等） */
    action?: default_2.ReactNode;
    /** 自定义指定挂载位置 */
    position?: ToastPosition;
    /** 目标容器 ID（用于多容器分流） */
    containerId?: string;
    /** 自定义类名 */
    className?: string;
    /** 自定义行内样式 */
    style?: default_2.CSSProperties;
    /** 关闭时触发的回调 */
    onClose?: () => void;
}

export declare type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export declare type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'danger';

export declare function tokenizeEmojiSegments(input: string, preserveSrToken?: boolean): EmojiTextSegment[];

export declare const TONE_ICONS: Record<string, default_2.ReactNode>;

export declare type ToolbarButtonConfig = ProToolbarButtonConfig;

/**
 * 视口感知顶层悬浮文字提示 (Tooltip)
 * 通过 Portal 逃逸任意 overflow:hidden 卡片或滚动容器裁剪，支持视口边缘自动翻转与动态箭头对齐
 */
export declare const Tooltip: default_2.FC<TooltipProps>;

export declare interface TooltipProps {
    content?: default_2.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    disabled?: boolean;
    /** 悬停延迟毫秒数（默认 80ms，避免光标快速划过密集工具栏时频繁闪烁） */
    delay?: number;
    motion?: AbcMotionPreset;
    children: default_2.ReactNode;
    className?: string;
}

/** 顶部水平菜单导航条（用于 top 与 mix 布局模式，同步响应四档尺寸与动效规格） */
export declare const TopHorizontalNav: default_2.FC<{
    items: AbcMenuItem[];
    pathname: string;
    /** mix 模式下仅切换一级大类，不直接展开下拉浮层 */
    topLevelOnly?: boolean;
    activeRootKey?: string;
    size?: AbcSize;
    motion?: AbcMotionPreset;
    onSelectRoot?: (item: AbcMenuItem) => void;
    onNavigate: (path: string, item: AbcMenuItem) => void;
}>;

/**
 * 顶部轻量加载与路由切换进度条 (TopProgressBar)
 * 同时支持监听 activeKey 自动过渡、受控 loading 以及 abcProgress.start()/done() 命令式调用。
 */
export declare const TopProgressBar: default_2.FC<TopProgressBarProps>;

export declare interface TopProgressBarProps {
    /** 路由路径或视图激活键；变化时自动触发顶部过渡进度条 */
    activeKey?: string;
    /** 受控加载状态 */
    loading?: boolean;
    /** 首次挂载时是否跳过触发（默认 true，避免首屏重复闪烁） */
    skipInitial?: boolean;
    /** 进度条高度（px，默认 2） */
    height?: number;
    /** 自定义颜色（默认读取 --abc-primary） */
    color?: string;
    /** 层级 z-index（默认 9999） */
    zIndex?: number;
    className?: string;
}

/**
 * 企业级双栏穿梭框 (Transfer)
 * 支持拼音首字母检索、40+ 条目自动虚拟滚动、反选、禁用项跳过与单向模式。
 */
export declare const Transfer: default_2.FC<TransferProps>;

export declare interface TransferItem {
    key: string;
    title: string;
    description?: string;
    disabled?: boolean;
}

export declare interface TransferProps {
    dataSource: TransferItem[];
    targetKeys?: string[];
    defaultTargetKeys?: string[];
    onChange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
    selectedKeys?: string[];
    onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
    titles?: [default_2.ReactNode, default_2.ReactNode];
    searchable?: boolean;
    searchPlaceholder?: string;
    showSelectAll?: boolean;
    /** 当单项列表超过 40 条时自动启用轻量虚拟滚动窗口 */
    virtual?: boolean;
    listHeight?: number;
    itemHeight?: number;
    disabled?: boolean;
    /** 单向穿梭模式（右侧列表仅保留快捷移除） */
    oneWay?: boolean;
    emptyText?: default_2.ReactNode;
    label?: default_2.ReactNode;
    error?: string;
    helperText?: default_2.ReactNode;
    required?: boolean;
    id?: string;
    className?: string;
}

/**
 * 企业级层级树形控件 (Tree)
 * 内置 @abc-design/core 父子级联全选/半选计算引擎、拼音首字母搜索自动展开与全部展开/折叠工具条
 */
export declare const Tree: default_2.FC<TreeProps>;

export declare interface TreeProps {
    treeData: AbcTreeNode[];
    /** 是否显示节点复选框（如角色菜单权限分配） */
    checkable?: boolean;
    /** 父子节点勾选状态是否完全独立不级联（默认 false，即默认开启父子级联） */
    checkStrictly?: boolean;
    /** 受控选中节点 key 集合 */
    checkedKeys?: Array<string | number>;
    /** 非受控初始选中节点 key 集合 */
    defaultCheckedKeys?: Array<string | number>;
    /** 勾选状态变更回调（第二个参数附带半选祖先节点集合 halfCheckedKeys，方便后端权限保存） */
    onCheck?: (checkedKeys: Array<string | number>, info: {
        halfCheckedKeys: Array<string | number>;
        node: AbcTreeNode;
        checked: boolean;
    }) => void;
    /** 受控点击高亮节点 */
    selectedKeys?: Array<string | number>;
    onSelect?: (selectedKeys: Array<string | number>, node: AbcTreeNode) => void;
    /** 默认是否全部展开（默认 true） */
    defaultExpandAll?: boolean;
    /** 是否内置顶部搜索框（支持中文与拼音首字母过滤） */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** 是否显示展开全部/收起全部快捷栏 */
    showToolbar?: boolean;
    /** 节点行尺寸规格 */
    size?: AbcSize;
    /** 组件交互动效规格 */
    motion?: AbcMotionPreset;
    /** 自定义节点右侧扩展渲染区 */
    renderExtra?: (node: AbcTreeNode) => default_2.ReactNode;
    className?: string;
}

/** 挂载策略静态常量，方便业务按 TreeSelect.SHOW_PARENT 等标准枚举调用 */
export declare const TreeSelect: default_2.ForwardRefExoticComponent<TreeSelectProps & default_2.RefAttributes<HTMLDivElement>> & {
    SHOW_ALL: "SHOW_ALL";
    SHOW_PARENT: "SHOW_PARENT";
    SHOW_CHILD: "SHOW_CHILD";
};

export declare interface TreeSelectChangeExtra {
    triggerNode?: AbcTreeSelectNode;
    checked?: boolean;
    halfCheckedKeys?: Array<string | number>;
}

/**
 * 声明式快捷表单字段封装 (TreeSelectField)
 * 对齐 SelectField 参数风格，支持触发器与弹层类名分离透传
 */
export declare function TreeSelectField({ triggerClassName, contentClassName, ...props }: TreeSelectFieldProps): JSX.Element;

export declare interface TreeSelectFieldProps extends Omit<TreeSelectProps, 'className' | 'dropdownClassName'> {
    triggerClassName?: string;
    contentClassName?: string;
}

export declare interface TreeSelectProps extends Omit<default_2.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
    /** 树形数据源（支持嵌套结构或配合 treeDataSimpleMode 使用扁平数组） */
    treeData?: ReadonlyArray<Record<string, any>>;
    /** 自定义节点字段名映射 */
    fieldNames?: AbcTreeFieldNames;
    /** 开启扁平 id/pId 自动构树模式 */
    treeDataSimpleMode?: boolean | AbcTreeSimpleModeConfig;
    /** 异步懒加载子节点回调 */
    loadData?: (node: AbcTreeSelectNode) => Promise<void>;
    /** 受控已加载节点 key（配合 loadData） */
    treeLoadedKeys?: Array<string | number>;
    /** 受控选中值：单选为标量，多选/复选为数组 */
    value?: TreeSelectValue;
    /** 非受控默认值 */
    defaultValue?: TreeSelectValue;
    /** 值变更回调 */
    onChange?: (value: any, labelList: default_2.ReactNode[], extra: TreeSelectChangeExtra) => void;
    /** 简化的值变更回调（单选返回标量，多选返回数组） */
    onValueChange?: (value: any) => void;
    /** 是否多选（无复选框时的多选模式） */
    multiple?: boolean;
    /** 是否显示节点复选框（自动开启多选） */
    treeCheckable?: boolean;
    /** 开启后父子节点勾选状态完全独立，不做级联推算 */
    treeCheckStrictly?: boolean;
    /** 复选模式下回填与展示标签的收敛策略 */
    showCheckedStrategy?: AbcCheckedStrategy;
    /** 仅允许选中末级叶子节点（点击父节点仅切换展开） */
    selectableLeafOnly?: boolean;
    /** 多选标签展示上限，超出自动折叠为 +N 胶囊 */
    maxTagCount?: number | 'responsive';
    /** 是否默认展开所有父节点 */
    treeDefaultExpandAll?: boolean;
    /** 默认展开的节点 key 列表 */
    treeDefaultExpandedKeys?: Array<string | number>;
    /** 受控展开节点 key 列表 */
    treeExpandedKeys?: Array<string | number>;
    /** 展开状态变化回调 */
    onTreeExpand?: (expandedKeys: Array<string | number>) => void;
    /** 是否在下拉头部展示展开/收起快捷栏 */
    showToolbar?: boolean;
    /** 是否开启内置搜索过滤（支持拼音首字母） */
    searchable?: boolean;
    /** searchable 语义别名 */
    showSearch?: boolean;
    /** 受控搜索关键词 */
    searchValue?: string;
    /** 搜索输入变更回调 */
    onSearch?: (keyword: string) => void;
    /** 搜索框占位文本 */
    searchPlaceholder?: string;
    /** 搜索匹配字段（标题 / 值 / 双匹配） */
    treeNodeFilterProp?: 'title' | 'value' | 'both';
    /** 是否启用大数据量固定行高虚拟滚动（可见行超过 40 行时自动生效） */
    virtual?: boolean;
    /** 下拉树滚动区域最大高度（像素，默认 280） */
    listHeight?: number;
    /** 单行节点高度（像素，虚拟滚动时用于窗口位置计算，默认 30） */
    itemHeight?: number;
    label?: default_2.ReactNode;
    error?: default_2.ReactNode;
    invalid?: boolean;
    helperText?: default_2.ReactNode;
    required?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    name?: string;
    size?: ControlSize | 'ghost';
    motion?: AbcMotionPreset;
    wrapperClassName?: string;
    dropdownClassName?: string;
    matchWidth?: boolean;
    portalContainer?: HTMLElement | null;
    container?: HTMLElement | null;
    emptyText?: string;
}

export declare type TreeSelectValue = string | number | Array<string | number> | null | undefined;

/** 读取 ABC Design 上下文（若未包裹 AbcProvider，提供安全兜底实例以保证单组件独立渲染与单测可用） */
export declare function useAbcConfig(): AbcContextValue;

/** 读取指定字典编码选项列表的 Hook（兼容同步或异步 dictAdapter） */
export declare function useAbcDict(dictCode: string): {
    options: AbcDictOption[];
    loading: boolean;
};

/**
 * 解析多级抽屉默认展现交互（'adjacent' 平级并排展开 / 'stack' 传统堆叠推挤）
 * 优先级：组件显式 cascadeMode prop > AbcProvider 全局 defaultDrawerCascadeMode > 'adjacent'
 */
export declare function useAbcDrawerCascadeMode(propMode?: 'stack' | 'adjacent'): 'stack' | 'adjacent';

/**
 * 解析组件最终生效的微交互动效规格（none | subtle | smooth | spring）
 * 优先级：组件显式 motion prop > AbcProvider 全局 motion > 'smooth'
 */
export declare function useAbcMotion(propMotion?: AbcMotionPreset): AbcMotionPreset;

/** 校验当前权限状态的通用 Hook（未配置 permissionAdapter 时默认放行以便独立开发调试） */
export declare function useAbcPermission(): {
    hasPermission: (permission: string | string[], mode?: "any" | "all") => boolean;
};

/**
 * 解析组件最终生效的尺寸规格（xs | sm | md | lg）
 * 优先级：组件显式 size prop > AbcProvider 全局 componentSize 覆盖 > 组件自身语义默认 fallback
 */
export declare function useAbcSize(propSize?: AbcSize | 'default', fallback?: AbcSize): AbcSize;

export declare function useColorScheme(): {
    preference: ColorSchemePreference;
    resolvedScheme: ResolvedColorScheme;
    systemScheme: ResolvedColorScheme;
    setPreference: (next: ColorSchemePreference, origin?: {
        clientX: number;
        clientY: number;
    }) => void;
    toggleScheme: (origin?: {
        clientX: number;
        clientY: number;
    } | React_2.SyntheticEvent) => void;
};

/** 返回命令式确认函数的 Hook */
export declare function useConfirm(): typeof abcConfirm;

/**
 * 统一处理组件受控 (value) 与非受控 (defaultValue) 双模式状态
 */
export declare function useControllableState<T>({ value, defaultValue, onChange, }: UseControllableStateParams<T>): [T, (updater: T | ((prev: T) => T)) => void];

export declare interface UseControllableStateParams<T> {
    value?: T;
    defaultValue: T;
    onChange?: (next: T) => void;
}

export declare const useCrudTable: typeof useProTable;

export declare type UseCrudTableOptions<T = any> = UseProTableOptions<T>;

/**
 * 游标分页历史栈 hook
 * 适配基于 next_cursor / has_more 的前向游标接口，零额外依赖实现“上一页 / 下一页 / 重置”。
 */
export declare function useCursorStack(initialCursor?: string | null): UseCursorStackReturn;

export declare interface UseCursorStackReturn {
    /** 当前激活的游标值（首页通常为 null） */
    currentCursor: string | null;
    /** 是否存在可回退的上一页游标 */
    hasPrev: boolean;
    /** 翻入下一页时压入新的游标 */
    pushCursor: (nextCursor: string) => void;
    /** 回退到上一页游标 */
    popCursor: () => void;
    /** 查询条件/筛选重置时清空游标历史栈回到首页 */
    resetCursor: () => void;
}

export declare function useDialog(): DialogContextValue | null;

/**
 * 表单草稿持久化存储 Hook
 * 用于新建弹窗/长表单意外关闭时保留用户输入，并在正式提交后一键清理
 */
export declare function useDraftStorage<T extends Record<string, unknown>>(storageKey?: string): {
    hasDraft: boolean;
    readDraft: () => T | null;
    saveDraft: (values: T) => void;
    clearDraft: () => void;
};

/**
 * 视口感知的浮层坐标计算与碰撞翻转引擎
 * 自动监听窗口缩放、任意嵌套滚动容器滚动及浮层自身尺寸变化，实时翻转越界方向并修正 transform-origin。
 */
export declare function useFloatingPosition({ open, triggerRef, fallbackTriggerRef, floatingRef, placement, offset, matchWidth, viewportPadding, rightAnchorOnOverflow, }: UseFloatingPositionOptions): FloatingPositionResult;

export declare interface UseFloatingPositionOptions {
    /** 浮层是否处于挂载可见周期 */
    open: boolean;
    /** 触发器元素引用 */
    triggerRef: default_2.RefObject<HTMLElement | null>;
    /** 当主 triggerRef 在 JSDOM 中未 mock 返回零矩形时回退测量的备用引用（如外层 wrapper） */
    fallbackTriggerRef?: default_2.RefObject<HTMLElement | null>;
    /** 浮层面板元素引用 */
    floatingRef: default_2.RefObject<HTMLElement | null>;
    /** 期望弹出方位 */
    placement?: FloatingPlacement;
    /** 触发器与浮层间距像素（默认 6） */
    offset?: number;
    /** 是否自动同步触发器宽度作为浮层最小宽度（用于 Select 等下拉选择器） */
    matchWidth?: boolean;
    /** 距离视口边缘的安全留白像素（默认 8） */
    viewportPadding?: number;
    /** 当触发器贴近右边缘导致左侧对齐会溢出视口时，改用 style.right 右对齐展开 */
    rightAnchorOnOverflow?: boolean;
}

/** 读取 ABC Design 上下文（若未包裹 AbcProvider，返回 null） */
export declare function useOptionalAbcConfig(): AbcContextValue | null;

/**
 * 浮层挂载与退场动画协调 Hook
 * 1. 进入打开态时同步返回 isMounted=true 与 isVisible=true，直接启用入场关键帧，避免首帧误挂退场类造成闪烁；
 * 2. open 变为 false 时保留退场 DOM 直到 durationMs 结束（durationMs <= 0 或禁用动效时同步卸载）。
 */
export declare function usePresence(open: boolean, durationMs?: number): {
    isMounted: boolean;
    isVisible: boolean;
};

/**
 * 轻量级响应式表单状态引擎：完整对齐 getValues / setValue / watch / reset / formState 交互契约
 */
export declare function useProForm<T extends Record<string, any> = Record<string, any>>({ defaultValues, schema, fields, onValuesChange, }?: UseProFormOptions<T>): ProFormInstance<T>;

/** 获取当前上下文注入的 ProFormInstance（未包裹 ProFormProvider 时返回 null） */
export declare function useProFormContext(): ProFormInstance<any> | null;

export declare interface UseProFormOptions<T extends Record<string, any> = Record<string, any>> {
    defaultValues?: Partial<T>;
    schema?: ProSchemaLike<T>;
    fields?: ProCrudFormField<T>[];
    onValuesChange?: (values: T, changedName?: string) => void;
}

/**
 * 声明式表格状态控制钩子：返回可直接透传给 ProTable / CrudTable 的 tableProps、无感刷新与多选控制句柄
 */
export declare function useProTable<T = any>(input: ProTableApiInput<T> | UseProTableOptions<T>, deps?: default_2.DependencyList): {
    tableProps: {
        api: ProCrudApiConfig<T, any, any>;
        onRefreshRef: default_2.RefObject<((resetToFirstPage?: boolean) => void) | null>;
        selectedRowKeys: (string | number)[];
        onRowSelectionChange: default_2.Dispatch<default_2.SetStateAction<(string | number)[]>>;
    };
    api: ProCrudApiConfig<T, any, any>;
    refresh: () => void;
    reload: () => void;
    refreshKey: number;
    selectedRowKeys: (string | number)[];
    setSelectedRowKeys: default_2.Dispatch<default_2.SetStateAction<(string | number)[]>>;
    clearSelection: () => void;
};

/**
 * 响应式记忆化表格 API 钩子
 */
export declare function useProTableApi<T = any>(input: ProTableApiInput<T>, deps?: default_2.DependencyList): ProCrudApiConfig<T>;

export declare interface UseProTableOptions<T = any> extends ProTableApiOptions<T> {
    /** 外部联动筛选参数（可选） */
    params?: Record<string, any>;
}

/**
 * 订阅当前活跃的自定义 Toast 队列状态
 */
export declare function useSonner(): {
    toasts: SonnerCompatToastItem[];
};

export declare const useTableApi: typeof useProTableApi;

/**
 * 数据表格个性化配置（列显隐、列宽、列序、左右固定冻结、筛选项显隐、筛选高亮色、行密度）本地持久化 Hook
 */
export declare function useTableSettings(storageKey?: string, initialDensity?: AbcTableDensity, defaultHiddenKeys?: string[]): {
    settings: AbcTablePersistedSettings;
    toggleColumnVisible: (key: string) => void;
    setAllColumnsVisible: (allColumnKeys: string[], visible: boolean) => void;
    setColumnFixed: (key: string, fixed: "left" | "right" | null | undefined) => void;
    setColumnWidth: (key: string, width: number) => void;
    setColumnOrder: (order: string[]) => void;
    setSearchFieldVisible: (key: string, visible: boolean) => void;
    setDensity: (density: AbcTableDensity) => void;
    setFilterHighlightColor: (color: string) => void;
    resetSettings: () => void;
};

export declare const VirtualLogViewer: typeof ProLogViewer;

export declare type VirtualLogViewerProps = ProLogViewerProps;

/**
 * Retina 高清 Canvas 防篡改水印容器
 * 内置 MutationObserver 守护：当水印节点在控制台被删除或 style 属性被恶意隐藏时自动重建恢复
 * 严格防自激闭环：更新前主动切断监听、仅监听直接子节点与自身属性，杜绝微任务死循环
 */
export declare const Watermark: default_2.FC<WatermarkProps>;

export declare interface WatermarkProps extends Omit<default_2.HTMLAttributes<HTMLDivElement>, 'content'> {
    /** 水印单行或多行文案 */
    content?: string | string[];
    /** 是否启用渲染 */
    enabled?: boolean;
    /** 旋转角度（度） */
    rotate?: number;
    /** 横纵向间距 */
    gap?: [number, number];
    /** 自定义水印文字不透明度（0 ~ 1），未传时按明暗主题自适应 */
    opacity?: number;
    children?: default_2.ReactNode;
    className?: string;
}

export declare interface WorkflowBannerStep {
    step: string | number;
    title: React_2.ReactNode;
    description: React_2.ReactNode;
}

export declare function WorkflowStepBanner({ badge, title, extra, steps, collapsible, defaultCollapsed, className, ...props }: WorkflowStepBannerProps): React_2.JSX.Element;

export declare interface WorkflowStepBannerProps extends Omit<React_2.HTMLAttributes<HTMLElement>, 'title'> {
    badge: React_2.ReactNode;
    title: React_2.ReactNode;
    extra?: React_2.ReactNode;
    steps: WorkflowBannerStep[];
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}


export * from "@abc-design/core";
export * from "@abc-design/tokens";

export { }
