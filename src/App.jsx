import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Compass,
  Gamepad2,
  Map,
  Radio,
  Settings,
  SlidersHorizontal,
  Trash2,
  Wifi
} from 'lucide-react';
import {
  Button,
  Card,
  DescriptionList,
  ProLayout,
  ProLogViewer,
  ResizableSplitPane,
  SegmentedControl,
  StatCard,
  StatusBadge,
  StatusTag,
  useAbcConfig
} from '@abc-design/react';
import Header from './components/Header';
import JoystickControl from './components/JoystickControl';
import CameraFeed from './components/CameraFeed';
import MapViewer from './components/MapViewer';
import MappingControl from './components/MappingControl';
import NavigationControl from './components/NavigationControl';
import LayerControl from './components/LayerControl';
import { rosService } from './services/rosService';

const DEFAULT_SETTINGS = {
  rosUrl: 'ws://192.168.2.88:9090',
  videoUrl: 'http://192.168.2.165:81'
};

const loadSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('bot-controller-settings'));
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const MENU_ITEMS = [
  {
    key: 'cockpit',
    label: '全景驾驶舱',
    path: '/cockpit',
    icon: 'LayoutDashboard',
    keywords: ['cockpit', 'slam', 'teleop', '全景', '驾驶舱', '中控']
  },
  {
    key: 'map',
    label: '地图与导航',
    path: '/map',
    icon: 'Map',
    keywords: ['map', 'slam', 'navigation', '栅格地图', '建图', '导航']
  },
  {
    key: 'teleop',
    label: '视频与遥控',
    path: '/teleop',
    icon: 'Gamepad2',
    keywords: ['camera', 'rtsp', 'joystick', '视频', '监控', '摇杆', '遥控']
  },
  {
    key: 'diagnostics',
    label: '链路与遥测',
    path: '/diagnostics',
    icon: 'Activity',
    keywords: ['ros', 'topics', 'logs', 'diagnostics', '遥测', '话题', '日志']
  }
];

