# Noah Zheng · 个人主页

**黑白**、双语的单屏主页：正中一个用**真实文本**渲染的黑洞，组成它的每个字符都取自《查拉图斯特拉如是说》序言（Thomas Common 英译）；字符不断向视界塌陷，视界里还漂着少量字符形成层次。技术栈以极小字号绕着黑洞缓慢旋转，两个项目停在左右两侧——**点开就整屏覆盖**，黑洞挪到右边、由小长大。

页面**不滚动**：一屏就是全部。零依赖、无需构建，GitHub Pages 直接托管。

```
personal-site/
├─ index.html                 页面结构
├─ assets/
│  ├─ css/style.css           样式
│  ├─ js/
│  │  ├─ text.js              黑洞里那段文本（可整段替换）
│  │  ├─ data.js              ★ 项目 / 技术栈 / 联系方式
│  │  └─ app.js               行为：黑洞、环绕、覆盖页、语言
│  └─ img/                    项目截图（详见里面的 README）
└─ .nojekyll
```

---

## 1. 页面结构

| 位置 | 内容 | 怎么改 |
| --- | --- | --- |
| 正中 | 黑洞（文本塌陷 + 视界内少量字符） | `app.js` 的 `createHole()`，第 5 节 |
| 整个背景 | 以黑洞为中心缓慢公转的星场 | 同上，`makeStars()` |
| 黑洞左右 | 两个项目节点 | `data.js` → `work[]` |
| 黑洞外圈 | 技术栈小字，缓慢旋转 | `data.js` → `stack[]`（每组取前两项） |
| 点开项目 | 整屏覆盖页 | 同一个项目对象的内容 |
| 顶栏 | 邮箱 / 主题 / `⌘K` | `index.html` |
| 底部 | 状态栏（坐标、字符数、中/EN、时间） | `index.html` |

没有第二屏——`body` 锁了滚动，所有内容都在弹层里。

---

## 2. 加图片

1. 图片丢进 `assets/img/项目名/`；
2. 在 `data.js` 的项目里填 `images: ['assets/img/项目名/1.jpg']`。

**留空 `images: []` 时，页面上完全不存在图片区**——没有占位、没有边框、没有间距。加了图才凭空出现（16:10 裁切、桌面两列、手机单列、默认灰度、悬停恢复彩色）。路径写错不会出现破图标，那张图会被自动丢掉。

---

## 3. 改内容

### `assets/js/data.js`

| 字段 | 作用 |
| --- | --- |
| `identity.name / handle / email` | 署名、@标识、邮箱（顶栏和 ⌘K 都用它） |
| `hero.phrases.zh / .en` | 名字下面循环的打字短句 |
| `work[]` | 项目；`sections[]` 用来在详情页里再分块（现在的「项目」就是这样装两个子项目的） |
| `stack[]` | 技术栈；每组前两项会出现在环绕的小字里 |
| `socials[]`、`ticker[]` | 目前页面已不使用，留着备用 |
| `meta.title / .description` | 浏览器标签、分享标题（切语言会跟着换） |

项目的 `sections` 长这样：

```js
sections: [
  {
    title: { zh: '子项目 A', en: 'Sub A' },
    meta:  { zh: '2025 · 电控', en: '2025 · ELECTRONICS' },
    blurb: { zh: '…', en: '…' },
    tags: ['C', 'STM32'],
    links: [{ label: { zh: '主仓库', en: 'REPOSITORY' }, href: 'https://…' }],
  },
]
```

`private: true` 会在详情页标出「私有仓库」，并提示访问者链接会 404。

### 文案

`index.html` 里的中文/英文是两段 `<span lang="zh">` / `<span lang="en">`，改的时候两段一起改。

### 配色

`assets/css/style.css` 顶部：

```css
:root { --bg:#0a0a0a; --ink:#f2f2f2; --muted:#7d7d7d; }
[data-theme="paper"] { --bg:#f2f2f0; --ink:#0f0f0f; }   /* T 键切换 */
```

黑洞的字符亮度读 `--t1`～`--t5`（暗 → 亮）。

---

## 4. 交互

| 操作 | 效果 |
| --- | --- |
| 点项目节点 | 整片字符螺旋塌缩成一个亮点（同时黑洞漂到右侧），再从那一点绽放回来，左侧文字跟着浮现——全程约 1.5 秒，既没有跳转也没有黑屏 |
| `←` `→` | 在项目之间切换 |
| `Esc` / `✕` / 点空白 | 关闭，回到首页（黑洞重新塌陷一次） |
| `⌘K` / `/` | 命令面板：开项目、复制邮箱、切主题、切语言 |
| `T` / `L` | 明暗 / 中英 |

弹层是原生 `<dialog>`（焦点被困住、`Esc` 天生可用）。因为它处在浏览器最顶层，进去之后会把自定义准星藏起来、交还系统鼠标——否则会出现「没有鼠标」。

`prefers-reduced-motion` 下所有动画停止，只画静态一帧。

---

## 5. 改黑洞

### 换文本

黑洞里的字符全部来自 `assets/js/text.js` 的 `body`，整段替换即可（中英文都行）：

```js
window.HOLE_TEXT = { body: 'I TEACH YOU THE SUPERMAN. Man is something that is to be surpassed. …' };
```

盘面上的字符按顺序抽取这段文字，光环上则是连续的一小段（上下对称，两边都读得通）。

### 参数

都在 `assets/js/app.js` 的 `createHole()`：

| 参数 | 含义 | 现在 |
| --- | --- | --- |
| `place()` | 黑洞的基准位置与半径 | 首页居中偏下 |
| `setShift(dx, dy, s)` | 直接跳到目标位移（关闭 / 减弱动效时用） | — |
| `collapseTo(v, ms)` | 螺旋塌缩 / 绽放（1 = 全部落进中心） | 开：`1` 640ms → `0` 900ms |
| `glideTo(dx, dy, s, ms)` | 位移 + 缩放到落位 | `0.25, -0.07, 0.93` |
| `FLAT` | 吸积盘扁平度 | `0.34` |
| `count` | 盘面字符数 | 手机 820 / 桌面 2600 |
| `stars` | 背景星场字符数（绕洞公转） | 手机 170 / 桌面 430 |
| `makeInner()` | 视界内那几颗字符 | 手机 26 / 桌面 58 |
| 塌陷速度 | `p.r -= (0.012 + 0.05 * …)` | 越靠近视界越慢 |
| `ringCount` | 光环上排多少字 | 手机 70 / 桌面 104 |

首页每次加载、以及从项目页返回，都会播一次「整体塌陷」。

---

## 6. 部署

线上：<https://aaa-996.github.io/>，仓库 `AAA-996/AAA-996.github.io`。

改完文件后：仓库 → **Add file → Upload files** → 覆盖 `index.html`、`assets/css/style.css`、`assets/js/app.js`、`assets/js/data.js`（改过 `text.js` 也要传）→ **Commit changes**，30 秒后刷新。

Pages 设置不用再动：Source = *Deploy from a branch*，`main` + `/ (root)`。

---

## 7. 常见问题

**页面滚不动了？** 对，首页锁了一屏；内容都在弹层里滚动。

**文字太小看不清？** 那是「技术栈环绕」故意的 9px，改 `.stack-word` 的 `font-size` 就行。

**想加第三个项目？** 在 `work[]` 里加一个对象，节点会自动多出来（`layoutOrbit` 里按角度分摊）。

**黑洞不动？** 系统开了「减少动态效果」时只渲染静态一帧。
