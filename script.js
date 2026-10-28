'use strict';
/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r2=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
const P={home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',fork:'M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10',bill:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',box:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',chart:'M5 21V11M12 21V4M19 21v-7',gear:'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2-1-2-4-2 1-2-1-1-2h-4l-1 2-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z',cart:'M3 4h2l2 12h11l2-8H6M9 20h.01M17 20h.01',trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',plus:'M12 5v14M5 12h14',minus:'M5 12h14',pencil:'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',warn:'M12 3l10 18H2zM12 10v5M12 18v.1',check:'M5 12l5 5 9-10',x:'M6 6l12 12M18 6L6 18',print:'M7 9V3h10v6M6 17H4v-7h16v7h-2M7 14h10v7H7z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z',user:'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4 4-6 8-6s8 2 8 6',bell:'M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4',up:'M12 19V5M5 12l7-7 7 7',down:'M12 5v14M5 12l7 7 7-7',cup:'M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 5h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4',menu:'M4 6h16M4 12h16M4 18h16',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>`;
const K={menu:'bt_menu',ing:'bt_ingredients',rec:'bt_recipes',orders:'bt_orders',moves:'bt_stock_moves',set:'bt_settings'};
const CATS=['Hot Beverages','Cold Beverages','Snacks','Desserts'],UNITS=['g','ml','pcs','slices'],ICATS=['Beverage','Bakery','Food','Dairy'],STATUS=['Pending','Preparing','Completed'];
const S={menu:[],ing:[],rec:{},orders:[],moves:[],set:{}};
const ui={view:'dashboard',cart:[],cat:'All',q:'',step:{},mq:'',mcat:'All',iq:'',hq:'',hd:'',hs:'',dsr:'today',dpop:'today',from:'',to:'',busy:false,ok:null};
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const save=k=>{try{localStorage.setItem(K[k],JSON.stringify(S[k]))}catch(e){toast('Could not save data (storage full or blocked).','err')}};
const dk=d=>{d=new Date(d);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fdt=t=>new Date(t).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const ftm=t=>new Date(t).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
const money=n=>S.set.cur+r2(n).toFixed(2);
const fq=i=>`${+Number(i.qty).toFixed(2)} ${i.unit}`;
const st=i=>i.qty<=0?'out':i.qty<=i.min?'low':'ok';
const STL={ok:'In Stock',low:'Low Stock',out:'Out of Stock'};
const ing=id=>S.ing.find(i=>i.id===id),mi=id=>S.menu.find(m=>m.id===id);
const pill=(c,t)=>`<span class="pill p-${c}">${esc(t)}</span>`;
const empty=t=>`<div class="empty">${esc(t)}</div>`;
const sumT=a=>r2(a.reduce((s,o)=>s+o.total,0));
const completed=()=>S.orders.filter(o=>o.status==='Completed');
function toast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;$('#toasts').append(t);setTimeout(()=>t.remove(),type==='err'?6000:3500)}
function modal(title,html,ok,okText='Save'){$('#mTitle').textContent=title;$('#mBody').innerHTML=html;$('#mErr').textContent='';const b=$('#mOk');b.textContent=okText;b.style.display=ok?'':'none';ui.ok=ok;$('#modal').hidden=false}
const closeModal=()=>{$('#modal').hidden=true;ui.ok=null};
const numOk=v=>v!==''&&isFinite(Number(v));

/* ---------- storage & seed ---------- */
function seed(){
  const I=(name,cat,qty,unit,min,icon)=>({id:uid('i'),name,cat,qty,unit,min,icon});
  const ings=[I('Milk','Dairy',8000,'ml',2000,'🥛'),I('Coffee Powder','Beverage',1200,'g',500,'☕'),I('Sugar','Beverage',300,'g',500,'🍚'),I('Tea Leaves','Beverage',800,'g',300,'🍃'),I('Cocoa Powder','Beverage',150,'g',200,'🍫'),I('Bread','Bakery',60,'slices',20,'🍞'),I('Paneer','Food',1000,'g',500,'🧀'),I('Tomato','Food',800,'g',300,'🍅'),I('Lettuce','Food',0,'g',200,'🥬'),I('Cheese','Dairy',300,'g',500,'🧀'),I('Chocolate Chips','Bakery',50,'g',100,'🍫'),I('Butter','Dairy',0,'g',250,'🧈'),I('Flour','Bakery',2000,'g',1000,'🌾'),I('Potatoes','Food',5000,'g',1000,'🥔'),I('Tortilla','Bakery',30,'pcs',10,'🌯'),I('Lemon','Food',20,'pcs',5,'🍋'),I('Eggs','Food',24,'pcs',12,'🥚'),I('Cream','Dairy',1000,'ml',300,'🍦')];
  const g=n=>ings.find(i=>i.name===n).id,menu=[],rec={};
  const M=(name,cat,price,icon,r)=>{const id=uid('m');menu.push({id,name,cat,price,icon,avail:true});rec[id]=r.map(([n,q])=>({ing:g(n),qty:q}))};
  M('Cappuccino','Hot Beverages',60,'☕',[['Milk',150],['Coffee Powder',18]]);M('Latte','Hot Beverages',70,'🥛',[['Milk',200],['Coffee Powder',18]]);
  M('Americano','Hot Beverages',50,'🫖',[['Coffee Powder',18]]);M('Cold Coffee','Cold Beverages',80,'🧋',[['Milk',200],['Coffee Powder',15],['Sugar',10]]);
  M('Espresso','Hot Beverages',40,'☕',[['Coffee Powder',18]]);M('Masala Tea','Hot Beverages',30,'🍵',[['Milk',100],['Tea Leaves',5],['Sugar',8]]);
  M('Iced Tea','Cold Beverages',50,'🍹',[['Tea Leaves',5],['Sugar',12],['Lemon',0.5]]);M('Hot Chocolate','Hot Beverages',70,'🍫',[['Milk',200],['Cocoa Powder',20],['Sugar',10]]);
  M('Veg Sandwich','Snacks',100,'🥪',[['Bread',2],['Tomato',30]]);M('Paneer Wrap','Snacks',120,'🌯',[['Tortilla',1],['Paneer',60],['Tomato',20],['Lettuce',10]]);
  M('French Fries','Snacks',90,'🍟',[['Potatoes',150]]);M('Chocolate Muffin','Desserts',60,'🧁',[['Flour',60],['Sugar',20],['Chocolate Chips',15],['Eggs',0.5]]);
  M('Lemon Soda','Cold Beverages',45,'🥤',[['Lemon',1],['Sugar',15]]);M('Whipped Mocha','Hot Beverages',90,'☕',[['Milk',150],['Coffee Powder',18],['Cocoa Powder',10],['Cream',30]]);
  M('Brownie','Desserts',75,'🍰',[['Flour',50],['Cocoa Powder',15],['Chocolate Chips',10],['Eggs',0.5]]);M('Cheese Toast','Snacks',85,'🍞',[['Bread',2],['Cheese',30],['Butter',5]]);
  const T=(d,a,b)=>{if(d===0)return new Date(Date.now()-a*6e4);const t=new Date();t.setDate(t.getDate()-d);t.setHours(a,b,0,0);return t};
  const L=[[0,150,0,[['Cappuccino',2]]],[0,110,0,[['Cold Coffee',1],['Veg Sandwich',1]]],[0,80,0,[['Latte',3]]],[0,50,0,[['Espresso',1],['Chocolate Muffin',1]]],[0,25,0,[['Iced Tea',2]],'Preparing'],[0,8,0,[['Cappuccino',1],['French Fries',1]],'Pending'],
  [1,9,15,[['Cappuccino',2],['French Fries',1]]],[1,11,40,[['Latte',2],['Paneer Wrap',1]]],[1,13,5,[['Cold Coffee',2],['Veg Sandwich',2]]],[1,16,30,[['Masala Tea',3],['Chocolate Muffin',2]]],[1,19,10,[['Hot Chocolate',2],['Brownie',1]]],
  [2,10,0,[['Americano',2],['Veg Sandwich',1]]],[2,14,20,[['Cappuccino',3]]],[2,18,45,[['Iced Tea',2],['French Fries',2]]],[3,12,10,[['Latte',2],['Paneer Wrap',2]]],[3,17,5,[['Cold Coffee',3]]],
  [4,11,30,[['Espresso',3],['Chocolate Muffin',1]]],[4,15,0,[['Cappuccino',2],['Brownie',2]]],[5,10,20,[['Masala Tea',4]]],[5,16,40,[['Latte',1],['Veg Sandwich',1],['French Fries',1]]],[6,13,0,[['Cappuccino',1],['Cold Coffee',1]]]];
  const set={name:'BrewTrack Café',cur:'₹',tax:5,notify:true,theme:'light',next:1001};
  const orders=L.map(([d,a,b,items,status])=>{const lines=items.map(([n,q])=>{const m=menu.find(x=>x.name===n);return{id:m.id,name:n,price:m.price,qty:q}});const subtotal=r2(lines.reduce((s,l)=>s+l.price*l.qty,0)),tax=r2(subtotal*5/100);return{ts:T(d,a,b).toISOString(),lines,subtotal,taxRate:5,tax,total:r2(subtotal+tax),status:status||'Completed',cafe:set.name,cur:set.cur,noRecipe:[]}})
   .sort((x,y)=>x.ts.localeCompare(y.ts)).map((o,i)=>({no:1001+i,...o}));
  set.next=1001+orders.length;
  const mv=(n,delta,h,note)=>{const i=ings.find(x=>x.name===n);return{id:uid('v'),ingId:i.id,name:n,unit:i.unit,delta,ts:new Date(Date.now()-h*36e5).toISOString(),note}};
  S.menu=menu;S.ing=ings;S.rec=rec;S.orders=orders;S.set=set;S.moves=[mv('Milk',2000,2,'Restock'),mv('Tomato',3000,4,'Restock'),mv('Cheese',-200,20,'Wastage'),mv('Flour',1000,26,'Restock')];
  Object.keys(K).forEach(save);
}
function loadData(){
  let any=false;
  const get=(k,arr)=>{const raw=localStorage.getItem(K[k]);if(raw===null)return null;any=true;try{const v=JSON.parse(raw);if(arr?!Array.isArray(v):(!v||typeof v!=='object'||Array.isArray(v)))throw 0;return v}catch(e){return null}};
  let d;try{d={menu:get('menu',1),ing:get('ing',1),rec:get('rec',0),orders:get('orders',1),moves:get('moves',1),set:get('set',0)}}catch(e){d={}}
  if(Object.values(d).some(v=>!v)||Object.keys(d).length<6){seed();if(any)toast('Stored data was missing or unreadable – sample data restored.','warn');return}
  S.menu=d.menu.filter(m=>m&&m.id&&m.name&&isFinite(m.price));
  S.ing=d.ing.filter(i=>i&&i.id&&i.name&&isFinite(i.qty)&&isFinite(i.min));
  S.orders=d.orders.filter(o=>o&&o.ts&&Array.isArray(o.lines)&&isFinite(o.total)&&STATUS.includes(o.status));
  S.moves=d.moves.filter(v=>v&&v.ts&&isFinite(v.delta));
  S.rec={};Object.keys(d.rec).forEach(k=>{S.rec[k]=Array.isArray(d.rec[k])?d.rec[k].filter(x=>x&&x.ing&&isFinite(x.qty)&&x.qty>0):[]});
  S.set={name:'BrewTrack Café',cur:'₹',tax:5,notify:true,theme:'light',...d.set};
  S.set.next=Math.max(Number(S.set.next)||0,...S.orders.map(o=>o.no+1),1001);
}

/* ---------- calculations ---------- */
const cartLines=()=>ui.cart.map(c=>({c,m:mi(c.id)})).filter(x=>x.m);
function bill(){const sub=r2(cartLines().reduce((s,x)=>s+x.m.price*x.c.qty,0)),tax=r2(sub*S.set.tax/100);return{sub,tax,total:r2(sub+tax)}}
function soldQty(list){const m={};list.forEach(o=>o.lines.forEach(l=>{const x=m[l.name]||(m[l.name]={name:l.name,qty:0,rev:0});x.qty+=l.qty;x.rev=r2(x.rev+l.price*l.qty)}));return Object.values(m).sort((a,b)=>b.qty-a.qty)}
function needFor(lines){const need={},noRec=[];lines.forEach(({c,m})=>{const r=S.rec[m.id]||[];if(!r.length)noRec.push(m.name);r.forEach(x=>{need[x.ing]=r2((need[x.ing]||0)+x.qty*c.qty)})});return{need,noRec}}
function seriesFor(mode){const c=completed();
  if(mode==='today'){const t=dk(new Date()),h={};c.filter(o=>dk(o.ts)===t).forEach(o=>{const k=new Date(o.ts).getHours();h[k]=r2((h[k]||0)+o.total)});const ks=Object.keys(h).map(Number),lo=Math.min(8,...ks),hi=Math.max(20,...ks),out=[];for(let i=lo;i<=hi;i++)out.push({l:(i%12||12)+(i<12?'AM':'PM'),v:h[i]||0});return out}
  const n=mode==='30'?30:7,out=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=dk(d);out.push({l:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}),v:sumT(c.filter(o=>dk(o.ts)===k))})}return out}
function barChart(d){const W=640,H=240,L=44,B=28,T=10,m0=Math.max(0,...d.map(x=>x.v)),p=10**Math.floor(Math.log10(m0||100)),max=m0?Math.ceil(m0/p*2)/2*p:100,bw=(W-L)/d.length,ch=H-B-T;
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales bar chart">`;
  for(let i=0;i<=4;i++){const y=T+ch-ch*i/4;s+=`<line x1="${L}" x2="${W}" y1="${y}" y2="${y}" class="gl"/><text x="${L-6}" y="${y+4}" text-anchor="end">${Math.round(max*i/4)}</text>`}
  const ev=Math.ceil(d.length/12);
  d.forEach((x,i)=>{const h=ch*x.v/max,xx=L+i*bw+bw*.18;s+=`<rect x="${xx}" y="${T+ch-h}" width="${bw*.64}" height="${h}" rx="3" class="bar"><title>${esc(x.l)}: ${esc(money(x.v))}</title></rect>`;if(i%ev===0)s+=`<text x="${xx+bw*.32}" y="${H-8}" text-anchor="middle">${esc(x.l)}</text>`});
  return s+'</svg>'}

