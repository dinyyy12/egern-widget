/**
 * 📌 Egern 极简流量监控小组件 (模块参数联动版)
 * 🚀 功能: 圆环 UI，自动读取 sgmodule 的配置参数
 */
export default async function (ctx) {
  // 1. 辅助函数：清理未填写的模板参数
  const cleanVal = (val, defaultStr) => {
    const text = String(val || "").trim();
    // 过滤掉 Egern 没替换的 "{{{URL1}}}" 或默认占位符 "订阅链接1"、"可选"
    if (/^\{\{\{[^}]+\}\}\}$/.test(text) || text === defaultStr || text === "可选") return "";
    return text;
  };

  // 2. 从模块环境变量 (ctx.env) 中寻找第一个有效订阅
  let subUrl = "";
  let subName = "流量监控"; // 默认标题

  for (let i = 1; i <= 10; i++) {
    const url = cleanVal(ctx.env[`URL${i}`], `订阅链接${i}`);
    if (/^https?:\/\//i.test(url)) {
      subUrl = url;
      subName = cleanVal(ctx.env[`NAME${i}`], `机场${i}`) || subName;
      break; // 小尺寸组件只渲染第一个有效节点
    }
  }

  // 3. 初始化数据
  let info = { used: 0, total: 0, ratio: 0, percent: "0%", expire: "--" };
  let isOk = false;
  let errMsg = "未配置链接";

  try {
    if (!subUrl) throw new Error("No URL");

    // 发起网络请求获取 Header
    const response = await ctx.http.get(subUrl, {
      headers: { "User-Agent": "clash-verge/v2.0.0" },
      timeout: 5000
    });

    const userInfo = response.headers.get("subscription-userinfo") || response.headers.get("Subscription-Userinfo");
    if (userInfo) {
      const parseObj = Object.fromEntries(
        userInfo.match(/\w+=[\d.eE+-]+/g).map(i => {
          const [k, v] = i.split("=");
          return [k, Number(v)];
        })
      );

      const used = (parseObj.upload || 0) + (parseObj.download || 0);
      const total = parseObj.total || 0;
      const ratio = total > 0 ? Math.min(used / total, 1) : 0;
      
      const expireTime = parseObj.expire ? new Date(parseObj.expire > 1e12 ? parseObj.expire : parseObj.expire * 1000) : null;
      const expireStr = expireTime ? `${expireTime.getFullYear()}-${String(expireTime.getMonth()+1).padStart(2, '0')}-${String(expireTime.getDate()).padStart(2, '0')}` : "无限期";

      info = { used, total, ratio, percent: (ratio * 100).toFixed(1) + "%", expire: expireStr };
      isOk = true;
    } else {
      errMsg = "未获取到流量数据";
    }
  } catch (e) {
    // 捕获异常
  }

  // 4. 数据格式化辅助函数
  const fmtGB = (bytes) => (bytes / (1024 ** 3)).toFixed(1) + " GB";

  // 5. 动态颜色预警系统
  let ringColor = "#34C759"; // 健康绿
  if (info.ratio > 0.75) ringColor = "#FF9500"; // 警戒橙
  if (info.ratio > 0.90) ringColor = "#FF3B30"; // 危险红
  if (!isOk) ringColor = "#8E8E93"; // 失效灰

  // 6. 构建 UI 树
  return {
    type: "widget",
    padding: 16,
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    children: [
      // --- 顶部：标题栏 (动态读取你配置的名称) ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          { type: "image", src: "sf-symbol:chart.pie.fill", color: ringColor, width: 14, height: 14 },
          { type: "spacer", length: 6 },
          { type: "text", text: subName, font: { size: 13, weight: "heavy" }, textColor: { light: "#1C1C1E", dark: "#FFFFFF" }, maxLines: 1 }
        ]
      },
      
      { type: "spacer" },
      
      // --- 中部：空心圆环展示 ---
      {
        type: "stack", direction: "row", alignItems: "center", justifyContent: "center",
        children: [
          {
            type: "stack", direction: "column", alignItems: "center", justifyContent: "center",
            width: 74, height: 74, cornerRadius: 37, 
            borderWidth: 5, borderColor: ringColor,
            children: [
              { type: "text", text: isOk ? info.percent : "ERR", font: { size: 16, weight: "heavy" }, textColor: ringColor },
              { type: "text", text: "USED", font: { size: 9, weight: "bold" }, textColor: { light: "#8E8E93", dark: "#8E8E93" } }
            ]
          }
        ]
      },

      { type: "spacer" },
      
      // --- 底部：具体数值与到期日 ---
      {
        type: "stack", direction: "column", alignItems: "center", gap: 3,
        children: [
          { type: "text", text: isOk ? `${fmtGB(info.used)} / ${fmtGB(info.total)}` : errMsg, font: { size: 10, weight: "bold" }, textColor: { light: "#1C1C1E", dark: "#FFFFFF" } },
          { type: "text", text: isOk ? `到期: ${info.expire}` : "请在模块参数中配置 URL", font: { size: 9, weight: "medium" }, textColor: { light: "#8E8E93", dark: "#8E8E93" } }
        ]
      }
    ]
  };
}
