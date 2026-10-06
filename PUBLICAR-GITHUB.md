# Publicar o Pauta

1. Crie um repositório público chamado pauta na sua conta GitHub, com README inicial.
2. Envie o conteúdo desta pasta para a raiz do repositório, incluindo .github/workflows/pages.yml. Não envie o ZIP como um arquivo único.
3. Em Settings → Pages → Build and deployment → Source, escolha GitHub Actions.
4. Em Actions → Publicar Pauta → Run workflow, execute na branch main.
5. Aguarde o trabalho deploy terminar. O endereço aparece em Settings → Pages e no resultado do deploy.

O fluxo instala dependências, valida, compila e publica a cada alteração na main. Os caminhos são calculados pela configuração do Pages, inclusive para um domínio próprio.

## Progresso existente
Antes de mudar, abra o Pauta local → Sua trilha → Exportar progresso.
No site publicado, use Importar progresso. Os dados ficam no navegador de cada pessoa; não há login nem sincronização automática. O site não requer Node no computador do visitante. Uso offline e instalador Windows não fazem parte desta publicação.

## Compilar manualmente
Node 22: npm ci, npm run check, npm run build.
Para subpasta, defina PAUTA_BASE_PATH=/pauta antes do build.
