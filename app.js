const $=s=>document.querySelector(s);
const table=$('#periodic-table'),specialStrip=$('#special-strip'),offGrid=$('#off-grid');
const dialog=$('#profile-dialog'),content=$('#profile-content'),themeSelect=$('#theme-select');
const filterSelect=$('#filter-select'),modeToggle=$('#mode-toggle'),colorToggle=$('#color-toggle');
const toast=$('#toast'),legend=$('#legend'),debugBar=$('#debug-bar');
const atomicNumber=s=>ORDER.indexOf(s)+1;
const esc=v=>String(v??'未详').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const DEBUG_EDITS=JSON.parse(localStorage.getItem('stellalogue-edits')||'{}');
let debugMode=false,useCharacterColor=localStorage.getItem('stellalogue-character-colors')!=='off';

function colorFor(id){const key=id.split(':').pop();return COLOR_TABLE[key]||'#708090'}
function groupFor(id,p){
 const key=id.split(':').pop(),map={H:'LUACL / CUA',He:'演艺事务所 / 独立',Li:'南极航空航天局',Be:'南极航空航天局',B:'南极洲立大学',C:'C.I.N.Q. / 爱伊忒拿',N:'C.I.N.Q. / 爱伊忒拿',O:'天平协定',F:'南洲大附中',Ne:'天平协定（前）',P:'南洲大附中',S:'南洲大附中',Cl:'WUI 赞助项目',Ar:'南洲大附中',Ti:'泛南联邦劳工系统',V:'LUACL / CUA',Cr:'南极航空航天局',Fe:'WUI',Co:'CUA / 阿尔西亚课题组',Ni:'CUA',Ga:'CUA',Ge:'中科大少年班',Se:'PASC',Br:'天平协定',Kr:'南洲大附中',Rb:'C.I.N.Q.',Nb:'未详',Tc:'PASC / LUACL（前）',In:'爱伊忒拿 / Apëiron',Te:'南洲大附中',I:'LUACL',Xe:'CUA',Cs:'天王洲财团 / Apëiron',W:'LLNL',Pt:'PASC',Au:'PASC',Hg:'自由佣兵 / LUACL 委托链',Tl:'LUACL / PASC',Pb:'LUACL',Bi:'C.I.N.Q.',Pu:'陵墓 / Juno 系',U:'LLNL / LUACL 受控项目',Nu:'LUACL 受害者'};
 return p.group||map[key]||p.type||'未详';
}
function profileWithEdits(id,p){return {...p,...(DEBUG_EDITS[id]||{})}}

function satellitesFor(symbol){
 const entries=DERIVATIVES[symbol]||[]; if(!entries.length)return '';
 return `<span class="satellites" role="group" aria-label="${esc(ELEMENT_NAMES[symbol])}的衍生个体">${entries.map(d=>`<button class="satellite" type="button" data-profile="der:${esc(symbol)}:${esc(d.code)}"><b>${esc(d.code)}</b><small>${esc(d.name)}</small><em>${esc(d.note)}</em></button>`).join('')}</span>`;
}
function cell(symbol,row,col){
 if(!symbol)return '';
 const z=atomicNumber(symbol),p=CHARACTERS[symbol],duplicate=row>=8&&(symbol==='La'||symbol==='Ac');
 const id=`el:${symbol}`,cls=`element-card ${p?'filled':'vacant'} ${(DERIVATIVES[symbol]||[]).length?'has-satellite':''}`;
 const search=p?`${symbol} ${ELEMENT_NAMES[symbol]} ${p.name} ${p.latin||''} ${p.nativeName||''}`:`${symbol} ${ELEMENT_NAMES[symbol]}`;
 return `<div role="gridcell" tabindex="${p?'0':'-1'}" class="${cls}" style="grid-row:${row};grid-column:${col};--character:${colorFor(id)}" data-profile="${p?id:''}" data-symbol="${symbol}" data-search="${esc(search.toLowerCase())}" ${p?'':'aria-disabled="true"'} title="${esc(ELEMENT_NAMES[symbol])}${p?' · 已建档':' · 尚未观测'}">
  <span class="element-number">${z}</span><span class="element-symbol">${symbol}</span><span class="element-name">${esc(ELEMENT_NAMES[symbol])}${duplicate?'系':''}</span>${p?'<span class="archive-mark">●</span>':''}${satellitesFor(symbol)}
 </div>`;
}
function renderTable(){table.innerHTML=ROWS.map((r,ri)=>r.map((s,ci)=>cell(s,ri+1,ci+1)).join('')).join('');applyFilter()}
function renderSpecial(){
 specialStrip.innerHTML=Object.entries(SPECIAL).map(([key,x])=>`<button type="button" class="special-card" data-profile="special:${key}" data-search="${esc((key+' '+x.name+' '+x.character.name).toLowerCase())}" style="--character:${colorFor(key)}"><span class="element-number">${x.z}</span><strong>${key}</strong><span>${esc(x.name)}</span><small>${key==='Nu'?'中子特殊序列':'126号扩展序列'}</small></button>`).join('')
}
function renderOffGrid(){
 offGrid.innerHTML=OFF_GRID.map(p=>`<button class="off-card ${p.affinity||''}" type="button" data-profile="off:${p.code}" data-search="${esc((p.code+' '+p.name+' '+(p.latin||'')).toLowerCase())}" style="--character:${colorFor(p.code)}"><span class="off-code">${p.code}</span><h3>${esc(p.name)}</h3><p>${esc(p.type)}<br>${esc(p.latin)}</p></button>`).join('');applyFilter()
}

