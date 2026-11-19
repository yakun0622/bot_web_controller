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
  videoUrl: 'http://192.168.2.165:81',
  rosProtocol: 'auto'
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
    rosProtocol: 'auto',
    detectedProtocol: 'ros2',
    activeTopicSummary: null,
    reconnectAttempts: 0,
    poseSource: 'none',
    linearVel: { x: 0, y: 0, z: 0 },
    angularVel: { x: 0, y: 0, z: 0 },
    robotPose: { x: 0, y: 0, theta: 0 },
    mapData: null,
    costmapData: null,
    scanData: [],
    pathData: [],
    targetPose: null,
    multiPointNav: false,
    loopWaypoints: false,
    waypoints: [],
    activeWaypointIndex: -1,
    remainingDistance: 0,
    estimatedTime: 0,
    mappingRunning: false,
    navigationRunning: false,
    selectedMap: '',
    availableMaps: [],
    battery: null,
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
  const [isSettingGoalPose, setIsSettingGoalPose] = useState(false);

  const isConnected = telemetry.status === 'connected';
  const hasMap = Boolean(telemetry.mapData?.info && telemetry.mapData?.data);

  useEffect(() => {
    const unsubscribe = rosService.subscribe((data) => {
      setTelemetry(data);
    });

    rosService.connect(settings.rosUrl, {
      rosProtocol: settings.rosProtocol,
      autoReconnect: true
    });

    return () => {
      unsubscribe();
      rosService.disconnect();
    };
  }, []);

  const handleSaveSettings = (nextSettings) => {
    const merged = { ...DEFAULT_SETTINGS, ...nextSettings };
    setSettings(merged);
    try {
      localStorage.setItem('bot-controller-settings', JSON.stringify(merged));
    } catch (error) {
      console.warn('Unable to persist connection settings:', error);
    }
    rosService.connect(merged.rosUrl, {
      rosProtocol: merged.rosProtocol,
      autoReconnect: true
    });
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

  const ensureMapVisible = () => {
    setActiveMobileTab('map');
    if (pathname !== '/cockpit' && pathname !== '/map') {
      setPathname('/cockpit');
    }
  };

  const handleStartInitialPose = () => {
    if (!isConnected) {
      toast.warning('请先连接机器人 ROS Bridge');
      return;
    }
    setIsSettingGoalPose(false);
    setIsSettingInitialPose(true);
    ensureMapVisible();
    toast.info('请在地图上按住并拖拽箭头，标定初始位置与朝向');
  };

  const handleStartGoalPose = () => {
    if (!isConnected) {
      toast.warning('请先连接机器人 ROS Bridge');
      return;
    }
    setIsSettingInitialPose(false);
    setIsSettingGoalPose(true);
    ensureMapVisible();
    toast.info(
      telemetry.multiPointNav
        ? '请在地图上按住并拖拽箭头，添加带朝向的巡航航点'
        : '请在地图上按住并拖拽箭头，设定目标点与到达朝向'
    );
  };

  // Spotlight ⌘K Command Palette robot actions
  const commandActions = useMemo(
    () => [
      {
        id: 'bot_estop',
        title: '紧急制动 / 急停 (Emergency Stop)',
        subtitle: '立即向 /cmd_vel 下发零速度并取消活动导航目标',
        badge: 'Space',
        group: '机器人控制',
        priority: 100,
        keywords: ['stop', 'estop', '急停', '制动'],
        onTrigger: () => {
          rosService.emergencyStop();
          toast.warning('已触发紧急制动指令');
        }
      },
      {
        id: 'bot_reconnect',
        title: '立即重新连接 ROS Bridge',
        subtitle: `目标端点: ${settings.rosUrl} (${settings.rosProtocol.toUpperCase()})`,
        group: '通信与流媒体',
        priority: 95,
        keywords: ['reconnect', 'connect', 'ros', '重连', '连接'],
        onTrigger: () => {
          rosService.reconnect();
          toast.info(`正在尝试重连 ${settings.rosUrl}`);
        }
      },
      {
        id: 'bot_initial_pose',
        title: '标定机器人初始位姿 (2D Pose Estimate)',
        subtitle: '在地图拖拽方向箭头，发布带四元数朝向的 /initialpose',
        group: '导航与建图',
        keywords: ['initialpose', 'amcl', '初始位置', '位姿'],
        onTrigger: handleStartInitialPose
      },
      {
        id: 'bot_goal_pose',
        title: '拖拽设定带朝向的目标位姿 (2D Goal Pose)',
        subtitle: '在地图按住拖拽方向箭头，发布精确到达偏航角',
        group: '导航与建图',
        keywords: ['goal', 'goal_pose', '目标点', '导航'],
        onTrigger: handleStartGoalPose
      },
      {
        id: 'bot_export_map',
        title: '导出当前地图为标准 ROS 文件 (.pgm + .yaml)',
        subtitle: hasMap ? `当前地图: ${telemetry.selectedMap || 'active_map'}` : '需先收到 /map 话题数据',
        group: '导航与建图',
        keywords: ['export', 'pgm', 'yaml', '导出地图', '保存地图'],
        onTrigger: () => {
          const name = telemetry.selectedMap || 'bot_map';
          if (rosService.exportCurrentMapFiles(name)) {
            toast.success(`已导出 ${name}.pgm 与 .yaml`);
          } else {
            toast.warning('当前尚未收到 /map 话题数据');
          }
        }
      },
      {
        id: 'bot_toggle_mapping',
        title: telemetry.mappingRunning ? '停止 SLAM 建图' : '启动 SLAM 建图',
        group: '导航与建图',
        keywords: ['slam', 'mapping', '建图'],
        onTrigger: () => {
          if (!isConnected) toast.warning('请先连接 ROS Bridge');
          else rosService.toggleMappingMode();
        }
      },
      {
        id: 'bot_toggle_nav',
        title: telemetry.navigationRunning ? '停止自主导航' : '启用自主导航',
        group: '导航与建图',
        keywords: ['navigation', 'nav2', 'move_base', '导航'],
        onTrigger: () => {
          if (!isConnected) toast.warning('请先连接 ROS Bridge');
          else rosService.toggleNavigationMode();
        }
      },
      {
        id: 'bot_open_conn',
        title: '打开 ROS 协议与摄像头地址设置',
        subtitle: `${settings.rosUrl} · ${settings.rosProtocol.toUpperCase()}`,
        group: '通信与流媒体',
        keywords: ['settings', 'websocket', 'rosbridge', 'ros2', '设置', '连接'],
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
      isConnected,
      hasMap,
      telemetry.mappingRunning,
      telemetry.navigationRunning,
      telemetry.selectedMap,
      telemetry.multiPointNav,
      settings.rosUrl,
      settings.rosProtocol
    ]
  );

  const renderControlPanels = () => (
    <>
      <MappingControl
        connected={isConnected}
        hasMap={hasMap}
        isRunning={telemetry.mappingRunning}
      />
      <NavigationControl
        connected={isConnected}
        isRunning={telemetry.navigationRunning}
        selectedMap={telemetry.selectedMap}
        availableMaps={telemetry.availableMaps}
        multiPointNav={telemetry.multiPointNav}
        loopWaypoints={telemetry.loopWaypoints}
        waypoints={telemetry.waypoints}
        activeWaypointIndex={telemetry.activeWaypointIndex}
        onSetInitialPose={handleStartInitialPose}
        onSetGoalPose={handleStartGoalPose}
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
      status={telemetry.status}
      rosUrl={settings.rosUrl}
      mapData={telemetry.mapData}
      costmapData={telemetry.costmapData}
      scanData={telemetry.scanData}
      robotPose={telemetry.robotPose}
      pathData={telemetry.pathData}
      targetPose={telemetry.targetPose}
      waypoints={telemetry.waypoints}
      activeWaypointIndex={telemetry.activeWaypointIndex}
      multiPointNav={telemetry.multiPointNav}
      loopWaypoints={telemetry.loopWaypoints}
      remainingDistance={telemetry.remainingDistance}
      estimatedTime={telemetry.estimatedTime}
      navigationRunning={telemetry.navigationRunning}
      mappingRunning={telemetry.mappingRunning}
      layers={layers}
      isSettingInitialPose={isSettingInitialPose}
      setIsSettingInitialPose={setIsSettingInitialPose}
      isSettingGoalPose={isSettingGoalPose}
      setIsSettingGoalPose={setIsSettingGoalPose}
      onOpenSettings={() => setSettingsOpen(true)}
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
              streamUrl={settings.videoUrl}
              rtspDrawerOpen={rtspDrawerOpen}
              onRtspDrawerOpenChange={setRtspDrawerOpen}
            />
            <JoystickControl
              connected={isConnected}
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
      const topicInfo = telemetry.activeTopicSummary || {};
      const hasBattery = Boolean(telemetry.battery && typeof telemetry.battery.percentage === 'number');

      return (
        <div className="bot-diagnostics-scroll">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="通信链路与协议栈"
              value={
                isConnected
                  ? `在线 · ${telemetry.detectedProtocol.toUpperCase()}`
                  : telemetry.status === 'connecting'
                    ? '连接握手中...'
                    : `离线 (重试 #${telemetry.reconnectAttempts})`
              }
              mono={false}
              tone={isConnected ? 'success' : 'warning'}
              icon={<Wifi className="h-4 w-4" />}
              hint={settings.rosUrl}
            />
            <StatCard
              label="机器人实时位姿"
              value={
                isConnected && telemetry.poseSource !== 'none'
                  ? `(${(telemetry.robotPose?.x || 0).toFixed(2)}, ${(telemetry.robotPose?.y || 0).toFixed(2)})`
                  : '--'
              }
              trend={isConnected && telemetry.poseSource !== 'none' ? `${yawDeg}°` : undefined}
              mono
              icon={<Compass className="h-4 w-4" />}
              hint={`位姿源: ${telemetry.poseSource === 'none' ? '等待数据' : telemetry.poseSource.toUpperCase()}`}
            />
            <StatCard
              label="激光雷达有效点云"
              value={isConnected ? `${telemetry.scanData?.length || 0} pts` : '--'}
              mono
              icon={<Radio className="h-4 w-4" />}
              hint={`Topic: ${topicInfo.scanTopic || '/scan'}`}
            />
            <StatCard
              label="动力电池健康度"
              value={hasBattery ? `${telemetry.battery.percentage}%` : '--'}
              trend={
                hasBattery
                  ? `${telemetry.battery.voltage.toFixed(1)}V / ${telemetry.battery.current.toFixed(1)}A`
                  : undefined
              }
              mono
              tone={hasBattery && telemetry.battery.percentage <= 20 ? 'danger' : 'default'}
              icon={<Activity className="h-4 w-4" />}
              hint={`Topic: ${topicInfo.batteryTopic || '/battery_state'}`}
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
                    key: 'ros_proto',
                    label: '协议栈配置',
                    value: `${settings.rosProtocol.toUpperCase()} → 当前契约: ${(
                      topicInfo.label || 'ROS 2 (Nav2)'
                    )}`
                  },
                  {
                    key: 'video_url',
                    label: '摄像头视频流地址',
                    value: settings.videoUrl || '未配置',
                    mono: true,
                    copyValue: settings.videoUrl
                  },
                  {
                    key: 'maps',
                    label: '已记录地图历史',
                    value:
                      telemetry.availableMaps.length > 0 ? (
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
                      ) : (
                        <span className="text-[var(--abc-fg-muted)]">暂无记录</span>
                      )
                  }
                ]}
              />
            </Card>

            <Card size="sm" padding="md" title="当前生效的 ROS 话题与服务契约">
              <DescriptionList
                columns={1}
                density="compact"
                variant="divided"
                items={[
                  {
                    key: 'cmd',
                    label: '底盘速度 (10Hz 心跳)',
                    value: `/cmd_vel (${topicInfo.cmdVelType || 'geometry_msgs/msg/Twist'})`,
                    mono: true
                  },
                  {
                    key: 'goal',
                    label: '导航目标位姿',
                    value: `${topicInfo.goalTopic || '/goal_pose'} (${topicInfo.goalType || 'geometry_msgs/msg/PoseStamped'})`,
                    mono: true
                  },
                  {
                    key: 'plan',
                    label: '全局路径与代价图',
                    value: `${topicInfo.pathTopic || '/plan'} · ${topicInfo.costmapTopic || '/global_costmap/costmap'}`,
                    mono: true
                  },
                  {
                    key: 'pose',
                    label: '定位与里程计回退',
                    value: `/amcl_pose → 自动回退 /odom · 存图服务: /map_saver/save_map`,
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
              streamUrl={settings.videoUrl}
              rtspDrawerOpen={rtspDrawerOpen}
              onRtspDrawerOpenChange={setRtspDrawerOpen}
            />
            <JoystickControl
              connected={isConnected}
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
      commandPlaceholder="输入视图名称、拼音或机器人指令（如：急停、重连、初始位置、导出地图、RTSP）..."
      commandActions={commandActions}
      headerExtra={
        <Header
          status={telemetry.status}
          rosUrl={settings.rosUrl}
          videoUrl={settings.videoUrl}
          rosProtocol={settings.rosProtocol}
          detectedProtocol={telemetry.detectedProtocol}
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
            streamUrl={settings.videoUrl}
            rtspDrawerOpen={rtspDrawerOpen}
            onRtspDrawerOpenChange={setRtspDrawerOpen}
          />
        </div>
      )}
    </ProLayout>
  );
}
