// js/carrinho.js
// Gerencia a página de carrinho (carrinho.html)

function formatBRL(v) {
    return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

function carregarCarrinho() {
    const raw = localStorage.getItem('loja_carrinho');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch(e) { return []; }
}

function salvarCarrinho(c) {
    localStorage.setItem('loja_carrinho', JSON.stringify(c));
    // atualizar contadores na UI global (se existirem)
    const el = document.getElementById('cont-carrinho-top') || document.getElementById('cont-carrinho');
    if (el) el.innerText = c.length;
}

function renderizarCarrinhoPagina() {
    const carrinho = carregarCarrinho();
    const listaEl = document.getElementById('cart-items-list');
    listaEl.innerHTML = '';

    if (carrinho.length === 0) {
        listaEl.innerHTML = '<div class="text-center text-muted py-5">Seu carrinho está vazio</div>';
        atualizarResumo([]);
        return;
    }

    carrinho.forEach((item, idx) => {
        const quantidade = item.qtd || 1;
        const wrap = document.createElement('div');
        wrap.className = 'd-flex align-items-center mb-3';
        wrap.innerHTML = `
            <div style="width:90px; height:90px; display:flex; align-items:center; justify-content:center; background:#faf7f4; border-radius:10px; margin-right:12px;">
                <img src="${item.img}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>
            <div class="flex-grow-1">
                <div class="fw-semibold">${item.nome}</div>
                <div class="text-primary fw-bold">${formatBRL(item.preco)}</div>
                <div class="mt-2 d-flex gap-2 align-items-center">
                    <button class="btn btn-outline-secondary btn-sm" data-idx="${idx}" onclick="carrinhoDiminuir(${idx})">-</button>
                    <div class="px-3 border rounded"> <span id="qtd-${idx}">${quantidade}</span></div>
                    <button class="btn btn-outline-secondary btn-sm" data-idx="${idx}" onclick="carrinhoAumentar(${idx})">+</button>
                    <button class="btn btn-link text-danger ms-3" onclick="removerItem(${idx})">Remover</button>
                </div>
            </div>
        `;
        listaEl.appendChild(wrap);
    });

    atualizarResumo(carrinho);
}

function carrinhoAumentar(idx) {
    const carrinho = carregarCarrinho();
    carrinho[idx].qtd = (carrinho[idx].qtd || 1) + 1;
    salvarCarrinho(carrinho);
    document.getElementById(`qtd-${idx}`).innerText = carrinho[idx].qtd;
    atualizarResumo(carrinho);
}

function carrinhoDiminuir(idx) {
    const carrinho = carregarCarrinho();
    carrinho[idx].qtd = (carrinho[idx].qtd || 1) - 1;
    if (carrinho[idx].qtd <= 0) {
        carrinho.splice(idx,1);
    }
    salvarCarrinho(carrinho);
    renderizarCarrinhoPagina();
}

function removerItem(idx) {
    const carrinho = carregarCarrinho();
    carrinho.splice(idx,1);
    salvarCarrinho(carrinho);
    renderizarCarrinhoPagina();
}

function atualizarResumo(carrinho) {
    const resumoList = document.getElementById('resumo-list');
    resumoList.innerHTML = '';
    let total = 0;
    carrinho.forEach(item => {
        const qtd = item.qtd || 1;
        total += item.preco * qtd;
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${item.nome} <span class="text-muted small">${qtd}x</span> <strong>${formatBRL(item.preco * qtd)}</strong>`;
        resumoList.appendChild(li);
    });
    document.getElementById('resumo-total').innerText = formatBRL(total);
}

function finalizarWhatsAppCarrinho() {
    const carrinho = carregarCarrinho();
    if (carrinho.length === 0) {
        showNotificacao('erro', 'Carrinho vazio!');
        return;
    }

    // usa dados salvos no popup/usuário se os campos não estiverem preenchidos
    let nome = document.getElementById('resumoNome').value.trim();
    let tel = document.getElementById('resumoTel').value.trim();
    const nomeSalvo = localStorage.getItem('cliente_nome');
    const telSalvo = localStorage.getItem('cliente_tel');
    if ((!nome || !tel) && nomeSalvo) nome = nome || nomeSalvo;
    if ((!nome || !tel) && telSalvo) tel = tel || telSalvo;

    if (!nome || !tel) {
        showNotificacao('erro', 'Preencha nome e telefone.');
        return;
    }

    // monta mensagem
    let msg = `Olá, sou ${nome} (${tel}), fiz meu carrinho em sua loja e gostaria de finalizar meu pedido!%0A%0A`;
    let total = 0;
    carrinho.forEach(item => {
        const qtd = item.qtd || 1;
        msg += `▪️ ${item.nome} x${qtd} - R$ ${ (item.preco * qtd).toFixed(2) }%0A`;
        total += item.preco * qtd;
    });
    msg += `%0A*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

    // salvar dados do cliente localmente (se vieram dos campos ou do popup)
    localStorage.setItem('cliente_nome', nome);
    localStorage.setItem('cliente_tel', tel);

    // marca finalização para analytics
    try {
        const finalizacoes = parseInt(localStorage.getItem('loja_finalizacoes') || '0', 10) + 1;
        localStorage.setItem('loja_finalizacoes', finalizacoes);
    } catch(e) { console.warn(e); }

    const numeroVendedor = '5537999999999';
    if (typeof showNotificacao === 'function') showNotificacao('sucesso', 'Abrindo WhatsApp para finalizar pedido...');
    window.open(`https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${encodeURIComponent(msg)}`, '_blank');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function(){
    // preencher campos com dados salvos
    const nome = localStorage.getItem('cliente_nome');
    const tel = localStorage.getItem('cliente_tel');
    if (nome) document.getElementById('resumoNome').value = nome;
    if (tel) document.getElementById('resumoTel').value = tel;

    renderizarCarrinhoPagina();

    document.getElementById('btn-finalizar').addEventListener('click', finalizarWhatsAppCarrinho);
    // máscara simples para campo de telefone do resumo
    function mascaraTelefoneResumo(e){
        const el = e.target;
        let v = el.value.replace(/\D/g,'');
        if(v.length > 11) v = v.slice(0,11);
        if(v.length <= 2) el.value = v;
        else if(v.length <= 6) el.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
        else if(v.length <= 10) el.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
        else el.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    }
    const resumoTel = document.getElementById('resumoTel');
    if(resumoTel) resumoTel.addEventListener('input', mascaraTelefoneResumo);
});