const REGISTRY=new Map();
function rebuildRegistry(){
 REGISTRY.clear();
 Object.entries(CHARACTERS).forEach(([s,p])=>REGISTRY.set(`el:${s}`,{id:`el:${s}`,p,meta:{z:atomicNumber(s),symbol:s,element:ELEMENT_NAMES[s],kind:'element'}}));
 Object.entries(SPECIAL).forEach(([s,x])=>REGISTRY.set(`special:${s}`,{id:`special:${s}`,p:x.character,meta:{z:x.z,symbol:s,element:x.name,kind:'special'}}));
 OFF_GRID.forEach(p=>REGISTRY.set(`off:${p.code}`,{id:`off:${p.code}`,p,meta:{code:p.code,type:p.type,kind:'off'}}));
 Object.entries(DERIVATIVES).forEach(([s,list])=>list.forEach(d=>{if(d.profile)REGISTRY.set(`der:${s}:${d.code}`,{id:`der:${s}:${d.code}`,p:d.profile,meta:{code:d.code,type:d.note,kind:'derivative'}});else if(d.target)REGISTRY.set(`der:${s}:${d.code}`,{redirect:`el:${d.target}`});else if(d.targetOff)REGISTRY.set(`der:${s}:${d.code}`,{redirect:`off:${d.targetOff}`})}));
}
function openById(id){const item=REGISTRY.get(id);if(!item)return showToast('该人物尚未建立可跳转档案');if(item.redirect)return openById(item.redirect);openProfile(id,item.p,item.meta)}

