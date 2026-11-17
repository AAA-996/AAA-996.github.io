# 图片放这里

给项目加截图的完整步骤（30 秒）：

1. 在 `assets/img/` 下建一个文件夹，比如 `robomaster/`，把图片拷进去（jpg / png / webp 都行，建议宽度 ≥ 1200px）。
2. 打开 `assets/js/data.js`，找到那个项目的 `images: []`，把路径写进去：

   ```js
   images: [
     'assets/img/robomaster/board.jpg',
     'assets/img/robomaster/robot.jpg',
   ],
   ```

3. 刷新页面，点开项目就能看到。

细节：

- **留空 `images: []` 时，详情页完全不会出现图片区**——没有占位框、没有多余留白，什么都没有。
- 图片按 16:10 裁切、两列排（手机上单列）；点开是灰度，鼠标移上去恢复彩色。
  想去掉灰度效果，改 `assets/css/style.css` 里 `.pv-media img` 的 `filter: grayscale(1)` → `filter: none`。
- 路径写错不会显示破图标，那张图会被自动丢掉；如果所有图都失效，整个图片区也不显示。
- 路径用**相对路径**（`assets/img/...`），开头不要加 `/`，否则发布到子目录会 404。
