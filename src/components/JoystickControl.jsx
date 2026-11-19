import React, { useEffect, useRef, useState } from 'react';
import { Battery, BatteryCharging, Gauge, Keyboard, Move, RotateCw, ShieldAlert, Zap } from 'lucide-react';
import { Button, Card, StatCard, StatusTag, useAbcConfig } from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function JoystickControl({ linearVel, angularVel, battery }) {
  const { toast } = useAbcConfig();
  const joystickRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  // Speed limits
  const [maxLinear, setMaxLinear] = useState(0.5); // m/s
  const [maxAngular, setMaxAngular] = useState(1.0); // rad/s

  const radius = 64;

  const updateVelFromOffset = (dx, dy) => {
    const normX = dx / radius;
    const normY = dy / radius;

    const linearX = -normY * maxLinear;
    const angularZ = -normX * maxAngular;

    rosService.publishTwist(
      { x: Number(linearX.toFixed(2)), y: 0, z: 0 },
      { x: 0, y: 0, z: Number(angularZ.toFixed(2)) }
    );
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    updatePointerPosition(e);
  };

  const updatePointerPosition = (e) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const distance = Math.hypot(dx, dy);
    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }

    setKnobPos({ x: dx, y: dy });
    updateVelFromOffset(dx, dy);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updatePointerPosition(e);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    rosService.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
  };

  // Keyboard controls listener (WASD / Arrows / Space E-Stop)
  useEffect(() => {
    const activeKeys = new Set();

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        if (key === ' ') e.preventDefault();
        activeKeys.add(key);

        let lx = 0;
        let az = 0;

        if (activeKeys.has('w') || activeKeys.has('arrowup')) lx += maxLinear;
        if (activeKeys.has('s') || activeKeys.has('arrowdown')) lx -= maxLinear;
        if (activeKeys.has('a') || activeKeys.has('arrowleft')) az += maxAngular;
        if (activeKeys.has('d') || activeKeys.has('arrowright')) az -= maxAngular;

        if (activeKeys.has(' ')) {
          rosService.emergencyStop();
          return;
        }

        rosService.publishTwist(
          { x: Number(lx.toFixed(2)), y: 0, z: 0 },
          { x: 0, y: 0, z: Number(az.toFixed(2)) }
        );
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (!activeKeys.has(key)) return;
      activeKeys.delete(key);

      if (activeKeys.size === 0) {
        rosService.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [maxLinear, maxAngular]);

  const pct = battery?.percentage ?? 86;

  return (
    <Card
      size="sm"
      padding="sm"
      title="底盘运动遥控"
      extra={
        <StatusTag size="xs" tone="neutral" dot={false} icon={<Keyboard className="h-3 w-3" />}>
          WASD / 方向键
        </StatusTag>
      }
    >
      <div className="flex flex-col items-center gap-3">
        {/* Token-styled Interactive Joystick Pad */}
        <div
          ref={joystickRef}
          className="bot-joystick-pad"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="bot-joystick-crosshair-h" aria-hidden="true" />
          <span className="bot-joystick-crosshair-v" aria-hidden="true" />
          <span className="bot-joystick-ring" aria-hidden="true" />
          <div
            className="bot-joystick-knob"
            style={{
              transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
              transition: isDragging ? 'none' : 'transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <Move className="h-4 w-4 opacity-90" />
          </div>
        </div>

        {/* 2x2 ABC Design StatCard Grid */}
        <dl className="grid w-full grid-cols-2 gap-2">
          <StatCard
            size="sm"
            tone={Math.abs(linearVel?.x || 0) > 0.01 ? 'primary' : 'default'}
            label="线速度 (m/s)"
            icon={<Gauge className="h-3.5 w-3.5" />}
            value={(linearVel?.x || 0).toFixed(2)}
            mono
          />
          <StatCard
            size="sm"
            tone={Math.abs(angularVel?.z || 0) > 0.01 ? 'primary' : 'default'}
            label="角速度 (rad/s)"
            icon={<RotateCw className="h-3.5 w-3.5" />}
            value={(angularVel?.z || 0).toFixed(2)}
            mono
          />
          <StatCard
            size="sm"
            tone={pct <= 20 ? 'danger' : battery?.isCharging ? 'success' : 'default'}
            label="电池电量"
            icon={
              battery?.isCharging ? (
                <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Battery className="h-3.5 w-3.5" />
              )
            }
            value={`${pct}%`}
            mono
          />
          <StatCard
            size="sm"
            tone="default"
            label="母线电压"
            icon={<Zap className="h-3.5 w-3.5" />}
            value={`${(battery?.voltage ?? 12.4).toFixed(1)}V`}
            mono
          />
        </dl>

        {/* Speed Limit Sliders */}
        <div className="grid w-full grid-cols-2 gap-3 rounded-[var(--abc-radius-md)] border border-[var(--abc-border)] bg-[var(--abc-bg-muted)]/50 p-2.5 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--abc-fg-muted)]">最高线速</span>
              <span className="font-mono font-semibold text-[var(--abc-fg)]">
                {maxLinear.toFixed(1)} m/s
              </span>
            </div>
            <input
              type="range"
              className="bot-range-slider"
              min="0.1"
              max="1.5"
              step="0.1"
              value={maxLinear}
              onChange={(e) => setMaxLinear(parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--abc-fg-muted)]">最高角速</span>
              <span className="font-mono font-semibold text-[var(--abc-fg)]">
                {maxAngular.toFixed(1)} rad/s
              </span>
            </div>
            <input
              type="range"
              className="bot-range-slider"
              min="0.2"
              max="2.5"
              step="0.1"
              value={maxAngular}
              onChange={(e) => setMaxAngular(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Emergency Stop Button */}
        <Button
          variant="danger"
          size="md"
          block
          leftIcon={<ShieldAlert className="h-4 w-4" />}
          onClick={() => {
            rosService.emergencyStop();
            toast.warning('已触发紧急停止 (/cmd_vel 归零)');
          }}
        >
          急停 / EMERGENCY STOP (Space)
        </Button>
      </div>
    </Card>
  );
}
