(()=>{
'use strict';
const slides=[...document.querySelectorAll('.slide')], track=document.querySelector('#track'), toc=document.querySelector('#tocDialog'), imageDialog=document.querySelector('#imageDialog');
const pageInput=document.querySelector('#pageInput'),total=slides.length;
let current=0,reading=false,zoom=1,natural=0;
document.querySelector('#total').textContent='/ '+total;pageInput.max=total;
const labels=slides.map(s=>({title:s.dataset.title,chapter:s.dataset.chapter,text:s.textContent}));
function hint(){const body=slides[current].querySelector('.slide-body'),el=slides[current].querySelector('.scroll-hint');if(el&&body)el.hidden=reading||body.scrollHeight<=body.clientHeight+5||body.scrollTop+body.clientHeight>=body.scrollHeight-5;}
function go(n,{hash=true,scroll=true}={}){current=Math.max(0,Math.min(total-1,n));track.style.transform=`translateX(-${current*100}%)`;slides.forEach((s,i)=>{s.inert=!reading&&i!==current;s.setAttribute('aria-hidden',String(!reading&&i!==current));});pageInput.value=current+1;document.querySelector('#chapterLabel').textContent=slides[current].dataset.chapter;document.querySelector('#prev').disabled=current===0;document.querySelector('#next').disabled=current===total-1;document.querySelector('#progressFill').style.width=`${(current+1)/total*100}%`;document.querySelector('#liveStatus').textContent=`第 ${current+1} 页，共 ${total} 页：${slides[current].dataset.title}`;if(hash)history.replaceState(null,'','#'+(current+1));if(reading&&scroll)slides[current].scrollIntoView({behavior:'smooth',block:'start'});hint();}
function hashPage(){const n=parseInt(location.hash.slice(1),10);return Number.isFinite(n)?n-1:0;}
document.querySelector('#prev').onclick=()=>go(current-1);document.querySelector('#next').onclick=()=>go(current+1);
pageInput.addEventListener('change',()=>{const n=parseInt(pageInput.value,10);go(Number.isFinite(n)?n-1:current);});
pageInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const n=parseInt(pageInput.value,10);go(Number.isFinite(n)?n-1:current);pageInput.blur();}});
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go-1));
document.querySelector('#modeButton').onclick=e=>{reading=!reading;document.body.classList.toggle('reading',reading);e.currentTarget.textContent=reading?'返回翻页':'连续阅读';e.currentTarget.setAttribute('aria-pressed',reading);go(current);};
document.querySelector('#fontButton').onclick=e=>{const on=document.body.classList.toggle('large-text');e.currentTarget.textContent=on?'恢复字号':'字大一点';setTimeout(hint,100);};
document.querySelector('#fullButton').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#fullButton').textContent='请使用 F11';}};
const chapters=slides.flatMap((s,i)=>s.classList.contains('divider')?[{page:i+1,title:s.dataset.title,part:s.dataset.part}]:[]);
const practice=chapters.find(c=>c.title.startsWith('八 '));
function tocLink(page,title,className='toc-entry'){
 const a=document.createElement('a'),name=document.createElement('span'),number=document.createElement('small');
 a.href='#'+page;a.className=className;a.dataset.tocPage=page;name.textContent=title;number.textContent='第 '+page+' 页 →';a.append(name,number);
 if(page===current+1)a.setAttribute('aria-current','page');
 a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();toc.close();go(page-1);};return a;
}
function pageList(list,query=''){
 let chapter='';labels.forEach((d,i)=>{if(query&&!d.text.toLowerCase().includes(query)&&!d.title.toLowerCase().includes(query))return;if(chapter!==d.chapter){chapter=d.chapter;const h=document.createElement('h3');h.textContent=chapter;list.append(h);}list.append(tocLink(i+1,d.title,'toc-page'));});
 if(!list.childElementCount)list.textContent='没有找到相关内容。';
}
function renderToc(query=''){
 const list=document.querySelector('#tocList');list.replaceChildren();query=query.trim().toLowerCase();
 if(query){pageList(list,query);return;}
 if(practice)list.append(tocLink(practice.page,'第八部分 · CodeBuddy 动手实践','toc-practice'));
 const quick=document.createElement('div');quick.className='toc-quick';quick.append(tocLink(2,'开场案例'),tocLink(152,'课后资源'));list.append(quick);
 for(const part of ['上半部分','下半部分']){
  const h=document.createElement('h3');h.textContent=part;list.append(h);
  const grid=document.createElement('div');grid.className='toc-grid';
  chapters.filter(c=>c.part===part).forEach(c=>{const title=c.title.replace(/（[上下]半部分）/g,'').replace(/\s+/g,' ').trim();grid.append(tocLink(c.page,title));});list.append(grid);
 }
 const heading=document.createElement('h3');heading.textContent='第八部分 · 动手步骤直达';list.append(heading);
 const steps=document.createElement('div');steps.className='toc-grid toc-steps';
 [[138,'先看成品：今天要做什么'],[140,'准备：安装 CodeBuddy、拿到项目'],[143,'第一轮：读项目、预览并修改标题'],[145,'第二轮：更新标题、增加筛选'],[147,'第三轮：查看保存位置'],[150,'自己验收，再决定是否发布']].forEach(([page,title])=>steps.append(tocLink(page,title)));list.append(steps);
 const all=document.createElement('details'),summary=document.createElement('summary'),pages=document.createElement('div');all.className='toc-all-pages';summary.textContent='查看全部 '+total+' 页';all.append(summary,pages);all.addEventListener('toggle',()=>{if(all.open&&!pages.childElementCount)pageList(pages);});list.append(all);
}
function openToc(){renderToc();document.querySelector('#search').value='';toc.showModal();}
document.querySelector('#tocButton').onclick=openToc;document.querySelectorAll('[data-open-toc]').forEach(b=>b.onclick=openToc);document.querySelector('#search').oninput=e=>renderToc(e.target.value);
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
function sizeImage(){const im=document.querySelector('#zoomImage'),frame=document.querySelector('.image-view');im.style.width=Math.max(200,Math.min(natural,frame.clientWidth-30)*zoom)+'px';document.querySelector('#zoomValue').textContent=Math.round(zoom*100)+'%';}
document.querySelectorAll('[data-image]').forEach(b=>b.onclick=()=>{const im=document.querySelector('#zoomImage');document.querySelector('#imageCaption').textContent=b.dataset.caption;document.querySelector('#originalLink').href=b.dataset.image;im.alt=b.dataset.caption;im.onload=()=>{natural=im.naturalWidth;sizeImage();};im.src=b.dataset.image;zoom=1;imageDialog.showModal();if(im.complete){natural=im.naturalWidth;sizeImage();}});
document.querySelector('#zoomIn').onclick=()=>{zoom=Math.min(zoom+.25,4);sizeImage();};document.querySelector('#zoomOut').onclick=()=>{zoom=Math.max(zoom-.25,.5);sizeImage();};
document.addEventListener('keydown',e=>{if(toc.open||imageDialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(current+1);}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(current-1);}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(total-1);}});
let touch=null;const deck=document.querySelector('#deck');deck.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});deck.addEventListener('touchend',e=>{if(!touch||reading)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));touch=null;},{passive:true});
document.querySelectorAll('.slide-body').forEach(b=>b.addEventListener('scroll',hint,{passive:true}));window.addEventListener('resize',hint);window.addEventListener('hashchange',()=>go(hashPage(),{hash:false}));go(hashPage());
})();
