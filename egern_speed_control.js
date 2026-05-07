/**
 * Egern 实时网速与状态切换小组件
 */
(async () => {
  const traffic = $network.traffic || { up: 0, down: 0 };
  const mode = $session.outboundMode || "rule";
  const proxyName = $session.proxy ? $session.proxy.name : "DIRECT";

  // 格式化网速
  const fmt = (b) => {
    if (b < 1024) return b.toFixed(0) + " B/s";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB/s";
    return (b / 1048576).toFixed(1) + " MB/s";
  };

  // 根据模式定义主题色
  const themes = {
    direct: { title: "直连模式", color: "#34C759" }, // 绿色
    rule: { title: "规则模式", color: "#007AFF" },   // 蓝色
    global: { title: "代理模式", color: "#FF9500" }  // 橙色
  };
  const theme = themes[mode] || themes.rule;

  // 渲染
  $dashboard.setData({
    title: `↓ ${fmt(traffic.down)}  ↑ ${fmt(traffic.up)}`,
    content: `模式: ${theme.title}\n节点: ${proxyName}`,
    backgroundColor: theme.color,
    titleColor: "#FFFFFF",
    contentColor: "#FFFFFF",
    // 点击跳转切换模式页面
    url: "egern://outbound-mode"
  });

  $done();
})();
