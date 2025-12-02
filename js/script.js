// Variável do carrinho
let carrinho = [];

// Filtros atuais
const filtrosAtuais = {
    categoria: 'todos',
    pesquisa: '',
    minPrice: null,
    maxPrice: null
};


$(document).ready(function() {
    // 1. Carrega os produtos na tela ao iniciar
    const produtos = carregarProdutos(); // Vem do dados.js
    renderizarVitrine(produtos);
    renderizarLogoLoja();
    renderizarCategorias(produtos);
    renderizarFiltros(produtos);

    // Carrega carrinho salvo (persistência)
    const carrinhoSalvo = localStorage.getItem('loja_carrinho');
    if (carrinhoSalvo) {
        try { carrinho = JSON.parse(carrinhoSalvo) } catch(e) { carrinho = []; }
    }
    atualizarCarrinhoVisual();

    // Pesquisa ao digitar
    $('#pesquisa').on('keyup', function(e){
        filtrosAtuais.pesquisa = $(this).val().trim();
        aplicarFiltros();
    });

    // 2. Contador de Visitas (Requisito )
    let visitas = parseInt(localStorage.getItem('contador_visitas') || '0', 10);
    visitas++;
    localStorage.setItem('contador_visitas', visitas);
    // também registra visitas por mês
    const now = new Date();
    const mes = now.getMonth(); // 0-11
    let visitasMensais = [];
    try { visitasMensais = JSON.parse(localStorage.getItem('visitas_mensais') || '[]'); } catch(e){ visitasMensais = []; }
    if (!Array.isArray(visitasMensais) || visitasMensais.length !== 12) visitasMensais = new Array(12).fill(0);
    visitasMensais[mes] = (visitasMensais[mes]||0) + 1;
    localStorage.setItem('visitas_mensais', JSON.stringify(visitasMensais));
    console.log("Visitas totais: " + visitas);

    // Inicializa banners e selecionados
    const banners = carregarBanners();
    renderizarCarousel(banners);
    renderizarSelecionados(produtos);

    // Pop-up de entrada: mostrar automaticamente se ainda não viu
    const seen = localStorage.getItem('loja_seen_popup');
    if (!seen) {
        abrirPopup();
    }

    // Bind botão usuário
    document.getElementById('btn-usuario').addEventListener('click', function(){
        abrirPopup();
    });

    // Prefill do modal do carrinho a partir do cadastro rápido
    const nomeSalvo = localStorage.getItem('cliente_nome');
    const telSalvo = localStorage.getItem('cliente_tel');
    if (nomeSalvo) $('#clienteNome').val(nomeSalvo);
    if (telSalvo) $('#clienteTel').val(telSalvo);

    // máscara simples para telefone (campo do modal e do popup)
    function mascaraTelefone(e){
        const el = e.target;
        let v = el.value.replace(/\D/g,'');
        if(v.length > 11) v = v.slice(0,11);
        if(v.length <= 2) el.value = v;
        else if(v.length <= 6) el.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if(v.length <= 10) el.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
        else el.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    }
    const entradaTel = document.getElementById('entradaTel');
    const clienteTel = document.getElementById('clienteTel');
    if(entradaTel) entradaTel.addEventListener('input', mascaraTelefone);
    if(clienteTel) clienteTel.addEventListener('input', mascaraTelefone);
});

// --- LOGO DA LOJA ---
function renderizarLogoLoja(){
    try{
        const logo = localStorage.getItem('loja_logo');
        const brand = document.querySelector('.navbar .navbar-brand');
        if(logo && brand){
            brand.innerHTML = `<img src="${logo}" alt="logo" style="height:32px; object-fit:contain;">`;
        }
    } catch(e){ /* silencioso */ }
}

// --- BANNERS (carousel) ---
function carregarBanners() {
    const padrao = [
        'images/banners/banner-padrao.jpg',
        'images/banners/banner-padrao.jpg',
        'images/banners/banner-padrao.jpg'
    ];
    const salvos = localStorage.getItem('loja_banners');
    if (salvos) {
        try {
            const arr = JSON.parse(salvos);
            if (Array.isArray(arr) && arr.length > 0) return arr;
            return padrao;
        } catch(e) { return padrao; }
    }
    localStorage.setItem('loja_banners', JSON.stringify(padrao));
    return padrao;
}

