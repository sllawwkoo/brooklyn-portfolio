"use strict";

const html = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	initReveal();
	initCounters();
	initHeaderScroll();
	initClientsMarquee();
});

window.addEventListener("load", windowLoad);

/* =========================
   Reveal Animations
========================= */
function initReveal() {
	const items = document.querySelectorAll("._anim-item");
	if (!items.length) return;

	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;

			entry.target.classList.add("_anim-show");
			obs.unobserve(entry.target);
		});
	}, { threshold: 0.15 });

	items.forEach(item => observer.observe(item));
}

/* =========================
   Count-Up Animation
========================= */
function initCounters() {
	const counters = document.querySelectorAll("[data-counter]");
	if (!counters.length) return;

	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;

			const el = entry.target;
			const target = parseInt(el.dataset.counter, 10);
			const suffix = el.dataset.suffix || "";

			if (prefersReducedMotion) {
				el.textContent = target + suffix;
				obs.unobserve(el);
				return;
			}

			const duration = 1200;
			const startTime = performance.now();

			const animate = (currentTime) => {
				const progress = Math.min((currentTime - startTime) / duration, 1);
				const value = Math.floor(progress * target);
				el.textContent = value + suffix;

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					el.textContent = target + suffix;
					obs.unobserve(el); // переносимо сюди
				}
			};

			requestAnimationFrame(animate);
		});
	}, { threshold: 0.5 });

	counters.forEach(counter => observer.observe(counter));
}

/* =========================
   Header Scroll Effect
========================= */
function initHeaderScroll() {
	const header = document.querySelector(".header");
	const sentinel = document.querySelector(".header-sentinel");
	if (!header || !sentinel) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			header.classList.toggle("_header-scrolled", !entry.isIntersecting);
		},
		{
			threshold: 0,
			rootMargin: "-1px 0px 0px 0px"
		}
	);

	observer.observe(sentinel);
}

/* =========================
   Clients Marquee (seamless loop, clone in JS)
========================= */
function initClientsMarquee() {
	const marquee = document.querySelector(".clients__marquee");
	const track = document.querySelector(".clients__track");
	const list = document.querySelector(".clients__list");

	if (!marquee || !track || !list) return;

	const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (prefersReduced) return;

	// Клонування списку для seamless loop
	const clone = list.cloneNode(true);
	track.appendChild(clone);

	let position = 0;
	let lastTime = performance.now();
	const speed = 80; // px per second

	const getListWidth = () => Math.round(list.getBoundingClientRect().width);
	let listWidth = getListWidth();

	window.addEventListener("resize", () => {
		listWidth = getListWidth();
		position = position % listWidth;
		if (position > 0) position -= listWidth;
	});

	let paused = false;

	marquee.addEventListener("mouseenter", () => (paused = true));
	marquee.addEventListener("mouseleave", () => {
		paused = false;
		lastTime = performance.now();
	});

	function animate(time) {
		const delta = (time - lastTime) / 1000;
		lastTime = time;

		if (!paused) {
			position -= speed * delta;

			if (position <= -listWidth) {
				position += listWidth;
			}

			// Округлення до цілого px для уникнення SVG clipping bug (Amazon arrow issue)
			track.style.transform = `translate3d(${Math.round(position)}px,0,0)`;
		}

		requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
}

/* =========================
   Menu Logic
========================= */
function windowLoad() {
	document.addEventListener("click", documentActions);
	html.classList.add("loaded");
}

function documentActions(e) {
	const target = e.target;

	if (target.closest(".icon-menu")) {
		html.classList.toggle("open-menu");
		return;
	}

	if (
		html.classList.contains("open-menu") &&
		(target.closest(".menu__link") ||
		 target.closest(".actions-header__button"))
	) {
		html.classList.remove("open-menu");
	}
}