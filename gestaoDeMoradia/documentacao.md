Descrição do problema a ser solucionado
A gestão das residências universitárias da UFERSA, após a seleção e concessão das vagas, exige um acompanhamento contínuo por parte da Pró-Reitoria de Assuntos Estudantis (PROAE). Atualmente, atividades como a verificação da permanência dos discentes nas vagas, o monitoramento das exigências acadêmicas, como matrícula mínima e reprovações, o atendimento de demandas espontâneas e os ciclos semestrais de recadastramento dependem de um controle predominantemente manual.
A ausência de um sistema centralizado dificulta o acompanhamento da ocupação das residências em tempo real, a consulta ao histórico de convivência e a identificação de vagas ociosas que poderiam ser destinadas a discentes suplentes. Diante desse cenário, o projeto propõe a digitalização e integração desses processos em uma única plataforma web, tornando a gestão mais organizada, ágil e eficiente.
Objetivo Geral
Desenvolver uma plataforma web para apoiar a Pró-Reitoria de Assuntos Estudantis (PROAE) e as Coordenações de Assuntos Estudantis (COAEs) da UFERSA na gestão das moradias estudantis. A solução terá como foco o acompanhamento da permanência dos discentes, considerando o cumprimento das exigências acadêmicas, a gestão e alocação das vagas e o acompanhamento da convivência, contribuindo para garantir o cumprimento das normativas vigentes após o processo seletivo.
Perfil de usuário presentes

Gestor (Técnico-Administrativo - PROAE/COAE): Atua como administrador do sistema. É o responsável por alocar os discentes nos quartos, gerenciar as vagas, registrar ocorrências, abrir os períodos de recadastramento e atualizar o status das demandas recebidas. O sistema deve associar cada Gestor a um campus específico. Um Gestor comum (nível COAE) visualiza e administra apenas os moradores e vagas do seu próprio campus. Um Gestor com privilégio PROAE (nível central) visualiza e administra os dados de todos os campi.
Morador (Discente): Usuário com permissões restritas aos seus próprios dados. Acessa a plataforma para assinar eletronicamente o Termo de Compromisso, registrar necessidades de atendimento (abrir demandas) e preencher o formulário semestral de recadastramento. O discente suplente não possui acesso próprio ao sistema enquanto estiver na condição de suplência. Ele passa a existir como usuário do tipo Morador somente no momento em que o Gestor efetiva sua alocação em uma vaga livre (RF07), momento em que os dados cadastrais são criados e o fluxo de Termo de Compromisso é iniciado normalmente.
Informações que serão Armazenadas

Infraestrutura: Cadastro de Campi, Alas (Feminina/Masculina), Quartos, Camas e seus respectivos status de ocupação.
Dados Cadastrais e Documentos: Informações básicas do discente (nome, matrícula, curso) e o status do Termo de Compromisso assinado.
Compliance e Ocorrências: Histórico de cumprimento de regras acadêmicas do edital (quantidade de componentes matriculados, reprovação por média e falta).
Demandas e Recadastramento: Histórico de solicitações de atendimento abertas pelo discente e os registros de formulários de renovação da vaga preenchidos a cada semestre.

Requisitos Funcionais
RF
Prioridade
Descrição
RF01
Alta
Gestão de Infraestrutura e vagas: O sistema deve permitir o cadastro e o gerenciamento das unidades habitacionais, detalhando os Campi, Alas (Feminina/Masculina), Quartos, Camas e seus respectivos status de ocupação
RF02
Alta
Termo de Compromisso: O sistema deve permitir a alocação do discente convocado em uma vaga específica e disponibilizar o Termo de Compromisso para assinatura eletrônica do morador.
RF03
Alta
Gestão de Posse e Status Interno: O sistema deve permitir que a equipe gestora altere o status do morador para "Ativo" assim que ele tomar posse da vaga física e assinar o termo, iniciando a contagem do tempo de permanência.
RF04
Alta
Monitoramento Acadêmico: O sistema deve possuir um módulo onde o discente anexa seu histórico/comprovante semestral, permitindo ao gestor registrar o cumprimento da matrícula mínima (4 componentes) e o limite de reprovações.
RF05
Média
Gestão de Demandas e Atendimentos: O sistema deve permitir que os moradores registrem solicitações espontâneas de atendimento e que os gestores cadastrem demandas identificadas em visitas in loco, atualizando o status de resolução internamente.