function renderizarCarousel(banners) {
    const inner = document.getElementById('carousel-inner');
    inner.innerHTML = '';
    banners.forEach((src, idx) => {
        const active = idx === 0 ? ' active' : '';
        const slide = `
            <div class="carousel-item${active}">
                <img src="${src}" class="d-block w-100" style="height:300px; object-fit:cover;" alt="Banner ${idx+1}">
            </div>
        `;
        inner.innerHTML += slide;
    });
}

// --- SELEÇÃO ALEATÓRIA ---
function renderizarSelecionados(produtos) {
    const target = document.getElementById('selecionados-produtos');
    target.innerHTML = '';
    const copia = produtos.slice();
    // embaralha e pega até 6
    copia.sort(() => 0.5 - Math.random());
    const selecionados = copia.slice(0, 6);
    selecionados.forEach(produto => {
        const html = `
            <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
                <div class="card h-100 text-center">
                    <div style="height:140px; display:flex; align-items:center; justify-content:center; padding:8px; background:linear-gradient(180deg,#faf7f4,transparent);">
                        <img src="${produto.img}" style="max-height:100%; max-width:100%; object-fit:contain;">
                    </div>
                    <div class="card-body p-2">
                        <div class="small text-truncate">${produto.nome}</div>
                        <div class="text-primary fw-bold">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                    </div>
                </div>
            </div>
        `;
        target.innerHTML += html;
    });
}

// --- POPUP de entrada ---
function abrirPopup() {
    const popup = document.getElementById('popup-entrada');
    popup.setAttribute('aria-hidden', 'false');
    document.getElementById('page-wrap').classList.add('blurred');
}

function fecharPopup() {
    const popup = document.getElementById('popup-entrada');
    popup.setAttribute('aria-hidden', 'true');
    document.getElementById('page-wrap').classList.remove('blurred');
    localStorage.setItem('loja_seen_popup', '1');
}

function salvarEntrada() {
    const nome = document.getElementById('entradaNome').value.trim();
    const tel = document.getElementById('entradaTel').value.trim();
    if (nome) localStorage.setItem('cliente_nome', nome);
    if (tel) localStorage.setItem('cliente_tel', tel);
    // Preenche o modal do carrinho
    if (nome) $('#clienteNome').val(nome);
    if (tel) $('#clienteTel').val(tel);
    fecharPopup();
}

// Função para desenhar os cards na tela
function renderizarVitrine(listaProdutos) {
    const container = document.getElementById('vitrine-produtos');
    container.innerHTML = ''; // Limpa

    // Atualiza/insere contagem de produtos resultantes
    const parentCol = container.parentElement; // espera que seja a coluna que envolve a vitrine
    if (parentCol) {
        let contEl = document.getElementById('vitrine-contagem');
        if (!contEl) {
            contEl = document.createElement('div');
            contEl.id = 'vitrine-contagem';
            contEl.className = 'mb-3 text-muted small';
            parentCol.insertBefore(contEl, container);
        }
        contEl.textContent = `${listaProdutos.length} produto(s) encontrado(s)`;
    }

    listaProdutos.forEach(produto => {
        const destaqueBadge = produto.destaque ? `<div class="badge-destaque">Destaque</div>` : '';
        const html = `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm position-relative">
                    ${destaqueBadge}
                    <div style="height:200px; display:flex; align-items:center; justify-content:center; padding:10px; background:linear-gradient(180deg,#faf7f4,transparent);">
                        <img src="${produto.img}" class="card-img-top" alt="${produto.nome}" style="max-height: 100%; max-width:100%; object-fit:contain;">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">${produto.nome}</h5>
                        <p class="card-text text-primary fw-bold mb-3">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <button class="btn btn-comprar mt-auto" onclick="adicionarAoCarrinho(${produto.id})">
                            <i class="bi bi-cart-plus me-2"></i> Comprar
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// Adicionar ao Carrinho
function adicionarAoCarrinho(id) {
    const produtos = carregarProdutos();
    const produto = produtos.find(p => p.id === id);
    
    carrinho.push(produto);
    atualizarCarrinhoVisual();
    // Persiste o carrinho
    localStorage.setItem('loja_carrinho', JSON.stringify(carrinho));
    // registra clique no produto para analytics
    try {
        const clicksRaw = localStorage.getItem('loja_clicks');
        const clicks = clicksRaw ? JSON.parse(clicksRaw) : {};
        clicks[produto.id] = (clicks[produto.id] || 0) + 1;
        localStorage.setItem('loja_clicks', JSON.stringify(clicks));
    } catch(e) { console.warn('Erro ao salvar clicks', e); }
    
    // Feedback: notificação no canto
    showNotificacao('sucesso', 'Produto adicionado ao carrinho');
}

// Atualiza o Modal do Carrinho
function atualizarCarrinhoVisual() {
    $('#cont-carrinho').text(carrinho.length); // JQuery para atualizar contador
    
    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.nome}
                <span class="badge bg-danger rounded-pill" style="cursor:pointer" onclick="removerDoCarrinho(${index})">X</span>
            </li>
        `;
    });

    $('#total-carrinho').text(`R$ ${total.toFixed(2).replace('.', ',')}`);
    // Salva carrinho atualizado
    localStorage.setItem('loja_carrinho', JSON.stringify(carrinho));
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoVisual();
}

