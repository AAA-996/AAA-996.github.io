# Noah Zheng · 个人主页

一个**零依赖、无需构建**的双语个人主页：终端 / ASCII 美学，核心是一块用等宽字符实时渲染的 3D 光环（Canvas + 手写投影矩阵），配上启动自检、`⌘K` 命令面板、明暗双主题和一条实时状态栏。

纯静态文件，推到 GitHub Pages 就能跑。

```
personal-site/
├─ index.html                 页面结构 + 中英文案（文字都在这里）
├─ assets/
│  ├─ css/style.css           样式：配色、排版、动效、中文字体回退
│  └─ js/
│     ├─ data.js              ★ 项目 / 技能 / 联系方式 / 元信息，日常只改这个
│     └─ app.js               行为：光环渲染、打字机、命令面板、语言切换…
└─ .nojekyll                  GitHub Pages 用，别删
```

---

## 1. 本地预览

直接**双击 `index.html`** 就能打开（用的是普通 `<script>`，`file://` 下不会报跨域错误）。

想更接近线上效果，起个本地服务器：

```bash
python -m http.server 8000     # 然后打开 http://localhost:8000
```

- 首次进入有 1 秒多的「启动自检」，按任意键跳过；网址后加 `?noboot=1` 可完全跳过。
- 右上角圆点切明暗主题（快捷键 `T`）。

---

## 2. 语言：中文 / English

- 默认中文，右下角状态栏那个不起眼的 **中 / EN** 就是开关；也可以按 `L`，或在 `⌘K` 命令面板里搜「切换语言」。选择会记在浏览器里。
- 静态文案在 `index.html` 里是**成对出现**的：

  ```html
  <p class="lede">
    <span lang="zh">中文那段</span>
    <span lang="en">English paragraph</span>
  </p>
  ```

  CSS 只显示当前语言那一份，所以**改文案时两段都要改**（复制一份翻译即可）。

- 列表类内容（项目、技能、社交链接）在 `data.js` 里，写成 `{ zh: '…', en: '…' }`，页面会自动渲染两份并跟随切换。
- 想把默认语言改成英文：在 `app.js` 里搜 `var initial = stored === 'en' || stored === 'zh' ? stored : 'zh';`，把最后的 `'zh'` 改成 `'en'`。

---

## 3. 改内容

### 3.1 `assets/js/data.js`（日常主要改这里）

| 位置 | 作用 |
| --- | --- |
| `identity.name` / `handle` | 页面上的署名与 `@AAA-996` 标识 |
| `identity.email` | 主邮箱：首页「复制邮箱」、联系区大字、`mailto:` 都用它 |
| `identity.emailAlt` | 备用邮箱（显示在联系区列表） |
| `identity.coordinates` | 状态栏那个坐标/时区 |
| `hero.phrases.zh / .en` | 首页循环的打字短句，两个语言各一组 |
| `work[]` | 项目列表，见下 |
| `stack[]` | 技能分组，`items` 可以是字符串或 `{zh,en}` |
| `socials[]` | 联系方式 |
| `ticker[]` | 首页底部跑马灯 |
| `meta.title / .description` | 浏览器标签、分享标题（切语言会一起换） |

**项目条目字段：**

```js
{
  title: { zh: '…', en: '…' },
  year: '2025 — 2026',
  kind:  { zh: '电控 · 嵌入式', en: 'ELECTRONICS · EMBEDDED' },
  blurb: { zh: '…', en: '…' },
  tags: ['C', 'STM32'],                       // 技术名词不用翻译
  links: [                                    // 1～3 个都能放
    { label: { zh: '主仓库', en: 'REPOSITORY' }, href: 'https://…' },
    { label: { zh: '工程机器人分支', en: 'ENGINEER BRANCH' }, href: 'https://…/tree/Engineer' },
  ],
  private: true,          // 仓库还是私有的时候留着，会显示「私有仓库」小标
  status: { zh: '…', en: '…' },   // 没有 links 时显示的替代文字
}
```

> **现在 `private: true` 出现在前两个项目上**——那两个仓库对外是 404，标记一下访客不会以为链接坏了。
> 等仓库改成 public，把这行删掉即可。

### 3.2 `index.html`（长句子）

搜这些位置：`<p class="lede">`（首页自我介绍）、`#about` 里的 `.about-lead` 和两段 `<p>`、`.about-list`、`.contact-lede`、各区块的 `.panel-title` 和 `.panel-label`。**中英各一份 `<span>`，两段一起改。**

### 3.3 配色（`assets/css/style.css` 顶部）

```css
:root {               /* 深色主题 */
  --bg: #0a0b08; --ink: #e8e6d9; --accent: #d2793f;  ...
}
[data-theme="paper"] { /* 浅色主题，T 键切换 */ }
```

光环的字符颜色读的是 `--t1`～`--t5`（`--t5` 是橙色点缀）。中文字体走 `--mono` 里排在 `monospace` 之前的几个中文回退（苹方 / 微软雅黑 / Noto）。

---

## 4. 发布到 GitHub Pages

> 用户名是 **`AAA-996`**（三个 A），所以用户主页仓库必须叫 **`AAA-996.github.io`**。
> 仓库名大小写不敏感，但请照这个写法建；最终网址会显示成全小写 `https://aaa-996.github.io/`。

1. 新建**公开**仓库，名字填 `AAA-996.github.io`（多一个少一个 A 都会变成一个普通项目页，地址就带 `/仓库名/` 了）。
2. 上传 `index.html`、`assets/`、`.nojekyll`：

   ```bash
   cd personal-site
   git init && git add -A && git commit -m "personal site"
   git branch -M main
   git remote add origin https://github.com/AAA-996/AAA-996.github.io.git
   git push -u origin main
   ```

3. 仓库 **Settings → Pages** → Source 选 **Deploy from a branch** → Branch **main** / **/ (root)** → Save。
4. 等 1–2 分钟，访问 <https://aaa-996.github.io/>。

想放在别的仓库名下（地址变成 `…/仓库名/`）也可以——站内全是相对路径，不会白屏。

**换自定义域名**：根目录加 `CNAME` 文件写一行域名 → 域名商加 CNAME 指向 `aaa-996.github.io` → Settings → Pages 填域名并勾选 Enforce HTTPS。

日常更新：`git add -A && git commit -m "update" && git push`。

---

## 5. 交互一览

| 操作 | 效果 |
| --- | --- |
| `⌘K` / `Ctrl+K` / `/` | 命令面板：跳转、复制邮箱、切主题、切语言 |
| `T` | 深色 / 浅色主题 |
| `L` | 中 / 英切换 |
| 鼠标移到首页 | 光环轻微倾斜；点击炸开一圈字符 |
| `Esc` | 关闭命令面板 |

已经处理好的：响应式（≥1100px 左文右环，以下改为下方地平线构图）、`prefers-reduced-motion` 下关闭全部动效、键盘可达与可见焦点框、离开首屏或切后台自动停掉 `requestAnimationFrame`。

---

## 6. 上线前检查

- [ ] `data.js` 里的 `private: true` 是否还需要保留
- [ ] 两个邮箱是否写对（`zbinhr0831@gmail.com` / `zymhxrx_2025@qq.com`）
- [ ] 项目描述里的事实是否准确（那两条分支具体做了什么，我按仓库名推测的，建议你核对一遍）
- [ ] 手机上看一遍导航、项目列表、联系区有没有溢出
- [ ] `index.html` 的 `<title>` / `<meta name="description">`（中英两份都在 `data.js` 的 `meta` 里，切语言会自动换）
