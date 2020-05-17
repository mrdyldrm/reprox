import { useState } from "react";

//#region array extensions
Array.prototype.add = function (item, nofire) {
    item = wrapObject(item);
    this.push(item);
    addParent(item, this);
    if (!nofire) {
        fireState(this);
        fireArrayWatch(this, [item]);
        fireArrayBind(this);
    }
};
Array.prototype.addMany = function (items, nofire) {
    if (!Array.isArray(items)) this.add(items);
    items.forEach(item => {
        item = wrapObject(item);
        this.push(item);
        addParent(item, this);
    });
    if (!nofire) {
        fireState(this);
        fireArrayWatch(this, items);
        fireArrayBind(this);
    }
};
Array.prototype.remove = function (item, nofire) {
    this.removeAt(this.indexOf(item), nofire);
};
Array.prototype.removeAt = function (index, nofire) {
    if (index < 0 || index >= this.length) return;
    var item = this[index];
    this.splice(index, 1);
    if (!nofire) {
        fireState(this);
        fireArrayWatch(this, undefined, [item]);
        fireArrayBind(this);
    }
};
Array.prototype.removeMany = function (itemsOrFunc, nofire) {
    var removedItems, removed;
    if (Array.isArray(itemsOrFunc)) removedItems = itemsOrFunc;
    else if (typeof itemsOrFunc === "function") removedItems = this.filter(itemsOrFunc);
    else removedItems = [itemsOrFunc];

    removedItems.forEach(item => {
        var index = this.indexOf(item);
        removed = removed || index !== -1;
        this.splice(index, 1);
    });

    if (!nofire && removed) {
        fireState(this);
        fireArrayWatch(this, undefined, removedItems);
        fireArrayBind(this);
    }
};
Array.prototype.clear = function (nofire) {
    var removed = this.length > 0;
    var removedItems = [].concat(this);
    this.splice(0, this.length);
    if (!nofire && removed) {
        fireState(this);
        fireArrayWatch(this, undefined, removedItems);
        fireArrayBind(this);
    }
};
Array.prototype.equalize = function (source) {
    if (!Array.isArray(source)) return;
    var changed = source.length !== this.length;
    var added = [],
        removed = [];

    for (var i = 0; i < source.length; i++) {
        if (i >= this.length) this.push(source[i]);
        else if (this[i] !== source[i]) {
            added.push(source[i]);
            removed.push(this[i]);
            changed = changed || true;
            this[i] = source[i];
        }
    }
    for (var i = source.length; i < this.length; i++) removed.push(this.pop());

    added.removeMany(e => removed.indexOf(e) !== -1);
    removed.removeMany(e => added.indexOf(e) !== -1);

    if (changed) {
        fireState(this);
        fireArrayBind(this);
        fireArrayWatch(this, added, removed);
    }
};
//#endregion

//#region watch
const watchs = [];
const parents = [];
let lastWatchArgs;

const addWatch = function (object, prop, event) {
    if (!object || !object.__isProxy__ || typeof event !== "function" || !prop) return;
    var watch = watchs.find(e => e.object === object && e.prop === prop);
    if (!watch) watchs.push((watch = {
        object: object,
        prop: prop,
        events: []
    }));
    if (watch.events.indexOf(event) === -1) watch.events.push(event);
};
const addParent = function (object, array) {
    if (!object || (!object.__isProxy__ && !Array.isArray(object))) return;

    var parent = parents.find(e => e.object === object);
    if (!parent) parents.push((parent = {
        object: object,
        proxies: []
    }));
    if (parent.proxies.indexOf(array) === -1) parent.proxies.push(array);
};
const fireWatch = function (object, prop, args, watchItem) {
    if (stopForInputChange) {
        if (lastWatchArgs === undefined) lastWatchArgs = args;
        return;
    }
    watchItem = watchItem || watchs.find(e => e.object === object && e.prop === prop);
    if (watchItem) watchItem.events.forEach(e => e(object, prop, args));

    var parentItem = parents.find(e => e.object === (object || watchItem ? .object));
    if (parentItem) parentItem.proxies.forEach(e => fireWatch(e, undefined, {
        type: "subchange"
    }));
};
const fireArrayWatch = function (array, added, removed) {
    var type;
    if (removed && removed.length > 0 && added && added.length > 0) type = "order";
    else if (removed && removed.length > 0) type = "remove";
    else if (added && added.length > 0) type = "add";
    else type = "order";

    watchs.filter(e => e.object[e.prop] === array).forEach(watchItem => fireWatch(watchItem.object, watchItem.prop, {
        property: watchItem.prop,
        type: type,
        added: added,
        removed: removed
    }, watchItem));
};
//#endregion

