"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressToOpenAPIPath = exports.getTags = exports.getSummary = exports.getSpec = exports.getResponses = exports.getStatusCode = exports.getContentType = exports.getRequestBody = exports.getQueryParams = exports.getPathParams = exports.getHeaderParams = exports.getPaths = exports.getOperationId = exports.getOperation = exports.getFullPath = exports.getFullExpressPath = void 0;
const tslib_1 = require("tslib");
const lodash_merge_1 = tslib_1.__importDefault(require("lodash.merge"));
const lodash_capitalize_1 = tslib_1.__importDefault(require("lodash.capitalize"));
const lodash_startcase_1 = tslib_1.__importDefault(require("lodash.startcase"));
const pathToRegexp = tslib_1.__importStar(require("path-to-regexp"));
require("reflect-metadata");
const decorators_1 = require("./decorators");
function getFullExpressPath(route) {
    const { action, controller, options } = route;
    return ((options.routePrefix || '') +
        (controller.route || '') +
        (action.route || ''));
}
exports.getFullExpressPath = getFullExpressPath;
function getFullPath(route) {
    return expressToOpenAPIPath(getFullExpressPath(route));
}
exports.getFullPath = getFullPath;
function getOperation(route, schemas) {
    const operation = {
        operationId: getOperationId(route),
        parameters: [
            ...getHeaderParams(route),
            ...getPathParams(route),
            ...getQueryParams(route, schemas),
        ],
        requestBody: getRequestBody(route) || undefined,
        responses: getResponses(route),
        summary: getSummary(route),
        tags: getTags(route),
    };
    const cleanedOperation = Object.entries(operation)
        .filter(([_, value]) => value && (value.length || Object.keys(value).length))
        .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
    return (0, decorators_1.applyOpenAPIDecorator)(cleanedOperation, route);
}
exports.getOperation = getOperation;
function getOperationId(route) {
    return `${route.action.target.name}.${route.action.method}`;
}
exports.getOperationId = getOperationId;
function getPaths(routes, schemas) {
    const routePaths = routes.map((route) => ({
        [getFullPath(route)]: {
            [route.action.type]: getOperation(route, schemas),
        },
    }));
    return (0, lodash_merge_1.default)(...routePaths);
}
exports.getPaths = getPaths;
function getHeaderParams(route) {
    const headers = route.params
        .filter((p) => p.type === 'header')
        .map((headerMeta) => {
        const schema = getParamSchema(headerMeta);
        return {
            in: 'header',
            name: headerMeta.name || '',
            required: isRequired(headerMeta, route),
            schema,
        };
    });
    const headersMeta = route.params.find((p) => p.type === 'headers');
    if (headersMeta) {
        const schema = getParamSchema(headersMeta);
        headers.push({
            in: 'header',
            name: schema.$ref.split('/').pop() || '',
            required: isRequired(headersMeta, route),
            schema,
        });
    }
    return headers;
}
exports.getHeaderParams = getHeaderParams;
function getPathParams(route) {
    const path = getFullExpressPath(route);
    const tokens = pathToRegexp.parse(path);
    return tokens
        .filter((token) => token && typeof token === 'object')
        .map((token) => {
        const name = token.name + '';
        const param = {
            in: 'path',
            name,
            required: token.modifier !== '?',
            schema: { type: 'string' },
        };
        if (token.pattern && token.pattern !== '[^\\/]+?') {
            param.schema = { pattern: token.pattern, type: 'string' };
        }
        const meta = route.params.find((p) => p.name === name && p.type === 'param');
        if (meta) {
            const metaSchema = getParamSchema(meta);
            param.schema =
                'type' in metaSchema ? Object.assign(Object.assign({}, param.schema), metaSchema) : metaSchema;
        }
        return param;
    });
}
exports.getPathParams = getPathParams;
function getQueryParams(route, schemas) {
    var _a;
    const queries = route.params
        .filter((p) => p.type === 'query')
        .map((queryMeta) => {
        const schema = getParamSchema(queryMeta);
        return {
            in: 'query',
            name: queryMeta.name || '',
            required: isRequired(queryMeta, route),
            schema,
        };
    });
    const queriesMeta = route.params.find((p) => p.type === 'queries');
    if (queriesMeta) {
        const paramSchema = getParamSchema(queriesMeta);
        const paramSchemaName = paramSchema.$ref.split('/').pop() || '';
        const currentSchema = schemas[paramSchemaName];
        for (const [name, schema] of Object.entries((currentSchema === null || currentSchema === void 0 ? void 0 : currentSchema.properties) || {})) {
            queries.push({
                in: 'query',
                name,
                required: (_a = currentSchema.required) === null || _a === void 0 ? void 0 : _a.includes(name),
                schema,
            });
        }
    }
    return queries;
}
exports.getQueryParams = getQueryParams;
function getRequestBody(route) {
    const bodyParamMetas = route.params.filter((d) => d.type === 'body-param');
    const bodyParamsSchema = bodyParamMetas.length > 0
        ? bodyParamMetas.reduce((acc, d) => (Object.assign(Object.assign({}, acc), { properties: Object.assign(Object.assign({}, acc.properties), { [d.name]: getParamSchema(d) }), required: isRequired(d, route)
                ? [...(acc.required || []), d.name]
                : acc.required })), { properties: {}, required: [], type: 'object' })
        : null;
    const bodyMeta = route.params.find((d) => d.type === 'body');
    if (bodyMeta) {
        const bodySchema = getParamSchema(bodyMeta);
        const { $ref } = 'items' in bodySchema && bodySchema.items ? bodySchema.items : bodySchema;
        return {
            content: {
                'application/json': {
                    schema: bodyParamsSchema
                        ? { allOf: [bodySchema, bodyParamsSchema] }
                        : bodySchema,
                },
            },
            description: ($ref || '').split('/').pop(),
            required: isRequired(bodyMeta, route),
        };
    }
    else if (bodyParamsSchema) {
        return {
            content: { 'application/json': { schema: bodyParamsSchema } },
        };
    }
}
exports.getRequestBody = getRequestBody;
function getContentType(route) {
    const defaultContentType = route.controller.type === 'json'
        ? 'application/json'
        : 'text/html; charset=utf-8';
    const contentMeta = route.responseHandlers.find((h) => h.type === 'content-type');
    return contentMeta ? contentMeta.value : defaultContentType;
}
exports.getContentType = getContentType;
function getStatusCode(route) {
    const successMeta = route.responseHandlers.find((h) => h.type === 'success-code');
    return successMeta ? successMeta.value + '' : '200';
}
exports.getStatusCode = getStatusCode;
function getResponses(route) {
    const contentType = getContentType(route);
    const successStatus = getStatusCode(route);
    return {
        [successStatus]: {
            content: { [contentType]: {} },
            description: 'Successful response',
        },
    };
}
exports.getResponses = getResponses;
function getSpec(routes, schemas) {
    return {
        components: { schemas: {} },
        info: { title: '', version: '1.0.0' },
        openapi: '3.0.0',
        paths: getPaths(routes, schemas),
    };
}
exports.getSpec = getSpec;
function getSummary(route) {
    return (0, lodash_capitalize_1.default)((0, lodash_startcase_1.default)(route.action.method));
}
exports.getSummary = getSummary;
function getTags(route) {
    return [(0, lodash_startcase_1.default)(route.controller.target.name.replace(/Controller$/, ''))];
}
exports.getTags = getTags;
function expressToOpenAPIPath(expressPath) {
    const tokens = pathToRegexp.parse(expressPath);
    return tokens
        .map((d) => (typeof d === 'string' ? d : `${d.prefix}{${d.name}}`))
        .join('');
}
exports.expressToOpenAPIPath = expressToOpenAPIPath;
function isRequired(meta, route) {
    var _a, _b, _c;
    const globalRequired = (_c = (_b = (_a = route.options) === null || _a === void 0 ? void 0 : _a.defaults) === null || _b === void 0 ? void 0 : _b.paramOptions) === null || _c === void 0 ? void 0 : _c.required;
    return globalRequired ? meta.required !== false : !!meta.required;
}
function getParamSchema(param) {
    const { explicitType, index, object, method } = param;
    const reflectedTypes = Reflect.getMetadata('design:paramtypes', object, method);
    if (!reflectedTypes)
        return {};
    if (reflectedTypes.length <= index)
        return {};
    const type = reflectedTypes[index];
    if (typeof type === 'function' && type.name === 'Array') {
        const items = explicitType
            ? { $ref: '#/components/schemas/' + explicitType.name }
            : { type: 'object' };
        return { items, type: 'array' };
    }
    if (explicitType) {
        return { $ref: '#/components/schemas/' + explicitType.name };
    }
    if (typeof type === 'function') {
        if (type.prototype === String.prototype ||
            type.prototype === Symbol.prototype) {
            return { type: 'string' };
        }
        else if (type.prototype === Number.prototype) {
            return { type: 'number' };
        }
        else if (type.prototype === Boolean.prototype) {
            return { type: 'boolean' };
        }
        else if (type.name !== 'Object') {
            return { $ref: '#/components/schemas/' + type.name };
        }
    }
    return {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVTcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2dlbmVyYXRlU3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0Esd0VBQWlDO0FBQ2pDLGtGQUEyQztBQUMzQyxnRkFBeUM7QUFFekMscUVBQThDO0FBQzlDLDRCQUF5QjtBQUd6Qiw2Q0FBb0Q7QUFJcEQsU0FBZ0Isa0JBQWtCLENBQUMsS0FBYTtJQUM5QyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUE7SUFDN0MsT0FBTyxDQUNMLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDM0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUN4QixDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQ3JCLENBQUE7QUFDSCxDQUFDO0FBUEQsZ0RBT0M7QUFLRCxTQUFnQixXQUFXLENBQUMsS0FBYTtJQUN2QyxPQUFPLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDeEQsQ0FBQztBQUZELGtDQUVDO0FBS0QsU0FBZ0IsWUFBWSxDQUMxQixLQUFhLEVBQ2IsT0FBeUM7SUFFekMsTUFBTSxTQUFTLEdBQXVCO1FBQ3BDLFdBQVcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDO1FBQ2xDLFVBQVUsRUFBRTtZQUNWLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQztZQUN6QixHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDdkIsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQztTQUNsQztRQUNELFdBQVcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksU0FBUztRQUMvQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUM5QixPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJ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