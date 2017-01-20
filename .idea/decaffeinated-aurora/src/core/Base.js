//
// The Base class defines an extend method so that
// CoffeeScript classes can be extended easily by
// plain JavaScript. Based on http://ejohn.org/blog/simple-javascript-inheritance/.
//

let fnTest
class Base {
  static initClass () {
    fnTest = /\b_super\b/
  }

  static extend (prop) {
    let fn, key
    class Class extends this {}

    if (typeof prop === 'function') {
      let keys = Object.keys(Class.prototype)
      prop.call(Class, Class)

      prop = {}
      for (key in Class.prototype) {
        fn = Class.prototype[key]
        if (!Array.from(keys).includes(key)) {
          prop[key] = fn
        }
      }
    }

    let _super = Class.__super__

    for (key in prop) {
            // test whether the method actually uses _super() and wrap it if so
      fn = prop[key]
      if ((typeof fn === 'function') && fnTest.test(fn)) {
        ((key, fn) =>
                    Class.prototype[key] = function () {
                      let tmp = this._super
                      this._super = _super[key]

                      let ret = fn.apply(this, arguments)
                      this._super = tmp

                      return ret
                    }
                )(key, fn)
      } else {
        Class.prototype[key] = fn
      }
    }

    return Class
  }
}
Base.initClass()

export default Base