/* ---------- views ---------- */
const sc=(cls,i,label,val,sub)=>`<div class="sc ${cls}"><span class="ci">${ic(i)}</span><div><small>${label}</small><b>${val}</b><span>${sub}</span></div></div>`;
const opts=(arr,sel)=>arr.map(x=>`<option${x===sel?' selected':''}>${esc(x)}</option>`).join('');
const itemsTxt=o=>o.lines.map(l=>`${l.qty} × ${l.name}`).join(', ');
const lowList=()=>S.ing.filter(i=>st(i)!=='ok').sort((a,b)=>a.qty/(a.min||1)-b.qty/(b.min||1));
const V={};
V.dashboard=()=>{
  const c=completed(),t=dk(new Date()),y=dk(Date.now()-864e5),ts=sumT(c.filter(o=>dk(o.ts)===t)),ys=sumT(c.filter(o=>dk(o.ts)===y));
  const to=S.orders.filter(o=>dk(o.ts)===t).length,yo=S.orders.filter(o=>dk(o.ts)===y).length;
  const trend=(a,b)=>b>0?`<span class="${a>=b?'up':'dn'}">${ic(a>=b?'up':'down')} ${Math.abs(Math.round((a-b)/b*100))}% vs yesterday</span>`:'No data for yesterday';
  const low=lowList(),recent=[...S.orders].sort((a,b)=>b.ts.localeCompare(a.ts)).slice(0,5);
  const pop=soldQty(ui.dpop==='today'?c.filter(o=>dk(o.ts)===t):c).slice(0,5),pm=Math.max(1,...pop.map(p=>p.qty));
  return `<div class="cards">${sc('c1','cup','Total Sales (Today)',money(ts),trend(ts,ys))}${sc('c2','bill','Total Orders (Today)',to,trend(to,yo))}${sc('c3','box','Menu Items',S.menu.length,S.menu.filter(m=>m.avail).length+' Active Items')}${sc('c4','warn','Low-Stock Items',low.length,'Need Attention')}</div>
  <div class="grid g21"><div class="panel"><div class="ph">${ic('chart')}<h2>Sales Overview</h2><select data-f="dsr"><option value="today"${ui.dsr==='today'?' selected':''}>Today</option><option value="7"${ui.dsr==='7'?' selected':''}>Last 7 days</option><option value="30"${ui.dsr==='30'?' selected':''}>Last 30 days</option></select></div>${barChart(seriesFor(ui.dsr))}<p class="note">Completed orders only (${esc(S.set.cur)}). Demo data is editable sample data.</p></div>
  <div class="panel"><div class="ph">${ic('warn')}<h2>Low Stock Alerts</h2><button class="link" data-act="go" data-v="inventory">View All</button></div>${low.length?low.slice(0,5).map(i=>`<div class="row"><span class="thumb">${esc(i.icon||'📦')}</span><div class="grow"><b>${esc(i.name)}</b><span class="red">${i.qty<=0?'Out of stock':'Only '+esc(fq(i))+' left'}</span></div>${pill(st(i),STL[st(i)])}</div>`).join(''):empty('All ingredients are well stocked.')}</div></div>
  <div class="grid g21"><div class="panel"><div class="ph">${ic('clock')}<h2>Recent Orders</h2><button class="link" data-act="go" data-v="history">View All</button></div>${recent.length?`<div class="tscroll"><table><tr><th>Order ID</th><th>Time</th><th>Items</th><th>Total</th><th>Status</th></tr>${recent.map(o=>`<tr><td>#${o.no}</td><td>${esc(ftm(o.ts))}</td><td>${esc(itemsTxt(o))}</td><td>${esc(o.cur)}${r2(o.total)}</td><td>${pill(o.status,o.status)}</td></tr>`).join('')}</table></div>`:empty('No orders yet.')}</div>
  <div class="panel"><div class="ph">${ic('chart')}<h2>Popular Items</h2><select data-f="dpop"><option value="today"${ui.dpop==='today'?' selected':''}>Today</option><option value="all"${ui.dpop==='all'?' selected':''}>All time</option></select></div>${pop.length?pop.map(p=>`<div class="pop"><span class="thumb">${esc((S.menu.find(m=>m.name===p.name)||{}).icon||'🍽️')}</span><span class="n">${esc(p.name)}</span><span class="bt"><i style="width:${p.qty/pm*100}%"></i></span><b>${p.qty}</b></div>`).join(''):empty('No completed sales in this period.')}</div></div>`};