//#region bind
const binds = [];

const addBind = function (object, prop, bindObject, bindProp, options) {
    if (!object || !object.__isProxy__ || !bindObject || !bindObject.__isProxy__ || !prop || !bindProp) return;
    options = options || {};
    var bind = binds.find(e => e.object === object && e.prop === prop && e.bindObject === bindObject && e.bindProp === bindProp);
    if (!bind) binds.push((bind = {
        object: object,
        prop: prop,
        bindObject: bindObject,
        bindProp: bindProp,
        convert: options.convert
    }));
    if (!options.oneway) addBind(bindObject, bindProp, object, prop, {
        convert: options.convertBack,
        oneway: true
    });

    object[prop] = options.convert ? options.convert(bindObject[bindProp]) : bindObject[bindProp];
};
const fireBind = function (object, prop, allbinds) {
    if (stopForInputChange) return;

    allbinds = allbinds || binds.filter(e => e.bindObject === object && e.bindProp === prop);
    allbinds.forEach(e => {
        var newValue = e.convert ? e.convert(e.bindObject[e.bindProp]) : e.bindObject[e.bindProp];
        if (Array.isArray(e.object[e.prop]) && Array.isArray(newValue)) e.object[e.prop].equalize(newValue);
        else e.object[e.prop] = newValue;
    });
};
const fireArrayBind = function (array) {
    fireBind(
        undefined,
        undefined,
        binds.filter(e => e.bindObject[e.bindProp] === array)
    );
};
//#endregion

//#region wrapping objects
const wrapObject = function (object) {
    if (!object || object.__isProxy__) return object;
    var wrapped = object;

    wrapped = objectProxy(object);

    checkObject(object);
    return wrapped;
};
const checkObject = function (object) {
    if (typeof object !== "object") return;
    for (var p in object) {
        if (Array.isArray(object[p])) {
            for (var i = 0; i < object[p].length; i++) {
                object[p][i] = objectProxy(object[p][i]);
                checkObject(object[p][i]);
            }
        } else if (typeof object[p] === "object") {
            object[p] = objectProxy(object[p]);
            checkObject(object[p]);
        }
    }
};
const objectProxy = function (object) {
    if (!object || typeof object !== "object" || object.__isProxy__ ||
        Array.isArray(object) || Object.prototype.toString.call(object) === '[object Date]') return object;
    return new Proxy(object, {
        get: useGet,
        set: useSet
    });
};
//#endregion

//#region state management
const persistants = JSON.parse(localStorage.getItem("persistants")) || {};
const persistantsNames = Object.keys(persistants);
const stateStack = [];
const states = [];
const _extends = {};

const orgConsoleError = console.error;
const blankConsoleError = () => {};

let lastStore;
let stopForInputChange;
let stopState;
let stateStackEvents = [];

