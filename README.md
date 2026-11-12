# 一个简陋的 JSON 工具

DeepSeek Harness 插件：在 Web UI 里格式化、压缩、校验并自动纠正 JSON 文本。全部在浏览器本地完成，内容不会上传。

## 功能

- **格式化**：2 空格 / 4 空格缩进
- **压缩**：输出单行
- **校验**：语法检查 + 结构统计（顶层类型、最大嵌套深度、对象 / 数组 / 标量数量）；不合法时给出行列位置
- **纠错**：自动修复常见问题，并逐类报告修复数量
  - 尾逗号、单引号、弯引号（“ ” ‘ ’）
  - 注释（`//` 与 `/* */`）
  - 未加引号的键、Python 风格字面量（`True` / `False` / `None` / `NaN` / `Infinity`）
  - 全角标点（`，：｛｝［］`）、BOM
- 一键复制结果、把结果替换回输入框、`Ctrl/⌘ + Enter` 格式化

## 使用

点击左侧栏的 `{ }` 图标打开「JSON 工具」面板：粘贴 JSON → 点「格式化 / 压缩 / 纠错 / 校验」。

## 安装

让 Harness 的插件管理器安装本仓库（GitHub 来源）：

```
git+https://github.com/Traveler-Yan/json-tools-plugin.git
```

安装后的 bundle 名为 `@local/json-tools`。

## 目录

| 文件 | 说明 |
| --- | --- |
| `client.js` | 面板 UI、槽位注册、解析与纠错逻辑 |
| `index.js` | Host 半边（无行为） |
| `cordis.patch.yml` | 插入插件行 |
| `locale/*.json` | 插件列表中的标题与描述 |
| `icon.svg` | 图标 |
