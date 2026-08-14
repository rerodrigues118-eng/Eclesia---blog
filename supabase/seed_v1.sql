-- ================================================================
-- ECLESIA — Seed v1.0
-- Rodar APÓS o schema_v1.sql
-- ================================================================

-- ============================================================
-- PLANOS DE ASSINATURA
-- ============================================================
insert into subscription_plans (name, tagline, price_cents, interval, interval_count, benefits, active) values
(
  'Mensal',
  'Para começar a jornada',
  1990,
  'month',
  1,
  array[
    'Acesso completo ao Blog Eclesia',
    'Orações exclusivas para assinantes',
    'Newsletter diária com liturgia e santo do dia',
    'Desconto de 10% na Loja Eclesia',
    'Suporte por e-mail'
  ],
  true
),
(
  'Trimestral',
  'O caminho do peregrino',
  4990,
  'month',
  3,
  array[
    'Tudo do plano Mensal',
    'Acesso antecipado a novos conteúdos',
    'Desconto de 15% na Loja Eclesia',
    'Guias de Advento e Quaresma exclusivos',
    'Suporte prioritário'
  ],
  true
),
(
  'Anual',
  'Para quem vive a fé todo dia',
  15990,
  'year',
  1,
  array[
    'Tudo do plano Trimestral',
    'Desconto de 20% na Loja Eclesia',
    'Acesso ao arquivo completo de artigos',
    'Badge de assinante fiel no perfil',
    'Convite para eventos exclusivos online',
    'Nome nos agradecimentos anuais do Eclesia'
  ],
  true
);

