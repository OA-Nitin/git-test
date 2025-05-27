/*!
* metismenu https://github.com/onokumus/metismenu#readme
* A jQuery menu plugin
* @version 3.0.6
* @author Osman Nuri Okumus <onokumus@gmail.com> (https://github.com/onokumus)
* @license: MIT
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MetisMenu = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var MetisMenu = /*#__PURE__*/function () {
    /**
     * Creates an instance of MetisMenu.
     *
     * @class MetisMenu
     * @param {Element | string} element
     * @param {object} [options]
     */
    function MetisMenu(element, options) {
      _classCallCheck(this, MetisMenu);

      this.element = MetisMenu.isElement(element) ? element : document.querySelector(element);
      this.config = Object.assign({
        toggle: true,
        preventDefault: true,
        triggerElement: 'a',
        parentTrigger: 'li',
        subMenu: 'ul'
      }, options);
      this.cacheEl = {};
      this.cacheConfig = {};
      this.cacheConfig.toggle = this.config.toggle;
      this.cacheConfig.preventDefault = this.config.preventDefault;
      this.cacheEl.triggerElement = this.config.triggerElement;
      this.cacheEl.parentTrigger = this.config.parentTrigger;
      this.cacheEl.subMenu = this.config.subMenu;
      this.init();
    }
    /**
     * @returns {void}
     * @public
     */


    _createClass(MetisMenu, [{
      key: "init",
      value: function init() {
        var _this = this;

        this.element.classList.add('metismenu');
        this.element.addEventListener('click', function (event) {
          var target = event.target;

          var parentItem = target.closest(_this.cacheEl.parentTrigger);
          if (parentItem === null || target.closest(_this.cacheEl.subMenu) !== null) {
            return;
          }

          var triggerItem = parentItem.querySelector(_this.cacheEl.triggerElement);

          if (triggerItem !== null && triggerItem.contains(target) || triggerItem === target) {
            _this.toggle(parentItem);
          }
        });
      }
      /**
       * @param {Element} item
       * @returns {void}
       * @public
       */

    }, {
      key: "toggle",
      value: function toggle(item) {
        var subMenu = item.querySelector(this.cacheEl.subMenu);

        if (subMenu === null) {
          return;
        }

        if (item.classList.contains('mm-active')) {
          this.hide(item);
        } else {
          this.show(item);
        }
      }
      /**
       * @param {Element} item
       * @returns {void}
       * @public
       */

    }, {
      key: "show",
      value: function show(item) {
        var _this2 = this;

        if (this.isTransitioning || item.classList.contains('mm-active')) {
          return;
        }

        var complete = function complete() {
          subMenu.removeEventListener('transitionend', complete);
          _this2.setTransitioning(false);
          item.classList.add('mm-active');
          subMenu.style.height = '';
          subMenu.style.overflow = '';
          subMenu.style.transition = '';
          if (typeof _this2.config.onShown === 'function') {
            _this2.config.onShown(item);
          }
        };

        var subMenu = item.querySelector(this.cacheEl.subMenu);

        if (subMenu === null) {
          return;
        }

        subMenu.style.height = '0px';
        subMenu.style.overflow = 'hidden';
        subMenu.style.transition = 'height .35s ease';
        subMenu.style.display = 'block';
        var height = subMenu.scrollHeight;
        this.setTransitioning(true);

        if (typeof this.config.onShow === 'function') {
          this.config.onShow(item);
        }

        requestAnimationFrame(function () {
          subMenu.style.height = "".concat(height, "px");
          subMenu.addEventListener('transitionend', complete);
        });
      }
      /**
       * @param {Element} item
       * @returns {void}
       * @public
       */

    }, {
      key: "hide",
      value: function hide(item) {
        var _this3 = this;

        if (this.isTransitioning || !item.classList.contains('mm-active')) {
          return;
        }

        var complete = function complete() {
          subMenu.removeEventListener('transitionend', complete);
          subMenu.style.display = '';
          subMenu.style.height = '';
          subMenu.style.overflow = '';
          subMenu.style.transition = '';
          _this3.setTransitioning(false);
          item.classList.remove('mm-active');
          if (typeof _this3.config.onHidden === 'function') {
            _this3.config.onHidden(item);
          }
        };

        var subMenu = item.querySelector(this.cacheEl.subMenu);

        if (subMenu === null) {
          return;
        }

        var height = subMenu.scrollHeight;
        this.setTransitioning(true);

        if (typeof this.config.onHide === 'function') {
          this.config.onHide(item);
        }

        requestAnimationFrame(function () {
          subMenu.style.height = '0px';
          subMenu.style.overflow = 'hidden';
          subMenu.style.transition = 'height .35s ease';
          subMenu.addEventListener('transitionend', complete);
        });
      }
      /**
       * @param {boolean} isTransitioning
       * @returns {void}
       * @private
       */

    }, {
      key: "setTransitioning",
      value: function setTransitioning(isTransitioning) {
        this.isTransitioning = isTransitioning;
      }
      /**
       * @param {Element | string} element
       * @returns {boolean}
       * @static
       */

    }], [{
      key: "isElement",
      value: function isElement(element) {
        return Boolean(element && element.nodeType === 1);
      }
    }]);

    return MetisMenu;
  }();

  return MetisMenu;

})));
