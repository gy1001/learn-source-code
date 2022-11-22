const template = `
  <div id="app">
    <div @click="{console.log('hi')}" :id="name">{{name}}</div>
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

//  标记一些 vue 的语法，
function transform () { }

// 标记之后的 ast 生成render 函数
function generate () { }

function compile (template) {
  // 模板解析成 render 函数
  // 第一步：生成 Ast
  const ast = parse(template.trim())
  console.log(JSON.stringify(ast, null, 2))
  // transform(ast)
}

compile(template)
