// ============================================
// THREE.JS STARFIELD BACKGROUND
// ============================================

let scene, camera, renderer, stars, starGeo;

function initThree() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    createStarField();
    animate();
}

function createStarField() {
    const starCount = 15000;
    starGeo = new THREE.BufferGeometry();

    const positions = new Float32Array(starCount * 3);
    const velocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        velocities[i] = Math.random() * 0.5 + 0.1;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    // Second layer — colored stars
    const coloredPositions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        coloredPositions[i * 3] = (Math.random() - 0.5) * 3000;
        coloredPositions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
        coloredPositions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    const coloredGeo = new THREE.BufferGeometry();
    coloredGeo.setAttribute('position', new THREE.BufferAttribute(coloredPositions, 3));

    const colors = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        const isYellow = Math.random() > 0.5;
        colors[i * 3] = isYellow ? 1.0 : 0.6;
        colors[i * 3 + 1] = isYellow ? 0.9 : 0.7;
        colors[i * 3 + 2] = isYellow ? 0.5 : 1.0;
    }
    coloredGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const coloredMaterial = new THREE.PointsMaterial({
        size: 2.0,
        transparent: true,
        opacity: 0.6,
        vertexColors: true,
        sizeAttenuation: true
    });

    const coloredStars = new THREE.Points(coloredGeo, coloredMaterial);
    scene.add(coloredStars);
}

let scrollProgress = 0;

function animate() {
    requestAnimationFrame(animate);

    if (stars) {
        stars.rotation.y += 0.0002;
        stars.rotation.z += 0.0001;
    }

    const positions = starGeo.attributes.position.array;
    const velocities = starGeo.attributes.velocity.array;

    for (let i = 0; i < 15000; i++) {
        positions[i * 3 + 2] += velocities[i] * (1 + scrollProgress * 8);

        if (positions[i * 3 + 2] > 1000) {
            positions[i * 3 + 2] = -1000;
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        }
    }
    starGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// SCROLL-DRIVEN TEXT ANIMATION
// ============================================

function setSpacerHeight() {
    const content = document.getElementById('crawlContent');
    const spacer = document.getElementById('scrollSpacer');
    if (!content || !spacer) return;

    // Measure natural height (without transforms)
    const saved = content.style.cssText;
    content.style.cssText = 'position: absolute; visibility: hidden; transform: none; opacity: 1;';
    const h = content.scrollHeight;
    content.style.cssText = saved;

    // spacer высота = высота контента минус часть viewport,
    // чтобы при maxScroll нижний край текста оставался в видимой области
    const visibleBuffer = window.innerHeight * 0.6;
    spacer.style.height = Math.max(h - visibleBuffer, 1) + 'px';
}

function handleScroll() {
    const progressBar = document.getElementById('progressBar');
    const scrollIndicator = document.getElementById('scrollIndicator');
    const crawlContent = document.getElementById('crawlContent');
    const spacer = document.getElementById('scrollSpacer');

    if (!spacer || !crawlContent) return;

    const maxScroll = Math.max(spacer.offsetHeight - window.innerHeight, 1);
    const t = Math.min(window.scrollY / maxScroll, 1);
    scrollProgress = t;

    // Progress bar
    if (progressBar) progressBar.style.width = (t * 100) + '%';

    // Hide scroll indicator via CSS class when reaching the end of scroll
    if (scrollIndicator) {
        if (t >= 0.99) {
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
        }
    }

    // === SIMPLE SCROLL: only translateY, NO scale, NO rotateX, NO perspective ===
    // The visual tilt comes from CSS skewY(-4deg) on .crawl-content
    // Text size NEVER changes — it just moves straight up

    const contentH = crawlContent.scrollHeight;

    // Start: text top is at 10% of viewport — text appears near top of screen
    const startY = window.innerHeight * 0.10;

    // End: нижний край контента остаётся в нижней части viewport,
    // чтобы текст "КОНЕЦ" не улетал за верхний край при полной прокрутке
    const endY = -(contentH - window.innerHeight * 0.6);

    // Current Y position
    const currentY = startY + (endY - startY) * t;

    // Apply: translateX(-50%) is already in CSS, we only change translateY
    crawlContent.style.transform =
        'translateX(-50%) translateY(' + currentY + 'px) skewY(-4deg)';

    // Текст остаётся полностью видимым на всём протяжении прокрутки
    crawlContent.style.opacity = '1';

    updateActiveNav(t);
}

function updateActiveNav(t) {
    const sections = document.querySelectorAll('.crawl-section, .logo, .episode');
    const links = document.querySelectorAll('.nav-list a');
    if (!sections.length || !links.length) return;

    const crawlContent = document.getElementById('crawlContent');
    if (!crawlContent) return;

    const contentH = crawlContent.scrollHeight;
    const startY = window.innerHeight * 0.10;
    const viewportCenter = window.innerHeight * 0.35;

    // Current text Y position
    const endY = -(contentH - window.innerHeight * 0.6);
    const currentY = startY + (endY - startY) * t;

    // What content Y is at viewport center?
    const contentYAtCenter = viewportCenter - currentY;

    // Find section whose offsetTop is closest to contentYAtCenter
    let closestIdx = 0;
    let closestDist = Infinity;
    sections.forEach(function(sec, i) {
        const dist = Math.abs(sec.offsetTop - contentYAtCenter);
        if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
        }
    });

    const id = sections[closestIdx] ? sections[closestIdx].id : '';

    links.forEach(function(link) {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const sideNav = document.getElementById('sideNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelectorAll('.nav-list a');

    if (!sideNav || !navToggle) return;

    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        sideNav.classList.toggle('active');
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sideNav.classList.remove('active');
            scrollToSection(link.getAttribute('data-section'));
        });
    });

    document.addEventListener('click', function(e) {
        if (!sideNav.contains(e.target)) sideNav.classList.remove('active');
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    const crawlContent = document.getElementById('crawlContent');
    const spacer = document.getElementById('scrollSpacer');
    if (!section || !crawlContent || !spacer) return;

    // Section's position within crawlContent (pixels from top of content)
    const sectionTop = section.offsetTop;
    const contentH = crawlContent.scrollHeight;
    const startY = window.innerHeight * 0.10;
    const viewportCenter = window.innerHeight * 0.35;

    // We want: currentY + sectionTop ≈ viewportCenter
    // currentY = startY + (endY - startY) * t, where endY = -(contentH - window.innerHeight * 0.6)
    // startY + (-(contentH - window.innerHeight * 0.6) - startY) * t + sectionTop = viewportCenter
    // t = (startY + sectionTop - viewportCenter) / (contentH - window.innerHeight * 0.6 + startY)
    let t = (startY + sectionTop - viewportCenter) / (contentH - window.innerHeight * 0.6 + startY);
    t = Math.max(0, Math.min(1, t));

    const maxScroll = Math.max(spacer.offsetHeight - window.innerHeight, 1);
    const target = t * maxScroll;

    window.scrollTo({ top: target, behavior: 'smooth' });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initThree();
    initNavigation();

    setTimeout(setSpacerHeight, 100);
    setTimeout(setSpacerHeight, 500);
    setTimeout(setSpacerHeight, 1000);

    handleScroll();
});

let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(function() {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
});

window.addEventListener('resize', function() {
    onWindowResize();
    setSpacerHeight();
    handleScroll();
});