function electronDiagram(symbol,z){
 if(symbol==='Nu')return `<div class="atom true-atom neutron"><span class="nucleus">4n</span></div><div class="shell-counts">中子结构 · 无电子层</div>`;
 const shells=ELECTRON_SHELLS[symbol];
 if(!shells)return `<div class="atom true-atom unknown"><span class="nucleus">+${z}</span><b>?</b></div><div class="shell-counts">理论元素 · 电子层未定</div>`;
 const maxR=140,minR=shells.length===1?70:42,step=shells.length===1?0:(maxR-minR)/(shells.length-1);
 let html=`<div class="atom true-atom" aria-label="${esc(symbol)}电子层结构，${shells.join('、')}"><span class="nucleus">+${z}</span>`;
 shells.forEach((count,i)=>{const r=Math.round(minR+i*step),size=r*2;html+=`<span class="shell" style="width:${size}px;height:${size}px"></span>`;for(let e=0;e<count;e++){const a=Math.round(360*e/count-90);html+=`<i class="electron" style="--angle:${a}deg;--counter:${-a}deg;--radius:${r}px"><b></b></i>`}});
 return html+`</div><div class="shell-counts">电子层：${shells.join(' · ')} <span>（共 ${shells.reduce((a,b)=>a+b,0)} e⁻）</span></div>`;
}
function mediaPanel(p,meta){
 const atom=meta.z!==undefined?`<div class="atom-panel">${electronDiagram(meta.symbol,meta.z)}</div>`:'';
 const image=p.image?`<figure class="character-image"><img src="${esc(p.image)}" alt="${esc(p.name)}角色图"></figure>`:'';
 return `<div class="media-panel ${p.image?'with-image':'atom-only'}">${image}${atom||`<div class="placeholder"><span>${esc(meta.code||'∅')}</span></div>`}</div>`;
}
function editAttr(field){return debugMode?`contenteditable="true" spellcheck="false" data-edit-field="${field}"`:''}
function nameBlock(p){
 const native=p.nativeName||p.latin||'',english=p.englishName||((p.nativeName&&p.latin)?p.latin:'');
 return `<div class="name-stack"><h2 ${editAttr('name')}>${esc(p.name)}</h2>${native?`<div class="native-name" ${editAttr('nativeName')}>${esc(native)}</div>`:''}${english?`<div class="english-name" ${editAttr('englishName')}>${esc(english)}</div>`:''}</div>`;
}
function findRelationTarget(label){for(const [name,id] of Object.entries(RELATION_TARGETS))if(label.includes(name))return {name,id};return null}
function relationHTML(rel){
 const text=typeof rel==='string'?rel:rel.description||'',explicit=typeof rel==='object'?rel.target:null;
 const sep=Math.max(text.indexOf('：'),text.indexOf(':')),label=sep>=0?text.slice(0,sep):text,desc=sep>=0?text.slice(sep+1):'';
 const hit=explicit?{name:label,id:explicit}:findRelationTarget(label);
 return `<li>${hit?`<button type="button" class="person-link" data-profile="${esc(hit.id)}">${esc(label)}</button>`:`<b>${esc(label)}</b>`}${desc?`<span>${esc(desc)}</span>`:''}</li>`
}
function infoRow(label,value,field){return `<tr><th>${label}</th><td ${field?editAttr(field):''}>${esc(value||'未详')}</td></tr>`}
function profileHTML(id,raw,meta){
 const p=profileWithEdits(id,raw),isElement=meta.z!==undefined,color=p.color||colorFor(id),code=(PROFILE_META[meta.symbol]||{}).code||meta.code||meta.symbol||'—';
 const relations=(p.relations||[]).length?`<ul>${p.relations.map(relationHTML).join('')}</ul>`:'<p class="empty-line">暂无明确关系记录</p>';
 const briefText=isElement?(meta.kind==='special'?(meta.symbol==='Nu'?'零号特殊序列：以中子与四中子设定为核心。':'126号扩展元素：稳定岛之外的理论观测位。'):brief(meta.z,meta.symbol)):'';
 return `<article class="profile-layout" data-profile-id="${esc(id)}" style="--character:${color}">
  <section class="profile-main"><div class="profile-kicker">${isElement?`ELEMENT ${meta.z} · ${esc(meta.symbol)} / ${esc(meta.element)}`:`OFF-TABLE · ${esc(meta.code)}`}</div>${nameBlock(p)}
   ${briefText?`<div class="element-brief">${esc(briefText)}</div>`:''}
   <div class="bio"><h3>人物简介</h3><p ${editAttr('bio')}>${esc(p.bio)}</p></div>
   <div class="relations"><h3>人物关系</h3>${relations}</div>
  </section>
  <aside class="infobox"><div class="infobox-title"><b>${esc(code)}</b><span>${esc(p.name)}</span></div>${mediaPanel(p,meta)}
   <table><tbody>${infoRow('代表色',color)}<tr class="color-row"><th>色样</th><td><span class="color-chip" style="background:${color}"></span><code>${esc(color)}</code>${debugMode?`<input type="color" data-color-edit value="${esc(color)}">`:''}</td></tr>${infoRow('性别',p.gender,'gender')}${infoRow('年龄',p.age,'age')}${infoRow('出身地',p.origin,'origin')}${infoRow('所属团体',groupFor(id,p),'group')}${infoRow('身份 / 定位',p.role||p.type,'role')}</tbody></table>
  </aside></article>`;
}
function applySmartTheme(p){if(themeSelect.value==='smart')document.body.dataset.theme=p.affinity||'acs'}
function openProfile(id,p,meta){applySmartTheme(p);const data=profileWithEdits(id,p);dialog.style.setProperty('--profile-accent',useCharacterColor?(data.color||colorFor(id)):'var(--accent)');content.innerHTML=profileHTML(id,p,meta);if(!dialog.open)dialog.showModal();dialog.scrollTop=0}

