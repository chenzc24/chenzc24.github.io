'use strict';
(() => {
  const canvas=document.querySelector('#field'),ctx=canvas.getContext('2d',{alpha:false});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let lang=Site.language,userPaused=false;
  try{userPaused=localStorage.getItem('zc-motion')==='paused';}catch{}
  let paused=userPaused||reduced.matches,visible=!document.hidden,inView=true;
  const lines=84,points=169,total=lines*points*3;
  const built=window.FieldShapes.build(lines,points),order=[4,1,3,6,2,9,0,7,5,8];
  // A fresh order on every visit (Fisher–Yates), so the page does not always open on the same form.
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  // Caption per form, keyed like order: a name, and the relation or construction the module draws.
  const forms={
    4:{name:['莫比乌斯带','Möbius strip'],note:'r(0, v) = r(2π, −v)'},
    1:{name:['谢尔宾斯基四面体','Sierpiński tetrahedron'],note:'D = log 4 / log 2 = 2'},
    3:{name:['双源干涉','Two-source interference'],note:'z = 0.12(cos 13d<sub>1</sub> + cos 13d<sub>2</sub>)'},
    6:{name:['Calabi–Yau 截面','Calabi–Yau slice'],note:'z<sub>1</sub><sup>5</sup> + z<sub>2</sub><sup>5</sup> = 1'},
    2:{name:['Burgers 涡','Burgers vortex'],note:'u<sub>θ</sub> = Γ(1 − e<sup>−γr²/2ν</sup>) / 2πr'},
    9:{name:['洛伦兹吸引子','Lorenz attractor'],note:'σ = 10, ρ = 28, β = 8/3'},
    0:{name:['环形走线','Ring traces'],note:['4 × 21 条 45° 折角走线','4 × 21 traces with 45° jogs']},
    7:{name:['扭转经线','Twisted meridians'],note:'λ = v + 0.22 sin 3φ'},
    5:{name:['双螺旋','Double helix'],note:['两条带相差半圈','two ribbons, half a turn apart']},
    8:{name:['三叶结','Trefoil knot'],note:['(2, 3) 环面纽结','(2, 3) torus knot']}
  };
  const caption=document.querySelector('.art-caption');
  // Highlights use the site accent; the canvas resolves any CSS colour to #rrggbb.
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#2f6b60';
  const accent=[1,3,5].map(i=>parseInt(ctx.fillStyle.slice(i,i+2),16)).join(',');
  // The canvas ground, and the ink of the surface model by depth cue (index = cue × 20).
  const paper='#f3f4f2',inks=Array.from({length:22},(_,i)=>`rgba(32,38,44,${(.34*i/20).toFixed(3)})`);
  const scientific=[...window.CalabiFractalForms.create(lines,points),window.FluidForm.create(lines,points),window.LorenzForm.create(lines,points)];
  const segmentBreaks=scientific.find(form=>form.index===6).breaks;
  const surfaces=new Map(scientific.filter(form=>form.surface).map(form=>[form.index,form.surface]));
  for(const surface of surfaces.values()){surface.projected=new Float32Array(surface.vertices.length);surface.camera=new Float32Array(surface.vertices.length);surface.depth=new Float32Array(surface.faces.length);surface.sorted=surface.faces.map((_,i)=>i);}
  const updates=new Map();
  for(const form of scientific){built.shapes[form.index]=form.data;built.styles[form.index]={...form.style,warp:0,flow:form.index===2?1:0,cuts:form.breaks?1:0};if(form.update)updates.set(form.index,form.update);}
  const formSizes={0:.88,1:.92,3:.84};
  built.styles=built.styles.map((s,i)=>({warp:.022,flow:0,trace:0,seam:0,cuts:0,size:formSizes[i]||1,roll:-.29,yaw:-.25,turn:1,...s}));
  const styleKeys=['dots','tilt','lineAlpha','warp','flow','trace','seam','cuts','size','roll','yaw','turn'];
  const shapes=order.map(i=>built.shapes[i]),styles=order.map(i=>built.styles[i]);
  const sequence=document.querySelector('.sequence');
  sequence.innerHTML=shapes.map((_,i)=>`<button data-form="${i}" aria-pressed="${i===0}"><span aria-hidden="true"></span></button>`).join('');
  const buttons=[...sequence.querySelectorAll('button')];
  const current=new Float32Array(shapes[0]),origin=new Float32Array(current),screen=new Float32Array(lines*points*2);
  const echoes=[3,6].map(offset=>({offset,current:new Float32Array(shapes[offset]),origin:new Float32Array(shapes[offset]),style:{...styles[offset]},originStyle:{...styles[offset]}}));
  const pointer={x:0,y:0,tx:0,ty:0},waves=[];
  const TAU=Math.PI*2,cycleDuration=10.8,morphDuration=3.2;
  let active=0,previousActive=0,transition=1,cycleAge=0,clock=0,last=0,raf=0,w=0,h=0,baseScale=0,captioned=0;
  let style={...styles[0]},originStyle={...style},mainPose=null;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);

  function labels(){
    lang=Site.language;
    sequence.setAttribute('aria-label',lang==='zh'?'形态':'Forms');
    buttons.forEach((button,i)=>{button.setAttribute('aria-label',(lang==='zh'?`形态 ${i+1}：`:`Form ${i+1}: `)+Site.t(...forms[order[i]].name));button.setAttribute('aria-pressed',String(i===active));});
    const form=forms[order[active]],note=Array.isArray(form.note)?Site.escape(Site.t(...form.note)):form.note,changed=captioned!==active;
    // The caption fades in only when the form changes, not on a language switch or pause.
    captioned=active;caption.classList.remove('is-changing');
    caption.innerHTML=`<span class="art-count"><b>${String(active+1).padStart(2,'0')}</b> / ${shapes.length}</span> <span class="art-name">${Site.t(...form.name)}</span> <span class="art-note">${note}</span>`;
    if(changed){void caption.offsetWidth;caption.classList.add('is-changing');}
    document.querySelector('#next-form').setAttribute('aria-label',lang==='zh'?'下一形态':'Next form');
    canvas.setAttribute('aria-label',lang==='zh'?'互动图形':'Interactive form');
    const motion=document.querySelector('#motion');
    motion.setAttribute('aria-label',paused?(lang==='zh'?'播放动画':'Play animation'):(lang==='zh'?'暂停动画':'Pause animation'));
    motion.setAttribute('aria-pressed',String(paused));
    motion.innerHTML=paused?'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 7 5-7 5Z" fill="currentColor"/></svg>':'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="1.5"/></svg>';
    canvas.dataset.form=String(active+1);canvas.dataset.motion=paused?'paused':'running';
    buttons[active].style.setProperty('--progress',Math.max(.08,cycleAge/cycleDuration));
  }

  function choose(n){
    n=(n+shapes.length)%shapes.length;cycleAge=0;
    if(n===active){labels();draw();return;}
    origin.set(current);originStyle={...style};echoes.forEach(e=>{e.origin.set(e.current);e.originStyle={...e.style};});previousActive=active;active=n;transition=paused?1:0;
    labels();draw();start();
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    baseScale=Math.min(w*.46,h*.43);draw();
  }
  function disturb(x,y){
    canvas.dataset.interactions=String(Number(canvas.dataset.interactions||0)+1);
    if(paused){clock+=1.7;pointer.x=(x-w/2)/w;pointer.y=(y-h/2)/h;draw();return;}
    let path=0,distance=Infinity;
    for(let i=0;i<lines;i+=(w<600?2:1))for(let j=0;j<points;j+=7){const k=(i*points+j)*2,d=(screen[k]-x)**2+(screen[k+1]-y)**2;if(d<distance){path=i;distance=d;}}
    waves.push({x,y,born:clock,path,form:active});if(waves.length>5)waves.shift();start();
  }

  function renderShape(data,pose,paint,stride,interactive=false){
    const sx=Math.sin(pose.rx),cx=Math.cos(pose.rx),sy=Math.sin(pose.ry),cy=Math.cos(pose.ry),sz=Math.sin(pose.rz),cz=Math.cos(pose.rz);
    const dots=paint.dots,alpha=paint.lineAlpha*pose.opacity;
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.lineWidth=interactive?.62:.5;
    for(let i=0;i<lines;i++){
      // Keep both sides of the Möbius identification when reducing detail.
      if(i%stride!==0&&!(paint.seam>.5&&(lines-1-i)%stride===0))continue;
      let depth=0;
      for(let q=0;q<5;q++){const k=(i*points+Math.round(q*(points-1)/4))*3;depth+=-data[k]*sy+(data[k+1]*sx+data[k+2]*cx)*cy;}
      const depthAlpha=Math.max(.57,Math.min(1.05,.84+depth/5*.23));
      let previousPoint=-1;
      ctx.beginPath();ctx.strokeStyle=`rgba(32,38,44,${alpha*(1-dots)*depthAlpha})`;
      for(let j=0;j<points;j++){
        if(!interactive&&j%2!==0&&j!==points-1)continue;
        const k=(i*points+j)*3;
        let x=data[k],y=data[k+1],z=data[k+2];
        z+=paint.warp*Math.sin(x*4.1+clock*.7)*Math.cos(y*3.5-clock*.35);
        const y1=y*cx-z*sx,z1=y*sx+z*cx,x2=x*cy+z1*sy,z2=-x*sy+z1*cy,perspective=3.8/(3.8-z2*.24);
        let px=pose.x+(x2*cz-y1*sz)*pose.scale*perspective,py=pose.y+(x2*sz+y1*cz)*pose.scale*perspective;
        for(const wave of waves){
          const age=clock-wave.born,d=Math.hypot(px-wave.x,py-wave.y);
          if(dots>.75){const pull=Math.exp(-d*d/(baseScale*baseScale*.45))*Math.sin(Math.min(1,age/3.6)*Math.PI)*.31;px+=(wave.x-px)*pull;py+=(wave.y-py)*pull;}
          else{const front=age*180,env=Math.exp(-Math.pow((d-front)/72,2))*Math.max(0,1-age/3.6),push=Math.sin((d-front)*.036)*env*(interactive?27:13);if(d>.1){px+=(px-wave.x)/d*push;py+=(py-wave.y)/d*push;}}
        }
        if(interactive){const sk=(i*points+j)*2;screen[sk]=px;screen[sk+1]=py;}
        if(dots>.001&&j%3===0&&i%2===0){ctx.fillStyle=`rgba(32,38,44,${(.38+(z2+1)*.13)*dots*pose.opacity})`;ctx.fillRect(px,py,interactive?1.25:.75,interactive?1.25:.75);}
        let penUp=j===0;
        if(paint.cuts>.5&&segmentBreaks){for(let q=previousPoint+1;q<=j;q++)if(segmentBreaks[i*points+q]){penUp=true;break;}}
        if(penUp)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        previousPoint=j;
      }
      if(dots<.999)ctx.stroke();
      if(interactive&&(paint.flow>.01||(paint.trace>.01&&i%12===0))){
        const head=Math.floor(((clock*.085+i*.61803398875)%1)*(points-1)),tail=Math.max(0,head-12);
        ctx.beginPath();ctx.strokeStyle=`rgba(${accent},${(paint.flow*.32+paint.trace*.65)*depthAlpha*pose.opacity})`;ctx.lineWidth=.85;
        for(let j=tail;j<=head;j++){const k=(i*points+j)*2;if(j===tail)ctx.moveTo(screen[k],screen[k+1]);else ctx.lineTo(screen[k],screen[k+1]);}ctx.stroke();ctx.lineWidth=.62;
      }
    }
  }

  function renderSurface(surface,pose,opacity){
    const data=surface.vertices,projected=surface.projected,camera=surface.camera;
    const sx=Math.sin(pose.rx),cx=Math.cos(pose.rx),sy=Math.sin(pose.ry),cy=Math.cos(pose.ry),sz=Math.sin(pose.rz),cz=Math.cos(pose.rz);
    for(let k=0;k<data.length;k+=3){
      const x=data[k],y=data[k+1],z=data[k+2],y1=y*cx-z*sx,z1=y*sx+z*cx,x2=x*cy+z1*sy,z2=-x*sy+z1*cy;
      camera[k]=x2*cz-y1*sz;camera[k+1]=x2*sz+y1*cz;camera[k+2]=z2;
      const perspective=3.8/(3.8-z2*.24);
      let px=pose.x+camera[k]*pose.scale*perspective,py=pose.y+camera[k+1]*pose.scale*perspective;
      for(const wave of waves){const age=clock-wave.born,d=Math.hypot(px-wave.x,py-wave.y),front=age*180,env=Math.exp(-Math.pow((d-front)/72,2))*Math.max(0,1-age/3.6),push=Math.sin((d-front)*.036)*env*18;if(d>.1){px+=(px-wave.x)/d*push;py+=(py-wave.y)/d*push;}}
      projected[k]=px;projected[k+1]=py;projected[k+2]=z2;
    }
    surface.faces.forEach((face,i)=>{surface.depth[i]=(camera[face[0]*3+2]+camera[face[1]*3+2]+camera[face[2]*3+2]+camera[face[3]*3+2])*.25;});
    surface.sorted.sort((a,b)=>surface.depth[a]-surface.depth[b]);
    // Hidden-line drawing in the ink of the line forms: faces are painted back to front in paper, so nearer
    // sheets hide what lies behind them, and only the edges along the scans (constant b) are inked.
    const at=(vertex,move)=>{const k=vertex*3;if(move)ctx.moveTo(projected[k],projected[k+1]);else ctx.lineTo(projected[k],projected[k+1]);};
    ctx.globalAlpha=opacity*pose.opacity;ctx.lineWidth=.6;ctx.lineJoin=ctx.lineCap='round';ctx.fillStyle=paper;
    for(const index of surface.sorted){
      const [a,b,c,d]=surface.faces[index],inked=surface.inked?.[index]??3;
      ctx.beginPath();at(a,1);at(b);at(c);at(d);ctx.closePath();ctx.fill();
      if(!inked)continue;
      // Nearer faces are inked darker, with the depth cue of the line forms. Bit 1 inks edge a–b, bit 2 edge d–c.
      ctx.strokeStyle=inks[Math.round(Math.max(.57,Math.min(1.05,.84+surface.depth[index]*.23))*20)];
      ctx.beginPath();if(inked&1){at(a,1);at(b);}if(inked&2){at(d,1);at(c);}ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  function draw(){
    if(!w)return;ctx.fillStyle=paper;ctx.fillRect(0,0,w+1,h+1);
    for(const index of new Set([active,...echoes.map(e=>(active+e.offset)%shapes.length)])){const update=updates.get(order[index]);if(update)update(shapes[index],clock);}
    const t=smooth(transition);
    if(transition<1){for(let k=0;k<total;k++)current[k]=lerp(origin[k],shapes[active][k],t);}else current.set(shapes[active]);
    for(const key of styleKeys)style[key]=lerp(originStyle[key],styles[active][key],t);
    echoes.forEach((echo,i)=>{const target=(active+echo.offset)%shapes.length,et=smooth(Math.max(0,Math.min(1,(transition-.12-i*.13)/(.88-i*.13))));if(et<1){for(let k=0;k<total;k++)echo.current[k]=lerp(echo.origin[k],shapes[target][k],et);}else echo.current.set(shapes[target]);for(const key of styleKeys)echo.style[key]=lerp(echo.originStyle[key],styles[target][key],et);echo.fade=1-.58*Math.sin(Math.PI*et)**2;});
    for(let i=waves.length-1;i>=0;i--)if(clock-waves[i].born>3.6)waves.splice(i,1);
    const mobile=w<480,sway=.015;
    mainPose={x:w*((mobile?.50:.55)+Math.sin(clock*.12)*sway),y:h*(.46+Math.cos(clock*.14)*.015),scale:baseScale*style.size*(1+.065*Math.sin(clock*.23)),rx:style.tilt+Math.sin(clock*.23)*.17*style.turn+pointer.y*.26,ry:style.yaw+Math.sin(clock*.17)*.31*style.turn+pointer.x*.36,rz:lerp(style.roll,-.06,style.flow)+Math.sin(clock*.13)*lerp(.15,.07,style.flow)*style.turn,opacity:1-.58*Math.sin(Math.PI*t)**2};
    // Large, quiet fragments make the canvas feel continuous beyond its edges.
    const echo=echoes[0];
    renderShape(echo.current,{x:w*(.015+Math.sin(clock*.08)*.015),y:h*.68,scale:baseScale*.5,rx:echo.style.tilt+.4,ry:.2+clock*.018,rz:.4+Math.sin(clock*.1)*.13,opacity:.085*echo.fade},echo.style,8);
    if(!mobile){const echo2=echoes[1];renderShape(echo2.current,{x:w*.98,y:h*.16,scale:baseScale*.38,rx:echo2.style.tilt,ry:-.6+Math.sin(clock*.1)*.2,rz:-.8,opacity:.065*echo2.fade},echo2.style,8);}
    const targetSurface=surfaces.get(order[active]),sourceSurface=surfaces.get(order[previousActive]);
    const surfaceWeight=targetSurface?smooth(Math.max(0,(transition-.55)/.45)):sourceSurface?1-smooth(Math.min(1,transition/.45)):0;
    if(surfaceWeight<.995)renderShape(current,mainPose,{...style,lineAlpha:style.lineAlpha*(1-surfaceWeight)},mobile?2:1,true);
    if(surfaceWeight>.005)renderSurface(targetSurface||sourceSurface,mainPose,surfaceWeight);
    for(const wave of waves){
      const age=clock-wave.born,fade=Math.max(0,1-age/3.6);
      if(wave.form===active&&order[active]===0){const head=Math.min(points-1,Math.floor(age/2.5*points)),tail=Math.max(0,head-17);ctx.beginPath();ctx.lineWidth=1.3;ctx.strokeStyle=`rgba(${accent},${fade})`;for(let j=tail;j<=head;j++){const k=(wave.path*points+j)*2;if(j===tail)ctx.moveTo(screen[k],screen[k+1]);else ctx.lineTo(screen[k],screen[k+1]);}ctx.stroke();}
      ctx.strokeStyle=`rgba(${accent},${fade*.14})`;ctx.lineWidth=.6;ctx.beginPath();ctx.arc(wave.x,wave.y,8+age*180,0,TAU);ctx.stroke();
      if(age<.7){ctx.fillStyle=`rgba(32,38,44,${(.7-age)*.6})`;ctx.beginPath();ctx.arc(wave.x,wave.y,2,0,TAU);ctx.fill();}
    }
    buttons[active].style.setProperty('--progress',Math.max(.08,cycleAge/cycleDuration));
  }

  function frame(ts){
    raf=0;if(!visible||paused){last=0;return;}
    if(last&&ts-last<1000/30){raf=requestAnimationFrame(frame);return;}
    const dt=last?Math.min((ts-last)/1000,.06):0;last=ts;clock+=dt;cycleAge+=dt;
    transition=Math.min(1,transition+dt/morphDuration);pointer.x+=(pointer.tx-pointer.x)*.07;pointer.y+=(pointer.ty-pointer.y)*.07;
    if(cycleAge>=cycleDuration)choose(active+1);else draw();
    if(!raf)raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&!paused&&visible)raf=requestAnimationFrame(frame);}
  function applyMotion(){paused=userPaused||reduced.matches;if(paused){cancelAnimationFrame(raf);raf=0;last=0;if(reduced.matches)transition=1;draw();}labels();start();}
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();pointer.tx=(e.clientX-rect.left-w/2)/w;pointer.ty=(e.clientY-rect.top-h/2)/h;});
  canvas.addEventListener('pointerleave',()=>{pointer.tx=pointer.ty=0;});
  canvas.addEventListener('pointerdown',e=>{const rect=canvas.getBoundingClientRect();disturb(e.clientX-rect.left,e.clientY-rect.top);});
  canvas.addEventListener('click',e=>{if(e.detail===0&&mainPose)disturb(mainPose.x,mainPose.y);});
  canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();disturb(mainPose.x,mainPose.y);}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose(active+(e.key==='ArrowRight'?1:-1));}});
  buttons.forEach((button,i)=>button.addEventListener('click',()=>choose(i)));
  document.querySelector('#next-form').addEventListener('click',()=>choose(active+1));
  window.addEventListener('site:language',labels);
  document.querySelector('#motion').addEventListener('click',()=>{userPaused=!userPaused;try{localStorage.setItem('zc-motion',userPaused?'paused':'running');}catch{}applyMotion();});
  reduced.addEventListener('change',applyMotion);
  function syncVisibility(){visible=!document.hidden&&inView;if(!visible){cancelAnimationFrame(raf);raf=0;last=0;}else start();}
  document.addEventListener('visibilitychange',syncVisibility);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncVisibility();},{threshold:0}).observe(canvas);
  window.addEventListener('resize',resize);labels();resize();start();
})();
