/**
 * interface DAG {
 *     shapes: Shape[]
 *     relations: Relation[]
 * }
 *
 * interface Shape {
 *     id: string
 *     pos: Position
 * }
 *
 * interface Relation {
 *     source: string
 *     target: string
 *     startPos: Position
 *     endPos: Position
 *     dashed: boolean
 * }
 *
 * interface Position {
 *     x: number
 *     y: number
 * }
 *
 * 该DAG为树状结构，将树状结构颠倒排序
 * @param {*} dag
 */
export default function(dag) {
  // 建立id和节点对象的映射
  const idShapeMap = dag.shapes.reduce((pre, cur) => (pre[cur.id] = cur) && pre, {});

  // 找到根节点
  const relationSourcesSet = new Set(dag.relations.map(r => r.source));
  const root = dag.shapes.find(s => !relationSourcesSet.has(s.id));

  // BFS层级遍历，赋予坐标
  const queue1 = [];
  const queue2 = [];
  const tmpQueue = null;
  queue1.push(root.id);
  while (queue1.length) {
    // TODO
  }
}