V.menu=()=>{
  const q=ui.mq.toLowerCase(),list=S.menu.filter(m=>(ui.mcat==='All'||m.cat===ui.mcat)&&m.name.toLowerCase().includes(q));
  return `<div class="panel"><div class="toolbar noprint"><input class="srch" id="mq" data-f="mq" placeholder="Search menu items…" value="${esc(ui.mq)}"><select data-f="mcat">${opts(['All',...CATS],ui.mcat)}</select><button class="btn" data-act="menuAdd">${ic('plus')} Add Item</button></div>
  ${list.length?`<div class="tscroll"><table><tr><th>Item</th><th>Category</th><th>Price</th><th>Recipe</th><th>Status</th><th class="r">Actions</th></tr>${list.map(m=>{const r=S.rec[m.id]||[];return `<tr><td><div class="row" style="border:0;padding:0"><span class="thumb">${esc(m.icon||'🍽️')}</span><b>${esc(m.name)}</b></div></td><td>${pill('cat',m.cat)}</td><td>${money(m.price)}</td><td>${r.length?r.length+' ingredient'+(r.length>1?'s':''):'<span class="red">No recipe</span>'}</td><td><button class="pill p-${m.avail?'ok':'out'}" style="border:0;cursor:pointer" data-act="menuTog" data-id="${m.id}" title="Toggle availability">${m.avail?'Available':'Disabled'}</button></td><td class="r"><button class="icon-btn" data-act="menuEdit" data-id="${m.id}" aria-label="Edit">${ic('pencil')}</button><button class="icon-btn" data-act="menuDel" data-id="${m.id}" aria-label="Delete">${ic('trash')}</button></td></tr>`}).join('')}</table></div>`:empty('No menu items found. Add one to get started.')}</div>`};

