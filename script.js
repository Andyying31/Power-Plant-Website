// ========================================
// 沙巴光伏自备电厂导航
// 页面切换 + 搜索
// ========================================

const menuItems = document.querySelectorAll('.menu-item');
const pagePanels = document.querySelectorAll('.page-panel');
const homeCards = document.querySelectorAll('.home-card[data-open-page]');
const searchInput = document.getElementById('search');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const pageMeta = {
    home: {
        title: '沙巴光伏自备电厂导航',
        subtitle: '部门常用业务入口',
        placeholder: '搜索功能...'
    },
    meeting: {
        title: '会议',
        subtitle: '会议相关业务快捷入口',
        placeholder: '搜索会议功能...'
    },
    daily: {
        title: '日报',
        subtitle: '日报相关业务入口',
        placeholder: '搜索日报...'
    },
    roster: {
        title: '花名册',
        subtitle: '人员信息查看入口',
        placeholder: '搜索人员或功能...'
    }
};

function openPage(pageName) {
    pagePanels.forEach(panel => panel.classList.remove('active-page'));
    menuItems.forEach(item => item.classList.remove('active'));

    const targetPage = document.getElementById(`${pageName}-page`);
    const targetMenu = document.querySelector(`.menu-item[data-page="${pageName}"]`);

    if (targetPage) targetPage.classList.add('active-page');
    if (targetMenu) targetMenu.classList.add('active');

    const meta = pageMeta[pageName] || pageMeta.home;

    pageTitle.textContent = meta.title;
    pageSubtitle.textContent = meta.subtitle;

    searchInput.placeholder = meta.placeholder;
    searchInput.value = '';

    resetSearch();
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        openPage(item.dataset.page);
    });
});

homeCards.forEach(card => {
    card.addEventListener('click', () => {
        openPage(card.dataset.openPage);
    });
});

searchInput.addEventListener('input', function () {
    const keyword = this.value.toLowerCase().trim();

    const activePage = document.querySelector('.page-panel.active-page');

    if (!activePage) return;

    const searchableItems = activePage.querySelectorAll('.searchable');

    searchableItems.forEach(item => {
        const text = item.textContent.toLowerCase();

        item.style.display =
            text.includes(keyword) ? '' : 'none';
    });
});

function resetSearch() {
    document.querySelectorAll('.searchable').forEach(item => {
        item.style.display = '';
    });
}
