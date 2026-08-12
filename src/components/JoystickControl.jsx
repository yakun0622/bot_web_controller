import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Keyboard, Battery, BatteryCharging } from 'lucide-react';
import { rosService } from '../services/rosService';

export default function JoystickControl({ linearVel, angularVel, battery }) {
  const joystickRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  // Speed limits
  const [maxLinear, setMaxLinear] = useState(0.5); // m/s
  const [maxAngular, setMaxAngular] = useState(1.0); // rad/s

  const radius = 75; // outer circle radius

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
    setIsDragging(true);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging && e.type !== 'pointerdown') return;
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

  const handlePointerUp = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    rosService.publishTwist(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    );
  };

  // Keyboard controls listener (WASD / Arrows)
  useEffect(() => {
    const activeKeys = new Set();

    const handleKeyDown = (e) => {
      if (['Input', 'Select', 'Textarea'].includes(document.activeElement?.tagName)) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        activeKeys.add(key);

        let lx = 0;
        let az = 0;

        if (activeKeys.has('w') || activeKeys.has('arrowup')) lx += maxLinear;
        if (activeKeys.has('s') || activeKeys.has('arrowdown')) lx -= maxLinear;
        if (activeKeys.has('a') || activeKeys.has('arrowleft')) az += maxAngular;
        if (activeKeys.has('d') || activeKeys.has('arrowright')) az -= maxAngular;

        if (activeKeys.has(' ')) {
          lx = 0;
          az = 0;
        }

        rosService.publishTwist(
          { x: Number(lx.toFixed(2)), y: 0, z: 0 },
          { x: 0, y: 0, z: Number(az.toFixed(2)) }
        );
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      activeKeys.delete(key);

      if (activeKeys.size === 0) {
        rosService.publishTwist(
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 }
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [maxLinear, maxAngular]);

  return (
    <div className="card">
      <div className="card-header">
        <span>摇杆控制</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
          <Keyboard size={13} />
          <span>WASD / 方向键</span>
        </div>
      </div>
      <div className="card-body" style={{ alignItems: 'center' }}>
        {/* Interactive Joystick Area */}
        <div
          ref={joystickRef}
          className="joystick-outer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Inner Knob */}
          <div
            className="joystick-knob"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            ●
          </div>
        </div>

        {/* Speed & Battery Telemetry displays */}
        <div className="speed-grid" style={{ width: '100%' }}>
          <div className="speed-box">
            <div className="label">线速度 m/s</div>
            <div className="value">{(linearVel?.x || 0).toFixed(2)}</div>
          </div>
          <div className="speed-box">
            <div className="label">角速度 rad/s</div>
            <div className="value">{(angularVel?.z || 0).toFixed(2)}</div>
          </div>
          <div className="speed-box">
            <div className="label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {battery?.isCharging ? <BatteryCharging size={12} color="#10b981" /> : <Battery size={12} />}
              <span>电池电量</span>
            </div>
            <div className="value" style={{ color: battery?.percentage <= 20 ? '#ef4444' : '#10b981' }}>
              {battery?.percentage ?? 86}%
            </div>
          </div>
          <div className="speed-box">
            <div className="label">工作电压 V</div>
            <div className="value" style={{ color: '#0f172a' }}>
              {(battery?.voltage ?? 12.4).toFixed(1)}V
            </div>
          </div>
        </div>

        {/* Max Speed Controls */}
        <div style={{ width: '100%', display: 'flex', gap: 8, fontSize: 12 }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#64748b' }}>最高线速: {maxLinear}m/s</span>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={maxLinear}
              onChange={(e) => setMaxLinear(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#64748b' }}>最高角速: {maxAngular}rad/s</span>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={maxAngular}
              onChange={(e) => setMaxAngular(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Emergency Stop Button */}
        <button
          className="btn btn-danger-light"
          style={{ width: '100%', padding: '10px' }}
          onClick={() => rosService.publishTwist({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })}
        >
          <ShieldAlert size={16} />
          <span>急停 / STOP</span>
        </button>
      </div>
    </div>
  );
}
