"use strict";

const html = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
	initReveal();
	initCounters();
	initHeaderScroll();
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
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					header.classList.add("_header-scrolled");
				} else {
					header.classList.remove("_header-scrolled");
				}
			});
		},
		{ threshold: 0 }
	);

	observer.observe(sentinel);
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