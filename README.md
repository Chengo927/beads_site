# 拼豆在线设计工具（beads_site）

一个纯前端的拼豆（Perler/Artkal）设计工具，目标是让用户可以在网格画布上点豆、导入图片自动转拼豆图，并可保存/导出作品。

## 开发准则
- 任何代码更新前都必须先阅读本 README，确保理解现有方向、防止重复工作，并据此调整提案或实现。

## 目标功能（MVP）

### 1. 画布与网格（Canvas）
- 显示 `W x H` 的格子画布（默认可设为 `58 x 58`，可调整）
- 每个格子对应一颗拼豆
- 网格线可显示/隐藏（建议默认显示）
- 缩放/平移：
  - MVP 可先不做
  - 预留接口用于后续加 `zoom` / `pan`

### 2. 颜色与点豆
- 内置调色板（建议 30~60 种常用拼豆色）
- 交互：
  - 单击格子：上色
  - 按住拖拽：连续涂色
  - 橡皮擦模式：清空格子
- 当前颜色高亮显示

### 3. 图片转拼豆图（Image → Grid）
纯前端实现，不依赖后端。

流程：
1. 用户上传图片（`<input type="file">`）
2. 将图片缩放到目标网格尺寸 `W x H`
3. 读取每个像素 `RGB`
4. 在拼豆调色板中找到最接近颜色（欧氏距离/最近邻）
5. 写入网格数据并重绘画布

颜色映射公式（RGB 欧氏距离）：

```text
distance = (r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2
```

选择 `distance` 最小的调色板颜色作为目标格颜色。

### 4. 保存与导出
- 自动保存：`localStorage`（最近一次作品）
- 导出 JSON：包含尺寸、调色板、网格数据
- 导出 PNG：将画布导出图片
- 进阶：导出“用料表”（每种颜色使用数量统计）

## 推荐技术方案（前端）

- 框架：可选原生 JS / Vue / React（当前仓库可先用最轻量方式起步）
- 渲染：`HTML Canvas 2D`
- 状态管理（MVP）：组件内状态 + 本地存储
- 文件处理：`FileReader` + 离屏 `canvas`
- 持久化：`localStorage`

## 核心数据结构（建议）

```ts
type RGB = { r: number; g: number; b: number };

type PaletteColor = {
  id: string;          // 颜色唯一标识
  name: string;        // 显示名称
  hex: string;         // 例如 #FFAA33
  rgb: RGB;
};

type GridCell = {
  colorId: string | null;  // null 表示空格（未放豆）
};

type ProjectData = {
  version: number;
  width: number;
  height: number;
  palette: PaletteColor[];
  grid: GridCell[];        // 一维数组，长度 = width * height
  updatedAt: string;
};
```

索引换算：

```ts
const index = y * width + x;
```

## 交互细节（建议）

- 鼠标按下开始绘制，移动时若在新格子上则持续上色
- 鼠标抬起结束绘制
- 防止重复写入同一格导致性能浪费（记录上次涂色坐标）
- 橡皮擦本质是把 `colorId` 设为 `null`

## 图片转网格的实现要点

- 使用离屏 `canvas` 把上传图缩放到 `W x H`
- `getImageData(0, 0, W, H)` 获取像素
- 逐像素映射到调色板颜色
- 可选优化（后续）：
  - 颜色缓存（相同 RGB 直接复用映射结果）
  - 抖动算法（Floyd–Steinberg）提升视觉层次

## 导出格式

### JSON（示例）

```json
{
  "version": 1,
  "width": 58,
  "height": 58,
  "palette": [],
  "grid": [],
  "updatedAt": "2026-03-02T00:00:00.000Z"
}
```

### PNG
- 使用主画布或导出专用画布
- `canvas.toDataURL("image/png")` 或 `canvas.toBlob(...)`

### 用料表（进阶）
- 遍历 `grid`
- 按 `colorId` 计数
- 导出为 JSON/CSV 或在页面展示

## 分阶段开发计划

### Phase 1（你现在要做的最小可用版）
- 固定尺寸网格（默认 58x58）
- 调色板 + 单击/拖拽上色 + 橡皮擦
- `localStorage` 自动保存/恢复

### Phase 2
- 图片上传并转拼豆图（RGB 最近邻）
- 导出 JSON / 导出 PNG

### Phase 3（增强）
- 用料表统计
- 缩放/平移
- 更多调色板与颜色管理

## 验收标准（MVP）

- 用户能在网格上流畅点豆与拖拽涂色
- 刷新页面后能恢复最近作品
- 上传图片后可自动生成拼豆图
- 可导出 JSON 与 PNG

---

如果你确认这版 README 方向没问题，下一步可以直接开始 `Phase 1` 的页面和数据结构实现。
