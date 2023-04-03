(function() {  
  if (typeof window !== "object")
    return;

  let windowInnerHeight;

  function onResize() {
    if (window.innerHeight !== windowInnerHeight) {
      const vh = window.innerHeight * 0.01;

      document.documentElement.style.setProperty("--vh", vh + "px");
      windowInnerHeight = window.innerHeight;
    }
  }

  onResize();
  window.addEventListener("resize", onResize);
})();