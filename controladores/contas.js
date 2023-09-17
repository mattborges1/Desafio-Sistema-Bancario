const express = require('express');
const app = express();
const { banco } = require('../bancodedados');
let { contas, idConta, saques, transferencias, depositos } = require('../bancodedados');

//lista contas cadastradas
const listarContas = (req, res) => {
    if (req.query.senha_banco === banco.senha) {
        return res.status(200).json(contas);
    } else {
        return res.status(401).json({ mensagem: 'Senha incorreta.' })
    }
}

//Cadastra uma nova conta.
function cadastrarConta(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const conta = {
        numero: (idConta++).toString(),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    contas.push(conta);

    return res.status(201).json(conta);
}

//Atualiza os dados do usuário.
function atualizarDadosUsuario(req, res) {

    const { numeroConta } = req.params;

    const conta = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    conta.usuario.nome = nome;
    conta.usuario.cpf = cpf;
    conta.usuario.data_nascimento = data_nascimento;
    conta.usuario.telefone = telefone;
    conta.usuario.email = email;
    conta.usuario.senha = senha;
    return res.status(200).json({ mensagem: 'Conta atualizada com sucesso.' });

}

//Deleta uma conta
function deletarConta(req, res) {
    const { numeroConta } = req.params;

    const contaProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!contaProcurada) {
        return res.status(404).json({ mensagem: 'Conta não encotrada.' });
    }

    contas = contas.filter((conta) => {
        return conta.numero !== numeroConta;
    });

    return res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
}
//Efetua um depósito.
function depositar(req, res) {
    const { numeroConta, valor } = req.body;

    verificaNumeroDaContaEmBranco(req, res);
    verificaValorEmBranco(req, res);

    const contaProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!contaProcurada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }
    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor do depósito é inválido.' });
    }

    contaProcurada.saldo += valor;
    registroDeDeposito(req, res);
    return res.status(200).json({ mensagem: 'Depósito realizado com sucesso' });
}

//Realiza um saque.
function sacar(req, res) {
    const { numeroConta, valor, senha } = req.body;

    verificaNumeroDaContaEmBranco(req, res);
    verificaValorEmBranco(req, res);
    verificaSenhaEmBranco(req, res);

    const contaProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!contaProcurada) {
        return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha === contaProcurada.usuario.senha) {
        if (valor <= 0) {
            return res.status(400).json({ mensagem: 'O valor do depósito é inválido.' });
        }

        if (contaProcurada.saldo >= valor) {
            contaProcurada.saldo -= valor;
            registroDeSaque(req, res);
            return res.status(200).json({ mensagem: 'Saque realizado com sucesso.' });
        } else {
            return res.status(400).json({ mensagem: 'Saque não realizado. O saldo é insuficiente.' });
        }

    } else {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }
}

//Realiza uma transferência
function transferir(req, res) {
    const { numeroContaOrigem, senha, valor, numeroContaDestino } = req.body;

    verificaContaDeOrigemEmBranco(req, res);
    verificaSenhaEmBranco(req, res);
    verificaValorEmBranco(req, res);
    verificaContaDeDestinoEmBranco(req, res);

    const contaOrigemProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroContaOrigem;
    });

    if (!contaOrigemProcurada) {
        return res.status(404).json({ mensagem: 'Conta de origem não encontrada.' });
    }

    const contaDestinoProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroContaDestino;
    });

    if (!contaDestinoProcurada) {
        return res.status(404).json({ mensagem: 'Conta de destino não encontrada.' });
    }

    if (contaOrigemProcurada === contaDestinoProcurada) {
        return res.status(400).json({ mensagem: 'Erro. A conta de origem é a mesma que a de destino. Verifique os dados informados e tente novamente.' })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor do depósito é inválido.' });
    }

    if (senha === contaOrigemProcurada.usuario.senha) {
        if (contaOrigemProcurada.saldo >= valor) {
            contaOrigemProcurada.saldo -= valor;
            contaDestinoProcurada.saldo += valor;
            registroDeTransferencia(req, res);
            return res.status(200).json({ mensagem: 'Transferência realizada com sucesso.' })
        } else {
            return res.status(401).json({ mensagem: 'Transferência não realizada. O saldo é insuficiente.' })
        }
    } else {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }
}

function saldo(req, res) {
    const { numeroConta, senha } = req.query;
    verificaQueryNumeroConta(req, res);
    verificaQuerySenha(req, res);

    const contaProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!contaProcurada) {
        return res.status(404).json({ mensagem: 'Conta não encotrada.' });
    }

    if (senha === contaProcurada.usuario.senha) {
        return res.status(200).json({ Saldo: contaProcurada.saldo });
    } else {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }
}

