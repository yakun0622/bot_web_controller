import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JoystickControl from './components/JoystickControl';
import CameraFeed from './components/CameraFeed';
import MapViewer from './components/MapViewer';
import MappingControl from './components/MappingControl';
import NavigationControl from './components/NavigationControl';
import LayerControl from './components/LayerControl';
import { Map, Gamepad2, SlidersHorizontal } from 'lucide-react';
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

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [activeMobileTab, setActiveMobileTab] = useState('map'); // 'map' | 'joystick' | 'settings'

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
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <Header
        status={telemetry.status}
        isSimulated={telemetry.isSimulated}
        rosUrl={settings.rosUrl}
        videoUrl={settings.videoUrl}
        onSaveSettings={handleSaveSettings}
        battery={telemetry.battery}
      />

      {/* Main Grid Workspace */}
      <main className="app-container">
        {/* Left Panel: Joystick & Camera (Mobile tab: 'joystick') */}
        <section className={`column-left ${activeMobileTab !== 'joystick' ? 'mobile-tab-hidden' : ''}`}>
          <CameraFeed
            isSimulated={telemetry.isSimulated}
            streamUrl={settings.videoUrl}
          />
          <JoystickControl
            linearVel={telemetry.linearVel}
            angularVel={telemetry.angularVel}
            battery={telemetry.battery}
          />
        </section>

        {/* Center Panel: SLAM Map Canvas Viewer (Mobile tab: 'map') */}
        <section className={`column-center ${activeMobileTab !== 'map' ? 'mobile-tab-hidden' : ''}`}>
          <MapViewer
            mapData={telemetry.mapData}
            scanData={telemetry.scanData}
            robotPose={telemetry.robotPose}
            pathData={telemetry.pathData}
            targetPose={telemetry.targetPose}
            remainingDistance={telemetry.remainingDistance}
            estimatedTime={telemetry.estimatedTime}
            layers={layers}
            isSettingInitialPose={isSettingInitialPose}
            setIsSettingInitialPose={setIsSettingInitialPose}
          />
        </section>

        {/* Right Panel: Mapping, Navigation & Layer Control (Mobile tab: 'settings') */}
        <section className={`column-right ${activeMobileTab !== 'settings' ? 'mobile-tab-hidden' : ''}`}>
          <MappingControl isRunning={telemetry.mappingRunning} />
          <NavigationControl
            isRunning={telemetry.navigationRunning}
            selectedMap={telemetry.selectedMap}
            availableMaps={telemetry.availableMaps}
            onSetInitialPose={() => {
              setIsSettingInitialPose(true);
              setActiveMobileTab('map');
            }}
          />
          <LayerControl layers={layers} onToggleLayer={handleToggleLayer} />
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile width <= 768px) */}
      <nav className="mobile-nav-bar">
        <button
          className={`mobile-nav-item ${activeMobileTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('map')}
        >
          <Map size={20} />
          <span>地图导航</span>
        </button>
        <button
          className={`mobile-nav-item ${activeMobileTab === 'joystick' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('joystick')}
        >
          <Gamepad2 size={20} />
          <span>遥控监控</span>
        </button>
        <button
          className={`mobile-nav-item ${activeMobileTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveMobileTab('settings')}
        >
          <SlidersHorizontal size={20} />
          <span>中控设置</span>
        </button>
      </nav>
    </div>
  );
}