export default function App() {
  const { toast } = useAbcConfig();
  const [settings, setSettings] = useState(loadSettings);
  const [pathname, setPathname] = useState('/cockpit');
  const [activeMobileTab, setActiveMobileTab] = useState('map'); // 'map' | 'joystick' | 'settings'
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rtspDrawerOpen, setRtspDrawerOpen] = useState(false);

  const [telemetry, setTelemetry] = useState({
    status: 'disconnected',
    isSimulated: false,
    linearVel: { x: 0, y: 0, z: 0 },
    angularVel: { x: 0, y: 0, z: 0 },
    robotPose: { x: 0, y: 0, theta: 0 },
    mapData: null,
    scanData: [],
    pathData: [],
    targetPose: null,
    remainingDistance: 0,
    estimatedTime: 0,
    mappingRunning: false,
    navigationRunning: true,
    selectedMap: 'test_room',
    availableMaps: ['test_room', 'factory_floor_1', 'office_space_3'],
    battery: {
      percentage: 86,
      voltage: 12.4,
      current: -1.2,
      isCharging: false,
      powerSupplyStatus: 2
    },
    logs: []
  });

  const [layers, setLayers] = useState({
    showMap: true,
    showCostmap: true,
    showScan: true,
    showRobot: true,
    showPath: true,
    showGoal: true
  });

  const [isSettingInitialPose, setIsSettingInitialPose] = useState(false);

  useEffect(() => {
    const unsubscribe = rosService.subscribe((data) => {
      setTelemetry(data);
    });

    rosService.connect(settings.rosUrl, { fallbackToSimulation: true });

    return () => {
      unsubscribe();
      rosService.disconnect();
      rosService.stopSimLoop();
    };
  }, []);

  const handleSaveSettings = (nextSettings) => {
    setSettings(nextSettings);
    try {
      localStorage.setItem('bot-controller-settings', JSON.stringify(nextSettings));
    } catch (error) {
      console.warn('Unable to persist connection settings:', error);
    }
    rosService.connect(nextSettings.rosUrl, { fallbackToSimulation: true });
  };

  const handleToggleLayer = (layerKey) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleEnableAllLayers = () => {
    setLayers({
      showMap: true,
      showCostmap: true,
      showScan: true,
      showRobot: true,
      showPath: true,
      showGoal: true
    });
  };

  const handleStartInitialPose = () => {
    setIsSettingInitialPose(true);
    setActiveMobileTab('map');
    if (pathname !== '/cockpit' && pathname !== '/map') {
      setPathname('/cockpit');
    }
    toast.info('请在 SLAM 地图上双击目标位置完成初始位姿标定');
  };

  // Spotlight ⌘K Command Palette robot actions
  const commandActions = useMemo(
    () => [
      {
        id: 'bot_estop',
        title: '紧急制动 / 急停 (Emergency Stop)',
        subtitle: '立即向 /cmd_vel 下发零速度并清除活动目标点',
        badge: 'Space',
        group: '机器人控制',
        priority: 100,
        keywords: ['stop', 'estop', '急停', '制动'],
        onTrigger: () => {
          rosService.emergencyStop();
          toast.warning('已通过全局指令触发紧急制动');
        }
      },
      {
        id: 'bot_toggle_sim',
        title: telemetry.isSimulated ? '关闭仿真并重连真机 ROS' : '切换至内置无硬件仿真模式',
        subtitle: telemetry.isSimulated ? `目标端点: ${settings.rosUrl}` : '启动 10Hz 激光与运动学仿真',
        group: '机器人控制',
        priority: 90,
        keywords: ['simulation', 'ros', '仿真', '真机'],
        onTrigger: () => {
          if (telemetry.isSimulated) {
            rosService.connect(settings.rosUrl, { fallbackToSimulation: true });
            toast.info(`正在连接真机 ${settings.rosUrl}`);
          } else {
            rosService.setSimulationMode(true);
            toast.success('已开启内置仿真模式');
          }
        }
      },
      {
        id: 'bot_initial_pose',
        title: '标定机器人初始位姿 (2D Pose Estimate)',
        subtitle: '发布 /initialpose 对齐 AMCL 粒子滤波位姿',
        group: '导航与建图',
        keywords: ['initialpose', 'amcl', '初始位置', '位姿'],
        onTrigger: handleStartInitialPose
      },
      {
        id: 'bot_toggle_mapping',
        title: telemetry.mappingRunning ? '停止 SLAM 建图' : '启动 SLAM 建图',
        group: '导航与建图',
        keywords: ['slam', 'mapping', '建图'],
        onTrigger: () => rosService.toggleMappingMode()
      },
      {
        id: 'bot_toggle_nav',
        title: telemetry.navigationRunning ? '暂停自主导航' : '启动自主导航',
        group: '导航与建图',
        keywords: ['navigation', 'move_base', '导航'],
        onTrigger: () => rosService.toggleNavigationMode()
      },
      {
        id: 'bot_open_conn',
        title: '打开 ROS 连接与摄像头地址设置',
        subtitle: `${settings.rosUrl} · ${settings.videoUrl}`,
        group: '通信与流媒体',
        keywords: ['settings', 'websocket', 'rosbridge', '设置', '连接'],
        onTrigger: () => setSettingsOpen(true)
      },
      {
        id: 'bot_open_rtsp',
        title: '打开 RTSP → MJPEG 视频转码配置抽屉',
        subtitle: '切换 TCP/UDP 传输协议与 FFmpeg 代理端点',
        group: '通信与流媒体',
        keywords: ['rtsp', 'ffmpeg', 'mjpeg', '摄像头', '转码'],
        onTrigger: () => setRtspDrawerOpen(true)
      }
    ],
    [
      telemetry.isSimulated,
      telemetry.mappingRunning,
      telemetry.navigationRunning,
      settings.rosUrl,
      settings.videoUrl
    ]
  );

  const renderControlPanels = () => (
    <>
      <MappingControl isRunning={telemetry.mappingRunning} />
      <NavigationControl
        isRunning={telemetry.navigationRunning}
        selectedMap={telemetry.selectedMap}
        availableMaps={telemetry.availableMaps}
        onSetInitialPose={handleStartInitialPose}
      />
      <LayerControl
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onEnableAllLayers={handleEnableAllLayers}
      />
    </>
  );

  const renderMapViewer = () => (
    <MapViewer
      mapData={telemetry.mapData}
      scanData={telemetry.scanData}
      robotPose={telemetry.robotPose}
      pathData={telemetry.pathData}
      targetPose={telemetry.targetPose}
      remainingDistance={telemetry.remainingDistance}
      estimatedTime={telemetry.estimatedTime}
      navigationRunning={telemetry.navigationRunning}
      mappingRunning={telemetry.mappingRunning}
      layers={layers}
      isSettingInitialPose={isSettingInitialPose}
      setIsSettingInitialPose={setIsSettingInitialPose}
    />
  );

  const renderWorkspace = () => {
    // View 2: Immersive Map + Resizable Split Control Panel
    if (pathname === '/map') {
      return (
        <div className="bot-cockpit-shell">
          <ResizableSplitPane
            direction="horizontal"
            defaultSize={312}
            minSize={260}
            maxSize={440}
            collapsible
            storageKey="bot_map_control_pane"
            collapseLabel="收起导航控制栏"
            expandLabel="展开导航控制栏"
            className="flex-1"
            firstPane={<div className="space-y-3 pr-1">{renderControlPanels()}</div>}
            secondPane={<div className="flex h-full min-h-0 flex-col">{renderMapViewer()}</div>}
          />
        </div>
      );
    }

    // View 3: Dedicated Video + Precision Teleop
    if (pathname === '/teleop') {
      return (
        <div className="bot-cockpit-shell">
          <div className="bot-teleop-grid">
            <CameraFeed
              isSimulated={telemetry.isSimulated}
              streamUrl={settings.videoUrl}
              rtspDrawerOpen={rtspDrawerOpen}
              onRtspDrawerOpenChange={setRtspDrawerOpen}
            />
            <JoystickControl
              linearVel={telemetry.linearVel}
              angularVel={telemetry.angularVel}
              battery={telemetry.battery}
            />
          </div>
        </div>
      );
    }

    // View 4: ROS Diagnostics, Topics & Real-Time Event Log
    if (pathname === '/diagnostics') {
      const yawDeg = (((telemetry.robotPose?.theta || 0) * 180) / Math.PI).toFixed(1);
      return (
        <div className="bot-diagnostics-scroll">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="通信链路模式"
              value={
                telemetry.status === 'connected'
                  ? telemetry.isSimulated
                    ? '内置仿真引擎'
                    : 'ROS Bridge 在线'
                  : telemetry.status === 'connecting'
                    ? '握手中...'
                    : '离线'
              }
              mono={false}
              tone={telemetry.status === 'connected' ? 'success' : 'warning'}
              icon={<Wifi className="h-4 w-4" />}
              hint={settings.rosUrl}
            />
            <StatCard
              label="机器人实时位姿"
              value={`(${(telemetry.robotPose?.x || 0).toFixed(2)}, ${(telemetry.robotPose?.y || 0).toFixed(2)})`}
              trend={`${yawDeg}°`}
              mono
              icon={<Compass className="h-4 w-4" />}
              hint={`当前地图: ${telemetry.selectedMap}`}
            />
            <StatCard
              label="激光雷达有效点云"
              value={`${telemetry.scanData?.length || 0} pts`}
              mono
              icon={<Radio className="h-4 w-4" />}
              hint="Topic: /scan (sensor_msgs/LaserScan)"
            />
            <StatCard
              label="动力电池健康度"
              value={`${telemetry.battery?.percentage ?? 86}%`}
              trend={`${(telemetry.battery?.voltage ?? 12.4).toFixed(1)}V / ${(telemetry.battery?.current ?? -1.2).toFixed(1)}A`}
              mono
              tone={(telemetry.battery?.percentage ?? 86) <= 20 ? 'danger' : 'default'}
              icon={<Activity className="h-4 w-4" />}
              hint="Topic: /battery_state"
            />
          </dl>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card
              size="sm"
              padding="md"
              title="端点与流媒体配置摘要"
              extra={
                <div className="flex items-center gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<Settings className="h-3.5 w-3.5" />}
                    onClick={() => setSettingsOpen(true)}
                  >
                    修改连接地址
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setRtspDrawerOpen(true)}>
                    RTSP 转码配置
                  </Button>
                </div>
              }
            >
              <DescriptionList
                columns={1}
                density="compact"
                variant="divided"
                items={[
                  {
                    key: 'ros_url',
                    label: 'ROS Bridge 地址',
                    value: settings.rosUrl,
                    mono: true,
                    copyValue: settings.rosUrl
                  },
                  {
                    key: 'video_url',
                    label: '摄像头视频流地址',
                    value: settings.videoUrl || '未配置',
                    mono: true,
                    copyValue: settings.videoUrl
                  },
                  {
                    key: 'mode',
                    label: '当前运行状态',
                    value: (
                      <StatusBadge
                        status={telemetry.status === 'connected' ? 'active' : 'unavailable'}
                        label={
                          telemetry.isSimulated
                            ? '仿真闭环运行中 (10Hz)'
                            : telemetry.status === 'connected'
                              ? '真机 WebSocket 已连接'
                              : '未连接'
                        }
                      />
                    )
                  },
                  {
                    key: 'maps',
                    label: '已加载地图库',
                    value: (
                      <div className="flex flex-wrap gap-1">
                        {telemetry.availableMaps.map((m) => (
                          <StatusTag
                            key={m}
                            size="xs"
                            tone={m === telemetry.selectedMap ? 'primary' : 'neutral'}
                            dot={m === telemetry.selectedMap}
                          >
                            {m}
                          </StatusTag>
                        ))}
                      </div>
                    )
                  }
                ]}
              />
            </Card>

            <Card size="sm" padding="md" title="ROS 话题订阅与发布契约">
              <DescriptionList
                columns={1}
                density="compact"
                variant="divided"
                items={[
                  { key: 'cmd', label: '底盘速度下发', value: '/cmd_vel (geometry_msgs/Twist)', mono: true },
                  {
                    key: 'goal',
                    label: '单点导航目标',
                    value: '/move_base_simple/goal (geometry_msgs/PoseStamped)',
                    mono: true
                  },
                  {
                    key: 'init',
                    label: '初始位姿标定',
                    value: '/initialpose (geometry_msgs/PoseWithCovarianceStamped)',
                    mono: true
                  },
                  {
                    key: 'sub',
                    label: '遥测订阅话题',
                    value: '/map · /scan · /amcl_pose · /move_base/NavfnROS/plan · /battery_state',
                    mono: true
                  }
                ]}
              />
            </Card>
          </div>

          <Card
            size="sm"
            padding="sm"
            title="中控台实时事件与指令日志"
            extra={
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => rosService.clearLogs()}
              >
                清空日志
              </Button>
            }
          >
            <ProLogViewer
              logs={telemetry.logs || []}
              heightClass="h-[280px]"
              defaultStickBottom
            />
          </Card>
        </div>
      );
    }

    // Default View 1 (/cockpit): Classic 3-column Panoramic Robot Cockpit + Mobile Dock
    return (
      <>
        <div className="bot-cockpit-shell">
          {/* Left Column: Camera + Joystick */}
          <section
            className={`bot-col-left ${activeMobileTab !== 'joystick' ? 'bot-mobile-hidden' : ''}`}
          >
            <CameraFeed
              isSimulated={telemetry.isSimulated}
              streamUrl={settings.videoUrl}
              rtspDrawerOpen={rtspDrawerOpen}
              onRtspDrawerOpenChange={setRtspDrawerOpen}
            />
            <JoystickControl
              linearVel={telemetry.linearVel}
              angularVel={telemetry.angularVel}
              battery={telemetry.battery}
            />
          </section>

          {/* Center Column: SLAM Map Viewer */}
          <section
            className={`bot-col-center ${activeMobileTab !== 'map' ? 'bot-mobile-hidden' : ''}`}
          >
            {renderMapViewer()}
          </section>

          {/* Right Column: Mapping, Navigation & Layer Controls */}
          <section
            className={`bot-col-right ${activeMobileTab !== 'settings' ? 'bot-mobile-hidden' : ''}`}
          >
            {renderControlPanels()}
          </section>
        </div>

        {/* Mobile Bottom Segmented Switcher (visible <= 860px) */}
        <div className="bot-mobile-dock">
          <SegmentedControl
            block
            size="md"
            value={activeMobileTab}
            onChange={(val) => setActiveMobileTab(val)}
            options={[
              { value: 'map', label: '地图导航', icon: <Map className="h-3.5 w-3.5" /> },
              { value: 'joystick', label: '遥控监控', icon: <Gamepad2 className="h-3.5 w-3.5" /> },
              {
                value: 'settings',
                label: '中控设置',
                icon: <SlidersHorizontal className="h-3.5 w-3.5" />
              }
            ]}
          />
        </div>

        {/* Ensure RTSP Drawer remains mountable from Command Palette even when not on /teleop */}
      </>
    );
  };

  return (
    <ProLayout
      brand={{
        name: '机器人中控台',
        subtitle: 'ROS Web Cockpit',
        logo: (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--abc-primary)] text-[var(--abc-primary-fg)] shadow-2xs">
            <Bot className="h-4 w-4" />
          </span>
        ),
        onClick: () => setPathname('/cockpit')
      }}
      menuItems={MENU_ITEMS}
      pathname={pathname}
      onNavigate={(nextPath) => setPathname(nextPath)}
      defaultSettings={{
        mode: 'top',
        sidebarTone: 'dark',
        sidebarCollapsed: false,
        sidebarAccordion: true,
        showTabs: false,
        keepAlive: false,
        contentWidth: 'fluid',
        headerBlur: true,
        showBreadcrumb: false,
        showFooter: false,
        routeProgress: true
      }}
      searchPlaceholder="指令与视图 (⌘K)..."
      commandPlaceholder="输入视图名称、拼音或机器人指令（如：急停、建图、初始位置、RTSP）..."
      commandActions={commandActions}
      headerExtra={
        <Header
          status={telemetry.status}
          isSimulated={telemetry.isSimulated}
          rosUrl={settings.rosUrl}
          videoUrl={settings.videoUrl}
          onSaveSettings={handleSaveSettings}
          battery={telemetry.battery}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
        />
      }
    >
      {renderWorkspace()}

      {/* Keep RTSP Drawer available even when viewing /map or /diagnostics */}
      {pathname !== '/cockpit' && pathname !== '/teleop' && rtspDrawerOpen && (
        <div className="hidden">
          <CameraFeed
            isSimulated={telemetry.isSimulated}
            streamUrl={settings.videoUrl}
            rtspDrawerOpen={rtspDrawerOpen}
            onRtspDrawerOpenChange={setRtspDrawerOpen}
          />
        </div>
      )}
    </ProLayout>
  );
}
