const test = require("ava");

const fs = require("fs");

let app = undefined;

const Vue = {
    createApp(vueApp) {
        app = vueApp;
        return {
            mount() {},
        };
    },
};

eval(fs.readFileSync("script.js", "utf-8"));

test.beforeEach((t) => {
    const localApp = { ...app };
    localApp.computed = new Proxy(
        { ...localApp.computed, ...localApp.data() },
        {
            get: function (target, name, receiver) {
                const value = target[name];
                return typeof value === "function"
                    ? value.call(localApp.computed)
                    : value;
            },
        }
    );
    t.context = localApp;
});

test("initial rawTel", (t) => {
    const app = t.context;
    t.is(app.computed.rawTel, "44 (759) 000 1122");
});

test("telWithoutBlanks", (t) => {
    const computed = t.context.computed;
    for (const [input, expected] of [
        ["", ""],
        ["123", "123"],
        [" 1 2  34 ", "1234"],
        ["abc", "abc"],
        [" a b  cd  ", "abcd"],
        ["a1b23c", "a1b23c"],
        [" a1 b 23 cd  ", "a1b23cd"],
    ]) {
        computed.rawTel = input;
        t.is(computed.telWithoutBlanks, expected);
    }
});

test("telNormalized", (t) => {
    const computed = t.context.computed;
    for (const [input, expected] of [
        ["", ""],
        ["123", "123"],
        [" 1 2  34 ", "1234"],
        [" +44 (759) 000 123 34 56  ", "447590001233456"],
        [" +0044 (759) 000 123 34 56  ", "447590001233456"],
        ["abc", ""],
        [" a b  cd  ", ""],
        ["a1b23c", "123"],
        [" a01 b23  cd4  ", "1234"],
    ]) {
        computed.rawTel = input;
        t.is(computed.telNormalized, expected);
    }
});

function testWithNormalizedTel(t, method, prefix) {
    const computed = t.context.computed;
    for (const [input, expected] of [
        ["", ""],
        ["123", "123"],
        [" 1 2  34 ", "1234"],
        [" +44 (759) 000 123 34 56  ", "447590001233456"],
        [" +0044 (759) 000 123 34 56  ", "447590001233456"],
        ["abc", ""],
        [" abc 01 2 34", "1234"],
    ]) {
        computed.rawTel = input;
        t.is(computed[method], prefix + expected);
    }
}

test("wa", (t) => {
    testWithNormalizedTel(t, "wa", "https://api.whatsapp.com/send?phone=");
});

test("wa2", (t) => {
    testWithNormalizedTel(t, "wa2", "https://wa.me/");
});

test("sg", (t) => {
    testWithNormalizedTel(t, "sg", "https://signal.me/#p/+");
});

test("viber", (t) => {
    testWithNormalizedTel(t, "viber", "viber://chat?number=");
});

test("tg", (t) => {
    const prefix = "https://t.me/";
    const computed = t.context.computed;
    for (const [input, expected] of [
        ["", ""],
        ["123", "123"],
        [" 1 2  34 ", "1234"],
        [" +44 (759) 000 123 34 56  ", "+44(759)0001233456"],
        [" +0044 (759) 000 123 34 56  ", "+0044(759)0001233456"],
        ["abc", "abc"],
        [" abc 01 2 34f", "abc01234f"],
    ]) {
        computed.rawTel = input;
        t.is(computed.tg, prefix + expected);
    }
});

test("skype", (t) => {
    const computed = t.context.computed;
    for (const [input, expected] of [
        ["123", "123"],
        [" 1 2  34 ", "1234"],
        [" +44 (759) 000 123 34 56  ", "447590001233456"],
        [" +0044 (759) 000 123 34 56  ", "447590001233456"],
    ]) {
        computed.rawTel = input;
        t.is(computed.skype, "skype:+" + expected + "?call");
    }
    for (const [input, expected] of [
        ["", ""],
        ["abc", "abc"],
        [" abc 01 2 34f", "abc01234f"],
        [" abc (01 2) 34f", "abc(012)34f"],
    ]) {
        computed.rawTel = input;
        t.is(computed.skype, "skype:" + expected + "?chat");
    }
});
