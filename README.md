## Mapa Iterativo (Sulfibra) - BACKEND

Bem-vindo(a) à API REST do Mapa Iterativo, desenvolvida exclusivamente para a Sulfibra. Esta API fornece acesso a recursos relacionados à aplicação Mapa Iterativo, uma plataforma projetada para otimizar e aprimorar o gerenciamento estratégico de representantes comerciais na venda de casas modulares em todo o Brasil.

## Visão Geral

A aplicação foi desenvolvida para possibilitar à empresa Sulfibra cadastrar representantes, associando-os a cidades específicas. Essa associação visa otimizar operações estratégicas, permitindo uma gestão eficiente das atividades dos representantes em diferentes localidades. Através de contas personalizadas, os usuários podem gerenciar suas operações de maneira eficaz, contribuindo para o aprimoramento do desempenho e da abrangência geográfica da empresa.

## Funcionalidades Principais

#### 1. Autenticação (Auth)

- Login, logout e atualização de tokens de acesso.

#### 2. Contas (Accounts)

- Listar, criar, visualizar detalhes, atualizar e excluir contas.

## Documentação da API

Explore a documentação para compreender os endpoints disponíveis, parâmetros e respostas. A documentação interativa da API pode ser acessada através do Swagger no link: [http://localhost:3005/api-docs/](http://localhost:3005/api-docs/).

## Instalação

Para instalar as dependências, execute o seguinte comando:

```bash
yarn
```

Instalar globalmente o CLI do dotenv:

```bash
yarn global add dotenv-cli
```

E para iniciar o servidor, execute o seguinte comando:

```bash
yarn dev
```

A aplicação estará disponível em http://localhost:3005.

## Testes

Para rodar os testes basta rodar o seguinte comando:

```bash
  yarn test
```

E para testes de integrações/e2e rodar o seguinte comando:

```bash
  yarn test:e2e
```

OBS: tenha certeza de ter o env.test configurado correntamente com o

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sulfibra_tc_test?schema=public"

## Rotas no Insomnia

As rotas da API estão documentadas no arquivo `insomnia.json`. Importe este arquivo para o Insomnia para verificar e testar as rotas.

## Configuração do Banco de Dados

Certifique-se de criar um banco de dados PostgreSQL na porta 5432 com o nome `mapasulfibra` antes de iniciar a aplicação. Utilize a seguinte URL de banco de dados como referência:

```bash
DATABASE_URL="postgresql://sulfibra:sulfibra@localhost:5432/mapasulfibra?schema=public"
```

## Comandos Úteis

#### Banco de Dados

- **Popular o Banco de Dados (Seed):**

  ```bash
  yarn prisma:seed
  ```

- **Executar Prisma Studio:**

  ```bash
  yarn prisma:dev:studio
  ```

- **Executar Migrações do Prisma:**
  ```bash
  yarn prisma:dev:migrate
  ```
