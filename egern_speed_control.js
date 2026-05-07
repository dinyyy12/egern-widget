/**
 * ==========================================
 * 📌 代码名称: Egern 网络控制中心 (统一 UI 规范版)
 * 🚀 功能: 实时网速 / 模式确认 / 一键切换 / 开关代理
 * ==========================================
 */
export default async function (ctx) {
  try {
    // 🎨 1. 统一 UI 规范颜色 (适配深色/浅色模式)
    const BG_MAIN = { light: '#FFFFFF', dark: '#121212' }; 
    const BLOCK_BG = { light: '#F2F2F7', dark: '#1C1C1E' }; 
    const TEXT_MAIN = { light: '#1C1C1E', dark: '#FFFFFF' };
    const TEXT_SUB = { light: '#8E8E93', dark: '#8E8E93' }; 

    // 状态与按钮颜色
    const COLOR_DIRECT = { light: '#34C759', dark: '#30D158' }; // 绿 - 直连
    const COLOR_RULE = { light: '#007AFF', dark: '#0A84FF' };   // 蓝 - 规则
    const COLOR_GLOBAL = { light: '#FF9500', dark: '#FF9F0A' }; // 橙 - 全局
    const COLOR_POWER = { light: '#FF3B30', dark: '#FF453A' };   // 红 - 开关

    // 📡 2. 获取网络与代理数据
    const traffic = (typeof $network !== 'undefined' && $network.traffic) ? $network.traffic : { up: 0, down: 0 };
    const mode = (typeof $session !== 'undefined' && $session.outboundMode) ? $session.outboundMode : "rule";
    const proxyName = (typeof $session !== 'undefined' && $session.proxy && $session.proxy.name) ? $session.proxy.name : "DIRECT";

    // 网速格式化函数
    const formatSpeed = (bytes) => {
      if (!bytes || bytes === 0) return "0 KB/s";
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB/s";
      return (bytes / 1048576).toFixed(1) + " MB/s";
    };

    // 模式样式映射
    const themes = {
      direct: { title: "直连模式", color: COLOR_DIRECT, icon: "arrow.uturn.right.circle.fill" },
      rule: { title: "规则分流", color: COLOR_RULE, icon: "arrow.triangle.branch" },
      global: { title: "全局代理", color: COLOR_GLOBAL, icon: "globe.asia.australia.fill" }
    };
    const theme = themes[mode] || themes.rule;

    // 🏗️ 3. 构建 UI 渲染树
    return {
      type: "widget", 
      padding: [16, 16],
      backgroundColor: BG_MAIN, 
      children: [
        // --- 模块 A: 顶部标题与网速 ---
        { 
          type: "stack", direction: "row", alignItems: "center", 
          children: [
            { type: "image", src: "sf-symbol:shield.righthalf.filled", width: 16, height: 16, color: TEXT_MAIN },
            { type: "spacer", length: 6 },
            { type: "text", text: "Egern 控制台", font: { size: 15, weight: "heavy" }, textColor: TEXT_MAIN },
            { type: "spacer" }, 
            { type: "text", text: `↓${formatSpeed(traffic.down)} ↑${formatSpeed(traffic.up)}`, font: { size: 11, design: "monospaced", weight: "bold" }, textColor: TEXT_SUB }
          ]
        },
        
        { type: 'spacer', length: 14 },
        
        // --- 模块 B: 当前状态区块 (点击可切换模式) ---
        {
          type: "stack", direction: "row", alignItems: "center", padding: [12, 12], backgroundColor: BLOCK_BG, borderRadius: 12,
          url: "egern://outbound-mode", // ✨ 点击触发模式切换
          children: [
            { type: "image", src: `sf-symbol:${theme.icon}`, width: 28, height: 28, color: theme.color },
            { type: "spacer", length: 12 },
            {
              type: "stack", direction: "column", flex: 1,
              children: [
                { type: "text", text: theme.title, font: { size: 14, weight: "heavy" }, textColor: theme.color },
                { type: "spacer", length: 4 },
                { type: "text", text: `节点: ${proxyName}`, font: { size: 11, weight: "medium" }, textColor: TEXT_SUB, maxLines: 1 }
              ]
            }
          ]
        },

        { type: 'spacer', length: 14 },

        // --- 模块 C: 底部快捷操作按钮 ---
        {
          type: "stack", direction: "row", gap: 10,
          children: [
            // 按钮 1：切换模式
            {
              type: "stack", direction: "row", alignItems: "center", justifyContent: "center", flex: 1, padding: [10, 0], backgroundColor: COLOR_RULE, borderRadius: 10,
              url: "egern://outbound-mode", // ✨ 点击触发模式切换
              children: [
                { type: "image", src: "sf-symbol:switch.2", width: 14, height: 14, color: "#FFFFFF" },
                { type: "spacer", length: 6 },
                { type: "text", text: "切换模式", font: { size: 12, weight: "bold" }, textColor: "#FFFFFF" }
              ]
            },
            // 按钮 2：启停代理
            {
              type: "stack", direction: "row", alignItems: "center", justifyContent: "center", flex: 1, padding: [10, 0], backgroundColor: COLOR_POWER, borderRadius: 10,
              url: "egern://toggle-enabled", // ✨ 点击直接开关 VPN
              children: [
                { type: "image", src: "sf-symbol:power", width: 14, height: 14, color: "#FFFFFF" },
                { type: "spacer", length: 6 },
                { type: "text", text: "启停代理", font: { size: 12, weight: "bold" }, textColor: "#FFFFFF" }
              ]
            }
          ]
        }
      ]
    };

  } catch (err) {
    // ⚠️ 错误捕获兜底 UI
    return {
      type: 'widget', padding: [14, 16],
      backgroundColor: { light: '#FFFFFF', dark: '#121212' }, 
      children: [
        { type: 'text', text: '控制台异常', font: { size: 14, weight: 'heavy' }, textColor: '#FF453A' },
        { type: 'text', text: String(err), font: { size: 10 }, textColor: '#FF453A' }
      ]
    };
  }
}