-- ============================================================
-- SANTOS (seed inicial — 5 registros do protótipo)
-- Adicionar os demais ~360 via Admin ou script de importação
-- ============================================================
insert into saints (name, slug, title, feast_month, feast_day, short_bio, full_bio, patronage, category, image_url, prayer, quotes, featured) values
(
  'Santo Tomás de Aquino',
  'santo-tomas-de-aquino',
  'Doutor Angélico e Príncipe dos Teólogos',
  1, 28,
  'Doutor Angélico da Igreja. Suas contribuições monumentais para a teologia e a filosofia, unindo a razão aristotélica à revelação divina, continuam a ser a base do ensino católico.',
  'Santo Tomás de Aquino nasceu em 1225 em Roccasecca, perto de Nápoles. Ingressou na Ordem dos Pregadores (Dominicanos) contra a vontade inicial de sua nobre família. Estudou sob a orientação de Santo Alberto Magno em Paris e Colônia.

Conhecido por sua inteligência fulgurante e profundo espírito de oração, escreveu obras monumentais como a Summa Theologiae e o Summa contra Gentiles, além dos hinos eucarísticos como o Tantum Ergo e Panis Angelicus. Uniu perfeitamente a filosofia aristotélica e a teologia cristã, demonstrando que fé e razão não se opõem, mas se completam.',
  'Estudantes, Teólogos e Academias',
  'Doutor da Igreja',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBohcZZDNXl47K0mfWhQCGeRP87rslFExViQT6gPyTs4lbDQHsYXwi9FAePoOv5LJMhmA2uicLdCJ1PGAT0GHFomPlprM8LrVCHu1wjVDcN9ckYyCrleIQaTM1LOq8jaADCLvyFZjkryDHn5fH1GfzSBnUbSYimsru38ignckfoXQGCNeIj4hUBA2aZs8AgKWvYliqucTqlkKR3wFbtjIQvcPk4h0pfWUJJ8xfuEVijT5_jYnhWt_7Z',
  'Ó Deus, que tornastes Santo Tomás de Aquino admirável pelo zelo da santidade e pelo amor aos estudos teológicos, concedei-nos compreender seus ensinamentos e imitar seus exemplos de virtude. Por Nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
  array[
    'Para aquele que tem fé, nenhuma explicação é necessária. Para aquele sem fé, nenhuma explicação é possível.',
    'A virtude da caridade nos une a Deus em um abraço de amizade profunda.',
    'A Eucaristia é o sacramento do amor, sinal da nossa união com Cristo.'
  ],
  true
),
(
  'Santa Teresinha do Menino Jesus',
  'santa-teresinha-do-menino-jesus',
  'Virgem e Doutora da Igreja',
  10, 1,
  'Virgem e Doutora da Igreja. O "pequeno caminho" da infância espiritual e a vocação para o amor no coração da Igreja.',
  'Thérèse Martin nasceu em Alençon, França, em 1873. Aos 15 anos, ingressou no Carmelo de Lisieux, adotando o nome de Teresa do Menino Jesus e da Sagrada Face.

Com sua espiritualidade da "Infância Espiritual" ou "Pequena Via", ensinou que a santidade não exige obras grandiosas e inacessíveis, mas o abandono de uma criança nos braços do Pai Celestial e a realização dos pequenos atos do cotidiano com um amor infinito. Escreveu a célebre autobiografia "História de uma Alma". Foi declarada Padroeira das Missões e Doutora da Igreja por São João Paulo II.',
  'Missões e Floristas',
  'Virgem e Doutora da Igreja',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5ByDCjSbbsT2tnT63_CtgDUltafXV5nr5WV7qP09IBZQqLG7Ekyv6gdC3JPXMzIjF0W4kk2RQA_AEpeIwMJUS93VOtPI_nKqfkAUt4i_3G9htAAuhwowHktnzNpCYWMDkuKW35aglTcnI7E3DiySjpCEBF0zcim6sBKM47peE-Bh65pcgmsYsCinzceLciMd8Wq3ZaXLbbr_cE_OOYBoWgcb6rSf_8UQmVFyw4r8Gud1sovzLCIfT',
  'Ó Deus, que preparastes o vosso Reino para os pequeninos e humildes, dai-nos seguir confiantes o caminho de Santa Teresa, para que, por sua intercessão, nos seja revelada a vossa glória. Por nosso Senhor Jesus Cristo, vosso Filho, na unidade do Espírito Santo. Amém.',
  array[
    'No coração da Igreja, minha Mãe, eu serei o Amor!',
    'Quero passar o meu céu fazendo o bem sobre a terra. Farei cair uma chuva de rosas.',
    'O que me atrai para o Reino dos CÉUS é o amor de Deus que me preenche.'
  ],
  false
),
(
  'São Pedro Apóstolo',
  'sao-pedro-apostolo',
  'Príncipe dos Apóstolos e Primeiro Papa',
  6, 29,
  'O primeiro Papa e rocha sobre a qual Cristo edificou Sua Igreja. Mártir em Roma sob o imperador Nero.',
  'Pescador da Galileia chamado Simão, foi nomeado por Jesus como Cephas (Pedro, a Pedra) sobre a qual a Igreja subsiste. Líder do colégio apostólico, confessou com fervor a divindade de Cristo.

Após a Ressurreição e Pentecostes, guiou a primeira comunidade cristã em Jerusalém e posteriormente viajou para Roma, onde estabeleceu a Sé Apostólica. Sofreu o martírio por crucificação de cabeça para baixo na Colina do Vaticano por volta do ano 64 d.C.',
  'Papas, Pescadores e A Igreja Católica',
  'Apóstolo e Mártir',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5FqaKyH_1i63aiN8l-OSq317yke20l17WVIA2Jaw15LXWlUORaB_X3JDAkJyszByTmQjG83bnsi66O_4t2VL9JGUk6QiUML5LSkMQrbbosw5oWtXse2TsZxkPhnt5K67BdOLndhhfNUKFwDvmlWvMhEyJo99SYLJwU7QxjyLyDsJaQzzps0IeokOBHIeK6QODdnxP708G0FJ433vlT6SGtUkDE_bjqzOdBdjrqOuMPEJHgRN2vyrb',
  'Ó Deus, que concedestes a São Pedro Apóstolo as chaves do Reino dos Céus e o poder de ligar e desligar, guardai a vossa Igreja fundada sobre a rocha da fé apostólica. Por Cristo, nosso Senhor. Amém.',
  array[
    'Senhor, para quem iremos nós? Tu tens as palavras de vida eterna.',
    'Tu és o Cristo, o Filho do Deus vivo.',
    'Sede sóbrios e vigiai. O vosso adversário, o diabo, rodeia como um leão a rugir.'
  ],
  false
),
(
  'São Francisco de Assis',
  'sao-francisco-de-assis',
  'O Poverello de Assis',
  10, 4,
  'Fundador da Ordem dos Frades Menores, dedicou sua vida à pobreza radical e à imitação de Cristo crucificado.',
  'Nascido em Assis, Itália, em 1181, filho de um rico comerciante de tecidos, Francisco abandonou suas riquezas ao ouvir o chamado de Cristo na igrejinha de São Damião.

Fundou a Ordem dos Frades Menores, caracterizada pela pobreza evangélica, fraternidade e amor compassivo pelas criaturas. Em Monte Alverne, recebeu no próprio corpo os Estigmas da Paixão de Cristo, tornando-se o primeiro estigmatizado da história.',
  'Ecologia, Animais e Ordem Franciscana',
  'Confessor e Fundador',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCjOuPzMKTBKWNhnNun7dFxXS_9m1qO5zSvS-1vScStVpMA4VpCnPvhE_vY_mQ0bqSXpFeKtuo8BXQc3PYZU4NxUQZZiM-DZynxTPaEblcBK3rCyT5wp3uqrjSHePUKsgsqyg0eBLJW0_ShKPajyBkaVDfrT0xh1SJAN9IHvs3TfvUUjhaCg99ErUFJzrldjM_sq802Ps38zNsLNbhHCD9Y8m5fBJsVRQavxmvBFLn-iTCekfAbpxpJ',
  'Senhor, fazei-me instrumento de vossa paz. Onde houver ódio, que eu leve o amor; onde houver ofensa, que eu leve o perdão; onde houver discórdia, que eu leve a união. Amém.',
  array[
    'Comece fazendo o que é necessário, depois o que é possível, e de repente você estará fazendo o impossível.',
    'Pregue o Evangelho em todo o tempo. Se necessário, use palavras.',
    'Louvado sejas, meu Senhor, com todas as tuas criaturas.'
  ],
  false
),
(
  'Santa Teresa de Ávila',
  'santa-teresa-de-avila',
  'Santa Teresa de Jesus, Doutora da Igreja',
  10, 15,
  'Reformadora do Carmelo e Doutora da Igreja. Mestra da oração mental e profunda mística espanhola.',
  'Nascida em Ávila, Espanha, em 1515, Teresa de Cepeda y Ahumada ingressou no Carmelo da Encarnação. Experimentou uma profunda conversão espiritual que a levou a reformar a Ordem Carmelita juntamente com São João da Cruz, fundando os Carmelitas Descalços.

Autora de clássicos espirituais como "O Castelo Interior" (Moradas), "Caminho de Perfeição" e sua "Vida", descreveu com precisão incomparável as etapas da união mística com Deus. É a primeira mulher proclamada Doutora da Igreja.',
  'Espanha, Escritores e Místicos',
  'Virgem e Doutora da Igreja',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuhdFY8XmCovMvEXljm9HC1w9-Huj0mJ2h0ge-q4EVPHeqEsBGcHjujKfQoHVloZfNMmaOD38fvJzK60h5g924BIUOeBlLXm9eY-0dS9u3UbZWMUxIeErKJSovfLGjjhlaNjNuHvolZWCg5mTNW1V-ZtYsu5cfo0ROrBt1jYS4_Ia4z5NIxC0rHIF6qeeN5ZnLO4Hj-_35r_wpkvGPzbd__xlQk2yZdWsZ4kup3T04DrtB7rvi9H6t0',
  'Nada te turbe, nada te espante, tudo passa, Deus não muda. A paciência tudo alcança; quem a Deus tem, nada lhe falta: só Deus basta! Amém.',
  array[
    'Só Deus basta!',
    'A oração não é outra coisa senão um trato de amizade, estando muitas vezes a sós com Quem sabemos que nos ama.',
    'Se não nos entregarmos a Deus de todo o coração, nunca teremos paz verdadeira.'
  ],
  false
);

