沙巴光伏自备电厂网站 v12

本版本新增：
1. 共享公告历史版本
   - 自动保存公告
   - 最多保留 20 个历史版本
   - 大量删除时优先自动留档
   - 管理员可恢复旧版本

2. 月计划链接网页管理
   - 管理后台选择年份 / 月份
   - 粘贴 Lark 链接后保存
   - 前台自动读取，不需要再修改 script.js

3. 花名册网页管理
   - 新增 / 编辑 / 删除人员
   - 自动计算总人数、管理、运行、维护、正式、试用、离职
   - 前台自动读取，不需要再修改 index.html

Cloudflare：
- 继续使用原来的 KV Namespace
- Binding: SHARED_BOARD
- Namespace ID: fcae3bdfe7424fa9bde0c071d38ae177

重要：启用管理后台前，需要在 Cloudflare Worker 中设置 Secret：
Variable name: ADMIN_PASSWORD
Value: 你自己设置的管理员密码

Cloudflare 路径：
Workers & Pages
→ power-plant-website
→ Settings
→ Variables and Secrets
→ Add
→ Type: Secret
→ Variable name: ADMIN_PASSWORD
→ Value: 自己的管理员密码
→ Deploy

部署：
把 public、src、wrangler.jsonc、README.txt 上传到 GitHub 仓库根目录，
Commit 后 Cloudflare 会自动执行 npx wrangler deploy。
