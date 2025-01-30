import {useRandomPicker} from './useRandomPicker.js'

// 初始化
const array = ['Apple', 'Banana', 'Cherry', 'Date']
const cyclicPicker = useRandomPicker().createCyclicPicker(array)

// 遍历元素
for (let i = 0; i < 10; i++) {
  console.log(cyclicPicker.next())
}

// 输出示例：
// 'Banana' → 'Date' → 'Cherry' → 'Apple' →（重新打乱）→ 'Cherry' → 'Date'