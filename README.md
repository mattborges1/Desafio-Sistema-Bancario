
# Desafio - API Sistema Bancário

Esta é uma API simples para gerenciar contas bancárias. Ela permite listar contas, cadastrar novas contas, atualizar informações de conta, excluir contas, realizar depósitos, saques, transferências, verificar o saldo e obter o extrato de uma conta.

## Tecnologias utilizadas

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

## Rotas da API



#### Lista todas as contas cadastradas no banco de dados.

```http
  POST /contas
```

Modelo de requisição:
```json
  {
    "numero": "1",
    "saldo": 1000.00,
    "usuario": {
      "nome": "Exemplo Nome",
      "cpf": "123.456.789-01",
      "data_nascimento": "1990-01-01",
      "telefone": "(12) 3456-7890",
      "email": "exemplo@email.com",
      "senha": "senha123"
    }
  }
```

#### Listar Contas

```http
  GET /contas
```

Modelo de requisição:
```http
  /contas?senha_banco=12345
```

#### Atualizar dados da conta

```http
  PUT /contas/:numeroConta
```

Modelo de requisição:
```json
{
	"nome": "Otávio",
	"cpf": "2123123",
	"data_nascimento": "03-10-1957",
	"telefone": "asass",
	"email": "asASasa",
	"senha": "asasdsa"
}
```

#### Excluir conta

```http
  DELETE /contas/:numeroConta
```

#### Realizar depósito

```http
  POST /depositos
```

Modelo de requisição:
```json
{
	"numeroConta": "2",
	"valor" : 1000
}
```

#### Realizar saque

```http
  POST /saques
```

Modelo de requisição:
```json
{
	"numeroConta": "2",
	"valor" : 200,
	"senha": "asasdsa"
}
```

#### Realizar transferência

```http
POST /transferencias
```

Modelo de requisição:
```json
{
	"numeroContaOrigem": "",
	"senha": "12345",
	"valor" : 200,
	"numeroContaDestino": "1"
}
```

#### Verificar saldo da conta

```http
  GET /saldo
```

Modelo de requisição:
```http
  /contas/saldo?numeroConta=1&senha=1234
```

#### Verificar extrato da conta

```http
  GET /extrato
```

Modelo de requisição:
```http
  contas/saldo?numeroConta=1&senha=1234
```

#### Middlewares

A API utiliza vários middlewares para validar dados, verificar autenticação e evitar duplicação de informações.

#### Considerações finais

Esta é uma API de exemplo simples e não deve ser usada em produção sem as devidas melhorias de segurança e escalabilidade. Certifique-se de adequar a API às suas necessidades e requisitos de segurança antes de implantá-la em um ambiente de produção.
