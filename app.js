const $=s=>document.querySelector(s);
const table=$('#periodic-table'),offGrid=$('#off-grid');
const dialog=$('#profile-dialog'),content=$('#profile-content'),themeSelect=$('#theme-select');
const filterSelect=$('#filter-select'),modeToggle=$('#mode-toggle'),colorToggle=$('#color-toggle');
const toast=$('#toast'),legend=$('#legend'),debugBar=$('#debug-bar');
const atomicNumber=s=>ORDER.indexOf(s)+1;
const esc=v=>String(v??'未详').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const DEBUG_EDITS=JSON.parse(localStorage.getItem('stellalogue-edits')||'{}');
let debugMode=false,useCharacterColor=localStorage.getItem('stellalogue-character-colors')!=='off';

function colorFor(id){const key=id.split(':').pop();return COLOR_TABLE[key]||'#708090'}
function colorText(hex){const h=String(hex).replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return'#fff';const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]>.18?'#071522':'#fff'}
function groupFor(id,p){
 const key=id.split(':').pop(),map={H:'LUACL / CUA',He:'演艺事务所 / 独立',Li:'南极航空航天局',Be:'南极航空航天局',B:'南极洲立大学',C:'C.I.N.Q. / 爱伊忒拿',N:'C.I.N.Q. / 爱伊忒拿',O:'天平协定',F:'南洲大附中',Ne:'天平协定（前）',P:'南洲大附中',S:'南洲大附中',Cl:'WUI 赞助项目',Ar:'南洲大附中',Ti:'泛南联邦劳工系统',V:'LUACL / CUA',Cr:'南极航空航天局',Fe:'WUI',Co:'CUA / 阿尔西亚课题组',Ni:'CUA',Ga:'CUA',Ge:'中科大少年班',Se:'PASC',Br:'天平协定',Kr:'南洲大附中',Rb:'C.I.N.Q.',Nb:'未详',Tc:'PASC / LUACL（前）',In:'爱伊忒拿 / Apëiron',Te:'南洲大附中',I:'LUACL',Xe:'CUA',Cs:'天王洲财团 / Apëiron',W:'LLNL',Pt:'PASC',Au:'PASC',Hg:'自由佣兵 / LUACL 委托链',Tl:'LUACL / PASC',Pb:'LUACL',Bi:'C.I.N.Q.',Pu:'陵墓 / Juno 系',U:'LLNL / LUACL 受控项目',Nu:'LUACL 受害者'};
 return p.group||map[key]||'无';
}
function profileWithEdits(id,p){return {...p,...(DEBUG_EDITS[id]||{})}}
function placeholderProfile(symbol){return {name:'未登记元素使',latin:'Unregistered Element User',age:'未详',gender:'未详',origin:'未详',role:`${ELEMENT_NAMES[symbol]}元素使`,bio:'这是一条由调试模式创建的空白档案，可直接填写人物资料。',relations:[],affinity:'acs',group:'无'}}
function activeOffGrid(){return [...OFF_GRID.filter(p=>!DEBUG_EDITS[`off:${p.code}`]?._deleted),...(DEBUG_EDITS._newOffGrid||[]).filter(p=>!DEBUG_EDITS[`off:${p.code}`]?._deleted)]}

