window.performance = window.performance || {};
window.performance.now = (function () {
    return performance.now ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
}());

(function () {
    var lastTime = 0, x, currTime, timeToCall, id, vendors = ['ms', 'moz', 'webkit', 'o'];
    for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            currTime = window.performance.now();
            timeToCall = Math.max(0, 16 - (currTime - lastTime));
            id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

function Animator(o) {
    var easing = (o && o.easing) ? o.easing : null,
        boundsEasing = (o && o.boundsEasing) ? o.boundsEasing : null;

    this.isTweaking = false;
    this.isAnimating = false;

    this._easing = (typeof easing === 'function') ? easing : this[easing];
    this._bounds = (o && o.bounds) ? true : false;
    this._boundsEasing = (typeof boundsEasing === 'function') ? boundsEasing : this[boundsEasing];
    this._keepAbsoluteMetrics = (o && o.keepAbsoluteMetrics) ? true : false;

    if (this._bounds) {
        this.checkBounds = function (position) {
            this._lastPosition = this._lastPosition || position;
            if (position < this.minPosition) {
                position = this._lastPosition + (position - this._lastPosition) / 3;
            }

            if (position > this.maxPosition) {
                position = this._lastPosition + (position - this._lastPosition) / 3;
            }

            this._lastPosition = position;
            return position;
        };
    } else {
        this.checkBounds = function (position) {
            if (position < this.minPosition) {
                position = this.minPosition;
            }

            if (position > this.maxPosition) {
                position = this.maxPosition;
            }
            return position;
        };
    }
}

Animator.prototype = (function () {
    var proto = {},
        STRINGS = {
            animation: "animation",
            stop: "stop",
            tweak: "tweak"
        };

    /*
     * Easing Functions - inspired from http://gizma.com/easing/
     * only considering the t value for the range [0, 1] => [0, 1]
     */

    // no easing, no acceleration
    proto.linear = function (t) {
        return t
    };

    // accelerating from zero velocity
    proto.easeInQuad = function (t) {
        return t * t
    };

    // decelerating to zero velocity
    proto.easeOutQuad = function (t) {
        return t * (2 - t)
    };

    // decelerating to zero velocity
    proto.easeOutSin = function (t) {
        return Math.sin(t * Math.PI / 2);
    };

    // acceleration until halfway, then deceleration
    proto.easeInOutQuad = function (t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    };

    // accelerating from zero velocity
    proto.easeInCubic = function (t) {
        return t * t * t
    };

    // decelerating to zero velocity
    proto.easeOutCubic = function (t) {
        return (--t) * t * t + 1
    };

    // acceleration until halfway, then deceleration
    proto.easeInOutCubic = function (t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };

    // accelerating from zero velocity
    proto.easeInQuart = function (t) {
        return t * t * t * t
    };

    // decelerating to zero velocity
    proto.easeOutQuart = function (t) {
        return 1 - (--t) * t * t * t
    };

    // acceleration until halfway, then deceleration
    proto.easeInOutQuart = function (t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    };

    // accelerating from zero velocity
    proto.easeInQuint = function (t) {
        return t * t * t * t * t
    };

    // decelerating to zero velocity
    proto.easeOutQuint = function (t) {
        return 1 + (--t) * t * t * t * t
    };

    // acceleration until halfway, then deceleration
    proto.easeInOutQuint = function (t) {
        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    };

    // key spline animation
    proto.KeySpline = function (mX1, mY1, mX2, mY2) {

        function a(aA1, aA2) {
            return 1.0 - 3.0 * aA2 + 3.0 * aA1;
        }

        function b(aA1, aA2) {
            return 3.0 * aA2 - 6.0 * aA1;
        }

        function c(aA1) {
            return 3.0 * aA1;
        }

        // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function calculateBezier(aT, aA1, aA2) {
            return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
        }

        // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function getSlope(aT, aA1, aA2) {
            return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
        }

        function getTForX(aX) {
            // Newton raphson iteration
            var aGuessT = aX;
            for (var i = 0; i < 4; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope == 0.0) return aGuessT;
                var currentX = calculateBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }

        return function (aX) {
            if (mX1 == mY1 && mX2 == mY2) return aX; // linear
            return calculateBezier(getTForX(aX), mY1, mY2);
        };
    };
    // ====================================================================================================

    proto.animate = function (startPosition, endPosition, duration, callback, easing) {
        var startTimestamp, firstIteration = true, tmpVariable, tmpTime, self = this, easingFunction,
            lastIteraction = false, state = this.isTweaking ? STRINGS.tweak : STRINGS.animation, tmpPosition;

        /* Prevent scrolling to the Y point if already there */
        if (startPosition === endPosition) {
            return;
        }
        easingFunction = (typeof easing === 'function') ? easing : ((typeof easing === 'string') ? this[easing] : this._easing);
        this.isAnimating = true;
        this._callback = callback;

        function animationStep(currentTimestamp) {
            tmpVariable = ((currentTimestamp - startTimestamp) / duration);
            tmpTime = (1 < tmpVariable) ? 1 : tmpVariable;

            if ((tmpTime < 1 || !startTimestamp) && self.isAnimating) {
                self._animationID = window.requestAnimationFrame(animationStep, null);
            }

            // if it is first iteration, save timestamp and return
            if (firstIteration) {
                startTimestamp = currentTimestamp;
                firstIteration = false;
                return;
            }

            // calculate new position
            self._currentPosition = (easingFunction(tmpTime) * (endPosition - startPosition)) + startPosition;

            // stop animation if time ends
            if (tmpTime >= 1) {
                lastIteraction = true;
                self.isTweaking = false;
                self.isAnimating = false;
                self._currentPosition = Math.round(self._currentPosition);

                state = STRINGS.stop;
            }

            // check bounds behavior
            if (self._bounds) {
                var delta = 0;
                if (self._currentPosition < self.minPosition) {
                    delta = self._currentPosition - self.minPosition;
                }

                if (self._currentPosition > self.maxPosition) {
                    delta = self._currentPosition - self.maxPosition;
                }

                if (delta) {
                    if (!self.isTweaking) {
                        if ((Math.abs(delta) > self.margin) || !self.isAnimating) {
                            self.stop();
                            self.isTweaking = true;
                            self.animate(self._currentPosition, self._currentPosition - delta, Math.min(Math.abs(delta) * 2, 350), self._callback, self._boundsEasing || 'easeOutQuad');
                            state = STRINGS.tweak;
                        }
                    }
                }
            } else {
                tmpPosition = self.checkBounds(self._currentPosition);
                if (tmpPosition !== self._currentPosition) {
                    lastIteraction = true;
                    self.isTweaking = false;
                    self.isAnimating = false;
                    tmpPosition = Math.round(tmpPosition);

                    state = STRINGS.stop;
                }
                self._currentPosition = tmpPosition;
            }


            // setup new position
            callback(self._currentPosition, lastIteraction, state);
        }

        window.requestAnimationFrame(animationStep, null);
    };

    proto.FRICTION = 0.000025;

    proto.startFling = function (startPosition, velocity, callback) {
        var duration, shift, newShift, flag = false, sign = velocity && velocity / Math.abs(velocity), friction = this.FRICTION;

        if (!this.DPI && !this._keepAbsoluteMetrics) {
            calculateScreenDPI();
        }


        if (!this._keepAbsoluteMetrics) {
            friction = this.FRICTION * this.DPI;
        }

        duration = Math.abs(velocity) / friction;
        shift = sign * velocity * velocity / friction;
        if (this._bounds) {
            if (startPosition + shift < this.minPosition - this.margin) {
                newShift = this.minPosition - this.margin/2 - startPosition;
                flag = true;
            }

            if (startPosition + shift > this.maxPosition + this.margin) {
                newShift = this.maxPosition + this.margin/2 - startPosition;
                flag = true;
            }
            if (flag) {
                duration = duration * newShift / shift;
                shift = newShift;
            }
        }

        this.animate(startPosition, startPosition + shift, duration, callback);
    };

    proto.tweakIfNeeded = function (position, callback) {
        var delta = 0;
        if (this.isAnimating) {
            return;
        }

        if (position < this.minPosition) {
            delta = position - this.minPosition;
        }
        if (position > this.maxPosition) {
            delta = position - this.maxPosition;
        }

        if (delta) {
            this.isTweaking = true;
            this.animate(position, position - delta, Math.min(Math.abs(delta) * 2, 350), callback, this._boundsEasing || 'easeOutQuad');
        }
    };

    proto.setBounds = function (min, max, margin) {
        this.minPosition = min;
        this.maxPosition = max;
        this.margin = margin || 0;
    };

    proto.inBounds = function (position) {
        return (position >= this.minPosition) && (position <= this.maxPosition);
    };

    proto.isStopped = function () {
        return !this.isAnimating;
    };

    proto.stop = function () {
        if (this.isAnimating) {
            window.cancelAnimationFrame(this._animationID);
            this.isAnimating = false;

            if (typeof this._callback === "function") {
                this._currentPosition = Math.round(this._currentPosition);
                this._callback(this._currentPosition, true, STRINGS.stop);
            }
        }
    };

    // =============================== prepare constants ======================================
    function calculateScreenDPI() {
        var stub = document.createElement('div');

        stub.style.position = 'absolute';
        stub.style.height = '1in';
        stub.style.width = '1in';
        stub.style.left = '-100%';
        stub.style.top = '-100%';

        document.body.appendChild(stub);
        proto.DPI = stub.offsetHeight;
        document.body.removeChild(stub);

        window.removeEventListener('load', calculateScreenDPI);
    }

    window.addEventListener('load', calculateScreenDPI, false);
    // ========================================================================================

    return proto;
})();