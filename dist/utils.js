"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getSha = void 0;
var github_1 = __importDefault(require("@actions/github"));
function getSha() {
    var _a;
    if (github_1["default"].context.eventName == "pull_request") {
        return (_a = github_1["default"].context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.head.sha;
    }
    else {
        return github_1["default"].context.sha;
    }
}
exports.getSha = getSha;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkRBQXFDO0FBRXJDLFNBQWdCLE1BQU07O0lBQ3BCLElBQUksbUJBQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLGNBQWMsRUFBRTtRQUM5QyxPQUFPLE1BQUEsbUJBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUN0RDtTQUFNO1FBQ0wsT0FBTyxtQkFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7S0FDM0I7QUFDSCxDQUFDO0FBTkQsd0JBTUMifQ==