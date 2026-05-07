/**
 * 📌 Egern 极简流量监控小组件 (横向进度条版 - 彻底告别方块)
 */
export default async function (ctx) {
  // 1. 辅助函数：清理未填写的模板参数
  const cleanVal = (val, defaultStr) => {
    const text = String(val || "").trim();
    if (/^\{\{\{[^}]+\}\}\}$/.test(text) || text === defaultStr || text === "可选") return "";
    return text;
  };

  // 2. 从模块环境变量中寻找第一个有效订阅
  let subUrl = "";
  let subName = "流量监控";

  for (let i = 1; i <= 10; i++) {
    const url = cleanVal(ctx.env[`URL${i}`], `订阅链接${i}`);
    if (/^https?:\/\//i.test(url)) {
      subUrl = url;
      subName = cleanVal(ctx.env[`NAME${i}`], `机场${i}`) || subName;
      break;
    }
  }

  // 3. 初始化数据
  let info = { used: 0, total: 0, ratio: 0, percent: "0%", expire: "--" };
  let isOk = false;
  let errMsg = "未配置链接";

  try {
    if (!subUrl) throw new Error("No URL");

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
      errMsg = "未获取到数据";
    }
  } catch (e) {
    // 拦截异常
  }

  // 4. 数据格式化辅助函数
  const fmtGB = (bytes) => (bytes / (1024 ** 3)).toFixed(1) + " GB";

  // 5. 动态颜色预警系统
  let themeColor = "#34C759"; // 绿色
  if (info.ratio > 0.75) themeColor = "#FF9500"; // 橙色
  if (info.ratio > 0.90) themeColor = "#FF3B30"; // 红色
  if (!isOk) themeColor = "#8E8E93"; // 灰色

  // 6. 计算进度条比例 (避免 flex 为 0 导致渲染崩溃)
  const filledFlex = Math.max(1, Math.round(info.ratio * 100));
  const emptyFlex = Math.max(1, 100 - filledFlex);

  // 7. 构建 UI 树
  return {
    type: "widget",
    padding: 16,
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    children: [
      // --- 顶部：标题栏 ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          { type: "image", src: "sf-symbol:chart.pie.fill", color: themeColor, width: 14, height: 14 },
          { type: "spacer", length: 6 },
          { type: "text", text: subName, font: { size: 13, weight: "heavy" }, textColor: { light: "#1C1C1E", dark: "#FFFFFF" }, maxLines: 1 }
        ]
      },
      
      { type: "spacer" },
      
      // --- 中部：超大醒目的百分比数字 ---
      {
        type: "stack", direction: "row", alignItems: "baseline",
        children: [
          { type: "text", text: isOk ? info.percent.replace('%', '') : "ERR", font: { size: 30, weight: "heavy" }, textColor: themeColor },
          { type: "spacer", length: 2 },
          { type: "text", text: isOk ? "%" : "", font: { size: 14, weight: "bold" }, textColor: themeColor },
          { type: "spacer" } // 靠左对齐
        ]
      },

      { type: "spacer", length: 8 },
      
      // --- 核心：丝滑的横向进度条 ---
      {
        type: "stack", direction: "row", height: 8, cornerRadius: 4, backgroundColor: { light: "#E5E5EA", dark: "#2C2C2E" },
        children: [
          {
            // 已用部分
            type: "stack", flex: filledFlex, height: 8, cornerRadius: 4, backgroundColor: themeColor, children: []
          },
          {
            // 剩余部分 (透明)
            type: "stack", flex: emptyFlex, height: 8, backgroundColor: "#00000000", children: []
          }
        ]
      },

      { type: "spacer", length: 8 },
      
      // --- 底部：具体数值与到期日 ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          { type: "text", text: isOk ? `${fmtGB(info.used)} / ${fmtGB(info.total)}` : errMsg, font: { size: 10, weight: "bold" }, textColor: { light: "#8E8E93", dark: "#8E8E93" } },
          { type: "spacer" },
          { type: "text", text: isOk ? info.expire : "--", font: { size: 10, weight: "medium" }, textColor: { light: "#8E8E93", dark: "#8E8E93" } }
        ]
      }
    ]
  };
}
