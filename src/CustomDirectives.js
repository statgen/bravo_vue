
/* Expected use:
 *   app.directive('click-outside', clickOutside)
 *
 *   <div v-clickOutside="myFun">
 *
 * Adapted from:
 *   https://stackoverflow.com/a/42389266
 *   https://stackoverflow.com/a/64698630
 */
const clickOutside = {
  mounted: function (el, binding) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his children
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

export {clickOutside}
