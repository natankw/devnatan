# R.H.S — Central de Comunidades (V5)

Este é o site reconstruído. Antes de subir pro GitHub Pages, você precisa
ligar o banco de dados gratuito (Firebase) — leva uns 10 minutos e só precisa
ser feito **uma vez**.

## O que foi corrigido

- **Bug grave**: antes, os grupos/canais cadastrados no painel admin só
  apareciam no navegador de quem cadastrou (usava `localStorage`). Ninguém
  mais via as comunidades. Agora tudo fica salvo no **Firestore** (banco de
  dados do Firebase), então qualquer visitante, em qualquer aparelho, vê os
  mesmos dados.
- **Senha exposta**: a senha do admin estava escrita em texto puro dentro do
  `admin.js`, visível pra qualquer um. Agora o login usa o **Firebase
  Authentication** (e-mail + senha real, verificado no servidor do Google).
- **Arquivos sem uso**: `config.json` e `banco.json` não eram lidos por
  nenhum script. Os dados que estavam lá (13 grupos/canais e 5 fotos) foram
  aproveitados — use a aba **"Importar dados antigos"** no painel para
  trazê-los de volta automaticamente.
- **Fotos e nomes manuais**: agora, ao colar o link de um grupo/canal do
  WhatsApp no admin e clicar em "Buscar automaticamente", o sistema tenta
  puxar o nome e a foto direto do WhatsApp (a mesma informação que aparece
  numa pré-visualização de link). Veja a seção **Limitações** abaixo — é uma
  automação real, mas depende de serviços de terceiros.

## 1. Criar o Firebase (gratuito)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
   e clique em **Criar projeto**. Dê o nome que quiser (ex: `rhs-central`).
2. No menu à esquerda, vá em **Compilação → Firestore Database** → **Criar
   banco de dados** → escolha a região mais próxima (ex: `southamerica-east1`)
   → inicie em **modo de produção**.
3. Ainda no Firestore, vá na aba **Regras** e cole o conteúdo do arquivo
   [`firestore.rules`](./firestore.rules) que está nessa pasta. Clique em
   **Publicar**.
4. Vá em **Compilação → Authentication** → **Vamos começar** → ative o
   provedor **E-mail/senha**.
5. Na mesma tela do Authentication, aba **Users**, clique em **Adicionar
   usuário** e crie o seu login de administrador (o e-mail e senha que você
   vai usar em `admin.html`).
6. Volte para a **Visão geral do projeto** (ícone de engrenagem → Configurações
   do projeto) → role até **Seus apps** → clique no ícone `</>` (Web) → dê um
   nome ao app → **Registrar app**. O Firebase vai te mostrar um bloco
   `firebaseConfig = {...}`.
7. Copie esses valores para o arquivo **`js/firebase-config.js`**, substituindo
   os textos `COLE_AQUI...`.

Pronto — o backend está no ar. Isso tudo é grátis dentro do plano gratuito do
Firebase (Spark), que aguenta bem mais tráfego do que um site desse porte usa.

## 2. Subir pro GitHub Pages

Suba a pasta inteira pro seu repositório (substituindo os arquivos antigos) e
faça commit/push como sempre. O `CNAME` já está incluído, então o domínio
`aliancerhs.devs.surf` continua funcionando sem precisar reconfigurar nada.

## 3. Usar o painel

Acesse `seusite.com/admin.html`, entre com o e-mail/senha criados no passo 5,
e:

- **Comunidades**: cole o link do grupo/canal → clique em **Buscar
  automaticamente** → confira o nome/foto preenchidos → escolha categoria,
  VIP e fixado → **Publicar**.
- **Importar dados antigos**: abra o arquivo `data/config-antigo.json` (seus
  13 grupos/canais originais, já incluído nessa entrega), cole o conteúdo na
  caixa de texto da aba, e clique em importar. O sistema busca nome/foto pra
  quem ainda não tinha.
- **Denúncias**: qualquer visitante pode denunciar uma comunidade pelo ícone
  🏴 no card. Você resolve ou remove direto pela aba Denúncias.
- **Configurações**: nome do site, descrição, link do canal oficial, música
  de fundo e texto do rodapé — sem precisar editar código.

## Limitações honestas da busca automática

O WhatsApp não tem uma API oficial pra isso. A busca automática funciona
lendo os metadados públicos (`og:title` / `og:image`) da própria página do
link de convite — a mesma informação que aparece numa pré-visualização de
link. Para isso, o navegador precisa passar por um serviço de proxy público
(porque o WhatsApp não libera acesso direto via CORS). Isso significa:

- Funciona na maioria das vezes, mas pode falhar se o proxy estiver
  temporariamente fora do ar — quando isso acontecer, preencha nome/foto
  manualmente (os campos continuam editáveis).
- Grupos que já estão cheios ou links expirados não têm mais preview, então
  a busca automática também não vai funcionar para eles.
- Se um proxy parar de funcionar em definitivo, troque a lista
  `WHATSAPP_META_PROXIES` em `js/whatsapp-meta.js` por outro serviço
  equivalente.

## Estrutura de arquivos
