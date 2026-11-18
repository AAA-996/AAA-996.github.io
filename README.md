# Noah Zheng · 个人主页

**黑白**、双语的个人主页。首屏是一个用**真实文本**实时渲染的**黑洞**：组成它的每一个字符都取自《查拉图斯特拉如是说》序言（Thomas Common 英译），字符不断向视界塌陷，你可以在盘面和光环上读到原文的句子。三个项目**环绕在黑洞周围**；点开任意一个，**整屏覆盖**显示详情——黑洞挪到右边、由小长大，不是往下滚，也不离开这个页面。

零依赖、无需构建，纯静态文件，GitHub Pages 直接托管。

```
personal-site/
├─ index.html                 页面结构（文字都在这里，中英各一份）
├─ assets/
│  ├─ css/style.css           样式：黑白配色、排版、黑洞外的所有视觉
│  ├─ js/
│  │  ├─ text.js              黑洞里那段文本（可整段替换）
│  │  ├─ data.js              ★ 项目 / 技能 / 联系方式，日常只改这个
│  │  └─ app.js               行为：黑洞渲染、轨道、项目覆盖页、语言切换
│  └─ img/
│     └─ README.md            怎么给项目加截图
└─ .nojekyll                  GitHub Pages 用
```

---

## 1. 页面是怎么组织的

| 位置 | 内容 | 怎么改 |
| --- | --- | --- |
| 首屏中央 | ASCII 黑洞 | `app.js` 里的 `initField()`（见第 5 节） |
| 黑洞周围 | 3 个项目节点 | `data.js` → `work[]`，改几个就绕着排几个 |
| 点开项目 | 整屏覆盖页 | 内容全部来自 `data.js` 的同一个项目对象 |
| 往下滚 | 关于 / 技术栈 / 联系 | `index.html` 的对应 `<section>` |

节点环绕的规则：桌面端按「左 / 右 / 下」三个方向摆放，笔记本和手机上自动改成黑洞在上、项目竖排在下的布局。

---

## 2. 加图片（你要的那块）

1. 把图片丢进 `assets/img/项目名/`；
2. 在 `data.js` 里那个项目的 `images` 填路径：

   ```js
   images: [
     'assets/img/robomaster/board.jpg',
     'assets/img/robomaster/robot.jpg',
   ],
   ```

3. 刷新，点开项目就能看到。

**留空 `images: []` 的时候，页面上完全不存在图片区**——没有占位框、没有间距、没有边框，文字和标签是紧挨着的。加了一张图，图片区才凭空出现（16:10 裁切、桌面两列、手机单列，默认灰度、鼠标悬停恢复彩色）。

路径写错不会出现破图标：那张图会被自动丢掉；全都失效时整个图片区也不显示。细节见 `assets/img/README.md`。

---

## 3. 改内容

### `assets/js/data.js`（主要改这里）

| 字段 | 作用 |
| --- | --- |
| `identity.name` / `handle` / `email` | 署名、@标识、主邮箱 |
| `identity.coordinates` | 状态栏那个坐标 |
| `hero.phrases.zh / .en` | 首屏循环的打字短句 |
| `work[]` | 项目：`title` `short` `year` `kind` `blurb` `tags` `images` `links` `private` `status` |
| `stack[]` | 技能分组 |
| `socials[]` | 联系方式 |
| `ticker[]` | 底部跑马灯 |
| `meta.title / .description` | 浏览器标签 / 分享标题（切语言会跟着换） |

其中 `short` 是环绕节点上显示的短名字（2–6 个字），`title` 是覆盖页的大标题。

`private: true` 会在覆盖页顶部标出「私有仓库」，并在底部提示访问者链接会 404。仓库转公开后把这行删掉。

### `index.html`（长句子）

搜 `class="lede"`、`#about` 里的 `.about-lead`、`.contact-lede`。**中文和英文是两段 `<span lang="zh">` / `<span lang="en">`，改的时候两段一起改。**

### 配色

纯黑白，全部在 `assets/css/style.css` 顶部：

```css
:root { --bg:#0a0a0a; --ink:#f2f2f2; --muted:#7d7d7d; }
[data-theme="paper"] { --bg:#f2f2f0; --ink:#0f0f0f; }   /* T 键切换 */
```

黑洞的字符亮度读 `--t1`～`--t5`（暗 → 亮）。想让它偏冷或偏暖，把这 5 个值换成带一点色相的灰即可。

---

## 4. 交互

