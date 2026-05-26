export const weiqiSections = [
  {
    id: 'basics', name: '围棋入门', emoji: '♟️',
    lessons: [
      { id: 'board', title: '认识棋盘', type: 'intro', emoji: '🏁',
        desc: '围棋棋盘是19×19条线交叉组成的，横竖各有19条线，共361个交叉点。我们先用9×9的小棋盘来学习。' },
      { id: 'stone', title: '认识棋子', type: 'intro', emoji: '⚫',
        desc: '围棋有黑白两种棋子。黑棋先下，白棋后下。双方轮流在交叉点上落子。' },
      { id: 'place', title: '落子规则', type: 'practice', emoji: '👆',
        desc: '棋子要下在棋盘的交叉点上，不能下在格子里。点击交叉点来落子吧！' },
      { id: 'liberty', title: '气的概念', type: 'practice', emoji: '💨',
        desc: '棋子的"气"是指与它直接相连的空交叉点。一个棋子最多有4口气。没有气的棋子会被提走。' },
      { id: 'capture', title: '提子练习', type: 'practice', emoji: '🎯',
        desc: '当一个棋子的所有气都被对方堵住时，这个棋子就被"提"走了。试着把对方的棋子吃掉吧！' },
      { id: 'ko', title: '打劫规则', type: 'intro', emoji: '🔄',
        desc: '打劫是一种特殊的规则：不能立刻提回对方刚提的子，需要先在别处走一步。' },
    ]
  },
  {
    id: 'puzzles', name: '吃子挑战', emoji: '🧩',
    lessons: [
      { id: 'eat1', title: '吃子入门', type: 'puzzle', emoji: '🎯',
        size: 5, difficulty: 1, desc: '用1步棋吃掉白子' },
      { id: 'eat2', title: '征子练习', type: 'puzzle', emoji: '🏃',
        size: 7, difficulty: 2, desc: '用征子的方式吃掉白子' },
      { id: 'eat3', title: '枷吃练习', type: 'puzzle', emoji: '🔗',
        size: 7, difficulty: 2, desc: '用枷吃的方式吃掉白子' },
      { id: 'eat4', title: '扑吃练习', type: 'puzzle', emoji: '🪤',
        size: 5, difficulty: 2, desc: '用扑吃的方式吃掉白子' },
      { id: 'alive', title: '做活练习', type: 'puzzle', emoji: '💚',
        size: 7, difficulty: 3, desc: '做出两只眼让棋子活起来' },
    ]
  },
]

export function getAllWeiqiLessons() {
  return weiqiSections.flatMap(s => s.lessons)
}
