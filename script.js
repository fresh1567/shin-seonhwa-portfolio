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

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 14);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

document.querySelectorAll('.project-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const detail = document.getElementById(trigger.getAttribute('aria-controls'));
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
  });
});

const workflowData = [
  { title: '현장과 고객 이해', description: '의료진과 고객의 업무 맥락, 실제 사용 환경을 듣습니다.', href: '#project-b2b' },
  { title: '문제 구조화', description: '표면의 요청과 해결해야 할 핵심 문제를 구분해 구조화합니다.', href: '#project-senior' },
  { title: '서비스와 제안 설계', description: '고객의 문제를 서비스 흐름과 설득력 있는 제안 구조로 바꿉니다.', href: '#project-sleep' },
  { title: '관계자 설득', description: '의료·기술·운영의 언어를 연결해 관계자의 합의를 만듭니다.', href: '#project-content' },
  { title: '실행과 운영', description: '일정과 인력, 고객 커뮤니케이션을 조율하며 서비스를 운영합니다.', href: '#project-b2b' },
  { title: '데이터 기반 개선', description: '운영 데이터와 현장 피드백을 다음 개선 과제로 연결합니다.', href: '#project-senior' }
];
const workflowTabs = [...document.querySelectorAll('[role="tab"][data-step]')];
const workflowPanel = document.getElementById('workflow-panel');
const panelNumber = workflowPanel.querySelector('.panel-number');
const panelTitle = workflowPanel.querySelector('b');
const panelDescription = workflowPanel.querySelector('[data-workflow-description]');
const panelLink = workflowPanel.querySelector('[data-workflow-link]');

function selectWorkflow(index, setFocus = false) {
  workflowTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  const data = workflowData[index];
  panelNumber.textContent = String(index + 1).padStart(2, '0');
  panelTitle.textContent = data.title;
  panelDescription.textContent = data.description;
  panelLink.href = data.href;
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
