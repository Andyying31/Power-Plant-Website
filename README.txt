沙巴光伏自备电厂网站 v11 - Cloudflare 共享公告正式版

本版本已写入 Workers KV：
Namespace: power-plant-shared-board
Namespace ID: fcae3bdfe7424fa9bde0c071d38ae177
Binding: SHARED_BOARD

文件结构：
public/index.html
public/style.css
public/script.js
src/index.js
wrangler.jsonc

共享公告工作方式：
1. 网页通过 /api/shared-note 读取共享文字。
2. 停止输入约 1.2 秒后自动保存。
3. Worker 使用 SHARED_BOARD binding 写入 Cloudflare KV。
4. 其他人访问同一网站即可读取同一份内容。

注意：
wrangler.jsonc 已经是 Cloudflare Worker 的配置来源，请不要删除其中的 kv_namespaces 配置。
