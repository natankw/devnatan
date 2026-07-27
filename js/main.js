// =============================
// R.H.S - MAIN
// =============================

document.addEventListener("DOMContentLoaded", () => {

    const welcome = document.getElementById("welcome");
    const site = document.getElementById("site");
    const entrar = document.getElementById("entrar");

    // Oculta o site ao iniciar
    if (site) {
        site.style.display = "none";
    }

    // Botão Entrar
    if (entrar) {
        entrar.addEventListener("click", () => {

            if (welcome) {
                welcome.style.opacity = "0";

                setTimeout(() => {
                    welcome.style.display = "none";

                    if (site) {
                        site.style.display = "block";

                        requestAnimationFrame(() => {
                            site.style.opacity = "1";
                        });
                    }

                }, 400);
            }

        });
    }

    // Busca automática do banco
    carregarBanco();

});

async function carregarBanco() {

    try {

        const resposta = await fetch("./banco.json?" + Date.now());

        if (!resposta.ok)
            throw new Error("Banco não encontrado.");

        const dados = await resposta.json();

        console.log("Banco carregado:", dados);

        if (typeof renderizarDownloads === "function")
            renderizarDownloads(dados.downloads || []);

        if (typeof renderizarGrupos === "function")
            renderizarGrupos(dados.grupos || []);

        if (typeof renderizarCanais === "function")
            renderizarCanais(dados.canais || []);

    } catch (erro) {

        console.error("Erro:", erro);

    }

}