const fireState = function (object, prop) {
    if (stopForInputChange) return;
    if (stopState) return stateStackEvents.clear(true);

    console.error = blankConsoleError;

    states.filter(e => (e.object === object && e.prop === prop) || (Array.isArray(object) && e.prop && e.object[e.prop] === object))
        .forEach(state => stateStackEvents.addMany(state.events, true));

    setTimeout(() => {
        processFireState();
        console.error = orgConsoleError;
    }, 0);

};
const processFireState = function () {
    if (stopState) return stateStackEvents.clear(true);

    let fired = [];
    for (var i = stateStackEvents.length - 1; i >= 0; i--) {
        if (!stateStackEvents[i] || fired.some(e => e === stateStackEvents[i].key)) continue;
        fired.push(stateStackEvents[i].key);
        stateStackEvents[i](Math.random());
    }
    stateStackEvents.clear(true);
    //console.log(...fired);
}
const addSetState = function (object, prop, setState) {
    if (!object || typeof object !== "object" || !setState) return;

    var state = states.find(e => e.object === object && e.prop === prop);
    if (!state) states.push((state = {
        object: object,
        prop: prop,
        events: []
    }));

    state.events.removeMany(e => e.key === setState.key, true);
    state.events.push(setState);
};
const useGet = function (target, prop, proxy) {
    var forbind = prop !== "__isProxy__" && prop.endsWith && prop.endsWith("_");
    var autogenArray = prop !== "__isProxy__" && prop.endsWith && prop.endsWith("$$");
    var autogenObject = !autogenArray && prop !== "__isProxy__" && prop.endsWith && prop.endsWith("$");

    if (autogenArray) prop = prop.substr(0, prop.length - 2);
    else if (forbind || autogenObject) prop = prop.substr(0, prop.length - 1);

    if (autogenArray) target[prop] = target[prop] || [];
    else if (autogenObject) target[prop] = target[prop] || objectProxy({});

    if (prop !== "__isProxy__") {
        addSetState(proxy, prop, stateStack[stateStack.length - 1]);
        addSetState(target[prop], undefined, stateStack[stateStack.length - 1]);
    }

    if (forbind) {
        return Object.assign({
            input: {
                value: target[prop],
                onChange(event, value) {
                    let val = !event.target ? event : value != undefined ? value : event.target.value;
                    if (event.target ? .attributes ? .datatype ? .value === "number") val = parseFloat(val.replace(/,/g, ""));
                    proxy[prop] = val;
                }
            },
            inputNumber: {
                value: target[prop],
                onChange(event) {
                    proxy[prop] = parseFloat(event.target.value.replace(/,/g, ""));
                }
            },
            watch(event) {
                addWatch(proxy, prop, event);
            },
            bind(object, property, options) {
                addBind(object, prop, proxy, property, options);
            }
        }, _extends);
    }

    return prop === "__isProxy__" ? true : target[prop];
};
const useSet = function (target, prop, value, proxy) {
    if (target[prop] == value) return true;

    var old = target[prop];
    target[prop] = wrapObject(value);

    fireState(proxy, prop);
    fireWatch(proxy, prop, {
        old: old,
        new: value
    });
    fireBind(proxy, prop);

    if (lastStore in persistants) localStorage.setItem("persistants", JSON.stringify(persistants));

    return true;
};

const Reprox = new Proxy({
    initializeStore(store, initial, force) {
        if (typeof store === "object") store = lastStore;
        if (initial == null && store in persistants) {
            delete persistants[store];
            localStorage.setItem("persistants", JSON.stringify(persistants));
        }
        if (force || !(store in persistants)) {
            if (store in this) Object.assign(this[store], initial);
            else this[store] = initial;
        }
    },
    addPersistantStore: function () {
        //with arguments multiple parameters can pass
        [...arguments].forEach(param => {
            if (typeof param === "object") param = lastStore;
            if (!persistantsNames.includes(param)) persistantsNames.push(param);
            if (param in this) persistants[param] = this[param];
        });
        localStorage.setItem("persistants", JSON.stringify(persistants));
    },
    removePersistantStore: function () {
        //with arguments multiple parameters can pass
        [...arguments].forEach(param => {
            if (typeof param === "object") param = lastStore;
            delete persistants[param];
            persistantsNames.splice(persistantsNames.indexOf(param), 1);
        });
        localStorage.setItem("persistants", JSON.stringify(persistants));
    },
    create(object) {
        return wrapObject(object);
    },
    useState(key) {
        try {
            var setState = useState()[1];
            setState.key = key;
            stateStack.push(setState);
        } catch (error) {

        }
        setTimeout(() => {
            stateStack.pop();
        }, 0);
    },
    generateKey() {
        return Math.random();
    },
    extendGet(object) {
        if(typeof object !== "object" ) return;
        delete object.watch;
        delete object.bind;
        _extends = Object.assign(_extends, object);
    }
}, {
    get(globalStore, prop) {
        globalStore[prop] = globalStore[prop] || objectProxy({});
        if (persistantsNames.includes(prop) && !(prop in persistants)) persistants[prop] = globalStore[prop];

        lastStore = prop;
        return globalStore[prop];
    },
    set(globalStore, prop, value) {
        if (typeof value != "object") return false;
        if (value == null) globalStore[prop] = null;
        else globalStore[prop] = objectProxy(value);

        checkObject(value);

        if (persistantsNames.includes(prop) && !(prop in persistants)) persistants[prop] = globalStore[prop];

        return true;
    }
});

for (var prop in persistants) Reprox[prop] = persistants[prop];
//#endregion

export default Reprox;