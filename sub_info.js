/**
 * 📌 Egern 极简流量监控小组件 (湛蓝校验版)
 * 🚀 功能: 纯蓝色调 + 横向进度条，用于打破缓存并彻底消灭方块
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
  let subName = "流量监控(蓝版)"; // 默认标题加入了校验文字

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

  // 5. 🌊 全新湛蓝颜色预警系统
  let themeColor = "#007AFF"; // 核心变为：湛蓝色
  if (info.ratio > 0.75) themeColor = "#FF9500"; // 超过 75% 变橙
  if (info.ratio > 0.90) themeColor = "#FF3B30"; // 超过 90% 变红
  if (!isOk) themeColor = "#8E8E93"; // 失效变灰

  // 6. 计算进度条比例
  const filledFlex = Math.max(1, Math.round(info.ratio * 100));
  const emptyFlex = Math.max(1, 100 - filledFlex);

  // 7. 构建 UI 树
  return {
    type: "widget",
    padding: 16,
    // 背景带有极淡的蓝灰色调，区别于纯白/纯黑
    backgroundColor: { light: "#F4F8FF", dark: "#121A24" },
    children: [
      // --- 顶部：标题栏 ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          // 图标换成了柱状图
          { type: "image", src: "sf-symbol:chart.bar.fill", color: themeColor, width: 14, height: 14 },
          { type: "spacer", length: 6 },
          { type: "text", text: subName, font: { size: 13, weight: "heavy" }, textColor: themeColor, maxLines: 1 }
        ]
      },
      
      { type: "spacer" },
      
      // --- 中部：超大醒目的百分比数字 ---
      {
        type: "stack", direction: "row", alignItems: "baseline",
        children: [
          { type: "text", text: isOk ? info.percent.replace('%', '') : "ERR", font: { size: 32, weight: "heavy" }, textColor: themeColor },
          { type: "spacer", length: 2 },
          { type: "text", text: isOk ? "%" : "", font: { size: 14, weight: "bold" }, textColor: themeColor },
          { type: "spacer" } 
        ]
      },

      { type: "spacer", length: 8 },
      
      // --- 核心：丝滑的横向进度条 (高度微调至 10) ---
      {
        type: "stack", direction: "row", height: 10, cornerRadius: 5, backgroundColor: { light: "#D0DFF0", dark: "#2A3A4A" },
        children: [
          {
            type: "stack", flex: filledFlex, height: 10, cornerRadius: 5, backgroundColor: themeColor, children: []
          },
          {
            type: "stack", flex: emptyFlex, height: 10, backgroundColor: "#00000000", children: []
          }
        ]
      },

      { type: "spacer", length: 8 },
      
      // --- 底部：具体数值与到期日 ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          { type: "text", text: isOk ? `${fmtGB(info.used)} / ${fmtGB(info.total)}` : errMsg, font: { size: 10, weight: "bold" }, textColor: { light: "#5A6A80", dark: "#7A8A9A" } },
          { type: "spacer" },
          { type: "text", text: isOk ? info.expire : "--", font: { size: 10, weight: "medium" }, textColor: { light: "#5A6A80", dark: "#7A8A9A" } }
        ]
      }
    ]
  };
}
