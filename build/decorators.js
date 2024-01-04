"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSchema = exports.setOpenAPIMetadata = exports.getOpenAPIMetadata = exports.applyOpenAPIDecorator = exports.OpenAPI = void 0;
const tslib_1 = require("tslib");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
require("reflect-metadata");
const index_1 = require("./index");
const OPEN_API_KEY = Symbol('routing-controllers-openapi:OpenAPI');
function OpenAPI(spec) {
    return (...args) => {
        if (args.length === 1) {
            const [target] = args;
            const currentMeta = getOpenAPIMetadata(target);
            setOpenAPIMetadata([spec, ...currentMeta], target);
        }
        else {
            const [target, key] = args;
            const currentMeta = getOpenAPIMetadata(target, key);
            setOpenAPIMetadata([spec, ...currentMeta], target, key);
        }
    };
}
exports.OpenAPI = OpenAPI;
function applyOpenAPIDecorator(originalOperation, route) {
    const { action } = route;
    const openAPIParams = [
        ...getOpenAPIMetadata(action.target),
        ...getOpenAPIMetadata(action.target.prototype, action.method),
    ];
    return openAPIParams.reduce((acc, oaParam) => {
        return typeof oaParam === 'function'
            ? oaParam(acc, route)
            : (0, lodash_merge_1.default)({}, acc, oaParam);
    }, originalOperation);
}
exports.applyOpenAPIDecorator = applyOpenAPIDecorator;
function getOpenAPIMetadata(target, key) {
    return ((key
        ? Reflect.getMetadata(OPEN_API_KEY, target.constructor, key)
        : Reflect.getMetadata(OPEN_API_KEY, target)) || []);
}
exports.getOpenAPIMetadata = getOpenAPIMetadata;
function setOpenAPIMetadata(value, target, key) {
    return key
        ? Reflect.defineMetadata(OPEN_API_KEY, value, target.constructor, key)
        : Reflect.defineMetadata(OPEN_API_KEY, value, target);
}
exports.setOpenAPIMetadata = setOpenAPIMetadata;
function ResponseSchema(responseClass, options = {}) {
    const setResponseSchema = (source, route) => {
        var _a;
        const contentType = options.contentType || (0, index_1.getContentType)(route);
        const description = options.description || '';
        const isArray = options.isArray || false;
        const statusCode = (options.statusCode || (0, index_1.getStatusCode)(route)) + '';
        let responseSchemaName = '';
        if (typeof responseClass === 'function' && responseClass.name) {
            responseSchemaName = responseClass.name;
        }
        else if (typeof responseClass === 'string') {
            responseSchemaName = responseClass;
        }
        if (responseSchemaName) {
            const reference = {
                $ref: `#/components/schemas/${responseSchemaName}`,
            };
            const schema = isArray
                ? { items: reference, type: 'array' }
                : reference;
            const responses = {
                [statusCode]: {
                    content: {
                        [contentType]: {
                            schema,
                        },
                    },
                    description,
                },
            };
            const oldSchema = (_a = source.responses[statusCode]) === null || _a === void 0 ? void 0 : _a.content[contentType].schema;
            if ((oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.$ref) || (oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.items) || (oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.oneOf)) {
                const newStatusCodeResponse = (0, lodash_merge_1.default)({}, source.responses[statusCode], responses[statusCode]);
                const newSchema = oldSchema.oneOf
                    ? {
                        oneOf: [...oldSchema.oneOf, schema],
                    }
                    : { oneOf: [oldSchema, schema] };
                newStatusCodeResponse.content[contentType].schema = newSchema;
                source.responses[statusCode] = newStatusCodeResponse;
                return source;
            }
            return (0, lodash_merge_1.default)({}, source, { responses });
        }
        return source;
    };
    return OpenAPI(setResponseSchema);
}
exports.ResponseSchema = ResponseSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSx3RUFBaUM7QUFPakMsNEJBQXlCO0FBRXpCLG1DQUErRDtBQUUvRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMscUNBQXFDLENBQUMsQ0FBQTtBQWVsRSxTQUFnQixPQUFPLENBQUMsSUFBa0I7SUFFeEMsT0FBTyxDQUFDLEdBQUcsSUFBdUQsRUFBRSxFQUFFO1FBQ3BFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDckIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQTtZQUNyQixNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM5QyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1NBQ25EO2FBQU07WUFDTCxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQTtZQUMxQixNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDbkQsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDeEQ7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDO0FBYkQsMEJBYUM7QUFLRCxTQUFnQixxQkFBcUIsQ0FDbkMsaUJBQWtDLEVBQ2xDLEtBQWE7SUFFYixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFBO0lBQ3hCLE1BQU0sYUFBYSxHQUFHO1FBQ3BCLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFF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