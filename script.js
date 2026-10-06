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
  trigger.setAttribute('aria-expanded', 'false');
  document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
  const initialLabel = trigger.querySelector('.project-action span');
  if (initialLabel) initialLabel.textContent = '상세 보기 ↗';
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




// Switch the evidence and future application together for every skill.
const skillOptions = [
 ['의료 현장 이해','외과계 중환자실 간호를 통해 의료진의 용어와 환자 관리, 병원 업무 흐름을 익혔습니다.','사용부서의 요구를 도입 조건으로','병원 사용부서와 구매 담당자의 요구를 구분하고, 실제 사용 환경을 반영한 제품 설명과 도입 제안을 준비하겠습니다.'],
 ['서비스 기획','건강 데이터 연계·수면관리 서비스, 임직원 건강검진 설계·프로그램과 만성질환 관리 서비스를 각각 기획했습니다.','구매와 이용 흐름을 고객의 관점으로','병원 고객의 검토·도입·주문·이용 흐름을 정리하고, 고객별 안내와 플랫폼 이용 과정 개선에 적용하겠습니다.'],
 ['제안서 · RFP','사업 제안서와 RFP를 작성하고, 서비스 목표와 수행 범위·운영 구조를 구체화했습니다.','고객 요구를 실행 가능한 제안으로','병원의 구매·물류 요구를 정리하고 도입 범위, 운영 방식과 협업 조건이 명확한 제안서를 준비하겠습니다.'],
 ['B2B 고객 운영','기업별 건강관리 프로그램을 운영하며 고객 요구에 맞춰 안내 방식과 운영 구조를 조정했습니다.','도입 이후에도 이어지는 고객 관계','병원 고객의 이용 현황과 문의를 파악해 플랫폼 안내, 후속 대응과 지속 이용을 지원하겠습니다.'],
 ['데이터 기반 개선','서비스 이용현황과 참여자 반응을 분석하고 운영 개선에 반영했습니다.','이용 현황을 다음 개선 과제로','플랫폼 이용 과정의 불편과 고객 피드백을 정리해, 후속 대응과 운영 개선 과제를 제안하겠습니다.'],
 ['프로젝트 PM','앱 기획과 제품 출시 과정에서 화면·기능 설계, 일정·인력 조율과 관계자 협업을 맡았습니다.','제안부터 도입까지 실행을 연결','병원 고객과 내부 담당자·공급사 사이의 요구와 일정을 조율하며 도입과 운영이 이어지도록 지원하겠습니다.']
];
const skillButtons=[...document.querySelectorAll('[data-skill]')];
const skillResult=document.querySelector('.skill-result');
function selectSkill(index){
 const data=skillOptions[index];if(!data||!skillResult)return;
 skillButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
 const proof=document.querySelector('[data-skill-proof]');if(proof){proof.href=skillProofs[index];proof.textContent=index===4?'대시보드 설계 예시 보기 ↗':'관련 수행 경험 보기 ↗';}
 ['title','evidence','application','plan'].forEach((name,i)=>{document.querySelector('[data-skill-'+name+']').textContent=data[i];});
 skillResult.classList.remove('is-switching');
 if(!reducedMotion){void skillResult.offsetWidth;skillResult.classList.add('is-switching');}
}
const skillProofs=['#capabilities','#project-sleep','#project-senior','#project-b2b','#project-crm','#project-soul'];
skillButtons.forEach(button=>button.addEventListener('click',()=>selectSkill(Number(button.dataset.skill))));
selectWorkflow(0);

// A luminous spatial network connects clinical, design and operational experience.
(function initServiceObject(){
 const canvas=document.querySelector('[data-service-3d]'),stage=document.querySelector('[data-hero-stage]');
 if(!canvas||!window.THREE||navigator.connection?.saveData)return;
 const T=window.THREE;let renderer;try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(0,.15,5);camera.lookAt(0,0,0);
 const group=new T.Group();scene.add(group);
 const positions=[];for(let row=1;row<42;row++){const phi=Math.PI*row/42;for(let col=0;col<84;col++){const theta=Math.PI*2*col/84;positions.push(Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta));}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));group.add(new T.Points(geo,new T.PointsMaterial({color:0x00caff,size:.025,transparent:true,opacity:1})));
 const cage=new T.IcosahedronGeometry(1.28,0);group.add(new T.LineSegments(new T.EdgesGeometry(cage),new T.LineBasicMaterial({color:0x008fee,transparent:true,opacity:.65})));
 const verts=cage.attributes.position;const seen=new Set();for(let i=0;i<verts.count;i++){const p=new T.Vector3().fromBufferAttribute(verts,i),k=p.toArray().map(v=>v.toFixed(3)).join(',');if(seen.has(k))continue;seen.add(k);const n=new T.Mesh(new T.SphereGeometry(.027,8,6),new T.MeshBasicMaterial({color:0x00cfff}));n.position.copy(p);group.add(n);}
 let visible=false,frame=0,elapsed=0,last=0;
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);}
 function draw(t){frame=0;if(last&&!reducedMotion)elapsed+=Math.min((t-last)/1000,.05);last=t;group.rotation.y=reducedMotion?0:elapsed*.13;group.rotation.z=.12;renderer.render(scene,camera);if(visible&&!document.hidden&&!reducedMotion)frame=requestAnimationFrame(draw);}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}function start(){if(visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(draw);}}
 resize();stage.classList.add('has-service-3d');new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():stop();}).observe(stage);
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('portfolio-motion-change',()=>{stop();draw(performance.now());start();});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();stage.classList.remove('has-service-3d');});
})();


// Bring linked evidence into view and open its full account.
document.querySelectorAll('a[href^="#project-"]').forEach(link=>link.addEventListener('click',()=>{const card=document.querySelector(link.getAttribute('href'));if(!card)return;const trigger=card.querySelector('.project-trigger'),detail=card.querySelector('.project-detail');if(trigger&&detail){trigger.setAttribute('aria-expanded','true');detail.hidden=false;trigger.querySelector('.project-action span').textContent='상세 닫기';}document.querySelectorAll('.project-card.is-linked').forEach(c=>c.classList.remove('is-linked'));card.classList.add('is-linked');}));
document.querySelectorAll('.project-trigger[aria-expanded="true"] .project-action span').forEach(label=>label.textContent='상세 닫기');

function revealLinkedProject(){if(!location.hash.startsWith('#project-'))return;const card=document.getElementById(location.hash.slice(1));if(!card)return;const trigger=card.querySelector('.project-trigger'),detail=card.querySelector('.project-detail');if(trigger&&detail){trigger.setAttribute('aria-expanded','true');detail.hidden=false;trigger.querySelector('.project-action span').textContent='상세 닫기';}card.classList.add('is-linked');}window.addEventListener('hashchange',revealLinkedProject);
