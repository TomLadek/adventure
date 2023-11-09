/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Matheus Almeida,
 * Copyright (c) 2021-2023 Tom Ladek
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//TODO change on* functions to real events

(function() {
	'use strict';

	function updateClass(type, newClass, currentClass) {
		if (type === 'add') {
			return (currentClass + ' ' + newClass).trim();
		} else if (type === 'remove') {
			return currentClass.replace(new RegExp("\\s*" + newClass, "g"), '');
		}
	}

	function toggleBackground(element, toggle) {
		element.style.backgroundSize = toggle ? "cover" : "0px";
		element.style.backgroundColor = toggle ? null : "transparent";
	}

	function ensureHasProps(obj, props = []) {
		if (!obj)
			obj = {};

		props.forEach(function(prop) {
			if (!obj[prop.propName])
				obj[prop.propName] = prop.propValue;
		});

		return obj;
	}

	/**
	 * Full scroll main function
	 */
	let fullScroll = function(params) {
		let _self = this,
			main = document.getElementById(params.mainElement),
			sectionTransitions = params.sectionTransitions || {},
			backgroundHelperContainer = document.getElementById("fps-background-helper"),
			backgroundHelpers = [],
			sections = (function() {
				let sects = [];

				if (params.sections) {
					sects = params.sections;
				} else {
					let sectionsNodes = main.querySelectorAll('section');

					for (let i = 0; i < sectionsNodes.length; i++)
						sects[i] = sectionsNodes[i];
				}

				if (!backgroundHelperContainer) {
					backgroundHelperContainer = document.createElement("div");
					backgroundHelperContainer.id = "fps-background-helper";
					backgroundHelperContainer.ariaHidden = "true";
					main.parentElement.prepend(backgroundHelperContainer);
				}

				// Sets up sections and background helpers
				sects.forEach(function(section, index) {
					section.setAttribute('data-index', index);

					let sectionBackground = window.getComputedStyle(section).backgroundImage;

					if (sectionTransitions && (sectionTransitions[index] > 0 || sectionTransitions[index - 1] > 0)
							&& sectionBackground && sectionBackground !== 'none') {
						let helperDiv = document.createElement('div');

						helperDiv.style.backgroundImage = sectionBackground;
						helperDiv.style.opacity = '0';
						helperDiv.className = 'background';
						helperDiv.dataset.index = String(index);

						backgroundHelperContainer.appendChild(helperDiv);
						backgroundHelpers[index] = helperDiv;
					}
				});

				return sects;
			})();

		_self.buildPublicFunctions();

		/**
		 * Full page scroll configurations and instance variables
		 * @type {Object}
		 */
		_self.defaults = {
			active: false,
			activateOnInit: typeof params.activateOnInit !== "undefined" ? params.activateOnInit : true,
			animateTime: params.animateTime || 0.7,
			animateFunction: params.animateFunction || 'power1.inOut',
			animating: false,
			backgroundHelpers: backgroundHelpers,
			dockedElementsGetter: params.dockedElementsGetter || function() { return []; },
			currentPosition: 0,
			desktopThreshold: params.desktopThreshold || 1024,
			dots: ensureHasProps(params.dots, [
				{propName: "create", propValue: function(sections, onDotClickCallback) {}},
				{propName: "update", propValue: function(currentPosition) {}}
			]),
			getSectionYLimits: params.sectionYLimitsGetter || function(section) { return {
				low: section.offsetTop,
				high: section.offsetTop + section.clientHeight - window.innerHeight
			}},
			lastPosition: 0,
			maxPosition: sections.length - 1,
			oldWindowHeight: 0,
			onAnimateEnd: params.onAnimateEnd || function() {},
			onLastSectionOverscroll: params.onLastSectionOverscroll || function() {},
			onScroll: params.onScroll || function(direction) {},
			onStartAnimate: params.onStartAnimate || function(fromSection, toSection) {},
			oversizeSectionIndices: [],
			oversizeSectionScroll: false,
			resizeObservers: [],
			scrollMode: "desktop",
			sectionFragmentIdentifier: "slide",
			sectionTransitions: sectionTransitions,
			sections: sections,
			sectionsYLimits: [],
			trueBackgroundOverrideGetter: params.trueBackgroundOverrideGetter || function() { return []; },
			yTranslate: 0
		};

		_self.defaults.dockedElements = [main].concat(_self.defaults.dockedElementsGetter());
		_self.defaults.dots.create(sections, _self.onDotClick);

		_self.windowResizeCallback = function() {
			if (_self.defaults.active) {
				let scrollMode = _self.determineScrollMode();

				if (scrollMode === "mobile") {
					if (_self.defaults.scrollMode !== "mobile")
						_self.reactivate(scrollMode);
				} else {
					if (_self.defaults.scrollMode !== "desktop")
						_self.reactivate(scrollMode);
				}

				if (window.innerHeight !== _self.defaults.oldWindowHeight) {
					_self.triggerAllSectionsResize()

					_self.defaults.oldWindowHeight = window.innerHeight;
				}
			}

			_self.defaults.dockedElements = _self.defaults.dockedElements.splice(0, 1).concat(_self.defaults.dockedElementsGetter());
		}

		if (!window.fullScrollAnimator) {
			window.fullScrollAnimator = (function() {
				/**
				 * Function for inferring starting values for the "transform" property. Necessary for Safari?
				 * @param {*} transformValue 
				 * @param {*} axis 
				 * @returns 
				 */
				function parseTransform(transformValue, axis) {
					const valueMatch = transformValue.match(/translateX\((?<x_1d>\d+)px\)|translateY\((?<y_1d>\d+)px\)|translateZ\((?<z_1d>\d+)px\)|translate\((?<x_2d>\d+)px(, (?<y_2d>\d+)px)?\)|translate3d\((?<x_3d>\d+)px, (?<y_3d>\d+)px, (?<z_3d>\d+)px\)/);

					switch (axis) {
						case "x": return (valueMatch && (valueMatch.groups.x_1d || valueMatch.groups.x_2d || valueMatch.groups.x_3d)) || 0;
						case "y": return (valueMatch && (valueMatch.groups.y_1d || valueMatch.groups.y_2d || valueMatch.groups.y_3d)) || 0;
						case "z": return (valueMatch && (valueMatch.groups.z_1d || valueMatch.groups.z_3d)) || 0;
					}
				}

				/**
				 * Triggers an animation on the supplied element with the specified animation options.
				 * @param {*} el The element to animate
				 * @param {*} animationOptions Animation options. Supported: "y", "top", "opacity", "duration", "ease", "onStart", "onComplete".
				 * Option "overwrite" is ignored since the Web Animation API automatically overrides animations of the same property.
				 */
				async function doAnimate(el, animationOptions) {
					let keyframes, easing;

					if (typeof animationOptions.y !== "undefined") {
						keyframes = [{ transform: `translate3d(0px, ${animationOptions.y}px, 0px)` }];
					} else if (typeof animationOptions.top !== "undefined") {
						keyframes = [{ top: `${animationOptions.top}${/px/.test(animationOptions.top) ? "" : "px"}` }];
					} else if (typeof animationOptions.opacity !== "undefined") {
						keyframes = [{ opacity: animationOptions.opacity }];
					}

					if (typeof animationOptions.ease !== "undefined") {
						switch (animationOptions.ease) {
							case "power4.out": easing = "cubic-bezier(0.13, 0.63, 0.2, 1)"; break;
							case "power4.inOut": easing = "cubic-bezier(0.85, 0, 0.15, 1)"; break;
							default:
							case "power1.inOut": easing = "ease-in-out"; break;
						}
					}

					const animation = el.animate(keyframes, { duration: animationOptions.duration ? animationOptions.duration * 1000 : undefined, fill: "forwards", easing });

					if (typeof animationOptions.onStart === "function")
						animationOptions.onStart();

					await animation.finished;

					try {
						animation.commitStyles();  	
						animation.cancel();
					} catch (ex) {
						/* ignore */
					}

					if (typeof animationOptions.onComplete === "function")
						animationOptions.onComplete();
				}

				return {
					to: async function(el, options) {
						await doAnimate(el, options);
					},
					set: async function(el, options) {
						delete options.duration;
						await doAnimate(el, options);
					},
					killTweensOf: function(el, options) {
						/*
							TODO Ideally cancel/remove all animations of the properties specified in options.
						*/
					}
				}
			})();
		}

		if (_self.defaults.activateOnInit)
			_self.activate(_self.determineScrollMode());
	};

	fullScroll.prototype.triggerAllSectionsResize = function() {
		let _self = this;

		_self.defaults.sections.forEach(function(section, index) {
			_self.sectionResizeCallback(section, index);
		});
	}

	fullScroll.prototype.sectionResizeCallback = function(section, index) {
		let _self = this,
			oversizeSectionsIndex = _self.defaults.oversizeSectionIndices.indexOf(index),
			currentSectionYLimits;

		section.style.minHeight = window.innerHeight + "px";
		currentSectionYLimits = _self.defaults.getSectionYLimits(section);
		_self.defaults.sectionsYLimits[index] = currentSectionYLimits;

		if (Math.round(currentSectionYLimits.high - currentSectionYLimits.low) > 0) {
			// This is an oversize section

			// If the oversizeSectionIndices array was missing this section's index, add it
			if (oversizeSectionsIndex < 0) {
				_self.defaults.oversizeSectionIndices.push(index);

				let helperDiv = _self.defaults.backgroundHelpers[index];

				if (_self.defaults.trueBackgroundOverrideGetter().indexOf(index) < 0 && helperDiv) {
					helperDiv.dataset.trueBackground = 'true';
					toggleBackground(section, false);

					if (index === _self.defaults.currentPosition)
						helperDiv.style.opacity = '1';
				}
			}

			// When section size changed, and it's the current section, re-evaluate whether we need standard scroll now
			if (index === _self.defaults.currentPosition && !_self.defaults.oversizeSectionScroll)
				_self.defaults.oversizeSectionScroll = true;
		} else {
			// This is not an oversize section

			// If the oversizeSectionIndices array contained this section's index, remove it
			if (oversizeSectionsIndex >= 0) {
				_self.defaults.oversizeSectionIndices.splice(oversizeSectionsIndex, 1);

				let helperDiv = _self.defaults.backgroundHelpers[oversizeSectionsIndex];

				if (_self.defaults.trueBackgroundOverrideGetter().indexOf(index) < 0 && helperDiv) {
					delete helperDiv.dataset.trueBackground;
					toggleBackground(section, true);

					helperDiv.style.opacity = '0';
				}
			}

			// When section size changed, and it's the current section, re-evaluate whether we need standard scroll now
			if (index === _self.defaults.currentPosition && _self.defaults.oversizeSectionScroll)
				_self.defaults.oversizeSectionScroll = false;
		}

		if (!_self.defaults.oversizeSectionScroll) {
			// Check if the current y translation is still correct and if not, animate to new Y
			let y = _self.determineYTranslate();

			if (y !== _self.defaults.yTranslate) {
				_self.defaults.animating = true;

				_self.transformContainerY(y, {
					overwrite: true,
					duration: _self.defaults.animateTime,
					ease: _self.defaults.animateFunction,
					onComplete: function() {
						_self.defaults.animating = false;
					}
				});
			}
		}
	};

	/**
	 * Determines the next scroll position by adding up the section heights until the current section.
	 *
	 * @returns {Object} scroll position in Y direction (number)
 	 */
	fullScroll.prototype.determineYTranslate = function() {
		let _self = this,
			sectionYLimits = _self.defaults.sectionsYLimits[_self.defaults.currentPosition];

		return _self.defaults.lastPosition > _self.defaults.currentPosition ? sectionYLimits.high : sectionYLimits.low;
	};

	/**
	 * Determines the scroll mode for the sections. Can be one of these:
	 *
 	 * - Mobile
	 * 		-> touch listener
 	 * - Desktop
	 * 		-> key/wheel listener
	 *
	 * Criteria are:
	 * 1. Whether the screen is sufficiently narrow (narrower than {@link defaults.desktopThreshold})
	 * 2. Whether the CSS height of "100vh" is not equal to height of "window.innerHeight"
	 * 3. Navigator properties
	 *
	 * @returns {string} either "desktop" or "mobile"
	 */
	fullScroll.prototype.determineScrollMode = function() {
		function clientHeightIsNotInnerHeight() {
            let testDiv = document.createElement("div");

            testDiv.style.height = "100vh";

            try {
                document.body.appendChild(testDiv);
                return testDiv.clientHeight !== window.innerHeight;
            } finally {
                document.body.removeChild(testDiv);
            }
        }

        if (window.innerWidth < this.defaults.desktopThreshold || clientHeightIsNotInnerHeight())
			return "mobile";
		else
			return "desktop";
	}

	fullScroll.prototype.resetCurrentSlideScroll = function() {
		let _self = this;

		_self.transformContainerY(_self.defaults.sectionsYLimits[_self.defaults.currentPosition].low);
	}

	/**
	 * Add Events
	 * @return {fullScroll} this(fullScroll)
	 */
	fullScroll.prototype.addEvents = function() {
		document.addEventListener('mousewheel', this.mouseWheelAndKey, false);
		document.addEventListener('wheel', this.mouseWheelAndKey, false);
		document.addEventListener('keyup', this.mouseWheelAndKey, false);
		document.addEventListener('touchstart', this.touchStart, false);
		document.addEventListener('touchmove', this.touchMove, false);
		document.addEventListener('touchend', this.touchEnd, false);

		return this;
	};

	/**
	 * Remove Events
	 * @return {fullScroll} this(fullScroll)
	 */
	fullScroll.prototype.removeEvents = function() {
		document.removeEventListener('mousewheel', this.mouseWheelAndKey, false);
		document.removeEventListener('wheel', this.mouseWheelAndKey, false);
		document.removeEventListener('keyup', this.mouseWheelAndKey, false);
		document.removeEventListener('touchstart', this.touchStart, false);
		document.removeEventListener('touchmove', this.touchMove, false);
		document.removeEventListener('touchend', this.touchEnd, false);

		return this;
	};

	fullScroll.prototype.activate = function(scrollMode) {
		if (this.defaults.active)
			return;

		// console.log("activating full scroll (mode=" + scrollMode + ")");

		let _self = this,
			anchor = location.hash.match(new RegExp(_self.defaults.sectionFragmentIdentifier + "(\\d+)")),
			startPosition = anchor ? Number(anchor[1]) : 0;

		_self.triggerAllSectionsResize();

		if (typeof ResizeObserver !== "undefined") {
			// React to resize of sections
			_self.defaults.sections.forEach(function(section, index) {
				let resizeObserver = new ResizeObserver(function() { _self.sectionResizeCallback(section, index); });

				resizeObserver.observe(section);

				_self.defaults.resizeObservers.push(resizeObserver);
			});

			// React to resize of docked elements
			_self.defaults.dockedElementsGetter().forEach(function(dockedElement) {
				let resizeObserver = new ResizeObserver(function() { _self.triggerAllSectionsResize(); });

				resizeObserver.observe(dockedElement);

				_self.defaults.resizeObservers.push(resizeObserver);
			});
		}

		window.addEventListener("load", _self.windowResizeCallback);
		window.addEventListener("resize", _self.windowResizeCallback);

		_self.defaults.animating = false;
		_self.defaults.scrollMode = scrollMode;
		_self.addEvents();

		// Delaying the first location change fixes an issue where callbacks on viewport dimensions change would already
		// have to take into account animating values.
		setTimeout(function() {
			_self.changeCurrentLocation(startPosition);
		}, 100);

		window.addEventListener("hashchange", _self.hashChange, false);

		document.documentElement.className = updateClass("add", "fps-enabled", document.documentElement.className);
		document.body.className = updateClass("add", "fps-enabled", document.body.className);

		if (startPosition === 0 && _self.defaults.oversizeSectionIndices.indexOf(startPosition) >= 0)
			_self.defaults.oversizeSectionScroll = true;

		_self.defaults.active = true;
	}

	fullScroll.prototype.deactivate = function() {
		if (!this.defaults.active)
			return;

		// console.log("deactivating full scroll");

		let _self = this;

		_self.transformContainerY(0);

		_self.defaults.active = false;

		_self.removeEvents();

		_self.defaults.animating = false;
		_self.defaults.oversizeSectionScroll = false;
		_self.defaults.lastPosition = 0;
		_self.defaults.currentPosition = 0;
		_self.defaults.dots.update(0);

		_self.defaults.resizeObservers.forEach(function(resizeObserver) { resizeObserver.disconnect() });
		_self.defaults.resizeObservers.length = 0;

		window.removeEventListener("hashchange", _self.hashChange, false);
		window.removeEventListener("load", _self.windowResizeCallback);
		window.removeEventListener("resize", _self.windowResizeCallback);

		history.replaceState("", document.title, window.location.pathname + window.location.search);

		document.documentElement.className = updateClass("remove", "fps-enabled", document.documentElement.className);
		document.body.className = updateClass("remove", "fps-enabled", document.body.className);
		document.documentElement.style.height = null;
		document.documentElement.style.overflowY = null;
	}

	fullScroll.prototype.reactivate = function(scrollMode) {
		this.deactivate();
		this.activate(scrollMode);
	}

	fullScroll.prototype.resetBackgroundHelpers = function() {
		const _self = this;

		_self.defaults.backgroundHelpers.forEach((backgroundHelper) => {
			backgroundHelper.style.opacity = parseInt(backgroundHelper.dataset.index) === _self.defaults.currentPosition
													&& backgroundHelper.dataset.trueBackground === 'true' ? '1' : '0';
			backgroundHelper.style.top = null;
		});
	}

	/**
	 * Build public functions
	 * @return {fullScroll} [description]
	 */
	fullScroll.prototype.buildPublicFunctions = function() {
		let _self = this,
			mTouchStart = 0,
			mTouchEnd = 0,
			lastTouchY, dY, t0, speed,

			/**
			 * Timeout holder for {@link sectionChangeEventBlocker}. Accept scroll events only when this is null.
			 */
			sectionChangeTimeout,

			/**
			 * A 100 ms timer for ignoring scroll events just after a section change.<br>
			 * Call this just after a section change was performed and on every scroll event as long as the timeout
			 * hasn't been cleared yet.
			 */
			sectionChangeEventBlocker = function() {
				clearTimeout(sectionChangeTimeout);

				sectionChangeTimeout = setTimeout(function() {
					sectionChangeTimeout = null;
				}, 50);
			};

		this.mouseWheelAndKey = function(event) {
			let newY, dY;

			if (event.keyCode === 32) { // space
				dY = 200;
			} else if (event.keyCode === 33) { // pgUp
				_self.decrementCurrentLocation();
			} else if (event.keyCode === 34) { // pgDn
				_self.incrementCurrentLocation();
			} else if (event.keyCode === 35) { // end
				_self.changeCurrentLocation(_self.defaults.maxPosition);
			} else if (event.keyCode === 36) { // pos1
				_self.changeCurrentLocation(0);
			} else if (event.keyCode === 38) { // up
				dY = -50;
			} else if (event.keyCode === 40) { // down
				dY = 50;
			} else if (event.deltaY < 0 || event.deltaY > 0) {
				// Consider only sufficiently large wheel events
				if (!_self.defaults.oversizeSectionScroll && Math.abs(event.deltaY) < 5)
					return;

				if (sectionChangeTimeout) {
					sectionChangeEventBlocker();
					return;
				}

				if (_self.defaults.oversizeSectionScroll) {
					speed = event.deltaY;
					dY = speed;
				} else {
					if (event.deltaY > 0)
						dY = 1;
					else
						dY = -1;
				}
			}

			if (!dY)
				return;

			if (_self.defaults.oversizeSectionScroll) {
				let y = _self.defaults.yTranslate,
					currentSectionYLimits = _self.defaults.sectionsYLimits[_self.defaults.currentPosition],
					maxPageY = _self.defaults.sectionsYLimits[_self.defaults.sectionsYLimits.length - 1].high;

				newY = Math.min(maxPageY, Math.max(0, y + dY));

				if (newY >= y && newY > currentSectionYLimits.high) {
					_self.incrementCurrentLocation();
				} else if (newY <= y && newY < currentSectionYLimits.low) {
					_self.decrementCurrentLocation();
				} else if (!_self.defaults.animating) {
					_self.defaults.onScroll(newY < y);
					_self.transformContainerY(newY, {duration: 0.4, ease: "power4.out"});
				}
			} else {
				if (dY > 0)
					_self.incrementCurrentLocation();
				else
					_self.decrementCurrentLocation();
			}
		};

		this.touchStart = function(event) {
			mTouchStart = event.changedTouches[0].clientY;
			mTouchEnd = 0;
			lastTouchY = mTouchStart;
			t0 = event.timeStamp;
		};

		this.touchMove = function(event) {
			if (_self.defaults.scrollMode !== "mobile" || !_self.defaults.oversizeSectionScroll || _self.defaults.animating)
				return;

			dY = lastTouchY - event.changedTouches[0].clientY;

			_self.defaults.onScroll(dY < 0);
			_self.transformContainerY(_self.defaults.yTranslate + dY);

			lastTouchY = event.changedTouches[0].clientY;
		}

		this.touchEnd = function(event) {
			if (_self.defaults.animating)
				return;

			let newY;
			mTouchEnd = event.changedTouches[0].clientY;

			if (_self.defaults.oversizeSectionScroll) {
				let y = _self.defaults.yTranslate,
					currentSectionYLimits = _self.defaults.sectionsYLimits[_self.defaults.currentPosition],
					maxPageY = _self.defaults.sectionsYLimits[_self.defaults.sectionsYLimits.length - 1].high;

				speed = (mTouchStart - mTouchEnd) / (event.timeStamp - t0);
				dY = (Math.pow(Math.abs(speed), 1.5) * Math.sign(speed) * 300);
				newY = Math.min(maxPageY, Math.max(0, y + dY));

				if (newY > y && newY > currentSectionYLimits.high) {
					_self.incrementCurrentLocation();
				} else if (newY < y && newY < currentSectionYLimits.low) {
					_self.decrementCurrentLocation();
				} else {
					_self.defaults.onScroll(newY < y);
					_self.transformContainerY(newY, {duration: dY / (speed * 1000), ease: "power4.out"});
				}
			} else {
				if (mTouchEnd - mTouchStart > 100 || mTouchStart - mTouchEnd > 100) {
					if (mTouchEnd > mTouchStart) {
						_self.decrementCurrentLocation();
					} else {
						_self.incrementCurrentLocation();
					}
				}
			}
		};

		this.hashChange = function() {
			let anchor = location.hash.match(new RegExp(_self.defaults.sectionFragmentIdentifier + "(\\d+)"));

			if (anchor) {
				anchor = Number(anchor[1]);

				if (anchor === _self.defaults.currentPosition)
					return;

				_self.changeCurrentLocation(anchor);
			}
		};

		this.onDotClick = function(e, index) {
			if (!_self.defaults.active)
				return;

			e.preventDefault();
			_self.changeCurrentLocation(index);
		};

		this.changeCurrentLocation = function(position) {
			if (_self.defaults.animating)
				return;

			_self.defaults.lastPosition = _self.defaults.currentPosition;

			if (position < 0) {
				_self.defaults.currentPosition = 0;
			} else if (position > _self.defaults.maxPosition) {
				_self.defaults.onLastSectionOverscroll();
				_self.defaults.currentPosition = _self.defaults.maxPosition;
			} else {
				_self.defaults.currentPosition = position;
			}

			if (_self.defaults.lastPosition !== _self.defaults.currentPosition) {
				_self.animateScroll();
				_self.updateDots();
			}
		};

		this.incrementCurrentLocation = function() {
			_self.changeCurrentLocation(_self.defaults.currentPosition + 1);
		};

		this.decrementCurrentLocation = function() {
			_self.changeCurrentLocation(_self.defaults.currentPosition - 1);
		}

		this.animateScroll = function() {
			// Before starting any animation or doing some longer work, set animating flag to true
			_self.defaults.animating = true;

			let currentIndex = _self.defaults.lastPosition,
				nextIndex = _self.defaults.currentPosition,
				currentSection = _self.defaults.sections[currentIndex],
				nextSection = _self.defaults.sections[nextIndex],
				nextSectionIsOversize = _self.defaults.oversizeSectionIndices.indexOf(nextIndex) >= 0,
				currentBackgroundHelper = _self.defaults.backgroundHelpers[currentIndex],
				nextBackgroundHelper = _self.defaults.backgroundHelpers[nextIndex],
				animateYPos = _self.determineYTranslate(),
				scrollDirection, targetEffect;

			_self.removeEvents();
			_self.defaults.onStartAnimate(currentIndex, nextIndex);

			// If this section and the next section have a special transition, take care of it here
			if (nextBackgroundHelper) {
				if (currentBackgroundHelper && _self.defaults.sectionTransitions) {
					if (currentIndex < nextIndex) {
						scrollDirection = 1;
						targetEffect = _self.defaults.sectionTransitions[currentIndex];
					} else {
						scrollDirection = -1;
						targetEffect = _self.defaults.sectionTransitions[nextIndex];
					}
					switch (targetEffect) {
						case 1:
							_self.animateFade(scrollDirection, currentSection, nextSection, currentBackgroundHelper, nextBackgroundHelper);
							break;
						case 2:
							_self.animateOverlay(scrollDirection, currentSection, nextSection, currentBackgroundHelper, nextBackgroundHelper);
							break;
						default:
					}
				} else {
					if (nextBackgroundHelper.dataset.trueBackground === 'true')
						nextBackgroundHelper.style.opacity = '1';
				}
			}

			// Actually animate the scrolling
			_self.transformContainerY(animateYPos, {
				overwrite: true,
				duration: _self.defaults.animateTime,
				ease: _self.defaults.animateFunction,
				onStart: function() {
					// During animation, re-calculate the Y limits of the section we're animating to
					_self.defaults.sectionsYLimits[nextIndex] = _self.defaults.getSectionYLimits(nextSection);
				},
				onComplete: function() {
					_self.defaults.animating = false;

					sectionChangeEventBlocker();

					if (nextSectionIsOversize) {
						_self.defaults.oversizeSectionScroll = true;
					} else {
						_self.defaults.oversizeSectionScroll = false;
					}

					_self.addEvents();

					location.hash = _self.defaults.sectionFragmentIdentifier + nextIndex;

					_self.resetBackgroundHelpers();

					// At the end of animation, make sure the current Y translate value (the one we've just animated to) is still correct.
					// If not, behave as if the window resized -> re-calculate everything
					if (_self.defaults.yTranslate !== _self.determineYTranslate()) {
						_self.triggerAllSectionsResize()
					}
			}});

			// Update the "in-focus" class - add it to the next section, remove it from the current section
			currentSection.className = updateClass('remove', 'in-focus', currentSection.className);
			nextSection.className = updateClass('add', 'in-focus', nextSection.className);
		};

		this.animateFade = function(scrollDirection, currentSection, nextSection, currentBackgroundHelper, nextBackgroundHelper) {
			let opacityAnimatedBackgroundElement, staticBackgroundElement, opacityAnimateValue;

			if (scrollDirection > 0) {
				// scroll up
				opacityAnimatedBackgroundElement = nextBackgroundHelper;
				staticBackgroundElement = currentBackgroundHelper;

				opacityAnimatedBackgroundElement.style.opacity = '0';
				opacityAnimateValue = 1;
			} else {
				// scroll down
				opacityAnimatedBackgroundElement = currentBackgroundHelper;
				staticBackgroundElement = nextBackgroundHelper;

				opacityAnimatedBackgroundElement.style.opacity = '1';
				opacityAnimateValue = 0;
			}

			staticBackgroundElement.style.opacity = '1';

			toggleBackground(currentSection, false);
			toggleBackground(nextSection, false);

			window.fullScrollAnimator.to(opacityAnimatedBackgroundElement, {
				opacity: opacityAnimateValue,
				duration: _self.defaults.animateTime,
				ease: _self.defaults.animateFunction,
				onComplete: function() {
					toggleBackground(currentSection, true);
					toggleBackground(nextSection, !nextBackgroundHelper.dataset.trueBackground);
					currentBackgroundHelper.style.opacity = '0';
					nextBackgroundHelper.style.opacity = nextBackgroundHelper.dataset.trueBackground ? '1' : '0';
				}
			});
		};

		this.animateOverlay = function(scrollDirection, currentSection, nextSection, currentBackgroundHelper, nextBackgroundHelper) {
			let opacityAnimatedBackgroundElement, staticBackgroundElement, topDestination;

			if (scrollDirection > 0) {
				opacityAnimatedBackgroundElement = nextBackgroundHelper;
				staticBackgroundElement = currentBackgroundHelper;
				opacityAnimatedBackgroundElement.style.top = window.innerHeight+'px';
				topDestination = 0;
			} else {
				opacityAnimatedBackgroundElement = currentBackgroundHelper;
				staticBackgroundElement = nextBackgroundHelper;
				opacityAnimatedBackgroundElement.style.top = '0px';
				topDestination = window.innerHeight;
			}

			opacityAnimatedBackgroundElement.style.opacity = '1';
			staticBackgroundElement.style.opacity = '1';

			toggleBackground(currentSection, false);
			toggleBackground(nextSection, false);

			window.fullScrollAnimator.to(opacityAnimatedBackgroundElement, {
				top: topDestination,
				duration: _self.defaults.animateTime,
				ease: _self.defaults.animateFunction,
				onComplete: function() {
					toggleBackground(currentSection, true);
					toggleBackground(nextSection, !nextBackgroundHelper.dataset.trueBackground);
					currentBackgroundHelper.style.opacity = '0';
					nextBackgroundHelper.style.opacity = nextBackgroundHelper.dataset.trueBackground ? '1' : '0';
				}
			});
		};

		this.transformContainerY = function(newY, animateOptions) {
			if (!this.defaults.active)
				return;

			let _self = this,
				options = {},
				sectionYLimits = _self.defaults.sectionsYLimits[_self.defaults.currentPosition];

			_self.defaults.yTranslate = newY <= 0 ? 0 : Math.min(sectionYLimits.high, Math.max(sectionYLimits.low, newY));
			options.y = _self.defaults.yTranslate > 0 ? -_self.defaults.yTranslate : 0;

			if (animateOptions) {
				options = Object.assign(options, animateOptions);

				_self.defaults.dockedElements.forEach(function(el, i) {
					let finalOptions = Object.assign({}, options);

					if (i > 0 && finalOptions.onStart)
						delete finalOptions.onStart;

					if (i < _self.defaults.dockedElements.length - 1 && finalOptions.onComplete)
						delete finalOptions.onComplete;

					window.fullScrollAnimator.to(el, finalOptions);
				});
			} else {
				_self.defaults.dockedElements.forEach(function(el) {
					window.fullScrollAnimator.killTweensOf(el, "y");
					window.fullScrollAnimator.set(el, options);
				});
			}
		}

		this.updateDots = function() {
			_self.defaults.dots.update(_self.defaults.currentPosition);
		};
	};

	window.fullScroll = fullScroll;
})();
