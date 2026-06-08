/* ==========================
   LOVE WRAPPED
   SCRIPT.JS - DEEL 1
========================== */

let swiper;
let activeSlideIndex = 0;
let navigationRetryTimer = null;
let travelWinnerDelay = null;
let vacationRunId = 0;
const vacationTimers = new Set();
let navigationButtonsInitialized = false;
let vacationGalleryInitialized = false;
let giftBoxInitialized = false;
let startButtonInitialized = false;
let typewriterTimer = null;
let replayButtonInitialized = false;
let backgroundMusicStarted = false;
let backgroundMusicMuted = false;
let audioContext = null;
let musicInitialized = false;
let netflixEndingPlayed = false;
let netflixEndingTransitioning = false;
let anniversaryRevealStarted = false;
let wrappedStarted = false;
let loveEasterEggInitialized = false;
let giftModalCloseInitialized = false;
let netflixControlsInitialized = false;

/* ==========================
   INIT
========================== */

document.addEventListener("DOMContentLoaded", () => {

    initSwiper();
    initMusic();
    createFloatingHearts();
    initMouseHearts();
    initStartButton();
    initNavigationButtons();
    initGiftBox();
    initVacationGallery();
    initReplayButton();
    initNetflixEnding();

});

/* ==========================
   SWIPER
========================== */

function initSwiper() {

    swiper = new Swiper(".swiper", {

        allowTouchMove: false,

        speed: 0,

        effect: "slide",

        resistanceRatio: 0,

        on: {

            slideChange() {

                if(activeSlideIndex !== this.activeIndex){
                    activeSlideIndex = this.activeIndex;
                    cleanupSlideEffects(this.activeIndex);
                    prepareSlideVisibility(this);
                    handleSlideEntry(this.activeIndex);
                }

            },

            slideChangeTransitionStart() {

                if(activeSlideIndex === this.activeIndex) return;

                activeSlideIndex = this.activeIndex;
                cleanupSlideEffects(this.activeIndex);
                prepareSlideVisibility(this);
                handleSlideEntry(this.activeIndex);

            },

            slideChangeTransitionEnd() {

                finalizeSlideVisibility(this);

            }

        }

    });

    finalizeSlideVisibility(swiper);

}

function prepareSlideVisibility(instance) {

    const activeSlide =
        instance.slides[instance.activeIndex];

    const previousSlide =
        instance.slides[instance.previousIndex];

    if(previousSlide && previousSlide !== activeSlide){
        gsap.killTweensOf(previousSlide);
        gsap.set(previousSlide, {
            opacity: 0,
            visibility: "hidden",
            pointerEvents: "none",
            zIndex: 0
        });
    }

    if(activeSlide){
        gsap.killTweensOf(activeSlide);
        gsap.set(activeSlide, {
            opacity: 1,
            visibility: "visible",
            pointerEvents: "auto",
            zIndex: 2
        });
    }

}

function finalizeSlideVisibility(instance) {

    instance.slides.forEach((slide, index) => {

        gsap.killTweensOf(slide);
        gsap.set(slide, {
            opacity: index === instance.activeIndex ? 1 : 0,
            visibility: index === instance.activeIndex ? "visible" : "hidden",
            pointerEvents: index === instance.activeIndex ? "auto" : "none",
            zIndex: index === instance.activeIndex ? 2 : 0
        });

    });

}

function handleSlideEntry(slideIndex) {

    if(slideIndex === 1){

        animateVisitCounter();

    }

    if(slideIndex === 2){

        animateTravelPercentages();

    }

    if(slideIndex === 3){

        animateTripCounter();
        startVacationJourney();

    }

    if(slideIndex === 4){

        startTypewriter();

    }

    if(slideIndex === 6){

        startNetflixEnding();

    }

    if(slideIndex === 7){

        startAnniversaryReveal();

    }

}

function navigateTo(slideIndex, allowBack = false) {

    if(!swiper) return;

    if(!allowBack && slideIndex < swiper.activeIndex) return;

    if(swiper.animating){

        clearTimeout(navigationRetryTimer);
        navigationRetryTimer = setTimeout(() => navigateTo(slideIndex, allowBack), 180);
        return;

    }

    swiper.slideTo(slideIndex);

}

function cleanupSlideEffects(nextSlideIndex) {

    if(travelWinnerDelay){
        travelWinnerDelay.kill();
        travelWinnerDelay = null;
    }

    if(nextSlideIndex !== 3){
        cancelVacationTimers();
        vacationRunId++;
        document
            .querySelectorAll(".destination-intro, .slideshow-container, .memory-unlocked")
            .forEach(element => element.remove());
    }

    gsap.killTweensOf([
        ".swiper-slide",
        ".person-card",
        ".winner-trophy",
        ".winner-label",
        "#winnerAnnouncement",
        ".destination-intro",
        ".slideshow-container",
        ".slideshow-photo",
        ".memory-unlocked",
        ".gallery-panel",
        ".memory-image",
        "#toLetter",
        "#netflixEndingVideo",
        "#netflixFade",
        ".netflix-video-controls",
        ".netflix-skip-indicator",
        ".ending-screen > *",
        ".ending-rays",
        ".ending-particles"
    ]);

    if(nextSlideIndex !== 6){
        pauseNetflixVideo();
    }

    if(nextSlideIndex !== 4 && typewriterTimer){
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
    }

}

function scheduleVacationTimer(callback, delay) {

    const timer = setTimeout(() => {
        vacationTimers.delete(timer);
        callback();
    }, delay);

    vacationTimers.add(timer);
    return timer;

}

function cancelVacationTimers() {

    vacationTimers.forEach(timer => clearTimeout(timer));
    vacationTimers.clear();

}

function initNavigationButtons() {

    if(navigationButtonsInitialized) return;
    navigationButtonsInitialized = true;

    document
        .getElementById("continueToTravel")
        .addEventListener("click", () => {
            playUiInteractionSound();
            navigateTo(2);
        });

    document
        .getElementById("toVacation")
        .addEventListener("click", () => {
            playUiInteractionSound();
            navigateTo(3);
        });

    document
        .getElementById("toLetter")
        .addEventListener("click", () => {
            playUiInteractionSound();
            goToLetterSlide();
        });

    document
        .getElementById("openGiftButton")
        .addEventListener("click", () => {
            playUiInteractionSound();
            goToGiftScreen();
        });

    document
        .getElementById("finishStoryButton")
        .addEventListener("click", () => {
            playUiInteractionSound();
            goToNetflixEnding();
        });

}

/* ==========================
   MUZIEK
========================== */

function legacyInitMusicDisabled() {

    const music = document.getElementById("bgMusic");
    const btn = document.getElementById("musicToggle");

    let playing = false;

    btn.addEventListener("click", async () => {

        try {

            if (!playing) {

                await music.play();

                playing = true;
                btn.innerHTML = "⏸️";

            } else {

                music.pause();

                playing = false;
                btn.innerHTML = "🎵";

            }

        } catch (e) {

            console.log(e);

        }

    });

}

/* ==========================
   FLOATING HEARTS
========================== */

