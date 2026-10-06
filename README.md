# Pauta 0.2

Estúdio local para leitura de notas, ritmo e polirritmos. Continuação do projeto
original enviado pelo usuário, preservando catálogo, motor de áudio e identidade visual.

Leia **LEIA-PRIMEIRO.txt** para abrir no Windows. A pasta **out** contém a versão
compilada. **INICIAR-PAUTA.bat** usa apenas Node.js e abre o navegador; não instala
pacotes. O servidor escuta exclusivamente em 127.0.0.1:4317.

## Desenvolvimento

Node.js 22 LTS ou superior recomendado.

```sh
npm ci
npm run check
npm run lint
npm run build
npm start
```

O modo `npm run dev` é opcional. Não execute os dois servidores na mesma porta.
Os guias da versão instalada de Next estão em node_modules/next/dist/docs.

## Funcionalidades

- Notas: claves, suplementares, acidentes, armaduras, solfejo/letras e duas numerações de oitava.
- Ritmo: sete níveis, diferentes compassos, escuta e avaliação de ataques.
- Polirritmos: catálogo original, duas pautas com posicionamento temporal, roda animada e prática de uma voz.
- Trilha: estatísticas, exportação e restauração validada do progresso.
- Interface responsiva; áudio e fonte Bravura locais; nenhuma dependência de fontes Google.

O progresso usa `pauta-progress-v1` no armazenamento do navegador. Não há conta
nem sincronização na nuvem. O backup JSON do Pauta é validado antes de substituir
os dados existentes, com confirmação no aplicativo.

A partitura usa bandeiras individuais (sem agrupamento por barras) e proporções
explícitas nas quiálteras. A avaliação rítmica considera ataques e não duração
de sustentação. Atrasos do dispositivo influenciam a medida.

## Licenças

A fonte Bravura é de Steinberg Media Technologies, sob a SIL Open Font License:
[public/fonts/OFL.txt](public/fonts/OFL.txt). As dependências mantêm suas licenças.

## Validação

Consulte VERIFICACAO.txt. O script scripts/check-music.ts usa sementes reprodutíveis
para os testes de geração. O ZIP inclui código e arquivos estáticos compilados,
sem node_modules, caches nem cópias antigas codificadas.
