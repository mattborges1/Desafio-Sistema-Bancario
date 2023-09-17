const express = require('express');
const rotas = express();
const contas = require('./controladores/contas');

rotas.get('/', (req, res) => {
    res.send('Servidor OK')
});

rotas.use(contas.verificadorDadosRepetidos);
rotas.get('/contas', contas.listarContas);
rotas.post('/contas', contas.verificadorDeDadosObrigatorios, contas.cadastrarConta);
rotas.put('/contas/:numeroConta/usuario', contas.verificadorDeDadosObrigatorios, contas.atualizarDadosUsuario);
rotas.delete('/contas/:numeroConta', contas.deletarConta);
rotas.post('/transacoes/depositar', contas.depositar);
rotas.post('/transacoes/sacar', contas.sacar);
rotas.post('/transacoes/transferir', contas.transferir);
rotas.get('/contas/saldo', contas.saldo);
rotas.get('/contas/extrato', contas.extrato);

module.exports = rotas;