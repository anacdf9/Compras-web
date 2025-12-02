// js/dados.js

// Verifica se já temos produtos salvos no navegador, se não, usa os padrão
const produtosIniciais = [
    { id: 1, nome: "Brinco Orquídea", preco: 299.00, img: "images/produtos/brinco1.jpg", categoria: "brincos", destaque: true },
    { id: 2, nome: "Colar Pedra Fusion", preco: 150.00, img: "images/produtos/colar1.jpg", categoria: "colares", destaque: true },
    { id: 3, nome: "Argola Coração", preco: 232.00, img: "images/produtos/argola.jpg", categoria: "brincos", destaque: false },
    // Adicione mais produtos aqui
];

// Função para carregar produtos (Lê do LocalStorage ou usa o inicial)
function carregarProdutos() {
    const produtosSalvos = localStorage.getItem('loja_produtos');
    if (produtosSalvos) {
        return JSON.parse(produtosSalvos);
    } else {
        // Salva os iniciais para começar
        localStorage.setItem('loja_produtos', JSON.stringify(produtosIniciais));
        return produtosIniciais;
    }
}