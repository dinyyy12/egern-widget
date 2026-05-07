export default async function (ctx) {
  return {
    type: "widget",
    padding: 20,
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    children: [
      { 
        type: "text", 
        text: "第一步：测试成功！", 
        font: { size: 18, weight: "bold" }, 
        textColor: { light: "#000000", dark: "#FFFFFF" } 
      }
    ]
  };
}
