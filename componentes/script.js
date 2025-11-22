document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DOS ELEMENTOS DO DOM ---
    const telaInicial = document.getElementById('tela-inicial');
    const telaJogo = document.getElementById('tela-jogo');
    const telaOpcoes = document.getElementById('tela-opcoes');
    const telaCreditos = document.getElementById('tela-creditos');
    const telaFimJogo = document.getElementById('tela-fim-jogo');

    const btnJogar = document.getElementById('btn-jogar');
    const btnOpcoes = document.getElementById('btn-opcoes');
    const btnCreditos = document.getElementById('btn-creditos');
    const btnVoltarMenuFinal = document.getElementById('btn-voltar-menu-final');
    const btnVoltarMenu = document.getElementById('btn-voltar-menu');
    const btnFecharOpcoes = document.getElementById('btn-fechar-opcoes');
    const btnFecharCreditos = document.getElementById('btn-fechar-creditos');

    const numeroFaseEl = document.getElementById('numero-fase');
    const imagemFaseEl = document.getElementById('imagem-fase');
    const palavraContainerEl = document.getElementById('palavra-container');
    const letrasBaralhoEl = document.getElementById('letras-baralho');

    const modalFeedback = document.getElementById('modal-feedback');

    const musicaFundo = document.getElementById('musica-fundo');
    const toggleMusica = document.getElementById('toggle-musica');
    const toggleSfx = document.getElementById('toggle-sfx');
    const somAcerto = new Audio('../game_assets/sounds/correct.mp3');
    const somErro = new Audio('../game_assets/sounds/incorrect.mp3');
    const somSucesso = new Audio('../game_assets/sounds/sucess.mp3');


   // SOM DE CLIQUE PARA TODOS OS BOTÕES
const somClique = new Audio("../game_assets/sounds/click.mp3");

