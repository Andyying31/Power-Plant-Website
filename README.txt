沙巴光伏自备电厂网站 v14 — 会议按钮完全后台管理

本版新增：
1. 会议页面按钮改为 Cloudflare KV 动态生成。
2. 管理后台可以新增会议按钮。
3. 所有会议按钮可以修改名称和说明。
4. 普通链接按钮可以修改网址。
5. 可以上移、下移、隐藏、显示按钮。
6. 普通链接按钮可以删除。
7. 月计划按钮保留“选择年份 → 月份 → 打开 Lark”的特殊功能，同时可以改名称、说明、排序和显示状态。为了避免误删年月选择功能，月计划按钮不提供删除按钮，可使用“隐藏”。
8. v13 已经在后台设置过的消缺单、会议纪要、会议室预订网址会在第一次运行 v14 时自动迁移，不会恢复原来的默认值。
9. 花名册、月计划、共享公告、公告历史继续使用原来的 Cloudflare KV，不会因上传 v14 而重置。

部署：
- 将 public 文件夹、src 文件夹、wrangler.jsonc 和 README.txt 上传到现有 GitHub 仓库根目录。
- Cloudflare 会继续执行 npx wrangler deploy。
- 不需要新建 KV，也不要删除 power-plant-shared-board。
- 现有 ADMIN_PASSWORD Secret 继续使用，不需要写入 GitHub。

Cloudflare KV binding：SHARED_BOARD
Namespace ID：fcae3bdfe7424fa9bde0c071d38ae177