// FINALIZAR PEDIDO (WhatsApp)
function finalizarWhatsApp() {
    const nome = $('#clienteNome').val();
    const tel = $('#clienteTel').val();

    if (!nome || !tel) {
        showNotificacao('erro', 'Por favor, preencha nome e telefone!');
        return;
    }

    if (carrinho.length === 0) {
        showNotificacao('erro', 'Carrinho vazio!');
        return;
    }

    // Monta a mensagem
    let msg = `Olá, sou *${nome}* (${tel}), fiz meu carrinho em sua loja e gostaria de finalizar meu pedido!%0A%0A`;
    
    let total = 0;
    carrinho.forEach(item => {
        msg += `▪️ ${item.nome} - R$ ${item.preco.toFixed(2)}%0A`;
        total += item.preco;
    });

    msg += `%0A*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    // Número do Vendedor (Coloque o seu para testar)
    const numeroVendedor = "5537999999999"; 
    
    // marca finalização para analytics
    try {
        const finaliz = parseInt(localStorage.getItem('loja_finalizacoes') || '0', 10) + 1;
        localStorage.setItem('loja_finalizacoes', finaliz);
    } catch(e) { console.warn(e); }

    window.open(`https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${msg}`, '_blank');
}

// Filtro de Categorias (JQuery)
function filtrar(categoria) {
    filtrosAtuais.categoria = categoria;
    aplicarFiltros();
    // Re-renderiza filtros e categorias para atualizar o estado ativo visual
    const produtos = carregarProdutos();
    renderizarFiltros(produtos);
    renderizarCategorias(produtos);
}

// Aplica filtros combinados (categoria + pesquisa)
function aplicarFiltros() {
    const produtos = carregarProdutos();
    let resultado = produtos.slice();

    if (filtrosAtuais.categoria && filtrosAtuais.categoria !== 'todos') {
        resultado = resultado.filter(p => p.categoria === filtrosAtuais.categoria);
    }

    if (filtrosAtuais.pesquisa) {
        const termo = filtrosAtuais.pesquisa.toLowerCase();
        resultado = resultado.filter(p => p.nome.toLowerCase().includes(termo) || (p.descricao && p.descricao.toLowerCase().includes(termo)) );
    }

    // Filtro por faixa de preço (se definido)
    // Filtro por faixa de preço (se definido). Aceita apenas min, apenas max, ou ambos.
    if (filtrosAtuais.minPrice !== null) {
        const min = parseFloat(String(filtrosAtuais.minPrice).replace(',', '.'));
        if (Number.isFinite(min)) resultado = resultado.filter(p => p.preco >= min);
    }
    if (filtrosAtuais.maxPrice !== null) {
        const max = parseFloat(String(filtrosAtuais.maxPrice).replace(',', '.'));
        if (Number.isFinite(max)) resultado = resultado.filter(p => p.preco <= max);
    }

    renderizarVitrine(resultado);
}

// Ação chamada pelo botão de busca
function buscar() {
    filtrosAtuais.pesquisa = $('#pesquisa').val().trim();
    aplicarFiltros();
}

// Renderiza blocos de categorias (ícones)
function obterCategorias(produtos){
    const catsProdutos = new Set(produtos.map(p => p.categoria));
    let catsStorage = [];
    try { catsStorage = JSON.parse(localStorage.getItem('loja_categorias')||'[]'); } catch(e){ catsStorage = []; }
    const all = new Set([ ...catsStorage, ...catsProdutos ]);
    return Array.from(all).filter(Boolean);
}

function renderizarCategorias(produtos) {
    const container = document.getElementById('area-categorias');
    const categorias = obterCategorias(produtos);

    let html = '<div class="categoria-list">';
    // 'Todas' com estado ativo quando aplicável
    const ativaTodos = filtrosAtuais.categoria === 'todos' ? ' active' : '';
    html += `<div class="categoria-item"><div class="circle-btn${ativaTodos}" onclick="filtrar('todos')"><span class="fw-bold">Todas</span></div><span>Todas</span></div>`;

    categorias.forEach(cat => {
        const exemplo = produtos.find(p => p.categoria === cat);
        const img = exemplo ? exemplo.img : 'images/produtos/exemplo.jpg';
        const ativa = filtrosAtuais.categoria === cat ? ' active' : '';
        html += `
            <div class="categoria-item">
                <img class="categoria-img${ativa}" src="${img}" alt="${cat}" onclick="filtrar('${cat}')">
                <span>${cat}</span>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Renderiza filtros na sidebar (lista de categorias)
function renderizarFiltros(produtos) {
    const container = document.getElementById('sidebar-filtros');
    const categorias = obterCategorias(produtos);

    let html = '<div class="list-group">';
    html += `<button class="list-group-item list-group-item-action ${filtrosAtuais.categoria==='todos' ? 'active' : ''}" onclick="filtrar('todos')">Todos</button>`;
    categorias.forEach(cat => {
        html += `<button class="list-group-item list-group-item-action ${filtrosAtuais.categoria===cat ? 'active' : ''}" onclick="filtrar('${cat}')">${cat}</button>`;
    });
    html += '</div>';

    // Adiciona filtro de preço (min / max)
    html += `
        <div class="price-filter mt-3">
            <label class="form-label small">Preço mínimo</label>
            <input id="filter-min" type="number" min="0" step="0.01" class="form-control mb-2" placeholder="R$ 0.00" value="${filtrosAtuais.minPrice !== null && filtrosAtuais.minPrice !== '' ? filtrosAtuais.minPrice : ''}">
            <label class="form-label small">Preço máximo</label>
            <input id="filter-max" type="number" min="0" step="0.01" class="form-control" placeholder="R$ 9999.99" value="${filtrosAtuais.maxPrice !== null && filtrosAtuais.maxPrice !== '' ? filtrosAtuais.maxPrice : ''}">
            <div class="d-flex gap-2 mt-2">
                <button id="btn-aplicar-preco" class="btn btn-primary btn-sm w-100">Aplicar</button>
                <button id="btn-limpar-preco" class="btn btn-outline-secondary btn-sm w-100">Limpar</button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Event listeners para inputs de preço
    const minEl = document.getElementById('filter-min');
    const maxEl = document.getElementById('filter-max');
    const btnAplicar = document.getElementById('btn-aplicar-preco');
    const btnLimpar = document.getElementById('btn-limpar-preco');

    if (minEl) minEl.addEventListener('input', (e) => {
        const raw = String(e.target.value || '').replace(',', '.').trim();
        filtrosAtuais.minPrice = raw === '' ? null : raw;
    });
    if (maxEl) maxEl.addEventListener('input', (e) => {
        const raw = String(e.target.value || '').replace(',', '.').trim();
        filtrosAtuais.maxPrice = raw === '' ? null : raw;
    });
    if (btnAplicar) btnAplicar.addEventListener('click', () => { aplicarFiltros(); });
    if (btnAplicar) btnAplicar.addEventListener('click', () => {
        // garante leitura direta dos inputs no momento do clique
        const rawMin = (minEl && minEl.value) ? String(minEl.value).replace(',', '.').trim() : '';
        const rawMax = (maxEl && maxEl.value) ? String(maxEl.value).replace(',', '.').trim() : '';
        filtrosAtuais.minPrice = rawMin === '' ? null : rawMin;
        filtrosAtuais.maxPrice = rawMax === '' ? null : rawMax;
        aplicarFiltros();
        // re-render para manter estado dos botões
        renderizarFiltros(produtos);
    });
    if (btnLimpar) btnLimpar.addEventListener('click', () => { filtrosAtuais.minPrice = null; filtrosAtuais.maxPrice = null; renderizarFiltros(produtos); aplicarFiltros(); });
}