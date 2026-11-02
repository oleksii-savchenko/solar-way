import gsap from "gsap";

const zones = document.querySelectorAll<HTMLElement>("[data-cursor-zone]");

if (zones.length) {
  // Лежить у body: усередині секцій position: fixed рахувався б від секції
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(cursor);

  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });
  const cursorX = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
  const cursorY = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });

  function toggleCursor(visible: boolean) {
    gsap.to(cursor, { autoAlpha: visible ? 1 : 0, scale: visible ? 1 : 0, duration: 0.2 });
  }

  zones.forEach((zone) => {
    zone.addEventListener("pointerenter", (event) => {
      cursorX(event.clientX, event.clientX);
      cursorY(event.clientY, event.clientY);
      toggleCursor(true);
    });
    zone.addEventListener("pointermove", (event) => {
      cursorX(event.clientX);
      cursorY(event.clientY);
    });
    zone.addEventListener("pointerleave", () => toggleCursor(false));
  });
}
