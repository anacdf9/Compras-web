

// Login
function fazerLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    // Validação Simples
    if (user === 'admin' && pass === '1234') {
        if (typeof showNotificacao === 'function') showNotificacao('sucesso', 'Login realizado com sucesso!');
        document.getElementById('painel-login').style.display = 'none';
        document.getElementById('painel-admin').style.display = 'block';
        
        carregarDashboard(); // Carrega os dados
    } else {
        showNotificacao('erro', 'Usuário ou senha incorretos!');
    }
}

// 2. Dashboard
function carregarDashboard() {
    // contador de visitas
    const visitas = localStorage.getItem('contador_visitas') || 0;
    document.getElementById('display-visitas').innerText = visitas;

    // tabela de produtos
    // inicializa admin
    initAdmin();
}

//  Novo Produto
function salvarProduto(event) {
    event.preventDefault();
    const nome = document.getElementById('novoNome').value.trim();
    const preco = parseFloat(document.getElementById('novoPreco').value);
    const categoria = document.getElementById('novoCat').value.trim();
    const desc = document.getElementById('novoDesc') ? document.getElementById('novoDesc').value.trim() : '';

    // imagem: pode vir do input-upload (dataURL) ou de campo antigo
    const inputFile = document.getElementById('input-upload');
    if (inputFile && inputFile.files && inputFile.files[0]) {
        const file = inputFile.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            inserirProduto(nome, preco, categoria, imgData, desc);
            // limpa form
            document.getElementById('form-criar').reset();
            document.getElementById('preview-upload').innerText = 'Pré-visualização';
        };
        reader.readAsDataURL(file);
    } else {
        // sem upload, tenta pegar valor direto (compatibilidade)
        const imgField = document.getElementById('novoImg');
        const img = imgField ? imgField.value.trim() : '';
        inserirProduto(nome, preco, categoria, img, desc);
        if (document.getElementById('form-criar')) document.getElementById('form-criar').reset();
    }
}

function inserirProduto(nome, preco, categoria, img, desc) {
    const produtos = carregarProdutos();
    const novoProduto = {
        id: Date.now(),
        nome: nome,
        preco: preco || 0,
        categoria: categoria || 'sem-categoria',
        img: img || 'img/produtos/exemplo.jpg',
        descricao: desc || '',
        destaque: true
    };
    produtos.push(novoProduto);
    localStorage.setItem('loja_produtos', JSON.stringify(produtos));
    if (typeof showNotificacao === 'function') showNotificacao('sucesso', 'Produto cadastrado com sucesso!');
    // atualizar view se estiver na lista
    if (document.getElementById('admin-tabela-produtos')) renderAdminProdutos();
}

// 4. Atualizar Tabela Visual
// Funções administrativas: listagem com busca e paginação
let adminState = { page: 1, pageSize: 8, query: '' };

function initAdmin() {
    // bind search
    const s = document.getElementById('search-produtos');
    if (s) {
        s.addEventListener('input', function(){ adminState.query = this.value.trim(); adminState.page = 1; renderAdminProdutos(); });
    }
    const inputUpload = document.getElementById('input-upload');
    if (inputUpload) inputUpload.addEventListener('change', previewUpload);
    const editInput = document.getElementById('edit-image-input');
    if (editInput) editInput.addEventListener('change', previewEditUpload);
    const inputBanner = document.getElementById('input-banner');
    if (inputBanner) inputBanner.addEventListener('change', handleBannerPreview);
    const inputLogo = document.getElementById('input-logo');
    if (inputLogo) inputLogo.addEventListener('change', handleLogoPreview);

    // render logo no sidebar
    renderLogoSidebar();

    // initial render
    renderAdminProdutos();
    renderCategoriasAdmin();
    renderBannersAdmin();
}

