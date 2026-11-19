import React, { useState } from 'react';
import { Check, Play, Save, Square } from 'lucide-react';
import {
  Button,
  Card,
  FormField,
  Input,
  StatusBadge,
  useAbcConfig
} from '@abc-design/react';
import { rosService } from '../services/rosService';

export default function MappingControl({ isRunning }) {
  const { toast } = useAbcConfig();
  const [mapSaveName, setMapSaveName] = useState('my_room_map');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveMap = (e) => {
    e.preventDefault();
    const clean = mapSaveName.trim();
    if (!clean) {
      toast.warning('请输入要保存的地图名称');
      return;
    }
    const ok = rosService.saveMap(clean);
    if (ok) {
      setSavedSuccess(true);
      toast.success(`栅格地图「${clean}」已保存并加入地图库`);
      setTimeout(() => setSavedSuccess(false), 2200);
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
            toast.info(isRunning ? '已停止 SLAM 建图节点' : '已启动 SLAM 建图节点');
          }}
        >
          {isRunning ? '停止 SLAM 建图' : '开始 SLAM 建图'}
        </Button>

        <form onSubmit={handleSaveMap} className="space-y-1.5">
          <FormField label="持久化当前栅格地图">
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
                variant={savedSuccess ? 'success' : 'outline'}
                leftIcon={
                  savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />
                }
              >
                {savedSuccess ? '已存' : '保存'}
              </Button>
            </div>
          </FormField>
        </form>
      </div>
    </Card>
  );
}
