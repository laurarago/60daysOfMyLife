export function tooltip(element) {
	let div;
	let title;
	function mouseOver(event) {
		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseleave`
		title = element.getAttribute('title');
		element.removeAttribute('title');
		
		div = document.createElement('div');
		div.textContent = title;
		div.style = `
			border: 4px solid #212121;
			box-shadow: 1px 1px 1px #212121;
			background: #212121;
			border-radius: 4px;
			padding: 4px;
			position: absolute;
            color: white;
			top: ${event.pageX + 10}px;
			left: ${event.pageY + 10}px;
            z-index: 10;
            font-family: OpenSans, Helvetica;
            font-weight:100;

		`;
		document.body.appendChild(div);
	}
	function mouseMove(event) {
		div.style.left = `${event.pageX + 10}px`;
		div.style.top = `${event.pageY + 10}px`;
	}
	function mouseLeave() {
		document.body.removeChild(div);
		// NOTE: restore the `title` attribute
		element.setAttribute('title', title);
	}
	
	element.addEventListener('mouseover', mouseOver);
  element.addEventListener('mouseleave', mouseLeave);
	element.addEventListener('mousemove', mouseMove);
	
	return {
		destroy() {
			element.removeEventListener('mouseover', mouseOver);
			element.removeEventListener('mouseleave', mouseLeave);
			element.removeEventListener('mousemove', mouseMove);
		}
	}
}