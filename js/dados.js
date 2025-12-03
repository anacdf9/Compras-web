// js/dados.js

// Verifica se já temos produtos salvos no navegador, se não, usa os padrão
const produtosIniciais = [
    { id: 1, nome: "Brinco Orquídea", preco: 299.00, img: "img/brincoorquidea.jpg", categoria: "brincos", destaque: true, descricao: "Brinco inspirado em orquídeas, acabamento polido e banho dourado." },
    { id: 2, nome: "Colar Pedra Fusion", preco: 150.00, img: "img/brincofusion.jpg", categoria: "colares", destaque: true, descricao: "Colar com pedra fusion central, corrente delicada e fecho resistente." },
    { id: 3, nome: "Argola Coração", preco: 232.00, img: "img/brincocoração.jpg", categoria: "brincos", destaque: false, descricao: "Argola com pingente em formato de coração, perfeito para o dia a dia." },
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