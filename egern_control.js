export default async function (ctx) {
  // 1. 定义颜色与样式
  const BG_MAIN = { light: '#FFFFFF', dark: '#1C1C1E' };
  const TEXT_MAIN = { light: '#1C1C1E', dark: '#FFFFFF' };
  const COLOR_DIRECT = { light: '#34C759', dark: '#30D158' }; // 绿
  const COLOR_RULE = { light: '#007AFF', dark: '#0A84FF' };   // 蓝
  const COLOR_GLOBAL = { light: '#FF9500', dark: '#FF9F0A' }; // 橙

  // 2. 获取当前出站模式
  // 使用 Egern 内置的 $session 对象获取状态
  const mode = (typeof $session !== 'undefined') ? $session.outboundMode : "rule";

  // 3. 根据模式匹配 UI 展现
  const themes = {
    direct: { title: "直连模式", color: COLOR_DIRECT, icon: "arrow.uturn.right.circle.fill" },
    rule: { title: "规则分流", color: COLOR_RULE, icon: "arrow.triangle.branch" },
    global: { title: "全局代理", color: COLOR_GLOBAL, icon: "globe.asia.australia.fill" }
  };
  const theme = themes[mode] || themes.rule;

  // 4. 构建并返回 UI
  return {
    type: "widget",
    padding: 16,
    backgroundColor: BG_MAIN,
    // ✨ 核心功能：点击整个小组件跳转到模式切换菜单
    link: "egern://outbound-mode", 
    children: [
      {
        type: "stack",
        direction: "column",
        alignItems: "center",
        gap: 8,
        children: [
          { 
            type: "image", 
            src: `sf-symbol:${theme.icon}`, 
            color: theme.color, 
            width: 30, 
            height: 30 
          },
          { 
            type: "text", 
            text: theme.title, 
            font: { size: 16, weight: "heavy" }, 
            textColor: theme.color 
          },
          { 
            type: "text", 
            text: "点击切换模式", 
            font: { size: 10 }, 
            textColor: { light: "#8E8E93", dark: "#8E8E93" } 
          }
        ]
      }
    ]
  };
}
