// js/breadcrumb.js
// Mantém um breadcrumb simples usando sessionStorage para a sessão atual

const BREADCRUMB_KEY = 'loja_nav_path';
// Agora mantemos apenas a página inicial + a página atual

function getPageName() {
    return document.body.dataset.page || document.title || location.pathname;
}

function loadPath() {
    try {
        return JSON.parse(sessionStorage.getItem(BREADCRUMB_KEY) || '[]');
    } catch(e) { return []; }
}

function savePath(path) {
    sessionStorage.setItem(BREADCRUMB_KEY, JSON.stringify(path));
}

function pushCurrentPage() {
    const name = getPageName();
    const url = location.pathname + location.search;
    const homeName = 'Início';

    // Detecta se estamos na página inicial (raiz ou index)
    const lower = url.toLowerCase();
    const isHome = lower === '/' || lower.endsWith('/index.html') || lower.endsWith('/index.htm') || document.body.dataset.page === 'Início';

    if (isHome) {
        // apenas o breadcrumb da página inicial
        savePath([{ name: homeName, url }]);
    } else {
        // sempre mostrar apenas Início + página atual
        const homeUrl = 'index.html';
        savePath([{ name: homeName, url: homeUrl }, { name, url }]);
    }

    renderBreadcrumb();
}

function renderBreadcrumb() {
    const container = document.getElementById('breadcrumbs');
    if (!container) return;
    const path = loadPath();
    if (!path || path.length === 0) { container.innerHTML = ''; return; }

    // Render links for all but last, last is current page
    const parts = path.map((p, idx) => {
        if (idx === path.length - 1) {
            return `<span class="crumb-current">${escapeHtml(p.name)}</span>`;
        }
        return `<a href="#" class="crumb-link" data-idx="${idx}">${escapeHtml(p.name)}</a>`;
    });
    container.innerHTML = parts.join('<span class="sep">›</span>');

    // bind clicks
    container.querySelectorAll('.crumb-link').forEach(a => {
        a.addEventListener('click', function(e){
            e.preventDefault();
            const idx = parseInt(this.dataset.idx, 10);
            const path = loadPath();
            if (!path || !path[idx]) return;
            // trim path up to idx (inclusive) and navigate
            const target = path[idx];
            const newPath = path.slice(0, idx + 1);
            savePath(newPath);
            location.href = target.url;
        });
    });
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function(ch) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch];
    });
}

document.addEventListener('DOMContentLoaded', function(){
    pushCurrentPage();
});
