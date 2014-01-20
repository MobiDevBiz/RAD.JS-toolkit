function ScrollView(element, o) {
    var mView = this,
        mScrollingWrapper,

        STRINGS = {
            vertical: 'vertical',
            fling: 'fling',
            pointerdown: 'pointerdown',
            pointermove: 'pointermove',
            pointerup: 'pointerup'
        },

        mTransformName,
        mTransitionName,
        mDirection = (o && o.direction) ? o.direction : STRINGS.vertical,
        mAnimator = new Animator({
            easing: (o && o.easing) ? o.easing : 'easeOutQuad',
            bounds: o ? !!o.bounds : false
        }),

        mCoordProp = (mDirection === STRINGS.vertical) ? 'screenY' : 'screenX',
        mParentProp = (mDirection === STRINGS.vertical) ? 'offsetHeight' : 'offsetWidth',

        mParentWidth,
        mParentHeight,

        mLastPointerCoordinate,

        mTransitionArray = [],
        eventFling;

    function eventPointerDown(e) {
        mAnimator.stop();
        mLastPointerCoordinate = e[mCoordProp];
    }

    function eventPointerMove(e) {
        mView.setPosition(mView.scrollPosition - (mLastPointerCoordinate - e[mCoordProp]));
        mLastPointerCoordinate = e[mCoordProp];
    }

    function eventPointerUp(e) {
        mView.setPosition(mView.scrollPosition - (mLastPointerCoordinate - e[mCoordProp]));
        mAnimator.tweakIfNeeded(mView.scrollPosition, mView.setPosition);
    }

    function eventResize() {
        clearTimeout(mView.resizeTimeout);
        mView.resizeTimeout = setTimeout(mView.reflow, 150);
    }

    mView._calculateMaxScroll = function () {
        mView._MaxScroll = mScrollingWrapper[mParentProp] - mView._ParentSize;
    };

    mView.setPosition = function (position, force) {
        mView.scrollPosition = force ? position : mAnimator.checkBounds(position);
        mTransitionArray[1] = mView.scrollPosition;
        mScrollingWrapper.style[mTransformName] = mTransitionArray.join("");
    };

    mView.scroll = function (shift, duration) {
        mAnimator.animate(mView.scrollPosition, mView.scrollPosition + shift, duration, mView.setPosition);
    };

    mView.refresh = function () {
        mAnimator.stop();

        mView._calculateMaxScroll();
        mAnimator.setBounds(Math.min(0, -mView._MaxScroll), 0, mView._ParentSize / 2.5);
        if (mScrollingWrapper[mParentProp]) {
            mAnimator.tweakIfNeeded(mView.scrollPosition, mView.setPosition);
        } else {
            mView.setPosition(0);
        }
    };

    mView.reflow = function () {
        var container = mView.container, tmpHeight = container.offsetHeight, tmpWidth = container.offsetWidth;

        if ((tmpHeight === 0) || (tmpHeight === mParentHeight && tmpWidth === mParentWidth)) {
            return;
        }

        mView._ParentSize = container[mParentProp];
        mParentHeight = tmpHeight;
        mParentWidth = tmpWidth;
        mView.refresh();
    };

    mView.getMaxPosition = function () {
        return mView._MaxScroll;
    };

    mView.destroy = function () {
        window.removeEventListener('resize', eventResize);
        clearTimeout(mView.resizeTimeout);
    };

    mView.handleEvent = function (e) {
        switch (e.type) {
        case STRINGS.fling:
            eventFling(e);
            break;
        case STRINGS.pointerdown:
            eventPointerDown(e);
            break;
        case STRINGS.pointermove:
            e.origin.preventDefault();
            eventPointerMove(e);
            break;
        case STRINGS.pointerup:
            eventPointerUp(e);
            break;
        }
        e.release();
    };

    //======================== construction part ========================
    mView.container = element;
    mView.scrollPosition = 0;

    eventFling = (function (isVertical) {
        if (isVertical)
            return function (e) {
                if (e.direction === STRINGS.vertical) {
                    mAnimator.startFling(mView.scrollPosition, e.speed, mView.setPosition);
                }
            };

        return function (e) {
            if (e.direction !== STRINGS.vertical) {
                mAnimator.startFling(mView.scrollPosition, e.speed, mView.setPosition);
            }
        };

    })(mDirection === STRINGS.vertical);


    if (mDirection === STRINGS.vertical) {
        mTransitionArray[0] = "translate3d(0, ";
        mTransitionArray[2] = "px, 0) scale(1)";
    } else {
        mTransitionArray[0] = "translate3d(";
        mTransitionArray[2] = "px, 0, 0) scale(1)";
    }

    mTransitionName = addVendorPrefix("transition");
    mTransformName = addVendorPrefix("transform");

    var validPosition = ['fixed', 'relative', 'absolute'], tmp = validPosition.indexOf(window.getComputedStyle(element, null).position);
    element.style.position = (tmp === -1)? 'relative' : validPosition[tmp];
    element.style.overflow = 'hidden';

    mScrollingWrapper = element.firstElementChild;
    mScrollingWrapper.style[(mDirection === STRINGS.vertical) ? 'width' : 'height'] = '100%';
    mScrollingWrapper.style.margin = 0;
    mScrollingWrapper.style.position = 'absolute';
    mScrollingWrapper.style[mTransitionName] = 'transform 0ms';

    mView.reflow();
    window.addEventListener('resize', eventResize, false);
    //==================================================================

    return mView;
}