// Logo handling
let logoPreviewData = null;
function handleLogoPreview(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        logoPreviewData = ev.target.result;
        const prev = document.getElementById('logo-preview');
        if(prev) prev.innerHTML = `<img src="${logoPreviewData}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
    };
    reader.readAsDataURL(file);
}

function adicionarLogo(){
    if(!logoPreviewData) {
        showNotificacao('erro', 'Escolha uma imagem PNG antes');
        return;
    }
    try{
        let logoArr = logoPreviewData; // dataURL
        localStorage.setItem('loja_logo', logoArr);
        renderLogoSidebar();
        if (typeof showNotificacao === 'function') showNotificacao('sucesso', 'Logo salva com sucesso!');
    } catch(e){ console.warn(e); showNotificacao('erro', 'Erro ao salvar logo'); }
}

function renderLogoSidebar(){
    const src = localStorage.getItem('loja_logo') || 'img/logo.png';
    const el = document.getElementById('admin-logo');
    if(el) el.src = src;
    const smallPrev = document.getElementById('logo-preview');
    if(smallPrev) smallPrev.innerHTML = `<img src="${src}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
}

function mostrarView(name) {
    document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
    const el = document.getElementById('view-' + name);
    if (el) el.style.display = 'block';
    // actions on show
    if (name === 'produtos') renderAdminProdutos();
    if (name === 'analises') renderAnalises();
    if (name === 'pagina') { renderBannersAdmin(); renderCategoriasAdmin(); }
}

function renderAdminProdutos() {
    const produtos = carregarProdutos();
    const tbody = document.getElementById('admin-tabela-produtos');
    if (!tbody) return;
    // filter
    const q = adminState.query.toLowerCase();
    const filtrados = produtos.filter(p => !q || (p.nome && p.nome.toLowerCase().includes(q)) || (p.descricao && p.descricao.toLowerCase().includes(q)));
    const total = filtrados.length;
    const pages = Math.max(1, Math.ceil(total / adminState.pageSize));
    if (adminState.page > pages) adminState.page = pages;
    const start = (adminState.page - 1) * adminState.pageSize;
    const pageItems = filtrados.slice(start, start + adminState.pageSize);

    tbody.innerHTML = '';
    pageItems.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" data-id="${p.id}"></td>
            <td><div class="d-flex align-items-center gap-2"><img src="${p.img}" width="48" style="border-radius:6px;"> <div>${p.nome}</div></div></td>
            <td>${(p.descricao||'')}</td>
            <td>${p.categoria || ''}</td>
            <td>R$ ${Number(p.preco).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="abrirModalEditar(${p.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deletarProduto(${p.id})">Excluir</button>
                </td>
        `;
        tbody.appendChild(tr);
    });

    // pagination
    const pag = document.getElementById('paginacao-admin');
    pag.innerHTML = '';
    for (let i=1;i<=pages;i++){
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm ms-1 ' + (i===adminState.page ? 'btn-primary' : 'btn-outline-secondary');
        btn.innerText = i;
        btn.onclick = () => { adminState.page = i; renderAdminProdutos(); };
        pag.appendChild(btn);
    }
}

// 5. Deletar Produto
function deletarProduto(id) {
    if(confirm("Tem certeza que deseja excluir?")) {
        let produtos = carregarProdutos();
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem('loja_produtos', JSON.stringify(produtos));
        renderAdminProdutos();
    }
}

function deletarSelecionados(){
    const tbody = document.getElementById('admin-tabela-produtos');
    if(!tbody) return;
    const checks = Array.from(tbody.querySelectorAll('input[type="checkbox"][data-id]'));
    const ids = checks.filter(c=>c.checked).map(c=>parseInt(c.dataset.id,10));
    if(ids.length===0){ showNotificacao('info', 'Nenhum item selecionado'); return; }
    if(!confirm(`Excluir ${ids.length} produtos?`)) return;
    let produtos = carregarProdutos();
    produtos = produtos.filter(p => !ids.includes(p.id));
    localStorage.setItem('loja_produtos', JSON.stringify(produtos));
    renderAdminProdutos();
}

// Abre modal de edição preenchido com os dados do produto
function abrirModalEditar(id){
    const produtos = carregarProdutos();
    const p = produtos.find(x=>x.id===id);
    if(!p) return showNotificacao('erro','Produto não encontrado');
    document.getElementById('editId').value = p.id;
    document.getElementById('editNome').value = p.nome || '';
    document.getElementById('editPreco').value = Number(p.preco || 0).toFixed(2);
    document.getElementById('editCat').value = p.categoria || '';
    document.getElementById('editDesc').value = p.descricao || '';
    const preview = document.getElementById('edit-preview');
    if(preview) preview.innerHTML = `<img src="${p.img}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
    const input = document.getElementById('edit-image-input'); if(input) input.value = '';
    const modalEl = document.getElementById('editModal');
    const bs = new bootstrap.Modal(modalEl);
    bs.show();
}

function previewEditUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        const data = ev.target.result;
        const preview = document.getElementById('edit-preview');
        if(preview){ preview.innerHTML = `<img src="${data}" style="max-width:100%; max-height:100%; object-fit:contain;">`; }
    };
    reader.readAsDataURL(file);
}

