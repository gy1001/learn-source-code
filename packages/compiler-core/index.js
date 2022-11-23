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
      if (type === 'tagstart') {
        value = value.slice(1)
      }
      if (type === 'tagend') {
        value = value.slice(2)
      }
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
        if (token.type === 'props') {
          node.props.push(walk())
        } else {
          node.children.push(walk())
        }
        token = tokens[cur]
      }
      cur++
      return node
    } else if (token.type === 'props') {
      const [key, value] = token.value.replace('=', '~').split('~')
      cur++
      return { key, value }
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
  ast.helpers = context.helpers
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
      ast.flag = 0
      ast.props = ast.props.map((prop) => {
        const { key, value } = prop
        if (key[0] === '@') {
          ast.flag |= PatchFlags.EVENT
          return {
            key: `on${key[1].toUpperCase()}${key.slice(2)}`,
            value,
          }
        } else if (key[0] === ':') {
          // 属性的操作函数不同 diff 的时候做不同的标记
          // class
          // styles
          // 别的属性
          const k = key.slice(1)
          if (k === 'class') {
            ast.flag |= PatchFlags.CLASS
          } else if (k === 'style') {
            ast.flag |= PatchFlags.STYLE
          } else {
            ast.flag |= PatchFlags.PROPS
          }
          return {
            key: key.slice(1),
            value,
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
      if (re.test(ast.value)) {
        // 说明有 变量
        context.helpers.add('toDisplayString')
        ast.flag |= PatchFlags.TEXT
        ast.value = ast.value.replace(re, (s0, s1) => {
          return s1 // 直接替换，默认变量
        })
      } else {
        // 普通的文本
        ast.static = true
      }
      break
  }
  return ast
}

function travaseNode (node, ast) {
  const { flag } = ast
  switch (node.type) {
    case 'element': {
      const props = node.props.reduce((ret, p) => {
        if (flag && PatchFlags.PROPS) {
          ret.push(`${p.key}: _cxt.${p.value}`)
        } else {
          ret.push(`${p.key}:${p.value}`)
        }
        return ret
      }, []).join(',')
      return `_createElementVNode("${node.tag}", {${props}}, [
        ${node.children.map(n => travaseNode(n, ast))}
      ]${node.flag ? `,${node.flag}` : ''})`
    }
    case 'text':
      if (node.static) {
        return `'${node.value}'`
      } else {
        return `_toDisplayString(_ctx.${node.value})`
      }
  }
}

// 标记之后的 ast 生成render 函数
function generate (ast) {
  // 标记之后的 ast 生成 render 函数
  const code = `import { ${[...ast.helpers].map(v => `${v} as _${v}`).join(',')}
        }  from 'vue';
        export function render (_ctx, _cache, $props) {
          return (_openBlock(), ${ast.children.map(node => travaseNode(node, ast))})
  }
  `
  return code
}

function compile (template) {
  // 模板解析成 render 函数
  // 第一步：生成 Ast
  const ast = parse(template.trim())
  transform(ast)
  return generate(ast)
  // console.log(JSON.stringify(ast, null, 2))
}

const genderCode = compile(template)
console.log(genderCode)
