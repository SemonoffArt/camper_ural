/**
 * «Кочевник 1» — Landing Page Scripts
 * Pure vanilla JS, no dependencies
 */

(function () {
    'use strict';

    /* ============================================
       DOM Ready
       ============================================ */
    document.addEventListener('DOMContentLoaded', function () {
        initHeaderScroll();
        initMobileNav();
        initSmoothScroll();
        initRevealAnimations();
        initGallerySlider();
        initPrivacyModal();
        initContactForm();
    });

    /* ============================================
       Header: shadow on scroll
       ============================================ */
    function initHeaderScroll() {
        var header = document.getElementById('header');
        if (!header) return;

        function onScroll() {
            if (window.scrollY > 10) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ============================================
       Mobile Navigation
       ============================================ */
    function initMobileNav() {
        var toggle = document.querySelector('.nav__toggle');
        var menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        var links = menu.querySelectorAll('.nav__link');

        function openMenu() {
            toggle.classList.add('is-active');
            menu.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            toggle.classList.remove('is-active');
            menu.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        toggle.addEventListener('click', function () {
            if (menu.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking a link
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                closeMenu();
            });
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) {
                closeMenu();
            }
        });
    }

    /* ============================================
       Smooth Scroll for anchor links
       ============================================ */
    function initSmoothScroll() {
        var links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                var target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                var header = document.getElementById('header');
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }

    /* ============================================
       Reveal Animations (IntersectionObserver)
       ============================================ */
    function initRevealAnimations() {
        var revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        // Fallback for older browsers
        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ============================================
       Gallery Slider
       ============================================ */
    function initGallerySlider() {
        var track = document.getElementById('galleryTrack');
        var prevBtn = document.getElementById('galleryPrev');
        var nextBtn = document.getElementById('galleryNext');
        var dotsContainer = document.getElementById('galleryDots');

        if (!track || !prevBtn || !nextBtn) return;

        var slides = track.querySelectorAll('.gallery__slide');
        var totalSlides = slides.length;
        if (totalSlides === 0) return;

        var currentIndex = 0;
        var autoplayInterval = null;
        var autoplayDelay = 5000;

        // Create dots
        if (dotsContainer) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.className = 'gallery__dot' + (index === 0 ? ' is-active' : '');
                dot.setAttribute('aria-label', 'Перейти к слайду ' + (index + 1));
                dot.addEventListener('click', function () {
                    goToSlide(index);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function updateSlider() {
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

            // Update dots
            if (dotsContainer) {
                var dots = dotsContainer.querySelectorAll('.gallery__dot');
                dots.forEach(function (dot, index) {
                    dot.classList.toggle('is-active', index === currentIndex);
                });
            }
        }

        function goToSlide(index) {
            currentIndex = index;
            if (currentIndex < 0) {
                currentIndex = totalSlides - 1;
            } else if (currentIndex >= totalSlides) {
                currentIndex = 0;
            }
            updateSlider();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoplay() {
            stopAutoplay();
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        prevBtn.addEventListener('click', function () {
            prevSlide();
            resetAutoplay();
        });

        nextBtn.addEventListener('click', function () {
            nextSlide();
            resetAutoplay();
        });

        // Touch/swipe support
        var startX = 0;
        var isDragging = false;

        track.addEventListener('touchstart', function (e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopAutoplay();
        }, { passive: true });

        track.addEventListener('touchmove', function () {
            if (!isDragging) return;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            if (!isDragging) return;
            isDragging = false;

            var endX = e.changedTouches[0].clientX;
            var diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }

            startAutoplay();
        }, { passive: true });

        // Pause autoplay when not visible
        var sliderObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: 0.3 });

        sliderObserver.observe(track.parentElement);
    }

    /* ============================================
       Privacy Modal
       ============================================ */
    function initPrivacyModal() {
        var privacyLink = document.getElementById('privacy');
        var modal = document.getElementById('privacyModal');
        var closeBtn = document.getElementById('privacyClose');

        if (!privacyLink || !modal || !closeBtn) return;

        function openModal() {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            privacyLink.focus();
        }

        privacyLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });

        closeBtn.addEventListener('click', closeModal);

        modal.querySelector('.modal__overlay').addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }

    /* ============================================
       Contact Form
       ============================================ */
    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        // Check if using Formspree or mailto fallback
        var action = form.getAttribute('action') || '';
        var isMailto = action.indexOf('mailto:') === 0;
        var isFormspree = action.indexOf('formspree.io') !== -1;

        form.addEventListener('submit', function (e) {
            // Simple validation
            var name = form.querySelector('[name="name"]').value.trim();
            var phone = form.querySelector('[name="phone"]').value.trim();

            if (!name || !phone) {
                e.preventDefault();
                alert('Пожалуйста, заполните имя и телефон.');
                return;
            }

            if (isMailto) {
                e.preventDefault();
                var message = form.querySelector('[name="message"]').value.trim();
                var subject = 'Заявка на прицеп «Кочевник 1» от ' + name;
                var body = 'Имя: ' + name + '\nТелефон: ' + phone + '\n\nСообщение:\n' + (message || '—');
                window.location.href = action + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            } else if (!isFormspree || action.indexOf('YOUR_FORM_ID') !== -1) {
                e.preventDefault();
                alert('Форма пока не настроена. Используйте WhatsApp, Telegram или позвоните по указанному номеру.');
            }
            // If real Formspree URL is set, allow normal submission
        });

        // Simple phone mask
        var phoneInput = form.querySelector('[name="phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', function () {
                var value = this.value.replace(/\D/g, '');
                var formatted = '';

                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        formatted = '+7';
                        value = value.substring(1);
                    } else {
                        formatted = '+' + value[0];
                        value = value.substring(1);
                    }

                    if (value.length > 0) {
                        formatted += ' (' + value.substring(0, 3);
                    }
                    if (value.length >= 3) {
                        formatted += ') ' + value.substring(3, 6);
                    }
                    if (value.length >= 6) {
                        formatted += '-' + value.substring(6, 8);
                    }
                    if (value.length >= 8) {
                        formatted += '-' + value.substring(8, 10);
                    }
                }

                this.value = formatted;
            });
        }
    }
})();
