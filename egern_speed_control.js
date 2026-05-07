/**
 * 适配 Egern 最新官方文档的 Widget 脚本
 */

// 获取数据
const traffic = $network.traffic;
const mode = $session.outboundMode;
const proxy = $session.proxy ? $session.proxy.name : "DIRECT";

// 格式化速度
const speed = (b) => {
  if (!b || b < 0) return "0 B/s";
  return b < 1048576 ? (b / 1024).toFixed(1) + " KB/s" : (b / 1048576).toFixed(1) + " MB/s";
};

// 样式配置
const themes = {
  direct: { name: "直连", color: "#34C759" },
  rule: { name: "规则", color: "#007AFF" },
  global: { name: "全局", color: "#FF9500" }
};
const theme = themes[mode] || themes.rule;

// 渲染输出
$widget.setContents({
  title: `↓ ${speed(traffic.down)}  ↑ ${speed(traffic.up)}`,
  content: `模式: ${theme.name}\n节点: ${proxy}`,
  backgroundColor: theme.color,
  titleColor: "#FFFFFF",
  contentColor: "#FFFFFF",
  // 点击跳转至模式切换
  url: "egern://outbound-mode"
});

$done();