function initMusic() {

    if(musicInitialized) return;
    musicInitialized = true;

    const music = document.getElementById("bgMusic");
    const btn = document.getElementById("musicToggle");

    if(!music || !btn) return;

    music.loop = true;
    music.volume = 0;
    music.muted = false;

    btn.addEventListener("click", () => {

        backgroundMusicMuted = !backgroundMusicMuted;
        music.muted = backgroundMusicMuted;
        btn.innerHTML = backgroundMusicMuted ? "🔇" : "🎵";

    });

}

async function startBackgroundMusic() {

    const music =
        document.getElementById("bgMusic");

    if(!music || backgroundMusicStarted) return;

    backgroundMusicStarted = true;
    music.loop = true;
    music.volume = 0;
    music.muted = backgroundMusicMuted;

    try {

        await music.play();

        gsap.to(music, {
            volume: 0.2,
            duration: 2,
            ease: "power2.out"
        });

    } catch (error) {

        backgroundMusicStarted = false;
        console.log(error);

    }

}

function fadeBackgroundMusicTo(volume, duration = 1.2) {

    const music =
        document.getElementById("bgMusic");

    if(!music || backgroundMusicMuted) return;

    gsap.killTweensOf(music);

    gsap.to(music, {
        volume,
        duration,
        ease: "power2.out"
    });

}

function getAudioContext() {

    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if(!AudioContextClass) return null;

    if(!audioContext){
        audioContext = new AudioContextClass();
    }

    if(audioContext.state === "suspended"){
        audioContext.resume().catch(() => {});
    }

    return audioContext;

}

function playUiInteractionSound() {

    const context =
        getAudioContext();

    if(!context) return;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

}

function playGiftOpenSound() {

    const sound =
        document.getElementById("giftOpenSound");

    if(!sound) return;

    sound.loop = false;
    sound.volume = 0.7;
    sound.currentTime = 0;
    sound.play().catch(() => {});

}

function createFloatingHearts() {

    const container =
        document.getElementById("hearts-container");

    setInterval(() => {

        const heart =
            document.createElement("div");

        heart.classList.add("heart");

        heart.innerHTML = "❤️";

        heart.style.left =
            Math.random() * 100 + "%";

        heart.style.bottom = "-50px";

        heart.style.fontSize =
            (Math.random() * 20 + 10) + "px";

        heart.style.opacity =
            Math.random();

        heart.style.animationDuration =
            (Math.random() * 6 + 5) + "s";

        container.appendChild(heart);

        setTimeout(() => {

            heart.remove();

        }, 12000);

    }, 250);

}

/* ==========================
   MOUSE HEARTS
========================== */

function initMouseHearts() {

    document.addEventListener(
        "mousemove",
        (e) => {

            if (Math.random() > 0.7) {

                const heart =
                    document.createElement("div");

                heart.innerHTML = "💖";

                heart.style.position = "fixed";

                heart.style.left =
                    e.clientX + "px";

                heart.style.top =
                    e.clientY + "px";

                heart.style.pointerEvents = "none";

                heart.style.zIndex = "999";

                document.body.appendChild(heart);

                gsap.to(heart, {

                    y: -80,
                    x: (Math.random() - 0.5) * 60,

                    opacity: 0,

                    duration: 1.5,

                    ease: "power2.out",

                    onComplete() {

                        heart.remove();

                    }

                });

            }

        });

}

/* ==========================
   START BUTTON
========================== */

function initStartButton() {

    if(startButtonInitialized) return;
    startButtonInitialized = true;

    const btn =
        document.getElementById("startWrapped");

    btn.addEventListener("click", () => {

        if(wrappedStarted) return;

        wrappedStarted = true;
        btn.disabled = false;

        startBackgroundMusic();

        launchHeartExplosion();

        screenFlash();

        playWhoosh();

        gsap.timeline()
        .to(".start-screen", {

            scale: 1.2,

            opacity: 0,

            duration: 1.5,

            ease: "power3.inOut"

        })
        .call(() => navigateTo(1));

    });

}

/* ==========================
   SCREEN FLASH
========================== */

function screenFlash() {

    const flash =
        document.createElement("div");

    flash.style.position = "fixed";
    flash.style.inset = "0";
    flash.style.zIndex = "99999";
    flash.style.pointerEvents = "none";

    flash.style.background =
        "linear-gradient(45deg,#ff3f8d,#ff7bb5,#ff2e63)";

    document.body.appendChild(flash);

    gsap.fromTo(
        flash,
        { opacity: 1 },
        {
            opacity: 0,
            duration: 0.6,
            onComplete: () => flash.remove()
        }
    );

}

/* ==========================
   HEART EXPLOSION
========================== */

function launchHeartExplosion() {

    for (let i = 0; i < 400; i++) {

        const heart =
            document.createElement("div");

        heart.innerHTML = "❤️";

        heart.style.position = "fixed";

        heart.style.left = "50%";
        heart.style.top = "50%";

        heart.style.fontSize =
            Math.random() * 25 + 10 + "px";

        heart.style.pointerEvents = "none";

        document.body.appendChild(heart);

        const angle =
            Math.random() * Math.PI * 2;

        const distance =
            Math.random() * 900;

        gsap.to(heart, {

            x: Math.cos(angle) * distance,

            y: Math.sin(angle) * distance,

            rotation:
            Math.random() * 720,

            opacity: 0,

            duration:
            Math.random() * 3 + 2,

            ease: "power3.out",

            onComplete() {

                heart.remove();

            }

        });

    }

    heartConfetti();

}

/* ==========================
   CONFETTI
========================== */

function heartConfetti() {

    confetti({

        particleCount: 300,

        spread: 180,

        startVelocity: 45,

        scalar: 1.2,

        origin: {

            x: 0.5,
            y: 0.5

        }

    });

}

/* ==========================
   WHOOSH AUDIO
========================== */

function playWhoosh() {

    playUiInteractionSound();

}

/* ==========================
   GSAP INTRO
========================== */

gsap.from(".main-title", {

    y: 80,

    opacity: 0,

    duration: 1.5,

    ease: "power4.out"

});

gsap.from(".subtitle", {

    y: 40,

    opacity: 0,

    duration: 1.5,

    delay: 0.4

});

gsap.fromTo(
    "#startWrapped",
    {

        scale: 0

    },
    {

        scale: 1,

        opacity: 1,

        visibility: "visible",

        pointerEvents: "auto",

        duration: 1,

        delay: 0.8,

        ease: "back.out(1.7)",

        clearProps: "transform"

    }
);

/* ==========================
   SCRIPT.JS - DEEL 2
   SLIDE 1 + SLIDE 2
========================== */

/* ==========================
   VISIT COUNTER
========================== */

