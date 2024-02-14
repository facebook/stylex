'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = App;
require("./stylex_bundle.css");
var stylex = _interopRequireWildcard(require("@stylexjs/stylex"));
var _otherStyles = _interopRequireDefault(require("./otherStyles"));
var _npmStyles = _interopRequireDefault(require("./npmStyles"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const fadeAnimation = "xgnty7z-B";
const styles = {
  foo: {
    animationName: "xeuoslp",
    display: "x78zum5",
    marginInlineStart: "x1hm9lzh",
    marginLeft: null,
    marginRight: null,
    marginTop: "xlrshdv",
    height: "x1egiwwb",
    ":hover_background": "x1oz5o6v",
    ":hover_backgroundAttachment": null,
    ":hover_backgroundClip": null,
    ":hover_backgroundColor": null,
    ":hover_backgroundImage": null,
    ":hover_backgroundOrigin": null,
    ":hover_backgroundPosition": null,
    ":hover_backgroundPositionX": null,
    ":hover_backgroundPositionY": null,
    ":hover_backgroundRepeat": null,
    ":hover_backgroundSize": null,
    $$css: true
  }
};
function App() {
  return stylex.props(_otherStyles.default.bar, styles.foo, _npmStyles.default.baz).className;
}