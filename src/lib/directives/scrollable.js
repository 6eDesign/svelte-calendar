import { scrollStep } from '$lib/config/scroll';

export default (node, { y: yi = 0, step = scrollStep, maxSteps = Infinity }) => {
	let lastTouch = 0;
	let y = yi;

	const updateY = (val) => {
		y = Math.max(0, Math.min(maxSteps * step, val));
	};
	const wheel = ({ deltaY }) => updateY(y + deltaY);
	const touchstart = ({ touches: [{ pageY }] }) => (lastTouch = pageY);
	const touchmove = ({ touches: [{ pageY }] }) => {
		updateY(y - pageY - lastTouch);
		lastTouch = pageY;
	};

	const emitY = () => {
		if (Math.round(y / step) === Math.round(yi / step)) return;
		yi = y;
		node.dispatchEvent(
			new CustomEvent('y', {
				detail: {
					y,
					step: Math.round(y / step)
				}
			})
		);
	};

	node.addEventListener('wheel', (evt) => {
		wheel(evt);
		emitY();
	});
	node.addEventListener('touchstart', (evt) => {
		touchstart(evt);
		emitY();
	});
	node.addEventListener('touchmove', (evt) => {
		touchmove(evt);
		emitY();
	});
};
