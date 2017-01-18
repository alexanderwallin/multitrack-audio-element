export const parsesAnyValueAsBool = (t, target, attributeName) => {
  target[attributeName] = false
  target[attributeName] = 'cats in space'
  t.is(target[attributeName], true)

  target[attributeName] = false
  target[attributeName] = 1
  t.is(target[attributeName], true)

  target[attributeName] = false
  target[attributeName] = () => {}
  t.is(target[attributeName], true)

  target[attributeName] = true
  target[attributeName] = ''
  t.is(target[attributeName], false)

  target[attributeName] = true
  target[attributeName] = 0
  t.is(target[attributeName], false)

  target[attributeName] = true
  target[attributeName] = null
  t.is(target[attributeName], false)
}
