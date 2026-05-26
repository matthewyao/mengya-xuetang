export const englishSections = [
  {
    id: 'alphabet', name: '字母学习', emoji: '🔤',
    lessons: [
      { id: 'a', letter: 'Aa', word: 'Apple', emoji: '🍎', sound: 'æ' },
      { id: 'b', letter: 'Bb', word: 'Ball', emoji: '⚽', sound: 'b' },
      { id: 'c', letter: 'Cc', word: 'Cat', emoji: '🐱', sound: 'k' },
      { id: 'd', letter: 'Dd', word: 'Dog', emoji: '🐶', sound: 'd' },
      { id: 'e', letter: 'Ee', word: 'Egg', emoji: '🥚', sound: 'e' },
      { id: 'f', letter: 'Ff', word: 'Fish', emoji: '🐟', sound: 'f' },
      { id: 'g', letter: 'Gg', word: 'Grape', emoji: '🍇', sound: 'ɡ' },
      { id: 'h', letter: 'Hh', word: 'Hat', emoji: '🎩', sound: 'h' },
      { id: 'i', letter: 'Ii', word: 'Ice cream', emoji: '🍦', sound: 'aɪ' },
      { id: 'j', letter: 'Jj', word: 'Juice', emoji: '🧃', sound: 'dʒ' },
      { id: 'k', letter: 'Kk', word: 'Kite', emoji: '🪁', sound: 'k' },
      { id: 'l', letter: 'Ll', word: 'Lion', emoji: '🦁', sound: 'l' },
      { id: 'm', letter: 'Mm', word: 'Moon', emoji: '🌙', sound: 'm' },
      { id: 'n', letter: 'Nn', word: 'Nose', emoji: '👃', sound: 'n' },
      { id: 'o', letter: 'Oo', word: 'Orange', emoji: '🍊', sound: 'ɒ' },
      { id: 'p', letter: 'Pp', word: 'Panda', emoji: '🐼', sound: 'p' },
      { id: 'q', letter: 'Qq', word: 'Queen', emoji: '👸', sound: 'kw' },
      { id: 'r', letter: 'Rr', word: 'Rainbow', emoji: '🌈', sound: 'r' },
      { id: 's', letter: 'Ss', word: 'Sun', emoji: '☀️', sound: 's' },
      { id: 't', letter: 'Tt', word: 'Tiger', emoji: '🐯', sound: 't' },
      { id: 'u', letter: 'Uu', word: 'Umbrella', emoji: '☂️', sound: 'ʌ' },
      { id: 'v', letter: 'Vv', word: 'Violin', emoji: '🎻', sound: 'v' },
      { id: 'w', letter: 'Ww', word: 'Whale', emoji: '🐋', sound: 'w' },
      { id: 'x', letter: 'Xx', word: 'Xylophone', emoji: '🎵', sound: 'ks' },
      { id: 'y', letter: 'Yy', word: 'Yacht', emoji: '⛵', sound: 'j' },
      { id: 'z', letter: 'Zz', word: 'Zebra', emoji: '🦓', sound: 'z' },
    ]
  },
  {
    id: 'words', name: '基础词汇', emoji: '📝',
    lessons: [
      { id: 'animal1', title: '动物', type: 'match', pairs: [
        { en: 'Cat', zh: '猫', emoji: '🐱' }, { en: 'Dog', zh: '狗', emoji: '🐶' },
        { en: 'Bird', zh: '鸟', emoji: '🐦' }, { en: 'Fish', zh: '鱼', emoji: '🐟' },
      ]},
      { id: 'fruit1', title: '水果', type: 'match', pairs: [
        { en: 'Apple', zh: '苹果', emoji: '🍎' }, { en: 'Banana', zh: '香蕉', emoji: '🍌' },
        { en: 'Grape', zh: '葡萄', emoji: '🍇' }, { en: 'Orange', zh: '橙子', emoji: '🍊' },
      ]},
      { id: 'color1', title: '颜色', type: 'match', pairs: [
        { en: 'Red', zh: '红色', emoji: '🔴' }, { en: 'Blue', zh: '蓝色', emoji: '🔵' },
        { en: 'Green', zh: '绿色', emoji: '🟢' }, { en: 'Yellow', zh: '黄色', emoji: '🟡' },
      ]},
      { id: 'number1', title: '数字', type: 'match', pairs: [
        { en: 'One', zh: '一', emoji: '1️⃣' }, { en: 'Two', zh: '二', emoji: '2️⃣' },
        { en: 'Three', zh: '三', emoji: '3️⃣' }, { en: 'Four', zh: '四', emoji: '4️⃣' },
      ]},
    ]
  },
]

export function getAllEnglishLessons() {
  return englishSections.flatMap(s => s.lessons)
}
