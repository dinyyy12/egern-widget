/**
 * 适配版 Egern Dashboard
 * 参考 Network-Pro 逻辑：支持图标、网速平滑显示、模式变色
 */

(async () => {
  // 1. 获取网络与会话数据
  const traffic = $network.traffic || { up: 0, down: 0 };
  const mode = $session.outboundMode || "rule";
  const proxy = $session.proxy ? $session.proxy.name : "DIRECT";

  // 2. 格式化网速函数
  const formatSpeed = (bytes) => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB/s`;
    return `${(bytes / 1048576).toFixed(1)} MB/s`;
  };

  // 3. 模式样式配置 (参考 Network-Pro 的配色方案)
  const modeConfig = {
    direct: { title: "直连模式", color: "#34C759", icon: "arrow.right.circle" },
    rule: { title: "规则模式", color: "#007AFF", icon: "flowchart" },
    global: { title: "全局代理", color: "#FF9500", icon: "globe" }
  };

  const current = modeConfig[mode] || modeConfig.rule;

  // 4. 组装展示内容
  // \u11fa 这种符号在某些固件上支持更好，或者直接用 SF Symbols
  const content = [
    `下行: ${formatSpeed(traffic.down)}`,
    `上行: ${formatSpeed(traffic.up)}`,
    `节点: ${proxy}`
  ].join("\n");

  // 5. 核心：使用 $dashboard.setData 渲染
  $dashboard.setData({
    title: current.title,
    content: content,
    backgroundColor: current.color,
    titleColor: "#FFFFFF",
    contentColor: "#FFFFFF",
    // 点击小组件跳转到模式选择页面
    url: "egern://outbound-mode"
  });

  $done(); // 必须调用 $done() 结束脚本
})();