function satellitesFor(symbol){
 const entries=DERIVATIVES[symbol]||[]; if(!entries.length)return '';
 return `<span class="satellites" role="group" aria-label="${esc(ELEMENT_NAMES[symbol])}的衍生个体">${entries.map(d=>`<button class="satellite" type="button" data-profile="der:${esc(symbol)}:${esc(d.code)}"><b>${esc(d.code)}</b><small>${esc(d.name)}</small><em>${esc(d.note)}</em></button>`).join('')}</span>`;
}
function cell(symbol,row,col){
 if(!symbol)return '';
 const z=atomicNumber(symbol),base=CHARACTERS[symbol],id=`el:${symbol}`,edited=DEBUG_EDITS[id],p=edited?._deleted?null:(base||((edited&&!edited._deleted)?placeholderProfile(symbol):null)),available=!!p,duplicate=row>=9&&(symbol==='La'||symbol==='Ac');
 const interactive=available||debugMode,cls=`element-card ${available?'filled':'vacant'} ${debugMode&&!available?'debug-vacant':''} ${(DERIVATIVES[symbol]||[]).length?'has-satellite':''}`;
 const search=available?`${symbol} ${ELEMENT_NAMES[symbol]} ${p.name} ${p.latin||''} ${p.nativeName||''}`:`${symbol} ${ELEMENT_NAMES[symbol]}`;
 return `<div role="gridcell" tabindex="${interactive?'0':'-1'}" class="${cls}" style="grid-row:${row};grid-column:${col};--character:${colorFor(id)}" data-profile="${interactive?id:''}" data-symbol="${symbol}" data-search="${esc(search.toLowerCase())}" ${interactive?'':'aria-disabled="true"'} title="${esc(ELEMENT_NAMES[symbol])}${available?' · 已建档':debugMode?' · 点击新建档案':' · 尚未观测'}">
  <span class="element-number">${z}</span><span class="element-symbol">${symbol}</span><span class="element-name">${esc(ELEMENT_NAMES[symbol])}${duplicate?'系':''}</span>${p?'<span class="archive-mark">●</span>':''}${satellitesFor(symbol)}
 </div>`;
}
function renderTable(){table.innerHTML=ROWS.map((r,ri)=>r.map((s,ci)=>cell(s,ri+2,ci+1)).join('')).join('');renderSpecial();applyFilter()}
function renderSpecial(){
 table.insertAdjacentHTML('beforeend',Object.entries(SPECIAL).map(([key,x])=>`<button type="button" class="special-card grid-special ${key.toLowerCase()}" data-profile="special:${key}" data-search="${esc((key+' '+x.name+' '+x.character.name).toLowerCase())}" style="--character:${colorFor(key)};grid-row:${key==='Nu'?1:10};grid-column:${key==='Nu'?18:1}"><span class="element-number">${x.z}</span><strong>${key}</strong><span>${esc(x.name)}</span><small>${key==='Nu'?'中子特殊序列':'理论扩展序列'}</small></button>`).join(''))
}
function renderOffGrid(){
 offGrid.innerHTML=activeOffGrid().map(p=>`<button class="off-card ${p.affinity||''}" type="button" data-profile="off:${p.code}" data-search="${esc((p.code+' '+p.name+' '+(p.latin||'')).toLowerCase())}" style="--character:${colorFor(p.code)}"><span class="off-code">${esc(p.code)}</span><h3>${esc(p.name)}</h3><p>${esc(p.type||'表外个体')}<br>${esc(p.latin)}</p></button>`).join('');applyFilter()
}

const REGISTRY=new Map();
function rebuildRegistry(){
 REGISTRY.clear();
 ORDER.forEach(s=>{const id=`el:${s}`,edit=DEBUG_EDITS[id],p=CHARACTERS[s]||((edit&&!edit._deleted)?placeholderProfile(s):null);if(p&&!(edit&&edit._deleted))REGISTRY.set(id,{id,p,meta:{z:atomicNumber(s),symbol:s,element:ELEMENT_NAMES[s],kind:'element'}});else if(debugMode)REGISTRY.set(id,{id,p:placeholderProfile(s),meta:{z:atomicNumber(s),symbol:s,element:ELEMENT_NAMES[s],kind:'element'}})});
 Object.entries(SPECIAL).forEach(([s,x])=>REGISTRY.set(`special:${s}`,{id:`special:${s}`,p:x.character,meta:{z:x.z,symbol:s,element:x.name,kind:'special'}}));
 activeOffGrid().forEach(p=>REGISTRY.set(`off:${p.code}`,{id:`off:${p.code}`,p,meta:{code:p.code,type:p.type,kind:'off'}}));
 Object.entries(DERIVATIVES).forEach(([s,list])=>list.forEach(d=>{if(d.profile)REGISTRY.set(`der:${s}:${d.code}`,{id:`der:${s}:${d.code}`,p:d.profile,meta:{code:d.code,type:d.note,kind:'derivative'}});else if(d.target)REGISTRY.set(`der:${s}:${d.code}`,{redirect:`el:${d.target}`});else if(d.targetOff)REGISTRY.set(`der:${s}:${d.code}`,{redirect:`off:${d.targetOff}`})}));
 $('#record-count').textContent=REGISTRY.size;
}
function openById(id){const item=REGISTRY.get(id);if(!item)return showToast('该人物尚未建立可跳转档案');if(item.redirect)return openById(item.redirect);openProfile(id,item.p,item.meta)}

