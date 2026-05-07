/**
 * 📌 Egern 流量监控小组件 (极限防折行版)
 */
export default async function (ctx) {
  const BG_COLORS = ['#0D0D1A', '#2D1B69'];
  const C_TITLE = { light: '#FFD700', dark: '#FFD700' };
  const C_SUB = { light: '#A2A2B5', dark: '#A2A2B5' };
  const C_GREEN = { light: '#32D74B', dark: '#32D74B' };
  const C_MAIN = { light: '#FFFFFF', dark: '#FFFFFF' };
  const C_WARN = { light: '#FF9500', dark: '#FF9500' };
  const C_DANGER = { light: '#FF3B30', dark: '#FF3B30' };

  const cleanVal = (val, defaultStr) => {
    const text = String(val || "").trim();
    if (/^\{\{\{[^}]+\}\}\}$/.test(text) || text === defaultStr || text === "可选") return "";
    return text;
  };

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
      // ✨ 优化：缩减年份为两位数，并将 - 换成 /，进一步节省空间 (例如 24/11/05)
      const expireStr = expireTime ? `${String(expireTime.getFullYear()).slice(-2)}/${String(expireTime.getMonth()+1).padStart(2, '0')}/${String(expireTime.getDate()).padStart(2, '0')}` : "无限期";

      info = { used, total, ratio, percent: (ratio * 100).toFixed(1) + "%", expire: expireStr };
      isOk = true;
    } else {
      errMsg = "获取失败";
    }
  } catch (e) {
    // 拦截异常
  }

  // ✨ 优化：取消了数字和单位之间的空格，极致压缩空间 (例如 1.25GB)
  const fmtSize = (bytes) => {
    if (!bytes) return "0.00GB";
    const gb = bytes / (1024 ** 3);
    if (gb >= 1024) {
      return (gb / 1024).toFixed(2) + "TB";
    }
    return gb.toFixed(2) + "GB";
  };

  const now = new Date();
  const updateTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let barColor = C_GREEN; 
  if (info.ratio > 0.75) barColor = C_WARN; 
  if (info.ratio > 0.90) barColor = C_DANGER; 
  if (!isOk) barColor = C_SUB; 

  const filledFlex = Math.max(1, Math.round(info.ratio * 100));
  const emptyFlex = Math.max(1, 100 - filledFlex);

  return {
    type: "widget",
    padding: 14, 
    backgroundGradient: { type: 'linear', colors: BG_COLORS, startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    children: [
      {
        type: "stack", direction: "row", alignItems: "center", gap: 6,
        children: [
          { type: "image", src: "sf-symbol:chart.pie.fill", color: C_TITLE, width: 16, height: 16 },
          { type: "text", text: subName, font: { size: 14, weight: "heavy" }, textColor: C_TITLE, maxLines: 1 },
          { type: "spacer" },
          { type: "text", text: updateTime, font: { size: 10, weight: "bold", family: "Menlo" }, textColor: "rgba(255,255,255,0.4)" }
        ]
      },
      
      { type: "spacer" },
      
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          { type: "text", text: isOk ? info.percent.replace('%', '') : "ERR", font: { size: 32, weight: "heavy" }, textColor: barColor },
          { type: "spacer", length: 2 },
          { type: "text", text: isOk ? "%" : "", font: { size: 14, weight: "bold" }, textColor: barColor },
          { type: "spacer" } 
        ]
      },

      { type: "spacer", length: 8 },
      
      {
        type: "stack", direction: "row", height: 8, cornerRadius: 4, backgroundColor: "rgba(255,255,255,0.1)",
        children: [
          {
            type: "stack", flex: filledFlex, height: 8, cornerRadius: 4, backgroundColor: barColor, children: []
          },
          {
            type: "stack", flex: emptyFlex, height: 8, backgroundColor: "#00000000", children: []
          }
        ]
      },

      { type: "spacer", length: 8 },
      
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          // ✨ 核心修复：添加了 maxLines: 1 和更极端的 minScale: 0.5 阻止强制换行
          { type: "text", text: isOk ? `${fmtSize(info.used)}/${fmtSize(info.total)}` : errMsg, font: { size: 11, weight: "bold", family: "Menlo" }, textColor: C_MAIN, maxLines: 1, minScale: 0.5 },
          { type: "spacer" },
          // 日期一并加上单行限制
          { type: "text", text: isOk ? info.expire : "--", font: { size: 10, weight: "bold", family: "Menlo" }, textColor: C_SUB, maxLines: 1, minScale: 0.5 }
        ]
      }
    ]
  };
}
