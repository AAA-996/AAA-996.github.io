/* ═══════════════════════════════════════════════════════════════════════════
   data.js — 改这一个文件，全站内容都会跟着变
   ---------------------------------------------------------------------------
   中英双语规则：所有需要翻译的文字都写成 { zh: '中文', en: 'English' }。
   index.html 里的静态文案是「中英各一份 span」，改那边的时候两段都要改；
   列表类内容（项目 / 技能 / 社交）只在这里改，页面会自动渲染。
   ═══════════════════════════════════════════════════════════════════════════ */

window.CONFIG = {
  /* ── 1. 身份 ───────────────────────────────────────────────────────────── */
  identity: {
    name: 'NOAH ZHENG',
    handle: '@AAA-996',
    // 主邮箱：首页「复制邮箱」按钮、联系区大字、mailto 都用它
    email: 'zbinhr0831@gmail.com',
    // 备用邮箱，只出现在联系区列表里
    emailAlt: 'zymhxrx_2025@qq.com',
    coordinates: 'CN · UTC+8',
  },

  /* ── 2. 首页打字机短句（中英各一组，循环播放） ───────────────────────────── */
  hero: {
    phrases: {
      zh: ['在学电控。', '在画板子。', '在调电机。', '在修 bug。'],
      en: ['learning electronics.', 'routing boards.', 'tuning motors.', 'fixing bugs.'],
    },
  },

  /* ── 3. 项目 ──────────────────────────────────────────────────────────────
     每个项目在首页黑洞周围有一个节点，点开是整屏覆盖的详情页。

     title  详情页大标题（也是节点的长标题）
     short  黑洞周围的小标题，越短越好，2–6 个字
     images 图片数组：['assets/img/xxx/1.jpg', …]
            ★ 留空就是「没有图片」——页面上不会有任何占位、留白或边框。
            放进第一张图，详情页就自动出现图片区（自适应两列/单列）。
     ──────────────────────────────────────────────────────────────────────── */
  work: [
    {
      title: { zh: '项目', en: 'Projects' },
      short: { zh: '项目', en: 'Projects' },
      year: '2025 — 2026',
      kind: { zh: 'RoboMaster · 电控与固件', en: 'ROBOMASTER · ELECTRONICS & FIRMWARE' },
      blurb: {
        zh: '两段并行的工程记录：一条是从最小系统板到整车主控的电控链路，一条是 H7 主控与 DM 电机的通信固件。都还在私有仓库里，下面是它们各自的样子。',
        en: 'Two engineering logs running in parallel: an electronics path from minimum-system board to a full robot controller, and STM32H7 firmware for the DM motor link. Both are private for now.',
      },
      tags: ['C', 'STM32', 'CAN', 'MOTOR'],
      private: true,
      images: [],
      // 详情页里按顺序展开的子项目
      sections: [
        {
          title: { zh: 'RoboMaster 电控学习历程', en: 'RoboMaster Electronics Log' },
          meta: { zh: '2025 — 2026 · 电控 · 嵌入式', en: '2025 - 2026 · ELECTRONICS · EMBEDDED' },
          blurb: {
            zh: '从最小系统板到整车主控的记录：电源、CAN、PWM、电机驱动，按机器人角色拆成两条分支迭代——工程机器人与步兵。每条分支都对应一次完整的上车验证，不是纸上谈兵。',
            en: 'A log that runs from the first minimum-system board to a full robot controller: power, CAN, PWM, motor drivers. Iterated along two roles - engineer and infantry - with each branch validated on a real robot.',
          },
          tags: ['C', 'STM32', 'CAN', 'POWER'],
          links: [
            { label: { zh: '主仓库', en: 'REPOSITORY' }, href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey' },
            { label: { zh: '工程机器人分支', en: 'ENGINEER BRANCH' }, href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey/tree/Engineer' },
            { label: { zh: '步兵分支', en: 'INFANTRY BRANCH' }, href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey/tree/PassHole_Infantry' },
          ],
        },
        {
          title: { zh: 'lnk-DMh7 · H7 主控与 DM 电机链路', en: 'lnk-DMh7 · H7 Controller & DM Motor Link' },
          meta: { zh: '2026 · 固件 · 通信', en: '2026 · FIRMWARE · COMMS' },
          blurb: {
            zh: '基于 STM32H7 的主控与 DM 电机通信链路：把反馈解析、控制指令和安全保护串成一条可复现的通路。fix 分支专门处理异常与边界情况——掉电、丢帧、堵转，以及那些只在赛场上出现一次的问题。',
            en: 'An STM32H7 controller and DM motor link: feedback parsing, command output and safety checks on one reproducible path. The fix branch is dedicated to fault handling - brownouts, dropped frames, stalls, and the ones that only happen once on the field.',
          },
          tags: ['STM32H7', 'CAN', 'MOTOR CONTROL'],
          links: [
            { label: { zh: '主仓库', en: 'REPOSITORY' }, href: 'https://github.com/AAA-996/lnk-DMh7' },
            { label: { zh: '修复分支', en: 'FIX BRANCH' }, href: 'https://github.com/AAA-996/lnk-DMh7/tree/fix/safety-and-bugs' },
          ],
        },
      ],
    },
    {
      title: { zh: '这个网站', en: 'This Site' },
      short: { zh: '这个网站', en: 'This Site' },
      year: '2026',
      kind: { zh: '前端 · 自娱自乐', en: 'META' },
      blurb: {
        zh: '手写、零依赖、一个 canvas。首页那个黑洞是字符点阵的实时投影：吸盘按开普勒速度旋转，背面被引力透镜弯成上方的弧，中间的黑影是事件视界。字符取自《查拉图斯特拉如是说》序言。',
        en: 'Hand-built, zero dependencies, one canvas. The hole is a live projection of monospace glyphs: a Keplerian accretion disk, the far side bent into an arc by lensing, and the shadow of the event horizon. Every glyph comes from Thus Spake Zarathustra.',
      },
      tags: ['CANVAS', 'CSS', 'JAVASCRIPT'],
      images: [],
      status: { zh: '源码即将公开', en: 'SOURCE SOON' },
    },
  ],

  /* ── 4. 技术栈 ────────────────────────────────────────────────────────────
     items 可以是 { zh, en }，也可以直接写一个不需要翻译的字符串（如 'Git'）
     ──────────────────────────────────────────────────────────────────────── */
  stack: [
    {
      group: { zh: '语言', en: 'LANGUAGES' },
      items: ['C', 'C++', 'Python', 'Bash', { zh: '汇编', en: 'Assembly' }],
    },
    {
      group: { zh: '嵌入式', en: 'EMBEDDED' },
      items: ['STM32 F4 / H7', 'HAL / LL', 'FreeRTOS', 'CAN', 'UART / SPI / I2C', 'PWM'],
    },
    {
      group: { zh: '电路', en: 'ELECTRONICS' },
      items: [
        { zh: '原理图与 PCB', en: 'Schematic & PCB' },
        { zh: '电源管理', en: 'Power rails' },
        { zh: '电机驱动', en: 'Motor drivers' },
        { zh: '示波器', en: 'Oscilloscope' },
        { zh: '逻辑分析仪', en: 'Logic analyser' },
      ],
    },
    {
      group: { zh: '工具', en: 'TOOLS' },
      items: ['Git', 'CMake', 'Keil', 'STM32CubeMX', 'VS Code', 'Linux'],
    },
    {
      group: { zh: '在学', en: 'LEARNING' },
      items: [
        { zh: '控制理论', en: 'Control theory' },
        { zh: 'RTOS 调度', en: 'RTOS scheduling' },
        { zh: '信号完整性', en: 'Signal integrity' },
      ],
    },
    {
      group: { zh: '动手', en: 'HANDS-ON' },
      items: [
        { zh: '焊接', en: 'Soldering' },
        { zh: '3D 打印', en: '3D printing' },
        { zh: '线束制作', en: 'Wiring harness' },
      ],
    },
  ],

  /* ── 5. 联系方式 ────────────────────────────────────────────────────────── */
  socials: [
    { label: { zh: 'GitHub', en: 'GitHub' }, handle: '@AAA-996', href: 'https://github.com/AAA-996' },
    { label: { zh: '主邮箱', en: 'GMAIL' }, handle: 'zbinhr0831@gmail.com', href: 'mailto:zbinhr0831@gmail.com' },
    { label: { zh: '备用邮箱', en: 'QQ MAIL' }, handle: 'zymhxrx_2025@qq.com', href: 'mailto:zymhxrx_2025@qq.com' },
  ],

  /* ── 6. 首页底部跑马灯 ─────────────────────────────────────────────────── */
  ticker: ['ROBOMASTER', 'CAN BUS', 'STM32', 'PWM', 'PID', 'SOLDERING', 'OSCILLOSCOPE', 'C / C++', 'GIT'],

  /* ── 7. 浏览器标签 / 社交分享标题（切换语言时会一起换） ───────────────────── */
  meta: {
    title: { zh: 'Noah Zheng · 电控与嵌入式', en: 'Noah Zheng · Electronics & Embedded' },
    description: {
      zh: 'Noah Zheng —— 本科学生，RoboMaster 电控与嵌入式。原理图、CAN 总线、电机控制。',
      en: 'Noah Zheng — undergraduate working on RoboMaster electronics and embedded systems: schematics, CAN, motor control.',
    },
  },
};
