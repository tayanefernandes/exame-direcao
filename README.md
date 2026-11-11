# Exame de Direção | Sorocaba

Site de estudo do percurso da prova prática de direção em Sorocaba.

## Recursos

- Capa com estrada vetorial estilizada, carrinho, placas de PARE, limite de velocidade e curva. A animação é decorativa, separada do percurso de estudo; pode ser pausada, respeita movimento reduzido e para fora da tela. O carrinho sinaliza nas curvas e faz uma pausa ilustrativa junto ao PARE.

- Duas opções de estacionamento, volante animado e foto aérea do pátio.
- Tela cheia no pátio e no percurso, com controles e instrução atual sobre o mapa. Preserva o progresso, usa tela cheia quando disponível e permite sair pelo botão ou Esc.
- Referências de observação sincronizadas com a manobra: entorno, frente, laterais, retrovisores e ponto cego. Na vista interna, o retrovisor direito recebe destaque durante o alinhamento e a conferência final.
- Percurso com etapas selecionáveis e instruções de seta e marcha.
- Aviso compacto de seta e marcha acompanha o carrinho, mantendo tamanho legível em qualquer zoom e reposicionando junto às bordas e às instruções do topo.
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

## Pontuação do exame

Seção #pontuacao adicionada em 11/11/2026. Usa o limite de 10 pontos e pesos 1/2/4/6 da Resolução Contran 1.020/2025, com adoção anunciada pelo Detran-SP em 17/03/2026. Diferencia reprovação por pontos de interrupção por segurança. Tabelas trazem exemplos resumidos para categoria B, com artigos do CTB e acesso às fichas completas no MBEDV. A seção não apresenta os exemplos como catálogo exaustivo nem usa a antiga lista de faltas eliminatórias.

Fontes: Resolução Contran 1.020/2025 (arts. 45 a 47), MBEDV versão 1.0 de janeiro de 2026 e comunicado de atualização do Detran-SP. Links oficiais e data de conferência estão na página. Revisar esses dados quando houver alteração normativa.

A seleção de exemplos em #pontuacao foi ampliada de 19 para 39 em 11/11/2026: 7 leves, 12 médias, 13 graves e 7 gravíssimas. Inclui observação ao sair, painel, marchas, estacionamento, calçado, descidas, conversões, iluminação e chuva. Os exemplos do art. 169 incluem ressalva de enquadramento específico. Pesos de 230, XIX (grave) e 231, IX (média) conferidos no CTB consolidado da ANTT por haver inconsistências textuais nas fichas do MBEDV. Permanece a distinção entre erro isolado, infração e interrupção por segurança.
