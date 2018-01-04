const assert = require('assert');
const babylon = require('babylon');
const { resolve } = require('path');
const createASTProxy = require('lazy-babylon-to-estree');

class BabylonWebpackPlugin {
    constructor(webpackRootEntry) {
        const Parser = require(resolve(webpackRootEntry, '../Parser'));
        Parser.prototype.parse = babylonParse;

        let { ECMA_VERSION } = Parser;
        Object.defineProperty(Parser, 'ECMA_VERSION', {
            get() {
                return ECMA_VERSION;
            },
            set(value) {
                console.warn(
                    'Warning: Setting "Parser.ECMA_VERSION" is a no-op when using BabylonWebpackPlugin'
                );
                ECMA_VERSION = value;
            }
        });
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

// Lots of copy-pasted webpack code lies ahead...
function babylonParse(source, initialState) {
    let ast;
    const comments = [];
    if (typeof source === 'object' && source !== null) {
        ast = source;
        comments = source.comments;
    }

    if (!ast) {
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
    }

    if (!ast || typeof ast !== 'object')
        throw new Error("Source couldn't be parsed");

    const oldComments = this.comments;
    // TODO: move this range copying to lazy-babylon-to-estree
    this.comments = ast.comments.map(
        node => ((node.range = [node.start, node.end]), node)
    );

    ast = createASTProxy(ast);
    const oldScope = this.scope;
    const oldState = this.state;
    const { StackedSetMap } = Object.getPrototypeOf(this).constructor; // Yes, this is gross. Sorry ❤️
    this.scope = {
        inTry: false,
        definitions: new StackedSetMap(),
        renames: new StackedSetMap()
    };
    const state = (this.state = initialState || {});
    if (this.hooks.program.call(ast, comments) === undefined) {
        this.prewalkStatements(ast.body);
        this.walkStatements(ast.body);
    }
    this.scope = oldScope;
    this.state = oldState;
    this.comments = oldComments;
    return state;
}

module.exports = BabylonWebpackPlugin;