| 操作 | 效果 |
| --- | --- |
| 点黑洞周围的项目 | 整屏覆盖打开详情 |
| `←` `→` / 「上一个 / 下一个」 | 在覆盖页里切换项目 |
| `Esc` / 右上角 `✕` | 关闭覆盖页，回到黑洞 |
| `⌘K` / `Ctrl+K` / `/` | 命令面板（可搜项目名直接打开） |
| `T` / `L` | 切换明暗 / 中英文 |
| 移动鼠标 | 黑洞随视角轻微偏移，点击炸开字符 |

**覆盖页里也有动画**（和首页同一套语言，但更安静）：

- 每一块内容依次上浮淡入（标题 0.02s、正文 0.09s…标签 0.36s），**切换项目时会重播**；
- 背后是一层 240 个字符的星场，缓慢漂移、各自闪烁、随鼠标视差；浅色主题下自动减半，避免像脏点；
- 右下角的大号数字会跟着鼠标反向偏移；
- 整个弹层打开时从下方 10px 淡入。

> 弹层是浏览器最顶层的 `<dialog>`，会盖住自定义准星，所以**一进去就交还系统鼠标**（否则会出现「没有鼠标」的情况）。这一条是刻意的，不是 bug。

无障碍：覆盖页是原生 `<dialog>`（焦点被困在里面、`Esc` 天生可用）；`prefers-reduced-motion` 下所有动画停止，只画静态一帧。

---

## 5. 改黑洞本身

### 换掉那段文字

黑洞里所有字符都来自 `assets/js/text.js` 的 `body`：

```js
window.HOLE_TEXT = {
  title: 'THUS SPAKE ZARATHUSTRA',
  body: 'I TEACH YOU THE SUPERMAN. Man is something that is to be surpassed. …',
};
```

整段换掉即可——**用任何一段话都行**（中文也可以，只要你的等宽字体能显示）。换完：

- 盘面上的字符会按顺序抽取这段文字，光环上则是连续的一小段，可以直接读；
- 字数越多，滚过一轮越慢；几百字左右观感最好。

默认用的是《查拉图斯特拉如是说》序言里讲「over-going / down-going」的那几段（Thomas Common 英译，1909，公有领域），正好对上「往下走才越得过去」这个意象。

### 参数

都在 `assets/js/app.js` 的 `createHole()` 里：

| 参数 | 含义 | 现在 |
| --- | --- | --- |
| `place` | 黑洞位置与半径 | 首页居中下方；项目页在右侧 0.75 处 |
| `FLAT` | 吸积盘扁平度 | `0.34` |
| `count` | 粒子（字符）数 | 手机 820 / 桌面 2600 |
| `p.r -= (0.012 + 0.05 * …)` | 向内塌陷的速度 | 越靠近视界越慢 |
| `ringCount` | 光环上排多少字 | 手机 70 / 桌面 104 |
| `SIZES` | 三档字号 | `[9, 12, 15]` |

首页每次加载（以及从项目页返回）都会播放一次「整体塌陷」动画：字符从外围落进视界，1.4 秒落定。

---

## 6. 部署（已经上线，这里是如何更新）

线上地址：<https://aaa-996.github.io/>，仓库：`AAA-996/AAA-996.github.io`。

改了文件之后：

1. 打开 <https://github.com/AAA-996/AAA-996.github.io>
2. **Add file → Upload files**，把这几个拖进去（覆盖同名文件）：`index.html`、`assets/css/style.css`、`assets/js/app.js`、`assets/js/data.js`
3. **Commit changes**，等 30 秒刷新页面

也可以命令行：

```bash
cd personal-site
git add -A && git commit -m "update" && git push
```

Pages 设置**不用再动**：Source = *Deploy from a branch*，分支 `main`，目录 `/ (root)`。

> 图片是例外：`assets/img/` 下新增的图片也要一起上传，否则覆盖页里是空的（不会报错）。

---

## 7. 常见问题

**黑洞不动 / 只有一帧？**
系统开了「减少动态效果」时会主动只渲染静态画面。

**项目节点位置有点偏？**
`layoutOrbit()` 里的 `rx`（水平半径）和 `ry` 决定环绕范围；`base` 数组决定三个方向（默认左、右、下）。

**想加第四个、第五个项目？**
在 `work[]` 里加对象就行，节点会自动多出来；超过 3 个时建议把 `base` 改成按角度均分（`paintOrbit` 里已经留了取模的逻辑）。

**字体？**
Google Fonts 的 JetBrains Mono，失败会回落到系统等宽字体；中文走苹方 / 微软雅黑 / Noto。
