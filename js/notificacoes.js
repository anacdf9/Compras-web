
function criarContainerNotificacoes(){
    let c = document.getElementById('notificacoes-container');
    if(c) return c;
    c = document.createElement('div');
    c.id = 'notificacoes-container';
    c.style.position = 'fixed';
    c.style.top = '18px';
    c.style.right = '18px';
    c.style.zIndex = 2000;
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '10px';
    document.body.appendChild(c);
    return c;
}

function showNotificacao(tipo, mensagem, duracao = 4000){
    // tipo: 'sucesso' | 'erro' | 'info'
    const container = criarContainerNotificacoes();
    const div = document.createElement('div');
    div.className = 'notificacao ' + (tipo || 'info');
    div.style.minWidth = '260px';
    div.style.background = '#fff';
    div.style.borderRadius = '8px';
    div.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
    div.style.padding = '10px 12px';
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.alignItems = 'center';

    const svgWrap = document.createElement('div');
    svgWrap.style.width = '36px';
    svgWrap.style.height = '36px';
    svgWrap.style.display = 'flex';
    svgWrap.style.alignItems = 'center';
    svgWrap.style.justifyContent = 'center';

    const texto = document.createElement('div');
    texto.style.flex = '1';
    texto.style.fontSize = '0.95rem';
    texto.innerText = mensagem;

    // ícones inline simples
    const icons = {
        sucesso: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#2e7d32" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        erro: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#c62828" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#1565c0" stroke-width="1.6"/><path d="M12 8v.01M11.5 11h1v4h-1z" stroke="#1565c0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };

    svgWrap.innerHTML = icons[tipo] || icons.info;

    // cor de borda por tipo
    if(tipo === 'sucesso') div.style.borderLeft = '5px solid #2e7d32';
    if(tipo === 'erro') div.style.borderLeft = '5px solid #c62828';
    if(tipo === 'info') div.style.borderLeft = '5px solid #1565c0';

    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.border = 'none';
    close.style.background = 'transparent';
    close.style.cursor = 'pointer';
    close.style.fontSize = '14px';
    close.style.marginLeft = '8px';

    close.onclick = () => { if(div.parentNode) div.parentNode.removeChild(div); };

    div.appendChild(svgWrap);
    div.appendChild(texto);
    div.appendChild(close);
    container.appendChild(div);

    setTimeout(() => { try{ if(div.parentNode) div.parentNode.removeChild(div); } catch(e){} }, duracao);
    return div;
}

// Atalho em pt-br
function mostrarNotificacao(tipo, mensagem, duracao) { showNotificacao(tipo, mensagem, duracao); }
