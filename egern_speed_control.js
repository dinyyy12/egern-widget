/**
 * 📌 Egern 桌面控制中心小组件 (已修复语法兼容性)
 * 🎨 采用高级声明式 UI | 支持暗黑模式 | 多点触控响应
 */
(async () => {
  // 1. 统一 UI 规范颜色 (适配深色/浅色模式)
  const C = {
    bg: { light: '#FFFFFF', dark: '#1C1C1E' },
    cardBg: { light: '#F2F2F7', dark: '#2C2C2E' },
    text: { light: '#000000', dark: '#FFFFFF' },
    subText: { light: '#8E8E93', dark: '#8E8E93' },
    
    // 状态颜色
    direct: { light: '#34C759', dark: '#30D158' },
    rule: { light: '#007AFF', dark: '#0A84FF' },
    global: { light: '#FF9500', dark: '#FF9F0A' },
    power: { light: '#FF3B30', dark: '#FF453A' }
  };

  // 2. 获取当前运行环境数据
  const traffic = (typeof $network !== 'undefined' && $network.traffic) ? $network.traffic : { up: 0, down: 0 };
  const mode = (typeof $session !== 'undefined' && $session.outboundMode) ? $session.outboundMode : "rule";
  const proxyName = (typeof $session !== 'undefined' && $session.proxy) ? $session.proxy.name : "未获取到节点";

  // 3. 数据格式化与主题映射
  const formatSpeed = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB/s";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB/s";
    return (bytes / 1048576).toFixed(1) + " MB/s";
  };

  const themes = {
    direct: { text: "直连模式 (Direct)", color: C.direct, icon: "arrow.uturn.right.circle.fill" },
    rule: { text: "规则分流 (Rule)", color: C.rule, icon: "arrow.triangle.branch" },
    global: { text: "全局代理 (Global)", color: C.global, icon: "globe.asia.australia.fill" }
  };
  const currentTheme = themes[mode] || themes.rule;

  // 4. 交互按钮组件封装
  const ActionButton = (icon, label, url, bgColor) => ({
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    cornerRadius: 10,
    padding: { top: 8, bottom: 8 },
    flex: 1,
    link: url, // ✨ 核心：点击该区块触发跳转
    children: [
      { type: 'image', src: `sf-symbol:${icon}`, color: '#FFFFFF', width: 14, height: 14 },
      { type: 'spacer', length: 6 },
      { type: 'text', text: label, font: { size: 12, weight: 'bold' }, textColor: '#FFFFFF' }
    ]
  });

  // 5. 构建 UI 渲染树
  const uiTree = {
    type: 'widget',
    padding: 16,
    backgroundColor: C.bg,
    children: [
      // 模块 A：头部 (网速与标题)
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        children: [
          { type: 'image', src: 'sf-symbol:server.rack', color: C.text, width: 16, height: 16 },
          { type: 'spacer', length: 6 },
          { type: 'text', text: 'Egern 控制中心', font: { size: 13, weight: 'bold' }, textColor: C.text },
          { type: 'spacer' },
          { type: 'text', text: `↓ ${formatSpeed(traffic.down)}  ↑ ${formatSpeed(traffic.up)}`, font: { size: 10, weight: 'medium', design: 'monospaced' }, textColor: C.subText }
        ]
      },
      
      { type: 'spacer', length: 12 },

      // 模块 B：状态显示面板
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        backgroundColor: C.cardBg,
        cornerRadius: 12,
        padding: 12,
        link: 'egern://outbound-mode', 
        children: [
          { type: 'image', src: `sf-symbol:${currentTheme.icon}`, color: currentTheme.color, width: 28, height: 28 },
          { type: 'spacer', length: 12 },
          {
            type: 'stack',
            direction: 'column',
            gap: 3,
            flex: 1,
            children: [
              { type: 'text', text: currentTheme.text, font: { size: 14, weight: 'bold' }, textColor: currentTheme.color },
              { type: 'text', text: `节点: ${proxyName}`, font: { size: 11, weight: 'medium' }, textColor: C.subText, maxLines: 1 }
            ]
          }
        ]
      },

      { type: 'spacer', length: 12 },

      // 模块 C：操作按钮区域
      {
        type: 'stack',
        direction: 'row',
        gap: 10,
        children: [
          ActionButton("switch.2", "切换模式", "egern://outbound-mode", C.rule),
          ActionButton("power", "启停代理", "egern://toggle-enabled", C.power)
        ]
      }
    ]
  };

  // 6. 核心：将构建好的 UI 树抛回给 Egern 渲染引擎
  $done(uiTree);

})();
