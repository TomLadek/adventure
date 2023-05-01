// This file is designed to be loaded synchronously. It should be small and be executed fast.

/*
* Adds a 'removeEventListeners' function that can be used to remove all event listeners of a certain type.
*/
(function () {
  const target = EventTarget.prototype,
        functionName = 'addEventListener',
        func = target[functionName],
        symbolHidden = Symbol('hidden');

  function hidden(instance) {
    if (instance[symbolHidden] === undefined) {
      const area = {};

      instance[symbolHidden] = area;

      return area;
    }

    return instance[symbolHidden];
  }

  function listenersFrom(instance) {
    const area = hidden(instance);

    if (!area.listeners) {
      area.listeners = [];
    }

    return area.listeners;
  }

  target[functionName] = function (type, listener) {
    const listeners = listenersFrom(this);

    listeners.push({ type, listener });

    func.apply(this, [type, listener]);
  };

  target['removeEventListeners'] = function (targetTypes) {
    const self = this,
          listeners = listenersFrom(this),
          targetTypesArray = targetTypes.split(" ");

    listeners.forEach(item => {
      const type = item.type,
            listener = item.listener;

      if (targetTypesArray.indexOf(type) >= 0) {
        self.removeEventListener(type, listener);
      }
    });
  };
})();

/*
* Adds '--vh' global CSS variable that is always equal to 1% of the viewport height as returned by window.innerHeight.
*/
(function () {
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