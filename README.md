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
- 三套主题与夜间模式：`styles.css`
- 渲染、搜索和智能主题：`app.js`

新增元素使时，在 `CHARACTERS` 中用元素符号作键添加一条记录；对应周期表格会自动点亮。人物照片可后续增加 `image` 字段，并在 `profileHTML()` 中把默认原子图替换为 `<img>`。

## 资料原则

内容依据同目录设定稿整理。较新整合稿优先，重复档案用于交叉校验；原资料未明确的年龄、性别或籍贯保留“未详”。