function salvarEdicaoProduto(event){
    event.preventDefault();
    const id = parseInt(document.getElementById('editId').value,10);
    let produtos = carregarProdutos();
    const p = produtos.find(x=>x.id===id);
    if(!p) return showNotificacao('erro','Produto não encontrado');
    const nome = document.getElementById('editNome').value.trim();
    const preco = parseFloat(document.getElementById('editPreco').value) || 0;
    const categoria = document.getElementById('editCat').value.trim();
    const desc = document.getElementById('editDesc').value.trim();
    const input = document.getElementById('edit-image-input');
    if (input && input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            p.img = e.target.result;
            p.nome = nome; p.preco = preco; p.categoria = categoria; p.descricao = desc;
            localStorage.setItem('loja_produtos', JSON.stringify(produtos));
            renderAdminProdutos();
            const modalEl = document.getElementById('editModal');
            const modalIns = bootstrap.Modal.getInstance(modalEl);
            if(modalIns) modalIns.hide();
            showNotificacao('sucesso','Produto atualizado com sucesso!');
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        p.nome = nome; p.preco = preco; p.categoria = categoria; p.descricao = desc;
        localStorage.setItem('loja_produtos', JSON.stringify(produtos));
        renderAdminProdutos();
        const modalEl = document.getElementById('editModal');
        const modalIns = bootstrap.Modal.getInstance(modalEl);
        if(modalIns) modalIns.hide();
        showNotificacao('sucesso','Produto atualizado com sucesso!');
    }
}

function previewUpload(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
        const data = ev.target.result;
        const preview = document.getElementById('preview-upload');
        if(preview){ preview.innerHTML = `<img src="${data}" style="max-width:100%; max-height:100%; object-fit:contain;">`; }
    };
    reader.readAsDataURL(file);
}

let bannerPreviewData = null;
function handleBannerPreview(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){ bannerPreviewData = ev.target.result; };
    reader.readAsDataURL(file);
}

function adicionarCategoria(){
    const value = document.getElementById('novoCat').value.trim();
    if(!value) { showNotificacao('erro','Informe o nome da categoria'); return; }
    let cats = [];
    try { cats = JSON.parse(localStorage.getItem('loja_categorias')||'[]'); } catch(e){ cats = []; }
    if(!cats.includes(value)) cats.push(value);
    localStorage.setItem('loja_categorias', JSON.stringify(cats));
    renderCategoriasAdmin();
    if (typeof showNotificacao === 'function') showNotificacao('sucesso','Categoria adicionada');
}

function renderCategoriasAdmin(){
    const container = document.getElementById('categoria-list-admin');
    if(!container) return;
    let cats = [];
    try { cats = JSON.parse(localStorage.getItem('loja_categorias')||'[]'); } catch(e){ cats = []; }
    container.innerHTML = '';
    cats.forEach(c=>{
        const btn = document.createElement('div');
        btn.className = 'badge bg-light border p-2 rounded';
        btn.innerHTML = `${c} <a href='#' class='ms-2 text-danger' onclick="removerCategoria('${c.replace(/'/g,'\\\'')}')">✕</a>`;
        container.appendChild(btn);
    });
}

function removerCategoria(name){
    let cats = [];
    try { cats = JSON.parse(localStorage.getItem('loja_categorias')||'[]'); } catch(e){ cats = []; }
    cats = cats.filter(c=>c!==name);
    localStorage.setItem('loja_categorias', JSON.stringify(cats));
    renderCategoriasAdmin();
}

