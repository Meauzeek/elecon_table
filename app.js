const table=document.querySelector('#periodic-table');
const offGrid=document.querySelector('#off-grid');
const dialog=document.querySelector('#profile-dialog');
const content=document.querySelector('#profile-content');
const themeSelect=document.querySelector('#theme-select');
const modeToggle=document.querySelector('#mode-toggle');
const toast=document.querySelector('#toast');
const atomicNumber=s=>ORDER.indexOf(s)+1;
const esc=v=>String(v??'未详').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function satellitesFor(symbol){
  const entries=DERIVATIVES[symbol]||[];
  if(!entries.length)return '';
  return `<span class="satellites">${entries.map(d=>`<button class="satellite" type="button" data-derivative="${esc(symbol)}:${esc(d.code)}"><b>${esc(d.code)}</b><small>${esc(d.name)}<br>${esc(d.note)}</small></button>`).join('')}</span>`;
}
function cell(symbol,row,col){
  if(!symbol)return '';
  const z=atomicNumber(symbol), p=CHARACTERS[symbol], duplicate=(row>=8&&(symbol==='La'||symbol==='Ac'));
  const cls=`element-card ${p?'filled':'vacant'} ${(DERIVATIVES[symbol]||[]).length?'has-satellite':''}`;
  return `<div role="gridcell" tabindex="${p?'0':'-1'}" class="${cls}" style="grid-row:${row};grid-column:${col}" data-symbol="${symbol}" ${p?'':'aria-disabled="true"'} title="${esc(ELEMENT_NAMES[symbol])}${p?` · ${esc(p.name)}`:' · 尚未观测'}">
    <span class="element-number">${z}</span><span class="element-symbol">${symbol}</span><span class="element-name">${esc(ELEMENT_NAMES[symbol])}${duplicate?'系':''}</span><span class="element-character">${p?esc(p.name):'—'}</span>${satellitesFor(symbol)}
  </div>`;
}
function renderTable(){
  table.innerHTML=ROWS.map((r,ri)=>r.map((s,ci)=>cell(s,ri+1,ci+1)).join('')).join('')+
  `<button type="button" class="element-card special" style="grid-row:1;grid-column:18;transform:translateY(-78px)" data-special="Nu"><span class="element-number">0</span><span class="element-symbol">Nu</span><span class="element-name">㲴 · 中子</span><span class="element-character">纳塔尼尔</span></button>`+
  `<button type="button" class="element-card special" style="grid-row:8;grid-column:18" data-special="Mz"><span class="element-number">126</span><span class="element-symbol">Mz</span><span class="element-name">銆</span><span class="element-character">未知访客</span></button>`;
}
function renderOffGrid(){
  offGrid.innerHTML=OFF_GRID.map(p=>`<button class="off-card ${p.affinity==='aero'?'aeterna':''}" type="button" data-off="${p.code}"><span class="off-code">${p.code}</span><h3>${esc(p.name)}</h3><p>${esc(p.type)}<br>${esc(p.latin)}</p></button>`).join('');
}
function atomVisual(z){return `<div class="atom" aria-label="原子结构示意图"><span class="orbit" style="--r:0deg"></span><span class="orbit" style="--r:60deg"></span><span class="orbit" style="--r:120deg"></span><span class="nucleus">+${z}</span></div>`}
function profileHTML(p,meta={}){
  const isElement=meta.z!==undefined;
  const visual=isElement?atomVisual(meta.z):`<div class="placeholder"><div><div class="ghost">${esc(meta.code||'∅')}</div><small>IMAGE SLOT<br>角色图片待补</small></div></div>`;
  const rel=(p.relations||[]).length?`<ul>${p.relations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="latin">暂无明确关系记录。</p>';
  return `<article class="profile-layout"><div class="portrait" data-label="PORTRAIT / DEFAULT VISUAL">${visual}</div><div class="profile-body">
   <div class="profile-kicker">${isElement?`ELEMENT ${meta.z} · ${esc(meta.symbol)} / ${esc(meta.element)}`:`OFF-TABLE INDIVIDUAL · ${esc(meta.code)}`}</div>
   <h2>${esc(p.name)}</h2><div class="latin">${esc(p.latin)}</div>
   ${isElement?`<div class="element-brief">${esc(meta.brief||brief(meta.z,meta.symbol))}</div>`:''}
   <div class="facts"><div class="fact"><label>性别</label><span>${esc(p.gender)}</span></div><div class="fact"><label>年龄</label><span>${esc(p.age)}</span></div><div class="fact"><label>出身地</label><span>${esc(p.origin)}</span></div><div class="fact"><label>身份 / 定位</label><span>${esc(p.role||meta.type)}</span></div></div>
   <div class="bio"><h3>人物简介</h3><p>${esc(p.bio)}</p></div><div class="relations"><h3>重要人物关系</h3>${rel}</div>
   <div class="source-note">资料回查：${esc(p.source)} · 图片槽可在 data.js 中扩展 image 字段后替换。</div>
  </div></article>`;
}
function applySmartTheme(p){if(themeSelect.value==='smart')document.body.dataset.theme=p.affinity||'acs'}
function openProfile(p,meta){applySmartTheme(p);content.innerHTML=profileHTML(p,meta);dialog.showModal();dialog.scrollTop=0}
function openSymbol(s){const p=CHARACTERS[s];if(!p)return;openProfile(p,{z:atomicNumber(s),symbol:s,element:ELEMENT_NAMES[s]})}
function openSpecial(key){const x=SPECIAL[key];openProfile(x.character,{z:x.z,symbol:key,element:x.name,brief:key==='Nu'?'零号“元素”㲴：以四中子 / 中子流为核心的特殊序号。':'第126号特殊元素銆：位于超重元素稳定岛的假想延伸。'})}
function openOff(code){const x=OFF_GRID.find(p=>p.code===code);if(!x)return;openProfile({...x,age:'未详',gender:'未详',origin:x.affinity==='aero'?'爱伊忒拿 / 子世界':'未详',role:x.type},{code:x.code,type:x.type})}
function openDerivative(symbol,code){const d=(DERIVATIVES[symbol]||[]).find(x=>x.code===code);if(!d)return;if(d.target)return openSymbol(d.target);if(d.targetOff)return openOff(d.targetOff);openProfile(d.profile,{code:d.code,type:d.note})}

document.addEventListener('click',e=>{
 const derivative=e.target.closest('[data-derivative]');if(derivative){e.stopPropagation();const [s,c]=derivative.dataset.derivative.split(':');return openDerivative(s,c)}
 const el=e.target.closest('[data-symbol]');if(el&&!el.classList.contains('vacant'))return openSymbol(el.dataset.symbol);
 const special=e.target.closest('[data-special]');if(special)return openSpecial(special.dataset.special);
 const off=e.target.closest('[data-off]');if(off)return openOff(off.dataset.off);
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('.element-card[data-symbol]:not(.vacant)')){e.preventDefault();openSymbol(e.target.dataset.symbol)}
});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
themeSelect.addEventListener('change',()=>{if(themeSelect.value!=='smart')document.body.dataset.theme=themeSelect.value;else{document.body.dataset.theme='acs';showToast('智能主题将在打开人物档案时切换')}});
modeToggle.addEventListener('click',()=>{document.body.dataset.mode=document.body.dataset.mode==='dark'?'light':'dark';localStorage.setItem('stellalogue-mode',document.body.dataset.mode)});
function showToast(t){toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1800)}
document.querySelector('#search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.element-card[data-symbol],.off-card').forEach(el=>{const target=(el.title||el.textContent).toLowerCase();el.classList.toggle('search-hidden',!!q&&!target.includes(q))})});
document.body.dataset.mode=localStorage.getItem('stellalogue-mode')||((matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light');
document.querySelector('#record-count').textContent=Object.keys(CHARACTERS).length+Object.keys(SPECIAL).length+OFF_GRID.length;
renderTable();renderOffGrid();

