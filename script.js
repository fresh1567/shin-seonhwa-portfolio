document.documentElement.classList.add('motion-ready');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionPreference.matches;
document.documentElement.classList.toggle('motion-reduced', reducedMotion);

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];

const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = '메뉴 열기';
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.querySelector('.sr-only').textContent = opening ? '메뉴 닫기' : '메뉴 열기';
  menu.classList.toggle('is-open', opening);
  document.body.classList.toggle('menu-open', opening);
});
navLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});

const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
let scrollFrame = 0;
const onScroll = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    header.classList.toggle('is-scrolled', window.scrollY > 14);
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--scroll-progress', Math.min(1, window.scrollY / available));
    if (!reducedMotion) {
      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.parallax || 0);
        item.style.setProperty('--parallax-y', `${window.scrollY * speed}px`);
      });
    }
  });
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const revealElements = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealElements.forEach((element) => revealObserver.observe(element));
}

motionPreference.addEventListener('change', (event) => {
  reducedMotion = event.matches;
  document.documentElement.classList.toggle('motion-reduced', reducedMotion);
  if (reducedMotion) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    parallaxItems.forEach((item) => item.style.setProperty('--parallax-y', '0px'));
  }
  window.dispatchEvent(new CustomEvent('portfolio-motion-change', { detail: { reduced: reducedMotion } }));
});

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reducedMotion) {
  document.querySelectorAll('.capability-card,.project-card,.q-card').forEach((surface) => {
    surface.addEventListener('pointermove', (event) => {
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      surface.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    }, { passive: true });
    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--mx', '50%');
      surface.style.setProperty('--my', '50%');
    });
  });
}

document.querySelectorAll('.project-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const detail = document.getElementById(trigger.getAttribute('aria-controls'));
    const actionLabel = trigger.querySelector('.project-action span');
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
    if (actionLabel) actionLabel.textContent = expanded ? '상세 보기 ↗' : '상세 닫기';
  });
});

const workflowData = [
  { title: '현장과 고객 이해', description: '임상과 기업 고객 운영 경험을 바탕으로 업무 맥락과 실제 사용 환경을 파악해 왔습니다.', deliverables: ['고객 요구 파악', '운영 방식 조정'], href: '#project-b2b', label: 'B2B 건강관리 운영 · 현장 요구 반영 ↗' },
  { title: '문제 구조화', description: '청각장애인의 이용 환경에서 위험 인지 공백을 정의하고 알림 시나리오로 정리했습니다.', deliverables: ['위험 시나리오', '알림·이용 흐름'], href: '#project-soul', label: '위험 알림 앱 · 문제 정의와 제품 출시 ↗' },
  { title: '서비스와 제안 설계', description: '건강 데이터·전문가 상담·콘텐츠를 연결하는 서비스 모델과 모바일 흐름을 설계했습니다.', deliverables: ['서비스 모델', '제안서', '모바일 화면'], href: '#project-senior', label: '공공 헬스케어 실증 · 서비스 모델 설계 ↗' },
  { title: '관계자 협업', description: '서비스 기획과 PM을 맡아 데이터 연동, 상담, 리포트와 콘텐츠가 이어지도록 업무를 조율했습니다.', deliverables: ['프로젝트 PM', '서비스 흐름·화면 기획'], href: '#project-samsung-health', label: '건강 데이터 연계 · 기획과 PM 수행 ↗' },
  { title: '실행과 운영', description: '기업별 프로그램 운영과 교육, 이용현황 분석을 수행하고 안내 방식과 운영 구조를 조정했습니다.', deliverables: ['프로그램 운영', '교육', '이용현황 분석'], href: '#project-b2b', label: 'B2B 건강관리 운영 · 약 3,000명 이상 대상 ↗' },
  { title: '데이터 기반 개선', description: '이용현황과 참여자 반응을 운영 개선에 반영한 경험이 있습니다. 아래 CRM 예시에서 현황과 후속 실행을 연결하는 구조를 살펴보세요.', deliverables: ['이용현황 분석', '성과관리 CRM 예시'], href: '#project-crm', label: '성과관리 CRM · 대시보드 설계 예시 ↗' }
];
const workflowTabs = [...document.querySelectorAll('[role="tab"][data-step]')];
const workflowPanel = document.getElementById('workflow-panel');
const panelNumber = workflowPanel.querySelector('.panel-number');
const panelTitle = workflowPanel.querySelector('b');
const panelDescription = workflowPanel.querySelector('[data-workflow-description]');
const panelDeliverables = workflowPanel.querySelector('[data-workflow-deliverables]');
const panelLink = workflowPanel.querySelector('[data-workflow-link]');

