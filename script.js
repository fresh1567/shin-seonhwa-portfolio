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

const counters = [...document.querySelectorAll('[data-counter]')];
const runCounter = (element) => {
  if (element.dataset.counted === 'true') return;
  element.dataset.counted = 'true';
  const target = Number(element.dataset.counter);
  const format = element.dataset.counterFormat;
  if (reducedMotion || !Number.isFinite(target)) {
    element.textContent = format === 'comma' ? target.toLocaleString('ko-KR') : String(target);
    return;
  }
  const duration = 900;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - ((1 - progress) ** 3);
    const value = Math.round(target * eased);
    element.textContent = format === 'comma' ? value.toLocaleString('ko-KR') : String(value);
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
};

if ('IntersectionObserver' in window && !reducedMotion) {
  counters.forEach((counter) => { counter.textContent = '0'; });
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      runCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.65 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(runCounter);
}

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
  { title: '현장과 고객 이해', description: '의료진과 고객의 업무 맥락, 실제 사용 환경을 듣습니다.', deliverables: ['현장 VOC 분석서'], href: '#project-b2b' },
  { title: '문제 구조화', description: '표면의 요청과 해결해야 할 핵심 문제를 구분해 구조화합니다.', deliverables: ['문제 정의서', '요구사항 명세'], href: '#project-senior' },
  { title: '서비스와 제안 설계', description: '고객의 문제를 서비스 흐름과 설득력 있는 제안 구조로 바꿉니다.', deliverables: ['서비스 기획서', '수가 제안서'], href: '#project-sleep' },
  { title: '관계자 설득', description: '의료·기술·운영의 언어를 연결해 관계자의 합의를 만듭니다.', deliverables: ['이해관계자 협의체 WBS'], href: '#project-content' },
  { title: '실행과 운영', description: '일정과 인력, 고객 커뮤니케이션을 조율하며 서비스를 운영합니다.', deliverables: ['운영 매뉴얼', 'SLA 지표'], href: '#project-b2b' },
  { title: '데이터 기반 개선', description: '운영 데이터와 현장 피드백을 다음 개선 과제로 연결합니다.', deliverables: ['성과 대시보드'], href: '#project-senior' }
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

