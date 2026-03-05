document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Guest Logic
    let guestData = null;
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');

    async function loadGuestInfo() {
        if (guestId) {
            try {
                const response = await fetch('invitados.json');
                const data = await response.json();
                guestData = data[guestId];

                if (guestData) {
                    // Update Cover Greeting
                    const greeting = document.getElementById('guest-greeting-text');
                    const nameText = document.getElementById('guest-name-text');
                    const ticketText = document.getElementById('guest-tickets-count');
                    const rsvpNameInput = document.getElementById('rsvp-name-input');

                    if (greeting) greeting.style.display = 'block';
                    if (nameText) nameText.innerText = guestData.name;
                    if (ticketText) ticketText.innerText = guestData.invitados;
                    if (rsvpNameInput) rsvpNameInput.value = guestData.name;

                    // Update Form Step 3 Title
                    const step3Title = document.getElementById('rsvp-step3-title');
                    if (step3Title) {
                        step3Title.innerText = guestData.invitados > 1
                            ? `Confirmar acompañantes (${guestData.invitados} boletos)`
                            : `Confirmar asistencia (1 boleto)`;
                    }

                    generateGuestInputs(guestData.invitados);
                }
            } catch (error) {
                console.error('Error cargando invitados:', error);
                generateGuestInputs(1);
            }
        } else {
            // Fallback para visitas manuales sin ID
            generateGuestInputs(1);
        }
    }

    function generateGuestInputs(count) {
        const container = document.getElementById('dynamic-guests-container');
        if (!container) return;

        // Limpiar pero mantener el párrafo informativo
        const infoPara = container.querySelector('p');
        container.innerHTML = '';
        if (infoPara) container.appendChild(infoPara);

        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'guest-entry';
            div.style.marginBottom = '1.5rem';
            div.innerHTML = `
                <label class="input-label">Nombre del invitado ${i}</label>
                <input type="text" name="guest_name_${i}" class="guest-name-input" 
                       placeholder="Escribe el nombre" 
                       value="${i === 1 && guestData ? guestData.name : ''}" required>
            `;
            container.appendChild(div);
        }
    }

    loadGuestInfo();

    // Reveal Invitation
    const cover = document.getElementById('cover');
    const mainInvitation = document.getElementById('main-invitation');
    const openBtn = document.getElementById('open-invitation');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            cover.classList.add('hidden');
            setTimeout(() => {
                cover.style.display = 'none';
                mainInvitation.classList.remove('invitation-hidden');
                mainInvitation.classList.add('invitation-visible');
                window.scrollTo(0, 0);
            }, 800);
        });
    }

    // Countdown Timer
    const weddingDate = new Date('August 2, 2026 16:00:00').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const dateElements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };

        if (dateElements.days) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            dateElements.days.innerText = String(days).padStart(2, '0');
            dateElements.hours.innerText = String(hours).padStart(2, '0');
            dateElements.minutes.innerText = String(minutes).padStart(2, '0');
            dateElements.seconds.innerText = String(seconds).padStart(2, '0');
        }

        if (distance < 0 && document.getElementById('countdown')) {
            clearInterval(timerInterval);
            document.getElementById('countdown').innerHTML = "<h3>¡ES HOY!</h3>";
        }
    };

    const timerInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    // Music Toggle
    const musicBtn = document.getElementById('music-toggle');
    let isPlaying = false;

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                musicBtn.innerHTML = '<span>&#10074;&#10074;</span>';
                musicBtn.classList.remove('pulse');
            } else {
                musicBtn.innerHTML = '<span class="icon-music">&#9835;</span>';
                musicBtn.classList.add('pulse');
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .location-card, .timeline-item').forEach(el => {
        observer.observe(el);
    });

    // RSVP Form Logic & Google Sheets Integration
    const rsvpForm = document.getElementById('rsvp-form');
    const steps = document.querySelectorAll('.rsvp-step');
    const progressBar = document.getElementById('rsvp-progress');
    const SCRIPT_URL = CONFIG.SCRIPT_URL;
    let currentStep = 1;

    function updateStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        const nextStep = document.querySelector(`.rsvp-step[data-step="${stepNumber}"]`);
        if (nextStep) {
            nextStep.classList.add('active');
            currentStep = stepNumber;
            const progress = (stepNumber / 5) * 100;
            progressBar.style.width = `${progress}%`;

            const rsvpSection = document.querySelector('.rsvp-section');
            rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async function submitRSVP() {
        const formData = new FormData(rsvpForm);

        // Dynamic names collection
        const guestNameInputs = document.querySelectorAll('.guest-name-input');
        let allNames = [];
        guestNameInputs.forEach(input => {
            if (input.value.trim()) allNames.push(input.value.trim());
        });

        const data = {
            full_name: formData.get('full_name'),
            attendance: formData.get('attendance'),
            plus_one_names: allNames.join(', '), // Joined by comma as requested
            food: formData.getAll('food').join(', '),
            guest_id: guestId || "manual"
        };

        // Show loading state if desired
        const lastBtn = document.querySelector('.rsvp-step[data-step="4"] .btn-next');
        const originalText = lastBtn.innerText;
        lastBtn.innerText = "Enviando...";
        lastBtn.disabled = true;

        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Basic mode for simple Google Apps Script redirects
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            // Proceed to success step even with no-cors as we assume success
            updateStep(5);
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al enviar tu confirmación. Por favor inténtalo de nuevo.');
            lastBtn.innerText = originalText;
            lastBtn.disabled = false;
        }
    }

    if (rsvpForm) {
        rsvpForm.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-next')) {
                const currentStepEl = e.target.closest('.rsvp-step');
                const inputs = currentStepEl.querySelectorAll('input[required]');
                let valid = true;

                inputs.forEach(input => {
                    if (input.type === 'radio') {
                        const name = input.name;
                        const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                        if (!checked) valid = false;
                    } else if (input.type === 'text' && !input.value) {
                        valid = false;
                    }
                });

                if (valid) {
                    const formData = new FormData(rsvpForm);
                    const attendance = formData.get('attendance');

                    if (currentStep === 2 && attendance === 'no') {
                        // Si no asiste, saltamos directo al envío
                        submitRSVP();
                    } else if (currentStep === 4) {
                        submitRSVP();
                    } else {
                        updateStep(currentStep + 1);
                    }
                } else {
                    alert('Por favor completa los campos requeridos');
                }
            }

            if (e.target.classList.contains('btn-back')) {
                updateStep(currentStep - 1);
            }
        });

    }
});
