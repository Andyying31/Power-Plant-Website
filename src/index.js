const DEFAULT_MONTH_PLANS = {
    "2026-08": "https://rjpl4x6x1094.jp.larksuite.com/sheets/Nj8msYUuWhUPQwt4bBWjKUkJpRd?sheet=0XXsMf"
};

const DEFAULT_MEETING_LINKS = {
    defect: "https://www.larksuite.com/",
    minutes: "https://www.larksuite.com/",
    room: "https://www.larksuite.com/"
};

const DEFAULT_ROSTER = [
    {
        "uid": "seed-001",
        "employeeId": "L30033",
        "name": "卢彦廷 LU YANTING",
        "category": "管理",
        "position": "自备电厂部经理 POWER PLANT MANAGER",
        "title": "经理",
        "status": "正式"
    },
    {
        "uid": "seed-002",
        "employeeId": "L30056",
        "name": "樊军辉 FAN JUNHUI",
        "category": "维护",
        "position": "电厂设备主任 POWER PLANT FACILITY MANAGER",
        "title": "主任",
        "status": "正式"
    },
    {
        "uid": "seed-003",
        "employeeId": "M40898",
        "name": "佰瓦特 BAIWAT WATSON BIN ELIN",
        "category": "维护",
        "position": "机械技师 MECHANICAL TECHNICIAN II",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-004",
        "employeeId": "M41853",
        "name": "史健伟 CLEMENT SHIH CHEN VUI",
        "category": "维护",
        "position": "电厂助理工程师. POWER PLANT ASSISTANT ENGINEER",
        "title": "助理工程师",
        "status": "正式"
    },
    {
        "uid": "seed-005",
        "employeeId": "M42192",
        "name": "阿子湾 AZIWAN BIN TAMIN",
        "category": "维护",
        "position": "机械技师 MECHANICAL TECHNICIAN II",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-006",
        "employeeId": "M42808",
        "name": "张建兴 CHONG KHEN HIN",
        "category": "维护",
        "position": "机械技师 MECHANICAL TECHNICIAN II",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-007",
        "employeeId": "M44491",
        "name": "李建全 LI JIANQUAN",
        "category": "管理",
        "position": "双内燃机主任工程师 Chief Engineer, Dual Internal Combustion Engines",
        "title": "主任工程师",
        "status": "试用"
    },
    {
        "uid": "seed-008",
        "employeeId": "M44860",
        "name": "思安 SEBASTIAN LESLIE JOE",
        "category": "维护",
        "position": "电厂电工 POWER PLANT ELECTRICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-009",
        "employeeId": "M44859",
        "name": "马哈迪 MAHADHIR BIN ABD KARIM",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "离职"
    },
    {
        "uid": "seed-010",
        "employeeId": "M44884",
        "name": "尼乔 NEILTON JOEL VENEDDEY VENCENT",
        "category": "维护",
        "position": "电厂电工 POWER PLANT ELECTRICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-011",
        "employeeId": "M44903",
        "name": "冯亮 FENG LIANG",
        "category": "管理",
        "position": "双内燃机主任工程师 Chief Engineer, Dual Internal Combustion Engines",
        "title": "主任工程师",
        "status": "试用"
    },
    {
        "uid": "seed-012",
        "employeeId": "M45040",
        "name": "路永飞 LU YUNGFEI",
        "category": "管理",
        "position": "电仪资深技师 SENIOR E&I TECHNICIAN",
        "title": "主任工程师",
        "status": "试用"
    },
    {
        "uid": "seed-013",
        "employeeId": "M44915",
        "name": "柯文深 KEVIN SHERN JERRY",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-014",
        "employeeId": "M44912",
        "name": "尔钻夏 MOHAMMAD ELZUANSYAH",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-015",
        "employeeId": "M44913",
        "name": "穆宇然 MUHAMAD YUZRAN BIN MASRAN",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-016",
        "employeeId": "M44914",
        "name": "李英杰 BRANDON LEE ING JAK",
        "category": "维护",
        "position": "电厂电工 POWER PLANT ELECTRICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-017",
        "employeeId": "M42086",
        "name": "罗伊玛尼 ROYMAXNE BESANTI",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-018",
        "employeeId": "M44918",
        "name": "奈旻 ABDUL NA IM BIN HENDRY",
        "category": "维护",
        "position": "电厂电工 POWER PLANT ELECTRICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-019",
        "employeeId": "M44935",
        "name": "哈启明 AFIQ HAIKAL HAKIMI BIN AZMAN",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-020",
        "employeeId": "M44909",
        "name": "刘岑宇 LIU CENYU",
        "category": "运行",
        "position": "运行值班长 OPERATION SHIFT SUPERVISOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-021",
        "employeeId": "M44938",
        "name": "王孙勇 TONIE WONG SUN YUNG",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-022",
        "employeeId": "M44942",
        "name": "志安丁 MOHD AZAMUDDIN BIN HASANAL",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-023",
        "employeeId": "M44939",
        "name": "安德仁 ADRIAN FARHAN BIN FAIZAL",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-024",
        "employeeId": "M44937",
        "name": "介维泽 JAYVERST JASTERN JUSTINUS",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-025",
        "employeeId": "M42720",
        "name": "拉尤斯 MOHAMMAD RAJUS BIN SHUKOR",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-026",
        "employeeId": "M44992",
        "name": "瑞安 RYAN SCHILLARY LOBIUN",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-027",
        "employeeId": "M42779",
        "name": "纳斯鲁尔 Nasrul Alsyahfee",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-028",
        "employeeId": "M40253",
        "name": "阿兹里 Mohd Azley Bin Mustapha",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-029",
        "employeeId": "M42141",
        "name": "卡马鲁丁 Kamarudin Bin Abdul Pani",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "正式"
    },
    {
        "uid": "seed-030",
        "employeeId": "M45041",
        "name": "里祖安 Rizuan Bin Ajak",
        "category": "维护",
        "position": "电厂电工 POWER PLANT ELECTRICAL TECHNICIAN",
        "title": "技术员",
        "status": "离职"
    },
    {
        "uid": "seed-031",
        "employeeId": "M45055",
        "name": "夏宇索 MOHAMMAD SYAH YUSSOF",
        "category": "运行",
        "position": "余热发电工程师 STEAM ENGINEER",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-032",
        "employeeId": "M45065",
        "name": "嘉维霖 JAVILIN @ JABILIN BIN SIYU",
        "category": "运行",
        "position": "锅炉工 BOILERMAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-033",
        "employeeId": "M45094",
        "name": "雷克斯 LEX CORNARD LAWRENCE",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-034",
        "employeeId": "M45056",
        "name": "迈泽安 MOHD MAIRZAM BIN YASIR",
        "category": "维护",
        "position": "电厂机械工 POWER PLANT MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-035",
        "employeeId": "M45111",
        "name": "伍俊 WU JUN",
        "category": "运行",
        "position": "运行值班长 OPERATION SHIFT SUPERVISOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-036",
        "employeeId": "M45112",
        "name": "徐洁 XU JIE",
        "category": "维护",
        "position": "机务资深技师 SENIOR MECHANICAL TECHNICIAN",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-037",
        "employeeId": "M45113",
        "name": "何伟雄 HE WEIXIONG",
        "category": "维护",
        "position": "运行值班长 OPERATION SHIFT SUPERVISOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-038",
        "employeeId": "M45150",
        "name": "谢佳宏 CHIA JIA HONG",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-039",
        "employeeId": "M45179",
        "name": "林志梁 LIM ZHI LIANG",
        "category": "维护",
        "position": "电厂助理工程师 POWER PLANT ASSISTANT ENGINEER",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-040",
        "employeeId": "M45201",
        "name": "黄素雯 MOHAMAD SHAFIZUL WONG SUE VUN",
        "category": "运行",
        "position": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-041",
        "employeeId": "M45067",
        "name": "郭峰 GUO FENG",
        "category": "运行",
        "position": "运行值班长 OPERATION SHIFT SUPERVISOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-042",
        "employeeId": "M45149",
        "name": "马衍振 MA YANZHEN",
        "category": "运行",
        "position": "运行值班长 OPERATION SHIFT SUPERVISOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-043",
        "employeeId": "M45134",
        "name": "邓启雄 DENG QIXIONG",
        "category": "维护",
        "position": "维修技师 MAINTENANCE TECHNICIAN",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-044",
        "employeeId": "M45207",
        "name": "高龙 GAO LONG",
        "category": "运行",
        "position": "主值 CHIEF OPERATOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-045",
        "employeeId": "M45208",
        "name": "陈艺 CHEN YI",
        "category": "运行",
        "position": "主值 CHIEF OPERATOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-046",
        "employeeId": "M45249",
        "name": "陈浩 CHEN HAO",
        "category": "运行",
        "position": "主值 CHIEF OPERATOR",
        "title": "工程师",
        "status": "试用"
    },
    {
        "uid": "seed-047",
        "employeeId": "M45298",
        "name": "田志伟 AARON THIAN JIA VUI",
        "category": "运行",
        "position": "机械工业 MECHANICAL ENGINERING",
        "title": "技术员",
        "status": "试用"
    },
    {
        "uid": "seed-048",
        "employeeId": "M45300",
        "name": "JESON CHIN NYUK HIUNG",
        "category": "运行",
        "position": "机械工业 MECHANICAL ENGINERING",
        "title": "电厂巡检员 POWER PLANT PATROL INSPECTOR",
        "status": "试用"
    },
    {
        "uid": "seed-049",
        "employeeId": "M50268",
        "name": "张训豪 CHONG SOON HAU",
        "category": "维护",
        "position": "自备电厂文员",
        "title": "自备电厂文员",
        "status": "试用"
    },
    {
        "uid": "seed-050",
        "employeeId": "M45299",
        "name": "杜同磊_DU TONGLEI",
        "category": "运行",
        "position": "主值 CHIEF OPERATOR",
        "title": "",
        "status": "试用"
    }
];

