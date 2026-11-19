import React, { useState } from 'react';
import { Check, Download, Play, Save, Square } from 'lucide-react';
import {
  Button,
  Card,
  FormField,
  Input,
  StatusBadge,
  Tooltip,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function MappingControl({ isRunning }) {
  const { toast } = useAbcConfig();
  const [mapSaveName, setMapSaveName] = useState('my_room_map');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveMap = async (e) => {
    e.preventDefault();
    const clean = mapSaveName.trim();
    if (!clean) {
      toast.warning('请输入要保存的地图名称');
      return;
    }

    setSaving(true);
    try {
      const res = await rosService.saveMap(clean);
      if (res?.ok) {
        setSavedSuccess(true);
        const msg =
          res.mode === 'nav2'
            ? `已通过 Nav2 map_saver 保存地图「${clean}」`
            : res.mode === 'slam_toolbox'
              ? `已通过 slam_toolbox 保存地图「${clean}」`
              : `栅格地图「${clean}」已保存并加入地图库`;
        toast.success(msg);
        setTimeout(() => setSavedSuccess(false), 2200);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportFiles = () => {
    const clean = mapSaveName.trim() || 'bot_map';
    const ok = rosService.exportCurrentMapFiles(clean);
    if (ok) {
      toast.success(`已导出 ${clean}.pgm 与 ${clean}.yaml`);
    } else {
      toast.warning('当前暂无可导出的栅格地图数据');
    }
  };

  return (
    <Card
      size="sm"
      padding="sm"
      title="SLAM 建图控制"
      extra={
        <StatusBadge
          status={isRunning ? 'running' : 'stopped'}
          label={isRunning ? '建图中' : '未运行'}
        />
      }
    >
      <div className="space-y-3">
        <Button
          size="sm"
          variant={isRunning ? 'danger' : 'primary'}
          block
          leftIcon={isRunning ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          onClick={() => {
            rosService.toggleMappingMode();
            toast.info(
              isRunning
                ? '已停止 SLAM 建图，可保存或导出地图'
                : '已开启 SLAM 建图：请使用摇杆或 WASD 移动探索环境'
            );
          }}
        >
          {isRunning ? '停止 SLAM 建图' : '开始 SLAM 建图'}
        </Button>

        <form onSubmit={handleSaveMap} className="space-y-1.5">
          <FormField label="持久化保存 / 导出 ROS 标准地图 (.pgm + .yaml)">
            <div className="flex items-center gap-1.5">
              <div className="min-w-0 flex-1">
                <Input
                  size="sm"
                  value={mapSaveName}
                  onChange={(e) => setMapSaveName(e.target.value)}
                  placeholder="输入地图保存名称..."
                  allowClear
                />
              </div>
              <Button
                type="submit"
                size="sm"
                loading={saving}
                variant={savedSuccess ? 'success' : 'outline'}
                leftIcon={
                  savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />
                }
              >
                {savedSuccess ? '已存' : '保存'}
              </Button>
              <Tooltip content="下载当前栅格地图为标准 ROS .pgm 与 .yaml 文件">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="导出 PGM 与 YAML 地图文件"
                  onClick={handleExportFiles}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </div>
          </FormField>
        </form>
      </div>
    </Card>
  );
}
