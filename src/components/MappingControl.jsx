import React, { useState } from 'react';
import { Play, Square, Save, Check } from 'lucide-react';
import { rosService } from '../services/rosService';

export default function MappingControl({ isRunning }) {
  const [mapSaveName, setMapSaveName] = useState('my_room_map');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveMap = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span>建图控制</span>
      </div>

      <div className="card-body">
        {/* Toggle Mapping Button */}
        <button
          className={`btn ${isRunning ? 'btn-danger-light' : 'btn-primary'}`}
          style={{ width: '100%', padding: '10px' }}
          onClick={() => rosService.toggleMappingMode()}
        >
          {isRunning ? <Square size={16} /> : <Play size={16} />}
          <span>{isRunning ? '停止建图' : '开始建图'}</span>
        </button>

        {/* Status Indicator */}
        <div
          style={{
            fontSize: 12,
            color: isRunning ? '#15803d' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isRunning ? '#10b981' : '#cbd5e1',
              display: 'inline-block'
            }}
          />
          <span>{isRunning ? '建图节点运行中' : '建图节点未运行'}</span>
        </div>

        {/* Save Map Inputs */}
        <form onSubmit={handleSaveMap} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, fontSize: 12 }}
            value={mapSaveName}
            onChange={(e) => setMapSaveName(e.target.value)}
            placeholder="地图保存名称..."
          />
          <button
            type="submit"
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: 12 }}
          >
            {savedSuccess ? <Check size={14} color="#10b981" /> : <Save size={14} />}
            <span>{savedSuccess ? '已保存' : '保存'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
