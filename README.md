# Forma — Autenticação e catálogo

Versão **web** da atividade de Dispositivos Móveis, desenvolvida com React, TypeScript, TanStack Start e Tailwind CSS. Não é um aplicativo Flutter e não utiliza `shared_preferences`: seu equivalente nesta versão é o `localStorage` do navegador.

## Executar

Instale Bun e execute:

```sh
bun install
bun run dev
```

Abra o endereço indicado no terminal. Para executar os testes: `bun run test`.

## API e fluxo

API: https://api-produtos-mobile.onrender.com

Tutorial: https://api-produtos-mobile.onrender.com/tutorial-login

- `/`: formulário de login. Envia `POST /auth/login` com `{username, senha}` em JSON.
- `/cadastro`: envia `POST /auth/cadastrar` com `{nome, username, senha}`. Após sucesso, retorna ao login com o usuário preenchido; a senha não é persistida.
- O `access_token` é armazenado em `localStorage` sob `forma.access_token`.
- Ao abrir novamente, o token é validado por `GET /auth/me` com `Authorization: Bearer <token>`. A saudação usa o nome retornado pela API.
- `/catalogo`: consulta `GET /produtos` com o token e permite busca local. Produtos, preços e disponibilidade vêm da API; as fotografias são ilustrativas, geradas para esta apresentação.
- O botão **Sair** remove o token e retorna ao login.
- Erros 401 de login e sessão e erros 400 de cadastro possuem feedback amigável. Falhas de conexão não apagam o token salvo. A API hospedada no Render pode levar alguns segundos para responder inicialmente.

JWT e a criptografia BCrypt são implementados pela API fornecida, não pelo navegador. O frontend nunca armazena a senha. `localStorage` não é armazenamento criptografado: esta solução didática segue a persistência local solicitada; aplicações de produção devem avaliar cookies HttpOnly, proteção contra XSS e políticas de sessão adequadas.

## Roteiro para demonstração

1. Use uma conta de teste fornecida na atividade com senha incorreta e capture o erro.
2. Entre com a senha correta e capture a saudação e os produtos.
3. Recarregue ou feche e reabra no mesmo navegador: a sessão deve continuar.
4. Clique em **Sair** e confirme a volta ao login.
5. Crie uma conta com nome de usuário único. Confirme o retorno ao login e entre com a nova conta.
6. Tente cadastrar novamente o mesmo usuário e confira o erro de duplicidade.

Credenciais de teste devem ser consultadas no enunciado da atividade; nenhuma senha é embutida no código.

## Entrega

Repositório da entrega: https://github.com/GabirUema/dispositivos

O repositório contém o código-fonte nas pastas `src` e `public`, os arquivos de configuração e este README. As sete capturas reais estão na pasta [`capturas`](https://github.com/GabirUema/dispositivos/tree/main/capturas): erro de senha, login com catálogo, sessão restaurada, formulário de cadastro, cadastro concluído, login da nova conta e retorno ao login após logout.

Envie o link do repositório no Moodle e anexe as capturas solicitadas. O envio ao Moodle não é automático. Esta é uma versão web, não Flutter; confirme com o professor se atende ao formato exigido na atividade.
