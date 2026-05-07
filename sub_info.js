/**
 * 📌 Egern 流量监控小组件 (深度暗黑渐变 + 像素级统一UI版)
 */
export default async function (ctx) {
  // 1. 提取参考代码中的统一 UI 规范颜色
  const BG_COLORS = [{ light: '#0D0D1A', dark: '#0D0D1A' }, { light: '#2D1B69', dark: '#2D1B69' }];
  const C_TITLE = { light: '#FFD700', dark: '#FFD700' };
  const C_SUB = { light: '#A2A2B5', dark: '#A2A2B5' };
  const C_GREEN = { light: '#32D74B', dark: '#32D74B' };
  const C_MAIN = { light: '#FFFFFF', dark: '#FFFFFF' };
  
  // 进度条专属告警色
  const C_WARN = { light: '#FF9500', dark: '#FF9500' };
  const C_DANGER = { light: '#FF3B30', dark: '#FF3B30' };

  // 2. 辅助函数：清理未填写的模板参数
  const cleanVal = (val, defaultStr) => {
    const text = String(val || "").trim();
    if (/^\{\{\{[^}]+\}\}\}$/.test(text) || text === defaultStr || text === "可选") return "";
    return text;
  };

  // 3. 从模块环境变量中寻找第一个有效订阅
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

  // 4. 初始化数据
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
      errMsg = "获取失败";
    }
  } catch (e) {
    // 拦截异常
  }

  // 5. 数据格式化辅助函数
  const fmtGB = (bytes) => (bytes / (1024 ** 3)).toFixed(1) + " GB";

  // 6. 动态颜色预警系统 (采用参考代码中的绿色作为健康基准)
  let barColor = C_GREEN; 
  if (info.ratio > 0.75) barColor = C_WARN; 
  if (info.ratio > 0.90) barColor = C_DANGER; 
  if (!isOk) barColor = C_SUB; 

  // 7. 计算进度条比例
  const filledFlex = Math.max(1, Math.round(info.ratio * 100));
  const emptyFlex = Math.max(1, 100 - filledFlex);

  // 8. 构建 UI 树
  return {
    type: "widget",
    padding: 14, // 与参考代码一致的 14
    // ✨ 核心：采用与参考代码完全一致的渐变背景
    backgroundGradient: { type: 'linear', colors: BG_COLORS, startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } },
    children: [
      // --- 顶部：标题栏 ---
      {
        type: "stack", direction: "row", alignItems: "center", gap: 6,
        children: [
          { type: "image", src: "sf-symbol:chart.pie.fill", color: C_TITLE, width: 16, height: 16 },
          { type: "text", text: subName, font: { size: 14, weight: "heavy" }, textColor: C_TITLE, maxLines: 1 },
          { type: "spacer" },
          // 右上角点缀，与参考代码结构呼应
          { type: "text", text: "Subscription", font: { size: 9 }, textColor: "rgba(255,255,255,0.2)" }
        ]
      },
      
      { type: "spacer" },
      
      // --- 中部：超大醒目的百分比数字 ---
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
      
      // --- 核心：横向进度条 ---
      // 底色采用了半透明白，适配暗黑渐变背景
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
      
      // --- 底部：具体数值与到期日 ---
      {
        type: "stack", direction: "row", alignItems: "center",
        children: [
          // ✨ 字号 11，等宽字体 Menlo，与参考代码完全一致
          { type: "text", text: isOk ? `${fmtGB(info.used)} / ${fmtGB(info.total)}` : errMsg, font: { size: 11, weight: "bold", family: "Menlo" }, textColor: C_MAIN },
          { type: "spacer" },
          { type: "text", text: isOk ? info.expire : "--", font: { size: 11, weight: "bold", family: "Menlo" }, textColor: C_SUB }
        ]
      }
    ]
  };
}
