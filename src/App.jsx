import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ArrowUpRight, ArrowRight, Check, ChevronDown, Clock3, Menu, ShieldCheck, X, MessageCircle, LockKeyhole } from 'lucide-react';
import './App.css';

const TELEGRAM = 'https://t.me/cashers_manager_1';
const CURRENCIES = [
  {code:'USD',name:'Доллар США',sign:'$',category:'Фиат'},
  {code:'EUR',name:'Евро',sign:'€',category:'Фиат'},
  {code:'RUB',name:'Российский рубль',sign:'₽',category:'Фиат'},
  {code:'CNY',name:'Китайский юань',sign:'¥',category:'Фиат'},
  {code:'KZT',name:'Казахстанский тенге',sign:'₸',category:'Фиат'},
  {code:'USDT',name:'Tether',sign:'₮',category:'Крипто'},
  {code:'BTC',name:'Bitcoin',sign:'₿',category:'Крипто'},
  {code:'ETH',name:'Ethereum',sign:'Ξ',category:'Крипто'}
];
const INITIAL_RATES = {USD:1,EUR:0.92,RUB:92.5,CNY:7.25,KZT:470,USDT:1,BTC:0.0000122,ETH:0.00032};
const CRYPTO = new Set(['USDT','BTC','ETH']);
const getSpread = (from,to) => CRYPTO.has(from) && !CRYPTO.has(to) ? 1.025 : !CRYPTO.has(from) && CRYPTO.has(to) ? 0.97 : 1;
const format = (amount,currency) => new Intl.NumberFormat('ru-RU', {minimumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 0 : 2,maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 8 : 2}).format(amount);