function nationality(p){const o=p.origin||'';if(/爱伊忒拿|陵墓/.test(o))return'爱伊忒拿 / 陵墓';if(/中国|南京|武汉|青岛|天津|上海|合肥|厦门|苏州|郑州|哈尔滨|西安|太原|佛山/.test(o))return'中国';if(/日本|东京|青森|和歌山/.test(o))return'日本';if(/美国|阿卡迪亚|加拿大|巴西|阿根廷|拉普拉塔/.test(o))return'美洲';if(/法国|英国|西班牙|比利时|荷兰|奥地利|芬兰|希腊|俄罗斯|苏联|丹麦/.test(o))return'欧洲';if(/高丽|朝鲜/.test(o))return'高丽';return'其他 / 未详'}
function ageBand(p){const a=p.age||'';const n=parseInt((a.match(/\d+/)||[])[0]);if(!n)return'未详';if(n<16)return'15岁及以下';if(n<=19)return'16–19岁';if(n<=29)return'20–29岁';return'30岁及以上'}
function genderBand(p){const g=p.gender||'';if(/女/.test(g)&&!/男\s*\//.test(g))return'女';if(/男/.test(g)&&!/女/.test(g))return'男';if(/无|中性|不详|存疑|形态/.test(g))return'其他 / 未详';return'其他 / 未详'}
const FILTER_COLORS={gender:{'女':'#E85D9E','男':'#3F7EDB','其他 / 未详':'#8B8E98'},nation:{'中国':'#D94A45','日本':'#D879A0','欧洲':'#3767A6','美洲':'#3C9A65','高丽':'#6A78C7','爱伊忒拿 / 陵墓':'#29AEB0','其他 / 未详':'#858B95'},age:{'15岁及以下':'#7EC8E3','16–19岁':'#59A96A','20–29岁':'#E8B34F','30岁及以上':'#C66A55','未详':'#8B8E98'}};
function datumForNode(el){const id=el.dataset.profile;if(!id)return null;const item=REGISTRY.get(id);if(!item||item.redirect)return null;return profileWithEdits(id,item.p)}
function applyFilter(){
 if(!filterSelect)return;const mode=filterSelect.value,palette=FILTER_COLORS[mode]||{};
 document.body.dataset.filter=mode;
 document.querySelectorAll('[data-profile].element-card,[data-profile].off-card,.special-card').forEach(el=>{const p=datumForNode(el);if(!p)return;const cat=mode==='gender'?genderBand(p):mode==='nation'?nationality(p):mode==='age'?ageBand(p):'';el.style.setProperty('--filter-color',palette[cat]||'transparent');el.dataset.category=cat});
 if(mode==='off')legend.innerHTML='<span><i class="dot active"></i>已有档案</span><span><i class="dot vacant"></i>未观测</span><span><i class="dot special"></i>特殊序号</span><span>悬停带有 <b>＋</b> 的格子可展开关联个体</span>';
 else legend.innerHTML=Object.entries(palette).map(([k,c])=>`<span><i class="dot" style="background:${c}"></i>${esc(k)}</span>`).join('');
}

document.addEventListener('click',e=>{
 const link=e.target.closest('[data-profile]');if(link&&link.dataset.profile){e.preventDefault();return openById(link.dataset.profile)}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.element-card[data-profile]')){e.preventDefault();openById(e.target.dataset.profile)}});
document.addEventListener('pointerover',e=>{const cell=e.target.closest('.has-satellite');if(!cell)return;clearTimeout(cell._satelliteTimer);cell.classList.add('satellite-open')});
document.addEventListener('pointerout',e=>{const cell=e.target.closest('.has-satellite');if(!cell||cell.contains(e.relatedTarget))return;cell._satelliteTimer=setTimeout(()=>cell.classList.remove('satellite-open'),360)});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

document.addEventListener('input',e=>{
 if(!debugMode)return;const article=e.target.closest('[data-profile-id]');if(!article)return;const id=article.dataset.profileId;
 if(e.target.dataset.editField){DEBUG_EDITS[id]??={};DEBUG_EDITS[id][e.target.dataset.editField]=e.target.textContent.trim()}
 if(e.target.dataset.colorEdit!==undefined){DEBUG_EDITS[id]??={};DEBUG_EDITS[id].color=e.target.value;dialog.style.setProperty('--profile-accent',e.target.value)}
 localStorage.setItem('stellalogue-edits',JSON.stringify(DEBUG_EDITS));
});
$('#debug-toggle').addEventListener('click',()=>{if(debugMode)return;const pw=prompt('请输入调试模式密码');if(pw!=='9192631770')return showToast('密码错误');debugMode=true;debugBar.hidden=false;showToast('调试模式已开启');if(dialog.open){const id=content.querySelector('[data-profile-id]')?.dataset.profileId;dialog.close();if(id)openById(id)}});
$('#exit-debug').addEventListener('click',()=>{debugMode=false;debugBar.hidden=true;showToast('已退出调试模式')});
$('#export-edits').addEventListener('click',()=>{const js=`const CHARACTER_OVERRIDES = ${JSON.stringify(DEBUG_EDITS,null,2)};\n`;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([js],{type:'text/javascript;charset=utf-8'}));a.download='character-overrides.js';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
themeSelect.addEventListener('change',()=>{if(themeSelect.value!=='smart')document.body.dataset.theme=themeSelect.value;else{document.body.dataset.theme='acs';showToast('打开人物卡时自动匹配主题')}});
filterSelect.addEventListener('change',applyFilter);
modeToggle.addEventListener('click',()=>{document.body.dataset.mode=document.body.dataset.mode==='dark'?'light':'dark';localStorage.setItem('stellalogue-mode',document.body.dataset.mode)});
colorToggle.addEventListener('click',()=>{useCharacterColor=!useCharacterColor;colorToggle.classList.toggle('active',useCharacterColor);colorToggle.setAttribute('aria-pressed',String(useCharacterColor));document.body.classList.toggle('character-colors-off',!useCharacterColor);localStorage.setItem('stellalogue-character-colors',useCharacterColor?'on':'off');showToast(useCharacterColor?'已启用人物代表色':'已使用主题默认色')});
function showToast(t){toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1700)}
$('#search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('[data-search]').forEach(el=>el.classList.toggle('search-hidden',!!q&&!el.dataset.search.includes(q)))});

const faces=['> <','qwq','(｡•́︿•̀｡)','(⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)','Kjunno～(∠> ▽ < )⌒☆','(｡>﹏<｡)','(ゝ∀･)','(｡•̀ᴗ-)✧','ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧','(・◇・)','٩(๑>◡<๑)۶','φ(ω@ω)φ','˶˃ ᵕ ˂˶','(˶> ~ <˶)','wwwww'];
$('#juno-floaters').innerHTML=faces.map((f,i)=>`<span style="--x:${(i*37)%94}%;--y:${(i*23)%88}%;--r:${(i%5-2)*5}deg;--d:${12+i%7}s">${esc(f)}</span>`).join('');
document.body.dataset.mode=localStorage.getItem('stellalogue-mode')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
document.body.classList.toggle('character-colors-off',!useCharacterColor);colorToggle.classList.toggle('active',useCharacterColor);
rebuildRegistry();renderTable();renderSpecial();renderOffGrid();
$('#record-count').textContent=REGISTRY.size;

