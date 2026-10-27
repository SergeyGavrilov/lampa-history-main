const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(require('node:path').join(__dirname, '../history.js'), 'utf8');

function setup(history) {
    const rows = [];
    const lampa = {
        ContentRows: { add: row => rows.push(row) },
        Favorite: { get: params => {
            assert.equal(params.type, 'history');
            return history;
        } }
    };
    const context = { window: { Lampa: lampa }, Lampa: lampa, console };
    vm.runInNewContext(code, context);
    return { rows, context };
}

test('registers one row on the main screen, even if loaded twice', () => {
    const { rows, context } = setup([]);
    vm.runInNewContext(code, context);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].index, 0);
    assert.equal(rows[0].screen[0], 'main');
    assert.equal(rows[0].call(), undefined);
});

test('returns the first 20 history cards in their original order', () => {
    const history = Array.from({ length: 25 }, (_, id) => ({ id }));
    const { rows } = setup(history);
    let result;
    rows[0].call()(value => { result = value; });
    assert.equal(result.title, 'История просмотров');
    assert.equal(result.results.length, 20);
    assert.equal(result.results[0], history[0]);
    assert.equal(result.results[19], history[19]);
    assert.equal(history.length, 25);
});

test('reads history anew when the main screen is loaded', () => {
    const history = [];
    const { rows } = setup(history);
    assert.equal(rows[0].call(), undefined);
    history.push({ id: 7 });
    let result;
    rows[0].call()(value => { result = value; });
    assert.equal(result.results[0].id, 7);
});

test('does not crash when the API is missing', () => {
    const warnings = [];
    const context = { window: { Lampa: {} }, Lampa: {}, console: { warn: message => warnings.push(message) } };
    vm.runInNewContext(code, context);
    assert.equal(warnings.length, 1);
    assert.equal(context.window.lampa_history_main_ready, undefined);
});