RF06
Alta
Módulo de Recadastramento: O sistema deve permitir a abertura de campanhas semestrais de recadastramento, disponibilizando um formulário online para o morador confirmar o interesse na vaga e anexar documentação comprobatória, se necessário.
RF07
Alta
Gestão de Desligamento e Suplência: O sistema deve permitir o desligamento formal do discente (por abandono, término de curso ou descumprimento de regras) e facilitar a visualização de vagas livres para reatribuição a discentes suplentes"
RF08
Média
Dashboard Gerencial: O sistema deve apresentar um painel inicial com a taxa de ocupação das residências, o tempo médio de permanência e o número de vagas ociosas.
RF09
Baixa
Notificação de Desocupação Iminente: O sistema deve gerar uma notificação automática (visível no dashboard do gestor e, opcionalmente, por e-mail) quando uma vaga atingir o status de "desocupação iminente" calculado pela RN04, permitindo ação antecipada da gestão antes do desligamento efetivo.



Requisitos Não Funcionais
RNF
Tipo
Descrição
RNF01
Segurança
Controle de Acesso e JWT: O ecossistema possui o Spring Security para gerenciar logins, gerar tokens JWT e travar as rotas da API dependendo de quem está acessando. Matriz de permissões: o Gestor tem leitura e escrita sobre infraestrutura, vagas, ocorrências e recadastramento, além de acesso ao dashboard. O Morador tem acesso restrito ao próprio cadastro (assinar termos, abrir demandas e recadastramento). Toda rota da API valida o token JWT e o perfil contido nele antes de liberar o recurso.
RNF02
Usabilidade
Usabilidade e Responsividade: A interface do sistema, especialmente os módulos de assinatura de termos e recadastramento, deve ser projetada seguindo o padrão mobile-first garantindo fácil navegação em smartphones.
RNF03
Disponibilidade
Disponibilidade: O sistema deve garantir alta disponibilidade (24/7), permitindo que discentes abram demandas espontâneas a qualquer hora e dia da semana.
RNF04
Auditoria
Rastreabilidade (Logs): O sistema deve registrar um histórico (log) das ações críticas realizadas no banco de dados, como alocações, atualizações de status acadêmico e desligamentos de moradores.



Regras de Negócio
RN
Descrição
RN01
Validação de Matrícula Mínima: A renovação da vaga exige que o sistema registre a comprovação de que o discente está matriculado em, no mínimo, 4 (quatro) componentes curriculares no semestre vigente.
RN02
Trava de Rendimento Acadêmico: O sistema deve sinalizar para desligamento o discente que reprovar por falta em qualquer componente ou que reprovar por média em mais de 2 (dois) componentes curriculares no semestre.
RN03
Bloqueio de Trancamento: É terminantemente proibido o trancamento de matrícula no semestre vigente para os residentes. O registro dessa ação deve bloquear o recadastramento do aluno.
RN04
Prazo Máximo de Ocupação: O sistema deve calcular automaticamente a validade da vaga considerando o tempo regular do curso do discente acrescido de, no máximo, 2 (dois) períodos letivos, alterando o status da cama para desocupação iminente.
RN05
Incompatibilidade de Benefícios: O sistema deve alertar a gestão caso um residente ativo tente acumular a Moradia Estudantil com o Auxílio Transporte, o que é proibido. Nesta versão do sistema, essa informação é registrada manualmente pelo Gestor no cadastro do discente, não havendo integração automática com o sistema de assistência estudantil da UFERSA.
RN06
Obrigatoriedade do Recadastramento: O discente que não submeter o formulário no módulo de recadastramento dentro do prazo estipulado deverá ter seu status alterado para "Desligamento Pendente"