function adicionarBanner(){
    if(!bannerPreviewData) { showNotificacao('erro','Escolha uma imagem antes'); return; }
    let banners = [];
    try { banners = JSON.parse(localStorage.getItem('loja_banners')||'[]'); } catch(e){ banners = []; }
    banners.push(bannerPreviewData);
    localStorage.setItem('loja_banners', JSON.stringify(banners));
    bannerPreviewData = null;
    document.getElementById('input-banner').value = '';
    renderBannersAdmin();
}

function renderBannersAdmin(){
    const container = document.getElementById('banners-list');
    if(!container) return;
    let banners = [];
    try { banners = JSON.parse(localStorage.getItem('loja_banners')||'[]'); } catch(e){ banners = []; }
    container.innerHTML = '';
    banners.forEach((b, idx)=>{
        const wrap = document.createElement('div');
        wrap.style.width = '160px'; wrap.style.height = '80px'; wrap.style.background = '#fff'; wrap.style.borderRadius = '6px'; wrap.style.overflow='hidden'; wrap.style.position='relative'; wrap.style.boxShadow='0 6px 18px rgba(0,0,0,0.06)'; wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.justifyContent='center';
        wrap.innerHTML = `<img src="${b}" style="max-width:100%; max-height:100%; object-fit:cover;"> <button class='btn btn-sm btn-danger' style='position:absolute; top:6px; right:6px;' onclick='removerBanner(${idx})'>Excluir</button>`;
        container.appendChild(wrap);
    });
}

function removerBanner(idx){
    let banners = [];
    try { banners = JSON.parse(localStorage.getItem('loja_banners')||'[]'); } catch(e){ banners = []; }
    banners.splice(idx,1);
    localStorage.setItem('loja_banners', JSON.stringify(banners));
    renderBannersAdmin();
}

function renderAnalises(){
    // visitas mensais
    let visitasMensais = [];
    try { visitasMensais = JSON.parse(localStorage.getItem('visitas_mensais')||'[]'); } catch(e){ visitasMensais = []; }
    if(!Array.isArray(visitasMensais) || visitasMensais.length!==12) visitasMensais = new Array(12).fill(0);

    // clicks por produto
    let clicks = {};
    try { clicks = JSON.parse(localStorage.getItem('loja_clicks')||'{}'); } catch(e){ clicks = {}; }
    const produtos = carregarProdutos();
    const labelsClicks = produtos.map(p=>p.nome);
    const dataClicks = produtos.map(p=> clicks[p.id]||0);

    // finalizacoes
    const finalizacoes = parseInt(localStorage.getItem('loja_finalizacoes')||'0',10);

    // render charts (Chart.js must be loaded)
    try {
        // visitas por mes
        const ctxV = document.getElementById('chart-visitas').getContext('2d');
        new Chart(ctxV, { type:'line', data:{ labels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], datasets:[{label:'Visitas', data:visitasMensais, borderColor:'#4caf50', backgroundColor:'rgba(76,175,80,0.08)', tension:0.3 }]}, options:{responsive:true}});

        const ctxC = document.getElementById('chart-mais-cliques').getContext('2d');
        new Chart(ctxC, { type:'bar', data:{ labels:labelsClicks, datasets:[{label:'Cliques', data:dataClicks, backgroundColor:'#ff9800'}]}, options:{responsive:true, indexAxis:'y'}});

        const ctxF = document.getElementById('chart-finalizacoes').getContext('2d');
        new Chart(ctxF, { type:'doughnut', data:{ labels:['Finalizações','Sem finalização'], datasets:[{data:[finalizacoes, Math.max(0, (produtos.length*5) - finalizacoes)], backgroundColor:['#4caf50','#ddd']}]}, options:{responsive:true}});

        const ctxM = document.getElementById('chart-visao-meses').getContext('2d');
        new Chart(ctxM, { type:'bar', data:{ labels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], datasets:[{label:'Visitas', data:visitasMensais, backgroundColor:'#3f51b5'}]}, options:{responsive:true}});
    } catch(e) { console.warn('Chart error', e); }
}

function sair() {
    location.reload(); // Recarrega para voltar ao login
}