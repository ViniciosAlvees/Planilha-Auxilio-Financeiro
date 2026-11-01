(function (root) {
  'use strict';
  const METHODS = ['Pix','Boleto','Cartão de crédito','Cartão de débito','Transferência','Débito automático','Dinheiro','Outro'];
  const CATEGORIES = ['Outros','Moradia','Alimentação','Transporte','Saúde','Educação','Lazer','Compras','Empréstimos','Serviços'];
  const pad = n => String(n).padStart(2,'0');
  function dateString(date=new Date()) { return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
  function validDate(value) { if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false; const [y,m,d]=value.split('-').map(Number);return y>=2000&&y<=2100&&dateString(new Date(y,m-1,d,12))===value; }
  function monthKey(value) { return value.slice(0,7); }
  function addMonth(month,delta) { const [y,m]=month.split('-').map(Number);const d=new Date(y,m-1+delta,1,12);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; }
  function dueInMonth(month,day) { const [y,m]=month.split('-').map(Number);return `${month}-${pad(Math.min(day,new Date(y,m,0,12).getDate()))}`; }
  function previousDay(day) { const [y,m,d]=day.split('-').map(Number);return dateString(new Date(y,m-1,d-1,12)); }
  function uid() { return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  function emptyState() { return {version:1,accounts:[],recurring:[]}; }
  function normalizeAccount(value) {
    if(!value||typeof value!=='object'||typeof value.id!=='string'||!value.id||value.id.length>150)throw new Error('Uma conta tem identificação inválida.');
    for(const key of ['description','creditor'])if(typeof value[key]!=='string'||!value[key].trim()||value[key].length>120)throw new Error('Preencha a descrição e a instituição ou pessoa.');
    if(!Number.isSafeInteger(value.amountCents)||value.amountCents<1||value.amountCents>99999999900)throw new Error('Informe um valor maior que zero.');
    if(!validDate(value.dueDate))throw new Error('Informe uma data de vencimento válida.');
    if(value.paidDate&&!validDate(value.paidDate))throw new Error('A data do pagamento é inválida.');
    if(!METHODS.includes(value.paymentMethod))throw new Error('Escolha uma forma de pagamento válida.');
    if(value.recurrenceId&&typeof value.recurrenceId!=='string')throw new Error('Recorrência inválida.');
    if(value.recurrenceMonth&&!validDate(`${value.recurrenceMonth}-01`))throw new Error('Mês da recorrência inválido.');
    return {id:value.id,description:value.description.trim(),creditor:value.creditor.trim(),amountCents:value.amountCents,dueDate:value.dueDate,paymentMethod:value.paymentMethod,category:CATEGORIES.includes(value.category)?value.category:'Outros',paidDate:value.paidDate||null,notes:typeof value.notes==='string'?value.notes.slice(0,500):'',...(value.recurrenceId?{recurrenceId:value.recurrenceId,recurrenceMonth:value.recurrenceMonth||monthKey(value.dueDate)}:{})};
  }
  function validateState(input) {
    if(!input||input.version!==1||!Array.isArray(input.accounts)||!Array.isArray(input.recurring)||input.accounts.length>30000||input.recurring.length>500)throw new Error('Este arquivo não é um backup válido do Minhas Contas.');
    const accounts=input.accounts.map(normalizeAccount),ids=new Set();
    for(const a of accounts) { if(ids.has(a.id))throw new Error('O backup contém contas duplicadas.');ids.add(a.id); }
    const ruleIds=new Set();
    const recurring=input.recurring.map(rule=>{ const base=normalizeAccount({...rule,dueDate:rule.startDate,paidDate:null});if(ruleIds.has(base.id))throw new Error('O backup contém recorrências duplicadas.');ruleIds.add(base.id);if(rule.endDate&&!validDate(rule.endDate))throw new Error('Recorrência com data final inválida.');if(!Array.isArray(rule.skipMonths)||!rule.skipMonths.every(m=>typeof m==='string'&&/^\d{4}-\d{2}$/.test(m)&&validDate(`${m}-01`)))throw new Error('Recorrência com vencimentos inválidos.');return {...base,startDate:rule.startDate,endDate:rule.endDate||null,skipMonths:[...new Set(rule.skipMonths)]}; });
    for(const a of accounts)if(a.recurrenceId&&!ruleIds.has(a.recurrenceId))throw new Error('O backup está sem uma recorrência vinculada.');
    return {version:1,accounts,recurring};
  }
  function ensureRecurring(state,throughMonth) {
    let changed=false;const occurrences=new Set(state.accounts.filter(a=>a.recurrenceId).map(a=>`${a.recurrenceId}:${a.recurrenceMonth||monthKey(a.dueDate)}`));
    for(const rule of state.recurring) { const start=monthKey(rule.startDate),end=rule.endDate?monthKey(rule.endDate):throughMonth;const last=end<throughMonth?end:throughMonth;for(let month=start;month<=last&&month<='2100-12';month=addMonth(month,1)){const due=dueInMonth(month,Number(rule.startDate.slice(8,10)));const key=`${rule.id}:${month}`;if(due<rule.startDate||(rule.endDate&&due>rule.endDate)||rule.skipMonths.includes(month)||occurrences.has(key))continue;state.accounts.push(normalizeAccount({...rule,id:`${rule.id}:${month}`,dueDate:due,paidDate:null,recurrenceId:rule.id,recurrenceMonth:month}));occurrences.add(key);changed=true;}}
    return changed;
  }
  function addAccount(state,account,repeats=false,throughMonth=monthKey(dateString())) {
    const item=normalizeAccount(account);state.accounts.push(item);
    if(repeats) {const rule={...item,id:uid(),paidDate:null,startDate:item.dueDate,endDate:null,skipMonths:[]};delete rule.recurrenceId;state.recurring.push(rule);item.recurrenceId=rule.id;item.recurrenceMonth=monthKey(item.dueDate);const start=monthKey(item.dueDate);ensureRecurring(state,start>throughMonth?start:throughMonth);}
    return item;
  }
  function deleteAccount(state,id,stopRecurring=false) {
    const item=state.accounts.find(a=>a.id===id);if(!item)return;
    const rule=state.recurring.find(r=>r.id===item.recurrenceId);
    if(rule){const month=item.recurrenceMonth||monthKey(item.dueDate);if(!rule.skipMonths.includes(month))rule.skipMonths.push(month);if(stopRecurring){rule.endDate=previousDay(dueInMonth(month,Number(rule.startDate.slice(8,10))));if(rule.endDate<'2000-01-01')rule.endDate='2000-01-01';}}
    state.accounts=state.accounts.filter(a=>a.id!==id&&!(stopRecurring&&item.recurrenceId&&a.recurrenceId===item.recurrenceId&&(a.recurrenceMonth||monthKey(a.dueDate))>=(item.recurrenceMonth||monthKey(item.dueDate))&&!a.paidDate));
  }
  function status(account,today=dateString()) { return account.paidDate?'paid':account.dueDate<today?'overdue':account.dueDate===today?'today':'open'; }
  function summarize(accounts,month,today=dateString()) { const items=accounts.filter(a=>monthKey(a.dueDate)===month);const sum=list=>list.reduce((n,a)=>n+a.amountCents,0);const paid=items.filter(a=>a.paidDate),open=items.filter(a=>!a.paidDate),overdue=accounts.filter(a=>status(a,today)==='overdue');return {items,total:sum(items),paid:sum(paid),open:sum(open),overdue:sum(overdue),paidCount:paid.length,openCount:open.length,overdueCount:overdue.length}; }
  const api={METHODS,CATEGORIES,dateString,validDate,monthKey,addMonth,dueInMonth,previousDay,uid,emptyState,normalizeAccount,validateState,ensureRecurring,addAccount,deleteAccount,status,summarize};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FinanceCore=api;
})(globalThis);
