# Planilha de controle financeiro

A planilha [Controle Financeiro.xlsx](<Controle Financeiro.xlsx>) fica na raiz do projeto e foi verificada no Microsoft Excel.

## Registrar as contas

Na aba **Contas**, preencha uma linha para cada vencimento:

- Data de vencimento.
- Descrição ou origem da dívida.
- Nome da instituição ou pessoa que receberá o pagamento.
- Valor a pagar.
- Forma de pagamento, escolhida na lista.

Os campos amarelos são editáveis. Digite datas no formato **dd/mm/aaaa**. Ao quitar o valor integral, preencha **Pago em**. A coluna **Situação** indica automaticamente contas pagas, atrasadas, com vencimento hoje ou a pagar. Campos obrigatórios incompletos também são sinalizados.

Para parcelas e contas recorrentes, registre uma linha para cada vencimento. Preserve as linhas antigas para manter o histórico. A tabela já tem 1.000 linhas preparadas e acompanha novas linhas inseridas na própria tabela do Excel.

## Consultar o mês e o calendário

Na aba **Painel**, o mês acompanha a data atual quando **D5** está vazia. Para consultar outro mês, digite em D5 uma data desse mês. Apagar essa data restaura a seleção automática.

O painel mostra o total das contas que vencem no mês, o valor pago dessas contas, o saldo em aberto e o total geral em atraso. O calendário mostra o saldo em aberto e a quantidade de contas em cada dia.

Digite uma data em **F5** para consultar a agenda detalhada daquele dia. Com F5 vazia, a agenda mostra hoje no mês atual, ou o primeiro dia do mês consultado. A agenda exibe até 50 contas por dia. Para consultar mais contas na mesma data, use o filtro **Vencimento** na aba Contas.
