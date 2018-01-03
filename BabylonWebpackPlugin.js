const assert = require('assert');
const babylon = require('babylon');
const { resolve } = require('path');
const createASTProxy = require('./ast-proxy');

class BabylonWebpackPlugin {
    constructor(webpackRootEntry) {
        const Parser = require(resolve(webpackRootEntry, '../Parser'));
        Parser.prototype.parse = babylonParse;
    }

    apply() {}
}

BabylonWebpackPlugin.transformBabelOpts = (opts = {}) => {
    assert(
        !(opts.parserOpts && opts.parserOpts.parser),
        'You cannot specify a `parser` to override `BabylonWebpackPlugin`'
    );

    return Object.assign({}, opts, {
        parserOpts: opts.parserOpts
            ? Object.assign({}, opts.parserOpts, { parser: babylon.parse })
            : { parser: babylon.parse }
    });
};

function babylonParse(source, initialState) {
    let ast;
    const comments = [];

    try {
        ast = babylon.parse(source, {
            ranges: true,
            plugins: ['dynamicImport'],
            sourceType: 'module'
        });
    } catch (err) {}

    try {
        ast = babylon.parse(source, {
            ranges: true,
            plugins: ['dynamicImport'],
            sourceType: 'script'
        });
    } catch (err) {}

    if (ast) ast.body = ast.program.body;

    if (!ast || typeof ast !== 'object')
        throw new Error("Source couldn't be parsed");

    ast = createASTProxy(ast);
    const oldScope = this.scope;
    const oldState = this.state;
    const oldComments = this.comments;
    this.scope = {
        inTry: false,
        definitions: [],
        renames: {}
    };
    const state = (this.state = initialState || {});
    this.comments = comments;
    if (this.applyPluginsBailResult('program', ast, comments) === undefined) {
        this.prewalkStatements(ast.body);
        this.walkStatements(ast.body);
    }
    this.scope = oldScope;
    this.state = oldState;
    this.comments = oldComments;
    return state;
}

module.exports = BabylonWebpackPlugin;
