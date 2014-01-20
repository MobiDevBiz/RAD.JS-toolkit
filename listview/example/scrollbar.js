function ScrollBar(enveloped, className) {
    "use strict";
    var mFunctionName = "setPosition",
        mPrevFunc = enveloped[mFunctionName],
        mPrevReflow = enveloped.reflow,
        mPrevNotifyDataChange = enveloped.notifyDataChange,
        mContainer = enveloped.container,
        mBar = document.createElement('div'),
        mLastPosition,
        mHeight,
        mTransformName;

    enveloped[mFunctionName] = function () {
        var currentPosition;

        mPrevFunc.apply(this, arguments);

        currentPosition = -enveloped.scrollPosition * mHeight / enveloped.getMaxPosition();
        mBar.style[mTransformName] = "translate3d(0, " + currentPosition + "px, 0) scale(1)";

        mLastPosition = currentPosition;
    };

    enveloped.reflow = function () {
        mPrevReflow.apply(this, arguments);

        mBar.style.height = mContainer.offsetHeight * (mContainer.offsetHeight / (enveloped.getMaxPosition() + mContainer.offsetHeight)) + 'px';
        mHeight = mContainer.offsetHeight - mBar.offsetHeight;
    };

    enveloped.notifyDataChange = function () {
        if (mPrevNotifyDataChange) {
            mPrevNotifyDataChange.apply(this, arguments);
        }

        mBar.style.height = mContainer.offsetHeight * (mContainer.offsetHeight / (enveloped.getMaxPosition() + mContainer.offsetHeight)) + 'px';
        mHeight = mContainer.offsetHeight - mBar.offsetHeight;
    };

    mBar.style.position = 'absolute';
    mBar.className = className;
    mContainer.appendChild(mBar);

    mBar.style.height = mContainer.offsetHeight * (mContainer.offsetHeight / (enveloped.getMaxPosition() + mContainer.offsetHeight)) + 'px';
    mHeight = mContainer.offsetHeight - mBar.offsetHeight;
    mTransformName = addVendorPrefix("transform");

    return enveloped;
}
