# Golf Manager 🚗

Aplicação web pessoal para centralizar informações relacionadas ao **Volkswagen Golf Generation 2004**.

> **Categoria:** gestão pessoal de veículo · **Repositório:** [golf-manager](https://github.com/Eliseu-Oliveira/golf-manager)

## Motivação

O Golf Manager foi concebido para reunir informações do veículo em um único ambiente digital, com estrutura preparada para desenvolvimento web, publicação e uso em diferentes dispositivos.

## Stack e infraestrutura identificadas

| Recurso | Evidência no repositório |
| --- | --- |
| Vite | `vite.config.js` e comandos locais documentados |
| Front-end web | `src/`, `public/` e `index.html` |
| Firebase Cloud Firestore | Arquivo de regras `firestore.rules` |
| Netlify | `netlify.toml` e documentação de publicação |
| PWA | Instruções de instalação na tela inicial no README anterior |

**Escopo técnico:** o arquivo de regras do Firestore não confirma, por si só, operações de banco de dados implementadas. A instalação como PWA também deve ser testada nos navegadores de destino.

## Organização

```text
golf-manager/
├── public/             # Recursos públicos
├── src/                # Código-fonte
├── index.html          # Entrada da aplicação
├── package.json        # Dependências e scripts
├── vite.config.js      # Build e desenvolvimento
├── firestore.rules     # Regras de acesso aos dados
└── netlify.toml        # Configuração de publicação
```

## Executar localmente

Pré-requisitos: Node.js e npm compatíveis com o projeto.

```bash
git clone https://github.com/Eliseu-Oliveira/golf-manager.git
cd golf-manager
npm install
npm run dev
```

Acesse a URL exibida pelo terminal, normalmente `http://localhost:5173`.

Se alguma função precisar do Firebase, configure o ambiente de forma apropriada e não exponha segredos no repositório.

## Publicar no Netlify

1. Importe o repositório no painel do Netlify.
2. Confira o build e o diretório de publicação definidos em `netlify.toml`.
3. Configure as variáveis de ambiente necessárias no painel.
4. Valide a execução após o deploy.

O README original também descreve a adição do aplicativo à tela inicial do Android ou iOS. A disponibilidade da experiência PWA deve ser validada no dispositivo.

## Cuidados de engenharia

- **Configuração como código:** regras de dados e deploy versionados junto da aplicação.
- **Segurança:** testar as regras do Firestore e evitar credenciais sensíveis no front-end.
- **Confiabilidade:** verificar navegação e persistência nos ambientes efetivamente utilizados.

## Melhorias propostas

Estas são sugestões, **não funcionalidades comprovadamente prontas**: documentar as telas existentes, incluir imagens do aplicativo, testar as regras do Firestore, criar testes automatizados e registrar procedimentos de backup se houver dados persistidos.

## Desenvolvedor

**Eliseu Oliveira** · [GitHub](https://github.com/Eliseu-Oliveira) · [LinkedIn](https://www.linkedin.com/in/eliseu-germano/)
