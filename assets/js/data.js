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
     title / kind / blurb 都是 { zh, en }。
     links:   [{ label: {zh,en}, href }]，可以放 1～3 个（主仓库 + 分支链接）
     private: true  → 会显示一个「私有」小标，避免访客点进 404 时以为你写错了
     status:  {zh,en} → 没有 links 时显示的替代文字
     ──────────────────────────────────────────────────────────────────────── */
  work: [
    {
      title: { zh: 'RoboMaster 电控学习历程', en: 'RoboMaster Electronics Log' },
      year: '2025 — 2026',
      kind: { zh: '电控 · 嵌入式', en: 'ELECTRONICS · EMBEDDED' },
      blurb: {
        zh: '从最小系统板到整车主控的记录：电源、CAN、PWM、电机驱动，按机器人角色拆成两条分支迭代——工程机器人与步兵。每条分支都对应一次完整的上车验证，不是纸上谈兵。',
        en: 'A log that runs from the first minimum-system board to a full robot controller: power, CAN, PWM, motor drivers. Iterated along two roles — engineer and infantry — with each branch validated on a real robot.',
      },
      tags: ['C', 'STM32', 'CAN', 'POWER'],
      private: true,
      links: [
        {
          label: { zh: '主仓库', en: 'REPOSITORY' },
          href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey',
        },
        {
          label: { zh: '工程机器人分支', en: 'ENGINEER BRANCH' },
          href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey/tree/Engineer',
        },
        {
          label: { zh: '步兵分支', en: 'INFANTRY BRANCH' },
          href: 'https://github.com/AAA-996/Robomaster-my-electricity-learning-journey/tree/PassHole_Infantry',
        },
      ],
    },
    {
      title: { zh: 'lnk-DMh7 · H7 主控与 DM 电机链路', en: 'lnk-DMh7 · H7 Controller & DM Motor Link' },
      year: '2026',
      kind: { zh: '固件 · 通信', en: 'FIRMWARE · COMMS' },
      blurb: {
        zh: '基于 STM32H7 的主控与 DM 电机通信链路：把反馈解析、控制指令和安全保护串成一条可复现的通路。fix 分支专门处理异常与边界情况——掉电、丢帧、堵转，以及那些只在赛场上出现一次的问题。',
        en: 'An STM32H7 controller and DM motor link: feedback parsing, command output and safety checks on one reproducible path. The fix branch is dedicated to fault handling — brownouts, dropped frames, stalls, and the ones that only happen once on the field.',
      },
      tags: ['STM32H7', 'CAN', 'MOTOR CONTROL'],
      private: true,
      links: [
        {
          label: { zh: '主仓库', en: 'REPOSITORY' },
          href: 'https://github.com/AAA-996/lnk-DMh7',
        },
        {
          label: { zh: '修复分支', en: 'FIX BRANCH' },
          href: 'https://github.com/AAA-996/lnk-DMh7/tree/fix/safety-and-bugs',
        },
      ],
    },
    {
      title: { zh: '这个网站', en: 'This Site' },
      year: '2026',
      kind: { zh: '前端 · 自娱自乐', en: 'META' },
      blurb: {
        zh: '手写、零依赖、一个 canvas。首页那圈字符其实是 3D 环形点阵的实时投影：鼠标会让它倾斜，点击会炸开。没有打包工具，静态文件直接放在 GitHub Pages 上。',
        en: 'Hand-built, zero dependencies, one canvas. The ring on the front page is a live 3D torus of monospace glyphs — it tilts with the cursor and bursts on click. No bundler; static files on GitHub Pages.',
      },
      tags: ['CANVAS', 'CSS', 'JAVASCRIPT'],
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
