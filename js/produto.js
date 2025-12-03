
function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function formatarPreco(valor){
    try { return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`; } catch(e){ return `R$ ${valor}`; }
}

function initDetalhe(){
    const idStr = getQueryParam('id');
    const id = parseInt(idStr, 10);
    const container = document.getElementById('produto-container');
    const produtos = carregarProdutos();
    const produto = produtos.find(p => p.id === id);

    if(!produto){
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">Produto não encontrado. <a href="index.html">Voltar ao catálogo</a></div>
            </div>
        `;
        return;
    }

    // Atualiza contador no navbar, se houver carrinho
    let carrinho = [];
    try {
        const raw = localStorage.getItem('loja_carrinho');
        carrinho = raw ? JSON.parse(raw) : [];
    } catch(e){ carrinho = []; }
    const badge = document.getElementById('cont-carrinho');
    if (badge) badge.textContent = carrinho.length;

    container.innerHTML = `
        <div class="col-lg-6">
            <div class="p-3 bg-white rounded-3 shadow-sm" style="min-height:380px; display:flex; align-items:center; justify-content:center;">
                <img src="${produto.img}" alt="${produto.nome}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>
        </div>
        <div class="col-lg-6">
            <h2 class="mb-2">${produto.nome}</h2>
            <div class="text-primary h4 fw-bold mb-3">${formatarPreco(produto.preco)}</div>
            <p class="text-muted">${produto.descricao || 'Sem descrição disponível.'}</p>
            <div class="d-flex gap-2 mt-4">
                <button class="btn btn-comprar" id="btn-add">Adicionar ao carrinho</button>
                <a class="btn btn-outline-secondary" href="index.html">Continuar comprando</a>
            </div>
        </div>
    `;

    const btn = document.getElementById('btn-add');
    if(btn){
        btn.addEventListener('click', function(){
            let carrinho = [];
            try {
                carrinho = JSON.parse(localStorage.getItem('loja_carrinho')||'[]');
            } catch(e){ carrinho = []; }
            carrinho.push(produto);
            localStorage.setItem('loja_carrinho', JSON.stringify(carrinho));
            const badge = document.getElementById('cont-carrinho');
            if (badge) badge.textContent = carrinho.length;
            alert('Produto adicionado ao carrinho');
        });
    }
}

document.addEventListener('DOMContentLoaded', initDetalhe);