function initHero3D() {
  const canvas = document.querySelector('[data-hero-canvas]');
  const stage = document.querySelector('[data-hero-stage]');
  const card = stage?.closest('.visual-card');
  const saveData = Boolean(navigator.connection?.saveData);
  if (!canvas || !stage || !card || saveData || !window.THREE || !window.THREE.GLTFLoader || !window.WebGLRenderingContext) return;

  let renderer;
  try {
    renderer = new window.THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    return;
  }

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.1, 10.2);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  scene.add(new THREE.HemisphereLight(0xf8ffff, 0x0a2342, 1.45));
  const tealLight = new THREE.PointLight(0x35e3c1, 2.25, 18);
  tealLight.position.set(4.8, 3.2, 5.5);
  scene.add(tealLight);
  const blueLight = new THREE.PointLight(0x3f82ff, 1.65, 18);
  blueLight.position.set(-4.5, -2.5, 4.2);
  scene.add(blueLight);
  const limeLight = new THREE.PointLight(0xd5ff71, 1.05, 12);
  limeLight.position.set(0, 4.4, -2);
  scene.add(limeLight);

  const modelGroup = new THREE.Group();
  modelGroup.rotation.set(0.28, -0.36, -0.08);
  scene.add(modelGroup);

  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x18bca2, transparent: true, opacity: 0.22, depthWrite: false });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.012, 8, 180), orbitMaterial);
  orbit.rotation.x = 1.12;
  orbit.rotation.z = -0.24;
  modelGroup.add(orbit);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.46, 3),
    new THREE.MeshPhysicalMaterial({ color: 0x2474e5, emissive: 0x071c36, emissiveIntensity: 0.16, roughness: 0.18, metalness: 0.18, transparent: true, opacity: 0.72, clearcoat: 1 }),
  );
  modelGroup.add(core);

  const particleCount = window.innerWidth < 640 ? 24 : 42;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    const angle = (index / particleCount) * Math.PI * 2;
    const radius = 3.1 + Math.sin(index * 2.17) * 0.22;
    particlePositions[index * 3] = Math.cos(angle) * radius;
    particlePositions[index * 3 + 1] = Math.sin(angle * 2.5) * 0.48;
    particlePositions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xc9f35f, size: 0.065, transparent: true, opacity: 0.82, sizeAttenuation: true, depthWrite: false }),
  );
  modelGroup.add(particles);

  let modelReady = false;
  let heroVisible = true;
  let frameRequest = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || stage.clientWidth);
    const height = Math.max(1, canvas.clientHeight || stage.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (modelReady) renderer.render(scene, camera);
  };

  const shouldAnimate = () => modelReady && heroVisible && !document.hidden && !reducedMotion;
  const render = (time = performance.now()) => {
    frameRequest = 0;
    if (!modelReady) return;
    const seconds = time * 0.001;
    if (!reducedMotion) {
      pointerX += (targetX - pointerX) * 0.055;
      pointerY += (targetY - pointerY) * 0.055;
      modelGroup.rotation.x = 0.28 + pointerY;
      modelGroup.rotation.y = -0.36 + (seconds * 0.13) + pointerX;
      particles.rotation.y = -seconds * 0.08;
      particles.rotation.z = Math.sin(seconds * 0.28) * 0.11;
      core.rotation.y = seconds * 0.22;
      orbit.rotation.z = -0.24 + seconds * 0.045;
    }
    renderer.render(scene, camera);
    if (shouldAnimate()) frameRequest = window.requestAnimationFrame(render);
  };

  const requestRender = () => {
    if (!frameRequest && modelReady) frameRequest = window.requestAnimationFrame(render);
  };

  const loader = new THREE.GLTFLoader();
  loader.load('./healthcare-mobius.glb', (gltf) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x39d3bb,
      emissive: 0x032a2a,
      emissiveIntensity: 0.16,
      metalness: 0.18,
      roughness: 0.17,
      transmission: 0.22,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      side: THREE.DoubleSide,
    });
    gltf.scene.traverse((child) => {
      if (!child.isMesh) return;
      child.material = material;
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x2474e5, transparent: true, opacity: 0.24 });
      child.add(new THREE.LineSegments(new THREE.EdgesGeometry(child.geometry, 34), edgeMaterial));
    });
    gltf.scene.scale.setScalar(0.94);
    modelGroup.add(gltf.scene);
    modelReady = true;
    resize();
    renderer.render(scene, camera);
    stage.classList.add('is-3d-ready');
    requestRender();
  }, undefined, () => {
    stage.classList.remove('is-3d-ready');
  });

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) requestRender();
      else if (frameRequest) {
        window.cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      }
    }, { threshold: 0.05 });
    visibilityObserver.observe(stage);
  }

  if (finePointer) {
    stage.addEventListener('pointermove', (event) => {
      if (reducedMotion) return;
      const bounds = stage.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      targetX = x * 0.12;
      targetY = y * 0.075;
      card.style.setProperty('--tilt-x', `${-y * 2.6}deg`);
      card.style.setProperty('--tilt-y', `${x * 3.4}deg`);
      requestRender();
    }, { passive: true });
    stage.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      requestRender();
    });
  }

  document.addEventListener('visibilitychange', requestRender);
  window.addEventListener('portfolio-motion-change', () => {
    if (reducedMotion) {
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      targetX = 0;
      targetY = 0;
      modelGroup.rotation.set(0.28, -0.36, -0.08);
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      renderer.render(scene, camera);
    } else {
      requestRender();
    }
  });
  canvas.addEventListener('webglcontextlost', () => {
    stage.classList.remove('is-3d-ready');
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
  });
}

try {
  initHero3D();
} catch (error) {
  document.querySelector('[data-hero-stage]')?.classList.remove('is-3d-ready');
}
