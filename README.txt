TÍTULO DO PROJETO:
Catálogo virtual para lojas (diversas)

EQUIPE:
- Ana Clara Silveira Ferreira

DESCRIÇÃO DAS FUNCIONALIDADES


Este projeto consiste no desenvolvimento do front-end de um Catálogo Virtual interativo, simulando uma experiência de e-commerce completa, 
focado na facilidade de uso e na integração direta com o vendedor via WhatsApp.

O sistema foi dividido em dois módulos principais:

1. ÁREA DO CLIENTE (Vitrine e Compras):
   - Navegação Intuitiva: Interface limpa e responsiva (Bootstrap) com vitrine de produtos, carrossel de banners e seleção rápida de categorias.

   - Filtros Dinâmicos (jQuery): Permite filtrar produtos por texto (busca), categoria ou faixa de preço em tempo real, sem recarregar a página.

   - Carrinho de Compras: Gerenciamento completo de itens (adicionar, remover, alterar quantidade) com persistência de dados via LocalStorage.

   - Identificação Simplificada: Sistema de "login" sem senha, capturando apenas Nome e Telefone para facilitar o acesso de usuários leigos.

   - Checkout via API WhatsApp: Ao finalizar o pedido, o sistema gera automaticamente uma mensagem formatada com o resumo da compra e abre uma conversa direta com o vendedor.

   - Histórico de Navegação: Implementação de Breadcrumbs (migalhas de pão) para facilitar a localização do usuário no site.

2. ÁREA ADMINISTRATIVA (Gerenciamento):
   - Acesso Restrito: Simulação de login seguro (usuário/senha) via JavaScript.

   - Dashboard de Análise: Exibição de gráficos (Chart.js) com estatísticas de visitas, cliques em produtos e pedidos finalizados.

   - Gestão de Produtos (CRUD): Interface para adicionar, editar e excluir produtos, com pré-visualização de imagens.

   - Personalização da Loja: Ferramentas para o administrador alterar o Logo, Banners rotativos e Categorias diretamente pelo painel.

   - Persistência de Dados: Todo o banco de dados da loja (produtos, configurações e métricas) é simulado e mantido no LocalStorage do navegador.

---------------------------------------------------------------------------
TECNOLOGIAS UTILIZADAS
---------------------------------------------------------------------------
- HTML5 Semântico
- CSS3 (Arquivo externo com uso maximizado de seletores)
- Bootstrap 5 (Layout responsivo, Grid System, Modais e Componentes)
- JavaScript (Lógica de negócio, validação de formulários e manipulação DOM)
- jQuery (Manipulação de eventos e filtros)
- APIs Web (Integração WhatsApp Click-to-Chat)
- Bibliotecas de Terceiros: Chart.js (Gráficos)