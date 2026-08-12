import React from 'react';

export default function LayerControl({ layers, onToggleLayer }) {
  const layerItems = [
    { key: 'showMap', label: '显示地图' },
    { key: 'showCostmap', label: '显示代价地图' },
    { key: 'showScan', label: '显示激光' },
    { key: 'showRobot', label: '显示机器人' },
    { key: 'showPath', label: '显示路径' },
    { key: 'showGoal', label: '显示目标点' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span>图层控制</span>
      </div>

      <div className="card-body">
        {layerItems.map((item) => (
          <div className="switch-item" key={item.key}>
            <span>{item.label}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={layers[item.key]}
                onChange={() => onToggleLayer(item.key)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
