import { render } from "solid-js/web";
import { getShowPosition } from "./renderer";

import "../style.css";

function HelloWorld() {
	return (
		<div
			class="red"
			style={{
				position: "absolute",
				top: `${getShowPosition()?.y}px`,
				left: `${getShowPosition()?.x}px`,
			}}
		>
			<button
				onClick={() => {
					console.log("test");
				}}
			>
				Testy
			</button>
		</div>
	);
}

render(() => <HelloWorld />, document.getElementById("root") as HTMLElement);
