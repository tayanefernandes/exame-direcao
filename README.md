# Exame de Direção | Sorocaba

Site de estudo do percurso da prova prática de direção em Sorocaba.

## Recursos

- Botão de contato no rodapé abre o formulário Tally `q5DXQ8` em popup, com a integração oficial. O código do site usa apenas o ID público do formulário.

- Google Analytics 4 conectado ao fluxo `G-CHGBEKSFC0`, com carregamento assíncrono da tag do Google e coleta básica de visualizações da página.

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

Seção #pontuacao atualizada em 16/11/2026 a partir do formulário de avaliação do exame prático do Detran-SP, categoria B, fornecido para esta atualização. Publica somente a lista de condutas, sem imagens da ficha, dados pessoais, identificação de examinadores ou resultado individual.

- 40 itens nos grupos I a IV: 10 gravíssimos (6 pontos), 11 graves (4), 11 médios (2) e 8 leves (1). Inclui um campo genérico de outra infração em cada grupo, sem apresentar a lista como todo o CTB.
- 15 situações do grupo V: incapacidade técnica/instabilidade emocional, com 0 ponto. Explica que não somam pontos e que interrupção exige os critérios e a fundamentação previstos na norma.
- Descrições resumidas, com incisos e alcance conferidos no CTB e no MBEDV. Usa art. 182, II para parada de 50 cm a 1 m e art. 182, III para parada a mais de 1 m. Explicita as exceções de dirigir com uma mão, contramão e conversão autorizada.
- Mantém limite de 10 pontos, pesos 1/2/4/6 e distinção entre reprovação por pontos e interrupção. Preserva FAQ sobre guia, motor apagar, ajustes e sinalização; acrescenta partida e diferença entre parada e estacionamento.
- A lista substitui os 39 exemplos anteriores pelos campos do formulário. Não incorpora as marcações do exame individual nem interpreta a validade de qualquer resultado.

Fontes normativas: Resolução Contran 1.020/2025 (arts. 45 a 47), MBEDV versão 1.0 de janeiro de 2026, CTB consolidado na ANTT e comunicado do Detran-SP de 17/03/2026. Links e data da atualização estão na página. Revisar quando houver alteração normativa. O formulário é a fonte da seleção de itens, e não substitui a legislação.

## Ambiente do pátio revisado por vídeo

Atualização de 17/11/2026 com base na gravação fornecida do short https://www.youtube.com/shorts/HJ8Fikjb6R8. Reconstrução em código, sem redistribuir o vídeo ou imagens do autor.

- As duas opções compartilham piso de blocos, canteiro com guia, galpão claro à esquerda, gradil e árvores à direita, cobertura transversal, pilares, sala de apoio e balizadores.
- A opção 1 para antes da cobertura; um segundo carro ilustrativo segue à frente sob o telhado, representando o início visível da opção 2.
- A opção 2 começa dentro da passagem coberta, atravessa o corredor livre e só aproxima à direita após sair da cobertura. A posição final após o telhado não aparece completa na gravação e permanece estimada.
- Geometria em patio-environment.js compartilhada pelas vistas desenhada e interna. A câmera continua fixa no banco, com capô ocultando o chão próximo e retrovisor para conferir a guia.
- Trajetórias verificadas com o contorno do carro para não cruzar a guia, sala ou apoios. As rodas direitas terminam sobre a faixa amarela. Medidas e pontos de giro são ilustrativos, sem levantamento dimensional do pátio.

### Correção das proporções em 17/11/2026

Corredor reduzido de 151 para 78 unidades de desenho, mantendo a largura do carro. A cobertura passou de aproximadamente 300 × 229 para 162 × 87 unidades; sala, canteiro, árvores e apoios foram reposicionados no mesmo modelo usado pelas vistas de cima e interna. A primeira parada está mais perto da cobertura e a segunda faz uma passagem mais curta. Proporções visuais, sem pretensão de reproduzir medidas reais.
