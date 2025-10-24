const button = document.querySelector('button');
const buttonWidth = button.clientWidth;
const buttonHeight = button.clientHeight;
const buttonStyles = button.getBoundingClientRect();

button.addEventListener('mouseenter', mouseEnter);
button.addEventListener('mouseleave', mouseLeave);

function mouseEnter(e) {
    const xPercent = ((e.clientX - buttonStyles.left) / buttonWidth) * 100;
    const yPercent = ((e.clientY - buttonStyles.top) / buttonHeight) * 100;
    let transitionMultiplier = xPercent < 50 ? ((xPercent - 50) * -1) / 50 : (xPercent - 50) / 50;
    const speed = 1.3;
    const speedBasedOnCursorPosition = speed - ((speed * 0.65 ) * transitionMultiplier);

    TweenMax.set('.mask', {
        opacity: 1,
        attr: {
            r: 0,
            cx: e.clientX - buttonStyles.left,
            cy: e.clientY - buttonStyles.top
        }
    });
    new TimelineMax().to('.mask', speedBasedOnCursorPosition, {
        ease: Power4.easeOut,
        attr: { r: buttonWidth * 0.4 }
    });
}

function mouseLeave() {
    const tl = new TimelineMax()
        .to('.mask', 0.2, {ease: Power1.easeOut, opacity: 0});
}