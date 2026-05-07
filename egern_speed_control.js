/**
 * Egern 小尺寸组件：实时网速 + 模式状态
 * 逻辑：顶部显示实时网速，中部显示当前模式与节点，背景随模式变化
 */

const network = $network.traffic; // 获取流量数据
const mode = $session.outboundMode;
const proxyName = $session.proxy ? $session.proxy.name : "直连";

// 格式化网速显示 (B/s -> KB/s 或 MB/s)
function formatSpeed(bytes) {
  if (bytes < 1024) return bytes + " B/s";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB/s";
  return (bytes / 1048576).toFixed(1) + " MB/s";
}

// 定义不同模式的 UI 样式
const styles = {
  direct: { name: "直连模式", color: "#34C759" }, // 绿色
  rule: { name: "规则模式", color: "#007AFF" },   // 蓝色
  global: { name: "全局代理", color: "#FF9500" }  // 橙色
};

const currentStyle = styles[mode] || { name: "未知", color: "#8E8E93" };

$dashboard.setData({
  title: `↓ ${formatSpeed(network.down)}   ↑ ${formatSpeed(network.up)}`,
  content: `模式: ${currentStyle.name}\n节点: ${proxyName}`,
  backgroundColor: currentStyle.color,
  titleColor: "#FFFFFF",
  contentColor: "#FFFFFF",
  // 点击跳转到模式切换页面
  url: "egern://outbound-mode"
});
