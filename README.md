# Bem-vindo ao AGROIPA

## Informações sobre o projeto

O único requisito é ter o Node.js e o npm instalados - [instale com o nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <AgroIPA>

# Passo 2: Navegue até o diretório do projeto.
cd <AgroIPA>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com recarga automática e pré-visualização instantânea.
npm run dev
```

## Que tecnologias são utilizadas neste projeto?
→ Front-end:
Este projeto foi desenvolvido com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


→ back-end:
Este repositório contém um backend Django simplificado para o projeto agroIPA.

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

> Observação: Este scaffold é um ponto de partida; se necessário ajustar conforme as circunstâncias, permissões e testes.
