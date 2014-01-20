function ScrollBar(wrappable, className) {
    var mPrevFunc = wrappable.setPosition,
        mPrevRefresh = wrappable.refresh,
        mContainer = wrappable.container,
        mBar = document.createElement('div'),
        mLastPosition,
        mHeight,
        mTransformName,
        mTranslateArray = [],
        mPXStr = "px";

    function updateBar() {
        mBar.style.height = mContainer.offsetHeight * (mContainer.offsetHeight / (wrappable.getMaxPosition() + mContainer.offsetHeight)) + mPXStr;
        mHeight = mContainer.offsetHeight - mBar.offsetHeight;
    }

    wrappable.setPosition = function () {
        mPrevFunc.apply(this, arguments);

        mLastPosition = -wrappable.scrollPosition * mHeight / wrappable.getMaxPosition();
        mTranslateArray[1] = mLastPosition;
        mBar.style[mTransformName] = mTranslateArray.join("");
    };

    wrappable.refresh = function () {
        mPrevRefresh.apply(this, arguments);
        updateBar();
    };

    mTransformName = addVendorPrefix("transform");
    mTranslateArray[0] = "translate3d(0, ";
    mTranslateArray[2] = "px, 0) scale(1)";

    mBar.style.position = "absolute";
    mBar.style.marginRight = "3px";
    mBar.className = className;
    mContainer.appendChild(mBar);

    updateBar();

    return wrappable;
}