document.querySelectorAll("button").forEach(botao => {
    botao.addEventListener("click", () => {
        if (sfxLigados) {
    somClique.currentTime = 0;
    somClique.play();
}       
    });
});
    

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let niveis = [];
    let nivelAtual = 0;
    let palavraCorreta = '';
    let letrasAdivinhadas = [];
    let musicaLigada = true;
    let sfxLigados = true;

    // --- FUNÇÕES PRINCIPAIS ---

    async function carregarDadosJogo() {
        try {
            const response = await fetch('../game_assets/data/niveis.json');
            niveis = await response.json();
        } catch (error) {
            console.error('Erro ao carregar os níveis do jogo:', error);
            alert('Não foi possível carregar os dados do jogo.');
        }
    }

    function mostrarTela(telaParaMostrar) {
        document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
        telaParaMostrar.classList.add('ativa');
    }

    function iniciarJogo() {
        nivelAtual = 0;
        carregarNivel(nivelAtual);
        mostrarTela(telaJogo);
        tocarMusica();
    }

    function carregarNivel(index) {
        if (index >= niveis.length) {
            finalizarJogo();
            return;
        }

        const nivel = niveis[index];
        palavraCorreta = nivel.palavra.toUpperCase();
        letrasAdivinhadas = Array(palavraCorreta.length).fill(null);

        numeroFaseEl.textContent = `FASE ${nivel.nivel}`;
        imagemFaseEl.src = nivel.imagem;

        palavraContainerEl.innerHTML = '';
        letrasBaralhoEl.innerHTML = '';

        palavraCorreta.split('').forEach(() => {
            const placeholder = document.createElement('div');
            placeholder.classList.add('letra-placeholder');
            palavraContainerEl.appendChild(placeholder);
        });

        const letrasDoBaralho = gerarLetrasParaBaralho(palavraCorreta);
        letrasDoBaralho.forEach(letra => {
            const balao = document.createElement('div');
            balao.classList.add('letra-balao');
            balao.textContent = letra;
            balao.addEventListener('click', () => selecionarLetra(balao));
            letrasBaralhoEl.appendChild(balao);
        });
    }

    function gerarLetrasParaBaralho(palavra) {
        const letrasDaPalavra = [...new Set(palavra.split(''))];
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let letrasExtras = [];
        const totalLetrasNoBaralho = Math.min(letrasDaPalavra.length + 4, 12);

        while (letrasExtras.length < totalLetrasNoBaralho - letrasDaPalavra.length) {
            const letraAleatoria = alfabeto[Math.floor(Math.random() * alfabeto.length)];
            if (!letrasDaPalavra.includes(letraAleatoria) && !letrasExtras.includes(letraAleatoria)) {
                letrasExtras.push(letraAleatoria);
            }
        }
        
        const baralho = [...letrasDaPalavra, ...letrasExtras];
        return baralho.sort(() => Math.random() - 0.5);
    }

    function selecionarLetra(balao) {
        const proximoIndexVazio = letrasAdivinhadas.indexOf(null);
        if (proximoIndexVazio === -1) return;

        const letraSelecionada = balao.textContent;
        letrasAdivinhadas[proximoIndexVazio] = letraSelecionada;

        const placeholder = palavraContainerEl.children[proximoIndexVazio];
        placeholder.textContent = letraSelecionada;
        
        tocarSom(somAcerto);

        if (!letrasAdivinhadas.includes(null)) {
            setTimeout(verificarPalavra, 500);
        }
    }

    function verificarPalavra() {
        const palavraFormada = letrasAdivinhadas.join('');
        if (palavraFormada === palavraCorreta) {
            nivelConcluido();
        } else {
            tentativaIncorreta();
        }
    }
    
    function nivelConcluido() {
        tocarSom(somSucesso);
        mostrarFeedback(true);
    }

    function tentativaIncorreta() {
        tocarSom(somErro);
        mostrarFeedback(false);
    }
    
    function resetarTentativa() {
        letrasAdivinhadas.fill(null);
        for (let placeholder of palavraContainerEl.children) {
            placeholder.textContent = '';
        }
    }

    function mostrarFeedback(isCorrect) {
        let conteudoModal;
        if (isCorrect) {
            conteudoModal = `
                <div class="feedback-modal-content">
                    <h1>MUITO BEM!</h1>
                    <button id="btn-continuar-modal" class="btn-feedback-modal">CONTINUAR</button>
                </div>
            `;
        } else {
            conteudoModal = `
                <div class="feedback-modal-content">
                    <h1>PALAVRA ERRADA!</h1>
                    <button id="btn-tentar-novamente-modal" class="btn-feedback-modal">TENTAR NOVAMENTE</button>
                </div>
            `;
        }
        
        modalFeedback.innerHTML = conteudoModal;
        modalFeedback.classList.add('visivel');

        if (isCorrect) {
            document.getElementById('btn-continuar-modal').addEventListener('click', () => {
                modalFeedback.classList.remove('visivel');
                avancarNivel();
            });
        } else {
            document.getElementById('btn-tentar-novamente-modal').addEventListener('click', () => {
                modalFeedback.classList.remove('visivel');
                resetarTentativa();
            });
        }
    }

    function avancarNivel() {
        nivelAtual++;
        carregarNivel(nivelAtual);
        mostrarTela(telaJogo);
    }
    
    function finalizarJogo() {
        mostrarTela(telaFimJogo);
        musicaFundo.pause();
    }

    function tocarSom(som) {
        if (sfxLigados) {
            som.currentTime = 0;
            som.play();
        }
    }
    
    function tocarMusica() {
        if (musicaLigada) {
            musicaFundo.play();
        } else {
            musicaFundo.pause();
        }
    }

    // --- EVENT LISTENERS ---

    btnJogar.addEventListener('click', iniciarJogo);
    btnOpcoes.addEventListener('click', () => mostrarTela(telaOpcoes));
    btnCreditos.addEventListener('click', () => mostrarTela(telaCreditos));

    btnVoltarMenuFinal.addEventListener('click', () => {
        mostrarTela(telaInicial);
    });
    
    btnVoltarMenu.addEventListener('click', () => {
        musicaFundo.pause();
        mostrarTela(telaInicial);
    });

    btnFecharOpcoes.addEventListener('click', () => mostrarTela(telaInicial));
    btnFecharCreditos.addEventListener('click', () => mostrarTela(telaInicial));

    toggleMusica.addEventListener('change', (e) => {
        musicaLigada = e.target.checked;
        tocarMusica();
    });

    toggleSfx.addEventListener('change', (e) => {
        sfxLigados = e.target.checked;
    });

    carregarDadosJogo();
});