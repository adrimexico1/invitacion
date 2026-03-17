document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Guest Logic
    let guestData = null;
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id');
    let isPlaying = false;
    const musicBtn = document.getElementById('music-toggle');

    // Drive Link Logic
    const driveLink = document.getElementById('drive-link');
    if (driveLink && CONFIG.DRIVE_URL) {
        driveLink.href = CONFIG.DRIVE_URL;
    }

    async function loadGuestInfo() {
        if (guestId) {
            try {
                const response = await fetch('invitados.json');
                const data = await response.json();
                guestData = data[guestId];

                if (guestData) {
                    // Update Cover Greeting
                    const greetingContainer = document.getElementById('guest-greeting-container');
                    const nameText = document.getElementById('guest-name-text');
                    const ticketText = document.getElementById('guest-tickets-count');
                    const ninosCountText = document.getElementById('guest-ninos-count');
                    const ninosDisplay = document.getElementById('guest-ninos-display');
                    const rsvpNameInput = document.getElementById('rsvp-name-input');

                    if (greetingContainer) greetingContainer.style.display = 'block';
                    if (nameText) nameText.innerText = guestData.name;
                    if (ticketText) ticketText.innerText = guestData.invitados;
                    if (rsvpNameInput) rsvpNameInput.value = guestData.name;

                    if (guestData.ninos > 0) {
                        if (ninosDisplay) ninosDisplay.style.display = 'block';
                        if (ninosCountText) ninosCountText.innerText = guestData.ninos;
                    } else {
                        if (ninosDisplay) ninosDisplay.style.display = 'none';
                    }

                    // Update Form Step 3 Title
                    const step3Title = document.getElementById('rsvp-step3-title');
                    if (step3Title) {
                        step3Title.innerText = guestData.invitados > 1
                            ? `Confirmar acompañantes (${guestData.invitados} boletos)`
                            : `Confirmar asistencia (1 boleto)`;
                    }

                    generateGuestInputs(guestData.invitados);
                    generateNinosInputs(guestData.ninos);
                }
            } catch (error) {
                console.error('Error cargando invitados:', error);
                generateGuestInputs(1);
                generateNinosInputs(0);
            }
        } else {
            // Fallback para visitas manuales sin ID
            generateGuestInputs(1);
            generateNinosInputs(0);
        }
    }

    // Phone input restriction (only numbers)
    const phoneInput = document.getElementById('rsvp-phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    function generateGuestInputs(count) {
        const container = document.getElementById('dynamic-guests-container');
        if (!container) return;

        // Limpiar pero mantener el párrafo informativo
        const infoPara = container.querySelector('p');
        container.innerHTML = '';
        if (infoPara) container.appendChild(infoPara);

        const notice = document.createElement('p');
        notice.style.fontSize = '0.75rem';
        notice.style.color = 'var(--primary-color)';
        notice.style.marginBottom = '2rem';
        notice.style.fontStyle = 'italic';
        notice.innerText = '* Si alguno de tus pases no será utilizado, favor de dejar el espacio en blanco.';
        container.appendChild(notice);

        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'guest-entry';
            div.style.marginBottom = '1.5rem';
            div.innerHTML = `
                <label class="input-label">Nombre del invitado ${i}</label>
                <input type="text" name="guest_name_${i}" class="guest-name-input" 
                       placeholder="Escribir nombre o dejar vacío si no asiste" 
                       value="${i === 1 && guestData ? guestData.name : ''}">
            `;
            container.appendChild(div);
        }
    }

    function generateNinosInputs(count) {
        const container = document.getElementById('dynamic-ninos-container');
        if (!container) return;

        const infoPara = container.querySelector('p');
        container.innerHTML = '';
        if (infoPara) container.appendChild(infoPara);

        if (!count || count <= 0) {
            container.innerHTML = '<p style="color: #888;">No tienes pases de niños asignados.</p>';
            return;
        }

        const notice = document.createElement('p');
        notice.style.fontSize = '0.75rem';
        notice.style.color = 'var(--primary-color)';
        notice.style.marginBottom = '2rem';
        notice.style.fontStyle = 'italic';
        notice.innerText = '* Si alguno de tus pases de niño no será utilizado, favor de dejar el espacio en blanco.';
        container.appendChild(notice);

        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'nino-entry';
            div.style.marginBottom = '1.5rem';
            div.innerHTML = `
                <label class="input-label">Nombre del niño ${i}</label>
                <input type="text" name="nino_name_${i}" class="nino-name-input" 
                       placeholder="Escribir nombre o dejar vacío">
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

                // Start music automatically when opening
                const bgMusic = document.getElementById('bg-music');
                if (bgMusic && !isPlaying) {
                    bgMusic.play().then(() => {
                        isPlaying = true;
                        if (musicBtn) {
                            musicBtn.innerHTML = '<span>&#10074;&#10074;</span>';
                            musicBtn.classList.remove('pulse');
                        }
                    }).catch(error => {
                        console.log("Autoplay blocked by browser. User must click the music button.");
                    });
                }
            }, 800);
        });
    }

    // Countdown Timer
    const weddingDate = new Date('2026-11-28T16:00:00-06:00').getTime();

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
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            const bgMusic = document.getElementById('bg-music');
            if (!bgMusic) return;

            isPlaying = !isPlaying;
            if (isPlaying) {
                bgMusic.play();
                musicBtn.innerHTML = '<span>&#10074;&#10074;</span>';
                musicBtn.classList.remove('pulse');
            } else {
                bgMusic.pause();
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
            const progress = (stepNumber / 6) * 100;
            progressBar.style.width = `${progress}%`;
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

        // Collect children names
        const ninosNameInputs = document.querySelectorAll('.nino-name-input');
        let childrenNames = [];
        ninosNameInputs.forEach(input => {
            if (input.value.trim()) childrenNames.push(input.value.trim());
        });

        const data = {
            full_name: String(formData.get('full_name') || ""),
            attendance: String(formData.get('attendance') || ""),
            plus_one_names: allNames.join(', '),
            ninos_names: childrenNames.join(', '),
            phone: String(formData.get('phone') || ""),
            guest_id: String(guestId || "manual")
        };

        // Show loading state if desired
        const lastBtn = document.querySelector('.rsvp-step[data-step="5"] .btn-next');
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
            updateStep(6);
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
                    } else if (currentStep === 3) {
                        // Si no hay niños, saltamos el paso 4
                        if (!guestData || !guestData.ninos || guestData.ninos <= 0) {
                            updateStep(5); // Saltamos al teléfono
                        } else {
                            updateStep(4);
                        }
                    } else if (currentStep === 4) {
                        updateStep(5); // Del paso niños al teléfono
                    } else if (currentStep === 5) {
                        // Validación de teléfono antes de enviar (Paso final)
                        const phone = formData.get('phone');
                        if (phone && phone.length === 10) {
                            submitRSVP();
                        } else {
                            alert('Por favor ingresa un número de teléfono válido a 10 dígitos');
                        }
                    } else {
                        updateStep(currentStep + 1);
                    }
                } else {
                    alert('Por favor completa los campos requeridos');
                }
            }

            if (e.target.classList.contains('btn-back')) {
                if (currentStep === 5 && (!guestData || !guestData.ninos || guestData.ninos <= 0)) {
                    updateStep(3); // Si volvimos del teléfono y no había niños, vamos al paso 3
                } else {
                    updateStep(currentStep - 1);
                }
            }
        });

    }
});
