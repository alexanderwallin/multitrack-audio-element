import CustomEventShim from 'customevent-shim'

if (typeof global !== 'undefined') {
  global.CustomEvent = CustomEventShim
}