const NOTE_KEY = "shared-note";
const NOTE_HISTORY_KEY = "shared-note-history";
const MONTH_PLAN_KEY = "month-plan-links";
const MEETING_LINK_KEY = "meeting-links";
const MEETING_BUTTON_KEY = "meeting-buttons-v2";
const ROSTER_KEY = "roster-data";
const PORTAL_MODULES_KEY = "portal-modules-v1";
const PORTAL_BUTTONS_KEY = "portal-module-buttons-v1";

const DEFAULT_PORTAL_MODULES = [
    { id: "meeting", name: "部门管理例会", description: "部门管理例会相关业务入口", kind: "generic", visible: true },
    { id: "process-operation", name: "工艺运行", description: "工艺运行相关资料与快捷入口", kind: "generic", visible: true },
    { id: "maintenance-work", name: "维护工作", description: "维护工作相关资料与快捷入口", kind: "generic", visible: true },
    { id: "chemistry", name: "化学", description: "化学相关资料与快捷入口", kind: "generic", visible: true },
    { id: "daily", name: "日报", description: "日报相关业务入口", kind: "generic", visible: true },
    { id: "roster", name: "花名册", description: "人员资料及部门组织结构", kind: "roster", visible: true },
    { id: "notice", name: "共享公告", description: "部门共享公告与协作内容", kind: "notice", visible: true }
];

// ===== Account login + role permissions =====
// Built-in administrator account: username "admin", password from ADMIN_PASSWORD secret.
// Staff accounts are created in the admin console and stored in KV with PBKDF2 password hashes.
const SITE_SESSION_COOKIE = "pp_site_session";
const SITE_SESSION_SECONDS = 30 * 60;
const USER_ACCOUNTS_KEY = "user-accounts-v1";
const AUDIT_LOG_KEY = "audit-log-v1";
const SYSTEM_SETTINGS_KEY = "system-settings-v1";
const FAVORITES_KEY_PREFIX = "favorites-v1:";
const PASSWORD_ITERATIONS = 20000;
const MAX_USERS = 300;
const MAX_AUDIT_LOGS = 500;

const DEFAULT_SYSTEM_SETTINGS = {
    siteName: "沙巴光伏自备电厂",
    siteSubtitle: "内部业务系统",
    portalTitle: "沙巴光伏自备电厂导航",
    portalSubtitle: "部门业务总览",
    homeTitle: "沙巴光伏自备电厂",
    homeDescription: "请选择需要进入的业务模块",
    homeBadge: "部门业务总览",
    footerText: "© 2026 沙巴光伏自备电厂"
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === "/login") {
            return handleSiteLogin(request, env);
        }

        if (url.pathname === "/logout") {
            return handleSiteLogout(request);
        }

        if (url.pathname === "/manifest.webmanifest" || url.pathname === "/sw.js" || url.pathname.startsWith("/icons/")) {
            return env.ASSETS.fetch(request);
        }

        const siteAuth = await checkSiteAccess(request, env);
        if (!siteAuth.ok) {
            if (url.pathname.startsWith("/api/")) {
                return jsonResponse(
                    {
                        ok: false,
                        loginRequired: true,
                        error: siteAuth.configMissing
                            ? "ADMIN_PASSWORD is not configured."
                            : "请先登录系统。"
                    },
                    siteAuth.configMissing ? 503 : 401
                );
            }

            const next = url.pathname + url.search;
            return redirectResponse(`/login?next=${encodeURIComponent(next)}`);
        }

        if (siteAuth.user.username !== "admin" && url.pathname.startsWith("/api/")) {
            const account = await getUserAccount(env, siteAuth.user.username);
            if (!account || account.active === false) {
                return jsonResponse({ ok: false, loginRequired: true, error: "账号已停用或不存在，请联系管理员。" }, 401);
            }
            if (account.role !== siteAuth.user.role) {
                return jsonResponse({ ok: false, loginRequired: true, error: "账号权限已更新，请重新登录。" }, 401);
            }
            siteAuth.user.displayName = account.displayName || account.username;
        }

        const routedRequest = attachAuthContext(request, siteAuth.user);
        const auditBodyPromise = ["POST", "PUT", "DELETE"].includes(request.method)
            ? routedRequest.clone().json().catch(() => null)
            : null;
        let response;
        let auditAction = "";
        let auditTarget = "";

        if (url.pathname === "/api/me") {
            return jsonResponse({ ok: true, user: siteAuth.user });
        }

        if (url.pathname === "/api/site/session/touch") {
            return handleSiteSessionTouch(routedRequest, env, siteAuth.user);
        }

        if (url.pathname === "/api/account/password") {
            response = await handleOwnPasswordChange(routedRequest, env);
            if (request.method === "POST") {
                auditAction = "修改自己的密码";
                auditTarget = "用户账号";
            }
        } else if (url.pathname === "/api/shared-note") {
            response = await handleSharedNote(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "更新共享公告";
                auditTarget = "共享公告";
            }
        } else if (url.pathname === "/api/shared-note/history") {
            response = await handleSharedNoteHistory(routedRequest, env);
        } else if (url.pathname === "/api/shared-note/restore") {
            response = await handleSharedNoteRestore(routedRequest, env);
            if (request.method === "POST") {
                auditAction = "恢复公告历史版本";
                auditTarget = "共享公告";
            }
        } else if (url.pathname === "/api/portal-config") {
            response = await handlePortalConfig(routedRequest, env);
        } else if (url.pathname === "/api/favorites") {
            response = await handleFavorites(routedRequest, env);
        } else if (url.pathname === "/api/portal-modules") {
            response = await handlePortalModules(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "修改主页模块";
                auditTarget = "主页模块";
            }
        } else if (url.pathname === "/api/portal-buttons") {
            response = await handlePortalButtons(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "修改模块内部按钮";
                auditTarget = "模块按钮";
            }
        } else if (url.pathname === "/api/month-plans") {
            response = await handleMonthPlans(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "修改月计划链接";
                auditTarget = "月计划";
            }
        } else if (url.pathname === "/api/meeting-buttons") {
            response = await handleMeetingButtons(routedRequest, env);
            if (request.method !== "GET") {
                auditAction = "修改会议按钮";
                auditTarget = "会议按钮";
            }
        } else if (url.pathname === "/api/meeting-links") {
            response = await handleMeetingLinks(routedRequest, env);
            if (request.method !== "GET") {
                auditAction = "修改会议链接";
                auditTarget = "会议链接";
            }
        } else if (url.pathname === "/api/roster") {
            response = await handleRoster(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "修改花名册";
                auditTarget = "花名册";
            }
        } else if (url.pathname === "/api/system-settings") {
            response = await handleSystemSettings(routedRequest, env);
            if (request.method === "PUT") {
                auditAction = "修改系统设置";
                auditTarget = "系统设置";
            }
        } else if (url.pathname === "/api/admin/users") {
            response = await handleAdminUsers(routedRequest, env);
            if (request.method === "POST") {
                auditAction = "管理用户账号";
                auditTarget = "用户账号";
            }
        } else if (url.pathname === "/api/admin/audit") {
            response = await handleAdminAudit(routedRequest, env);
        } else if (url.pathname === "/api/admin/backup") {
            response = await handleAdminBackup(routedRequest, env);
            if (request.method === "GET") {
                auditAction = "导出完整备份";
                auditTarget = "数据备份";
            }
        } else if (url.pathname === "/api/admin/restore") {
            response = await handleAdminRestore(routedRequest, env);
            if (request.method === "POST") {
                auditAction = "恢复完整备份";
                auditTarget = "数据备份";
            }
        } else if (url.pathname === "/api/admin/verify") {
            response = await handleAdminVerify(routedRequest, env);
        } else {
            return env.ASSETS.fetch(request);
        }

        if (auditAction && response && response.status < 400) {
            try {
                const auditBody = auditBodyPromise ? await auditBodyPromise : null;
                const detail = buildAuditDetail(url.pathname, request.method, auditBody);
                await writeAudit(env, routedRequest, auditAction, auditTarget, detail);
            } catch (error) {
                // Audit logging must not block the requested operation.
            }
        }

        return response;
    }
};

