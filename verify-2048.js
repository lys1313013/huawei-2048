const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const start = html.indexOf('// PURE_CORE_START');
const end = html.indexOf('// PURE_CORE_END');
assert(start >= 0 && end > start, '纯函数区标记存在');
const core = html.slice(start + '// PURE_CORE_START'.length, end);
const context = {};
vm.runInNewContext(core + '\nthis.api={slideLine:slideLine,moveBoard:moveBoard,isGameOver:isGameOver};', context);
const { moveBoard, isGameOver } = context.api;
function equal(actual, expected, message) { assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), expected, message); }
let r = moveBoard([[2,2,2,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]], 'left');
equal(r.board[0], [4,4,0,0], '[2,2,2,2] 左移'); assert.strictEqual(r.score, 8, '合并得分 +8');
r = moveBoard([[4,4,8,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], 'left');
equal(r.board[0], [8,8,0,0], '[4,4,8,0] 左移'); assert.strictEqual(r.score, 8, '每块每步只合并一次');
const unchanged = [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
r = moveBoard(unchanged, 'left'); assert.strictEqual(r.changed, false, '无效移动标记为未变化'); equal(r.board, unchanged, '无效移动保持棋盘');
const moveSource = html.slice(html.indexOf('function move(direction)'), html.indexOf('function undo()'));
assert(moveSource.indexOf('if(!result.changed)return;') >= 0 && moveSource.indexOf('if(!result.changed)return;') < moveSource.indexOf('spawn();'), '无效移动提前返回，不生成新块');
for (const [direction, position] of [['left',[1,0]],['right',[1,3]],['up',[0,1]],['down',[3,1]]]) {
 const b=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; b[1][1]=2;
 const moved=moveBoard(b,direction).board; equal(moved[position[0]][position[1]],2,direction+' 方向映射');
}
assert.strictEqual(isGameOver([[2,4,8,16],[32,64,128,256],[512,1024,2,4],[8,16,32,64]]), true, '满盘且无相邻相同应结束');
assert.strictEqual(isGameOver([[2,2,8,16],[32,64,128,256],[512,1024,2,4],[8,16,32,64]]), false, '有相邻相同仍可移动');
console.log('PASS: 合并与计分、单步合并限制、无效移动不生成新块、四方向映射、游戏结束判定');