function selectWorkflow(index, setFocus = false) {
  workflowTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  const data = workflowData[index];
  workflowPanel.classList.remove('is-switching');
  if (!reducedMotion) {
    void workflowPanel.offsetWidth;
    workflowPanel.classList.add('is-switching');
  }
  panelNumber.textContent = String(index + 1).padStart(2, '0');
  panelTitle.textContent = data.title;
  panelDescription.textContent = data.description;
  panelDeliverables.replaceChildren(...data.deliverables.map((deliverable) => {
    const tag = document.createElement('li');
    tag.textContent = deliverable;
    return tag;
  }));
  panelLink.href = data.href;
  panelLink.textContent = data.label;
  workflowPanel.setAttribute('aria-labelledby', workflowTabs[index].id);
  if (setFocus) workflowTabs[index].focus();
}
workflowTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectWorkflow(index));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % workflowTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + workflowTabs.length) % workflowTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = workflowTabs.length - 1;
    selectWorkflow(next, true);
  });
});

if ('IntersectionObserver' in window) {
  const sections = [...document.querySelectorAll('main section[id]')];
  const spy = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.toggleAttribute('aria-current', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-22% 0px -67% 0px', threshold: [0, .2, .5] });
  sections.forEach((section) => spy.observe(section));
}



// An actual lit 3D service object; SVG remains available if WebGL is unavailable.
(function initServiceObject(){
 const canvas=document.querySelector('[data-service-3d]'),stage=document.querySelector('[data-hero-stage]');
 if(!canvas||!window.THREE||navigator.connection?.saveData)return;
 const T=window.THREE;let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(3.5,2.8,5.5);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xc2fff2,0x10253c,1.1));
 const key=new T.DirectionalLight(0xffffff,2);key.position.set(-3,5,4);scene.add(key);
 const rim=new T.PointLight(0x40e5c6,2,12);rim.position.set(2,1,-2);scene.add(rim);
 const group=new T.Group();scene.add(group);

 const material=new T.MeshPhysicalMaterial({color:0x2e7080,metalness:.3,roughness:.28,clearcoat:1});
 const white=new T.MeshStandardMaterial({color:0xc9e9e9,metalness:.15,roughness:.32});
 const accent=new T.MeshStandardMaterial({color:0x98f6d4,emissive:0x2a9477,emissiveIntensity:.45});
 function box(w,h,d,x,y,z,mat=material){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
 // Hospital silhouette anchors the purchasing and logistics network.
 box(.86,1.5,.6,0,.12,0,white);box(.55,.95,.58,-.66,-.15,0);box(.55,.95,.58,.66,-.15,0);
 box(.31,.065,.025,0,.57,.315,accent);box(.065,.31,.025,0,.57,.315,accent);
 for(let row=0;row<2;row++)for(let col=0;col<2;col++)box(.13,.15,.022,-.2+col*.4,.14-row*.3,.316,material);
 box(.24,.32,.025,0,-.46,.32,material);
 for(const x of [-.68,.68])for(let y=0;y<2;y++)box(.16,.14,.025,x,-.1-y*.28,.31,white);
 const platform=new T.Mesh(new T.CylinderGeometry(1.65,1.65,.11,64),new T.MeshPhysicalMaterial({color:0x175469,metalness:.55,roughness:.25}));platform.position.y=-.9;group.add(platform);
 const orbit=new T.Mesh(new T.TorusGeometry(1.42,.018,8,80),accent);orbit.rotation.x=Math.PI/2;orbit.position.y=-.82;group.add(orbit);
 const satellites=[];
 for(let i=0;i<3;i++){const angle=i*Math.PI*2/3+.4;const node=new T.Group();node.position.set(Math.cos(angle)*1.4,-.58,Math.sin(angle)*1.4);group.add(node);
 const sphere=new T.Mesh(new T.SphereGeometry(.16,20,16),new T.MeshStandardMaterial({color:[0x72b2ff,0x92f4d3,0xd0e992][i],metalness:.3,roughness:.22}));node.add(sphere);satellites.push(node);
 const curve=new T.CatmullRomCurve3([node.position.clone(),new T.Vector3(node.position.x*.65,-.72,node.position.z*.65),new T.Vector3(0,-.73,0)]);
 group.add(new T.Mesh(new T.TubeGeometry(curve,24,.012,6,false),new T.MeshBasicMaterial({color:0x65b5ba,transparent:true,opacity:.6})));}
 let visible=false,frame=0,elapsed=0,last=0;
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);}
 function draw(t){frame=0;if(last&&!reducedMotion)elapsed+=Math.min((t-last)/1000,.05);last=t;group.rotation.y=reducedMotion?0:Math.sin(elapsed*.4)*.35;group.position.y=reducedMotion?0:Math.sin(elapsed*.8)*.045;renderer.render(scene,camera);if(visible&&!document.hidden&&!reducedMotion)frame=requestAnimationFrame(draw);}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
 function start(){if(visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(draw);}}
 resize();stage.classList.add('has-service-3d');new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();}).observe(stage);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('portfolio-motion-change',()=>{stop();draw(performance.now());start();});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();stage.classList.remove('has-service-3d');});
})();