function attachAuthContext(request, user) {
    const headers = new Headers(request.headers);
    headers.set("X-PP-Username", user.username || "");
    headers.set("X-PP-Role", user.role || "user");
    return new Request(request, { headers });
}

async function handleSiteLogin(request, env) {
    const url = new URL(request.url);
    const requestedNext = sanitizeNextPath(url.searchParams.get("next"));
    const settings = await safeGetSystemSettings(env);

    if (request.method === "GET") {
        return loginPage({
            next: requestedNext,
            configMissing: !env.ADMIN_PASSWORD,
            settings
        });
    }

    if (request.method !== "POST") {
        return methodNotAllowed("GET, POST");
    }

    if (!env.ADMIN_PASSWORD) {
        return loginPage({
            next: requestedNext,
            configMissing: true,
            settings
        }, 503);
    }

    let form;
    try {
        form = await request.formData();
    } catch {
        return loginPage({ next: requestedNext, error: "提交格式不正确，请重试。", settings }, 400);
    }

    const username = normalizeUsername(form.get("username"));
    const supplied = String(form.get("password") || "");
    const next = sanitizeNextPath(form.get("next") || requestedNext);

    if (!username || !supplied) {
        return loginPage({ next, error: "请输入用户名和密码。", settings }, 401);
    }

    let user = null;

    if (username === "admin") {
        if (supplied === env.ADMIN_PASSWORD) {
            user = {
                username: "admin",
                displayName: "系统管理员",
                role: "admin"
            };
        }
    } else {
        try {
            const accounts = await getUserAccounts(env);
            const account = accounts.find((item) => item.username === username);
            if (account && account.active !== false && await verifyStoredPassword(supplied, account)) {
                user = {
                    username: account.username,
                    displayName: account.displayName || account.username,
                    role: account.role === "admin" ? "admin" : "user"
                };
            }
        } catch (error) {
            return loginPage({ next, error: "暂时无法读取账号资料，请稍后再试。", settings }, 503);
        }
    }

    if (!user) {
        return loginPage({ next, error: "用户名或密码不正确。", settings }, 401);
    }

    const token = await createSiteSessionToken(env.ADMIN_PASSWORD, user);
    const headers = new Headers({ "Cache-Control": "no-store" });
    headers.append(
        "Set-Cookie",
        `${SITE_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    try {
        await appendAuditEntry(env, {
            actor: user.username,
            role: user.role,
            action: "登录系统",
            target: "身份验证"
        });
    } catch (error) {}

    return loginSuccessPage(next, headers);
}

function handleSiteLogout(request) {
    const url = new URL(request.url);
    const next = sanitizeNextPath(url.searchParams.get("next"));
    const location = `/login?next=${encodeURIComponent(next)}`;
    const headers = new Headers({
        "Location": location,
        "Cache-Control": "no-store"
    });
    headers.append(
        "Set-Cookie",
        `${SITE_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
    );
    return new Response(null, { status: 303, headers });
}

async function handleSiteSessionTouch(request, env, user) {
    if (request.method !== "POST") {
        return methodNotAllowed("POST");
    }

    const token = await createSiteSessionToken(env.ADMIN_PASSWORD, user);
    const headers = new Headers({
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store"
    });
    headers.append(
        "Set-Cookie",
        `${SITE_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers });
}

async function checkSiteAccess(request, env) {
    if (!env.ADMIN_PASSWORD) {
        return { ok: false, configMissing: true };
    }

    const token = getCookie(request, SITE_SESSION_COOKIE);
    if (!token) {
        return { ok: false, configMissing: false };
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
        return { ok: false, configMissing: false };
    }

    const payloadEncoded = parts[0];
    const signature = parts[1];
    const expected = await signSiteSession(env.ADMIN_PASSWORD, payloadEncoded);
    if (!timingSafeEqual(signature, expected)) {
        return { ok: false, configMissing: false };
    }

    let payload;
    try {
        payload = JSON.parse(base64UrlToText(payloadEncoded));
    } catch {
        return { ok: false, configMissing: false };
    }

    const issuedAt = Number(payload?.iat);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(issuedAt) || issuedAt > now + 300 || now - issuedAt > SITE_SESSION_SECONDS) {
        return { ok: false, configMissing: false };
    }

    const username = normalizeUsername(payload?.u);
    const role = payload?.r === "admin" ? "admin" : "user";
    if (!username) {
        return { ok: false, configMissing: false };
    }

    return {
        ok: true,
        configMissing: false,
        user: {
            username,
            displayName: typeof payload?.d === "string" && payload.d.trim() ? payload.d.trim().slice(0, 80) : username,
            role
        }
    };
}

async function createSiteSessionToken(secret, user) {
    const payload = {
        u: user.username,
        d: user.displayName || user.username,
        r: user.role === "admin" ? "admin" : "user",
        iat: Math.floor(Date.now() / 1000)
    };
    const encoded = textToBase64Url(JSON.stringify(payload));
    const signature = await signSiteSession(secret, encoded);
    return `${encoded}.${signature}`;
}

async function signSiteSession(secret, payloadEncoded) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(`power-plant-account-session-v2:${payloadEncoded}`)
    );
    return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes) {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
    const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function textToBase64Url(value) {
    return bytesToBase64Url(new TextEncoder().encode(String(value)));
}

function base64UrlToText(value) {
    return new TextDecoder().decode(base64UrlToBytes(value));
}

function timingSafeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

function getCookie(request, name) {
    const raw = request.headers.get("Cookie") || "";
    const parts = raw.split(";");
    for (const part of parts) {
        const index = part.indexOf("=");
        if (index < 0) continue;
        const key = part.slice(0, index).trim();
        if (key === name) return part.slice(index + 1).trim();
    }
    return "";
}

function normalizeUsername(value) {
    const username = String(value || "").trim().toLowerCase();
    return /^[a-z0-9._-]{3,32}$/.test(username) ? username : "";
}

function sanitizeNextPath(value) {
    const next = typeof value === "string" ? value.trim() : "";
    if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/";
    return next;
}

function redirectResponse(location) {
    return new Response(null, {
        status: 302,
        headers: { "Location": location, "Cache-Control": "no-store" }
    });
}

function loginSuccessPage(next, headers) {
    const safeNext = JSON.stringify(sanitizeNextPath(next)).replace(/</g, "\\u003c");
    const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>正在进入系统</title></head>
<body><script>
try {
    sessionStorage.setItem("powerPlantSiteTabSession", "1");
    sessionStorage.setItem("powerPlantSiteLastActivity", String(Date.now()));
} catch (e) {}
location.replace(${safeNext});
<\/script></body></html>`;
    headers.set("Content-Type", "text/html; charset=UTF-8");
    return new Response(html, { status: 200, headers });
}

function loginPage({ next = "/", error = "", configMissing = false, settings = DEFAULT_SYSTEM_SETTINGS } = {}, status = 200) {
    const safeNext = escapeHtml(sanitizeNextPath(next));
    const cfg = normalizeSystemSettings(settings);
    const message = configMissing
        ? "系统管理员密码尚未配置，请先在 Cloudflare Variables and Secrets 设置 ADMIN_PASSWORD。"
        : error;

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#1677ff">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="自备电厂">
<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/icons/icon-192.png">
<title>登录｜${escapeHtml(cfg.siteName)}</title>
<style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",Arial,sans-serif;background:#f5f8fc;color:#182230}
body{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 0%,#eef6ff 0,#f7f9fc 42%,#f5f7fa 100%)}
.login-shell{width:min(100%,430px)}.brand{text-align:center;margin-bottom:24px}.brand-mark{width:54px;height:54px;margin:0 auto 14px;border-radius:16px;display:grid;place-items:center;background:#1677ff;color:#fff;font-size:23px;font-weight:700;box-shadow:0 10px 28px rgba(22,119,255,.22)}
.brand h1{margin:0;font-size:22px;line-height:1.35;font-weight:700}.brand p{margin:7px 0 0;color:#7b8794;font-size:13px}.card{background:#fff;border:1px solid #e7ebf0;border-radius:18px;padding:28px;box-shadow:0 16px 45px rgba(16,36,62,.08)}
.card h2{margin:0 0 7px;font-size:20px;text-align:center}.card .tip{margin:0 0 22px;color:#8b96a5;text-align:center;font-size:13px}.field{margin-top:14px}.field:first-of-type{margin-top:0}label{display:block;margin:0 0 8px;font-size:13px;font-weight:600;color:#4b5563}
input{width:100%;height:48px;border:1px solid #dce2e8;border-radius:11px;padding:0 14px;font-size:15px;outline:none;background:#fff;transition:.18s}input:focus{border-color:#1677ff;box-shadow:0 0 0 3px rgba(22,119,255,.10)}
button{width:100%;height:48px;margin-top:18px;border:0;border-radius:11px;background:#1677ff;color:#fff;font-size:15px;font-weight:650;cursor:pointer;box-shadow:0 7px 18px rgba(22,119,255,.20)}button:hover{background:#0f6de8}button:active{transform:scale(.99)}
.alert{margin:0 0 16px;padding:11px 12px;border-radius:10px;background:#fff2f0;border:1px solid #ffccc7;color:#b42318;font-size:13px;line-height:1.5}.footer{text-align:center;margin-top:18px;color:#9aa4b2;font-size:12px}
@media(max-width:520px){body{padding:max(16px,env(safe-area-inset-top)) 16px max(16px,env(safe-area-inset-bottom));align-items:center}.login-shell{width:100%;max-width:390px}.brand{margin-bottom:18px}.brand-mark{width:48px;height:48px;margin-bottom:12px;border-radius:14px;font-size:20px}.brand h1{font-size:20px}.brand p{margin-top:5px;font-size:12px}.card{padding:22px 18px;border-radius:16px;box-shadow:0 10px 30px rgba(16,36,62,.07)}.card h2{font-size:19px}.card .tip{margin-bottom:18px;font-size:12px}label{font-size:12px}input{height:46px;font-size:16px}button{height:46px;margin-top:16px}.footer{margin-top:14px;font-size:11px}}
</style></head>
<body><main class="login-shell"><div class="brand"><div class="brand-mark">光</div><h1>${escapeHtml(cfg.siteName)}</h1><p>${escapeHtml(cfg.siteSubtitle)}</p></div>
<section class="card"><h2>账号登录</h2><p class="tip">请输入管理员创建的用户名和密码</p>${message ? `<div class="alert">${escapeHtml(message)}</div>` : ""}
<form method="post" action="/login" autocomplete="on"><input type="hidden" name="next" value="${safeNext}">
<div class="field"><label for="username">用户名</label><input id="username" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" autofocus required placeholder="请输入用户名"></div>
<div class="field"><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required placeholder="请输入密码"></div>
<button type="submit">进入系统</button></form></section><div class="footer">仅限授权人员使用</div></main>
<script>try{sessionStorage.removeItem("powerPlantSiteTabSession");sessionStorage.removeItem("powerPlantSiteLastActivity");sessionStorage.removeItem("powerPlantAdminPassword");sessionStorage.removeItem("powerPlantAdminLastActivity")}catch(e){}if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}<\/script>
</body></html>`;

    return new Response(html, {
        status,
        headers: {
            "Content-Type": "text/html; charset=UTF-8",
            "Cache-Control": "no-store",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer"
        }
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function ensureKv(env) {
    if (!env.SHARED_BOARD) throw new Error("SHARED_BOARD KV binding is not configured.");
}

function buildAuditDetail(pathname, method, body) {
    if (!body || typeof body !== "object") return "";
    if (pathname === "/api/account/password") return "用户自行修改登录密码";
    if (pathname === "/api/admin/users") {
        const actionMap = { create: "创建", update: "更新", delete: "删除" };
        const action = actionMap[body.action] || String(body.action || "操作");
        return `${action}用户：${String(body.username || "").slice(0, 32)}`;
    }
    if (pathname === "/api/portal-modules") {
        return Array.isArray(body.modules) ? `主页模块数量：${body.modules.length}` : "";
    }
    if (pathname === "/api/portal-buttons") {
        return `模块：${String(body.moduleId || "").slice(0, 80)}；按钮数量：${Array.isArray(body.buttons) ? body.buttons.length : 0}`;
    }
    if (pathname === "/api/month-plans") {
        const plans = body.plans && typeof body.plans === "object" ? body.plans : body;
        return `月计划链接数量：${plans && typeof plans === "object" ? Object.keys(plans).length : 0}`;
    }
    if (pathname === "/api/roster") {
        return Array.isArray(body.roster) ? `花名册人数：${body.roster.length}` : "";
    }
    if (pathname === "/api/shared-note") {
        return typeof body.content === "string" ? `公告内容长度：${body.content.length} 字符` : "";
    }
    if (pathname === "/api/shared-note/restore") {
        return `历史版本 ID：${String(body.id || "").slice(0, 80)}`;
    }
    if (pathname === "/api/admin/restore") {
        return body.backup && Array.isArray(body.backup.entries) ? `恢复数据项：${body.backup.entries.length}` : "";
    }
    if (pathname === "/api/system-settings") return "系统显示设置已更新";
    return "";
}

function getActor(request) {
    return {
        username: normalizeUsername(request.headers.get("X-PP-Username")) || "unknown",
        role: request.headers.get("X-PP-Role") === "admin" ? "admin" : "user"
    };
}

async function writeAudit(env, request, action, target, detail = "") {
    const actor = getActor(request);
    return appendAuditEntry(env, {
        actor: actor.username,
        role: actor.role,
        action,
        target,
        detail
    });
}

async function appendAuditEntry(env, entry) {
    await ensureKv(env);
    let logs = await env.SHARED_BOARD.get(AUDIT_LOG_KEY, "json");
    if (!Array.isArray(logs)) logs = [];
    logs.unshift({
        id: crypto.randomUUID(),
        time: new Date().toISOString(),
        actor: String(entry.actor || "unknown").slice(0, 64),
        role: entry.role === "admin" ? "admin" : "user",
        action: String(entry.action || "操作").slice(0, 100),
        target: String(entry.target || "").slice(0, 120),
        detail: String(entry.detail || "").slice(0, 500)
    });
    await env.SHARED_BOARD.put(AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, MAX_AUDIT_LOGS)));
}

async function handleAdminAudit(request, env) {
    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;
    if (request.method !== "GET") return methodNotAllowed("GET");
    await ensureKv(env);
    let logs = await env.SHARED_BOARD.get(AUDIT_LOG_KEY, "json");
    if (!Array.isArray(logs)) logs = [];
    return jsonResponse({ ok: true, logs: logs.slice(0, MAX_AUDIT_LOGS) });
}

async function isActiveUserAccount(env, username) {
    try {
        const account = await getUserAccount(env, username);
        return !!account && account.active !== false;
    } catch {
        return false;
    }
}

async function getUserAccount(env, username) {
    const normalized = normalizeUsername(username);
    if (!normalized || normalized === "admin") return null;
    const accounts = await getUserAccounts(env);
    return accounts.find((item) => item.username === normalized) || null;
}

async function getUserAccounts(env) {
    await ensureKv(env);
    let accounts = await env.SHARED_BOARD.get(USER_ACCOUNTS_KEY, "json");
    if (!Array.isArray(accounts)) accounts = [];
    return accounts.map(normalizeStoredAccount).filter(Boolean);
}

function normalizeStoredAccount(item) {
    const username = normalizeUsername(item?.username);
    if (!username || username === "admin") return null;
    return {
        id: typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID(),
        username,
        displayName: typeof item?.displayName === "string" && item.displayName.trim() ? item.displayName.trim().slice(0, 80) : username,
        role: item?.role === "admin" ? "admin" : "user",
        active: item?.active !== false,
        salt: typeof item?.salt === "string" ? item.salt : "",
        hash: typeof item?.hash === "string" ? item.hash : "",
        iterations: Number.isInteger(item?.iterations) ? item.iterations : PASSWORD_ITERATIONS,
        createdAt: typeof item?.createdAt === "string" ? item.createdAt : new Date().toISOString(),
        updatedAt: typeof item?.updatedAt === "string" ? item.updatedAt : new Date().toISOString()
    };
}

async function createPasswordRecord(password) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const salt = bytesToBase64Url(saltBytes);
    const iterations = PASSWORD_ITERATIONS;
    const hash = await derivePasswordHash(password, salt, iterations);
    return { salt, hash, iterations };
}

async function derivePasswordHash(password, salt, iterations) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt: base64UrlToBytes(salt),
            iterations
        },
        baseKey,
        256
    );
    return bytesToBase64Url(new Uint8Array(bits));
}

async function verifyStoredPassword(password, account) {
    if (!account.salt || !account.hash) return false;
    const derived = await derivePasswordHash(password, account.salt, account.iterations || PASSWORD_ITERATIONS);
    return timingSafeEqual(derived, account.hash);
}

function sanitizeAccountForAdmin(account) {
    return {
        id: account.id,
        username: account.username,
        displayName: account.displayName,
        role: account.role === "admin" ? "admin" : "user",
        active: account.active !== false,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
    };
}

async function handleAdminUsers(request, env) {
    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;
    await ensureKv(env);

    if (request.method === "GET") {
        const accounts = await getUserAccounts(env);
        return jsonResponse({
            ok: true,
            admin: { username: "admin", displayName: "系统管理员", role: "admin", active: true, builtIn: true },
            users: accounts.map(sanitizeAccountForAdmin)
        });
    }

    if (request.method !== "POST") return methodNotAllowed("GET, POST");

    let body;
    try { body = await request.json(); }
    catch { return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400); }

    const action = String(body?.action || "").trim();
    let accounts = await getUserAccounts(env);

    if (action === "create") {
        if (accounts.length >= MAX_USERS) return jsonResponse({ ok: false, error: "用户数量已达到上限。" }, 413);
        const username = normalizeUsername(body?.username);
        const displayName = String(body?.displayName || "").trim().slice(0, 80);
        const password = String(body?.password || "");
        const role = body?.role === "admin" ? "admin" : "user";
        if (!username || username === "admin") return jsonResponse({ ok: false, error: "用户名只能使用 3-32 位英文字母、数字、点、下划线或短横线，且不能使用 admin。" }, 400);
        if (accounts.some((item) => item.username === username)) return jsonResponse({ ok: false, error: "这个用户名已经存在。" }, 409);
        if (password.length < 8 || password.length > 128) return jsonResponse({ ok: false, error: "密码必须为 8-128 个字符。" }, 400);
        const record = await createPasswordRecord(password);
        const now = new Date().toISOString();
        accounts.push({
            id: crypto.randomUUID(), username, displayName: displayName || username, role, active: true,
            ...record, createdAt: now, updatedAt: now
        });
        await env.SHARED_BOARD.put(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
        return jsonResponse({ ok: true, users: accounts.map(sanitizeAccountForAdmin) });
    }

    const username = normalizeUsername(body?.username);
    const index = accounts.findIndex((item) => item.username === username);
    if (index < 0) return jsonResponse({ ok: false, error: "找不到这个用户。" }, 404);

    if (action === "update") {
        const displayName = String(body?.displayName || "").trim().slice(0, 80);
        accounts[index].displayName = displayName || accounts[index].username;
        if (body?.role === "admin" || body?.role === "user") accounts[index].role = body.role;
        if (typeof body?.active === "boolean") accounts[index].active = body.active;
        const newPassword = String(body?.password || "");
        if (newPassword) {
            if (newPassword.length < 8 || newPassword.length > 128) return jsonResponse({ ok: false, error: "新密码必须为 8-128 个字符。" }, 400);
            Object.assign(accounts[index], await createPasswordRecord(newPassword));
        }
        accounts[index].updatedAt = new Date().toISOString();
        await env.SHARED_BOARD.put(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
        return jsonResponse({ ok: true, users: accounts.map(sanitizeAccountForAdmin) });
    }

    if (action === "delete") {
        const deletedUsername = accounts[index].username;
        accounts.splice(index, 1);
        await env.SHARED_BOARD.put(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
        await env.SHARED_BOARD.delete(FAVORITES_KEY_PREFIX + deletedUsername);
        return jsonResponse({ ok: true, users: accounts.map(sanitizeAccountForAdmin) });
    }

    return jsonResponse({ ok: false, error: "不支持的用户操作。" }, 400);
}

async function handleOwnPasswordChange(request, env) {
    if (request.method !== "POST") return methodNotAllowed("POST");
    await ensureKv(env);

    const username = normalizeUsername(request.headers.get("X-PP-Username"));
    if (!username) return jsonResponse({ ok: false, error: "无法识别当前账号，请重新登录。" }, 401);
    if (username === "admin") {
        return jsonResponse({ ok: false, error: "内置 admin 密码由 Cloudflare ADMIN_PASSWORD 管理，不能在网站里修改。" }, 400);
    }

    let body;
    try { body = await request.json(); }
    catch { return jsonResponse({ ok: false, error: "提交格式不正确。" }, 400); }

    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");
    if (!currentPassword) return jsonResponse({ ok: false, error: "请输入当前密码。" }, 400);
    if (newPassword.length < 8 || newPassword.length > 128) {
        return jsonResponse({ ok: false, error: "新密码必须为 8-128 个字符。" }, 400);
    }
    if (currentPassword === newPassword) {
        return jsonResponse({ ok: false, error: "新密码不能与当前密码相同。" }, 400);
    }

    const accounts = await getUserAccounts(env);
    const index = accounts.findIndex((item) => item.username === username && item.active !== false);
    if (index < 0) return jsonResponse({ ok: false, error: "账号不存在或已停用。" }, 401);
    if (!await verifyStoredPassword(currentPassword, accounts[index])) {
        return jsonResponse({ ok: false, error: "当前密码不正确。" }, 401);
    }

    Object.assign(accounts[index], await createPasswordRecord(newPassword));
    accounts[index].updatedAt = new Date().toISOString();
    await env.SHARED_BOARD.put(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
    return jsonResponse({ ok: true });
}

function normalizeSystemSettings(raw) {
    const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const field = (name, fallback, max) => {
        const value = typeof source[name] === "string" ? source[name].trim() : "";
        return (value || fallback).slice(0, max);
    };
    return {
        siteName: field("siteName", DEFAULT_SYSTEM_SETTINGS.siteName, 80),
        siteSubtitle: field("siteSubtitle", DEFAULT_SYSTEM_SETTINGS.siteSubtitle, 120),
        portalTitle: field("portalTitle", DEFAULT_SYSTEM_SETTINGS.portalTitle, 100),
        portalSubtitle: field("portalSubtitle", DEFAULT_SYSTEM_SETTINGS.portalSubtitle, 160),
        homeTitle: field("homeTitle", DEFAULT_SYSTEM_SETTINGS.homeTitle, 100),
        homeDescription: field("homeDescription", DEFAULT_SYSTEM_SETTINGS.homeDescription, 180),
        homeBadge: field("homeBadge", DEFAULT_SYSTEM_SETTINGS.homeBadge, 80),
        footerText: field("footerText", DEFAULT_SYSTEM_SETTINGS.footerText, 160)
    };
}

async function safeGetSystemSettings(env) {
    try {
        await ensureKv(env);
        const stored = await env.SHARED_BOARD.get(SYSTEM_SETTINGS_KEY, "json");
        return normalizeSystemSettings(stored);
    } catch {
        return { ...DEFAULT_SYSTEM_SETTINGS };
    }
}

async function handleSystemSettings(request, env) {
    await ensureKv(env);
    if (request.method === "GET") {
        return jsonResponse({ ok: true, settings: await safeGetSystemSettings(env) });
    }
    if (request.method !== "PUT") return methodNotAllowed("GET, PUT");
    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;
    let body;
    try { body = await request.json(); }
    catch { return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400); }
    const settings = normalizeSystemSettings(body?.settings);
    await env.SHARED_BOARD.put(SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
    return jsonResponse({ ok: true, settings });
}

async function handleSharedNote(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        const stored = await env.SHARED_BOARD.get(NOTE_KEY, "json");

        return jsonResponse({
            ok: true,
            content: stored?.content || "",
            updatedAt: stored?.updatedAt || null
        });
    }

    if (request.method === "PUT") {
        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        const content = typeof body.content === "string" ? body.content : "";

        if (content.length > 100000) {
            return jsonResponse({ ok: false, error: "Shared note is too large." }, 413);
        }

        const current = await env.SHARED_BOARD.get(NOTE_KEY, "json");
        const updatedAt = new Date().toISOString();

        if (current && current.content !== content && current.content) {
            await maybeSaveHistorySnapshot(env, current, content);
        }

        await env.SHARED_BOARD.put(
            NOTE_KEY,
            JSON.stringify({
                content,
                updatedAt
            })
        );

        return jsonResponse({
            ok: true,
            updatedAt
        });
    }

    return methodNotAllowed("GET, PUT");
}

async function maybeSaveHistorySnapshot(env, current, newContent) {
    let history = await env.SHARED_BOARD.get(NOTE_HISTORY_KEY, "json");

    if (!Array.isArray(history)) {
        history = [];
    }

    const now = Date.now();
    const latestSnapshotAt = history[0]?.snapshotAt
        ? Date.parse(history[0].snapshotAt)
        : 0;

    const oldLength = current.content?.length || 0;
    const newLength = newContent.length;

    const majorDeletion =
        oldLength >= 20 &&
        newLength < oldLength * 0.75;

    const fiveMinutesPassed =
        !latestSnapshotAt ||
        now - latestSnapshotAt >= 5 * 60 * 1000;

    if (!majorDeletion && !fiveMinutesPassed) {
        return;
    }

    history.unshift({
        id: crypto.randomUUID(),
        content: current.content || "",
        savedAt: current.updatedAt || new Date(now).toISOString(),
        snapshotAt: new Date(now).toISOString(),
        reason: majorDeletion ? "large-change" : "checkpoint"
    });

    history = history.slice(0, 20);

    await env.SHARED_BOARD.put(
        NOTE_HISTORY_KEY,
        JSON.stringify(history)
    );
}

async function handleSharedNoteHistory(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method !== "GET") {
        return methodNotAllowed("GET");
    }

    let history = await env.SHARED_BOARD.get(NOTE_HISTORY_KEY, "json");
    const current = await env.SHARED_BOARD.get(NOTE_KEY, "json");

    if (!Array.isArray(history)) {
        history = [];
    }

    return jsonResponse({
        ok: true,
        current: current || null,
        history
    });
}

async function handleSharedNoteRestore(request, env) {
    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;

    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method !== "POST") {
        return methodNotAllowed("POST");
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
    }

    const id = typeof body.id === "string" ? body.id : "";
    let history = await env.SHARED_BOARD.get(NOTE_HISTORY_KEY, "json");

    if (!Array.isArray(history)) {
        history = [];
    }

    const target = history.find((item) => item.id === id);

    if (!target) {
        return jsonResponse({ ok: false, error: "History version not found." }, 404);
    }

    const current = await env.SHARED_BOARD.get(NOTE_KEY, "json");
    const now = new Date().toISOString();

    if (current && current.content !== target.content) {
        history.unshift({
            id: crypto.randomUUID(),
            content: current.content || "",
            savedAt: current.updatedAt || now,
            snapshotAt: now,
            reason: "before-restore"
        });

        history = history.slice(0, 20);

        await env.SHARED_BOARD.put(
            NOTE_HISTORY_KEY,
            JSON.stringify(history)
        );
    }

    await env.SHARED_BOARD.put(
        NOTE_KEY,
        JSON.stringify({
            content: target.content || "",
            updatedAt: now
        })
    );

    return jsonResponse({
        ok: true,
        content: target.content || "",
        updatedAt: now
    });
}


function normalizeFavoriteKeys(source) {
    const input = Array.isArray(source) ? source : [];
    const result = [];
    const seen = new Set();
    for (const raw of input) {
        const value = typeof raw === "string" ? raw.trim() : "";
        if (!/^[A-Za-z0-9_-]{1,120}::[A-Za-z0-9_-]{1,120}$/.test(value)) continue;
        if (seen.has(value)) continue;
        seen.add(value);
        result.push(value);
        if (result.length >= 100) break;
    }
    return result;
}

async function handleFavorites(request, env) {
    try { await ensureKv(env); } catch (error) { return jsonResponse({ ok: false, error: error.message }, 503); }
    const username = normalizeUsername(request.headers.get("X-PP-Username"));
    if (!username) return jsonResponse({ ok: false, error: "无法识别当前账号，请重新登录。" }, 401);
    const key = FAVORITES_KEY_PREFIX + username;

    if (request.method === "GET") {
        const stored = await env.SHARED_BOARD.get(key, "json");
        return jsonResponse({ ok: true, favorites: normalizeFavoriteKeys(stored) });
    }

    if (request.method === "PUT") {
        let body;
        try { body = await request.json(); } catch { return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400); }
        if (!Array.isArray(body?.favorites)) return jsonResponse({ ok: false, error: "收藏资料格式不正确。" }, 400);
        const favorites = normalizeFavoriteKeys(body.favorites);
        if (body.favorites.length > 100) return jsonResponse({ ok: false, error: "每个账号最多收藏 100 个入口。" }, 400);
        await env.SHARED_BOARD.put(key, JSON.stringify(favorites));
        return jsonResponse({ ok: true, favorites });
    }

    return methodNotAllowed("GET, PUT");
}

async function handlePortalConfig(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method !== "GET") {
        return methodNotAllowed("GET");
    }

    const config = await getPortalConfig(env);
    return jsonResponse({
        ok: true,
        modules: config.modules,
        moduleButtons: config.moduleButtons,
        settings: await safeGetSystemSettings(env)
    });
}

async function handlePortalModules(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        const config = await getPortalConfig(env);
        return jsonResponse({ ok: true, modules: config.modules });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        if (!Array.isArray(body?.modules)) {
            return jsonResponse({ ok: false, error: "Invalid portal module data." }, 400);
        }

        if (body.modules.length > 50) {
            return jsonResponse({ ok: false, error: "主页模块数量不能超过 50 个。" }, 400);
        }

        let modules;
        try {
            modules = normalizePortalModules(body.modules, true);
        } catch (error) {
            return jsonResponse({ ok: false, error: error.message }, 400);
        }

        const rosterCount = modules.filter((item) => item.kind === "roster").length;
        const noticeCount = modules.filter((item) => item.kind === "notice").length;
        if (rosterCount !== 1 || noticeCount !== 1) {
            return jsonResponse({ ok: false, error: "花名册和共享公告模块必须各保留一个；如暂时不用可以选择隐藏。" }, 400);
        }

        const config = await getPortalConfig(env);
        const moduleButtons = config.moduleButtons;
        for (const module of modules) {
            if (!Array.isArray(moduleButtons[module.id])) {
                moduleButtons[module.id] = [];
            }
        }

        await env.SHARED_BOARD.put(PORTAL_MODULES_KEY, JSON.stringify(modules));
        await env.SHARED_BOARD.put(PORTAL_BUTTONS_KEY, JSON.stringify(moduleButtons));

        return jsonResponse({ ok: true, modules, moduleButtons });
    }

    return methodNotAllowed("GET, PUT");
}

async function handlePortalButtons(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        const config = await getPortalConfig(env);
        return jsonResponse({ ok: true, moduleButtons: config.moduleButtons });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        const moduleId = typeof body?.moduleId === "string" ? body.moduleId.trim() : "";
        if (!moduleId || !Array.isArray(body?.buttons)) {
            return jsonResponse({ ok: false, error: "Invalid module button data." }, 400);
        }

        if (body.buttons.length > 100) {
            return jsonResponse({ ok: false, error: "单个主页模块最多只能有 100 个内部按钮。" }, 400);
        }

        const config = await getPortalConfig(env);
        if (!config.modules.some((item) => item.id === moduleId)) {
            return jsonResponse({ ok: false, error: "找不到对应的主页模块。" }, 404);
        }

        let buttons;
        try {
            buttons = normalizeMeetingButtons(body.buttons, true);
        } catch (error) {
            return jsonResponse({ ok: false, error: error.message.replaceAll("会议按钮", "内部按钮") }, 400);
        }

        config.moduleButtons[moduleId] = buttons;
        await env.SHARED_BOARD.put(PORTAL_BUTTONS_KEY, JSON.stringify(config.moduleButtons));

        // Keep the old meeting key synchronized for backwards compatibility.
        if (moduleId === "meeting") {
            await env.SHARED_BOARD.put(MEETING_BUTTON_KEY, JSON.stringify(buttons));
        }

        return jsonResponse({ ok: true, moduleId, buttons, moduleButtons: config.moduleButtons });
    }

    return methodNotAllowed("GET, PUT");
}

async function getPortalConfig(env) {
    let modulesRaw = await env.SHARED_BOARD.get(PORTAL_MODULES_KEY, "json");
    let modules;
    let modulesChanged = false;

    if (Array.isArray(modulesRaw) && modulesRaw.length) {
        modules = normalizePortalModules(modulesRaw, false);
    } else {
        modules = DEFAULT_PORTAL_MODULES.map((item) => ({ ...item }));
        modulesChanged = true;
    }

    // Older/bad data should never make the special tools disappear.
    if (!modules.some((item) => item.kind === "roster")) {
        modules.push({ id: "roster", name: "花名册", description: "人员资料及部门组织结构", kind: "roster", visible: true });
        modulesChanged = true;
    }
    if (!modules.some((item) => item.kind === "notice")) {
        modules.push({ id: "notice", name: "共享公告", description: "部门共享公告与协作内容", kind: "notice", visible: true });
        modulesChanged = true;
    }

    let moduleButtons = await env.SHARED_BOARD.get(PORTAL_BUTTONS_KEY, "json");
    let buttonsChanged = false;
    if (!moduleButtons || typeof moduleButtons !== "object" || Array.isArray(moduleButtons)) {
        moduleButtons = {};
        buttonsChanged = true;
    }

    for (const module of modules) {
        if (!Array.isArray(moduleButtons[module.id])) {
            if (module.id === "meeting") {
                moduleButtons[module.id] = await getMeetingButtons(env);
            } else {
                moduleButtons[module.id] = [];
            }
            buttonsChanged = true;
        } else {
            const normalized = normalizeMeetingButtons(moduleButtons[module.id], false);
            if (JSON.stringify(normalized) !== JSON.stringify(moduleButtons[module.id])) {
                moduleButtons[module.id] = normalized;
                buttonsChanged = true;
            }
        }
    }

    if (modulesChanged) {
        await env.SHARED_BOARD.put(PORTAL_MODULES_KEY, JSON.stringify(modules));
    }
    if (buttonsChanged) {
        await env.SHARED_BOARD.put(PORTAL_BUTTONS_KEY, JSON.stringify(moduleButtons));
    }

    return { modules, moduleButtons };
}

function normalizePortalModules(source, strict) {
    const input = Array.isArray(source) ? source : [];
    const result = [];
    const ids = new Set();
    let rosterCount = 0;
    let noticeCount = 0;

    for (const raw of input) {
        const item = raw && typeof raw === "object" ? raw : {};
        const id = typeof item.id === "string" ? item.id.trim().slice(0, 120) : "";
        const name = typeof item.name === "string" ? item.name.trim().slice(0, 50) : "";
        const description = typeof item.description === "string" ? item.description.trim().slice(0, 160) : "";
        const kind = item.kind === "roster" || item.kind === "notice" ? item.kind : "generic";
        const visible = item.visible !== false;

        if (!id || !/^[A-Za-z0-9_-]+$/.test(id) || !name) {
            if (strict) throw new Error("每个主页按钮都必须有名称和有效 ID。 ");
            continue;
        }
        if (ids.has(id)) {
            if (strict) throw new Error("主页按钮 ID 重复，请重新操作。 ");
            continue;
        }
        if (kind === "roster") {
            rosterCount += 1;
            if (rosterCount > 1) {
                if (strict) throw new Error("只能保留一个花名册模块。 ");
                continue;
            }
        }
        if (kind === "notice") {
            noticeCount += 1;
            if (noticeCount > 1) {
                if (strict) throw new Error("只能保留一个共享公告模块。 ");
                continue;
            }
        }

        ids.add(id);
        result.push({ id, name, description, kind, visible });
    }

    return result;
}

async function handleMeetingButtons(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        const buttons = await getMeetingButtons(env);

        return jsonResponse({
            ok: true,
            buttons
        });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        if (!Array.isArray(body?.buttons)) {
            return jsonResponse({ ok: false, error: "Invalid meeting button data." }, 400);
        }

        if (body.buttons.length > 100) {
            return jsonResponse({ ok: false, error: "会议按钮数量不能超过 100 个。" }, 400);
        }

        let buttons;

        try {
            buttons = normalizeMeetingButtons(body.buttons, true);
        } catch (error) {
            return jsonResponse({ ok: false, error: error.message }, 400);
        }

        await env.SHARED_BOARD.put(
            MEETING_BUTTON_KEY,
            JSON.stringify(buttons)
        );

        return jsonResponse({
            ok: true,
            buttons
        });
    }

    return methodNotAllowed("GET, PUT");
}

async function getMeetingButtons(env) {
    let stored = await env.SHARED_BOARD.get(MEETING_BUTTON_KEY, "json");

    if (Array.isArray(stored)) {
        const normalized = normalizeMeetingButtons(stored, false);
        if (normalized.length) {
            return normalized;
        }
    }

    // 第一次升级到 v14 时，从 v13 的旧会议链接自动迁移，避免原有网址丢失。
    let legacyLinks = await env.SHARED_BOARD.get(MEETING_LINK_KEY, "json");

    if (!legacyLinks || typeof legacyLinks !== "object" || Array.isArray(legacyLinks)) {
        legacyLinks = DEFAULT_MEETING_LINKS;
    }

    const buttons = [
        {
            id: "month-plan",
            name: "月计划",
            description: "选择年份和月份后打开对应的 Lark 月计划",
            type: "month-plan",
            url: "",
            visible: true
        },
        {
            id: "defect",
            name: "消缺单",
            description: "打开消缺单",
            type: "link",
            url: typeof legacyLinks.defect === "string" ? legacyLinks.defect.trim() : "",
            visible: true
        },
        {
            id: "minutes",
            name: "会议纪要",
            description: "查看及编辑会议纪要",
            type: "link",
            url: typeof legacyLinks.minutes === "string" ? legacyLinks.minutes.trim() : "",
            visible: true
        },
        {
            id: "room",
            name: "会议室预订",
            description: "查看会议室并进行预订",
            type: "link",
            url: typeof legacyLinks.room === "string" ? legacyLinks.room.trim() : "",
            visible: true
        }
    ];

    await env.SHARED_BOARD.put(
        MEETING_BUTTON_KEY,
        JSON.stringify(buttons)
    );

    return buttons;
}

function normalizeMeetingButtons(source, strict) {
    const input = Array.isArray(source) ? source : [];
    const result = [];
    const ids = new Set();
    let monthPlanCount = 0;

    for (let index = 0; index < input.length; index += 1) {
        const item = input[index] && typeof input[index] === "object" ? input[index] : {};
        const id = typeof item.id === "string" ? item.id.trim().slice(0, 120) : "";
        const name = typeof item.name === "string" ? item.name.trim().slice(0, 80) : "";
        const description = typeof item.description === "string" ? item.description.trim().slice(0, 200) : "";
        const type = item.type === "month-plan" ? "month-plan" : "link";
        const url = type === "link" && typeof item.url === "string" ? item.url.trim().slice(0, 2000) : "";
        const visible = item.visible !== false;

        if (!id || !name) {
            if (strict) {
                throw new Error("每个会议按钮都必须有名称和有效 ID。");
            }
            continue;
        }

        if (ids.has(id)) {
            if (strict) {
                throw new Error("会议按钮 ID 重复，请重新操作。 ");
            }
            continue;
        }

        if (type === "link" && url && !/^https:\/\//i.test(url)) {
            if (strict) {
                throw new Error(`“${name}”的网址必须以 https:// 开头。`);
            }
            continue;
        }

        if (type === "month-plan") {
            monthPlanCount += 1;

            if (monthPlanCount > 1) {
                if (strict) {
                    throw new Error("只能保留一个年月选择（月计划）按钮。 ");
                }
                continue;
            }
        }

        ids.add(id);
        result.push({
            id,
            name,
            description,
            type,
            url,
            visible
        });
    }

    return result;
}

async function handleMeetingLinks(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        let links = await env.SHARED_BOARD.get(MEETING_LINK_KEY, "json");

        if (!links || typeof links !== "object" || Array.isArray(links)) {
            links = DEFAULT_MEETING_LINKS;
            await env.SHARED_BOARD.put(MEETING_LINK_KEY, JSON.stringify(links));
        }

        return jsonResponse({
            ok: true,
            links: normalizeMeetingLinks(links)
        });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        if (!body?.links || typeof body.links !== "object" || Array.isArray(body.links)) {
            return jsonResponse({ ok: false, error: "Invalid meeting link data." }, 400);
        }

        const links = normalizeMeetingLinks(body.links);

        for (const [key, value] of Object.entries(links)) {
            if (value && !/^https:\/\//i.test(value)) {
                return jsonResponse({ ok: false, error: `${key} 的链接必须以 https:// 开头。` }, 400);
            }
        }

        await env.SHARED_BOARD.put(MEETING_LINK_KEY, JSON.stringify(links));

        return jsonResponse({
            ok: true,
            links
        });
    }

    return methodNotAllowed("GET, PUT");
}

function normalizeMeetingLinks(source) {
    const safe = source && typeof source === "object" ? source : {};

    return {
        defect: typeof safe.defect === "string" ? safe.defect.trim() : "",
        minutes: typeof safe.minutes === "string" ? safe.minutes.trim() : "",
        room: typeof safe.room === "string" ? safe.room.trim() : ""
    };
}

async function handleMonthPlans(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        let plans = await env.SHARED_BOARD.get(MONTH_PLAN_KEY, "json");

        if (!plans || typeof plans !== "object" || Array.isArray(plans)) {
            plans = DEFAULT_MONTH_PLANS;
            await env.SHARED_BOARD.put(MONTH_PLAN_KEY, JSON.stringify(plans));
        }

        return jsonResponse({
            ok: true,
            plans
        });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        const source = body?.plans;

        if (!source || typeof source !== "object" || Array.isArray(source)) {
            return jsonResponse({ ok: false, error: "Invalid month plan data." }, 400);
        }

        const plans = {};

        for (const [key, value] of Object.entries(source)) {
            if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) {
                continue;
            }

            if (typeof value !== "string") {
                continue;
            }

            const trimmed = value.trim();

            if (trimmed && !/^https:\/\//i.test(trimmed)) {
                return jsonResponse({ ok: false, error: `${key} 的链接必须以 https:// 开头。` }, 400);
            }

            if (trimmed) {
                plans[key] = trimmed;
            }
        }

        await env.SHARED_BOARD.put(MONTH_PLAN_KEY, JSON.stringify(plans));

        return jsonResponse({
            ok: true,
            plans
        });
    }

    return methodNotAllowed("GET, PUT");
}

async function handleRoster(request, env) {
    try {
        await ensureKv(env);
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 503);
    }

    if (request.method === "GET") {
        const roster = await getRoster(env);

        return jsonResponse({
            ok: true,
            roster
        });
    }

    if (request.method === "PUT") {
        const auth = checkAdmin(request, env);
        if (!auth.ok) return auth.response;

        let body;

        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
        }

        if (!Array.isArray(body?.roster)) {
            return jsonResponse({ ok: false, error: "Invalid roster data." }, 400);
        }

        if (body.roster.length > 500) {
            return jsonResponse({ ok: false, error: "Roster is too large." }, 413);
        }

        const roster = body.roster.map((item) => normalizeRosterItem(item));

        await env.SHARED_BOARD.put(
            ROSTER_KEY,
            JSON.stringify(roster)
        );

        return jsonResponse({
            ok: true,
            roster
        });
    }

    return methodNotAllowed("GET, PUT");
}