function animateVisitCounter() {

    const counter =
        document.getElementById("visitCounter");

    const crown =
        document.getElementById("crown");

    let value = { count: 0 };

    gsap.to(value, {

        count: 64,

        duration: 3,

        ease: "power4.out",

        onUpdate: () => {

            counter.innerHTML =
                Math.floor(value.count);

            spawnCounterHearts();

        },

        onComplete: () => {

            counter.innerHTML = "64";

            crown.classList.remove("hidden");

            gsap.fromTo(
                crown,
                {
                    scale: 0,
                    rotation: -180
                },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 1,
                    ease: "elastic.out(1,0.5)"
                }
            );

            gsap.to(counter, {

                scale: 1.25,

                repeat: 4,

                yoyo: true,

                duration: 0.25

            });

            heartFireworks();

        }

    });

}

/* ==========================
   HEARTS DURING COUNTING
========================== */

function spawnCounterHearts() {

    const heart =
        document.createElement("div");

    heart.innerHTML = "💖";

    heart.style.position = "fixed";

    heart.style.left =
        (window.innerWidth / 2) + "px";

    heart.style.top =
        (window.innerHeight / 2) + "px";

    heart.style.fontSize =
        (Math.random() * 20 + 15) + "px";

    heart.style.pointerEvents = "none";

    document.body.appendChild(heart);

    gsap.to(heart, {

        y: -250,

        x: (Math.random() - 0.5) * 300,

        rotation:
            Math.random() * 360,

        opacity: 0,

        duration: 2,

        ease: "power2.out",

        onComplete() {

            heart.remove();

        }

    });

}

/* ==========================
   HEART FIREWORKS
========================== */

function heartFireworks() {

    for (let i = 0; i < 120; i++) {

        const heart =
            document.createElement("div");

        heart.innerHTML = "❤️";

        heart.style.position = "fixed";

        heart.style.left = "50%";
        heart.style.top = "50%";

        heart.style.fontSize =
            (Math.random() * 20 + 12) + "px";

        document.body.appendChild(heart);

        const angle =
            Math.random() * Math.PI * 2;

        const radius =
            Math.random() * 450;

        gsap.to(heart, {

            x:
            Math.cos(angle) * radius,

            y:
            Math.sin(angle) * radius,

            opacity: 0,

            rotation:
            Math.random() * 720,

            duration:
            Math.random() * 2 + 1,

            ease: "power3.out",

            onComplete() {

                heart.remove();

            }

        });

    }

}

/* ==========================
   SLIDE 2 ANIMATION
========================== */

function animateTravelPercentages() {

    const cards =
        document.querySelectorAll(".person-card");

    const felix =
        document.querySelector('[data-person="felix"]');

    const beatrice =
        document.querySelector('[data-person="beatrice"]');

    if(!felix || !beatrice) return;

    beatrice.classList.remove("winner");
    felix.classList.remove("loser");

    gsap.set("#winnerAnnouncement", {
        autoAlpha: 0
    });

    gsap.set(cards, {
        clearProps: "transform",
        display: "block",
        opacity: 1,
        visibility: "visible"
    });

    gsap.set(".winner-trophy, .winner-label, .loser-label", {
        autoAlpha: 1
    });

    gsap.timeline()
    .from(felix, {
        y: 90,
        duration: 0.9,
        ease: "back.out(1.7)"
    })
    .from(beatrice, {
        scale: 0.96,
        duration: 0.95,
        ease: "back.out(1.7)"
    }, "-=0.25");

    animatePercentageNumbers();

    drawTravelRoutes();

}

/* ==========================
   PERCENTAGES
========================== */

function animatePercentageNumbers() {

    const percentages =
        document.querySelectorAll(".percentage");

    const targets = [
        18.75,
        81.25
    ];

    const timeline = gsap.timeline({
        onComplete() {

            travelWinnerDelay = gsap.delayedCall(3.4, highlightWinner);

        }
    });

    percentages.forEach((element, index) => {

        const obj = {
            value: 0
        };

        timeline.to(obj, {

            value: targets[index],

            duration: 2.5,

            ease: "power3.out",

            onUpdate() {

                element.innerHTML =
                    obj.value.toFixed(2) + "%";

            }

        }, 0);

    });

}

/* ==========================
   WINNER GLOW
========================== */

function highlightWinner() {

    const winner =
        document.querySelector('[data-person="beatrice"]');

    const loser =
        document.querySelector('[data-person="felix"]');

    if(!winner || !loser || !swiper || swiper.activeIndex !== 2) return;

    winner.classList.add("winner");
    loser.classList.add("loser");

    gsap.timeline()
    .fromTo(
        winner,
        {
            scale: 0.95,
            rotationY: -12
        },
        {
            scale: 1.12,
            rotationY: 0,
            boxShadow: "0 0 80px rgba(255,216,111,1)",
            duration: 1.45,
            ease: "elastic.out(1,0.45)"
        }
    )
    .to(winner, {
        scale: 1,
        duration: 0.65,
        ease: "power2.out"
    })
    .to(loser, {
        scale: 0.9,
        duration: 0.8,
        ease: "power3.out"
    }, "-=1.1")
    .fromTo(
        ".winner-trophy",
        {
            rotation: -30,
            scale: 0
        },
        {
            rotation: 0,
            scale: 1,
            duration: 1.45,
            ease: "bounce.out"
        },
        "-=0.4"
    )
    .fromTo(
        ".winner-label",
        {
            scale: 0.92
        },
        {
            scale: 1,
            duration: 0.8,
            ease: "power3.out"
        },
        "-=0.65"
    )
    .fromTo(
        "#winnerAnnouncement",
        {
            autoAlpha: 0,
            scale: 0.98
        },
        {
            autoAlpha: 1,
            scale: 1,
            duration: 1.05,
            ease: "power3.out"
        },
        "-=0.5"
    )
    .call(() => {

        document
            .getElementById("toVacation")
            .classList.remove("hidden");

    });

    confetti({

        particleCount: 120,

        spread: 100,

        origin: {
            y: 0.6
        }

    });

}

/* ==========================
   ROUTE ANIMATION
========================== */

function drawTravelRoutes() {

    const route =
        document.createElement("div");

    route.style.position = "fixed";

    route.style.width = "400px";
    route.style.height = "400px";

    route.style.border =
        "4px dashed rgba(255,255,255,.25)";

    route.style.borderRadius = "50%";

    route.style.left = "50%";
    route.style.top = "50%";

    route.style.transform =
        "translate(-50%, -50%)";

    route.style.pointerEvents = "none";

    document.body.appendChild(route);

    gsap.from(route, {

        scale: 0,

        rotation: 360,

        duration: 2,

        ease: "power3.out"

    });

    setTimeout(() => {

        gsap.to(route, {

            opacity: 0,

            duration: 1,

            onComplete() {

                route.remove();

            }

        });

    }, 4500);

}

/* ==========================
   TRIP COUNTER
========================== */

function animateTripCounter() {

    const tripCounter =
        document.getElementById("tripCounter");

    let value = {
        count: 0
    };

    gsap.to(value, {

        count: 4,

        duration: 2,

        ease: "power4.out",

        onUpdate() {

            tripCounter.innerHTML =
                Math.floor(value.count);

        }

    });

    gsap.from(tripCounter, {

        scale: 0,

        duration: 1,

        ease: "elastic.out(1,0.5)"

    });

}

