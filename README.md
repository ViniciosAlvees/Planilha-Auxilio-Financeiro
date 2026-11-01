# Minhas Contas

Site de controle financeiro pessoal, com os arquivos principais na raiz do projeto.

## Funcionalidades

- Cadastro, edição e exclusão de contas com origem da dívida, instituição ou pessoa, valor, vencimento, forma de pagamento, categoria e observações.
- Campo de data com calendário nativo do navegador.
- Calendário mensal clicável com agenda e valores em aberto por dia.
- Resumo do mês com total, contas pagas, saldo em aberto e atrasos de todos os meses.
- Registro da data do pagamento e reabertura de contas.
- Contas mensais recorrentes, com ajuste de vencimentos para meses mais curtos.
- Busca, filtros e histórico preservado ao mudar de mês.
- Exportação e restauração de backup em JSON.
- Layout adaptável a computadores e celulares.

O mês acompanha a data atual automaticamente. As setas e o seletor permitem consultar outros meses. **Mês atual** retoma o acompanhamento automático. Marcar uma conta como paga registra a informação no site, sem realizar qualquer transação bancária.

## Dados e backup

Os registros ficam no localStorage do navegador e do endereço utilizado. Não há banco de dados remoto nem sincronização automática entre dispositivos. Limpar os dados do navegador pode remover os registros. Use **Backup** para guardar uma cópia ou transferi-la para outro navegador ou dispositivo.

Na conta recorrente, a edição altera somente o vencimento selecionado. Ao excluir, é possível remover apenas aquele vencimento ou encerrar a recorrência e remover os próximos vencimentos ainda não pagos. Pagamentos futuros já cadastrados são preservados ao encerrar uma recorrência.

## Executar localmente

É necessário Node.js 20 ou posterior. Não há dependências para instalar.

```sh
npm run dev
```

Abra http://127.0.0.1:4173.

## Verificação e publicação

```sh
npm test
npm run build
```

O build copia apenas os arquivos públicos do site para dist/. O servidor local não expõe backups, testes, arquivos internos ou metadados Git. A configuração de hospedagem fica em .openai/hosting.json.
