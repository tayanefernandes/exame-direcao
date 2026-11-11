# Exame de Direção | Sorocaba

Site de estudo do percurso da prova prática de direção em Sorocaba.

## Recursos

- Duas opções de estacionamento, volante animado e foto aérea do pátio.
- Percurso com etapas selecionáveis e instruções de seta e marcha.
- Parada no portão (ponto 6), seta à direita na saída e seta à esquerda antes da bifurcação.
- Setas com antecedência, desligamento após as manobras e paradas no portão e na placa PARE da Cabreúva.

O percurso e os movimentos do volante são ilustrativos. Confira as condições do local e as orientações do instrutor.

- Zoom para acompanhar o carro, passagem sob o telhado, desvio na Diadema e avisos de troca entre 1ª e 2ª.

## Executar localmente

Site estático em HTML, CSS e JavaScript, sem instalação ou build. Na pasta do projeto:

```sh
python3 -m http.server 8080
```

Abra http://localhost:8080.

## Publicação

Repositório: https://github.com/tayanefernandes/exame-direcao

Projeto Vercel: `exame-direcao`, na equipe `tayane-fernandes-projects`.

Configuração: Framework Other, raiz do repositório, saída `.`, comandos de instalação e build vazios. A configuração está em `vercel.json`. A branch de produção é `main`.

## Origem

Versão recuperada do site Volta de Prova, commit original `9e2aab994c621af6a27344c945d69e5c4cfb45b2`, com os arquivos de aplicação preservados.

## SEO e indexação

- URL principal: https://exame-direcao.vercel.app/
- Título, descrição, canonical, Open Graph e Twitter Card no HTML.
- Dados estruturados WebSite e WebPage descrevem o conteúdo real da página.
- Resumo do percurso e dúvidas frequentes disponíveis no HTML inicial, sem depender do JavaScript.
- robots.txt permite rastreamento e informa o sitemap.xml. O sitemap lista apenas a página canônica; âncoras do simulador não são páginas separadas.
- /index.html redireciona permanentemente para /.

Para acompanhar a indexação, cadastrar uma propriedade de prefixo de URL no Google Search Console com https://exame-direcao.vercel.app/, concluir a verificação de propriedade com o código fornecido pelo Google, enviar https://exame-direcao.vercel.app/sitemap.xml e inspecionar a página inicial. Não há código de verificação configurado enquanto o proprietário não fornecer um.

Ao alterar o conteúdo, atualizar a data real de modificação no sitemap.xml. Caso o domínio mude, atualizar também canonical, metadados sociais, JSON-LD, robots.txt e sitemap.xml. SEO não garante indexação nem posição nos resultados de busca.