function electronDiagram(symbol,z){
 if(symbol==='Nu')return `<div class="atom true-atom neutron"><span class="nucleus">4n</span></div><div class="shell-counts">中子结构 · 无电子层</div>`;
 const shells=symbol==='Mz'?[2,8,18,32,34,20,9,3]:ELECTRON_SHELLS[symbol];
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
function findRelationTarget(label){for(const [name,id] of Object.entries(RELATION_TARGETS))if(label.includes(name))return {name,id};for(const [id,item] of REGISTRY){if(item.redirect||!item.p)continue;const names=[item.p.name,item.p.nativeName,item.p.latin,item.p.englishName].filter(Boolean);if(names.some(name=>label.includes(name)||name.includes(label)))return{name:label,id}}return null}
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
 const briefText=isElement?(meta.symbol==='Nu'?'中子不带电，是原子核的重要组成部分；自由中子用于散射成像、材料分析和核反应研究。':brief(meta.z,meta.symbol)):'';
 return `<article class="profile-layout" data-profile-id="${esc(id)}" style="--character:${color};--profile-on-accent:${colorText(color)}">
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
function openProfile(id,p,meta){applySmartTheme(p);const data=profileWithEdits(id,p),accent=useCharacterColor?(data.color||colorFor(id)):'var(--accent)';dialog.style.setProperty('--profile-accent',accent);dialog.style.setProperty('--profile-on-accent',useCharacterColor?colorText(data.color||colorFor(id)):'var(--on-accent)');content.innerHTML=profileHTML(id,p,meta);if(!dialog.open)dialog.showModal();dialog.scrollTop=0}

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
$('#debug-toggle').addEventListener('click',()=>{if(debugMode)return;const pw=prompt('请输入调试模式密码');if(pw!=='9192631770')return showToast('密码错误');debugMode=true;debugBar.hidden=false;rebuildRegistry();renderTable();renderOffGrid();showToast('调试模式已开启；空白元素现可编辑');if(dialog.open){const id=content.querySelector('[data-profile-id]')?.dataset.profileId;dialog.close();if(id)openById(id)}});
$('#add-off-grid').addEventListener('click',()=>{if(!debugMode)return;const code=(prompt('输入双字母代号（全大写）')||'').trim().toUpperCase();if(!/^[A-Z]{2}$/.test(code))return showToast('代号必须是两个大写字母');if(REGISTRY.has(`off:${code}`))return showToast('该代号已存在');const name=(prompt('输入人物姓名')||'').trim();if(!name)return showToast('姓名不能为空');DEBUG_EDITS._newOffGrid??=[];DEBUG_EDITS._newOffGrid.push({code,name,latin:'',type:'表外个体',gender:'未详',age:'未详',origin:'未详',group:'无',bio:'新建档案，待补充。',relations:[],affinity:'acs'});localStorage.setItem('stellalogue-edits',JSON.stringify(DEBUG_EDITS));rebuildRegistry();renderOffGrid();openById(`off:${code}`)});
$('#delete-entry').addEventListener('click',()=>{if(!debugMode)return;const id=content.querySelector('[data-profile-id]')?.dataset.profileId;if(!id)return showToast('请先打开要删除的条目');if(id.startsWith('special:'))return showToast('特殊序列不能在此删除');if(!confirm(`确认删除当前条目 ${id}？`))return;DEBUG_EDITS[id]={...(DEBUG_EDITS[id]||{}),_deleted:true};if(id.startsWith('off:')&&DEBUG_EDITS._newOffGrid)DEBUG_EDITS._newOffGrid=DEBUG_EDITS._newOffGrid.filter(p=>`off:${p.code}`!==id);localStorage.setItem('stellalogue-edits',JSON.stringify(DEBUG_EDITS));dialog.close();rebuildRegistry();renderTable();renderOffGrid();showToast('条目已标记删除，可在导出文件中复核')});
$('#exit-debug').addEventListener('click',()=>{debugMode=false;debugBar.hidden=true;rebuildRegistry();renderTable();renderOffGrid();showToast('已退出调试模式')});
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
rebuildRegistry();renderTable();renderOffGrid();
$('#record-count').textContent=REGISTRY.size;
