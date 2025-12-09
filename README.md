# Bem-vindo ao seu projeto Lovable

## Informações sobre o projeto

**Use o seu IDE preferido**

Se quiser trabalhar localmente usando o seu próprio IDE

O único requisito é ter o Node.js e o npm instalados - [instale com o nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <SUA_URL_GIT>

# Passo 2: Navegue até o diretório do projeto.
cd <AGROIPA>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com recarga automática e pré-visualização instantânea.
npm run dev
```

**Editar um ficheiro diretamente no GitHub**

- Navegue até ao(s) ficheiro(s) desejado(s).
- Clique no botão «Editar» (ícone de lápis) no canto superior direito da visualização do ficheiro.
- Faça as suas alterações e confirme as alterações.

**Use o GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão “Código” (botão verde) próximo ao canto superior direito.
- Selecione a guia “Codespaces”.
- Clique em “Novo codespace” para iniciar um novo ambiente Codespace.
- Edite os ficheiros diretamente no Codespace e confirme e envie as alterações quando terminar.

## Que tecnologias são utilizadas neste projeto?

Este projeto foi desenvolvido com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


# agroipa_backend - scaffold

Este repositório contém um scaffold simplificado do backend Django para o projeto agroIPA, gerado automaticamente a partir da documentação fornecida.

## Como usar

1. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux / Mac
   venv\Scripts\activate   # Windows
   ```

2. Instale dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Copie `.env.example` para `.env` e ajuste variáveis.

4. Execute migrações e crie superusuário:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. Rode o servidor:
   ```bash
   python manage.py runserver
   ```

> Observação: Este scaffold é um ponto de partida; ajuste conforme necessário e complemente com validações, permissões e testes.