import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DISTANCE = 30;
const DURATION = 0.6;
const STAGGER = 0.1;
const HERO_STEP = 0.12;
const HERO_DURATION = 0.4;
const HERO_ITEM_STAGGER = 0.05;
const HERO_BLUR = 12;
// clamp: блоки внизу сторінки теж з'являться, навіть якщо не дійдуть до цієї лінії
const START = "clamp(top 85%)";

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Секції масштабує --page-zoom, тому зсув компенсуємо, щоб на екрані було рівно 30 px
const shift = DISTANCE / (parseFloat(root.style.getPropertyValue("--page-zoom")) || 1);

function hide(elements: Element[]) {
  gsap.set(elements, { opacity: 0, y: `+=${shift}` });
}

function show(elements: Element[], stagger = 0) {
  gsap.to(elements, {
    opacity: 1,
    y: `-=${shift}`,
    duration: DURATION,
    ease: "power2.out",
    stagger,
    clearProps: "opacity,transform",
  });
}

// Картки стартують окремо, тож у колонці на мобільному кожна чекає на свою появу в кадрі
export function revealCards(cards: Element[]) {
  if (reducedMotion || !cards.length) return;
  hide(cards);
  ScrollTrigger.batch(cards, {
    start: START,
    once: true,
    onEnter: (batch) => show(batch, STAGGER),
  });
}

// Перший екран: кроки йдуть майже паралельно, усе разом займає близько секунди
function playHeroIntro() {
  const timeline = gsap.timeline();
  ["header", "title", "lead", "tagline", "features", "button", "panel"].forEach((step, index) => {
    const elements = gsap.utils.toArray<Element>(`[data-hero-step="${step}"]`);
    if (!elements.length) return;
    const isTitle = step === "title";
    hide(elements);
    if (isTitle) gsap.set(elements, { filter: `blur(${HERO_BLUR}px)` });
    timeline.to(
      elements,
      {
        opacity: 1,
        y: `-=${shift}`,
        ...(isTitle && { filter: "blur(0px)" }),
        duration: HERO_DURATION,
        ease: "power2.out",
        stagger: HERO_ITEM_STAGGER,
        clearProps: "opacity,transform,filter",
      },
      index * HERO_STEP,
    );
  });
}

// Кожне слово стає окремим елементом, колір і перенос рядків лишаються від батьків
function splitWords(title: Element) {
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const words: Element[] = [];
  nodes.forEach((node) => {
    const parts = node.textContent!.split(/(\s+)/).filter(Boolean);
    (node as Text).replaceWith(
      ...parts.map((part) => {
        if (!part.trim()) return part;
        const word = document.createElement("span");
        word.className = "blur-word";
        word.textContent = part;
        words.push(word);
        return word;
      }),
    );
  });
  return words;
}

// Заголовки H2: зсув дає батьківський блок, тому слова лише проявляються з розмиття
function revealTitle(title: Element) {
  const words = splitWords(title);
  gsap.set(words, { opacity: 0, filter: `blur(${HERO_BLUR}px)` });
  ScrollTrigger.create({
    trigger: title,
    start: START,
    once: true,
    onEnter: () =>
      gsap.to(words, {
        opacity: 1,
        filter: "blur(0px)",
        duration: HERO_DURATION,
        ease: "power2.out",
        stagger: HERO_ITEM_STAGGER,
        clearProps: "opacity,filter",
      }),
  });
}

if (!reducedMotion) {
  playHeroIntro();

  document.querySelectorAll("[data-blur-title]").forEach(revealTitle);

  document.querySelectorAll("[data-reveal]").forEach((block) => {
    hide([block]);
    ScrollTrigger.create({
      trigger: block,
      start: START,
      once: true,
      onEnter: () => show([block]),
    });
  });

  // Приховані картки Projects анімуються після кліку на View more
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    revealCards([...group.children].filter((card) => card.getClientRects().length));
  });

  root.classList.remove("has-reveal");

  // Висота сторінки змінюється від лінивих картинок і кнопки View more
  new ResizeObserver(() => ScrollTrigger.refresh()).observe(document.body);
}