-- ============================================================
-- ORAÇÕES (seed inicial — 6 categorias × 1 oração)
-- ============================================================
insert into prayers (title, slug, situation, content, is_featured_today, featured_date) values
(
  'Oração pela Cura e Saúde',
  'oracao-pela-cura-e-saude',
  'Saúde',
  'Senhor Jesus Cristo, que durante Vossa vida na terra curastes os enfermos e consolastes os que sofriam, olhai com misericórdia para este vosso servo que vos implora.

Pela Vossa santa agonia e pela intercessão da Santíssima Virgem Maria, nossa Mãe, e de todos os Santos, afastai a doença que aflige o corpo e restaurai as forças da saúde, para que com vigor renovado possa louvai-Vos e servir-Vos.

Não nos deixeis desanimar na prova, mas que a tribulação do momento presente nos prepare para a glória eterna que nos prometestes. Amém.',
  true,
  current_date
),
(
  'Oração pelo Trabalho e Sustento',
  'oracao-pelo-trabalho-e-sustento',
  'Trabalho',
  'São José, padroeiro dos trabalhadores e guardião da Sagrada Família, intercedei por mim perante o Pai Celestial.

Ajudai-me a encontrar trabalho digno com que possa sustentar minha família e contribuir para o bem de todos. Concedei-me competência, honestidade e diligência em minha profissão.

Que o fruto de meu trabalho seja bênção para os meus e glória para Deus, que é o Senhor de toda obra boa. Amém.',
  false,
  null
),
(
  'Oração pela Família',
  'oracao-pela-familia',
  'Família',
  'Sagrada Família de Nazaré, modelo de amor, obediência e serviço, protegei nossa família.

Que reine em nosso lar o amor de Jesus, a ternura de Maria e a fortaleza de José. Que nossas refeições sejam partilha, nossas alegrias sejam ação de graças e nossas tristezas sejam unidas à Cruz de Cristo.

Afastai de nós toda discórdia, e fazei de nosso lar uma pequena Igreja doméstica, onde cada membro cresça em santidade e amor a Vós. Amém.',
  false,
  null
),
(
  'Oração no Luto e na Perda',
  'oracao-no-luto-e-na-perda',
  'Luto',
  'Senhor da vida e da ressurreição, que chorastes diante do túmulo de Lázaro e consolastes Maria Madalena no jardim da Páscoa, consolai meu coração ferido pela perda daquele que amei.

Que a fé na ressurreição seja minha âncora nesta dor. Crede que aquele que morreu em Vós não pereceu, mas passou desta vida para a Vida Eterna que prometestes.

Dai-me força para atravessar este vale de lágrimas com a esperança que não envergonha, sabendo que nos reuniremos na Vossa glória. Amém.',
  false,
  null
),
(
  'Oração de Gratidão',
  'oracao-de-gratidao',
  'Gratidão',
  'Bom Deus, Pai de toda bondade, de quem procedem todos os dons perfeitos, elevo meu coração a Vós em ação de graças.

Obrigado pela vida, pela saúde, pela fé, pela família, pelos amigos e por tantos bens que não mereço, mas que generosamente concedeis. Obrigado pelas provas que purificam, pelas esperas que ensinam e pelas graças que sustentam.

Que minha gratidão não seja apenas de palavras, mas de uma vida inteira a Vos servir com alegria. Deo Gratias! Amém.',
  false,
  null
),
(
  'Oração pela Proteção Espiritual',
  'oracao-pela-protecao-espiritual',
  'Proteção',
  'São Miguel Arcanjo, defendei-nos no combate. Sede nosso socorro contra a malícia e as ciladas do demônio.

Que Deus lhe imponha a sua autoridade, é o nosso humilde pedido. E vós, príncipe da milícia celestial, precipitai no inferno, pelo divino poder, Satanás e os outros espíritos malignos que vagam pelo mundo para a perdição das almas.

Arcanjo poderoso, protegei esta família, este lar e esta alma que se entregam ao vosso cuidado. Amém.',
  false,
  null
);
