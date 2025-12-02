// Variável do carrinho
let carrinho = [];

$(document).ready(function() {
    // 1. Carrega os produtos na tela ao iniciar
    const produtos = carregarProdutos(); // Vem do dados.js
    renderizarVitrine(produtos);

    // 2. Contador de Visitas (Requisito )
    let visitas = localStorage.getItem('contador_visitas') || 0;
    visitas++;
    localStorage.setItem('contador_visitas', visitas);
    console.log("Visitas totais: " + visitas);
});

// Função para desenhar os cards na tela
function renderizarVitrine(listaProdutos) {
    const container = document.getElementById('vitrine-produtos');
    container.innerHTML = ''; // Limpa

    listaProdutos.forEach(produto => {
        const html = `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${produto.img}" class="card-img-top" alt="${produto.nome}" style="height: 200px; object-fit: contain;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text text-primary fw-bold">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        <button class="btn btn-dark mt-auto" onclick="adicionarAoCarrinho(${produto.id})">
                            Comprar
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
    
    // Feedback simples (pode usar um Toast do Bootstrap depois)
    alert("Produto adicionado!");
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
        alert("Por favor, preencha nome e telefone!");
        return;
    }

    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
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
    
    window.open(`https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${msg}`, '_blank');
}

// Filtro de Categorias (JQuery)
function filtrar(categoria) {
    const produtos = carregarProdutos();
    if (categoria === 'todos') {
        renderizarVitrine(produtos);
    } else {
        const filtrados = produtos.filter(p => p.categoria === categoria);
        renderizarVitrine(filtrados);
    }
}