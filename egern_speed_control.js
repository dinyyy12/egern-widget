// 代理控制小组件 v1.0
export default async function(ctx) {
    // ========== UI 常量配置 ==========
    // 主题色 (深色/浅色自适应)
    const colors = {
        bg: ctx.systemTheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        cardBg: ctx.systemTheme === 'dark' ? '#2C2C2E' : '#F2F2F7',
        textPrimary: ctx.systemTheme === 'dark' ? '#FFFFFF' : '#1C1C1E',
        textSecondary: ctx.systemTheme === 'dark' ? '#8E8E93' : '#6C6C70',
        accent: '#007AFF',
        success: '#34C759',
        warning: '#FF9500'
    };

    // 可配置项：在这里修改你要显示的代理组
    const PROXY_GROUP_NAME = "Proxy";      // 主代理组名称，请修改为你实际使用的策略组名
    const NODES_TO_SHOW = ["Proxy", "DIRECT", "手动选择", "自动选择"]; // 定义你想在小组件上显示的节点选项

    // ========== 核心逻辑 ==========
    try {
        // 1. 获取当前选中的策略组节点
        let currentProxy = await $configuration.getPolicy(PROXY_GROUP_NAME);

        // 2. 获取该策略组下所有可用的节点列表
        let allPolicies = await $configuration.listPolicies(PROXY_GROUP_NAME);
        
        // 3. 如果获取失败或节点列表为空，则添加一个后备方案
        if (!allPolicies || allPolicies.length === 0) {
            allPolicies = ["Proxy", "DIRECT"];
            if (!currentProxy) currentProxy = "Proxy";
        }

        // 4. 过滤出需要展示的节点
        let availableNodes = allPolicies.filter(p => NODES_TO_SHOW.includes(p));
        
        // 如果过滤后没有节点，则展示所有节点
        if (availableNodes.length === 0) {
            availableNodes = allPolicies;
        }

        // 确保 currentProxy 在可用列表中
        if (!availableNodes.includes(currentProxy)) {
            currentProxy = availableNodes[0];
        }

        // 5. 构建小组件UI
        const widget = {
            type: 'widget',
            backgroundColor: colors.bg,
            padding: 16,
            children: [
                // 顶部状态栏
                {
                    type: 'hstack',
                    spacing: 8,
                    children: [
                        {
                            type: 'text',
                            text: '代理控制',
                            font: { size: 'headline', weight: 'semibold' },
                            textColor: colors.textPrimary
                        },
                        {
                            type: 'spacer'
                        },
                        {
                            type: 'hstack',
                            spacing: 4,
                            children: [
                                {
                                    type: 'text',
                                    text: currentProxy === 'DIRECT' ? '⚡ 已关闭' : '🛡️ 已开启',
                                    font: { size: 'caption1', weight: 'medium' },
                                    textColor: currentProxy === 'DIRECT' ? colors.warning : colors.success
                                }
                            ]
                        }
                    ]
                },
                // 间距
                {
                    type: 'spacer',
                    length: 12
                },
                // 当前代理模式显示
                {
                    type: 'text',
                    text: `当前模式: ${currentProxy === 'DIRECT' ? '直连（无代理）' : currentProxy}`,
                    font: { size: 'subheadline', weight: 'medium' },
                    textColor: colors.textSecondary
                },
                // 间距
                {
                    type: 'spacer',
                    length: 16
                },
                // 代理模式切换按钮区域
                {
                    type: 'grid',
                    columns: 2,
                    spacing: 12,
                    children: availableNodes.map(node => ({
                        type: 'button',
                        label: node === 'DIRECT' ? '⚡ 关闭代理' : `🌐 ${node}`,
                        backgroundColor: currentProxy === node ? colors.accent : colors.cardBg,
                        textColor: currentProxy === node ? '#FFFFFF' : colors.textPrimary,
                        // 点击时切换策略组节点
                        action: `egern:/policies/set?group=${PROXY_GROUP_NAME}&policy=${node}`,
                        // 添加回调刷新小组件
                        actionCompletion: 'widget://refresh'
                    }))
                }
            ]
        };

        // 6. 返回小组件配置
        return widget;
        
    } catch (error) {
        // 如果发生错误，显示错误信息
        return {
            type: 'widget',
            backgroundColor: colors.bg,
            padding: 16,
            children: [
                {
                    type: 'text',
                    text: '⚠️ 加载失败',
                    font: { size: 'headline', weight: 'semibold' },
                    textColor: colors.warning
                },
                {
                    type: 'spacer',
                    length: 8
                },
                {
                    type: 'text',
                    text: `错误: ${error.message}`,
                    font: { size: 'caption2', weight: 'regular' },
                    textColor: colors.textSecondary
                }
            ]
        };
    }
}
