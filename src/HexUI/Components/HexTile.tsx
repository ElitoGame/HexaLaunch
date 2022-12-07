import { createSignal, mergeProps, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { getHexMargin, getHexSize, searchAppDB } from "../../main";

const HexTile = (props: {
	x: number;
	y: number;
	radiant: number;
	onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
	zIndex?: number;
	color?: string;
	title?: string;
	action?: string;
	icon?: string;
	hasAnimation?: boolean;
	hasHoverEffect?: boolean;
}) => {
	const merged = mergeProps(
		{
			x: 0,
			y: 0,
			radiant: 0,
			onClick: () => {},
			zIndex: 10,
			color: "bg-neutral-600",
			title: "✨",
			action: "",
			icon: "",
			hasAnimation: true,
			hasHoverEffect: true,
		},
		props
	);

	// console.log(merged.radiant, props.radiant, merged.hasAnimation);
	const [getScale, setScale] = createSignal(merged.hasAnimation ? 0 : 100);
	let delay = 1;
	if (merged.hasAnimation) {
		// give a delay according to these coordinates
		// 1, 0 -> 1
		// 1, 1 -> 2
		// 0, 1 -> 3
		// -1, 0 -> 4
		// 0, -1 -> 5
		// 1, -1 -> 6
		if (merged.radiant === 0) {
			if (merged.x === 1 && merged.y === 0) {
				delay = 1;
			} else if (merged.x === 1 && merged.y === 1) {
				delay = 2;
			} else if (merged.x === 0 && merged.y === 1) {
				delay = 3;
			} else if (merged.x === -1 && merged.y === 0) {
				delay = 4;
			} else if (merged.x === 0 && merged.y === -1) {
				delay = 5;
			} else if (merged.x === 1 && merged.y === -1) {
				delay = 6;
			}
		} else {
			delay = Math.sqrt(merged.x * merged.x + merged.y * merged.y) * 1.5;
		}

		setTimeout(() => {
			setScale(100);
		}, 100);
	}

	return (
		<div
			class={`hexTile absolute bg-transparent cursor-pointer inline-block transition-transform`}
			style={{
				left: `${
					merged.x * (getHexSize() + getHexMargin()) -
					(merged.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) -
					getHexSize() / 2
				}px`,
				bottom: `${
					merged.y * (getHexSize() * 0.86 + getHexMargin()) -
					(getHexSize() / 13) * 8
				}px`,
				width: `${getHexSize() + getHexMargin()}px`,
				margin: `${getHexMargin()}px`,
				height: `${(getHexSize() + getHexMargin()) * 1.169}px`,
				"clip-path":
					"polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)",
				"z-index": merged.zIndex ?? 0,
				"transform-origin": "center",
				transform: `scale(${getScale() / 100})`,
				"transition-duration": `${delay * 0.075}s`,
			}}
		>
			<div
				class={
					"absolute " +
					merged.color +
					` cursor-pointer inline-block ${
						merged.hasHoverEffect
							? "hover:scale-97 transition-transform hover:opacity-90"
							: ""
					}`
				}
				style={{
					left: `${(getHexMargin() / 2) * -1}px`,
					bottom: `${(getHexMargin() / 2) * -1}px`,
					width: `${getHexSize()}px`,
					margin: `${getHexMargin()}px`,
					height: `${getHexSize() * 1.169}px`,
					"transform-origin": "center",
					"clip-path":
						"polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)",
					"z-index": (merged.zIndex ?? 0) + 1,
				}}
				onClick={merged.onClick}
			>
				<Show
					when={merged.action === "App"}
					fallback={
						<span class='text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
							{merged.title}
						</span>
					}
				>
					<span class='text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
						{merged.title}
					</span>
					{/* <img src={merged.icon} class='w-7'></img> */}
				</Show>
			</div>
		</div>
	);
};

export default HexTile;
