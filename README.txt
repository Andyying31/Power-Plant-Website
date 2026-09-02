沙巴光伏自备电厂网站 v18｜30分钟自动退出版

本版登录规则：
- 网站只有密码，没有用户名。
- 普通网站密码：Cloudflare Secret = SITE_PASSWORD。
- 管理后台密码：Cloudflare Secret = ADMIN_PASSWORD。
- 普通网站登录后，只要连续 30 分钟没有点击、键盘输入、触摸或滚动，就会自动退出并要求重新输入 SITE_PASSWORD。
- 管理后台登录后，只要连续 30 分钟没有在管理后台操作，就会退出管理后台并要求重新输入 ADMIN_PASSWORD。
- 关闭网站标签页 / 页面后重新打开，需要重新输入 SITE_PASSWORD。
- 关闭页面后重新进入管理后台，也需要重新输入 ADMIN_PASSWORD。
- 正常刷新同一个已打开的标签页，不会因为刷新立刻要求重新登录；只有关闭后重开或闲置满 30 分钟才会退出。
- 修改 SITE_PASSWORD 后，旧的网站登录状态会失效。
- 花名册、会议按钮、月计划、共享公告、公告历史仍保存在原来的 Cloudflare KV，不会因为升级本版而重置。

Cloudflare 需要的 Secret：
1. SITE_PASSWORD = 员工进入整个网站的访问密码
2. ADMIN_PASSWORD = 进入“管理后台”的管理员密码

两个密码建议不要设成一样。不要把真实密码写进 GitHub、wrangler.jsonc 或发给 ChatGPT。

部署：
1. 先确认 Cloudflare -> power-plant-website -> Settings -> Variables and Secrets 已有 SITE_PASSWORD 和 ADMIN_PASSWORD。
2. 把本文件夹的 public、src、wrangler.jsonc、README.txt 上传到 GitHub 仓库根目录。
3. Commit changes。
4. 等 Cloudflare 自动部署完成。
5. 用无痕窗口测试：登录 -> 使用；关闭标签页再打开应重新要求网站密码。
6. 可暂时把测试空闲时间改短做开发测试，但正式版已固定为 30 分钟。
