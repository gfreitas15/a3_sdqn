create table aluno (
   id       serial primary key,
   nome     varchar(255) not null,
   email    varchar(255) unique not null,
   telefone varchar(20)  not null,
   nivel    varchar(20)  not null check (nivel in ('BRANCO','CINZA','AZUL','AMARELO','LARANJA','VERMELHO','VERDE','ROXO','MARROM','PRETO'))
);

create table professor (
   id       serial primary key,
   nome     varchar(255) not null,
   email    varchar(255) unique not null,
   telefone varchar(20)  not null
);

create table aula (
   id           serial primary key,
   data_hora    timestamp    not null,
   localidade     varchar(255) not null,
   nivel        varchar(20)  not null check (nivel in ('BRANCO','CINZA','AZUL','AMARELO','LARANJA','VERMELHO','VERDE','ROXO','MARROM','PRETO')),
   vagas        int          not null check (vagas > 0),
   professor_id int          not null references professor(id)
);

create table inscricao (
   aluno_id       int not null references aluno(id) on delete cascade,
   aula_id        int not null references aula(id)  on delete cascade,
   data_inscricao timestamp not null default now(),
   primary key (aluno_id, aula_id)
);