/* ==========================
   SCRIPT.JS - DEEL 3
   VACATIONS SYSTEM
========================== */

const destinations = [

    {
        key: "crete",
        name: "Kreta, Griekenland",
        images: [
            "assets/images/crete/1.JPG",
            "assets/images/crete/2.JPG",
            "assets/images/crete/3.jpg",
            "assets/images/crete/4.JPG",
            "assets/images/crete/5.JPG"
        ]
    },

    {
        key: "paris",
        name: "Parijs, Frankrijk",
        images: [
            "assets/images/paris/1.JPG",
            "assets/images/paris/2.JPG",
            "assets/images/paris/3.JPG",
            "assets/images/paris/4.JPG",
            "assets/images/paris/5.JPG"
        ]
    },

    {
        key: "fuerteventura",
        name: "Costa Calma, Fuerteventura",
        images: [
            "assets/images/fuerteventura/1.JPG",
            "assets/images/fuerteventura/2.JPG",
            "assets/images/fuerteventura/3.JPG",
            "assets/images/fuerteventura/4.JPG",
            "assets/images/fuerteventura/5.JPG"
        ]
    },

    {
        key: "portugal",
        name: "Parchal, Portugal",
        images: [
            "assets/images/portugal/1.JPG",
            "assets/images/portugal/2.jpg",
            "assets/images/portugal/3.JPG",
            "assets/images/portugal/4.JPG",
            "assets/images/portugal/5.JPG"
        ]
    }

];

const viewedDestinations = new Set();
let selectedDestination = null;
let lightboxIndex = 0;
let vacationGalleryReady = false;
let vacationJourneyStarted = false;
let vacationJourneyCompleted = false;

/* ==========================
   START DESTINATIONS
========================== */

function startVacationJourney() {

    if(swiper.activeIndex !== 3) return;
    if(vacationJourneyStarted) return;

    vacationJourneyStarted = true;
    vacationRunId++;

    const runId = vacationRunId;

    prepareVacationStoryMode();

    gsap.from(".destination", {
        x: -50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out"
    });

    showDestinationStory(0, runId);

}

function prepareVacationStoryMode() {

    const title =
        document.getElementById("vacationTitle");

    if(title){
        title.textContent = "Our Adventures Together ✈️❤️";
    }

    document
        .getElementById("toLetter")
        .classList.add("hidden");

    document
        .querySelector(".vacation-gallery-layout")
        .classList.add("journey-hidden");

    document.querySelectorAll(".destination").forEach(button => {
        button.classList.remove("selected", "visited");
    });

    const panel =
        document.getElementById("galleryPanel");

    panel.innerHTML = `
        <div class="gallery-placeholder">
            Relive each destination after the journey completes ❤️
        </div>
    `;

}

function showDestinationStory(index, runId) {

    if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3) return;

    if(index >= destinations.length){
        revealVacationGallery(runId);
        return;
    }

    const destination =
        destinations[index];

    showDestinationIntro(destination, runId, () => {

        startDestinationSlideshow(destination, runId, () => {

            if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3) return;

            viewedDestinations.add(destination.key);
            markDestinationVisited(destination.key);

            memoryUnlocked(runId, () => {
                showDestinationStory(index + 1, runId);
            });

        });

    });

}

function showDestinationIntro(destination, runId, onComplete) {

    const intro =
        document.createElement("div");

    intro.className =
        "destination-intro";

    intro.innerHTML = `
        <div class="destination-overlay">
            <h1 class="country-title">${destination.name}</h1>
        </div>
    `;

    document.body.appendChild(intro);

    gsap.fromTo(intro, {
        opacity: 0,
        scale: 1.08
    }, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "power3.out"
    });

    flyPlaneAnimation();

    scheduleVacationTimer(() => {

        if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3){
            intro.remove();
            return;
        }

        gsap.to(intro, {
            opacity: 0,
            scale: 0.98,
            duration: 0.65,
            ease: "power2.inOut",
            onComplete() {
                intro.remove();
                if(onComplete) onComplete();
            }
        });

    }, 1900);

}

function markDestinationVisited(destinationKey) {

    document.querySelectorAll(".destination").forEach(button => {
        button.classList.toggle("visited", viewedDestinations.has(button.dataset.destination));
        button.classList.toggle("selected", button.dataset.destination === destinationKey);
    });

    restoreDestinationButtons();

}

function restoreDestinationButtons() {

    gsap.killTweensOf(".destination");

    document.querySelectorAll(".destination").forEach(button => {

        gsap.set(button, {
            opacity: 1,
            autoAlpha: 1,
            display: "block",
            visibility: "visible"
        });

    });

}

function revealVacationGallery(runId) {

    if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3) return;

    vacationJourneyCompleted = true;
    vacationGalleryReady = true;

    const title =
        document.getElementById("vacationTitle");

    if(title){
        title.textContent = "Relive Our Adventures ❤️";
    }

    const layout =
        document.querySelector(".vacation-gallery-layout");

    layout.classList.remove("journey-hidden");

    gsap.fromTo(layout, {
        opacity: 0,
        y: 35
    }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    });

    const firstDestinationButton =
        document.querySelector('.destination[data-destination="crete"]');

    if(firstDestinationButton){
        openDestinationGallery("crete", firstDestinationButton);
    }

    const letterButton =
        document.getElementById("toLetter");

    letterButton.classList.remove("hidden");

    gsap.fromTo(letterButton, {
        opacity: 0,
        y: 24
    }, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "back.out(1.7)"
    });

}

function initVacationGallery() {

    if(vacationGalleryInitialized) return;
    vacationGalleryInitialized = true;

    document.querySelectorAll(".destination").forEach(button => {

        button.addEventListener("click", () => {

            openDestinationGallery(button.dataset.destination, button);

        });

    });

    document
        .getElementById("closeLightbox")
        .addEventListener("click", closeLightbox);

    document
        .getElementById("previousImage")
        .addEventListener("click", () => changeLightboxImage(-1));

    document
        .getElementById("nextImage")
        .addEventListener("click", () => changeLightboxImage(1));

    document
        .getElementById("galleryLightbox")
        .addEventListener("click", event => {

            if(event.target.id === "galleryLightbox"){

                closeLightbox();

            }

        });

}

