"use strict";

var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _path = _interopRequireDefault(require("path"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var app = (0, _express["default"])();
var envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
_dotenv["default"].config({
  path: envFile
});
var PORT = process.env.PORT;

//MIDDLEWARE
app.use((0, _cors["default"])());
app.use(_express["default"].json({
  limit: "100mb"
}));
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use(_express["default"]["static"](_path["default"].join(__dirname, "/public")));

//ROUTES
//app.use('/api', routes)

//LISTENER
app.listen(PORT, "0.0.0.0", function () {
  console.log("\n    SERVER RUNNING TO PORT ".concat(PORT, "\n    "));
});