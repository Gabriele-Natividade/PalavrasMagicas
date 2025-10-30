document.addEventListener('DOMContentLoaded', () => {
    // Elementos da Interface
    const telaInicial = document.getElementById('tela-inicial');
    const telaJogo = document.getElementById('tela-jogo');
    const telaSucesso = document.getElementById('tela-sucesso');
    const telaFimJogo = document.getElementById('tela-fim-jogo');

    const btnJogar = document.getElementById('btn-jogar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnRepetirSucesso = document.getElementById('btn-repetir-sucesso');
    const btnJogarNovamente = document.getElementById('btn-jogar-novamente');
    const btnSair = document.getElementById('btn-sair');

    const numeroFaseEl = document.getElementById('numero-fase');
    const imagemFaseEl = document.getElementById('imagem-fase');
    const palavraContainerEl = document.getElementById('palavra-container');
    const letrasBaralhoEl = document.getElementById('letras-baralho');
    const feedbackIconeEl = document.getElementById('feedback-icone');

    // Sons (placeholders)
    const somAcerto = new Audio('../game_assets/sounds/correct.mp3');
    const somErro = new Audio('../game_assets/sounds/incorrect.mp3');
    const somSucesso = new Audio('../game_assets/sounds/success.mp3');

    // Variáveis de Estado do Jogo
    let niveis = [];
    let nivelAtual = 0;
    let palavraCorreta = '';
    let letrasAdivinhadas = [];

    // Carregar os dados do jogo do JSON
    async function carregarDadosJogo() {
        try {
            const response = await fetch('../game_assets/data/niveis.json');
            niveis = await response.json();
            console.log('Níveis carregados com sucesso:', niveis);
        } catch (error) {
            console.error('Erro ao carregar os níveis do jogo:', error);
            alert('Não foi possível carregar os dados do jogo. Por favor, verifique o arquivo niveis.json.');
        }
    }

    function mostrarTela(tela) {
        document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
        tela.classList.add('ativa');
    }

    function iniciarJogo() {
        nivelAtual = 0;
        carregarNivel(nivelAtual);
        mostrarTela(telaJogo);
    }

    function carregarNivel(index) {
        if (index >= niveis.length) {
            finalizarJogo();
            return;
        }

        const nivel = niveis[index];
        palavraCorreta = nivel.palavra.toUpperCase();
        letrasAdivinhadas = Array(palavraCorreta.length).fill(null);

        // Atualizar interface
        numeroFaseEl.textContent = `FASE ${nivel.nivel}`;
        imagemFaseEl.src = nivel.imagem;
        feedbackIconeEl.style.visibility = 'hidden';

        // Limpar containers
        palavraContainerEl.innerHTML = '';
        letrasBaralhoEl.innerHTML = '';

        // Criar placeholders para a palavra
        for (let i = 0; i < palavraCorreta.length; i++) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('letra-placeholder');
            placeholder.dataset.index = i;
            palavraContainerEl.appendChild(placeholder);
        }

        // Criar baralho de letras
        const letrasDoBaralho = gerarLetrasParaBaralho(palavraCorreta);
        const cores = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#6A5ACD', '#EE82EE'];
        
        letrasDoBaralho.forEach(letra => {
            const balao = document.createElement('div');
            balao.classList.add('letra-balao');
            balao.textContent = letra;
            balao.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
            balao.addEventListener('click', () => selecionarLetra(balao));
            letrasBaralhoEl.appendChild(balao);
        });
    }

    function gerarLetrasParaBaralho(palavra) {
        const letrasDaPalavra = [...new Set(palavra.split(''))]; // Letras únicas da palavra
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let letrasExtras = [];
        const totalLetrasNoBaralho = Math.min(letrasDaPalavra.length + 5, 12); // Limita o total de letras

        while (letrasExtras.length < totalLetrasNoBaralho - letrasDaPalavra.length) {
            const letraAleatoria = alfabeto[Math.floor(Math.random() * alfabeto.length)];
            if (!letrasDaPalavra.includes(letraAleatoria) && !letrasExtras.includes(letraAleatoria)) {
                letrasExtras.push(letraAleatoria);
            }
        }

        const baralho = [...letrasDaPalavra, ...letrasExtras];
        // Embaralhar o baralho
        return baralho.sort(() => Math.random() - 0.5);
    }

    function selecionarLetra(balao) {
        if (balao.classList.contains('usada')) return;

        const letraSelecionada = balao.textContent;
        const proximoIndexVazio = letrasAdivinhadas.indexOf(null);

        if (proximoIndexVazio === -1) return; // Palavra já está completa

        if (palavraCorreta[proximoIndexVazio] === letraSelecionada) {
            // Acerto
            letrasAdivinhadas[proximoIndexVazio] = letraSelecionada;
            const placeholder = palavraContainerEl.children[proximoIndexVazio];
            placeholder.textContent = letraSelecionada;
            placeholder.classList.add('correta');
            balao.classList.add('usada');
            somAcerto.play();
            
            mostrarFeedback(true);

            // Verificar se a palavra foi completada
            if (!letrasAdivinhadas.includes(null)) {
                nivelConcluido();
            }
        } else {
            // Erro
            somErro.play();
            balao.classList.add('incorreta');
            mostrarFeedback(false);
            setTimeout(() => {
                balao.classList.remove('incorreta');
            }, 500);
        }
    }
    
    function mostrarFeedback(correto) {
        feedbackIconeEl.src = correto ? '../game_assets/images/correct.png' : '../game_assets/images/incorrect.png';
        feedbackIconeEl.style.visibility = 'visible';
        setTimeout(() => {
            feedbackIconeEl.style.visibility = 'hidden';
        }, 1000);
    }

    function nivelConcluido() {
        somSucesso.play();
        setTimeout(() => {
            mostrarTela(telaSucesso);
        }, 1500);
    }
    
    function avancarNivel() {
        nivelAtual++;
        carregarNivel(nivelAtual);
        mostrarTela(telaJogo);
    }

    function finalizarJogo() {
        mostrarTela(telaFimJogo);
    }

    // Event Listeners dos botões
    btnJogar.addEventListener('click', iniciarJogo);
    btnAvancar.addEventListener('click', avancarNivel);
    btnRepetirSucesso.addEventListener('click', () => {
        carregarNivel(nivelAtual);
        mostrarTela(telaJogo);
    });
    btnJogarNovamente.addEventListener('click', iniciarJogo);
    btnSair.addEventListener('click', () => {
        mostrarTela(telaInicial); // Volta para a tela inicial
    });

    // Iniciar o carregamento dos dados
    carregarDadosJogo();
});