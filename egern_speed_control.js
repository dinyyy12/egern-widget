/**
 * Egern Dashboard 脚本
 */
(async () => {
  const traffic = $network.traffic || { up: 0, down: 0 };
  const mode = $session.outboundMode || "rule";
  const proxyName = $session.proxy ? $session.proxy.name : "DIRECT";

  const formatSpeed = (bytes) => {
    if (bytes < 1024) return `${bytes.toFixed(0)} B/s`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB/s`;
    return `${(bytes / 1048576).toFixed(1)} MB/s`;
  };

  const config = {
    direct: { title: "直连模式", color: "#34C759" },
    rule: { title: "规则模式", color: "#007AFF" },
    global: { title: "全局代理", color: "#FF9500" }
  };

  const style = config[mode] || config.rule;

  $dashboard.setData({
    title: style.title,
    content: `下行: ${formatSpeed(traffic.down)}\n上行: ${formatSpeed(traffic.up)}\n节点: ${proxyName}`,
    backgroundColor: style.color,
    titleColor: "#FFFFFF",
    contentColor: "#FFFFFF",
    url: "egern://outbound-mode"
  });

  $done();
})();