V.billing=()=>{
  const q=ui.q.toLowerCase(),list=S.menu.filter(m=>(ui.cat==='All'||m.cat===ui.cat)&&m.name.toLowerCase().includes(q)),L=cartLines(),b=bill();
  const prod=m=>{const r=S.rec[m.id]||[],short=r.some(x=>{const i=ing(x.ing);return !i||i.qty<x.qty});const n=ui.step[m.id]||1;
    return `<div class="pc${m.avail?'':' off'}"><div class="pimg">${esc(m.icon||'🍽️')}</div><div class="pb"><b>${esc(m.name)}</b><div class="pr">${money(m.price)}</div><span class="badge">${!m.avail?'Unavailable':!r.length?'No recipe – no stock deduction':short?'Ingredients short':''}</span>
    <div class="pa"><span class="qty"><button data-act="step" data-id="${m.id}" data-d="-1" aria-label="Less">${ic('minus')}</button><span>${n}</span><button data-act="step" data-id="${m.id}" data-d="1" aria-label="More">${ic('plus')}</button></span><button class="btn"${m.avail?'':' disabled'} data-act="add" data-id="${m.id}">Add</button></div></div></div>`};
  return `<div class="bill-grid"><div><div class="toolbar"><div class="tabs">${['All',...CATS].map(c=>`<button class="tab${ui.cat===c?' on':''}" data-act="cat" data-c="${c}">${c==='All'?'All Items':c}</button>`).join('')}</div><input class="srch" id="q" data-f="q" placeholder="Search menu items…" value="${esc(ui.q)}"></div>${list.length?`<div class="products">${list.map(prod).join('')}</div>`:empty('No menu items match.')}</div>
  <div class="cart stack"><div class="panel"><div class="ph">${ic('cart')}<h2>Current Order</h2><button class="btn ghost sm" data-act="clear">${ic('trash')} Clear All</button></div>${L.length?L.map(({c,m})=>`<div class="crow"><span class="thumb">${esc(m.icon||'🍽️')}</span><div>${esc(m.name)}<small>${money(m.price)}${(S.rec[m.id]||[]).length?'':' · no recipe'}</small></div><span class="qty"><button data-act="cq" data-id="${m.id}" data-d="-1" aria-label="Less">${ic('minus')}</button><span>${c.qty}</span><button data-act="cq" data-id="${m.id}" data-d="1" aria-label="More">${ic('plus')}</button></span><b class="lt">${money(m.price*c.qty)}</b><button class="icon-btn" data-act="crm" data-id="${m.id}" aria-label="Remove">${ic('trash')}</button></div>`).join(''):empty('Cart is empty. Add items from the menu.')}</div>
  <div class="panel"><div class="ph">${ic('bill')}<h2>Bill Summary</h2></div><div class="sum"><span>Subtotal</span><span>${money(b.sub)}</span></div><div class="sum"><span>Tax (${+S.set.tax}%)</span><span>${money(b.tax)}</span></div><div class="sum tot"><span>Total Amount</span><span>${money(b.total)}</span></div><div class="acts"><button class="btn ghost" data-act="prevPrint">${ic('print')} Print Receipt</button><button class="btn" data-act="confirm">${ic('check')} Confirm Order</button></div><p class="note">Stock is deducted only when an order is confirmed. No payment is processed.</p></div></div></div>`};

