"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingControllersToSpec = void 0;
const tslib_1 = require("tslib");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
const generateSpec_1 = require("./generateSpec");
const parseMetadata_1 = require("./parseMetadata");
tslib_1.__exportStar(require("./decorators"), exports);
tslib_1.__exportStar(require("./generateSpec"), exports);
tslib_1.__exportStar(require("./parseMetadata"), exports);
function routingControllersToSpec(storage, routingControllerOptions = {}, additionalProperties = {}) {
    var _a;
    const routes = (0, parseMetadata_1.parseRoutes)(storage, routingControllerOptions);
    const spec = (0, generateSpec_1.getSpec)(routes, ((_a = additionalProperties.components) === null || _a === void 0 ? void 0 : _a.schemas) || {});
    return (0, lodash_merge_1.default)(spec, additionalProperties);
}
exports.routingControllersToSpec = routingControllersToSpec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLHdFQUFpQztBQU9qQyxpREFBd0M7QUFDeEMsbURBQTZDO0FBRTdDLHVEQUE0QjtBQUM1Qix5REFBOEI7QUFDOUIsMERBQStCO0FBUy9CLFNBQWdCLHdCQUF3QixDQUN0QyxPQUE0QixFQUM1QiwyQkFBc0QsRUFBRSxFQUN4RCx1QkFBa0QsRUFBRTs7SUFFcEQsTUFBTSxNQUFNLEdBQUcsSUFBQSwyQkFBVyxFQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFBO0lBQzdELE1BQU0sSUFBSSxHQUFHLElBQUEsc0JBQU8sRUFBQyxNQUFNLEVBQUUsQ0FBQSxNQUFBLG9CQUFvQixDQUFDLFVBQVUsMENBQUUsT0FBTyxLQUFJLEVBQUUsQ0FBQyxDQUFBO0lBRTVFLE9BQU8sSUFBQSxzQkFBTSxFQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO0FBQzNDLENBQUM7QUFURCw0REFTQyJ9