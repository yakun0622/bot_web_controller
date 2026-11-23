import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  Compass,
  Cpu,
  Gamepad2,
  Map,
  Radio,
  Settings,
  SlidersHorizontal,
  Trash2,
  Usb,
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
import W152DControl from './components/W152DControl';
import MappingControl from './components/MappingControl';
import NavigationControl from './components/NavigationControl';
import LayerControl from './components/LayerControl';
import { rosService } from './services/rosService';

const DEFAULT_SETTINGS = {
  connectionMode: 'w152d', // 'w152d' | 'rosbridge'
  gatewayUrl: '',
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
    keywords: ['cockpit', 'w152d', 'slam', 'teleop', '全景', '驾驶舱', '中控']
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
    keywords: ['w152d', 'serial', 'mavlink', 'ros', 'topics', 'logs', '遥测', '串口', '日志']
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
    connectionMode: 'w152d',
    gatewayOnline: false,
    gatewayBase: '',
    driverMode: 'mavlink_serial',
    serialConnected: false,
    ros2Connected: false,
    serialPort: '/dev/ttyUSB0',
    serialBaud: 921600,
    serialDeviceExists: false,
    rosAvailable: false,
    managedNodes: {},
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
  const isW152D = settings.connectionMode === 'w152d';
  const isNavReady =
    isConnected && (!isW152D || telemetry.driverMode === 'local_ros2');
  const hasMap = Boolean(telemetry.mapData?.info && telemetry.mapData?.data);

  useEffect(() => {
    const unsubscribe = rosService.subscribe((data) => {
      setTelemetry(data);
    });

    const targetUrl =
      settings.connectionMode === 'w152d' ? settings.gatewayUrl : settings.rosUrl;
    rosService.connect(targetUrl, {
      connectionMode: settings.connectionMode,
      rosProtocol: settings.rosProtocol,
      autoReconnect: true
    });

    return () => {
      unsubscribe();
      rosService.disconnect();
    };
  }, []);

  const handleSaveSettings = (nextSettings) => {
    const merged = { ...DEFAULT_SETTINGS, ...settings, ...nextSettings };
    setSettings(merged);
    try {
      localStorage.setItem('bot-controller-settings', JSON.stringify(merged));
    } catch (error) {
      console.warn('Unable to persist connection settings:', error);
    }
    const targetUrl = merged.connectionMode === 'w152d' ? merged.gatewayUrl : merged.rosUrl;
    rosService.connect(targetUrl, {
      connectionMode: merged.connectionMode,
      rosProtocol: merged.rosProtocol,
      autoReconnect: true
    });
  };

  const handleUseRosCamera = () => {
    const mjpegUrl = rosService.getW152DCameraStreamUrl();
    const merged = { ...settings, videoUrl: mjpegUrl };
    setSettings(merged);
    try {
      localStorage.setItem('bot-controller-settings', JSON.stringify(merged));
    } catch {}
    toast.success('已将监控画面切换为 W152D 本机 ROS 压缩图像流');
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
    if (!isNavReady) {
      toast.warning(
        isW152D && telemetry.driverMode === 'mavlink_serial'
          ? '请先在右侧「W152D 机载直连控制」切换为「本机 ROS 2 导航」模式'
          : '请先连接上位机并确保 ROS 2 已就绪'
      );
      return;
    }
    setIsSettingGoalPose(false);
    setIsSettingInitialPose(true);
    ensureMapVisible();
    toast.info('请在地图上按住并拖拽箭头，标定初始位置与朝向');
  };

  const handleStartGoalPose = () => {
    if (!isNavReady) {
      toast.warning(
        isW152D && telemetry.driverMode === 'mavlink_serial'
          ? '请先在右侧「W152D 机载直连控制」切换为「本机 ROS 2 导航」模式'
          : '请先连接上位机并确保 ROS 2 已就绪'
      );
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
        subtitle: '立即通过串口 MAVLink 或 /cmd_vel 下发零速度制动',
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
        id: 'bot_switch_serial',
        title: '切换为 W152D USB 串口直连模式 (MAVLink)',
        subtitle: `直连 ${telemetry.serialPort} @ ${telemetry.serialBaud}，免启动 ROS 2`,
        group: 'W152D 上位机',
        priority: 96,
        keywords: ['w152d', 'serial', 'mavlink', 'usb', '串口', '直连'],
        onTrigger: () => rosService.setW152DDriverMode('mavlink_serial')
      },
      {
        id: 'bot_switch_ros2',
        title: '切换为 W152D 本机 ROS 2 导航直通模式',
        subtitle: '释放串口占用并启用本机 rclpy 桥接，支持 SLAM 与 Nav2',
        group: 'W152D 上位机',
        priority: 94,
        keywords: ['w152d', 'ros2', 'slam', 'nav2', '导航'],
        onTrigger: () => rosService.setW152DDriverMode('local_ros2')
      },
      {
        id: 'bot_reconnect',
        title: '立即重新连接上位机网关',
        group: '通信与流媒体',
        keywords: ['reconnect', 'connect', '重连', '连接'],
        onTrigger: () => {
          rosService.reconnect();
          toast.info('正在重新连接...');
        }
      },
      {
        id: 'bot_initial_pose',
        title: '标定机器人初始位姿 (2D Pose Estimate)',
        group: '导航与建图',
        keywords: ['initialpose', 'amcl', '初始位置', '位姿'],
        onTrigger: handleStartInitialPose
      },
      {
        id: 'bot_goal_pose',
        title: '拖拽设定带朝向的目标位姿 (2D Goal Pose)',
        group: '导航与建图',
        keywords: ['goal', 'goal_pose', '目标点', '导航'],
        onTrigger: handleStartGoalPose
      },
      {
        id: 'bot_export_map',
        title: '导出当前地图为标准 ROS 文件 (.pgm + .yaml)',
        group: '导航与建图',
        keywords: ['export', 'pgm', 'yaml', '导出地图', '保存地图'],
        onTrigger: () => {
          const name = telemetry.selectedMap || 'bot_map';
          if (rosService.exportCurrentMapFiles(name)) {
            toast.success(`已导出 ${name}.pgm 与 .yaml`);
          } else {
            toast.warning('当前尚未收到 /map 栅格地图数据');
          }
        }
      },
      {
        id: 'bot_open_conn',
        title: '打开上位机接入模式与摄像头设置',
        group: '通信与流媒体',
        keywords: ['settings', 'w152d', 'rosbridge', '设置', '连接'],
        onTrigger: () => setSettingsOpen(true)
      },
      {
        id: 'bot_open_rtsp',
        title: '打开 RTSP → MJPEG 视频转码配置抽屉',
        group: '通信与流媒体',
        keywords: ['rtsp', 'ffmpeg', 'mjpeg', '摄像头', '转码'],
        onTrigger: () => setRtspDrawerOpen(true)
      }
    ],
    [
      isNavReady,
      telemetry.serialPort,
      telemetry.serialBaud,
      telemetry.selectedMap,
      telemetry.multiPointNav
    ]
  );

  const renderControlPanels = () => (
    <>
      {isW152D && (
        <W152DControl
          gatewayOnline={telemetry.gatewayOnline}
          driverMode={telemetry.driverMode}
          serialConnected={telemetry.serialConnected}
          ros2Connected={telemetry.ros2Connected}
          serialPort={telemetry.serialPort}
          serialBaud={telemetry.serialBaud}
          serialDeviceExists={telemetry.serialDeviceExists}
          rosAvailable={telemetry.rosAvailable}
          managedNodes={telemetry.managedNodes}
          onUseRosCamera={handleUseRosCamera}
        />
      )}
      {(!isW152D || telemetry.driverMode === 'local_ros2') && (
        <>
          <MappingControl
            connected={isNavReady}
            hasMap={hasMap}
            isRunning={telemetry.mappingRunning}
          />
          <NavigationControl
            connected={isNavReady}
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
        </>
      )}
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
      connectionMode={settings.connectionMode}
      gatewayOnline={telemetry.gatewayOnline}
      driverMode={telemetry.driverMode}
      serialPort={telemetry.serialPort}
      serialBaud={telemetry.serialBaud}
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
            collapseLabel="收起控制栏"
            expandLabel="展开控制栏"
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

    // View 4: Diagnostics, W152D Hardware Status & Real-Time Event Log
    if (pathname === '/diagnostics') {
      const yawDeg = (((telemetry.robotPose?.theta || 0) * 180) / Math.PI).toFixed(1);
      const hasBattery = Boolean(telemetry.battery && typeof telemetry.battery.percentage === 'number');

      return (
        <div className="bot-diagnostics-scroll">
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="上位机直连模式"
              value={
                isW152D
                  ? telemetry.gatewayOnline
                    ? telemetry.driverMode === 'mavlink_serial'
                      ? 'W152D · 串口直连'
                      : 'W152D · 本机ROS2'
                    : 'W152D · 网关离线'
                  : isConnected
                    ? `Rosbridge · ${telemetry.detectedProtocol.toUpperCase()}`
                    : 'Rosbridge · 离线'
              }
              mono={false}
              tone={isConnected ? 'success' : telemetry.gatewayOnline ? 'primary' : 'warning'}
              icon={isW152D ? <Usb className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
              hint={
                isW152D
                  ? `${telemetry.serialPort} @ ${telemetry.serialBaud} bps`
                  : settings.rosUrl
              }
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
              label="360° 激光雷达点云"
              value={isConnected ? `${telemetry.scanData?.length || 0} pts` : '--'}
              mono
              icon={<Radio className="h-4 w-4" />}
              hint={
                isW152D && telemetry.driverMode === 'mavlink_serial'
                  ? 'MAVLink OBSTACLE_DISTANCE (#330)'
                  : 'ROS 2 /scan (LaserScan)'
              }
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
              hint={
                isW152D && telemetry.driverMode === 'mavlink_serial'
                  ? 'MAVLink SYS_STATUS (#1)'
                  : 'ROS 2 /battery_state · /voltage'
              }
            />
          </dl>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {isW152D ? (
              <W152DControl
                gatewayOnline={telemetry.gatewayOnline}
                driverMode={telemetry.driverMode}
                serialConnected={telemetry.serialConnected}
                ros2Connected={telemetry.ros2Connected}
                serialPort={telemetry.serialPort}
                serialBaud={telemetry.serialBaud}
                serialDeviceExists={telemetry.serialDeviceExists}
                rosAvailable={telemetry.rosAvailable}
                managedNodes={telemetry.managedNodes}
                onUseRosCamera={handleUseRosCamera}
              />
            ) : (
              <Card size="sm" padding="md" title="外部 Rosbridge 连接状态">
                <DescriptionList
                  columns={1}
                  density="compact"
                  variant="divided"
                  items={[
                    { key: 'url', label: 'WebSocket 地址', value: settings.rosUrl, mono: true },
                    { key: 'proto', label: '协议版本', value: telemetry.detectedProtocol.toUpperCase() }
                  ]}
                />
              </Card>
            )}

            <Card
              size="sm"
              padding="md"
              title="W152D 直连通信契约摘要"
              extra={
                <div className="flex items-center gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={<Settings className="h-3.5 w-3.5" />}
                    onClick={() => setSettingsOpen(true)}
                  >
                    连接配置
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setRtspDrawerOpen(true)}>
                    RTSP 配置
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
                    key: 'arch',
                    label: '网关接口',
                    value: `${telemetry.gatewayBase || '同源'}/api/bot (SSE 实时流 + HTTP 低延迟控制，免 9090 端口)`,
                    mono: true
                  },
                  {
                    key: 'serial',
                    label: '串口协议',
                    value: `${telemetry.serialPort} @ ${telemetry.serialBaud} · MAVLink v2 (#84 速度下发, #330 雷达, #331 里程计)`,
                    mono: true
                  },
                  {
                    key: 'cam',
                    label: '当前视频源',
                    value: settings.videoUrl || '未配置',
                    mono: true,
                    copyValue: settings.videoUrl
                  },
                  {
                    key: 'maps',
                    label: '已记录地图',
                    value:
                      telemetry.availableMaps.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {telemetry.availableMaps.map((m) => (
                            <StatusTag key={m} size="xs" tone="neutral">
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

    // Default View 1 (/cockpit): 3-column Panoramic Robot Cockpit + Mobile Dock
    return (
      <>
        <div className="bot-cockpit-shell">
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

          <section
            className={`bot-col-center ${activeMobileTab !== 'map' ? 'bot-mobile-hidden' : ''}`}
          >
            {renderMapViewer()}
          </section>

          <section
            className={`bot-col-right ${activeMobileTab !== 'settings' ? 'bot-mobile-hidden' : ''}`}
          >
            {renderControlPanels()}
          </section>
        </div>

        <div className="bot-mobile-dock">
          <SegmentedControl
            block
            size="md"
            value={activeMobileTab}
            onChange={(val) => setActiveMobileTab(val)}
            options={[
              { value: 'map', label: '雷达地图', icon: <Map className="h-3.5 w-3.5" /> },
              { value: 'joystick', label: '遥控监控', icon: <Gamepad2 className="h-3.5 w-3.5" /> },
              {
                value: 'settings',
                label: '机载中控',
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
        subtitle: 'W152D Direct Cockpit',
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
      commandPlaceholder="输入视图名称或指令（如：急停、串口直连、ROS2、导出地图、RTSP）..."
      commandActions={commandActions}
      headerExtra={
        <Header
          status={telemetry.status}
          connectionMode={settings.connectionMode}
          gatewayOnline={telemetry.gatewayOnline}
          driverMode={telemetry.driverMode}
          gatewayUrl={settings.gatewayUrl}
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