V.inventory=()=>{
  const q=ui.iq.toLowerCase(),list=S.ing.filter(i=>i.name.toLowerCase().includes(q)),n={ok:0,low:0,out:0};S.ing.forEach(i=>n[st(i)]++);const tot=S.ing.length||1,pc=k=>Math.round(n[k]/tot*100);
  const p1=n.ok/tot*100,p2=p1+n.low/tot*100,low=lowList(),mv=[...S.moves].sort((a,b)=>b.ts.localeCompare(a.ts)).slice(0,6);
  return `<div class="cards">${sc('c1','box','Total Ingredients',S.ing.length,'Items')}${sc('c2','check','In Stock',n.ok,'Items')}${sc('c5','warn','Low Stock',n.low,'Items')}${sc('c4','x','Out of Stock',n.out,'Items')}</div>
  <div class="g32"><div class="panel"><div class="toolbar noprint"><div class="ph" style="margin:0;flex:none">${ic('box')}<h2>Ingredient Inventory</h2></div><input class="srch" id="iq" data-f="iq" placeholder="Search ingredients…" value="${esc(ui.iq)}"><button class="btn" data-act="ingAdd">${ic('plus')} Add Ingredient</button></div>
  ${list.length?`<div class="tscroll"><table><tr><th>#</th><th>Ingredient</th><th>Category</th><th>Available Qty</th><th>Unit</th><th>Min. Stock</th><th>Status</th><th>Actions</th></tr>${list.map((i,k)=>`<tr><td>${k+1}</td><td><div class="row" style="border:0;padding:0"><span class="thumb">${esc(i.icon||'📦')}</span>${esc(i.name)}</div></td><td>${pill('cat',i.cat)}</td><td>${+Number(i.qty).toFixed(2)}</td><td>${esc(i.unit)}</td><td>${+Number(i.min).toFixed(2)}</td><td>${pill(st(i),STL[st(i)])}</td><td style="white-space:nowrap"><button class="icon-btn" data-act="ingEdit" data-id="${i.id}" aria-label="Edit">${ic('pencil')}</button><button class="btn sm" data-act="restock" data-id="${i.id}" aria-label="Restock">${ic('plus')}</button><button class="icon-btn" data-act="ingDel" data-id="${i.id}" aria-label="Delete">${ic('trash')}</button></td></tr>`).join('')}</table></div>`:empty('No ingredients found.')}</div>
  <div class="stack"><div class="panel"><div class="ph">${ic('bell')}<h2>Low Stock Alerts</h2></div>${low.length?low.slice(0,5).map(i=>`<div class="row"><span class="thumb">${esc(i.icon||'📦')}</span><div class="grow"><b>${esc(i.name)}</b><span class="red">${i.qty<=0?'Out of stock':'Only '+esc(fq(i))+' left'}</span></div>${pill(st(i),STL[st(i)])}</div>`).join(''):empty('No alerts.')}</div>
  <div class="panel"><div class="ph">${ic('chart')}<h2>Stock Statistics</h2></div><div class="row" style="border:0"><div class="pie" style="background:conic-gradient(var(--ok) 0 ${p1}%,var(--warn) ${p1}% ${p2}%,var(--bad) ${p2}% 100%)"></div><div class="leg"><span><i style="background:var(--ok)"></i>In Stock ${n.ok} (${pc('ok')}%)</span><span><i style="background:var(--warn)"></i>Low Stock ${n.low} (${pc('low')}%)</span><span><i style="background:var(--bad)"></i>Out of Stock ${n.out} (${pc('out')}%)</span></div></div></div>
  <div class="panel"><div class="ph">${ic('clock')}<h2>Recent Stock Updates</h2></div>${mv.length?mv.map(v=>`<div class="row"><span class="${v.delta>=0?'up':'dn'}">${ic(v.delta>=0?'up':'down')}</span><div class="grow"><b>${esc(v.name)}</b><span class="mut">${esc(v.note||'')}</span></div><div class="r"><b class="${v.delta>=0?'up':'dn'}">${v.delta>0?'+':'−'}${+Math.abs(v.delta).toFixed(2)} ${esc(v.unit)}</b><span class="mut">${esc(fdt(v.ts))}</span></div></div>`).join(''):empty('No stock movements yet.')}</div></div></div>`};

V.history=()=>{
  const q=ui.hq.replace('#','').trim(),list=[...S.orders].filter(o=>(!q||String(o.no).includes(q))&&(!ui.hd||dk(o.ts)===ui.hd)&&(!ui.hs||o.status===ui.hs)).sort((a,b)=>b.ts.localeCompare(a.ts));
  return `<div class="panel"><div class="toolbar noprint"><input class="srch" id="hq" data-f="hq" placeholder="Search by order ID…" value="${esc(ui.hq)}"><input type="date" data-f="hd" value="${esc(ui.hd)}" aria-label="Date"><select data-f="hs"><option value="">All statuses</option>${STATUS.map(s=>`<option${ui.hs===s?' selected':''}>${s}</option>`).join('')}</select><button class="btn ghost" data-act="hClear">Clear filters</button></div>
  ${list.length?`<div class="tscroll"><table><tr><th>Order ID</th><th>Date / Time</th><th>Items</th><th>Total</th><th>Status</th><th class="r">Actions</th></tr>${list.map(o=>`<tr><td>#${o.no}</td><td>${esc(fdt(o.ts))}</td><td>${esc(itemsTxt(o))}</td><td>${esc(o.cur)}${r2(o.total).toFixed(2)}</td><td><select data-st="${o.no}" aria-label="Status">${STATUS.map(s=>`<option${o.status===s?' selected':''}>${s}</option>`).join('')}</select></td><td class="r" style="white-space:nowrap"><button class="icon-btn" data-act="oView" data-no="${o.no}" aria-label="View">${ic('eye')}</button><button class="icon-btn" data-act="oPrint" data-no="${o.no}" aria-label="Print">${ic('print')}</button></td></tr>`).join('')}</table></div>`:empty('No orders match the filters.')}</div>`};

V.sales=()=>{
  if(!ui.from){ui.to=dk(new Date());ui.from=dk(Date.now()-6*864e5)}
  const bad=ui.from>ui.to,c=bad?[]:completed().filter(o=>{const d=dk(o.ts);return d>=ui.from&&d<=ui.to}),rev=sumT(c),today=sumT(completed().filter(o=>dk(o.ts)===dk(new Date())));
  const by={};c.forEach(o=>{const k=dk(o.ts);(by[k]=by[k]||[]).push(o)});const days=Object.keys(by).sort();
  const best=soldQty(c).slice(0,8),ser=days.slice(-31).map(k=>({l:k.slice(5),v:sumT(by[k])}));
  return `<div class="panel noprint" style="margin-bottom:18px"><div class="toolbar" style="margin:0"><label>From<input type="date" data-f="from" value="${ui.from}"></label><label>To<input type="date" data-f="to" value="${ui.to}"></label><span style="flex:1"></span><button class="btn" data-act="rprint">${ic('print')} Print Report</button></div>${bad?'<p class="err">The start date must not be after the end date.</p>':''}</div>
  <div class="cards">${sc('c1','cup',"Today's Sales",money(today),'Completed orders')}${sc('c2','bill','Completed Orders',c.length,esc(ui.from)+' → '+esc(ui.to))}${sc('c3','chart','Revenue (range)',money(rev),'Incl. tax')}${sc('c5','box','Avg Order Value',money(c.length?rev/c.length:0),'Per completed order')}</div>
  <p class="note">Convention: sales figures count <b>Completed</b> orders only; Pending and Preparing orders are excluded until completed. Totals include tax. Report for ${esc(S.set.name)}.</p>
  <div class="grid g21"><div class="panel"><div class="ph">${ic('chart')}<h2>Daily Sales</h2></div>${ser.length?barChart(ser):empty('No completed orders in this range.')}</div>
  <div class="panel"><div class="ph">${ic('cup')}<h2>Best-Selling Items</h2></div>${best.length?`<table><tr><th>Item</th><th class="r">Qty</th><th class="r">Revenue</th></tr>${best.map(b=>`<tr><td>${esc(b.name)}</td><td class="r">${b.qty}</td><td class="r">${money(b.rev)}</td></tr>`).join('')}</table><p class="note">Revenue excludes tax.</p>`:empty('No data.')}</div></div>
  <div class="panel"><div class="ph">${ic('clock')}<h2>Sales by Date</h2></div>${days.length?`<div class="tscroll"><table><tr><th>Date</th><th class="r">Orders</th><th class="r">Revenue</th></tr>${[...days].reverse().map(k=>`<tr><td>${k}</td><td class="r">${by[k].length}</td><td class="r">${money(sumT(by[k]))}</td></tr>`).join('')}</table></div>`:empty('No completed orders in this range.')}</div>`};

V.settings=()=>`<div class="panel" style="max-width:640px"><div class="fgrid"><label>Café name<input id="sN" maxlength="40" value="${esc(S.set.name)}"></label><label>Currency symbol (INR ₹ default)<input id="sC" maxlength="3" value="${esc(S.set.cur)}"></label><label>Tax percentage (%)<input id="sT" type="number" min="0" max="100" step="0.01" value="${+S.set.tax}"></label></div>
  <label class="chk"><input id="sA" type="checkbox"${S.set.notify?' checked':''}> Alert me when an order pushes an ingredient to Low or Out of Stock</label><p class="note">Changes apply to future bills and receipts only; saved orders keep their original totals.</p><p class="err" id="sErr"></p>
  <div class="toolbar"><button class="btn" data-act="setSave">${ic('check')} Save Settings</button><button class="btn danger" data-act="reset">${ic('trash')} Reset Sample Data</button></div><p class="note">Data is stored only in this browser (localStorage). BrewTrack is a single-device prototype with no cloud sync, login or payment processing.</p></div>`;

const TT={dashboard:['Dashboard','Overview of sales, orders and inventory','home'],menu:['Menu Management','Add, edit and organise menu items','fork'],billing:['Menu & Billing','Select items, add to cart and generate bill','fork'],inventory:['Inventory Management','Track ingredients, monitor stock levels and manage supplies','box'],history:['Order History','Review, track and print saved orders','clock'],sales:['Sales Summary','Reports derived from saved completed orders','chart'],settings:['Settings','Configure café details and data','gear']};
function render(){
  const a=document.activeElement,fid=a&&a.id,pos=a&&a.selectionStart;
  const [t,s,i]=TT[ui.view];$('#pgTitle').textContent=t;$('#pgSub').textContent=s;$('#pgIc').innerHTML=ic(i);document.title=t+' – BrewTrack';
  $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===ui.view));
  $('#view').innerHTML=V[ui.view]();
  $('#themeBtn').innerHTML=ic(S.set.theme==='dark'?'sun':'moon');document.documentElement.dataset.theme=S.set.theme;
  if(fid){const e=$('#'+fid);if(e&&e.type==='text'||e&&e.type==='search'){e.focus();try{e.setSelectionRange(pos,pos)}catch(x){}}}
}
const go=v=>{ui.view=v;document.body.classList.remove('nav-open');render();scrollTo(0,0)};

