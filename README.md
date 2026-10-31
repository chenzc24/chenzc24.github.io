# 陈增春的个人主页

纯静态网站，无构建步骤、无第三方运行时依赖。发布目标为 https://chenzc24.github.io/，源码仓库为 https://github.com/chenzc24/chenzc24.github.io。

GitHub Pages 通过 `.github/workflows/pages.yml` 部署，先运行静态检查，再发布 `dist/`。推送到 `main` 或在 Actions 中手动运行工作流会更新网站。首次启用时，在仓库 Settings → Pages 中选择 GitHub Actions。

## 页面结构

- `dist/index.html`：个人介绍、生活照、最新一条近况、带图注的科学动图、三项带缩略图的精选内容入口。
- `dist/resume.html`：基本信息与证件照、研究、开源项目（项目图带编号图注）、经历。
- `dist/io-ring.html` 等四个项目页：短介绍、带编号图注的项目原图、原始链接。
- `dist/notes.html`：两则短札记，从首页“电路之外”进入。
- `dist/updates.html`：独立的近况专栏，可从全站顶部导航或首页介绍下方进入，按时间记录学习、项目与生活。
- `dist/404.html`：找不到页面时由 GitHub Pages 返回，莫比乌斯带缓慢转动。页面用 `<base href="/">`，在任意路径下都能正确加载样式与链接。

保留原有 HTML 地址，页面之间使用普通链接。中文为默认语言，语言选择在本机保存。

## 维护入口

```text
dist/
  *.html              页面入口、元信息、脚本加载顺序
  favicon.svg         网站图标：印着 ZC24 的芯片
  data/
    profile.js        个人信息、照片、经历、双语介绍、页脚城市与时区、姓名卡、立春问候
    projects.js       项目内容、原图、图注、出处、许可与链接
    notes.js          双语札记、参考链接
    updates.js        近况条目，新的放在前面；首页显示第一条
  styles/
    base.css          全站字体、颜色与强调色、导航、页脚、图框、入场动效
    home.css          首页布局
    profile.css       履历布局与打印样式
    project.css       项目详情布局
    notes.css         札记阅读布局
    updates.css       近况时间列表
    lost.css          404 页
  scripts/
    sky.js            节气与月相计算（页脚、立春问候）
    site.js           统一导航与页脚、姓名卡、语言切换、图注、入场动效、控制台问候
    home.js           首页内容
    profile.js        履历内容、章节导航、打印入口
    project.js        四个项目共用的详情模板
    notes.js          札记渲染
    updates.js        近况渲染，支持短文、图片与链接
    lost.js           404 页
    art/              科学图形与动画引擎；observatory.js 内含各形态图注；snow.js 照片落雪
  assets/             用户照片与项目原图，出处见 SOURCES.txt
    fonts/            IBM Plex 字体子集与许可（OFL-1.1）
```

内容只改 `data/`；版式只改对应页面的 CSS；全站调整先看 `base.css`。动画独立于页面内容，语言切换通过 `site:language` 事件通知动画控件。强调色只在 `base.css` 的 `--accent` 中定义，动画中的高亮也读取它。英文与数字用自托管的 IBM Plex 拉丁子集，中文仍用系统字体。

科学图形中，第 4 幅为 Calabi–Yau 相关的 Fermat 五次曲面二维截面之三维投影，并非六维球面或完整的六维流形。25 个分支用轻量网格表现体积与折叠。第 6 幅为洛伦兹吸引子，采用标准参数（10、28、8/3）和 RK4 积分，轨迹在初始化时一次计算，播放时只绘制及旋转。FT/LT 旧实现已退出加载，备份在 `qa/science-transform-retired.js`。

动图下方的图注（序号、名称、公式或构造）在 `scripts/art/observatory.js` 的 `forms` 表中维护，键为形态编号；公式与模块实际计算的关系一致，修改形态时一并更新。

首页自动显示 `updates.js` 中第一条近况的日期与标题；`profile.js` 的 `recent` 只在没有近况时作为入口。专栏不限定主题，可以记录学习、阅读、项目、旅行或日常。札记为本地编辑稿，技术内容附参考链接。

照片保留原始文件和自然比例；项目图使用 `object-fit: contain`，避免裁去电路、图表和架构内容。不要用生成图替代原图。项目图统一放在图框（`.plate`）中，图号按 `projects.js` 中的顺序，在履历页与项目页保持一致；图注文字填在各项目的 `caption`。

页脚显示城市、时区与当地时间（`profile.js` 的 `place`），以及“更新于”日期。该日期取自页面的 Last-Modified，在 GitHub Pages 上即最近一次部署，无需手动维护。

几处个人化细节：页脚显示当前节气与月相，由 `scripts/sky.js` 按 Meeus《Astronomical Algorithms》的低精度公式在浏览器中计算，节气日期按北京时间，节气当天显示“今日某某”；悬停或用键盘聚焦页眉的名字，会显示拼音与字义（`profile.js` 的 `nameCard`）；立春当天，首页问候换成 `springGreeting`；悬停或轻触首页照片，会落下几片雪；浏览器控制台里有一段问候；网站图标与页脚标记是一枚印着 ZC24 的芯片。动效在系统要求减少动态效果时关闭。

## 追加一条近况

在 `dist/data/updates.js` 的数组最前面新增一个对象即可，无需增加 HTML 页面。文字字段依次填写中文和英文，`paragraphs` 可以包含一段或多段。以下是格式示例，不是已发布内容：

```js
{
  id: 'a-new-note', // 唯一的英文标识，也可用 updates.html#a-new-note 直接访问
  date: '2026-10-29',
  dateLabel: ['2026.10.29', '29 Oct 2026'],
  title: ['标题', 'Title'],
  paragraphs: [
    ['一小段记录。', 'A short entry.']
  ]
},
```

日期支持 `YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`，只知道年份或季节时不补造具体日期；`dateLabel` 决定页面显示。可选的 `links` 格式为 `[{label: ['链接文字', 'Link label'], url: './notes.html'}]`。可选的 `image` 格式为 `{src: './assets/photo.jpg', width: 1200, height: 800, alt: ['图片说明', 'Image description']}`；请填实际尺寸，并先将原图放入 `dist/assets/`。没有链接或图片时直接省略对应字段，页面不会显示占位。

保存后运行下方检查命令，并更新 `updates.html` 与 `index.html` 中 `data/updates.js` 的版本参数，避免浏览器沿用缓存。

## 本地查看与检查

可直接打开 `dist/index.html`。推荐在此目录运行：

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

然后打开 `http://127.0.0.1:4173/`。预览结束用 Ctrl+C 关闭服务器。

```powershell
node tools/check.mjs
```

该检查只读本地文件，检查脚本语法、页面与样式表中的资源引用（含字体）、项目原图与图注、页脚时区、姓名卡，并用 2026 年的节气与日月食核对节气和月相计算。布局调整后还需检查中英文及窄屏显示。样式链接带版本参数；浏览器持有旧样式时更新该参数。

本地开发目录中的旧版备份、检查截图位于 `qa/`，不包含在公开源码和网站中。GitHub 发布源只包含当前页面、必要素材、检查脚本与部署配置，不带旧站托管配置或历史草稿。
