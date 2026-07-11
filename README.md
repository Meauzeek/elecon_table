# 《随星录》元素人物志

一个零依赖、可直接托管在 GitHub Pages 的静态设定集。

## 本地预览

直接打开 `index.html`，或在目录中运行：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 后续维护

- 人物与关系资料：`data.js` 中的 `CHARACTERS`、`SPECIAL`、`DERIVATIVES`、`OFF_GRID`
- 页面结构：`index.html`
- 五套主题（ACS、南极、Frutiger Aero、Juno、SCP）及各自夜间模式：`styles.css`
- 渲染、搜索、智能主题、统计标记与调试编辑：`app.js`

新增元素使时，在 `CHARACTERS` 中用元素符号作键添加一条记录；对应周期表格会自动点亮。人物照片可增加 `image` 字段，照片会与按 `ELECTRON_SHELLS` 绘制的原子结构图同时显示。人物所属团体可直接填写 `group` 字段；没有填写时，页面会按人物类型给出通用归类。

右上角齿轮可开启调试模式，默认密码为 `9192631770`。编辑结果会先保存到浏览器本地，也可导出为 `character-overrides.js`，便于人工复核后合并回 `data.js`。

## 资料原则

内容依据同目录设定稿整理。较新整合稿优先，重复档案用于交叉校验；原资料未明确的年龄、性别或籍贯保留“未详”。