function extrato(req, res) {
    const { numeroConta, senha } = req.query;
    verificaQueryNumeroConta(req, res);
    verificaQuerySenha(req, res);

    const contaProcurada = contas.find((contaCadastrada) => {
        return contaCadastrada.numero === numeroConta;
    });

    if (!contaProcurada) {
        return res.status(404).json({ mensagem: 'Conta não encotrada.' });
    }

    if (senha === contaProcurada.usuario.senha) {
        const historicoDeSaques = saques.filter((listaDeSaques) => {
            return listaDeSaques.numero_conta === numeroConta;
        });
        const historicoDeDepositos = depositos.filter((listaDeDepositos) => {
            return listaDeDepositos.numero_conta === numeroConta;
        });
        const historicoDeTransferenciasRecebidas = transferencias.filter((listaDeTransferencias) => {
            return listaDeTransferencias.numero_conta_destino === numeroConta;
        });
        const historicoDeTransferenciasEnviadas = transferencias.filter((listaDeTransferencias) => {
            return listaDeTransferencias.numero_conta_origem === numeroConta;
        });

        return res.status(200).json([{ saques: historicoDeSaques }, { depositos: historicoDeDepositos }, { transferenciasEnviadas: historicoDeTransferenciasEnviadas }, { transferenciasRecebidas: historicoDeTransferenciasRecebidas }]);

    } else {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
    }
}


//Verificador de duplicidade em dados únicos.
function verificadorDadosRepetidos(req, res, next) {
    const verificaCpf = contas.find((cpfCadastrado) => {
        return cpfCadastrado.usuario.cpf === req.body.cpf;
    });
    if (verificaCpf) {
        return res.status(400).json({ mensagem: "O CPF informado já está cadastrado." })
    }

    const verificaEmail = contas.find((emailCadastrado) => {
        return emailCadastrado.usuario.email === req.body.email;
    });
    if (verificaEmail) {
        return res.status(400).json({ mensagem: "O e-mail informado já está cadastrado." })
    }
    next();
}

//Verificador de campos em branco para novo cadastro ou atualização de cadastro.
function verificadorDeDadosObrigatorios(req, res, next) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome é obrigatório.' })
    }

    if (!cpf) {
        return res.status(400).json({ mensagem: 'O CPF é obrigatório.' })
    }

    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento é obrigatória.' });
    };

    if (!telefone) {
        return res.status(400).json({ mensagem: 'O telefone é obrigatório.' })
    };

    if (!email) {
        return res.status(400).json({ mensagem: 'O e-mail é obrigatório.' })
    };

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória.' })
    };
    next();
}


function registroDeSaque(req, res) {
    const { numeroConta, valor } = req.body;
    saques.push({
        data: new Date(),
        numero_conta: numeroConta,
        valor: valor
    });
}

function registroDeDeposito(req, res) {
    const { numeroConta, valor } = req.body;
    depositos.push({
        data: new Date(),
        numero_conta: numeroConta,
        valor: valor
    });
}

function registroDeTransferencia(req, res) {
    const { numeroContaOrigem, valor, numeroContaDestino } = req.body;
    transferencias.push({
        data: new Date(),
        numero_conta_origem: numeroContaOrigem,
        numero_conta_destino: numeroContaDestino,
        valor: valor
    });
}


//Verificadores de campos em branco.

function verificaQueryNumeroConta(req, res) {
    const { numeroConta } = req.query;

    if (!numeroConta) {
        return res.status(400).json({ mensagem: 'Informe o número da conta.' });
    }
}

function verificaContaDeOrigemEmBranco(req, res) {
    const { numeroContaOrigem } = req.body;

    if (!numeroContaOrigem) {
        return res.status(400).json({ mensagem: 'Informe o número da conta de origem.' });
    }
}

function verificaContaDeDestinoEmBranco(req, res) {
    const { numeroContaDestino } = req.body;

    if (!numeroContaDestino) {
        return res.status(400).json({ mensagem: 'Informe o número da conta de destino.' });
    }
}

function verificaEmailEmBranco(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem: 'O e-mail é obrigatório.' })
    };
}

function verificaTelefoneEmBranco(req, res) {
    const { telefone } = req.body;

    if (!telefone) {
        return res.status(400).json({ mensagem: 'O telefone é obrigatório.' })
    };
}

function verificaDataDeNascimentoEmBranco(req, res) {
    const { data_nascimento } = req.body;

    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento é obrigatória.' });
    };
}

function verificaCpfEmBranco(req, res) {
    const { cpf } = req.body;

    if (!cpf) {
        return res.status(400).json({ mensagem: 'O CPF é obrigatório.' })
    }
}

function verificaNomeEmBranco(req, res) {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome é obrigatório.' })
    }
}

function verificaNumeroDaContaEmBranco(req, res) {
    const { numeroConta } = req.body;

    if (!numeroConta) {
        return res.status(400).json({ mensagem: 'Informe o número da conta.' });
    }
}

function verificaValorEmBranco(req, res) {
    const { valor } = req.body;

    if (!valor) {
        return res.status(400).json({ mensagem: 'Informe o valor a ser depositado.' });
    }
}

function verificaQuerySenha(req, res) {
    const { senha } = req.query;

    if (!senha) {
        return res.status(400).json({ mensagem: 'Informe a sua senha.' });
    }
}

function verificaSenhaEmBranco(req, res) {
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).json({ mensagem: 'Informe a sua senha.' });
    }
}

module.exports = {
    listarContas,
    cadastrarConta,
    verificadorDeDadosObrigatorios,
    verificadorDadosRepetidos,
    atualizarDadosUsuario,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}