/* ---------- menu & ingredient CRUD ---------- */
const recRow=(x={ing:'',qty:''})=>`<div class="rrow"><select class="rI"><option value="">Select ingredient</option>${S.ing.map(i=>`<option value="${esc(i.id)}"${i.id===x.ing?' selected':''}>${esc(i.name)} (${esc(i.unit)})</option>`).join('')}${x.ing&&!ing(x.ing)?`<option value="${esc(x.ing)}" selected>(deleted ingredient)</option>`:''}</select><input class="rQ" type="number" min="0" step="any" placeholder="Qty" value="${esc(x.qty)}"><button type="button" class="icon-btn" data-act="recDel" aria-label="Remove">${ic('x')}</button></div>`;
function menuForm(id){
  const m=id?mi(id):{name:'',cat:CATS[0],price:'',icon:'☕',avail:true},r=(id&&S.rec[id])||[];
  modal(id?'Edit Menu Item':'Add Menu Item',`<div class="fgrid"><label>Name<input id="fN" maxlength="40" value="${esc(m.name)}"></label><label>Category<select id="fC">${opts(CATS,m.cat)}</select></label><label>Price (${esc(S.set.cur)})<input id="fP" type="number" min="0" step="0.01" value="${esc(m.price)}"></label><label>Emoji icon<input id="fE" maxlength="4" value="${esc(m.icon)}"></label></div><label class="chk"><input id="fA" type="checkbox"${m.avail?' checked':''}> Available for ordering</label><h4>Recipe (per serving)</h4><div id="rrows">${r.map(recRow).join('')}</div><button type="button" class="btn ghost sm" data-act="recAdd">${ic('plus')} Add ingredient</button><p class="note">Future orders use the current recipe; saved orders keep their original lines and prices.</p>`,()=>{
    const name=$('#fN').value.trim(),pv=$('#fP').value,price=Number(pv);
    if(!name)return 'Name is required.';
    if(S.menu.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase()))return 'A menu item with this name already exists.';
    if(!numOk(pv)||price<0)return 'Price must be a valid non-negative number.';
    const rows=[],seen=new Set();
    for(const row of $$('.rrow')){const i=$('.rI',row).value,q=$('.rQ',row).value;if(!i&&q==='')continue;
      if(!i||!ing(i))return 'Each recipe row needs an existing ingredient (remove deleted ones).';if(!numOk(q)||Number(q)<=0)return 'Recipe quantities must be greater than zero.';if(seen.has(i))return 'An ingredient appears twice in the recipe.';seen.add(i);rows.push({ing:i,qty:Number(q)})}
    const o={name,cat:$('#fC').value,price:r2(price),icon:$('#fE').value.trim()||'🍽️',avail:$('#fA').checked};
    if(id)Object.assign(mi(id),o);else{const nid=uid('m');S.menu.push({id:nid,...o});id=nid}
    S.rec[id]=rows;save('menu');save('rec');toast('Menu item saved.');render();return true});
}
function ingForm(id){
  const i=id?ing(id):{name:'',cat:ICATS[0],qty:'',unit:'g',min:'',icon:'📦'};
  modal(id?'Edit Ingredient':'Add Ingredient',`<div class="fgrid"><label>Name<input id="gN" maxlength="40" value="${esc(i.name)}"></label><label>Category<select id="gC">${opts(ICATS,i.cat)}</select></label><label>Available quantity<input id="gQ" type="number" min="0" step="any" value="${esc(i.qty)}"></label><label>Unit<select id="gU">${opts(UNITS,i.unit)}</select></label><label>Minimum stock<input id="gM" type="number" min="0" step="any" value="${esc(i.min)}"></label><label>Emoji icon<input id="gE" maxlength="4" value="${esc(i.icon)}"></label></div><p class="note">Use one consistent unit per ingredient; recipes use this unit (no automatic g/kg or ml/L conversion). Changing a unit does not rescale existing recipes.</p>`,()=>{
    const name=$('#gN').value.trim(),q=$('#gQ').value,m=$('#gM').value;
    if(!name)return 'Name is required.';if(S.ing.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase()))return 'An ingredient with this name already exists.';
    if(!numOk(q)||Number(q)<0||!numOk(m)||Number(m)<0)return 'Quantity and minimum stock must be non-negative numbers.';
    const o={name,cat:$('#gC').value,unit:$('#gU').value,qty:r2(q),min:r2(m),icon:$('#gE').value.trim()||'📦'};
    if(id){const x=ing(id),d=r2(o.qty-x.qty);Object.assign(x,o);if(d)move(x,d,'Manual adjustment')}else{const x={id:uid('i'),...o};S.ing.push(x);if(x.qty>0)move(x,x.qty,'Initial stock')}
    save('ing');save('moves');toast('Ingredient saved.');render();return true});
}
function move(i,delta,note){S.moves.unshift({id:uid('v'),ingId:i.id,name:i.name,unit:i.unit,delta:r2(delta),ts:new Date().toISOString(),note});S.moves=S.moves.slice(0,300)}
function restockForm(id){const i=ing(id);if(!i)return;modal('Restock '+i.name,`<p>Current stock: <b>${esc(fq(i))}</b> (minimum ${+i.min} ${esc(i.unit)})</p><label>Quantity to add (${esc(i.unit)})<input id="rQty" type="number" min="0" step="any" autofocus></label>`,()=>{
  const v=$('#rQty').value;if(!numOk(v)||Number(v)<=0)return 'Enter a quantity greater than zero.';
  i.qty=r2(i.qty+Number(v));move(i,Number(v),'Restock');save('ing');save('moves');toast(`${i.name} restocked (+${+Number(v)} ${i.unit}).`);render();return true},'Restock')}