function openDestinationGallery(destinationKey, selectedButton) {

    const destination =
        destinations.find(item => item.key === destinationKey);

    if(!destination) return;

    selectedDestination = destination;
    viewedDestinations.add(destinationKey);

    document.querySelectorAll(".destination").forEach(button => {

        button.classList.toggle("selected", button.dataset.destination === destinationKey);
        button.classList.toggle("visited", viewedDestinations.has(button.dataset.destination));

    });

    restoreDestinationButtons();

    const panel =
        document.getElementById("galleryPanel");

    panel.innerHTML = `
        <div class="gallery-heading">
            <span>Travel memory</span>
            <h3>${destination.name}</h3>
        </div>
        <div class="memory-grid">
            ${destination.images.map((image, index) => `
                <button class="memory-image" data-image-index="${index}" aria-label="Open photo ${index + 1}">
                    <img src="${image}" alt="${destination.name} photo ${index + 1}" data-fallback="${createLocalImagePlaceholder(destination.name, index + 1)}">
                </button>
            `).join("")}
        </div>
    `;

    panel.querySelectorAll(".memory-image img").forEach(image => {

        image.addEventListener("error", () => {
            image.src = image.dataset.fallback;
        }, { once: true });

    });

    panel.querySelectorAll(".memory-image").forEach(button => {

        button.addEventListener("click", () => {

            openLightbox(Number(button.dataset.imageIndex));

        });

    });

    gsap.fromTo(
        panel,
        {
            opacity: 0,
            x: 45
        },
        {
            opacity: 1,
            x: 0,
            duration: 0.65,
            ease: "power3.out"
        }
    );

    gsap.from(".memory-image", {
        y: 30,
        opacity: 0,
        scale: 0.94,
        stagger: 0.08,
        duration: 0.55,
        ease: "power3.out"
    });

    if(vacationJourneyCompleted){

        document
            .getElementById("toLetter")
            .classList.remove("hidden");

    }

}

function openLightbox(index) {

    if(!selectedDestination) return;

    restoreDestinationButtons();

    lightboxIndex = index;
    updateLightboxImage();

    const lightbox =
        document.getElementById("galleryLightbox");

    lightbox.classList.remove("hidden");

    gsap.fromTo(lightbox, { opacity: 0 }, {
        opacity: 1,
        duration: 0.35
    });

    gsap.fromTo("#lightboxImage", {
        scale: 0.88,
        opacity: 0
    }, {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out"
    });

}

function updateLightboxImage() {

    const image =
        document.getElementById("lightboxImage");

    image.src = selectedDestination.images[lightboxIndex];
    image.alt = `${selectedDestination.name} photo ${lightboxIndex + 1}`;
    image.onerror = () => {
        image.src = createLocalImagePlaceholder(selectedDestination.name, lightboxIndex + 1);
    };

    document.getElementById("lightboxCounter").textContent =
        `${lightboxIndex + 1} / ${selectedDestination.images.length}`;

}

function createLocalImagePlaceholder(destinationName, imageNumber) {

    const label =
        `${destinationName} ${imageNumber}`;

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff5ea8"/>
                    <stop offset="100%" stop-color="#420027"/>
                </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#bg)"/>
            <circle cx="980" cy="140" r="190" fill="#ffd86f" opacity=".22"/>
            <text x="600" y="365" fill="#ffffff" font-size="58" font-family="Poppins, Arial, sans-serif" font-weight="700" text-anchor="middle">Memory photo</text>
            <text x="600" y="445" fill="#ffd86f" font-size="42" font-family="Poppins, Arial, sans-serif" text-anchor="middle">${label}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

}

function changeLightboxImage(direction) {

    if(!selectedDestination) return;

    restoreDestinationButtons();

    lightboxIndex =
        (lightboxIndex + direction + selectedDestination.images.length) %
        selectedDestination.images.length;

    gsap.to("#lightboxImage", {
        opacity: 0,
        x: direction * -35,
        duration: 0.2,
        onComplete() {

            updateLightboxImage();

            gsap.fromTo("#lightboxImage", {
                opacity: 0,
                x: direction * 35
            }, {
                opacity: 1,
                x: 0,
                duration: 0.35,
                ease: "power2.out"
            });

        }
    });

}

function closeLightbox() {

    const lightbox =
        document.getElementById("galleryLightbox");

    restoreDestinationButtons();

    gsap.to(lightbox, {
        opacity: 0,
        duration: 0.25,
        onComplete() {

            lightbox.classList.add("hidden");
            restoreDestinationButtons();

        }
    });

}

/* ==========================
   DESTINATION INTRO
========================== */

function legacyShowDestination(index) {

    return;

    if(index >= destinations.length){

        vacationJourneyActive = false;
        completedDestinations = destinations.length;

        document
            .getElementById("toLetter")
            .classList.remove("hidden");

        return;
    }

    const destination = destinations[index];

    const intro =
        document.createElement("div");

    intro.className =
        "destination-intro";

    intro.innerHTML = `

        <div class="destination-overlay">

            <h1 class="country-title">
                ${destination.name}
            </h1>

            <div class="country-flag">
                ${destination.flag}
            </div>

        </div>

    `;

    document.body.appendChild(intro);

    gsap.fromTo(
        intro,
        {
            opacity: 0,
            scale: 1.4
        },
        {
            opacity: 1,
            scale: 1,
            duration: 1.5
        }
    );

    flyPlaneAnimation();

    setTimeout(() => {

        gsap.to(intro, {

            opacity: 0,

            duration: 1,

            onComplete() {

                intro.remove();

                startDestinationSlideshow(destination);

            }

        });

    }, 2500);

}

/* ==========================
   AIRPLANE TRANSITION
========================== */

function flyPlaneAnimation() {

    const plane =
        document.createElement("div");

    plane.innerHTML = "✈️";

    plane.style.position = "fixed";

    plane.style.top = "40%";
    plane.style.left = "-100px";

    plane.style.fontSize = "60px";

    plane.style.zIndex = "9999";

    document.body.appendChild(plane);

    gsap.to(plane, {

        x: window.innerWidth + 400,

        duration: 2.5,

        ease: "power2.inOut",

        onComplete() {

            plane.remove();

        }

    });

}

/* ==========================
   PHOTO SLIDESHOW
========================== */

function startDestinationSlideshow(destination, runId, onComplete) {

    const slideshow =
        document.createElement("div");

    slideshow.className =
        "slideshow-container";

    document.body.appendChild(slideshow);

    let currentPhoto = 0;

    function showNextPhoto() {

        if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3){
            slideshow.remove();
            return;
        }

        if(currentPhoto >= destination.images.length){

            gsap.to(slideshow, {
                opacity: 0,
                duration: 0.45,
                onComplete() {
                    slideshow.remove();
                    if(onComplete) onComplete();
                }
            });

            return;
        }

        const photo =
            document.createElement("img");

        const imageNumber =
            currentPhoto + 1;

        photo.src =
            destination.images[currentPhoto];

        photo.className =
            "slideshow-photo";

        photo.onerror = () => {
            photo.src = createLocalImagePlaceholder(destination.name, imageNumber);
        };

        const previousPhoto =
            slideshow.querySelector(".slideshow-photo");

        slideshow.appendChild(photo);

        gsap.fromTo(
            photo,
            {
                opacity: 0,
                scale: 1.08,
                filter: "blur(18px)"
            },
            {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.9,
                ease: "power3.out"
            }
        );

        if(previousPhoto){
            gsap.to(previousPhoto, {
                opacity: 0,
                scale: 0.94,
                filter: "blur(12px)",
                duration: 0.8,
                ease: "power2.inOut",
                onComplete() {
                    previousPhoto.remove();
                }
            });
        }

        currentPhoto++;

        scheduleVacationTimer(showNextPhoto, 2500);

    }

    showNextPhoto();

}

/* ==========================
   MEMORY UNLOCKED
========================== */

