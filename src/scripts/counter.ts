import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DURATION = 1.2;
const DIGIT_STAGGER = 0.08;
const NUMBER_STAGGER = 0.1;

// Кожен наступний розряд робить на один оберт більше, як у механічному лічильнику
function buildReel(digit: number, turns: number) {
  const reel = document.createElement("span");
  reel.className = "reel";
  reel.setAttribute("aria-hidden", "true");

  const final = document.createElement("span");
  final.className = "reel-final";
  final.textContent = String(digit);

  const stack = document.createElement("span");
  stack.className = "reel-stack";
  for (let value = 0; value <= turns * 10 + digit; value += 1) {
    const line = document.createElement("span");
    line.textContent = String(value % 10);
    stack.append(line);
  }

  reel.append(final, stack);
  return { reel, stack };
}

// Барабани замінюють лише текст із цифрами, сусідні елементи лишаються на місці
function buildCounter(number: HTMLElement) {
  const source = [...number.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent!))!;
  const wrapper = document.createElement("span");
  const stacks: HTMLElement[] = [];
  number.setAttribute("aria-label", number.textContent!.trim());
  [...source.textContent!].forEach((char) => {
    if (!/\d/.test(char)) {
      wrapper.append(char);
      return;
    }
    const { reel, stack } = buildReel(Number(char), stacks.length + 1);
    wrapper.append(reel);
    stacks.push(stack);
  });
  source.replaceWith(wrapper);

  return (delay: number) => {
    const timeline = gsap.timeline({
      delay,
      // Повертаємо звичайний текст із рідним кернінгом
      onComplete: () => {
        wrapper.replaceWith(source);
        number.removeAttribute("aria-label");
      },
    });
    stacks.forEach((stack, index) => {
      const lines = stack.children.length;
      timeline.to(
        stack,
        { yPercent: (-100 * (lines - 1)) / lines, duration: DURATION, ease: "power3.out" },
        index * DIGIT_STAGGER,
      );
    });
  };
}

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const numbers = gsap.utils.toArray<HTMLElement>("[data-counter]");
  const rolls = new Map(numbers.map((number) => [number, buildCounter(number)]));
  if (numbers.length) {
    ScrollTrigger.batch(numbers, {
      start: "clamp(top 85%)",
      once: true,
      onEnter: (batch) => batch.forEach((number, index) => rolls.get(number as HTMLElement)!(index * NUMBER_STAGGER)),
    });
  }
}
