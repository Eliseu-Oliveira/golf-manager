# Golf Manager 🚗

App pessoal para controle completo do VW Golf Generation 2004.

## Deploy no Netlify (passo a passo)

### 1. Subir para o GitHub

```bash
cd golf-manager
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/golf-manager.git
git push -u origin main
```

### 2. Conectar no Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"Add new site" → "Import an existing project"**
3. Escolha **GitHub** e selecione o repositório `golf-manager`
4. As configurações já estão no `netlify.toml`, só clique em **"Deploy site"**
5. Aguarde ~1 minuto — seu site estará em `https://NOME-ALEATORIO.netlify.app`

### 3. Domínio personalizado (opcional)

No painel do Netlify: **Domain settings → Add custom domain**

---

## Instalar no celular como app (PWA)

### Android (Chrome)
1. Abra o site no Chrome
2. Toque no menu ⋮ → **"Adicionar à tela inicial"**
3. O app aparece na home como um aplicativo nativo

### iOS (Safari)
1. Abra o site no Safari
2. Toque em **Compartilhar** → **"Adicionar à Tela de Início"**

---

## Publicar na Play Store (TWA)

Após o site estar no ar com HTTPS:

1. Instale o [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap):
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://SEU-SITE.netlify.app/manifest.webmanifest
bubblewrap build
```
2. Gera um `.aab` pronto para enviar na Play Store
3. Precisa de conta Google Developer ($25 taxa única)

---

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`