function memoryUnlocked(runId, onComplete) {

    if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3) return;

    const achievement =
        document.createElement("div");

    achievement.className =
        "memory-unlocked";

    achievement.innerHTML = `

        <div class="achievement-card">

            🏆 Memory Unlocked ❤️

        </div>

    `;

    document.body.appendChild(
        achievement
    );

    gsap.fromTo(
        achievement,
        {
            scale: 0,
            opacity: 0
        },
        {
            scale: 1,
            opacity: 1,
            duration: 1
        }
    );

    scheduleVacationTimer(() => {

        if(runId !== vacationRunId || !swiper || swiper.activeIndex !== 3){
            achievement.remove();
            return;
        }

        gsap.to(achievement, {

            opacity: 0,

            duration: 1,

            onComplete() {

                achievement.remove();
                if(onComplete) onComplete();

            }

        });

    }, 2500);

}

/* ==========================
   PHOTO BAR
========================== */

function createPhotoBar(destination) {

    const bar =
        document.createElement("div");

    bar.className = "photo-bar";

    for(let i = 1; i <= 4; i++){

        const card =
            document.createElement("div");

        card.className =
            "photo-card";

        card.innerHTML = `

            <img
             src="${destination.folder}${i}.jpg"
             onerror="this.src='https://via.placeholder.com/300x200?text=Photo'"
            >

        `;

        bar.appendChild(card);

    }

    document.body.appendChild(bar);

    gsap.from(bar, {

        y: 100,

        opacity: 0,

        duration: 1.5

    });

    setTimeout(() => {

        gsap.to(bar, {

            opacity: 0,

            duration: 1,

            onComplete() {

                bar.remove();

            }

        });

    }, 3500);

}

/* ==========================
   PHOTO CARD HOVER
========================== */

document.addEventListener("mouseover", e => {

    if(e.target.closest(".photo-card")){

        gsap.to(
            e.target.closest(".photo-card"),
            {
                scale: 1.08,
                duration: .3
            }
        );

    }

});

document.addEventListener("mouseout", e => {

    if(e.target.closest(".photo-card")){

        gsap.to(
            e.target.closest(".photo-card"),
            {
                scale: 1,
                duration: .3
            }
        );

    }

});

/* ==========================
   GO TO LETTER SLIDE
========================== */

function goToLetterSlide() {

    if(!vacationJourneyCompleted) return;

    navigateTo(4);
}

/* ==========================
   SCRIPT.JS - DEEL 4
   LETTER + GIFT + ENDING
========================== */

/* ==========================
   TYPEWRITER MESSAGE
========================== */

const loveMessage = `Dit was een kleine overzicht van ons jaar samen.

Ik dank God dat onze paden zijn gekruist.

Mogen nog vele jaren komen.

We hebben in onze tijd samen veel stappen gezet en hebben denk ik beide iets unlocked wat we eerder niet wisten van onszelf.

Dus ik hoop op een mooie beautiful relatie waarin al onze wensen uitkomen.`;

let letterTypingStarted = false;

function startTypewriter() {

    const container =
        document.getElementById("typewriter");

    if(!container) return;
    if(letterTypingStarted) return;

    letterTypingStarted = true;

    if(typewriterTimer){
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
    }

    container.textContent = "";

    gsap.set(container, {
        opacity: 1,
        visibility: "visible",
        y: 0
    });

    let index = 0;

    const firstLineEnd =
        loveMessage.indexOf("\n");

    function scheduleNextCharacter() {

        const delay =
            index <= firstLineEnd ? 5 : 22;

        typewriterTimer =
            setTimeout(typeNextCharacter, delay);

    }

    function typeNextCharacter() {

        container.textContent += loveMessage.charAt(index);
        index++;

        if(index >= loveMessage.length){
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
            return;
        }

        scheduleNextCharacter();

    }

    typeNextCharacter();

    showChocolateKing();

    const giftButton =
        document.getElementById("openGiftButton");

    giftButton.classList.remove("hidden");

    gsap.fromTo(giftButton, {
        opacity: 0,
        y: 22
    }, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "back.out(1.7)"
    });

}

/* ==========================
   HEARTS WHILE TYPING
========================== */

function spawnTypingHeart() {

    if(Math.random() > 0.5){

        const heart =
            document.createElement("div");

        heart.innerHTML = "❤️";

        heart.style.position = "fixed";

        heart.style.left =
            Math.random() * window.innerWidth + "px";

        heart.style.top =
            window.innerHeight + "px";

        heart.style.fontSize =
            (Math.random()*15+10)+"px";

        document.body.appendChild(heart);

        gsap.to(heart,{

            y:-window.innerHeight-200,

            opacity:0,

            duration:6,

            ease:"none",

            onComplete(){
                heart.remove();
            }

        });

    }

}

/* ==========================
   CHOCOLATE KING EFFECT
========================== */

function showChocolateKing() {

    const signature =
        document.querySelector(".signature");

    if(!signature) return;

    const crown =
        document.createElement("div");

    crown.id = "kingCrown";

    crown.innerHTML = "👑";

    crown.style.fontSize = "3rem";

    crown.style.marginBottom = "10px";

    signature.prepend(crown);

    gsap.from(crown, {

        y: -80,

        opacity: 0,

        duration: 1.5,

        ease: "bounce.out"

    });

    createKingHearts();

    crown.addEventListener("click", () => {

        showPopup(
            "Chocolate King Mode Activated 🍫👑"
        );

        heartConfetti();

    });

}

function createKingHearts() {

const signature =
        document.querySelector(".signature");

    if(!signature) return;

    for(let i=0;i<12;i++){

        const heart =
            document.createElement("span");

        heart.innerHTML = "💖";

        heart.style.position = "absolute";

        signature.appendChild(heart);

        gsap.to(heart, {

            x: Math.cos(i) * 80,

            y: Math.sin(i) * 80,

            repeat: -1,

            yoyo: true,

            duration: 2

        });

    }


}

/* ==========================
   GIFT SCREEN
========================== */

function goToGiftScreen() {

    document
        .getElementById("finishStoryButton")
        .classList.add("hidden");

    navigateTo(5);

}

let giftOpened = false;

function initGiftBox() {

    if(giftBoxInitialized) return;
    giftBoxInitialized = true;

    const gift =
        document.getElementById("giftBox");

    if(!gift) return;

    gift.addEventListener("click", openGift, { once: true });

    if(!giftModalCloseInitialized){

        giftModalCloseInitialized = true;

        document
            .getElementById("closeGiftModal")
            .addEventListener("click", closeGiftModal);

    }

}

function openGift() {

    if(giftOpened) return;

    giftOpened = true;

    playGiftOpenSound();

    const gift =
        document.getElementById("giftBox");

    const content =
        document.getElementById("giftContent");

    content.classList.remove("hidden");

    launchGiftHeartParticles();

    gsap.timeline()
    .to(gift, {

        scale:0,

        rotation:720,

        duration:1

    })
    .set(gift, {

        display:"none"

    })
    .set(content, {

        display:"flex"

    })
    .fromTo(
        content,
        {

            opacity:0,

            y:80

        },
        {

            opacity:1,

            y:0,

            duration:1.5

        }
    );

}

