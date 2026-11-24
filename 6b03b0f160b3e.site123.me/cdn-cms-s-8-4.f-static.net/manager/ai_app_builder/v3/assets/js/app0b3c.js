// Explain: Site interactions for navigation, FAQ, contact form, and particle effects.
document.addEventListener('DOMContentLoaded', function () {
    var navOpenButton = document.getElementById('navOpenButton');
    var navCloseButton = document.getElementById('navCloseButton');
    var navOverlay = document.getElementById('navOverlay');
    var navCloseLinks = document.querySelectorAll('.nav-close-link');
    var joinForm = document.getElementById('joinForm');
    var faqTriggers = document.querySelectorAll('[data-faq-trigger]');

    function openNav() {
        if (!navOverlay) {
            return;
        }
        navOverlay.classList.remove('hidden');
        navOverlay.classList.add('flex');
        navOverlay.setAttribute('aria-hidden', 'false');
        if (navOpenButton) {
            navOpenButton.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        if (!navOverlay) {
            return;
        }
        navOverlay.classList.add('hidden');
        navOverlay.classList.remove('flex');
        navOverlay.setAttribute('aria-hidden', 'true');
        if (navOpenButton) {
            navOpenButton.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }

    if (navOpenButton) {
        navOpenButton.addEventListener('click', openNav);
    }

    if (navCloseButton) {
        navCloseButton.addEventListener('click', closeNav);
    }

    navCloseLinks.forEach(function (link) {
        link.addEventListener('click', closeNav);
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', function (event) {
            if (event.target === navOverlay) {
                closeNav();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            closeNav();
        }
    });

    faqTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            var panel = document.getElementById(trigger.getAttribute('aria-controls'));
            if (panel) {
                panel.classList.toggle('hidden', isExpanded);
            }
        });
    });

    function showJoinStatus(type, message) {
        var status = document.querySelector('[data-form-status="join"]');
        if (!status) {
            return;
        }
        status.textContent = message;
        status.classList.remove('success', 'error');
        status.classList.add(type);
    }

    function fieldValue(form, fieldName) {
        var el = form.querySelector('[name="' + fieldName + '"]');
        return el ? el.value : '';
    }

    function escapeHtml(text) {
        return String(text === null || text === undefined ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function sendSupportEmail(fields) {
        if (!window.PluginsSystem || typeof window.PluginsSystem.sendRequest !== 'function') {
            return;
        }
        var rows = '';
        fields.forEach(function (item) {
            if (!item.value) {
                return;
            }
            rows += '<p style="margin:0 0 10px;"><strong>' + escapeHtml(item.label) + ':</strong> ' + escapeHtml(item.value) + '</p>';
        });
        var visitorEmail = fields[1] && fields[1].value ? fields[1].value : '';
        window.PluginsSystem.sendRequest('send_email', {
            to: 'bluetonguekingdomsupport@gmail.com',
            subject: 'New Blue Tongue Kingdom message',
            body_html: '<div style="font-family:Arial,sans-serif;color:#123;">' +
                '<h2 style="margin:0 0 14px;">New message from the join form</h2>' +
                rows +
                '</div>',
            reply_to: visitorEmail
        }).catch(function () {
            return null;
        });
    }

    if (joinForm) {
        joinForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!joinForm.checkValidity()) {
                joinForm.reportValidity();
                return;
            }

            if (!window.MessagesSystem || typeof window.MessagesSystem.submit !== 'function') {
                showJoinStatus('error', 'Messaging is unavailable right now. Please try again shortly.');
                return;
            }

            var submitButton = joinForm.querySelector('button[type="submit"]');
            var defaultLabel = submitButton ? (submitButton.getAttribute('data-default-label') || 'Send message') : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }
            showJoinStatus('success', 'Sending your message...');

            var joinFields = [
                { label: 'Name', value: fieldValue(joinForm, 'full_name'), type: 'text' },
                { label: 'Email', value: fieldValue(joinForm, 'email'), type: 'email' },
                { label: 'Discord username', value: fieldValue(joinForm, 'discord'), type: 'text' },
                { label: 'Message', value: fieldValue(joinForm, 'message'), type: 'textarea' }
            ];

            window.MessagesSystem.submit(joinFields, joinForm).then(function (response) {
                if (response && response.success) {
                    joinForm.reset();
                    showJoinStatus('success', 'Thanks for reaching out. A moderator will reply within a day.');
                    sendSupportEmail(joinFields);
                } else {
                    showJoinStatus('error', response && response.error ? response.error : 'Your message could not be sent. Please try again.');
                }
            }).catch(function () {
                showJoinStatus('error', 'A connection issue prevented sending. Please try again.');
            }).finally(function () {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = defaultLabel;
                }
            });
        });
    }

    var canvas = document.getElementById('particles');
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var dots = [];
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function sizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function seedDots() {
            dots = [];
            var count = Math.min(70, Math.max(24, Math.round(window.innerWidth / 22)));
            for (var i = 0; i < count; i++) {
                dots.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.6 + 0.6,
                    speed: Math.random() * 0.35 + 0.1
                });
            }
        }

        function drawDots() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(110, 234, 255, 0.5)';
            dots.forEach(function (dot) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
                ctx.fill();
                dot.y -= dot.speed;
                if (dot.y < -10) {
                    dot.y = canvas.height + 10;
                    dot.x = Math.random() * canvas.width;
                }
            });
            window.requestAnimationFrame(drawDots);
        }

        sizeCanvas();
        seedDots();

        window.addEventListener('resize', function () {
            sizeCanvas();
            seedDots();
        });

        if (!reduceMotion) {
            window.requestAnimationFrame(drawDots);
        } else {
            drawDots();
        }
    }
});