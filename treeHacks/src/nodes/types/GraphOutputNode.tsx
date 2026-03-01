import { T, useEditor, useValue } from 'tldraw'
import { GraphIcon } from '../../components/icons/GraphIcon'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
} from '../../constants'
import { Port, ShapePort } from '../../ports/Port'
import { getNodeInputPortValues } from '../nodePorts'
import { NodeShape } from '../NodeShapeUtil'
import {
	ExecutionResult,
	InfoValues,
	InputValues,
	NodeComponentProps,
	NodeDefinition,
	NodeRow,
	STOP_EXECUTION,
} from './shared'

const DEFAULT_MAX_POINTS = 50
const MIN_POINTS_FOR_SPARKLINE = 2

export type GraphOutputNode = T.TypeOf<typeof GraphOutputNode>
export const GraphOutputNode = T.object({
	type: T.literal('graphOutput'),
	label: T.string,
	maxPoints: T.number,
	history: T.arrayOf(T.number),
	lastValue: T.number.nullable(),
})

export class GraphOutputNodeDefinition extends NodeDefinition<GraphOutputNode> {
	static type = 'graphOutput'
	static validator = GraphOutputNode
	title = 'Graph Output'
	heading = 'Graph'
	icon = (<GraphIcon />)

	getDefault(): GraphOutputNode {
		return {
			type: 'graphOutput',
			label: 'Trend',
			maxPoints: DEFAULT_MAX_POINTS,
			history: [],
			lastValue: null,
		}
	}

	getBodyHeightPx(_shape: NodeShape, _node: GraphOutputNode) {
		return NODE_ROW_HEIGHT_PX * 4
	}

	getPorts(_shape: NodeShape, _node: GraphOutputNode): Record<string, ShapePort> {
		return {
			input: {
				id: 'input',
				x: 0,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX / 2,
				terminal: 'end',
			},
		}
	}

	async execute(shape: NodeShape, node: GraphOutputNode, inputs: InputValues): Promise<ExecutionResult> {
		const inputValue = inputs['input'] ?? node.lastValue ?? 0
		const maxPoints = Math.max(5, Math.floor(node.maxPoints || DEFAULT_MAX_POINTS))
		const history = [...node.history, inputValue].slice(-maxPoints)

		this.editor.updateShape({
			id: shape.id,
			type: 'node',
			props: {
				node: {
					...node,
					maxPoints,
					history,
					lastValue: inputValue,
				},
				isOutOfDate: false,
			},
		})

		return {}
	}

	getOutputInfo(_shape: NodeShape, _node: GraphOutputNode, _inputs: InfoValues): InfoValues {
		return {}
	}

	Component = GraphOutputNodeComponent
}

export function GraphOutputNodeComponent({ shape, node }: NodeComponentProps<GraphOutputNode>) {
	const editor = useEditor()

	const connectedInputValue = useValue(
		'graph input value',
		() => {
			const portValues = getNodeInputPortValues(editor, shape.id)
			const input = portValues['input']
			if (!input) return null
			if (input.value === STOP_EXECUTION) return null
			return input.value
		},
		[editor, shape.id]
	)

	const currentValue = connectedInputValue ?? node.lastValue
	const data = node.history
	const polyline = getSparklinePolyline(data)

	return (
		<div className="GraphOutputNode">
			<NodeRow className="GraphOutputNode-input-row">
				<Port shapeId={shape.id} portId="input" />
				<span className="GraphOutputNode-label">{node.label}</span>
				<span className="GraphOutputNode-current">
					{currentValue === null ? '—' : formatValue(currentValue)}
				</span>
			</NodeRow>
			<div className="GraphOutputNode-chart" title="Recent values">
				{polyline ? (
					<svg viewBox="0 0 220 92" preserveAspectRatio="none" className="GraphOutputNode-svg">
						<polyline points={polyline} className="GraphOutputNode-line" />
					</svg>
				) : (
					<div className="GraphOutputNode-empty">No data</div>
				)}
			</div>
		</div>
	)
}

function getSparklinePolyline(values: number[]): string | null {
	if (values.length < MIN_POINTS_FOR_SPARKLINE) return null

	const width = 220
	const height = 92
	const min = Math.min(...values)
	const max = Math.max(...values)
	const range = max - min || 1

	return values
		.map((value, index) => {
			const x = (index / (values.length - 1)) * width
			const y = height - ((value - min) / range) * height
			return `${x.toFixed(2)},${y.toFixed(2)}`
		})
		.join(' ')
}

function formatValue(value: number): string {
	if (!isFinite(value)) return String(value)
	if (Number.isInteger(value)) return value.toLocaleString()
	return value.toPrecision(6).replace(/\.?0+$/, '')
}