/* ---------- cart, billing, orders ---------- */
function addToCart(id,q){const m=mi(id);if(!m)return toast('Menu item not found.','err');if(!m.avail)return toast(m.name+' is unavailable.','err');if(!Number.isInteger(q)||q<1)return toast('Quantity must be a whole number of at least 1.','err');
  const c=ui.cart.find(x=>x.id===id);if(c){if(c.qty+q>99)return toast('Maximum 99 per item.','err');c.qty+=q}else ui.cart.push({id,qty:q});ui.step[id]=1;render()}
function confirmOrder(){
  if(ui.busy)return;const L=cartLines();
  if(!L.length)return toast('Cannot confirm an empty order.','err');
  if(L.length!==ui.cart.length){ui.cart=L.map(x=>x.c);render();return toast('Some items no longer exist and were removed. Review the order.','err')}
  for(const {c,m} of L){if(!Number.isInteger(c.qty)||c.qty<1)return toast('Invalid quantity for '+m.name+'.','err');if(!m.avail)return toast(m.name+' is unavailable. Remove it first.','err')}
  const {need,noRec}=needFor(L),short=[];
  for(const id in need){const i=ing(id);if(!i)short.push('a deleted ingredient (fix the recipe)');else if(i.qty+1e-9<need[id])short.push(`${i.name}: need ${need[id]} ${i.unit}, have ${+i.qty.toFixed(2)}`)}
  if(short.length)return toast('Order rejected, no stock changed. Insufficient: '+short.join('; '),'err');
  ui.busy=true;
  try{
    const before={};S.ing.forEach(i=>before[i.id]=st(i));
    const b=bill(),no=S.set.next++;
    for(const id in need){const i=ing(id);i.qty=r2(i.qty-need[id]);move(i,-need[id],'Order #'+no)}
    const o={no,ts:new Date().toISOString(),lines:L.map(({c,m})=>({id:m.id,name:m.name,price:m.price,qty:c.qty})),subtotal:b.sub,taxRate:+S.set.tax,tax:b.tax,total:b.total,status:'Pending',cafe:S.set.name,cur:S.set.cur,noRecipe:noRec};
    S.orders.push(o);ui.cart=[];['orders','ing','moves','set'].forEach(save);
    if(S.set.notify)S.ing.filter(i=>st(i)!==before[i.id]&&st(i)!=='ok').forEach(i=>toast(`${i.name} is now ${STL[st(i)]} (${fq(i)} left).`,'warn'));
    render();
    modal('Order #'+no+' confirmed',`<p>Total <b>${money(o.total)}</b> · status <b>Pending</b>. Ingredients were deducted once.</p>${noRec.length?`<p class="err">No recipe configured for: ${esc(noRec.join(', '))}. Inventory deduction could not be calculated for these items.</p>`:''}`,()=>{printReceipt(o);return true},'Print Receipt');
  }finally{ui.busy=false}
}
function receiptHTML(o,draft){return `<div class="rc"><h2>${esc(o.cafe)}</h2><p class="c">${draft?'ORDER PREVIEW (NOT CONFIRMED)':'Order #'+o.no}</p><p class="c">${esc(fdt(o.ts))}</p><hr><table><tr><th align="left">Item</th><th>Qty</th><th align="right">Amount</th></tr>${o.lines.map(l=>`<tr><td>${esc(l.name)}<br>@ ${esc(o.cur)}${r2(l.price).toFixed(2)}</td><td align="center">${l.qty}</td><td align="right">${esc(o.cur)}${r2(l.price*l.qty).toFixed(2)}</td></tr>`).join('')}</table><hr><table><tr><td>Subtotal</td><td align="right">${esc(o.cur)}${r2(o.subtotal).toFixed(2)}</td></tr><tr><td>Tax (${+o.taxRate}%)</td><td align="right">${esc(o.cur)}${r2(o.tax).toFixed(2)}</td></tr><tr class="t"><td>TOTAL</td><td align="right">${esc(o.cur)}${r2(o.total).toFixed(2)}</td></tr></table><hr><p class="c">Thank you! Visit again.</p></div>`}
function printReceipt(o,draft){$('#receipt').innerHTML=receiptHTML(o,draft);document.body.classList.add('pr-receipt');window.print()}
addEventListener('afterprint',()=>document.body.classList.remove('pr-receipt','pr-report'));
function orderModal(o){
  modal('Order #'+o.no,`<p class="mut">${esc(fdt(o.ts))} · ${pill(o.status,o.status)}</p><table><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr>${o.lines.map(l=>`<tr><td>${esc(l.name)}</td><td class="r">${l.qty}</td><td class="r">${esc(o.cur)}${r2(l.price).toFixed(2)}</td><td class="r">${esc(o.cur)}${r2(l.price*l.qty).toFixed(2)}</td></tr>`).join('')}</table><div class="sum"><span>Subtotal</span><span>${esc(o.cur)}${r2(o.subtotal).toFixed(2)}</span></div><div class="sum"><span>Tax (${+o.taxRate}%)</span><span>${esc(o.cur)}${r2(o.tax).toFixed(2)}</span></div><div class="sum tot"><span>Total</span><span>${esc(o.cur)}${r2(o.total).toFixed(2)}</span></div>${(o.noRecipe||[]).length?`<p class="note">No recipe at the time of order for: ${esc(o.noRecipe.join(', '))} (stock not deducted).</p>`:''}`,()=>{printReceipt(o);return true},'Print Receipt')}

