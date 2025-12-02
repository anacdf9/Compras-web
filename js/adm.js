

// Login
function fazerLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    // Validação Simples
    if (user === 'admin' && pass === '1234') {
        alert('Login realizado com sucesso!');
        document.getElementById('painel-login').style.display = 'none';
        document.getElementById('painel-admin').style.display = 'block';
        
        carregarDashboard(); // Carrega os dados
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

// 2. Dashboard
function carregarDashboard() {
    // contador de visitas
    const visitas = localStorage.getItem('contador_visitas') || 0;
    document.getElementById('display-visitas').innerText = visitas;

    // tabela de produtos
    atualizarTabela();
}

//  Novo Produto
function salvarProduto(event) {
    event.preventDefault(); // Não recarrega a página

    const nome = document.getElementById('novoNome').value;
    const preco = parseFloat(document.getElementById('novoPreco').value);
    const categoria = document.getElementById('novoCat').value;
    const img = document.getElementById('novoImg').value;

    // Pega a lista atual
    const produtos = carregarProdutos(); // Função do dados.js

    // Cria o novo objeto
    const novoProduto = {
        id: Date.now(), // Gera um ID único baseado no tempo
        nome: nome,
        preco: preco,
        categoria: categoria,
        img: img,
        destaque: true
    };

    // Adiciona e salva
    produtos.push(novoProduto);
    localStorage.setItem('loja_produtos', JSON.stringify(produtos));

    alert('Produto cadastrado com sucesso!');
    document.querySelector('form').reset();
    atualizarTabela();
}

// 4. Atualizar Tabela Visual
function atualizarTabela() {
    const produtos = carregarProdutos();
    const tbody = document.getElementById('tabela-produtos');
    tbody.innerHTML = '';

    produtos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.img}" width="50"></td>
                <td>${p.nome}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deletarProduto(${p.id})">Excluir</button></td>
            </tr>
        `;
    });
}

// 5. Deletar Produto
function deletarProduto(id) {
    if(confirm("Tem certeza que deseja excluir?")) {
        let produtos = carregarProdutos();
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem('loja_produtos', JSON.stringify(produtos));
        atualizarTabela();
    }
}

function sair() {
    location.reload(); // Recarrega para voltar ao login
}