async function getRoster(env) {
    let roster = await env.SHARED_BOARD.get(ROSTER_KEY, "json");

    if (!Array.isArray(roster)) {
        roster = DEFAULT_ROSTER;
        await env.SHARED_BOARD.put(ROSTER_KEY, JSON.stringify(roster));
    }

    return roster.map((item) => normalizeRosterItem(item));
}

function normalizeRosterItem(item) {
    const categories = new Set(["管理", "运行", "维护"]);
    const statuses = new Set(["正式", "试用", "离职"]);

    return {
        uid:
            typeof item?.uid === "string" && item.uid.trim()
                ? item.uid.trim()
                : crypto.randomUUID(),
        employeeId:
            typeof item?.employeeId === "string"
                ? item.employeeId.trim().slice(0, 50)
                : "",
        name:
            typeof item?.name === "string"
                ? item.name.trim().slice(0, 200)
                : "",
        category:
            categories.has(item?.category)
                ? item.category
                : "运行",
        position:
            typeof item?.position === "string"
                ? item.position.trim().slice(0, 300)
                : "",
        title:
            typeof item?.title === "string"
                ? item.title.trim().slice(0, 200)
                : "",
        status:
            statuses.has(item?.status)
                ? item.status
                : "试用"
    };
}

const BACKUP_FORMAT = "power-plant-site-backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_KEYS = 5000;
const MAX_BACKUP_VALUE_CHARS = 5 * 1024 * 1024;

