export const mathSections = [
  {
    id: 'numbers', name: '认识数字', emoji: '🔢',
    lessons: [
      { id: 'num1', title: '数字1', number: 1, emoji: '🍎', items: ['🍎'] },
      { id: 'num2', title: '数字2', number: 2, emoji: '🍊🍊', items: ['🍊', '🍊'] },
      { id: 'num3', title: '数字3', number: 3, emoji: '🍋🍋🍋', items: ['🍋', '🍋', '🍋'] },
      { id: 'num4', title: '数字4', number: 4, emoji: '🍇', items: ['🍇', '🍇', '🍇', '🍇'] },
      { id: 'num5', title: '数字5', number: 5, emoji: '🍓', items: ['🍓', '🍓', '🍓', '🍓', '🍓'] },
      { id: 'num6', title: '数字6', number: 6, emoji: '🍑', items: ['🍑', '🍑', '🍑', '🍑', '🍑', '🍑'] },
      { id: 'num7', title: '数字7', number: 7, emoji: '🥝', items: Array(7).fill('🥝') },
      { id: 'num8', title: '数字8', number: 8, emoji: '🍌', items: Array(8).fill('🍌') },
      { id: 'num9', title: '数字9', number: 9, emoji: '🍒', items: Array(9).fill('🍒') },
      { id: 'num10', title: '数字10', number: 10, emoji: '🍉', items: Array(10).fill('🍉') },
    ]
  },
  {
    id: 'compare', name: '比大小', emoji: '⚖️',
    lessons: [
      { id: 'cmp1', title: '谁更多?', type: 'compare', a: 3, b: 5, emoji: '🤔' },
      { id: 'cmp2', title: '谁更少?', type: 'compare', a: 7, b: 2, emoji: '🤔' },
      { id: 'cmp3', title: '一样多吗?', type: 'compare', a: 4, b: 4, emoji: '🤔' },
      { id: 'cmp4', title: '大小排序', type: 'sort', numbers: [2, 5, 8], emoji: '📊' },
      { id: 'cmp5', title: '从大到小', type: 'sort', numbers: [9, 3, 6], emoji: '📊' },
    ]
  },
  {
    id: 'addition', name: '加法入门', emoji: '➕',
    lessons: [
      { id: 'add1', title: '1+1=?', type: 'add', a: 1, b: 1, emoji: '🧮' },
      { id: 'add2', title: '2+1=?', type: 'add', a: 2, b: 1, emoji: '🧮' },
      { id: 'add3', title: '2+3=?', type: 'add', a: 2, b: 3, emoji: '🧮' },
      { id: 'add4', title: '3+4=?', type: 'add', a: 3, b: 4, emoji: '🧮' },
      { id: 'add5', title: '5+3=?', type: 'add', a: 5, b: 3, emoji: '🧮' },
      { id: 'add6', title: '4+5=?', type: 'add', a: 4, b: 5, emoji: '🧮' },
      { id: 'add7', title: '6+3=?', type: 'add', a: 6, b: 3, emoji: '🧮' },
      { id: 'add8', title: '7+2=?', type: 'add', a: 7, b: 2, emoji: '🧮' },
    ]
  },
  {
    id: 'subtraction', name: '减法入门', emoji: '➖',
    lessons: [
      { id: 'sub1', title: '2-1=?', type: 'sub', a: 2, b: 1, emoji: '🧮' },
      { id: 'sub2', title: '3-1=?', type: 'sub', a: 3, b: 1, emoji: '🧮' },
      { id: 'sub3', title: '5-2=?', type: 'sub', a: 5, b: 2, emoji: '🧮' },
      { id: 'sub4', title: '7-3=?', type: 'sub', a: 7, b: 3, emoji: '🧮' },
      { id: 'sub5', title: '8-4=?', type: 'sub', a: 8, b: 4, emoji: '🧮' },
      { id: 'sub6', title: '9-5=?', type: 'sub', a: 9, b: 5, emoji: '🧮' },
      { id: 'sub7', title: '10-6=?', type: 'sub', a: 10, b: 6, emoji: '🧮' },
      { id: 'sub8', title: '10-3=?', type: 'sub', a: 10, b: 3, emoji: '🧮' },
    ]
  },
  {
    id: 'shapes', name: '认识图形', emoji: '🔷',
    lessons: [
      { id: 'shp1', title: '圆形', type: 'shape', shape: 'circle', emoji: '⭕' },
      { id: 'shp2', title: '正方形', type: 'shape', shape: 'square', emoji: '🟧' },
      { id: 'shp3', title: '三角形', type: 'shape', shape: 'triangle', emoji: '🔺' },
      { id: 'shp4', title: '长方形', type: 'shape', shape: 'rectangle', emoji: '🟩' },
    ]
  },
]

export function getAllMathLessons() {
  return mathSections.flatMap(s => s.lessons)
}
