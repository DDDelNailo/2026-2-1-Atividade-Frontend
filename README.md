# 2026 - POS - Atividade avaliativa do 2o bimestre no. 1

## Informações gerais
- **Objetivo**:
  1. Atividade avaliativa frontend web
  2. Armazenamento de dados no navegador
  3. Consumo de API fake (dummyjson)
- **Público alvo**: alunos da disciplina de [POS](https://github.com/infoweb-pos/) do curso de [Infoweb](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/) na [DIATINF](https://diatinf.ifrn.edu.br/) no [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- **Professor**: [L A Minora](https://github.com/leonardo-minora/)
- **Aluno**: FIXME
- **Data de entrega**: por causa da festividade do aniversário de Amanda, dia 29/06/2026
## Checklist (passo a passo da tarefa)
- [x] 1. Fork desse repositório
- [x] 2. Colocar o nome nesse arquivo `README.md`, substituindo FIXME por seu nome na linha 10
- [x] 3. Criar um projeto next configurando para biome, typescript, tailwindcss
- [x] 4. Adicionar a lib [shadcnui](https://ui.shadcn.com/)
- [x] 5. Commit com mensagem "criado e configurado app inicial"
- [x] 6. Modificar a tela inicial com as seguintes informações
  - [x] Nome do aluno (`/src/app/page.tsx`)
  - [x] Modificar o título e o ícone da aplicação (`/src/app/layout.tsx`)
  - [x] Adicionar link para a página de login
  - [x] Commit com a mensagem "Modificado tela e layout inicial"
- [ ] 7. Adicionar tela de autenticação
  - [ ] Criar página `/src/app/auth/page.tsx`)
  - [ ] Adicionar formulário de autenticação
  - [ ] Use pelo menos 1 dos hooks de estado (useState, useReducer, useForm, etc)
  - [ ] Verifique / valide apelido e senha
  - [ ] Autentique usando o dummyjson (ver documentação em https://dummyjson.com/docs/auth)
  - [ ] Armazene localmente os dados do usuário
  - [ ] Redirecione para uma página de dashboard, ainda não criada `/dasboard`
  - [ ] Commit com a mensagem "Criado o login"
- [ ] 8. criar a tela de dashboard
  - [ ] Criar página `/src/app/dashboard/page.tsx`)
  - [ ] Verifique se usuário esta conectado (pode usar middleware.ts)
  - [ ] Liste os _quotes_ (frases célebres, citações ou ditados) usando o dummyjson (ver documentação https://dummyjson.com/docs/quotes). Cada item deve ter a possibilidade de editar, ver formulário abaixo.
  - [ ] Crie um formulário para seguir o ciclo de CRUD (criar, atualizar e apagar).
  - [ ] Verifique / valide frase e autor.
  - [ ] Armazene localmente os autores para facilitar a digitação no formulário acima.
  - [ ] Commit com a mensagem "Criado de frases"
- [ ] 9. Publicar projeto no repositório do github

**Lembretes**
1. Telas devem usar componentes [shadcnui](https://ui.shadcn.com/)
2. Componentes devem ser estilizados com [tailwindcss](https://tailwindcss.com/)
3. A aplicação deve ser composta por componentes da própria aplicação
4. Sobre páginas em [nextjs](https://nextjs.org/) ver [layout and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
