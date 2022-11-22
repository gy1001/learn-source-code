const template = `
  <div id="app">
    <div @click="{console.log('hi')}" :id="name">你好，{{name}}</div>
    <h1 :name="title">Vue编译</h1>
    <p class="container">编译学习</p>
  </div>
`

function tokenizer (input) {
  // 切开字符串
  const tokens = []
  let type = ''
  let value = ''
  function push () {
    if (value) {
      if (type === 'tagstart')
        value = value.slice(1)
      if (type === 'tagend')
        value = value.slice(2)
      tokens.push({
        type,
        value,
      })
      value = ''
    }
  }
  for (let index = 0; index < input.length; index++) {
    const tempStr = input[index]
    if (tempStr === '<') {
      // 标签开始
      if (input[index + 1] === '/') {
        // 标签结束
        push()
        type = 'tagend'
      } else {
        // 标签开始
        type = 'tagstart'
      }
    } else if (tempStr === '>') {
      if (input[index - 1] === '=') {
        // 箭头函数，这里尽量忽略
      } else {
        //  或者闭合标签的结束
        push()
        type = 'text'
        continue
      }
    } else if (/[\s]/.test(tempStr)) {
      // 遇见空格，收集一个 token
      push()
      type = 'props'
      continue
    }
    value += tempStr
  }
  return tokens
}

function parse (template) {
  //  template => AST
  // 字符串遍历，变为嵌套对象
  const tokens = tokenizer(template)
  let cur = 0 // 当前指针
  const ast = {
    type: 'root',
    props: [],
    children: [],
  }

  function walk () {
    let token = tokens[cur]
    if (token.type === 'tagstart') {
      // tagstart 意味着多了一个子元素
      const node = {
        type: 'element',
        tag: token.value,
        props: [],
        children: [],
      }
      token = tokens[++cur]
      while (token.type !== 'tagend') {
        if (token.type === 'props')
          node.props.push(walk())
        else
          node.children.push(walk())
        token = tokens[cur]
      }
      cur++
      return node
    } else if (token.type === 'props') {
      const [key, val] = token.value.replace('=', '~').split('~')
      cur++
      return { key, val }
    } else if (token.type === 'text') {
      cur++
      return token
    } else if (token.type === 'tagend') {
      cur++
    }
  }
  // 遍历切开的 内容，整理成嵌套的对象
  while (cur < tokens.length) {
    const token = walk()
    ast.children.push(token)
  }
  return ast
}

const PatchFlags = {
  TEXT: 1,
  CLASS: 1 << 1,
  STYLE: 1 << 2,
  PROPS: 1 << 3,
  EVENT: 1 << 4,
}

function transform (ast) {
  // 需要收集桑当前模板依赖的函数，这样 generate 才能生成 import 语句
  const context = {
    helpers: new Set(['openBlock', 'createElementVNode', 'createElementBlock']),
  }
  // 标记一些 vue 的语法，vue3中多了一些静态标记
  // 遍历 ast 这棵树，对 vue 语法进行转换，对节点是否静态进行标记
  travest(ast, context)
}

function travest (ast, context) {
  // 需要嵌套
  const re = /\{\{(.*)\}\}/g
  switch (ast.type) {
    case 'root':
    case 'element':
      context.helpers.add('openBlock')
      context.helpers.add('createElementBlock')
      ast.children.forEach((astNode) => {
        travest(astNode, context)
      })
      ast.props = ast.props.map((prop) => {
        const { key, val } = prop
        if (key[0] === '@') {
          return {
            key: `on${key[1].toUpperCase()}${key.slice(2)}`,
            val,
          }
        } else if (key[0] === ':') {
          // 属性的操作函数不同 diff 的时候做不同的标记
          // class
          // styles
          // 别的属性
          return {
            key: key.slice(1),
            val,
          }
        } else if (key.startsWith('v-')) {
          // v-model v-if
          return prop
        }
        // 所有的 vue 语法都没识别，这里就是静态的
        return { ...prop, static: true }
      })
      break
    case 'text':
      if (re.test(ast.val)) {
        // 说明有 变量
        context.helpers.add('toDisplayString')
        ast.val = ast.val.replace(re, (s0, s1) => {
          return s1 // 直接替换，默认变量
        })
      } else {
        // 普通的文本
      }
      break
  }
  return ast
}

// 标记之后的 ast 生成render 函数
function generate () { }

function compile (template) {
  // 模板解析成 render 函数
  // 第一步：生成 Ast
  const ast = parse(template.trim())
  transform(ast)
  console.log(JSON.stringify(ast, null, 2))
}

compile(template)