/* ---------- events ---------- */
const A={
  go:e=>go(e.dataset.v),nav:()=>document.body.classList.toggle('nav-open'),closeModal,
  modalOk:()=>{if(!ui.ok)return;const r=ui.ok();if(r===true)closeModal();else if(r)$('#mErr').textContent=r},
  theme:()=>{S.set.theme=S.set.theme==='dark'?'light':'dark';save('set');render()},
  menuAdd:()=>menuForm(),menuEdit:e=>menuForm(e.dataset.id),
  menuTog:e=>{const m=mi(e.dataset.id);m.avail=!m.avail;save('menu');render()},
  menuDel:e=>{const m=mi(e.dataset.id);if(!confirm(`Delete "${m.name}"? Saved orders keep their history; consider disabling instead.`))return;S.menu=S.menu.filter(x=>x.id!==m.id);delete S.rec[m.id];ui.cart=ui.cart.filter(c=>c.id!==m.id);save('menu');save('rec');toast('Menu item deleted.');render()},
  recAdd:()=>{$('#rrows').insertAdjacentHTML('beforeend',recRow())},recDel:e=>e.closest('.rrow').remove(),
  cat:e=>{ui.cat=e.dataset.c;render()},
  step:e=>{const id=e.dataset.id;ui.step[id]=Math.min(99,Math.max(1,(ui.step[id]||1)+Number(e.dataset.d)));render()},
  add:e=>addToCart(e.dataset.id,ui.step[e.dataset.id]||1),
  cq:e=>{const c=ui.cart.find(x=>x.id===e.dataset.id),n=c.qty+Number(e.dataset.d);if(n<1)ui.cart=ui.cart.filter(x=>x!==c);else if(n>99)return toast('Maximum 99 per item.','err');else c.qty=n;render()},
  crm:e=>{ui.cart=ui.cart.filter(x=>x.id!==e.dataset.id);render()},
  clear:()=>{if(ui.cart.length&&confirm('Clear all items from the current order?')){ui.cart=[];render()}},
  prevPrint:()=>{const L=cartLines();if(!L.length)return toast('Add items before printing a receipt.','err');const b=bill();printReceipt({cafe:S.set.name,cur:S.set.cur,ts:new Date().toISOString(),lines:L.map(({c,m})=>({name:m.name,price:m.price,qty:c.qty})),subtotal:b.sub,taxRate:+S.set.tax,tax:b.tax,total:b.total},true)},
  confirm:confirmOrder,
  ingAdd:()=>ingForm(),ingEdit:e=>ingForm(e.dataset.id),restock:e=>restockForm(e.dataset.id),
  ingDel:e=>{const i=ing(e.dataset.id),used=S.menu.filter(m=>(S.rec[m.id]||[]).some(x=>x.ing===i.id));
    if(used.length)return toast(`Cannot delete ${i.name}: used in recipes for ${used.map(m=>m.name).join(', ')}. Remove it from those recipes first.`,'err');
    if(!confirm(`Delete ingredient "${i.name}"?`))return;S.ing=S.ing.filter(x=>x.id!==i.id);save('ing');toast('Ingredient deleted.');render()},
  hClear:()=>{ui.hq=ui.hd=ui.hs='';render()},
  oView:e=>{const o=S.orders.find(x=>x.no==e.dataset.no);if(o)orderModal(o)},oPrint:e=>{const o=S.orders.find(x=>x.no==e.dataset.no);if(o)printReceipt(o)},
  rprint:()=>{document.body.classList.add('pr-report');window.print()},
  setSave:()=>{const n=$('#sN').value.trim(),c=$('#sC').value.trim(),t=$('#sT').value;
    if(!n||!c||!numOk(t)||Number(t)<0||Number(t)>100)return $('#sErr').textContent='Enter a café name, a currency symbol and a tax rate between 0 and 100.';
    Object.assign(S.set,{name:n,cur:c,tax:r2(t),notify:$('#sA').checked});save('set');toast('Settings saved. Applies to future bills.');render()},
  reset:()=>{if(!confirm('Reset ALL data to the sample dataset? Your menu, orders, stock and settings will be permanently replaced.'))return;seed();ui.cart=[];toast('Sample data restored.');render()}
};
document.addEventListener('click',ev=>{const e=ev.target.closest('[data-act]');if(e&&A[e.dataset.act])A[e.dataset.act](e)});
document.addEventListener('input',ev=>{const e=ev.target;if(e.dataset.f){ui[e.dataset.f]=e.value;render()}});
document.addEventListener('change',ev=>{const e=ev.target;if(e.dataset.st){const o=S.orders.find(x=>x.no==e.dataset.st);if(o&&STATUS.includes(e.value)){o.status=e.value;save('orders');toast(`Order #${o.no} marked ${o.status}.`);render()}}});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!$('#modal').hidden)closeModal()});

/* ---------- init ---------- */
try{loadData()}catch(e){try{seed()}catch(x){document.body.textContent='Storage is unavailable in this browser.'}}
$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));
$$('#nav i').forEach(e=>e.innerHTML=ic(e.dataset.ic));
render();