async function listAllKvKeys(namespace) {
    const keys = [];
    let cursor;

    while (true) {
        const options = { limit: 1000 };
        if (cursor) options.cursor = cursor;

        const page = await namespace.list(options);
        if (Array.isArray(page.keys)) {
            keys.push(...page.keys);
        }

        if (keys.length > MAX_BACKUP_KEYS) {
            throw new Error("KV 数据数量超过备份上限，请联系管理员处理。");
        }

        if (page.list_complete || !page.cursor) break;
        cursor = page.cursor;
    }

    return keys;
}

async function handleAdminBackup(request, env) {
    if (request.method !== "GET") {
        return methodNotAllowed("GET");
    }

    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;

    try {
        await ensureKv(env);
        const keys = await listAllKvKeys(env.SHARED_BOARD);
        const entries = [];
        let totalChars = 0;

        for (const keyInfo of keys) {
            const value = await env.SHARED_BOARD.get(keyInfo.name, "text");
            if (value === null) continue;

            totalChars += value.length;
            if (totalChars > MAX_BACKUP_VALUE_CHARS) {
                throw new Error("备份数据超过 5MB 上限，请联系管理员处理。");
            }

            entries.push({
                name: keyInfo.name,
                value,
                expiration: Number.isFinite(keyInfo.expiration) ? keyInfo.expiration : null,
                metadata: keyInfo.metadata === undefined ? null : keyInfo.metadata
            });
        }

        const backup = {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            source: "Cloudflare Workers KV / SHARED_BOARD",
            keyCount: entries.length,
            note: "This backup contains KV website data, including user accounts (password hashes), system settings and audit logs. ADMIN_PASSWORD is not included.",
            entries
        };

        const date = backup.exportedAt.slice(0, 10);
        return new Response(JSON.stringify(backup, null, 2), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="power-plant-backup-${date}.json"`,
                "Cache-Control": "no-store"
            }
        });
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message || "备份失败。" }, 500);
    }
}

async function handleAdminRestore(request, env) {
    if (request.method !== "POST") {
        return methodNotAllowed("POST");
    }

    const auth = checkAdmin(request, env);
    if (!auth.ok) return auth.response;

    try {
        await ensureKv(env);

        let body;
        try {
            body = await request.json();
        } catch {
            return jsonResponse({ ok: false, error: "备份文件格式不正确。" }, 400);
        }

        const backup = body?.backup;
        if (!backup || backup.format !== BACKUP_FORMAT || Number(backup.version) !== BACKUP_VERSION) {
            return jsonResponse({ ok: false, error: "这不是本网站支持的完整备份文件。" }, 400);
        }

        if (!Array.isArray(backup.entries) || backup.entries.length > MAX_BACKUP_KEYS) {
            return jsonResponse({ ok: false, error: "备份内容不完整或数据数量异常。" }, 400);
        }

        let totalChars = 0;
        const entries = [];
        const seen = new Set();

        for (const raw of backup.entries) {
            const name = typeof raw?.name === "string" ? raw.name.trim() : "";
            const value = typeof raw?.value === "string" ? raw.value : null;

            if (!name || name.length > 512 || value === null || seen.has(name)) {
                return jsonResponse({ ok: false, error: "备份文件中存在无效或重复的数据项。" }, 400);
            }

            totalChars += value.length;
            if (totalChars > MAX_BACKUP_VALUE_CHARS) {
                return jsonResponse({ ok: false, error: "备份数据超过 5MB 上限。" }, 413);
            }

            seen.add(name);
            entries.push({
                name,
                value,
                expiration: Number.isFinite(raw.expiration) ? raw.expiration : null,
                metadata: raw.metadata === undefined ? null : raw.metadata
            });
        }

        const nowSeconds = Math.floor(Date.now() / 1000);
        for (const entry of entries) {
            const options = {};
            if (entry.expiration && entry.expiration > nowSeconds + 60) {
                options.expiration = entry.expiration;
            }
            if (entry.metadata !== null) {
                options.metadata = entry.metadata;
            }

            await env.SHARED_BOARD.put(entry.name, entry.value, options);
        }

        return jsonResponse({
            ok: true,
            restored: entries.length,
            exportedAt: typeof backup.exportedAt === "string" ? backup.exportedAt : null
        });
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message || "恢复失败。" }, 500);
    }
}

async function handleAdminVerify(request, env) {
    if (request.method !== "POST") {
        return methodNotAllowed("POST");
    }

    const auth = checkAdmin(request, env);

    if (!auth.ok) {
        return auth.response;
    }

    return jsonResponse({
        ok: true
    });
}

function checkAdmin(request, env) {
    const role = request.headers.get("X-PP-Role") || "";
    const username = normalizeUsername(request.headers.get("X-PP-Username"));

    if (role !== "admin" || !username) {
        return {
            ok: false,
            response: jsonResponse({ ok: false, error: "没有管理员权限。" }, 403)
        };
    }

    return { ok: true, username };
}

function methodNotAllowed(allow) {
    return new Response("Method Not Allowed", {
        status: 405,
        headers: {
            "Allow": allow,
            "Cache-Control": "no-store"
        }
    });
}

function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store"
            }
        }
    );
}