function CurrencySelect({value, onChange, label}) {
  const current = CURRENCIES.find(c => c.code === value);
  return <div className="currency-select"><span className="currency-symbol">{current.sign}</span><select value={value} onChange={e=>onChange(e.target.value)} aria-label={label}>{CURRENCIES.map(c=><option value={c.code} key={c.code}>{c.code} — {c.name}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></div>;
}

export default function App(){
  const [from,setFrom] = useState('USD');
  const [to,setTo] = useState('USDT');
  const [amount,setAmount] = useState('1000');
  const [rates,setRates] = useState(INITIAL_RATES);
  const [rateStatus,setRateStatus] = useState('Справочные котировки');
  const [menuOpen,setMenuOpen] = useState(false);
  useEffect(()=>{
    const controller = new AbortController();
    fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',{signal:controller.signal})
      .then(res => {if(!res.ok) throw new Error('fetch failed'); return res.json()})
      .then(data=>{const fx=data?.usd;if(!fx)throw new Error('missing rates');setRates(prev=>({...prev,...Object.fromEntries([['EUR','eur'],['RUB','rub'],['CNY','cny'],['KZT','kzt']].map(([code,key])=>[code,Number(fx[key])||prev[code]]))}));setRateStatus('Фиат обновлён · крипто справочно')})
      .catch(err=>{if(err.name!=='AbortError')setRateStatus('Справочные котировки')});
    return ()=>controller.abort();
  },[]);
  const number=Number(amount.replace(',','.'));
  const valid=amount.trim()!=='' && Number.isFinite(number) && number>0;
  const result=useMemo(()=>valid?number/rates[from]*rates[to]*getSpread(from,to):0,[valid,number,rates,from,to]);
  const single=rates[to]/rates[from]*getSpread(from,to);
  const swap=()=>{setFrom(to);setTo(from)};
  const msg=`Здравствуйте! Интересует обмен ${valid?amount:'—'} ${from} на ${to}. Ориентировочная сумма: ${valid?format(result,to):'—'} ${to}. Подскажите актуальный курс и условия.`;
  const telegramLink=`${TELEGRAM}?text=${encodeURIComponent(msg)}`;
  return <div className="site" id="top">
    <header className="header"><div className="shell header-inner">
      <a href="#top" className="logo" aria-label="BURO PAY — главная"><span className="logo-icon">B<span className="logo-dot">.</span></span><span className="logo-words">BURO<span>PAY</span></span></a>
      <nav className={menuOpen?'nav nav-open':'nav'} aria-label="Навигация"><a href="#exchange" onClick={()=>setMenuOpen(false)}>Обмен</a><a href="#about" onClick={()=>setMenuOpen(false)}>О сервисе</a><a href="#steps" onClick={()=>setMenuOpen(false)}>Как это работает</a></nav>
      <a className="header-link" href={TELEGRAM} target="_blank" rel="noopener noreferrer">Написать менеджеру <ArrowUpRight size={17}/></a>
      <button className="menu-toggle" aria-label={menuOpen?'Закрыть меню':'Открыть меню'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button>
    </div></header>

    <main>
      <section className="hero"><div className="shell hero-layout">
        <div className="hero-left">
          <div className="eyebrow"><span className="orange-bar"/> ФИНАНСОВЫЕ РЕШЕНИЯ / 24.7</div>
          <h1>Обмен<br/><em>без лишнего.</em></h1>
          <p className="hero-intro">Криптовалюта и наличные средства. Чёткий процесс, персональное сопровождение и понятные условия каждой операции.</p>
          <a className="text-link" href="#exchange">Рассчитать обмен <ArrowRight size={20}/></a>
          <div className="hero-mark"><span>BP<span className="mark-period">.</span></span><small>BURO PAY<br/>PRIVATE EXCHANGE</small></div>
        </div>
        <div className="hero-right" id="exchange">
          <div className="calculator">
            <div className="calc-title-row"><div><span className="mini-label">01 / EXCHANGE</span><h2>Калькулятор</h2></div><span className="calc-live"><span/>Предварительно</span></div>
            <p className="calc-sub">Выберите валютную пару и укажите сумму</p>
            <div className="amount-label">Вы отдаёте</div>
            <div className="amount-box"><input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" aria-label="Сумма обмена" placeholder="0.00"/><CurrencySelect value={from} onChange={setFrom} label="Валюта, которую отдаёте"/></div>
            <div className="swap-wrap"><div className="swap-rule"/><button type="button" className="swap" onClick={swap} aria-label="Поменять валюты местами"><ArrowDownUp size={19}/></button><div className="swap-rule"/></div>
            <div className="amount-label">Вы получаете</div>
            <div className="amount-box output-box"><output aria-live="polite">{valid?format(result,to):'0,00'}</output><CurrencySelect value={to} onChange={setTo} label="Валюта, которую получаете"/></div>
            <div className="rate-info"><div><span>Расчётный курс</span><strong>1 {from} ≈ {format(single,to)} {to}</strong></div><div><span>Котировки</span><span className="rate-status">{rateStatus}</span></div></div>
            <a className="apply-button" target="_blank" rel="noopener noreferrer" href={telegramLink}>Уточнить курс в Telegram <ArrowUpRight size={20}/></a>
            <p className="calc-footnote">Расчёт ориентировочный, не является офертой. Криптовалютные курсы — демонстрационные; актуальные условия подтверждает менеджер.</p>
          </div>
        </div>
      </div></section>

      <section className="ticker"><div className="shell ticker-inner"><span>BURO PAY / PRIVATE EXCHANGE</span><span className="ticker-plus">✳</span><span>ИНДИВИДУАЛЬНЫЕ УСЛОВИЯ</span><span className="ticker-plus">✳</span><span>ПОДДЕРЖКА 24/7</span></div></section>

      <section className="about" id="about"><div className="shell"><div className="section-kicker">02 / НАШ ПОДХОД</div><div className="about-header"><h2>Серьёзный подход<br/>к каждой операции<span>.</span></h2><p>Мы сделали процесс обращения максимально простым: расчёт, согласование условий и связь с менеджером в одном месте.</p></div><div className="principles"><article><span className="num">01</span><ShieldCheck size={28}/><h3>Понятные условия</h3><p>Параметры обмена согласовываются заранее, до проведения операции.</p></article><article><span className="num">02</span><Clock3 size={28}/><h3>Связь без ожидания</h3><p>Уточните доступность направления и детали в удобном канале связи.</p></article><article><span className="num">03</span><LockKeyhole size={28}/><h3>Персональный диалог</h3><p>Обсуждайте нюансы операции напрямую с менеджером.</p></article></div></div></section>

      <section className="steps" id="steps"><div className="shell steps-layout"><div><div className="section-kicker light">03 / ПРОЦЕСС</div><h2>Три шага.<br/><em>Один результат.</em></h2><a className="steps-link" href={TELEGRAM} target="_blank" rel="noopener noreferrer">Обсудить обмен <ArrowUpRight size={19}/></a></div><div className="steps-list"><div><b>01</b><span>Выберите направление и сумму</span><Check size={20}/></div><div><b>02</b><span>Запросите актуальные условия</span><Check size={20}/></div><div><b>03</b><span>Согласуйте детали с менеджером</span><Check size={20}/></div></div></div></section>

      <section className="contact"><div className="shell contact-inner"><div><span className="section-kicker">04 / НА СВЯЗИ</span><h2>Есть вопросы по обмену?</h2><p>Напишите менеджеру — обсудим направление, сумму и доступные условия.</p></div><a href={TELEGRAM} target="_blank" rel="noopener noreferrer">Перейти в Telegram <ArrowUpRight size={20}/></a></div></section>
    </main>
    <footer className="footer"><div className="shell footer-inner"><span className="footer-brand">BURO<span>PAY</span><b>.</b></span><span>© {new Date().getFullYear()} BURO PAY</span><span>Информация не является публичной офертой.</span></div></footer>
  </div>;
}