function launchGiftHeartParticles() {

    const container =
        document.getElementById("giftParticles");

    container.innerHTML = "";

    for(let index = 0; index < 24; index++){

        const heart =
            document.createElement("span");

        heart.textContent = "❤️";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100}%`;

        container.appendChild(heart);

        gsap.fromTo(heart, {
            opacity: 0,
            scale: 0,
            y: 20
        }, {
            opacity: 0.7,
            scale: Math.random() * 0.7 + 0.5,
            y: -60,
            duration: Math.random() * 2 + 2,
            delay: Math.random(),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

    }

}

function closeGiftModal() {

    const content =
        document.getElementById("giftContent");

    gsap.to(content, {
        opacity: 0,
        scale: 0.96,
        duration: 0.35,
        ease: "power2.in",
        onComplete() {

            content.classList.add("hidden");
            content.style.display = "";
            content.style.opacity = "";
            content.style.scale = "";

            scheduleVacationTimer(goToNetflixEnding, 450);

        }
    });

}

/* ==========================
   HUGE HEART EXPLOSION
========================== */

function launchMegaHeartExplosion() {

    for(let i=0;i<1000;i++){

        const heart =
            document.createElement("div");

        heart.innerHTML="❤️";

        heart.style.position="fixed";

        heart.style.left="50%";

        heart.style.top="50%";

        heart.style.fontSize=
            (Math.random()*30+10)+"px";

        document.body.appendChild(heart);

        const angle=
            Math.random()*Math.PI*2;

        const distance=
            Math.random()*1200;

        gsap.to(heart,{

            x:
            Math.cos(angle)*distance,

            y:
            Math.sin(angle)*distance,

            rotation:
            Math.random()*1080,

            opacity:0,

            duration:
            Math.random()*4+2,

            ease:"power4.out",

            onComplete(){
                heart.remove();
            }

        });

    }

    confetti({
        particleCount:600,
        spread:360
    });

}

/* ==========================
   NETFLIX ENDING
========================== */

function initNetflixEnding() {

    const video =
        document.getElementById("netflixEndingVideo");

    if(!video) return;

    video.controls = false;
    video.muted = false;
    video.pause();

    try {
        video.currentTime = 0;
    } catch (error) {}

    initNetflixVideoControls(video);

}

function initNetflixVideoControls(video) {

    if(netflixControlsInitialized) return;
    netflixControlsInitialized = true;

    document
        .querySelectorAll(".netflix-control-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const seconds =
                    Number(button.dataset.seek);

                seekNetflixVideo(video, seconds, button);

            });

        });

}

function seekNetflixVideo(video, seconds, button) {

    if(!video || !Number.isFinite(seconds)) return;

    const duration =
        Number.isFinite(video.duration) && video.duration > 0
            ? video.duration
            : Infinity;

    const nextTime =
        Math.min(
            Math.max(video.currentTime + seconds, 0),
            duration
        );

    video.currentTime = nextTime;

    gsap.fromTo(button, {
        scale: 0.94
    }, {
        scale: 1,
        duration: 0.28,
        ease: "back.out(2.2)"
    });

    showNetflixSeekIndicator(seconds);

}

function showNetflixSeekIndicator(seconds) {

    const controls =
        document.querySelector(".netflix-video-controls");

    if(!controls) return;

    controls
        .querySelectorAll(".netflix-skip-indicator")
        .forEach(indicator => indicator.remove());

    const indicator =
        document.createElement("div");

    indicator.className = "netflix-skip-indicator";
    indicator.textContent = seconds < 0
        ? `\u23EA ${Math.abs(seconds)}s`
        : `\u23E9 ${seconds}s`;

    controls.appendChild(indicator);

    gsap.fromTo(indicator, {
        opacity: 0,
        y: 8,
        scale: 0.92
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.22,
        ease: "power2.out"
    });

    gsap.to(indicator, {
        opacity: 0,
        y: -18,
        scale: 0.96,
        duration: 0.65,
        delay: 0.45,
        ease: "power2.in",
        onComplete() {
            indicator.remove();
        }
    });

}

function goToNetflixEnding() {

    navigateTo(6);

}

function startNetflixEnding() {

    if(netflixEndingPlayed || netflixEndingTransitioning){
        return;
    }

    const video =
        document.getElementById("netflixEndingVideo");

    const fade =
        document.getElementById("netflixFade");

    if(!video){
        goToEnding();
        return;
    }

    netflixEndingPlayed = true;
    netflixEndingTransitioning = false;

    fadeBackgroundMusicTo(0.02, 1.2);

    video.controls = false;
    video.muted = false;
    video.playsInline = true;

    try {
        video.currentTime = 0;
    } catch (error) {}

    if(fade){
        gsap.set(fade, {
            opacity: 1
        });
    }

    gsap.set(video, {
        opacity: 0
    });

    gsap.set(".netflix-video-controls", {
        opacity: 0,
        y: 12
    });

    video.onended = handleNetflixVideoEnded;

    const playPromise =
        video.play();

    if(playPromise && typeof playPromise.catch === "function"){
        playPromise.catch(() => {
            video.muted = false;
        });
    }

    gsap.to(video, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    });

    if(fade){
        gsap.to(fade, {
            opacity: 0,
            duration: 1.1,
            ease: "power2.out"
        });
    }

    gsap.to(".netflix-video-controls", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: 0.35,
        ease: "power3.out"
    });

}

function handleNetflixVideoEnded() {

    if(netflixEndingTransitioning) return;

    netflixEndingTransitioning = true;

    const fade =
        document.getElementById("netflixFade");

    fadeBackgroundMusicTo(0.2, 1.4);

    gsap.to(".netflix-video-controls", {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: "power2.in"
    });

    if(!fade){
        setTimeout(goToEnding, 1000);
        return;
    }

    gsap.to(fade, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete() {

            setTimeout(() => {
                goToEnding();
            }, 1000);

        }
    });

}

function pauseNetflixVideo() {

    const video =
        document.getElementById("netflixEndingVideo");

    if(!video) return;

    video.pause();

}

/* ==========================
   END SCREEN
========================== */

function goToEnding() {

    navigateTo(7);

}

function startAnniversaryReveal() {

    if(anniversaryRevealStarted) return;

    anniversaryRevealStarted = true;

    animateEndingHeart();

    initReplayButton();

    initLoveEasterEgg();

    gsap.set([
        "#mainHeart",
        ".ending-screen h1",
        ".ending-subtitle",
        ".ending-message",
        "#replayBtn"
    ], {
        opacity: 0,
        y: 30
    });

    gsap.timeline()
    .fromTo(".ending-rays", {
        opacity: 0,
        scale: 0.9
    }, {
        opacity: 0.75,
        scale: 1,
        duration: 1.2,
        ease: "power2.out"
    })
    .to("#mainHeart", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "elastic.out(1,0.65)"
    }, "-=0.65")
    .to(".ending-screen h1", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out"
    }, "-=0.25")
    .to(".ending-subtitle", {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out"
    }, "-=0.35")
    .to(".ending-message", {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power3.out"
    }, "-=0.32")
    .to("#replayBtn", {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "back.out(1.7)"
    }, "-=0.15");

    launchEndingParticles();
    heartConfetti();

}

function animateEndingHeart() {

    const heart =
        document.getElementById("mainHeart");

    if(!heart) return;

    gsap.to(heart, {

        scale:1.2,

        repeat:-1,

        yoyo:true,

        duration:1.5

    });

}

function launchEndingParticles() {

    for(let index = 0; index < 42; index++){

        const heart =
            document.createElement("div");

        heart.className = "ending-floating-heart";
        heart.innerHTML = "â¤ï¸";
        heart.style.position = "fixed";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.top = `${Math.random() * 100 + 100}%`;
        heart.style.fontSize = `${Math.random() * 18 + 12}px`;
        heart.style.pointerEvents = "none";
        heart.style.zIndex = "3";

        document.body.appendChild(heart);

        gsap.to(heart, {
            y: -window.innerHeight - 180,
            x: (Math.random() - 0.5) * 160,
            rotation: Math.random() * 360,
            opacity: 0,
            duration: Math.random() * 4 + 5,
            ease: "none",
            onComplete() {
                heart.remove();
            }
        });

    }

}

function initReplayButton() {

    if(replayButtonInitialized) return;
    replayButtonInitialized = true;

    const replay =
        document.getElementById("replayBtn");

    if(!replay) return;

    replay.addEventListener("click", () => {

        playUiInteractionSound();
        resetOurStory();

    });

}

function resetOurStory() {

    cancelVacationTimers();
    vacationRunId++;

    wrappedStarted = false;
    vacationGalleryReady = false;
    vacationJourneyStarted = false;
    vacationJourneyCompleted = false;
    giftOpened = false;
    letterTypingStarted = false;
    netflixEndingPlayed = false;
    netflixEndingTransitioning = false;
    anniversaryRevealStarted = false;

    viewedDestinations.clear();

    if(typewriterTimer){
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
    }

    gsap.killTweensOf("*");

    document
        .querySelectorAll(".destination-intro, .slideshow-container, .memory-unlocked, .ending-floating-heart")
        .forEach(element => element.remove());

    resetVacationGallery();
    resetGiftScreen();
    resetLetterScreen();
    resetNetflixEnding();
    resetEndingScreen();

    document.getElementById("visitCounter").textContent = "0";
    document.getElementById("tripCounter").textContent = "0";
    document.getElementById("crown").classList.add("hidden");
    document.getElementById("winnerAnnouncement").style.opacity = "";

    document.querySelectorAll(".percentage").forEach((element, index) => {
        element.textContent = index === 0 ? "18.75%" : "81.25%";
    });

    document.querySelectorAll(".person-card").forEach(card => {
        card.classList.remove("winner", "loser");
        card.style.cssText = "";
    });

    const startButton =
        document.getElementById("startWrapped");

    startButton.disabled = false;
    startButton.style.cssText = "";

    gsap.set(".start-screen", {
        opacity: 1,
        visibility: "visible",
        pointerEvents: "auto",
        scale: 1,
        zIndex: 2
    });

    navigateTo(0, true);

}

function resetVacationGallery() {

    document
        .getElementById("toLetter")
        .classList.add("hidden");

    document
        .querySelector(".vacation-gallery-layout")
        .classList.remove("journey-hidden");

    document.querySelectorAll(".destination").forEach(button => {
        button.classList.remove("selected", "visited");
        button.style.cssText = "";
    });

    const panel =
        document.getElementById("galleryPanel");

    panel.innerHTML = `
        <div class="gallery-placeholder">
            Selecteer een bestemming om onze herinneringen te bekijken â¤ï¸
        </div>
    `;

}

function resetGiftScreen() {

    const oldGift =
        document.getElementById("giftBox");

    const newGift =
        oldGift.cloneNode(true);

    oldGift.replaceWith(newGift);

    newGift.style.cssText = "";

    const content =
        document.getElementById("giftContent");

    content.classList.add("hidden");
    content.style.cssText = "";

    document
        .getElementById("giftParticles")
        .innerHTML = "";

    document
        .getElementById("finishStoryButton")
        .classList.add("hidden");

    giftBoxInitialized = false;
    initGiftBox();

}

function resetLetterScreen() {

    const typewriter =
        document.getElementById("typewriter");

    typewriter.textContent = "";

    document
        .getElementById("openGiftButton")
        .classList.add("hidden");

    document
        .querySelectorAll("#kingCrown, .signature span")
        .forEach(element => element.remove());

}

function resetNetflixEnding() {

    const video =
        document.getElementById("netflixEndingVideo");

    const fade =
        document.getElementById("netflixFade");

    if(video){
        video.pause();
        try {
            video.currentTime = 0;
        } catch (error) {}
        video.onended = null;
        video.controls = false;
        video.muted = false;
        video.style.opacity = "";
    }

    if(fade){
        fade.style.opacity = "";
    }

    document
        .querySelectorAll(".netflix-skip-indicator")
        .forEach(indicator => indicator.remove());

    const controls =
        document.querySelector(".netflix-video-controls");

    if(controls){
        controls.style.opacity = "";
        controls.style.transform = "";
    }

}

function resetEndingScreen() {

    heartClicks = 0;

    gsap.set([
        "#mainHeart",
        ".ending-screen h1",
        ".ending-subtitle",
        ".ending-message",
        "#replayBtn"
    ], {
        clearProps: "all"
    });

}

/* ==========================
   EASTER EGG
========================== */

let heartClicks = 0;

function initLoveEasterEgg() {

    if(loveEasterEggInitialized) return;
    loveEasterEggInitialized = true;

    const heart =
        document.getElementById("mainHeart");

    if(!heart) return;

    heart.addEventListener("click", () => {

        heartClicks++;

        if(heartClicks >= 5){

            heartClicks = 0;

            showPopup("I Love You ❤️");

            heartConfetti();

        }

    });

}

/* ==========================
   POPUP
========================== */

function showPopup(text) {

    const popup =
        document.createElement("div");

    popup.innerHTML = text;

    popup.style.position = "fixed";

    popup.style.top = "50%";

    popup.style.left = "50%";

    popup.style.transform =
        "translate(-50%,-50%)";

    popup.style.padding =
        "20px 40px";

    popup.style.borderRadius =
        "20px";

    popup.style.background =
        "rgba(255,255,255,.15)";

    popup.style.backdropFilter =
        "blur(20px)";

    popup.style.fontSize =
        "1.5rem";

    popup.style.zIndex =
        "99999";

    document.body.appendChild(
        popup
    );

    gsap.fromTo(
        popup,
        {
            scale:0,
            opacity:0
        },
        {
            scale:1,
            opacity:1,
            duration:.5
        }
    );

    setTimeout(() => {

        gsap.to(popup,{

            opacity:0,

            duration:.5,

            onComplete(){

                popup.remove();

            }

        });

    },2500);

}
