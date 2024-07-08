/* eslint-disable */

((global, factory) => {
    typeof exports === "object" && typeof module !== "undefined"
        ? factory(exports)
        : typeof define === "function" && define.amd
          ? define("GOVUKFrontend", ["exports"], factory)
          : factory((global.GOVUKFrontend = {}));
})(this, (exports) => {
    /**
     * Common helpers which do not require polyfill.
     *
     * IMPORTANT: If a helper require a polyfill, please isolate it in its own module
     * so that the polyfill can be properly tree-shaken and does not burden
     * the components that do not need that helper
     *
     * @module common/index
     */

    /**
     * TODO: Ideally this would be a NodeList.prototype.forEach polyfill
     * This seems to fail in IE8, requires more investigation.
     * See: https://github.com/imagitama/nodelist-foreach-polyfill
     *
     * @param {NodeListOf<Element>} nodes - NodeList from querySelectorAll()
     * @param {nodeListIterator} callback - Callback function to run for each node
     * @returns {void}
     */
    function nodeListForEach(nodes, callback) {
        if (window.NodeList.prototype.forEach) {
            return nodes.forEach(callback);
        }
        for (let i = 0; i < nodes.length; i++) {
            callback.call(window, nodes[i], i, nodes);
        }
    }

    /**
     * Used to generate a unique string, allows multiple instances of the component
     * without them conflicting with each other.
     * https://stackoverflow.com/a/8809472
     *
     * @returns {string} Unique ID
     */
    function generateUniqueID() {
        let d = new Date().getTime();
        if (typeof window.performance !== "undefined" && typeof window.performance.now === "function") {
            d += window.performance.now(); // use high-precision timer if available
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = ((d + Math.random() * 16) % 16) | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    /**
     * Config flattening function
     *
     * Takes any number of objects, flattens them into namespaced key-value pairs,
     * (e.g. {'i18n.showSection': 'Show section'}) and combines them together, with
     * greatest priority on the LAST item passed in.
     *
     * @returns {Object<string, unknown>} A flattened object of key-value pairs.
     */
    function mergeConfigs(/* configObject1, configObject2, ...configObjects */) {
        /**
         * Function to take nested objects and flatten them to a dot-separated keyed
         * object. Doing this means we don't need to do any deep/recursive merging of
         * each of our objects, nor transform our dataset from a flat list into a
         * nested object.
         *
         * @param {Object<string, unknown>} configObject - Deeply nested object
         * @returns {Object<string, unknown>} Flattened object with dot-separated keys
         */
        const flattenObject = (configObject) => {
            // Prepare an empty return object
            const flattenedObject = {};

            /**
             * Our flattening function, this is called recursively for each level of
             * depth in the object. At each level we prepend the previous level names to
             * the key using `prefix`.
             *
             * @param {Partial<Object<string, unknown>>} obj - Object to flatten
             * @param {string} [prefix] - Optional dot-separated prefix
             */
            const flattenLoop = (obj, prefix) => {
                // Loop through keys...
                for (const key in obj) {
                    // Check to see if this is a prototypical key/value,
                    // if it is, skip it.
                    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                        continue;
                    }
                    const value = obj[key];
                    const prefixedKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof value === "object") {
                        // If the value is a nested object, recurse over that too
                        flattenLoop(value, prefixedKey);
                    } else {
                        // Otherwise, add this value to our return object
                        flattenedObject[prefixedKey] = value;
                    }
                }
            };

            // Kick off the recursive loop
            flattenLoop(configObject);
            return flattenedObject;
        };

        // Start with an empty object as our base
        const formattedConfigObject = {};

        // Loop through each of the remaining passed objects and push their keys
        // one-by-one into configObject. Any duplicate keys will override the existing
        // key with the new value.
        for (let i = 0; i < arguments.length; i++) {
            const obj = flattenObject(arguments[i]);
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    formattedConfigObject[key] = obj[key];
                }
            }
        }

        return formattedConfigObject;
    }

    /**
     * Extracts keys starting with a particular namespace from a flattened config
     * object, removing the namespace in the process.
     *
     * @param {Object<string, unknown>} configObject - The object to extract key-value pairs from.
     * @param {string} namespace - The namespace to filter keys with.
     * @returns {Object<string, unknown>} Flattened object with dot-separated key namespace removed
     * @throws {Error} Config object required
     * @throws {Error} Namespace string required
     */
    function extractConfigByNamespace(configObject, namespace) {
        // Check we have what we need
        if (!configObject || typeof configObject !== "object") {
            throw new Error('Provide a `configObject` of type "object".');
        }
        if (!namespace || typeof namespace !== "string") {
            throw new Error('Provide a `namespace` of type "string" to filter the `configObject` by.');
        }
        const newObject = {};
        for (const key in configObject) {
            // Split the key into parts, using . as our namespace separator
            const keyParts = key.split(".");
            // Check if the first namespace matches the configured namespace
            if (Object.prototype.hasOwnProperty.call(configObject, key) && keyParts[0] === namespace) {
                // Remove the first item (the namespace) from the parts array,
                // but only if there is more than one part (we don't want blank keys!)
                if (keyParts.length > 1) {
                    keyParts.shift();
                }
                // Join the remaining parts back together
                const newKey = keyParts.join(".");
                // Add them to our new object
                newObject[newKey] = configObject[key];
            }
        }
        return newObject;
    }

    /**
     * @callback nodeListIterator
     * @param {Element} value - The current node being iterated on
     * @param {number} index - The current index in the iteration
     * @param {NodeListOf<Element>} nodes - NodeList from querySelectorAll()
     * @returns {void}
     */

    ((_undefined) => {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Object/defineProperty/detect.js
        const detect =
            // In IE8, defineProperty could only act on DOM elements, so full support
            // for the feature requires the ability to set a property on an arbitrary object
            "defineProperty" in Object &&
            (() => {
                try {
                    const a = {};
                    Object.defineProperty(a, "test", { value: 42 });
                    return true;
                } catch (_e) {
                    return false;
                }
            })();

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Object.defineProperty&flags=always
        ((nativeDefineProperty) => {
            const supportsAccessors = Object.prototype.hasOwnProperty("__defineGetter__");
            const ERR_ACCESSORS_NOT_SUPPORTED = "Getters & setters cannot be defined on this javascript engine";
            const ERR_VALUE_ACCESSORS = "A property cannot both have accessors and be writable or have a value";

            Object.defineProperty = function defineProperty(object, property, descriptor) {
                // Where native support exists, assume it
                if (
                    nativeDefineProperty &&
                    (object === window ||
                        object === document ||
                        object === Element.prototype ||
                        object instanceof Element)
                ) {
                    return nativeDefineProperty(object, property, descriptor);
                }

                if (object === null || !(object instanceof Object || typeof object === "object")) {
                    throw new TypeError("Object.defineProperty called on non-object");
                }

                if (!(descriptor instanceof Object)) {
                    throw new TypeError("Property description must be an object");
                }

                const propertyString = String(property);
                const hasValueOrWritable = "value" in descriptor || "writable" in descriptor;
                const getterType = "get" in descriptor && typeof descriptor.get;
                const setterType = "set" in descriptor && typeof descriptor.set;

                // handle descriptor.get
                if (getterType) {
                    if (getterType !== "function") {
                        throw new TypeError("Getter must be a function");
                    }
                    if (!supportsAccessors) {
                        throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
                    }
                    if (hasValueOrWritable) {
                        throw new TypeError(ERR_VALUE_ACCESSORS);
                    }
                    Object.__defineGetter__.call(object, propertyString, descriptor.get);
                } else {
                    object[propertyString] = descriptor.value;
                }

                // handle descriptor.set
                if (setterType) {
                    if (setterType !== "function") {
                        throw new TypeError("Setter must be a function");
                    }
                    if (!supportsAccessors) {
                        throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
                    }
                    if (hasValueOrWritable) {
                        throw new TypeError(ERR_VALUE_ACCESSORS);
                    }
                    Object.__defineSetter__.call(object, propertyString, descriptor.set);
                }

                // OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
                if ("value" in descriptor) {
                    object[propertyString] = descriptor.value;
                }

                return object;
            };
        })(Object.defineProperty);
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Document/detect.js
        const detect = "Document" in this;

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Document&flags=always
        if (typeof WorkerGlobalScope === "undefined" && typeof importScripts !== "function") {
            if (this.HTMLDocument) {
                // IE8

                // HTMLDocument is an extension of Document.  If the browser has HTMLDocument but not Document, the former will suffice as an alias for the latter.
                this.Document = this.HTMLDocument;
            } else {
                // Create an empty function to act as the missing constructor for the document object, attach the document object as its prototype.  The function needs to be anonymous else it is hoisted and causes the feature detect to prematurely pass, preventing the assignments below being made.
                this.Document =
                    this.HTMLDocument =
                    document.constructor =
                        new Function("return function Document() {}")();
                this.Document.prototype = document;
            }
        }
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Element/detect.js
        const detect = "Element" in this && "HTMLElement" in this;

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Element&flags=always
        (() => {
            // IE8
            if (window.Element && !window.HTMLElement) {
                window.HTMLElement = window.Element;
                return;
            }

            // create Element constructor
            window.Element = window.HTMLElement = new Function("return function Element() {}")();

            // generate sandboxed iframe
            const vbody = document.appendChild(document.createElement("body"));
            const frame = vbody.appendChild(document.createElement("iframe"));

            // use sandboxed iframe to replicate Element functionality
            const frameDocument = frame.contentWindow.document;
            const prototype = (Element.prototype = frameDocument.appendChild(frameDocument.createElement("*")));
            const cache = {};

            // polyfill Element.prototype on an element
            const shiv = (element, deep) => {
                const childNodes = element.childNodes || [];
                let index = -1;
                let key;
                let value;
                let childNode;

                if (element.nodeType === 1 && element.constructor !== Element) {
                    element.constructor = Element;

                    for (key in cache) {
                        value = cache[key];
                        element[key] = value;
                    }
                }

                while ((childNode = deep && childNodes[++index])) {
                    shiv(childNode, deep);
                }

                return element;
            };

            const elements = document.getElementsByTagName("*");
            const nativeCreateElement = document.createElement;
            let interval;
            let loopLimit = 100;

            prototype.attachEvent("onpropertychange", (event) => {
                const propertyName = event.propertyName;
                const nonValue = !cache.hasOwnProperty(propertyName);
                const newValue = prototype[propertyName];
                const oldValue = cache[propertyName];
                let index = -1;
                let element;

                while ((element = elements[++index])) {
                    if (element.nodeType === 1) {
                        if (nonValue || element[propertyName] === oldValue) {
                            element[propertyName] = newValue;
                        }
                    }
                }

                cache[propertyName] = newValue;
            });

            prototype.constructor = Element;

            if (!prototype.hasAttribute) {
                // <Element>.hasAttribute
                prototype.hasAttribute = function hasAttribute(name) {
                    return this.getAttribute(name) !== null;
                };
            }

            // Apply Element prototype to the pre-existing DOM as soon as the body element appears.
            function bodyCheck() {
                if (!loopLimit--) clearTimeout(interval);
                if (document.body && !document.body.prototype && /(complete|interactive)/.test(document.readyState)) {
                    shiv(document, true);
                    if (interval && document.body.prototype) clearTimeout(interval);
                    return !!document.body.prototype;
                }
                return false;
            }
            if (!bodyCheck()) {
                document.onreadystatechange = bodyCheck;
                interval = setInterval(bodyCheck, 25);
            }

            // Apply to any new elements created after load
            document.createElement = function createElement(nodeName) {
                const element = nativeCreateElement(String(nodeName).toLowerCase());
                return shiv(element);
            };

            // remove sandboxed iframe
            document.removeChild(vbody);
        })();
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    ((_undefined) => {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-library/13cf7c340974d128d557580b5e2dafcd1b1192d1/polyfills/Element/prototype/dataset/detect.js
        const detect = (() => {
            if (!document.documentElement.dataset) {
                return false;
            }
            const el = document.createElement("div");
            el.setAttribute("data-a-b", "c");
            return el.dataset && el.dataset.aB === "c";
        })();

        if (detect) return;

        // Polyfill derived from  https://raw.githubusercontent.com/Financial-Times/polyfill-library/13cf7c340974d128d557580b5e2dafcd1b1192d1/polyfills/Element/prototype/dataset/polyfill.js
        Object.defineProperty(Element.prototype, "dataset", {
            get: function () {
                const attributes = this.attributes;
                const map = {};

                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes[i];

                    // This regex has been edited from the original polyfill, to add
                    // support for period (.) separators in data-* attribute names. These
                    // are allowed in the HTML spec, but were not covered by the original
                    // polyfill's regex. We use periods in our i18n implementation.
                    if (attribute?.name && /^data-\w[.\w-]*$/.test(attribute.name)) {
                        const name = attribute.name;
                        const value = attribute.value;

                        const propName = name.substr(5).replace(/-./g, (prop) => prop.charAt(1).toUpperCase());

                        // If this browser supports __defineGetter__ and __defineSetter__,
                        // continue using defineProperty. If not (like IE 8 and below), we use
                        // a hacky fallback which at least gives an object in the right format
                        if ("__defineGetter__" in Object.prototype && "__defineSetter__" in Object.prototype) {
                            Object.defineProperty(map, propName, {
                                enumerable: true,
                                get: function () {
                                    return this.value;
                                }.bind({ value: value || "" }),
                                set: function setter(name, value) {
                                    if (typeof value !== "undefined") {
                                        this.setAttribute(name, value);
                                    } else {
                                        this.removeAttribute(name);
                                    }
                                }.bind(this, name),
                            });
                        } else {
                            map[propName] = value;
                        }
                    }
                }

                return map;
            },
        });
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    ((_undefined) => {
        // Detection from https://github.com/mdn/content/blob/cf607d68522cd35ee7670782d3ee3a361eaef2e4/files/en-us/web/javascript/reference/global_objects/string/trim/index.md#polyfill
        const detect = "trim" in String.prototype;

        if (detect) return;

        // Polyfill from https://github.com/mdn/content/blob/cf607d68522cd35ee7670782d3ee3a361eaef2e4/files/en-us/web/javascript/reference/global_objects/string/trim/index.md#polyfill
        String.prototype.trim = function () {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
        };
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    /* eslint-disable es-x/no-string-prototype-trim -- Polyfill imported */

    /**
     * Normalise string
     *
     * 'If it looks like a duck, and it quacks like a duck…' 🦆
     *
     * If the passed value looks like a boolean or a number, convert it to a boolean
     * or number.
     *
     * Designed to be used to convert config passed via data attributes (which are
     * always strings) into something sensible.
     *
     * @param {string} value - The value to normalise
     * @returns {string | boolean | number | undefined} Normalised data
     */
    function normaliseString(value) {
        if (typeof value !== "string") {
            return value;
        }

        const trimmedValue = value.trim();

        if (trimmedValue === "true") {
            return true;
        }

        if (trimmedValue === "false") {
            return false;
        }

        // Empty / whitespace-only strings are considered finite so we need to check
        // the length of the trimmed string as well
        if (trimmedValue.length > 0 && Number.isFinite(trimmedValue)) {
            return Number(trimmedValue);
        }

        return value;
    }

    /**
     * Normalise dataset
     *
     * Loop over an object and normalise each value using normaliseData function
     *
     * @param {DOMStringMap} dataset - HTML element dataset
     * @returns {Object<string, unknown>} Normalised dataset
     */
    function normaliseDataset(dataset) {
        const out = {};

        for (const key in dataset) {
            out[key] = normaliseString(dataset[key]);
        }

        return out;
    }

    /**
     * Internal support for selecting messages to render, with placeholder
     * interpolation and locale-aware number formatting and pluralisation
     *
     * @class
     * @private
     * @param {Object<string, unknown>} translations - Key-value pairs of the translation strings to use.
     * @param {object} [config] - Configuration options for the function.
     * @param {string} [config.locale] - An overriding locale for the PluralRules functionality.
     */
    function I18n(translations, config) {
        // Make list of translations available throughout function
        this.translations = translations || {};

        // The locale to use for PluralRules and NumberFormat
        this.locale = config?.locale || document.documentElement.lang || "en";
    }

    /**
     * The most used function - takes the key for a given piece of UI text and
     * returns the appropriate string.
     *
     * @param {string} lookupKey - The lookup key of the string to use.
     * @param {Object<string, unknown>} [options] - Any options passed with the translation string, e.g: for string interpolation.
     * @returns {string} The appropriate translation string.
     * @throws {Error} Lookup key required
     * @throws {Error} Options required for `${}` placeholders
     */
    I18n.prototype.t = function (lookupKey, options) {
        if (!lookupKey) {
            // Print a console error if no lookup key has been provided
            throw new Error("i18n: lookup key missing");
        }

        // If the `count` option is set, determine which plural suffix is needed and
        // change the lookupKey to match. We check to see if it's undefined instead of
        // falsy, as this could legitimately be 0.
        if (options && typeof options.count !== "undefined") {
            // Get the plural suffix
            lookupKey = `${lookupKey}.${this.getPluralSuffix(lookupKey, options.count)}`;
        }

        if (lookupKey in this.translations) {
            // Fetch the translation string for that lookup key
            const translationString = this.translations[lookupKey];

            // Check for ${} placeholders in the translation string
            if (translationString.match(/%{(.\S+)}/)) {
                if (!options) {
                    throw new Error("i18n: cannot replace placeholders in string if no option data provided");
                }

                return this.replacePlaceholders(translationString, options);
            }
            return translationString;
        }
        // If the key wasn't found in our translations object,
        // return the lookup key itself as the fallback
        return lookupKey;
    };

    /**
     * Takes a translation string with placeholders, and replaces the placeholders
     * with the provided data
     *
     * @param {string} translationString - The translation string
     * @param {Object<string, unknown>} options - Any options passed with the translation string, e.g: for string interpolation.
     * @returns {string} The translation string to output, with ${} placeholders replaced
     */
    I18n.prototype.replacePlaceholders = function (translationString, options) {
        let formatter;

        if (this.hasIntlNumberFormatSupport()) {
            formatter = new Intl.NumberFormat(this.locale);
        }

        return translationString.replace(/%{(.\S+)}/g, (placeholderWithBraces, placeholderKey) => {
            if (Object.prototype.hasOwnProperty.call(options, placeholderKey)) {
                const placeholderValue = options[placeholderKey];

                // If a user has passed `false` as the value for the placeholder
                // treat it as though the value should not be displayed
                if (placeholderValue === false) {
                    return "";
                }

                // If the placeholder's value is a number, localise the number formatting
                if (typeof placeholderValue === "number" && formatter) {
                    return formatter.format(placeholderValue);
                }

                return placeholderValue;
            }
            throw new Error(`i18n: no data found to replace ${placeholderWithBraces} placeholder in string`);
        });
    };

    /**
     * Check to see if the browser supports Intl and Intl.PluralRules.
     *
     * It requires all conditions to be met in order to be supported:
     * - The browser supports the Intl class (true in IE11)
     * - The implementation of Intl supports PluralRules (NOT true in IE11)
     * - The browser/OS has plural rules for the current locale (browser dependent)
     *
     * @returns {boolean} Returns true if all conditions are met. Returns false otherwise.
     */
    I18n.prototype.hasIntlPluralRulesSupport = function () {
        return Boolean(
            window.Intl && "PluralRules" in window.Intl && Intl.PluralRules.supportedLocalesOf(this.locale).length,
        );
    };

    /**
     * Check to see if the browser supports Intl and Intl.NumberFormat.
     *
     * It requires all conditions to be met in order to be supported:
     * - The browser supports the Intl class (true in IE11)
     * - The implementation of Intl supports NumberFormat (also true in IE11)
     * - The browser/OS has number formatting rules for the current locale (browser dependent)
     *
     * @returns {boolean} Returns true if all conditions are met. Returns false otherwise.
     */
    I18n.prototype.hasIntlNumberFormatSupport = function () {
        return Boolean(
            window.Intl && "NumberFormat" in window.Intl && Intl.NumberFormat.supportedLocalesOf(this.locale).length,
        );
    };

    /**
     * Get the appropriate suffix for the plural form.
     *
     * Uses Intl.PluralRules (or our own fallback implementation) to get the
     * 'preferred' form to use for the given count.
     *
     * Checks that a translation has been provided for that plural form – if it
     * hasn't, it'll fall back to the 'other' plural form (unless that doesn't exist
     * either, in which case an error will be thrown)
     *
     * @param {string} lookupKey - The lookup key of the string to use.
     * @param {number} count - Number used to determine which pluralisation to use.
     * @returns {PluralRule} The suffix associated with the correct pluralisation for this locale.
     * @throws {Error} Plural form `.other` required when preferred plural form is missing
     */
    I18n.prototype.getPluralSuffix = function (lookupKey, count) {
        // Validate that the number is actually a number.
        //
        // Number(count) will turn anything that can't be converted to a Number type
        // into 'NaN'. isFinite filters out NaN, as it isn't a finite number.
        count = Number(count);
        if (!Number.isFinite(count)) {
            return "other";
        }

        let preferredForm;

        // Check to verify that all the requirements for Intl.PluralRules are met.
        // If so, we can use that instead of our custom implementation. Otherwise,
        // use the hardcoded fallback.
        if (this.hasIntlPluralRulesSupport()) {
            preferredForm = new Intl.PluralRules(this.locale).select(count);
        } else {
            preferredForm = this.selectPluralFormUsingFallbackRules(count);
        }

        // Use the correct plural form if provided
        if (`${lookupKey}.${preferredForm}` in this.translations) {
            return preferredForm;
            // Fall back to `other` if the plural form is missing, but log a warning
            // to the console
        }
        if (`${lookupKey}.other` in this.translations) {
            if (console && "warn" in console) {
                console.warn(
                    `i18n: Missing plural form ".${preferredForm}" for "${this.locale}" locale. Falling back to ".other".`,
                );
            }

            return "other";
            // If the required `other` plural form is missing, all we can do is error
        }
        throw new Error(`i18n: Plural form ".other" is required for "${this.locale}" locale`);
    };

    /**
     * Get the plural form using our fallback implementation
     *
     * This is split out into a separate function to make it easier to test the
     * fallback behaviour in an environment where Intl.PluralRules exists.
     *
     * @param {number} count - Number used to determine which pluralisation to use.
     * @returns {PluralRule} The pluralisation form for count in this locale.
     */
    I18n.prototype.selectPluralFormUsingFallbackRules = function (count) {
        // Currently our custom code can only handle positive integers, so let's
        // make sure our number is one of those.
        count = Math.abs(Math.floor(count));

        const ruleset = this.getPluralRulesForLocale();

        if (ruleset) {
            return I18n.pluralRules[ruleset](count);
        }

        return "other";
    };

    /**
     * Work out which pluralisation rules to use for the current locale
     *
     * The locale may include a regional indicator (such as en-GB), but we don't
     * usually care about this part, as pluralisation rules are usually the same
     * regardless of region. There are exceptions, however, (e.g. Portuguese) so
     * this searches by both the full and shortened locale codes, just to be sure.
     *
     * @returns {PluralRuleName | undefined} The name of the pluralisation rule to use (a key for one
     *   of the functions in this.pluralRules)
     */
    I18n.prototype.getPluralRulesForLocale = function () {
        const locale = this.locale;
        const localeShort = locale.split("-")[0];

        // Look through the plural rules map to find which `pluralRule` is
        // appropriate for our current `locale`.
        for (const pluralRule in I18n.pluralRulesMap) {
            if (Object.prototype.hasOwnProperty.call(I18n.pluralRulesMap, pluralRule)) {
                const languages = I18n.pluralRulesMap[pluralRule];
                for (let i = 0; i < languages.length; i++) {
                    if (languages[i] === locale || languages[i] === localeShort) {
                        return pluralRule;
                    }
                }
            }
        }
    };

    /**
     * Map of plural rules to languages where those rules apply.
     *
     * Note: These groups are named for the most dominant or recognisable language
     * that uses each system. The groupings do not imply that the languages are
     * related to one another. Many languages have evolved the same systems
     * independently of one another.
     *
     * Code to support more languages can be found in the i18n spike:
     * {@link https://github.com/alphagov/govuk-frontend/blob/spike-i18n-support/src/govuk/i18n.mjs}
     *
     * Languages currently supported:
     *
     * Arabic: Arabic (ar)
     * Chinese: Burmese (my), Chinese (zh), Indonesian (id), Japanese (ja),
     *   Javanese (jv), Korean (ko), Malay (ms), Thai (th), Vietnamese (vi)
     * French: Armenian (hy), Bangla (bn), French (fr), Gujarati (gu), Hindi (hi),
     *   Persian Farsi (fa), Punjabi (pa), Zulu (zu)
     * German: Afrikaans (af), Albanian (sq), Azerbaijani (az), Basque (eu),
     *   Bulgarian (bg), Catalan (ca), Danish (da), Dutch (nl), English (en),
     *   Estonian (et), Finnish (fi), Georgian (ka), German (de), Greek (el),
     *   Hungarian (hu), Luxembourgish (lb), Norwegian (no), Somali (so),
     *   Swahili (sw), Swedish (sv), Tamil (ta), Telugu (te), Turkish (tr),
     *   Urdu (ur)
     * Irish: Irish Gaelic (ga)
     * Russian: Russian (ru), Ukrainian (uk)
     * Scottish: Scottish Gaelic (gd)
     * Spanish: European Portuguese (pt-PT), Italian (it), Spanish (es)
     * Welsh: Welsh (cy)
     *
     * @type {Object<PluralRuleName, string[]>}
     */
    I18n.pluralRulesMap = {
        arabic: ["ar"],
        chinese: ["my", "zh", "id", "ja", "jv", "ko", "ms", "th", "vi"],
        french: ["hy", "bn", "fr", "gu", "hi", "fa", "pa", "zu"],
        german: [
            "af",
            "sq",
            "az",
            "eu",
            "bg",
            "ca",
            "da",
            "nl",
            "en",
            "et",
            "fi",
            "ka",
            "de",
            "el",
            "hu",
            "lb",
            "no",
            "so",
            "sw",
            "sv",
            "ta",
            "te",
            "tr",
            "ur",
        ],
        irish: ["ga"],
        russian: ["ru", "uk"],
        scottish: ["gd"],
        spanish: ["pt-PT", "it", "es"],
        welsh: ["cy"],
    };

    /**
     * Different pluralisation rule sets
     *
     * Returns the appropriate suffix for the plural form associated with `n`.
     * Possible suffixes: 'zero', 'one', 'two', 'few', 'many', 'other' (the actual
     * meaning of each differs per locale). 'other' should always exist, even in
     * languages without plurals, such as Chinese.
     * {@link https://cldr.unicode.org/index/cldr-spec/plural-rules}
     *
     * The count must be a positive integer. Negative numbers and decimals aren't accounted for
     *
     * @type {Object<string, function(number): PluralRule>}
     */
    I18n.pluralRules = {
        /* eslint-disable jsdoc/require-jsdoc */
        arabic: (n) => {
            if (n === 0) {
                return "zero";
            }
            if (n === 1) {
                return "one";
            }
            if (n === 2) {
                return "two";
            }
            if (n % 100 >= 3 && n % 100 <= 10) {
                return "few";
            }
            if (n % 100 >= 11 && n % 100 <= 99) {
                return "many";
            }
            return "other";
        },
        chinese: () => "other",
        french: (n) => (n === 0 || n === 1 ? "one" : "other"),
        german: (n) => (n === 1 ? "one" : "other"),
        irish: (n) => {
            if (n === 1) {
                return "one";
            }
            if (n === 2) {
                return "two";
            }
            if (n >= 3 && n <= 6) {
                return "few";
            }
            if (n >= 7 && n <= 10) {
                return "many";
            }
            return "other";
        },
        russian: (n) => {
            const lastTwo = n % 100;
            const last = lastTwo % 10;
            if (last === 1 && lastTwo !== 11) {
                return "one";
            }
            if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
                return "few";
            }
            if (last === 0 || (last >= 5 && last <= 9) || (lastTwo >= 11 && lastTwo <= 14)) {
                return "many";
            }
            // Note: The 'other' suffix is only used by decimal numbers in Russian.
            // We don't anticipate it being used, but it's here for consistency.
            return "other";
        },
        scottish: (n) => {
            if (n === 1 || n === 11) {
                return "one";
            }
            if (n === 2 || n === 12) {
                return "two";
            }
            if ((n >= 3 && n <= 10) || (n >= 13 && n <= 19)) {
                return "few";
            }
            return "other";
        },
        spanish: (n) => {
            if (n === 1) {
                return "one";
            }
            if (n % 1000000 === 0 && n !== 0) {
                return "many";
            }
            return "other";
        },
        welsh: (n) => {
            if (n === 0) {
                return "zero";
            }
            if (n === 1) {
                return "one";
            }
            if (n === 2) {
                return "two";
            }
            if (n === 3) {
                return "few";
            }
            if (n === 6) {
                return "many";
            }
            return "other";
        },
        /* eslint-enable jsdoc/require-jsdoc */
    };

    /**
     * Supported languages for plural rules
     *
     * @typedef {'arabic' | 'chinese' | 'french' | 'german' | 'irish' | 'russian' | 'scottish' | 'spanish' | 'welsh'} PluralRuleName
     */

    /**
     * Plural rule category mnemonic tags
     *
     * @typedef {'zero' | 'one' | 'two' | 'few' | 'many' | 'other'} PluralRule
     */

    /**
     * Translated message by plural rule they correspond to.
     *
     * Allows to group pluralised messages under a single key when passing
     * translations to a component's constructor
     *
     * @typedef {object} TranslationPluralForms
     * @property {string} [other] - General plural form
     * @property {string} [zero] - Plural form used with 0
     * @property {string} [one] - Plural form used with 1
     * @property {string} [two] - Plural form used with 2
     * @property {string} [few] - Plural form used for a few
     * @property {string} [many] - Plural form used for many
     */

    (function (undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/detect.js
        const detect =
            "DOMTokenList" in this &&
            ((x) => ("classList" in x ? !x.classList.toggle("x", false) && !x.className : true))(
                document.createElement("x"),
            );

        if (detect) return;

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/master/packages/polyfill-library/polyfills/DOMTokenList/polyfill.js
        ((global) => {
            const nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

            if (
                !nativeImpl ||
                (!!document.createElementNS &&
                    !!document.createElementNS("http://www.w3.org/2000/svg", "svg") &&
                    !(document.createElementNS("http://www.w3.org/2000/svg", "svg").classList instanceof DOMTokenList))
            ) {
                global.DOMTokenList = (() => {
                    // eslint-disable-line no-unused-vars
                    let dpSupport = true;
                    const defineGetter = (object, name, fn, configurable) => {
                        if (Object.defineProperty)
                            Object.defineProperty(object, name, {
                                configurable: false === dpSupport ? true : !!configurable,
                                get: fn,
                            });
                        else object.__defineGetter__(name, fn);
                    };

                    /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
                    try {
                        defineGetter({}, "support");
                    } catch (_e) {
                        dpSupport = false;
                    }

                    const _DOMTokenList = function (el, prop) {
                        let tokens = [];
                        let tokenMap = {};
                        let length = 0;
                        let maxLength = 0;
                        const addIndexGetter = (i) => {
                            defineGetter(
                                this,
                                i,
                                () => {
                                    preop();
                                    return tokens[i];
                                },
                                false,
                            );
                        };
                        const reindex = () => {
                            /** Define getter functions for array-like access to the tokenList's contents. */
                            if (length >= maxLength)
                                for (; maxLength < length; ++maxLength) {
                                    addIndexGetter(maxLength);
                                }
                        };

                        /** Helper function called at the start of each class method. Internal use only. */
                        const preop = () => {
                            let error;
                            let i;
                            const args = arguments;
                            const rSpace = /\s+/;

                            /** Validate the token/s passed to an instance method, if any. */
                            if (args.length)
                                for (i = 0; i < args.length; ++i)
                                    if (rSpace.test(args[i])) {
                                        error = new SyntaxError(`String "${args[i]}" contains an invalid character`);
                                        error.code = 5;
                                        error.name = "InvalidCharacterError";
                                        throw error;
                                    }

                            /** Split the new value apart by whitespace*/
                            if (typeof el[prop] === "object") {
                                tokens = `${el[prop].baseVal}`.replace(/^\s+|\s+$/g, "").split(rSpace);
                            } else {
                                tokens = `${el[prop]}`.replace(/^\s+|\s+$/g, "").split(rSpace);
                            }

                            /** Avoid treating blank strings as single-item token lists */
                            if ("" === tokens[0]) tokens = [];

                            /** Repopulate the internal token lists */
                            tokenMap = {};
                            for (i = 0; i < tokens.length; ++i) tokenMap[tokens[i]] = true;
                            length = tokens.length;
                            reindex();
                        };

                        /** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
                        preop();

                        /** Return the number of tokens in the underlying string. Read-only. */
                        defineGetter(this, "length", () => {
                            preop();
                            return length;
                        });

                        /** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
                        this.toLocaleString = this.toString = () => {
                            preop();
                            return tokens.join(" ");
                        };

                        this.item = (idx) => {
                            preop();
                            return tokens[idx];
                        };

                        this.contains = (token) => {
                            preop();
                            return !!tokenMap[token];
                        };

                        this.add = () => {
                            preop.apply(this, (args = arguments));

                            for (let args, token, i = 0, l = args.length; i < l; ++i) {
                                token = args[i];
                                if (!tokenMap[token]) {
                                    tokens.push(token);
                                    tokenMap[token] = true;
                                }
                            }

                            /** Update the targeted attribute of the attached element if the token list's changed. */
                            if (length !== tokens.length) {
                                length = tokens.length >>> 0;
                                if (typeof el[prop] === "object") {
                                    el[prop].baseVal = tokens.join(" ");
                                } else {
                                    el[prop] = tokens.join(" ");
                                }
                                reindex();
                            }
                        };

                        this.remove = () => {
                            preop.apply(this, (args = arguments));

                            /** Build a hash of token names to compare against when recollecting our token list. */
                            for (let args, ignore = {}, i = 0, _t = []; i < args.length; ++i) {
                                ignore[args[i]] = true;
                                delete tokenMap[args[i]];
                            }

                            /** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
                            for (i = 0; i < tokens.length; ++i) if (!ignore[tokens[i]]) t.push(tokens[i]);

                            tokens = t;
                            length = t.length >>> 0;

                            /** Update the targeted attribute of the attached element. */
                            if (typeof el[prop] === "object") {
                                el[prop].baseVal = tokens.join(" ");
                            } else {
                                el[prop] = tokens.join(" ");
                            }
                            reindex();
                        };

                        this.toggle = (token, force) => {
                            preop.apply(this, [token]);

                            /** Token state's being forced. */
                            if (undefined !== force) {
                                if (force) {
                                    this.add(token);
                                    return true;
                                }
                                this.remove(token);
                                return false;
                            }

                            /** Token already exists in tokenList. Remove it, and return FALSE. */
                            if (tokenMap[token]) {
                                this.remove(token);
                                return false;
                            }

                            /** Otherwise, add the token and return TRUE. */
                            this.add(token);
                            return true;
                        };

                        return this;
                    };

                    return _DOMTokenList;
                })();
            }

            // Add second argument to native DOMTokenList.toggle() if necessary
            (() => {
                const e = document.createElement("span");
                if (!("classList" in e)) return;
                e.classList.toggle("x", false);
                if (!e.classList.contains("x")) return;
                e.classList.constructor.prototype.toggle = function toggle(token /*, force*/) {
                    let force = arguments[1];
                    if (force === undefined) {
                        const add = !this.contains(token);
                        this[add ? "add" : "remove"](token);
                        return add;
                    }
                    force = !!force;
                    this[force ? "add" : "remove"](token);
                    return force;
                };
            })();

            // Add multiple arguments to native DOMTokenList.add() if necessary
            (() => {
                const e = document.createElement("span");
                if (!("classList" in e)) return;
                e.classList.add("a", "b");
                if (e.classList.contains("b")) return;
                const native = e.classList.constructor.prototype.add;
                e.classList.constructor.prototype.add = function () {
                    const args = arguments;
                    const l = arguments.length;
                    for (let i = 0; i < l; i++) {
                        native.call(this, args[i]);
                    }
                };
            })();

            // Add multiple arguments to native DOMTokenList.remove() if necessary
            (() => {
                const e = document.createElement("span");
                if (!("classList" in e)) return;
                e.classList.add("a");
                e.classList.add("b");
                e.classList.remove("a", "b");
                if (!e.classList.contains("b")) return;
                const native = e.classList.constructor.prototype.remove;
                e.classList.constructor.prototype.remove = function () {
                    const args = arguments;
                    const l = arguments.length;
                    for (let i = 0; i < l; i++) {
                        native.call(this, args[i]);
                    }
                };
            })();
        })(this);
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/8717a9e04ac7aff99b4980fbedead98036b0929a/packages/polyfill-library/polyfills/Element/prototype/classList/detect.js
        const detect =
            "document" in this &&
            "classList" in document.documentElement &&
            "Element" in this &&
            "classList" in Element.prototype &&
            (() => {
                const e = document.createElement("span");
                e.classList.add("a", "b");
                return e.classList.contains("b");
            })();

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Element.prototype.classList&flags=always
        ((global) => {
            let dpSupport = true;
            const defineGetter = (object, name, fn, configurable) => {
                if (Object.defineProperty)
                    Object.defineProperty(object, name, {
                        configurable: false === dpSupport ? true : !!configurable,
                        get: fn,
                    });
                else object.__defineGetter__(name, fn);
            };
            /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
            try {
                defineGetter({}, "support");
            } catch (_e) {
                dpSupport = false;
            }
            /** Polyfills a property with a DOMTokenList */
            const addProp = (o, name, attr) => {
                defineGetter(
                    o.prototype,
                    name,
                    function () {
                        let tokenList;

                        const /** Prevent this from firing twice for some reason. What the hell, IE. */
                            gibberishProperty = `__defineGetter__DEFINE_PROPERTY${name}`;
                        if (this[gibberishProperty]) return tokenList;
                        this[gibberishProperty] = true;

                        /**
                         * IE8 can't define properties on native JavaScript objects, so we'll use a dumb hack instead.
                         *
                         * What this is doing is creating a dummy element ("reflection") inside a detached phantom node ("mirror")
                         * that serves as the target of Object.defineProperty instead. While we could simply use the subject HTML
                         * element instead, this would conflict with element types which use indexed properties (such as forms and
                         * select lists).
                         */
                        if (false === dpSupport) {
                            let visage;
                            const mirror = addProp.mirror || document.createElement("div");
                            const reflections = mirror.childNodes;
                            const l = reflections.length;

                            for (let i = 0; i < l; ++i)
                                if (reflections[i]._R === this) {
                                    visage = reflections[i];
                                    break;
                                }

                            /** Couldn't find an element's reflection inside the mirror. Materialise one. */
                            visage || (visage = mirror.appendChild(document.createElement("div")));

                            tokenList = DOMTokenList.call(visage, this, attr);
                        } else tokenList = new DOMTokenList(this, attr);

                        defineGetter(this, name, () => tokenList);
                        delete this[gibberishProperty];

                        return tokenList;
                    },
                    true,
                );
            };

            addProp(global.Element, "classList", "className");
            addProp(global.HTMLElement, "classList", "className");
            addProp(global.HTMLLinkElement, "relList", "rel");
            addProp(global.HTMLAnchorElement, "relList", "rel");
            addProp(global.HTMLAreaElement, "relList", "rel");
        })(this);
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/matches/detect.js
        const detect = "document" in this && "matches" in document.documentElement;

        if (detect) return;

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/matches/polyfill.js
        Element.prototype.matches =
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            function matches(selector) {
                const elements = (this.document || this.ownerDocument).querySelectorAll(selector);
                let index = 0;

                while (elements[index] && elements[index] !== this) {
                    ++index;
                }

                return !!elements[index];
            };
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/closest/detect.js
        const detect = "document" in this && "closest" in document.documentElement;

        if (detect) return;

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-service/1f3c09b402f65bf6e393f933a15ba63f1b86ef1f/packages/polyfill-library/polyfills/Element/prototype/closest/polyfill.js
        Element.prototype.closest = function closest(selector) {
            let node = this;

            while (node) {
                if (node.matches(selector)) return node;
                node = "SVGElement" in window && node instanceof SVGElement ? node.parentNode : node.parentElement;
            }

            return null;
        };
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Window/detect.js
        const detect = "Window" in this;

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Window&flags=always
        if (typeof WorkerGlobalScope === "undefined" && typeof importScripts !== "function") {
            (function (global) {
                if (global.constructor) {
                    global.Window = global.constructor;
                } else {
                    (global.Window = global.constructor = new Function("return function Window() {}")()).prototype =
                        this;
                }
            })(this);
        }
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (undefined) {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Event/detect.js
        const detect = ((global) => {
            if (!("Event" in global)) return false;
            if (typeof global.Event === "function") return true;

            try {
                // In IE 9-11, the Event object exists but cannot be instantiated
                new Event("click");
                return true;
            } catch (_e) {
                return false;
            }
        })(this);

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Event&flags=always
        (() => {
            const unlistenableWindowEvents = {
                click: 1,
                dblclick: 1,
                keyup: 1,
                keypress: 1,
                keydown: 1,
                mousedown: 1,
                mouseup: 1,
                mousemove: 1,
                mouseover: 1,
                mouseenter: 1,
                mouseleave: 1,
                mouseout: 1,
                storage: 1,
                storagecommit: 1,
                textinput: 1,
            };

            // This polyfill depends on availability of `document` so will not run in a worker
            // However, we asssume there are no browsers with worker support that lack proper
            // support for `Event` within the worker
            if (typeof document === "undefined" || typeof window === "undefined") return;

            function indexOf(array, element) {
                let index = -1;
                const length = array.length;

                while (++index < length) {
                    if (index in array && array[index] === element) {
                        return index;
                    }
                }

                return -1;
            }

            const existingProto = window.Event?.prototype || null;
            window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
                if (!type) {
                    throw new Error("Not enough arguments");
                }

                let event;
                // Shortcut if browser supports createEvent
                if ("createEvent" in document) {
                    event = document.createEvent("Event");
                    const bubbles =
                        eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
                    const cancelable =
                        eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

                    event.initEvent(type, bubbles, cancelable);

                    return event;
                }

                event = document.createEventObject();

                event.type = type;
                event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
                event.cancelable =
                    eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

                return event;
            };
            if (existingProto) {
                Object.defineProperty(window.Event, "prototype", {
                    configurable: false,
                    enumerable: false,
                    writable: true,
                    value: existingProto,
                });
            }

            if (!("createEvent" in document)) {
                window.addEventListener =
                    Window.prototype.addEventListener =
                    Document.prototype.addEventListener =
                    Element.prototype.addEventListener =
                        function addEventListener() {
                            const type = arguments[0];
                            const listener = arguments[1];

                            if (this === window && type in unlistenableWindowEvents) {
                                throw new Error(
                                    `In IE8 the event: ${type} is not available on the window object. Please see https://github.com/Financial-Times/polyfill-service/issues/317 for more information.`,
                                );
                            }

                            if (!this._events) {
                                this._events = {};
                            }

                            if (!this._events[type]) {
                                this._events[type] = (event) => {
                                    const list = this._events[event.type].list;
                                    const events = list.slice();
                                    let index = -1;
                                    const length = events.length;
                                    let eventElement;

                                    event.preventDefault = function preventDefault() {
                                        if (event.cancelable !== false) {
                                            event.returnValue = false;
                                        }
                                    };

                                    event.stopPropagation = function stopPropagation() {
                                        event.cancelBubble = true;
                                    };

                                    event.stopImmediatePropagation = function stopImmediatePropagation() {
                                        event.cancelBubble = true;
                                        event.cancelImmediate = true;
                                    };

                                    event.currentTarget = this;
                                    event.relatedTarget = event.fromElement || null;
                                    event.target = event.target || event.srcElement || this;
                                    event.timeStamp = new Date().getTime();

                                    if (event.clientX) {
                                        event.pageX = event.clientX + document.documentElement.scrollLeft;
                                        event.pageY = event.clientY + document.documentElement.scrollTop;
                                    }

                                    while (++index < length && !event.cancelImmediate) {
                                        if (index in events) {
                                            eventElement = events[index];

                                            if (
                                                indexOf(list, eventElement) !== -1 &&
                                                typeof eventElement === "function"
                                            ) {
                                                eventElement.call(this, event);
                                            }
                                        }
                                    }
                                };

                                this._events[type].list = [];

                                if (this.attachEvent) {
                                    this.attachEvent(`on${type}`, this._events[type]);
                                }
                            }

                            this._events[type].list.push(listener);
                        };

                window.removeEventListener =
                    Window.prototype.removeEventListener =
                    Document.prototype.removeEventListener =
                    Element.prototype.removeEventListener =
                        function removeEventListener() {
                            const type = arguments[0];
                            const listener = arguments[1];
                            let index;

                            if (this._events?.[type]?.list) {
                                index = indexOf(this._events[type].list, listener);

                                if (index !== -1) {
                                    this._events[type].list.splice(index, 1);

                                    if (!this._events[type].list.length) {
                                        if (this.detachEvent) {
                                            this.detachEvent(`on${type}`, this._events[type]);
                                        }
                                        delete this._events[type];
                                    }
                                }
                            }
                        };

                window.dispatchEvent =
                    Window.prototype.dispatchEvent =
                    Document.prototype.dispatchEvent =
                    Element.prototype.dispatchEvent =
                        function dispatchEvent(event) {
                            if (!arguments.length) {
                                throw new Error("Not enough arguments");
                            }

                            if (!event || typeof event.type !== "string") {
                                throw new Error("DOM Events Exception 0");
                            }

                            let element = this;
                            const type = event.type;

                            try {
                                if (!event.bubbles) {
                                    event.cancelBubble = true;

                                    const cancelBubbleEvent = (event) => {
                                        event.cancelBubble = true;

                                        (element || window).detachEvent(`on${type}`, cancelBubbleEvent);
                                    };

                                    this.attachEvent(`on${type}`, cancelBubbleEvent);
                                }

                                this.fireEvent(`on${type}`, event);
                            } catch (_error) {
                                event.target = element;

                                do {
                                    event.currentTarget = element;

                                    if ("_events" in element && typeof element._events[type] === "function") {
                                        element._events[type].call(element, event);
                                    }

                                    if (typeof element[`on${type}`] === "function") {
                                        element[`on${type}`].call(element, event);
                                    }

                                    element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
                                } while (element && !event.cancelBubble);
                            }

                            return true;
                        };

                // Add the DOMContentLoaded Event
                document.attachEvent("onreadystatechange", () => {
                    if (document.readyState === "complete") {
                        document.dispatchEvent(
                            new Event("DOMContentLoaded", {
                                bubbles: true,
                            }),
                        );
                    }
                });
            }
        })();
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    ((_undefined) => {
        // Detection from https://github.com/Financial-Times/polyfill-service/blob/master/packages/polyfill-library/polyfills/Function/prototype/bind/detect.js
        const detect = "bind" in Function.prototype;

        if (detect) return;

        // Polyfill from https://cdn.polyfill.io/v2/polyfill.js?features=Function.prototype.bind&flags=always
        Object.defineProperty(Function.prototype, "bind", {
            value: function bind(that) {
                // .length is 1
                // add necessary es5-shim utilities
                const $Array = Array;
                const $Object = Object;
                const ObjectPrototype = $Object.prototype;
                const ArrayPrototype = $Array.prototype;
                const Empty = function Empty() {};
                const to_string = ObjectPrototype.toString;
                const hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol";
                let isCallable;
                /* inlined from https://npmjs.com/is-callable */ const fnToStr =
                    Function.prototype.toString; /* inlined from https://npmjs.com/is-callable */
                const tryFunctionObject = function tryFunctionObject(value) {
                    try {
                        fnToStr.call(value);
                        return true;
                    } catch (_e) {
                        return false;
                    }
                }; /* inlined from https://npmjs.com/is-callable */
                const fnClass = "[object Function]"; /* inlined from https://npmjs.com/is-callable */
                const genClass = "[object GeneratorFunction]";
                isCallable = function isCallable(value) {
                    if (typeof value !== "function") {
                        return false;
                    }
                    if (hasToStringTag) {
                        return tryFunctionObject(value);
                    }
                    const strClass = to_string.call(value);
                    return strClass === fnClass || strClass === genClass;
                };
                const array_slice = ArrayPrototype.slice;
                const array_concat = ArrayPrototype.concat;
                const array_push = ArrayPrototype.push;
                const max = Math.max;
                // /add necessary es5-shim utilities

                // 1. Let Target be the this value.
                const target = this;
                // 2. If IsCallable(Target) is false, throw a TypeError exception.
                if (!isCallable(target)) {
                    throw new TypeError(`Function.prototype.bind called on incompatible ${target}`);
                }
                // 3. Let A be a new (possibly empty) internal list of all of the
                //   argument values provided after thisArg (arg1, arg2 etc), in order.
                // XXX slicedArgs will stand in for "A" if used
                const args = array_slice.call(arguments, 1); // for normal call
                // 4. Let F be a new native ECMAScript object.
                // 11. Set the [[Prototype]] internal property of F to the standard
                //   built-in Function prototype object as specified in 15.3.3.1.
                // 12. Set the [[Call]] internal property of F as described in
                //   15.3.4.5.1.
                // 13. Set the [[Construct]] internal property of F as described in
                //   15.3.4.5.2.
                // 14. Set the [[HasInstance]] internal property of F as described in
                //   15.3.4.5.3.
                let bound;
                const binder = function () {
                    if (this instanceof bound) {
                        // 15.3.4.5.2 [[Construct]]
                        // When the [[Construct]] internal method of a function object,
                        // F that was created using the bind function is called with a
                        // list of arguments ExtraArgs, the following steps are taken:
                        // 1. Let target be the value of F's [[TargetFunction]]
                        //   internal property.
                        // 2. If target has no [[Construct]] internal method, a
                        //   TypeError exception is thrown.
                        // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                        //   property.
                        // 4. Let args be a new list containing the same values as the
                        //   list boundArgs in the same order followed by the same
                        //   values as the list ExtraArgs in the same order.
                        // 5. Return the result of calling the [[Construct]] internal
                        //   method of target providing args as the arguments.

                        const result = target.apply(this, array_concat.call(args, array_slice.call(arguments)));
                        if ($Object(result) === result) {
                            return result;
                        }
                        return this;
                    }
                    // 15.3.4.5.1 [[Call]]
                    // When the [[Call]] internal method of a function object, F,
                    // which was created using the bind function is called with a
                    // this value and a list of arguments ExtraArgs, the following
                    // steps are taken:
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal
                    //   property.
                    // 3. Let target be the value of F's [[TargetFunction]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Call]] internal method
                    //   of target providing boundThis as the this value and
                    //   providing args as the arguments.

                    // equiv: target.call(this, ...boundArgs, ...args)
                    return target.apply(that, array_concat.call(args, array_slice.call(arguments)));
                };

                // 15. If the [[Class]] internal property of Target is "Function", then
                //     a. Let L be the length property of Target minus the length of A.
                //     b. Set the length own property of F to either 0 or L, whichever is
                //       larger.
                // 16. Else set the length own property of F to 0.

                const boundLength = max(0, target.length - args.length);

                // 17. Set the attributes of the length own property of F to the values
                //   specified in 15.3.5.1.
                const boundArgs = [];
                for (let i = 0; i < boundLength; i++) {
                    array_push.call(boundArgs, `$${i}`);
                }

                // XXX Build a dynamic function with desired amount of arguments is the only
                // way to set the length property of a function.
                // In environments where Content Security Policies enabled (Chrome extensions,
                // for ex.) all use of eval or Function costructor throws an exception.
                // However in all of these environments Function.prototype.bind exists
                // and so this code will never be executed.
                bound = Function(
                    "binder",
                    `return function (${boundArgs.join(",")}){ return binder.apply(this, arguments); }`,
                )(binder);

                if (target.prototype) {
                    Empty.prototype = target.prototype;
                    bound.prototype = new Empty();
                    // Clean up dangling references.
                    Empty.prototype = null;
                }

                // TODO
                // 18. Set the [[Extensible]] internal property of F to true.

                // TODO
                // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
                // 20. Call the [[DefineOwnProperty]] internal method of F with
                //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
                //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
                //   false.
                // 21. Call the [[DefineOwnProperty]] internal method of F with
                //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
                //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
                //   and false.

                // TODO
                // NOTE Function objects created using Function.prototype.bind do not
                // have a prototype property or the [[Code]], [[FormalParameters]], and
                // [[Scope]] internal properties.
                // XXX can't delete prototype in pure-js.

                // 22. Return F.
                return bound;
            },
        });
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * @constant
     * @type {AccordionTranslations}
     * @see Default value for {@link AccordionConfig.i18n}
     * @default
     */
    const ACCORDION_TRANSLATIONS = {
        hideAllSections: "Hide all sections",
        hideSection: "Hide",
        hideSectionAriaLabel: "Hide this section",
        showAllSections: "Show all sections",
        showSection: "Show",
        showSectionAriaLabel: "Show this section",
    };

    /**
     * Accordion component
     *
     * This allows a collection of sections to be collapsed by default, showing only
     * their headers. Sections can be expanded or collapsed individually by clicking
     * their headers. A "Show all sections" button is also added to the top of the
     * accordion, which switches to "Hide all sections" when all the sections are
     * expanded.
     *
     * The state of each section is saved to the DOM via the `aria-expanded`
     * attribute, which also provides accessibility.
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for accordion
     * @param {AccordionConfig} [config] - Accordion config
     */
    function Accordion($module, config) {
        this.$module = $module;

        const defaultConfig = {
            i18n: ACCORDION_TRANSLATIONS,
        };

        this.config = mergeConfigs(defaultConfig, config || {}, normaliseDataset($module.dataset));

        this.i18n = new I18n(extractConfigByNamespace(this.config, "i18n"));

        this.controlsClass = "govuk-accordion__controls";
        this.showAllClass = "govuk-accordion__show-all";
        this.showAllTextClass = "govuk-accordion__show-all-text";

        this.sectionClass = "govuk-accordion__section";
        this.sectionExpandedClass = "govuk-accordion__section--expanded";
        this.sectionButtonClass = "govuk-accordion__section-button";
        this.sectionHeaderClass = "govuk-accordion__section-header";
        this.sectionHeadingClass = "govuk-accordion__section-heading";
        this.sectionHeadingDividerClass = "govuk-accordion__section-heading-divider";
        this.sectionHeadingTextClass = "govuk-accordion__section-heading-text";
        this.sectionHeadingTextFocusClass = "govuk-accordion__section-heading-text-focus";

        this.sectionShowHideToggleClass = "govuk-accordion__section-toggle";
        this.sectionShowHideToggleFocusClass = "govuk-accordion__section-toggle-focus";
        this.sectionShowHideTextClass = "govuk-accordion__section-toggle-text";
        this.upChevronIconClass = "govuk-accordion-nav__chevron";
        this.downChevronIconClass = "govuk-accordion-nav__chevron--down";

        this.sectionSummaryClass = "govuk-accordion__section-summary";
        this.sectionSummaryFocusClass = "govuk-accordion__section-summary-focus";
        this.sectionContentClass = "govuk-accordion__section-content";

        this.$sections = this.$module.querySelectorAll(`.${this.sectionClass}`);
        this.browserSupportsSessionStorage = helper.checkForSessionStorage();
    }

    /**
     * Initialise component
     */
    Accordion.prototype.init = function () {
        // Check for module
        if (!this.$module) {
            return;
        }

        this.initControls();
        this.initSectionHeaders();

        // See if "Show all sections" button text should be updated
        const areAllSectionsOpen = this.checkIfAllSectionsOpen();
        this.updateShowAllButton(areAllSectionsOpen);
    };

    /**
     * Initialise controls and set attributes
     */
    Accordion.prototype.initControls = function () {
        // Create "Show all" button and set attributes
        this.$showAllButton = document.createElement("button");
        this.$showAllButton.setAttribute("type", "button");
        this.$showAllButton.setAttribute("class", this.showAllClass);
        this.$showAllButton.setAttribute("aria-expanded", "false");

        // Create icon, add to element
        this.$showAllIcon = document.createElement("span");
        this.$showAllIcon.classList.add(this.upChevronIconClass);
        this.$showAllButton.appendChild(this.$showAllIcon);

        // Create control wrapper and add controls to it
        const $accordionControls = document.createElement("div");
        $accordionControls.setAttribute("class", this.controlsClass);
        $accordionControls.appendChild(this.$showAllButton);
        this.$module.insertBefore($accordionControls, this.$module.firstChild);

        // Build additional wrapper for Show all toggle text and place after icon
        this.$showAllText = document.createElement("span");
        this.$showAllText.classList.add(this.showAllTextClass);
        this.$showAllButton.appendChild(this.$showAllText);

        // Handle click events on the show/hide all button
        this.$showAllButton.addEventListener("click", this.onShowOrHideAllToggle.bind(this));

        // Handle 'beforematch' events, if the user agent supports them
        if ("onbeforematch" in document) {
            document.addEventListener("beforematch", this.onBeforeMatch.bind(this));
        }
    };

    /**
     * Initialise section headers
     */
    Accordion.prototype.initSectionHeaders = function () {
        // Loop through section headers
        nodeListForEach(
            this.$sections,
            function ($section, i) {
                // Set header attributes
                const $header = $section.querySelector(`.${this.sectionHeaderClass}`);
                this.constructHeaderMarkup($header, i);
                this.setExpanded(this.isExpanded($section), $section);

                // Handle events
                $header.addEventListener("click", this.onSectionToggle.bind(this, $section));

                // See if there is any state stored in sessionStorage and set the sections to
                // open or closed.
                this.setInitialState($section);
            }.bind(this),
        );
    };

    /**
     * Construct section header
     *
     * @param {HTMLDivElement} $header - Section header
     * @param {number} index - Section index
     */
    Accordion.prototype.constructHeaderMarkup = function ($header, index) {
        const $span = $header.querySelector(`.${this.sectionButtonClass}`);
        const $heading = $header.querySelector(`.${this.sectionHeadingClass}`);
        const $summary = $header.querySelector(`.${this.sectionSummaryClass}`);

        // Create a button element that will replace the '.govuk-accordion__section-button' span
        const $button = document.createElement("button");
        $button.setAttribute("type", "button");
        $button.setAttribute("aria-controls", `${this.$module.id}-content-${index + 1}`);

        // Copy all attributes (https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes) from $span to $button
        for (let i = 0; i < $span.attributes.length; i++) {
            const attr = $span.attributes.item(i);
            // Add all attributes but not ID as this is being added to
            // the section heading ($headingText)
            if (attr.nodeName !== "id") {
                $button.setAttribute(attr.nodeName, attr.nodeValue);
            }
        }

        // Create container for heading text so it can be styled
        const $headingText = document.createElement("span");
        $headingText.classList.add(this.sectionHeadingTextClass);
        // Copy the span ID to the heading text to allow it to be referenced by `aria-labelledby` on the
        // hidden content area without "Show this section"
        $headingText.id = $span.id;

        // Create an inner heading text container to limit the width of the focus state
        const $headingTextFocus = document.createElement("span");
        $headingTextFocus.classList.add(this.sectionHeadingTextFocusClass);
        $headingText.appendChild($headingTextFocus);
        // span could contain HTML elements (see https://www.w3.org/TR/2011/WD-html5-20110525/content-models.html#phrasing-content)
        $headingTextFocus.innerHTML = $span.innerHTML;

        // Create container for show / hide icons and text.
        const $showHideToggle = document.createElement("span");
        $showHideToggle.classList.add(this.sectionShowHideToggleClass);
        // Tell Google not to index the 'show' text as part of the heading
        // For the snippet to work with JavaScript, it must be added before adding the page element to the
        // page's DOM. See https://developers.google.com/search/docs/advanced/robots/robots_meta_tag#data-nosnippet-attr
        $showHideToggle.setAttribute("data-nosnippet", "");
        // Create an inner container to limit the width of the focus state
        const $showHideToggleFocus = document.createElement("span");
        $showHideToggleFocus.classList.add(this.sectionShowHideToggleFocusClass);
        $showHideToggle.appendChild($showHideToggleFocus);
        // Create wrapper for the show / hide text. Append text after the show/hide icon
        const $showHideText = document.createElement("span");
        const $showHideIcon = document.createElement("span");
        $showHideIcon.classList.add(this.upChevronIconClass);
        $showHideToggleFocus.appendChild($showHideIcon);
        $showHideText.classList.add(this.sectionShowHideTextClass);
        $showHideToggleFocus.appendChild($showHideText);

        // Append elements to the button:
        // 1. Heading text
        // 2. Punctuation
        // 3. (Optional: Summary line followed by punctuation)
        // 4. Show / hide toggle
        $button.appendChild($headingText);
        $button.appendChild(this.getButtonPunctuationEl());

        // If summary content exists add to DOM in correct order
        if (typeof $summary !== "undefined" && $summary !== null) {
            // Create a new `span` element and copy the summary line content from the original `div` to the
            // new `span`
            // This is because the summary line text is now inside a button element, which can only contain
            // phrasing content
            const $summarySpan = document.createElement("span");
            // Create an inner summary container to limit the width of the summary focus state
            const $summarySpanFocus = document.createElement("span");
            $summarySpanFocus.classList.add(this.sectionSummaryFocusClass);
            $summarySpan.appendChild($summarySpanFocus);

            // Get original attributes, and pass them to the replacement
            for (let j = 0, l = $summary.attributes.length; j < l; ++j) {
                const nodeName = $summary.attributes.item(j).nodeName;
                const nodeValue = $summary.attributes.item(j).nodeValue;
                $summarySpan.setAttribute(nodeName, nodeValue);
            }

            // Copy original contents of summary to the new summary span
            $summarySpanFocus.innerHTML = $summary.innerHTML;

            // Replace the original summary `div` with the new summary `span`
            $summary.parentNode.replaceChild($summarySpan, $summary);

            $button.appendChild($summarySpan);
            $button.appendChild(this.getButtonPunctuationEl());
        }

        $button.appendChild($showHideToggle);

        $heading.removeChild($span);
        $heading.appendChild($button);
    };

    /**
     * When a section is opened by the user agent via the 'beforematch' event
     *
     * @param {Event} event - Generic event
     */
    Accordion.prototype.onBeforeMatch = function (event) {
        const $section = event.target.closest(`.${this.sectionClass}`);
        if ($section) {
            this.setExpanded(true, $section);
        }
    };

    /**
     * When section toggled, set and store state
     *
     * @param {HTMLElement} $section - Section element
     */
    Accordion.prototype.onSectionToggle = function ($section) {
        const expanded = this.isExpanded($section);
        this.setExpanded(!expanded, $section);

        // Store the state in sessionStorage when a change is triggered
        this.storeState($section);
    };

    /**
     * When Open/Close All toggled, set and store state
     */
    Accordion.prototype.onShowOrHideAllToggle = function () {
        const $sections = this.$sections;
        const nowExpanded = !this.checkIfAllSectionsOpen();

        nodeListForEach($sections, ($section) => {
            this.setExpanded(nowExpanded, $section);
            // Store the state in sessionStorage when a change is triggered
            this.storeState($section);
        });

        this.updateShowAllButton(nowExpanded);
    };

    /**
     * Set section attributes when opened/closed
     *
     * @param {boolean} expanded - Section expanded
     * @param {HTMLElement} $section - Section element
     */
    Accordion.prototype.setExpanded = function (expanded, $section) {
        const $showHideIcon = $section.querySelector(`.${this.upChevronIconClass}`);
        const $showHideText = $section.querySelector(`.${this.sectionShowHideTextClass}`);
        const $button = $section.querySelector(`.${this.sectionButtonClass}`);
        const $content = $section.querySelector(`.${this.sectionContentClass}`);

        const newButtonText = expanded ? this.i18n.t("hideSection") : this.i18n.t("showSection");

        $showHideText.innerText = newButtonText;
        $button.setAttribute("aria-expanded", expanded);

        // Update aria-label combining
        const ariaLabelParts = [];

        const $headingText = $section.querySelector(`.${this.sectionHeadingTextClass}`);
        if ($headingText) {
            ariaLabelParts.push($headingText.innerText.trim());
        }

        const $summary = $section.querySelector(`.${this.sectionSummaryClass}`);
        if ($summary) {
            ariaLabelParts.push($summary.innerText.trim());
        }

        const ariaLabelMessage = expanded ? this.i18n.t("hideSectionAriaLabel") : this.i18n.t("showSectionAriaLabel");
        ariaLabelParts.push(ariaLabelMessage);

        /*
         * Join with a comma to add pause for assistive technology.
         * Example: [heading]Section A ,[pause] Show this section.
         * https://accessibility.blog.gov.uk/2017/12/18/what-working-on-gov-uk-navigation-taught-us-about-accessibility/
         */
        $button.setAttribute("aria-label", ariaLabelParts.join(" , "));

        // Swap icon, change class
        if (expanded) {
            $content.removeAttribute("hidden");
            $section.classList.add(this.sectionExpandedClass);
            $showHideIcon.classList.remove(this.downChevronIconClass);
        } else {
            $content.setAttribute("hidden", "until-found");
            $section.classList.remove(this.sectionExpandedClass);
            $showHideIcon.classList.add(this.downChevronIconClass);
        }

        // See if "Show all sections" button text should be updated
        const areAllSectionsOpen = this.checkIfAllSectionsOpen();
        this.updateShowAllButton(areAllSectionsOpen);
    };

    /**
     * Get state of section
     *
     * @param {HTMLElement} $section - Section element
     * @returns {boolean} True if expanded
     */
    Accordion.prototype.isExpanded = function ($section) {
        return $section.classList.contains(this.sectionExpandedClass);
    };

    /**
     * Check if all sections are open
     *
     * @returns {boolean} True if all sections are open
     */
    Accordion.prototype.checkIfAllSectionsOpen = function () {
        // Get a count of all the Accordion sections
        const sectionsCount = this.$sections.length;
        // Get a count of all Accordion sections that are expanded
        const expandedSectionCount = this.$module.querySelectorAll(`.${this.sectionExpandedClass}`).length;
        const areAllSectionsOpen = sectionsCount === expandedSectionCount;

        return areAllSectionsOpen;
    };

    /**
     * Update "Show all sections" button
     *
     * @param {boolean} expanded - Section expanded
     */
    Accordion.prototype.updateShowAllButton = function (expanded) {
        const newButtonText = expanded ? this.i18n.t("hideAllSections") : this.i18n.t("showAllSections");

        this.$showAllButton.setAttribute("aria-expanded", expanded);
        this.$showAllText.innerText = newButtonText;

        // Swap icon, toggle class
        if (expanded) {
            this.$showAllIcon.classList.remove(this.downChevronIconClass);
        } else {
            this.$showAllIcon.classList.add(this.downChevronIconClass);
        }
    };

    const helper = {
        /**
         * Check for `window.sessionStorage`, and that it actually works.
         *
         * @returns {boolean} True if session storage is available
         */
        checkForSessionStorage: () => {
            const testString = "this is the test string";
            let result;
            try {
                window.sessionStorage.setItem(testString, testString);
                result = window.sessionStorage.getItem(testString) === testString.toString();
                window.sessionStorage.removeItem(testString);
                return result;
            } catch (_exception) {
                return false;
            }
        },
    };

    /**
     * Set the state of the accordions in sessionStorage
     *
     * @param {HTMLElement} $section - Section element
     */
    Accordion.prototype.storeState = function ($section) {
        if (this.browserSupportsSessionStorage) {
            // We need a unique way of identifying each content in the Accordion. Since
            // an `#id` should be unique and an `id` is required for `aria-` attributes
            // `id` can be safely used.
            const $button = $section.querySelector(`.${this.sectionButtonClass}`);

            if ($button) {
                const contentId = $button.getAttribute("aria-controls");
                const contentState = $button.getAttribute("aria-expanded");

                // Only set the state when both `contentId` and `contentState` are taken from the DOM.
                if (contentId && contentState) {
                    window.sessionStorage.setItem(contentId, contentState);
                }
            }
        }
    };

    /**
     * Read the state of the accordions from sessionStorage
     *
     * @param {HTMLElement} $section - Section element
     */
    Accordion.prototype.setInitialState = function ($section) {
        if (this.browserSupportsSessionStorage) {
            const $button = $section.querySelector(`.${this.sectionButtonClass}`);

            if ($button) {
                const contentId = $button.getAttribute("aria-controls");
                const contentState = contentId ? window.sessionStorage.getItem(contentId) : null;

                if (contentState !== null) {
                    this.setExpanded(contentState === "true", $section);
                }
            }
        }
    };

    /**
     * Create an element to improve semantics of the section button with punctuation
     *
     * Adding punctuation to the button can also improve its general semantics by dividing its contents
     * into thematic chunks.
     * See https://github.com/alphagov/govuk-frontend/issues/2327#issuecomment-922957442
     *
     * @returns {HTMLElement} DOM element
     */
    Accordion.prototype.getButtonPunctuationEl = function () {
        const $punctuationEl = document.createElement("span");
        $punctuationEl.classList.add("govuk-visually-hidden", this.sectionHeadingDividerClass);
        $punctuationEl.innerHTML = ", ";
        return $punctuationEl;
    };

    /**
     * Accordion config
     *
     * @typedef {object} AccordionConfig
     * @property {AccordionTranslations} [i18n = ACCORDION_TRANSLATIONS] - See constant {@link ACCORDION_TRANSLATIONS}
     */

    /**
     * Accordion translations
     *
     * @typedef {object} AccordionTranslations
     *
     * Messages used by the component for the labels of its buttons. This includes
     * the visible text shown on screen, and text to help assistive technology users
     * for the buttons toggling each section.
     * @property {string} [hideAllSections] - The text content for the 'Hide all
     * sections' button, used when at least one section is expanded.
     * @property {string} [hideSection] - The text content for the 'Hide'
     * button, used when a section is expanded.
     * @property {string} [hideSectionAriaLabel] - The text content appended to the
     * 'Hide' button's accessible name when a section is expanded.
     * @property {string} [showAllSections] - The text content for the 'Show all
     * sections' button, used when all sections are collapsed.
     * @property {string} [showSection] - The text content for the 'Show'
     * button, used when a section is collapsed.
     * @property {string} [showSectionAriaLabel] - The text content appended to the
     * 'Show' button's accessible name when a section is expanded.
     */

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    const KEY_SPACE = 32;
    const DEBOUNCE_TIMEOUT_IN_SECONDS = 1;

    /**
     * JavaScript enhancements for the Button component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for button
     * @param {ButtonConfig} [config] - Button config
     */
    function Button($module, config) {
        if (!$module) {
            return this;
        }

        this.$module = $module;
        this.debounceFormSubmitTimer = null;

        const defaultConfig = {
            preventDoubleClick: false,
        };
        this.config = mergeConfigs(defaultConfig, config || {}, normaliseDataset($module.dataset));
    }

    /**
     * Initialise component
     */
    Button.prototype.init = function () {
        if (!this.$module) {
            return;
        }

        this.$module.addEventListener("keydown", this.handleKeyDown);
        this.$module.addEventListener("click", this.debounce.bind(this));
    };

    /**
     * Trigger a click event when the space key is pressed
     *
     * Some screen readers tell users they can activate things with the 'button'
     * role, so we need to match the functionality of native HTML buttons
     *
     * See https://github.com/alphagov/govuk_elements/pull/272#issuecomment-233028270
     *
     * @param {KeyboardEvent} event - Keydown event
     */
    Button.prototype.handleKeyDown = (event) => {
        const $target = event.target;

        if ($target.getAttribute("role") === "button" && event.keyCode === KEY_SPACE) {
            event.preventDefault(); // prevent the page from scrolling
            $target.click();
        }
    };

    /**
     * Debounce double-clicks
     *
     * If the click quickly succeeds a previous click then nothing will happen. This
     * stops people accidentally causing multiple form submissions by double
     * clicking buttons.
     *
     * @param {MouseEvent} event - Mouse click event
     * @returns {undefined | false} Returns undefined, or false when debounced
     */
    Button.prototype.debounce = function (event) {
        // Check the button that was clicked has preventDoubleClick enabled
        if (!this.config.preventDoubleClick) {
            return;
        }

        // If the timer is still running, prevent the click from submitting the form
        if (this.debounceFormSubmitTimer) {
            event.preventDefault();
            return false;
        }

        this.debounceFormSubmitTimer = setTimeout(
            function () {
                this.debounceFormSubmitTimer = null;
            }.bind(this),
            DEBOUNCE_TIMEOUT_IN_SECONDS * 1000,
        );
    };

    /**
     * Button config
     *
     * @typedef {object} ButtonConfig
     * @property {boolean} [preventDoubleClick = false] -
     *  Prevent accidental double clicks on submit buttons from submitting forms
     *  multiple times.
     */

    /**
     * Returns the value of the given attribute closest to the given element (including itself)
     *
     * @param {HTMLElement} $element - The element to start walking the DOM tree up
     * @param {string} attributeName - The name of the attribute
     * @returns {string | undefined} Attribute value
     */
    function closestAttributeValue($element, attributeName) {
        const closestElementWithAttribute = $element.closest(`[${attributeName}]`);
        if (closestElementWithAttribute) {
            return closestElementWithAttribute.getAttribute(attributeName);
        }
    }

    ((_undefined) => {
        // Detection from https://github.com/Financial-Times/polyfill-library/blob/v3.111.0/polyfills/Date/now/detect.js
        const detect = "Date" in self && "now" in self.Date && "getTime" in self.Date.prototype;

        if (detect) return;

        // Polyfill from https://polyfill.io/v3/polyfill.js?version=3.111.0&features=Date.now&flags=always
        Date.now = () => new Date().getTime();
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    /* eslint-disable es-x/no-date-now -- Polyfill imported */

    /**
     * @constant
     * @type {CharacterCountTranslations}
     * @see Default value for {@link CharacterCountConfig.i18n}
     * @default
     */
    const CHARACTER_COUNT_TRANSLATIONS = {
        // Characters
        charactersUnderLimit: {
            one: "You have %{count} character remaining",
            other: "You have %{count} characters remaining",
        },
        charactersAtLimit: "You have 0 characters remaining",
        charactersOverLimit: {
            one: "You have %{count} character too many",
            other: "You have %{count} characters too many",
        },
        // Words
        wordsUnderLimit: {
            one: "You have %{count} word remaining",
            other: "You have %{count} words remaining",
        },
        wordsAtLimit: "You have 0 words remaining",
        wordsOverLimit: {
            one: "You have %{count} word too many",
            other: "You have %{count} words too many",
        },
        textareaDescription: {
            other: "",
        },
    };

    /**
     * JavaScript enhancements for the CharacterCount component
     *
     * Tracks the number of characters or words in the `.govuk-js-character-count`
     * `<textarea>` inside the element. Displays a message with the remaining number
     * of characters/words available, or the number of characters/words in excess.
     *
     * You can configure the message to only appear after a certain percentage
     * of the available characters/words has been entered.
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for character count
     * @param {CharacterCountConfig} [config] - Character count config
     */
    function CharacterCount($module, config) {
        if (!$module) {
            return this;
        }

        const defaultConfig = {
            threshold: 0,
            i18n: CHARACTER_COUNT_TRANSLATIONS,
        };

        // Read config set using dataset ('data-' values)
        const datasetConfig = normaliseDataset($module.dataset);

        // To ensure data-attributes take complete precedence, even if they change the
        // type of count, we need to reset the `maxlength` and `maxwords` from the
        // JavaScript config.
        //
        // We can't mutate `config`, though, as it may be shared across multiple
        // components inside `initAll`.
        let configOverrides = {};
        if ("maxwords" in datasetConfig || "maxlength" in datasetConfig) {
            configOverrides = {
                maxlength: false,
                maxwords: false,
            };
        }

        this.config = mergeConfigs(defaultConfig, config || {}, configOverrides, datasetConfig);

        this.i18n = new I18n(extractConfigByNamespace(this.config, "i18n"), {
            // Read the fallback if necessary rather than have it set in the defaults
            locale: closestAttributeValue($module, "lang"),
        });

        // Determine the limit attribute (characters or words)
        if (this.config.maxwords) {
            this.maxLength = this.config.maxwords;
        } else if (this.config.maxlength) {
            this.maxLength = this.config.maxlength;
        } else {
            return;
        }

        this.$module = $module;
        this.$textarea = $module.querySelector(".govuk-js-character-count");
        this.$visibleCountMessage = null;
        this.$screenReaderCountMessage = null;
        this.lastInputTimestamp = null;
    }

    /**
     * Initialise component
     */
    CharacterCount.prototype.init = function () {
        // Check that required elements are present
        if (!this.$textarea) {
            return;
        }

        const $textarea = this.$textarea;
        const $textareaDescription = document.getElementById(`${$textarea.id}-info`);

        // Inject a decription for the textarea if none is present already
        // for when the component was rendered with no maxlength, maxwords
        // nor custom textareaDescriptionText
        if ($textareaDescription.innerText.match(/^\s*$/)) {
            $textareaDescription.innerText = this.i18n.t("textareaDescription", { count: this.maxLength });
        }

        // Move the textarea description to be immediately after the textarea
        // Kept for backwards compatibility
        $textarea.insertAdjacentElement("afterend", $textareaDescription);

        // Create the *screen reader* specific live-updating counter
        // This doesn't need any styling classes, as it is never visible
        const $screenReaderCountMessage = document.createElement("div");
        $screenReaderCountMessage.className = "govuk-character-count__sr-status govuk-visually-hidden";
        $screenReaderCountMessage.setAttribute("aria-live", "polite");
        this.$screenReaderCountMessage = $screenReaderCountMessage;
        $textareaDescription.insertAdjacentElement("afterend", $screenReaderCountMessage);

        // Create our live-updating counter element, copying the classes from the
        // textarea description for backwards compatibility as these may have been
        // configured
        const $visibleCountMessage = document.createElement("div");
        $visibleCountMessage.className = $textareaDescription.className;
        $visibleCountMessage.classList.add("govuk-character-count__status");
        $visibleCountMessage.setAttribute("aria-hidden", "true");
        this.$visibleCountMessage = $visibleCountMessage;
        $textareaDescription.insertAdjacentElement("afterend", $visibleCountMessage);

        // Hide the textarea description
        $textareaDescription.classList.add("govuk-visually-hidden");

        // Remove hard limit if set
        $textarea.removeAttribute("maxlength");

        this.bindChangeEvents();

        // When the page is restored after navigating 'back' in some browsers the
        // state of the character count is not restored until *after* the
        // DOMContentLoaded event is fired, so we need to manually update it after the
        // pageshow event in browsers that support it.
        if ("onpageshow" in window) {
            window.addEventListener("pageshow", this.updateCountMessage.bind(this));
        } else {
            window.addEventListener("DOMContentLoaded", this.updateCountMessage.bind(this));
        }
        this.updateCountMessage();
    };

    /**
     * Bind change events
     *
     * Set up event listeners on the $textarea so that the count messages update
     * when the user types.
     */
    CharacterCount.prototype.bindChangeEvents = function () {
        const $textarea = this.$textarea;
        $textarea.addEventListener("keyup", this.handleKeyUp.bind(this));

        // Bind focus/blur events to start/stop polling
        $textarea.addEventListener("focus", this.handleFocus.bind(this));
        $textarea.addEventListener("blur", this.handleBlur.bind(this));
    };

    /**
     * Handle key up event
     *
     * Update the visible character counter and keep track of when the last update
     * happened for each keypress
     */
    CharacterCount.prototype.handleKeyUp = function () {
        this.updateVisibleCountMessage();
        this.lastInputTimestamp = Date.now();
    };

    /**
     * Handle focus event
     *
     * Speech recognition software such as Dragon NaturallySpeaking will modify the
     * fields by directly changing its `value`. These changes don't trigger events
     * in JavaScript, so we need to poll to handle when and if they occur.
     *
     * Once the keyup event hasn't been detected for at least 1000 ms (1s), check if
     * the textarea value has changed and update the count message if it has.
     *
     * This is so that the update triggered by the manual comparison doesn't
     * conflict with debounced KeyboardEvent updates.
     */
    CharacterCount.prototype.handleFocus = function () {
        this.valueChecker = setInterval(
            function () {
                if (!this.lastInputTimestamp || Date.now() - 500 >= this.lastInputTimestamp) {
                    this.updateIfValueChanged();
                }
            }.bind(this),
            1000,
        );
    };

    /**
     * Handle blur event
     *
     * Stop checking the textarea value once the textarea no longer has focus
     */
    CharacterCount.prototype.handleBlur = function () {
        // Cancel value checking on blur
        clearInterval(this.valueChecker);
    };

    /**
     * Update count message if textarea value has changed
     */
    CharacterCount.prototype.updateIfValueChanged = function () {
        if (!this.$textarea.oldValue) this.$textarea.oldValue = "";
        if (this.$textarea.value !== this.$textarea.oldValue) {
            this.$textarea.oldValue = this.$textarea.value;
            this.updateCountMessage();
        }
    };

    /**
     * Update count message
     *
     * Helper function to update both the visible and screen reader-specific
     * counters simultaneously (e.g. on init)
     */
    CharacterCount.prototype.updateCountMessage = function () {
        this.updateVisibleCountMessage();
        this.updateScreenReaderCountMessage();
    };

    /**
     * Update visible count message
     */
    CharacterCount.prototype.updateVisibleCountMessage = function () {
        const $textarea = this.$textarea;
        const $visibleCountMessage = this.$visibleCountMessage;
        const remainingNumber = this.maxLength - this.count($textarea.value);

        // If input is over the threshold, remove the disabled class which renders the
        // counter invisible.
        if (this.isOverThreshold()) {
            $visibleCountMessage.classList.remove("govuk-character-count__message--disabled");
        } else {
            $visibleCountMessage.classList.add("govuk-character-count__message--disabled");
        }

        // Update styles
        if (remainingNumber < 0) {
            $textarea.classList.add("govuk-textarea--error");
            $visibleCountMessage.classList.remove("govuk-hint");
            $visibleCountMessage.classList.add("govuk-error-message");
        } else {
            $textarea.classList.remove("govuk-textarea--error");
            $visibleCountMessage.classList.remove("govuk-error-message");
            $visibleCountMessage.classList.add("govuk-hint");
        }

        // Update message
        $visibleCountMessage.innerText = this.getCountMessage();
    };

    /**
     * Update screen reader count message
     */
    CharacterCount.prototype.updateScreenReaderCountMessage = function () {
        const $screenReaderCountMessage = this.$screenReaderCountMessage;

        // If over the threshold, remove the aria-hidden attribute, allowing screen
        // readers to announce the content of the element.
        if (this.isOverThreshold()) {
            $screenReaderCountMessage.removeAttribute("aria-hidden");
        } else {
            $screenReaderCountMessage.setAttribute("aria-hidden", true);
        }

        // Update message
        $screenReaderCountMessage.innerText = this.getCountMessage();
    };

    /**
     * Count the number of characters (or words, if `config.maxwords` is set)
     * in the given text
     *
     * @param {string} text - The text to count the characters of
     * @returns {number} the number of characters (or words) in the text
     */
    CharacterCount.prototype.count = function (text) {
        if (this.config.maxwords) {
            const tokens = text.match(/\S+/g) || []; // Matches consecutive non-whitespace chars
            return tokens.length;
        }
        return text.length;
    };

    /**
     * Get count message
     *
     * @returns {string} Status message
     */
    CharacterCount.prototype.getCountMessage = function () {
        const remainingNumber = this.maxLength - this.count(this.$textarea.value);

        const countType = this.config.maxwords ? "words" : "characters";
        return this.formatCountMessage(remainingNumber, countType);
    };

    /**
     * Formats the message shown to users according to what's counted
     * and how many remain
     *
     * @param {number} remainingNumber - The number of words/characaters remaining
     * @param {string} countType - "words" or "characters"
     * @returns {string} Status message
     */
    CharacterCount.prototype.formatCountMessage = function (remainingNumber, countType) {
        if (remainingNumber === 0) {
            return this.i18n.t(`${countType}AtLimit`);
        }

        const translationKeySuffix = remainingNumber < 0 ? "OverLimit" : "UnderLimit";

        return this.i18n.t(countType + translationKeySuffix, { count: Math.abs(remainingNumber) });
    };

    /**
     * Check if count is over threshold
     *
     * Checks whether the value is over the configured threshold for the input.
     * If there is no configured threshold, it is set to 0 and this function will
     * always return true.
     *
     * @returns {boolean} true if the current count is over the config.threshold
     *   (or no threshold is set)
     */
    CharacterCount.prototype.isOverThreshold = function () {
        // No threshold means we're always above threshold so save some computation
        if (!this.config.threshold) {
            return true;
        }

        const $textarea = this.$textarea;

        // Determine the remaining number of characters/words
        const currentLength = this.count($textarea.value);
        const maxLength = this.maxLength;

        const thresholdValue = (maxLength * this.config.threshold) / 100;

        return thresholdValue <= currentLength;
    };

    /**
     * Character count config
     *
     * @typedef {CharacterCountConfigWithMaxLength | CharacterCountConfigWithMaxWords} CharacterCountConfig
     */

    /**
     * Character count config (with maximum number of characters)
     *
     * @typedef {object} CharacterCountConfigWithMaxLength
     * @property {number} [maxlength] - The maximum number of characters.
     *  If maxwords is provided, the maxlength option will be ignored.
     * @property {number} [threshold = 0] - The percentage value of the limit at
     *  which point the count message is displayed. If this attribute is set, the
     *  count message will be hidden by default.
     * @property {CharacterCountTranslations} [i18n = CHARACTER_COUNT_TRANSLATIONS] - See constant {@link CHARACTER_COUNT_TRANSLATIONS}
     */

    /**
     * Character count config (with maximum number of words)
     *
     * @typedef {object} CharacterCountConfigWithMaxWords
     * @property {number} [maxwords] - The maximum number of words. If maxwords is
     *  provided, the maxlength option will be ignored.
     * @property {number} [threshold = 0] - The percentage value of the limit at
     *  which point the count message is displayed. If this attribute is set, the
     *  count message will be hidden by default.
     * @property {CharacterCountTranslations} [i18n = CHARACTER_COUNT_TRANSLATIONS] - See constant {@link CHARACTER_COUNT_TRANSLATIONS}
     */

    /**
     * Character count translations
     *
     * @typedef {object} CharacterCountTranslations
     *
     * Messages shown to users as they type. It provides feedback on how many words
     * or characters they have remaining or if they are over the limit. This also
     * includes a message used as an accessible description for the textarea.
     * @property {TranslationPluralForms} [charactersUnderLimit] - Message displayed
     *   when the number of characters is under the configured maximum, `maxlength`.
     *   This message is displayed visually and through assistive technologies. The
     *   component will replace the `%{count}` placeholder with the number of
     *   remaining characters. This is a [pluralised list of
     *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
     * @property {string} [charactersAtLimit] - Message displayed when the number of
     *   characters reaches the configured maximum, `maxlength`. This message is
     *   displayed visually and through assistive technologies.
     * @property {TranslationPluralForms} [charactersOverLimit] - Message displayed
     *   when the number of characters is over the configured maximum, `maxlength`.
     *   This message is displayed visually and through assistive technologies. The
     *   component will replace the `%{count}` placeholder with the number of
     *   remaining characters. This is a [pluralised list of
     *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
     * @property {TranslationPluralForms} [wordsUnderLimit] - Message displayed when
     *   the number of words is under the configured maximum, `maxlength`. This
     *   message is displayed visually and through assistive technologies. The
     *   component will replace the `%{count}` placeholder with the number of
     *   remaining words. This is a [pluralised list of
     *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
     * @property {string} [wordsAtLimit] - Message displayed when the number of
     *   words reaches the configured maximum, `maxlength`. This message is
     *   displayed visually and through assistive technologies.
     * @property {TranslationPluralForms} [wordsOverLimit] - Message displayed when
     *   the number of words is over the configured maximum, `maxlength`. This
     *   message is displayed visually and through assistive technologies. The
     *   component will replace the `%{count}` placeholder with the number of
     *   remaining words. This is a [pluralised list of
     *   messages](https://frontend.design-system.service.gov.uk/localise-govuk-frontend).
     * @property {TranslationPluralForms} [textareaDescription] - Message made
     *   available to assistive technologies, if none is already present in the
     *   HTML, to describe that the component accepts only a limited amount of
     *   content. It is visible on the page when JavaScript is unavailable. The
     *   component will replace the `%{count}` placeholder with the value of the
     *   `maxlength` or `maxwords` parameter.
     */

    /**
     * @typedef {import('../../i18n.mjs').TranslationPluralForms} TranslationPluralForms
     */

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * Checkboxes component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for checkboxes
     */
    function Checkboxes($module) {
        this.$module = $module;
        this.$inputs = $module.querySelectorAll('input[type="checkbox"]');
    }

    /**
     * Initialise component
     *
     * Checkboxes can be associated with a 'conditionally revealed' content block –
     * for example, a checkbox for 'Phone' could reveal an additional form field for
     * the user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which is
     * promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page (for
     * example if the user has navigated back), and set up event handlers to keep
     * the reveal in sync with the checkbox state.
     */
    Checkboxes.prototype.init = function () {
        const $module = this.$module;
        const $inputs = this.$inputs;

        nodeListForEach($inputs, ($input) => {
            const targetId = $input.getAttribute("data-aria-controls");

            // Skip checkboxes without data-aria-controls attributes, or where the
            // target element does not exist.
            if (!targetId || !document.getElementById(targetId)) {
                return;
            }

            // Promote the data-aria-controls attribute to a aria-controls attribute
            // so that the relationship is exposed in the AOM
            $input.setAttribute("aria-controls", targetId);
            $input.removeAttribute("data-aria-controls");
        });

        // When the page is restored after navigating 'back' in some browsers the
        // state of form controls is not restored until *after* the DOMContentLoaded
        // event is fired, so we need to sync after the pageshow event in browsers
        // that support it.
        if ("onpageshow" in window) {
            window.addEventListener("pageshow", this.syncAllConditionalReveals.bind(this));
        } else {
            window.addEventListener("DOMContentLoaded", this.syncAllConditionalReveals.bind(this));
        }

        // Although we've set up handlers to sync state on the pageshow or
        // DOMContentLoaded event, init could be called after those events have fired,
        // for example if they are added to the page dynamically, so sync now too.
        this.syncAllConditionalReveals();

        // Handle events
        $module.addEventListener("click", this.handleClick.bind(this));
    };

    /**
     * Sync the conditional reveal states for all checkboxes in this $module.
     */
    Checkboxes.prototype.syncAllConditionalReveals = function () {
        nodeListForEach(this.$inputs, this.syncConditionalRevealWithInputState.bind(this));
    };

    /**
     * Sync conditional reveal with the input state
     *
     * Synchronise the visibility of the conditional reveal, and its accessible
     * state, with the input's checked state.
     *
     * @param {HTMLInputElement} $input - Checkbox input
     */
    Checkboxes.prototype.syncConditionalRevealWithInputState = ($input) => {
        const $target = document.getElementById($input.getAttribute("aria-controls"));

        if ($target?.classList.contains("govuk-checkboxes__conditional")) {
            const inputIsChecked = $input.checked;

            $input.setAttribute("aria-expanded", inputIsChecked);
            $target.classList.toggle("govuk-checkboxes__conditional--hidden", !inputIsChecked);
        }
    };

    /**
     * Uncheck other checkboxes
     *
     * Find any other checkbox inputs with the same name value, and uncheck them.
     * This is useful for when a “None of these" checkbox is checked.
     *
     * @param {HTMLElement} $input - Checkbox input
     */
    Checkboxes.prototype.unCheckAllInputsExcept = function ($input) {
        const allInputsWithSameName = document.querySelectorAll(`input[type="checkbox"][name="${$input.name}"]`);

        nodeListForEach(
            allInputsWithSameName,
            function ($inputWithSameName) {
                const hasSameFormOwner = $input.form === $inputWithSameName.form;
                if (hasSameFormOwner && $inputWithSameName !== $input) {
                    $inputWithSameName.checked = false;
                    this.syncConditionalRevealWithInputState($inputWithSameName);
                }
            }.bind(this),
        );
    };

    /**
     * Uncheck exclusive checkboxes
     *
     * Find any checkbox inputs with the same name value and the 'exclusive' behaviour,
     * and uncheck them. This helps prevent someone checking both a regular checkbox and a
     * "None of these" checkbox in the same fieldset.
     *
     * @param {HTMLInputElement} $input - Checkbox input
     */
    Checkboxes.prototype.unCheckExclusiveInputs = function ($input) {
        const allInputsWithSameNameAndExclusiveBehaviour = document.querySelectorAll(
            `input[data-behaviour="exclusive"][type="checkbox"][name="${$input.name}"]`,
        );

        nodeListForEach(
            allInputsWithSameNameAndExclusiveBehaviour,
            function ($exclusiveInput) {
                const hasSameFormOwner = $input.form === $exclusiveInput.form;
                if (hasSameFormOwner) {
                    $exclusiveInput.checked = false;
                    this.syncConditionalRevealWithInputState($exclusiveInput);
                }
            }.bind(this),
        );
    };

    /**
     * Click event handler
     *
     * Handle a click within the $module – if the click occurred on a checkbox, sync
     * the state of any associated conditional reveal with the checkbox state.
     *
     * @param {MouseEvent} event - Click event
     */
    Checkboxes.prototype.handleClick = function (event) {
        const $clickedInput = event.target;

        // Ignore clicks on things that aren't checkbox inputs
        if ($clickedInput.type !== "checkbox") {
            return;
        }

        // If the checkbox conditionally-reveals some content, sync the state
        const hasAriaControls = $clickedInput.getAttribute("aria-controls");
        if (hasAriaControls) {
            this.syncConditionalRevealWithInputState($clickedInput);
        }

        // No further behaviour needed for unchecking
        if (!$clickedInput.checked) {
            return;
        }

        // Handle 'exclusive' checkbox behaviour (ie "None of these")
        const hasBehaviourExclusive = $clickedInput.getAttribute("data-behaviour") === "exclusive";
        if (hasBehaviourExclusive) {
            this.unCheckAllInputsExcept($clickedInput);
        } else {
            this.unCheckExclusiveInputs($clickedInput);
        }
    };

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    const KEY_ENTER = 13;
    const KEY_SPACE$1 = 32;

    /**
     * Details component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for details
     */
    function Details($module) {
        this.$module = $module;
    }

    /**
     * Initialise component
     */
    Details.prototype.init = function () {
        if (!this.$module) {
            return;
        }

        // If there is native details support, we want to avoid running code to polyfill native behaviour.
        const hasNativeDetails = typeof this.$module.open === "boolean";

        if (hasNativeDetails) {
            return;
        }

        this.polyfillDetails();
    };

    /**
     * Polyfill component in older browsers
     */
    Details.prototype.polyfillDetails = function () {
        const $module = this.$module;

        // Save shortcuts to the inner summary and content elements
        const $summary = (this.$summary = $module.getElementsByTagName("summary").item(0));
        const $content = (this.$content = $module.getElementsByTagName("div").item(0));

        // If <details> doesn't have a <summary> and a <div> representing the content
        // it means the required HTML structure is not met so the script will stop
        if (!$summary || !$content) {
            return;
        }

        // If the content doesn't have an ID, assign it one now
        // which we'll need for the summary's aria-controls assignment
        if (!$content.id) {
            $content.id = `details-content-${generateUniqueID()}`;
        }

        // Add ARIA role="group" to details
        $module.setAttribute("role", "group");

        // Add role=button to summary
        $summary.setAttribute("role", "button");

        // Add aria-controls
        $summary.setAttribute("aria-controls", $content.id);

        // Set tabIndex so the summary is keyboard accessible for non-native elements
        //
        // We have to use the camelcase `tabIndex` property as there is a bug in IE6/IE7 when we set the correct attribute lowercase:
        // See http://web.archive.org/web/20170120194036/http://www.saliences.com/browserBugs/tabIndex.html for more information.
        $summary.tabIndex = 0;

        // Detect initial open state
        if (this.$module.hasAttribute("open")) {
            $summary.setAttribute("aria-expanded", "true");
        } else {
            $summary.setAttribute("aria-expanded", "false");
            $content.style.display = "none";
        }

        // Bind an event to handle summary elements
        this.polyfillHandleInputs(this.polyfillSetAttributes.bind(this));
    };

    /**
     * Define a statechange function that updates aria-expanded and style.display
     *
     * @returns {boolean} Returns true
     */
    Details.prototype.polyfillSetAttributes = function () {
        if (this.$module.hasAttribute("open")) {
            this.$module.removeAttribute("open");
            this.$summary.setAttribute("aria-expanded", "false");
            this.$content.style.display = "none";
        } else {
            this.$module.setAttribute("open", "open");
            this.$summary.setAttribute("aria-expanded", "true");
            this.$content.style.display = "";
        }

        return true;
    };

    /**
     * Handle cross-modal click events
     *
     * @param {polyfillHandleInputsCallback} callback - function
     */
    Details.prototype.polyfillHandleInputs = function (callback) {
        this.$summary.addEventListener("keypress", (event) => {
            const $target = event.target;
            // When the key gets pressed - check if it is enter or space
            if (event.keyCode === KEY_ENTER || event.keyCode === KEY_SPACE$1) {
                if ($target.nodeName.toLowerCase() === "summary") {
                    // Prevent space from scrolling the page
                    // and enter from submitting a form
                    event.preventDefault();
                    // Click to let the click event do all the necessary action
                    if ($target.click) {
                        $target.click();
                    } else {
                        // except Safari 5.1 and under don't support .click() here
                        callback(event);
                    }
                }
            }
        });

        // Prevent keyup to prevent clicking twice in Firefox when using space key
        this.$summary.addEventListener("keyup", (event) => {
            const $target = event.target;
            if (event.keyCode === KEY_SPACE$1) {
                if ($target.nodeName.toLowerCase() === "summary") {
                    event.preventDefault();
                }
            }
        });

        this.$summary.addEventListener("click", callback);
    };

    /**
     * @callback polyfillHandleInputsCallback
     * @param {UIEvent} event - Keyboard or mouse event
     * @returns {void}
     */

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * JavaScript enhancements for the ErrorSummary
     *
     * Takes focus on initialisation for accessible announcement, unless disabled in configuration.
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for error summary
     * @param {ErrorSummaryConfig} [config] - Error summary config
     */
    function ErrorSummary($module, config) {
        // Some consuming code may not be passing a module,
        // for example if they initialise the component
        // on their own by directly passing the result
        // of `document.querySelector`.
        // To avoid breaking further JavaScript initialisation
        // we need to safeguard against this so things keep
        // working the same now we read the elements data attributes
        if (!$module) {
            // Little safety in case code gets ported as-is
            // into and ES6 class constructor, where the return value matters
            return this;
        }

        this.$module = $module;

        const defaultConfig = {
            disableAutoFocus: false,
        };
        this.config = mergeConfigs(defaultConfig, config || {}, normaliseDataset($module.dataset));
    }

    /**
     * Initialise component
     */
    ErrorSummary.prototype.init = function () {
        const $module = this.$module;
        if (!$module) {
            return;
        }

        this.setFocus();
        $module.addEventListener("click", this.handleClick.bind(this));
    };

    /**
     * Focus the error summary
     */
    ErrorSummary.prototype.setFocus = function () {
        const $module = this.$module;

        if (this.config.disableAutoFocus) {
            return;
        }

        // Set tabindex to -1 to make the element programmatically focusable, but
        // remove it on blur as the error summary doesn't need to be focused again.
        $module.setAttribute("tabindex", "-1");

        $module.addEventListener("blur", () => {
            $module.removeAttribute("tabindex");
        });

        $module.focus();
    };

    /**
     * Click event handler
     *
     * @param {MouseEvent} event - Click event
     */
    ErrorSummary.prototype.handleClick = function (event) {
        const $target = event.target;
        if (this.focusTarget($target)) {
            event.preventDefault();
        }
    };

    /**
     * Focus the target element
     *
     * By default, the browser will scroll the target into view. Because our labels
     * or legends appear above the input, this means the user will be presented with
     * an input without any context, as the label or legend will be off the top of
     * the screen.
     *
     * Manually handling the click event, scrolling the question into view and then
     * focussing the element solves this.
     *
     * This also results in the label and/or legend being announced correctly in
     * NVDA (as tested in 2018.3.2) - without this only the field type is announced
     * (e.g. "Edit, has autocomplete").
     *
     * @param {EventTarget} $target - Event target
     * @returns {boolean} True if the target was able to be focussed
     */
    ErrorSummary.prototype.focusTarget = function ($target) {
        // If the element that was clicked was not a link, return early
        if ($target.tagName !== "A" || $target.href === false) {
            return false;
        }

        const inputId = this.getFragmentFromUrl($target.href);
        const $input = document.getElementById(inputId);
        if (!$input) {
            return false;
        }

        const $legendOrLabel = this.getAssociatedLegendOrLabel($input);
        if (!$legendOrLabel) {
            return false;
        }

        // Scroll the legend or label into view *before* calling focus on the input to
        // avoid extra scrolling in browsers that don't support `preventScroll` (which
        // at time of writing is most of them...)
        $legendOrLabel.scrollIntoView();
        $input.focus({ preventScroll: true });

        return true;
    };

    /**
     * Get fragment from URL
     *
     * Extract the fragment (everything after the hash) from a URL, but not including
     * the hash.
     *
     * @param {string} url - URL
     * @returns {string} Fragment from URL, without the hash
     */
    ErrorSummary.prototype.getFragmentFromUrl = (url) => {
        if (url.indexOf("#") === -1) {
            return false;
        }

        return url.split("#").pop();
    };

    /**
     * Get associated legend or label
     *
     * Returns the first element that exists from this list:
     *
     * - The `<legend>` associated with the closest `<fieldset>` ancestor, as long
     *   as the top of it is no more than half a viewport height away from the
     *   bottom of the input
     * - The first `<label>` that is associated with the input using for="inputId"
     * - The closest parent `<label>`
     *
     * @param {HTMLElement} $input - The input
     * @returns {HTMLElement} Associated legend or label, or null if no associated
     *                        legend or label can be found
     */
    ErrorSummary.prototype.getAssociatedLegendOrLabel = ($input) => {
        const $fieldset = $input.closest("fieldset");

        if ($fieldset) {
            const $legends = $fieldset.getElementsByTagName("legend");

            if ($legends.length) {
                const $candidateLegend = $legends[0];

                // If the input type is radio or checkbox, always use the legend if there
                // is one.
                if ($input.type === "checkbox" || $input.type === "radio") {
                    return $candidateLegend;
                }

                // For other input types, only scroll to the fieldset’s legend (instead of
                // the label associated with the input) if the input would end up in the
                // top half of the screen.
                //
                // This should avoid situations where the input either ends up off the
                // screen, or obscured by a software keyboard.
                const legendTop = $candidateLegend.getBoundingClientRect().top;
                const inputRect = $input.getBoundingClientRect();

                // If the browser doesn't support Element.getBoundingClientRect().height
                // or window.innerHeight (like IE8), bail and just link to the label.
                if (inputRect.height && window.innerHeight) {
                    const inputBottom = inputRect.top + inputRect.height;

                    if (inputBottom - legendTop < window.innerHeight / 2) {
                        return $candidateLegend;
                    }
                }
            }
        }

        return document.querySelector(`label[for='${$input.getAttribute("id")}']`) || $input.closest("label");
    };

    /**
     * Error summary config
     *
     * @typedef {object} ErrorSummaryConfig
     * @property {boolean} [disableAutoFocus = false] -
     *  If set to `true` the error summary will not be focussed when the page loads.
     */

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * Header component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for header
     */
    function Header($module) {
        this.$module = $module;
        this.$menuButton = $module?.querySelector(".govuk-js-header-toggle");
        this.$menu = this.$menuButton && $module.querySelector(`#${this.$menuButton.getAttribute("aria-controls")}`);

        // Save the opened/closed state for the nav in memory so that we can
        // accurately maintain state when the screen is changed from small to
        // big and back to small
        this.menuIsOpen = false;

        // A global const for storing a matchMedia instance which we'll use to
        // detect when a screen size change happens. We set this later during the
        // init function and rely on it being null if the feature isn't available
        // to initially apply hidden attributes
        this.mql = null;
    }

    /**
     * Initialise component
     *
     * Check for the presence of the header, menu and menu button – if any are
     * missing then there's nothing to do so return early.
     * Feature sniff for and apply a matchMedia for desktop which will
     * trigger a state sync if the browser viewport moves between states. If
     * matchMedia isn't available, hide the menu button and present the "no js"
     * version of the menu to the user.
     */
    Header.prototype.init = function () {
        if (!this.$module || !this.$menuButton || !this.$menu) {
            return;
        }

        if ("matchMedia" in window) {
            // Set the matchMedia to the govuk-frontend desktop breakpoint
            this.mql = window.matchMedia("(min-width: 48.0625em)");

            if ("addEventListener" in this.mql) {
                this.mql.addEventListener("change", this.syncState.bind(this));
            } else {
                // addListener is a deprecated function, however addEventListener
                // isn't supported by IE or Safari. We therefore add this in as
                // a fallback for those browsers
                this.mql.addListener(this.syncState.bind(this));
            }

            this.syncState();
            this.$menuButton.addEventListener("click", this.handleMenuButtonClick.bind(this));
        } else {
            this.$menuButton.setAttribute("hidden", "");
        }
    };

    /**
     * Sync menu state
     *
     * Uses the global variable menuIsOpen to correctly set the accessible and
     * visual states of the menu and the menu button.
     * Additionally will force the menu to be visible and the menu button to be
     * hidden if the matchMedia is triggered to desktop.
     */
    Header.prototype.syncState = function () {
        if (this.mql.matches) {
            this.$menu.removeAttribute("hidden");
            this.$menuButton.setAttribute("hidden", "");
        } else {
            this.$menuButton.removeAttribute("hidden");
            this.$menuButton.setAttribute("aria-expanded", this.menuIsOpen);

            if (this.menuIsOpen) {
                this.$menu.removeAttribute("hidden");
            } else {
                this.$menu.setAttribute("hidden", "");
            }
        }
    };

    /**
     * Handle menu button click
     *
     * When the menu button is clicked, change the visibility of the menu and then
     * sync the accessibility state and menu button state
     */
    Header.prototype.handleMenuButtonClick = function () {
        this.menuIsOpen = !this.menuIsOpen;
        this.syncState();
    };

    /**
     * Notification Banner component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for notification banner
     * @param {NotificationBannerConfig} [config] - Notification banner config
     */
    function NotificationBanner($module, config) {
        this.$module = $module;

        const defaultConfig = {
            disableAutoFocus: false,
        };
        this.config = mergeConfigs(defaultConfig, config || {}, normaliseDataset($module.dataset));
    }

    /**
     * Initialise component
     */
    NotificationBanner.prototype.init = function () {
        const $module = this.$module;
        // Check for module
        if (!$module) {
            return;
        }

        this.setFocus();
    };

    /**
     * Focus the element
     *
     * If `role="alert"` is set, focus the element to help some assistive technologies
     * prioritise announcing it.
     *
     * You can turn off the auto-focus functionality by setting `data-disable-auto-focus="true"` in the
     * component HTML. You might wish to do this based on user research findings, or to avoid a clash
     * with another element which should be focused when the page loads.
     */
    NotificationBanner.prototype.setFocus = function () {
        const $module = this.$module;

        if (this.config.disableAutoFocus) {
            return;
        }

        if ($module.getAttribute("role") !== "alert") {
            return;
        }

        // Set tabindex to -1 to make the element focusable with JavaScript.
        // Remove the tabindex on blur as the component doesn't need to be focusable after the page has
        // loaded.
        if (!$module.getAttribute("tabindex")) {
            $module.setAttribute("tabindex", "-1");

            $module.addEventListener("blur", () => {
                $module.removeAttribute("tabindex");
            });
        }

        $module.focus();
    };

    /**
     * Notification banner config
     *
     * @typedef {object} NotificationBannerConfig
     * @property {boolean} [disableAutoFocus = false] -
     *   If set to `true` the notification banner will not be focussed when the page
     *   loads. This only applies if the component has a `role` of `alert` – in
     *   other cases the component will not be focused on page load, regardless of
     *   this option.
     */

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * Radios component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for radios
     */
    function Radios($module) {
        this.$module = $module;
        this.$inputs = $module.querySelectorAll('input[type="radio"]');
    }

    /**
     * Initialise component
     *
     * Radios can be associated with a 'conditionally revealed' content block – for
     * example, a radio for 'Phone' could reveal an additional form field for the
     * user to enter their phone number.
     *
     * These associations are made using a `data-aria-controls` attribute, which is
     * promoted to an aria-controls attribute during initialisation.
     *
     * We also need to restore the state of any conditional reveals on the page (for
     * example if the user has navigated back), and set up event handlers to keep
     * the reveal in sync with the radio state.
     */
    Radios.prototype.init = function () {
        const $module = this.$module;
        const $inputs = this.$inputs;

        nodeListForEach($inputs, ($input) => {
            const targetId = $input.getAttribute("data-aria-controls");

            // Skip radios without data-aria-controls attributes, or where the
            // target element does not exist.
            if (!targetId || !document.getElementById(targetId)) {
                return;
            }

            // Promote the data-aria-controls attribute to a aria-controls attribute
            // so that the relationship is exposed in the AOM
            $input.setAttribute("aria-controls", targetId);
            $input.removeAttribute("data-aria-controls");
        });

        // When the page is restored after navigating 'back' in some browsers the
        // state of form controls is not restored until *after* the DOMContentLoaded
        // event is fired, so we need to sync after the pageshow event in browsers
        // that support it.
        if ("onpageshow" in window) {
            window.addEventListener("pageshow", this.syncAllConditionalReveals.bind(this));
        } else {
            window.addEventListener("DOMContentLoaded", this.syncAllConditionalReveals.bind(this));
        }

        // Although we've set up handlers to sync state on the pageshow or
        // DOMContentLoaded event, init could be called after those events have fired,
        // for example if they are added to the page dynamically, so sync now too.
        this.syncAllConditionalReveals();

        // Handle events
        $module.addEventListener("click", this.handleClick.bind(this));
    };

    /**
     * Sync the conditional reveal states for all radio buttons in this $module.
     */
    Radios.prototype.syncAllConditionalReveals = function () {
        nodeListForEach(this.$inputs, this.syncConditionalRevealWithInputState.bind(this));
    };

    /**
     * Sync conditional reveal with the input state
     *
     * Synchronise the visibility of the conditional reveal, and its accessible
     * state, with the input's checked state.
     *
     * @param {HTMLInputElement} $input - Radio input
     */
    Radios.prototype.syncConditionalRevealWithInputState = ($input) => {
        const $target = document.getElementById($input.getAttribute("aria-controls"));

        if ($target?.classList.contains("govuk-radios__conditional")) {
            const inputIsChecked = $input.checked;

            $input.setAttribute("aria-expanded", inputIsChecked);
            $target.classList.toggle("govuk-radios__conditional--hidden", !inputIsChecked);
        }
    };

    /**
     * Click event handler
     *
     * Handle a click within the $module – if the click occurred on a radio, sync
     * the state of the conditional reveal for all radio buttons in the same form
     * with the same name (because checking one radio could have un-checked a radio
     * in another $module)
     *
     * @param {MouseEvent} event - Click event
     */
    Radios.prototype.handleClick = function (event) {
        const $clickedInput = event.target;

        // Ignore clicks on things that aren't radio buttons
        if ($clickedInput.type !== "radio") {
            return;
        }

        // We only need to consider radios with conditional reveals, which will have
        // aria-controls attributes.
        const $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');

        nodeListForEach(
            $allInputs,
            function ($input) {
                const hasSameFormOwner = $input.form === $clickedInput.form;
                const hasSameName = $input.name === $clickedInput.name;

                if (hasSameName && hasSameFormOwner) {
                    this.syncConditionalRevealWithInputState($input);
                }
            }.bind(this),
        );
    };

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * Skip link component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for skip link
     */
    function SkipLink($module) {
        this.$module = $module;
        this.$linkedElement = null;
        this.linkedElementListener = false;
    }

    /**
     * Initialise component
     */
    SkipLink.prototype.init = function () {
        // Check for module
        if (!this.$module) {
            return;
        }

        // Check for linked element
        this.$linkedElement = this.getLinkedElement();
        if (!this.$linkedElement) {
            return;
        }

        this.$module.addEventListener("click", this.focusLinkedElement.bind(this));
    };

    /**
     * Get linked element
     *
     * @returns {HTMLElement} $linkedElement - DOM element linked to from the skip link
     */
    SkipLink.prototype.getLinkedElement = function () {
        const linkedElementId = this.getFragmentFromUrl();

        if (!linkedElementId) {
            return false;
        }

        return document.getElementById(linkedElementId);
    };

    /**
     * Focus the linked element
     *
     * Set tabindex and helper CSS class. Set listener to remove them on blur.
     */
    SkipLink.prototype.focusLinkedElement = function () {
        const $linkedElement = this.$linkedElement;

        if (!$linkedElement.getAttribute("tabindex")) {
            // Set the element tabindex to -1 so it can be focused with JavaScript.
            $linkedElement.setAttribute("tabindex", "-1");
            $linkedElement.classList.add("govuk-skip-link-focused-element");

            // Add listener for blur on the focused element (unless the listener has previously been added)
            if (!this.linkedElementListener) {
                this.$linkedElement.addEventListener("blur", this.removeFocusProperties.bind(this));
                this.linkedElementListener = true;
            }
        }
        $linkedElement.focus();
    };

    /**
     * Remove the tabindex that makes the linked element focusable because the element only needs to be
     * focusable until it has received programmatic focus and a screen reader has announced it.
     *
     * Remove the CSS class that removes the native focus styles.
     */
    SkipLink.prototype.removeFocusProperties = function () {
        this.$linkedElement.removeAttribute("tabindex");
        this.$linkedElement.classList.remove("govuk-skip-link-focused-element");
    };

    /**
     * Get fragment from URL
     *
     * Extract the fragment (everything after the hash symbol) from a URL, but not including
     * the symbol.
     *
     * @returns {string} Fragment from URL, without the hash symbol
     */
    SkipLink.prototype.getFragmentFromUrl = function () {
        // Bail if the anchor link doesn't have a hash
        if (!this.$module.hash) {
            return false;
        }

        return this.$module.hash.split("#").pop();
    };

    (function (_undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-library/master/polyfills/Element/prototype/nextElementSibling/detect.js
        const detect = "document" in this && "nextElementSibling" in document.documentElement;

        if (detect) return;

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-library/master/polyfills/Element/prototype/nextElementSibling/polyfill.js
        Object.defineProperty(Element.prototype, "nextElementSibling", {
            get: function () {
                let el = this.nextSibling;
                while (el && el.nodeType !== 1) {
                    el = el.nextSibling;
                }
                return el;
            },
        });
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    (function (_undefined) {
        // Detection from https://raw.githubusercontent.com/Financial-Times/polyfill-library/master/polyfills/Element/prototype/previousElementSibling/detect.js
        const detect = "document" in this && "previousElementSibling" in document.documentElement;

        if (detect) return;

        // Polyfill from https://raw.githubusercontent.com/Financial-Times/polyfill-library/master/polyfills/Element/prototype/previousElementSibling/polyfill.js
        Object.defineProperty(Element.prototype, "previousElementSibling", {
            get: function () {
                let el = this.previousSibling;
                while (el && el.nodeType !== 1) {
                    el = el.previousSibling;
                }
                return el;
            },
        });
    }).call(
        ("object" === typeof window && window) ||
            ("object" === typeof self && self) ||
            ("object" === typeof global && global) ||
            {},
    );

    /* eslint-disable es-x/no-function-prototype-bind -- Polyfill imported */

    /**
     * Tabs component
     *
     * @class
     * @param {HTMLElement} $module - HTML element to use for tabs
     */
    function Tabs($module) {
        this.$module = $module;
        this.$tabs = $module.querySelectorAll(".govuk-tabs__tab");

        this.keys = { left: 37, right: 39, up: 38, down: 40 };
        this.jsHiddenClass = "govuk-tabs__panel--hidden";
    }

    /**
     * Initialise component
     */
    Tabs.prototype.init = function () {
        if (typeof window.matchMedia === "function") {
            this.setupResponsiveChecks();
        } else {
            this.setup();
        }
    };

    /**
     * Setup viewport resize check
     */
    Tabs.prototype.setupResponsiveChecks = function () {
        this.mql = window.matchMedia("(min-width: 40.0625em)");
        this.mql.addListener(this.checkMode.bind(this));
        this.checkMode();
    };

    /**
     * Setup or teardown handler for viewport resize check
     */
    Tabs.prototype.checkMode = function () {
        if (this.mql.matches) {
            this.setup();
        } else {
            this.teardown();
        }
    };

    /**
     * Setup tab component
     */
    Tabs.prototype.setup = function () {
        const $module = this.$module;
        const $tabs = this.$tabs;
        const $tabList = $module.querySelector(".govuk-tabs__list");
        const $tabListItems = $module.querySelectorAll(".govuk-tabs__list-item");

        if (!$tabs || !$tabList || !$tabListItems) {
            return;
        }

        $tabList.setAttribute("role", "tablist");

        nodeListForEach($tabListItems, ($item) => {
            $item.setAttribute("role", "presentation");
        });

        nodeListForEach(
            $tabs,
            function ($tab) {
                // Set HTML attributes
                this.setAttributes($tab);

                // Save bounded functions to use when removing event listeners during teardown
                $tab.boundTabClick = this.onTabClick.bind(this);
                $tab.boundTabKeydown = this.onTabKeydown.bind(this);

                // Handle events
                $tab.addEventListener("click", $tab.boundTabClick, true);
                $tab.addEventListener("keydown", $tab.boundTabKeydown, true);

                // Remove old active panels
                this.hideTab($tab);
            }.bind(this),
        );

        // Show either the active tab according to the URL's hash or the first tab
        const $activeTab = this.getTab(window.location.hash) || this.$tabs[0];
        this.showTab($activeTab);

        // Handle hashchange events
        $module.boundOnHashChange = this.onHashChange.bind(this);
        window.addEventListener("hashchange", $module.boundOnHashChange, true);
    };

    /**
     * Teardown tab component
     */
    Tabs.prototype.teardown = function () {
        const $module = this.$module;
        const $tabs = this.$tabs;
        const $tabList = $module.querySelector(".govuk-tabs__list");
        const $tabListItems = $module.querySelectorAll(".govuk-tabs__list-item");

        if (!$tabs || !$tabList || !$tabListItems) {
            return;
        }

        $tabList.removeAttribute("role");

        nodeListForEach($tabListItems, ($item) => {
            $item.removeAttribute("role", "presentation");
        });

        nodeListForEach(
            $tabs,
            function ($tab) {
                // Remove events
                $tab.removeEventListener("click", $tab.boundTabClick, true);
                $tab.removeEventListener("keydown", $tab.boundTabKeydown, true);

                // Unset HTML attributes
                this.unsetAttributes($tab);
            }.bind(this),
        );

        // Remove hashchange event handler
        window.removeEventListener("hashchange", $module.boundOnHashChange, true);
    };

    /**
     * Handle hashchange event
     *
     * @param {HashChangeEvent} event - Hash change event
     * @returns {void | undefined} Returns void, or undefined when prevented
     */
    Tabs.prototype.onHashChange = function (_event) {
        const hash = window.location.hash;
        const $tabWithHash = this.getTab(hash);
        if (!$tabWithHash) {
            return;
        }

        // Prevent changing the hash
        if (this.changingHash) {
            this.changingHash = false;
            return;
        }

        // Show either the active tab according to the URL's hash or the first tab
        const $previousTab = this.getCurrentTab();

        this.hideTab($previousTab);
        this.showTab($tabWithHash);
        $tabWithHash.focus();
    };

    /**
     * Hide panel for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.hideTab = function ($tab) {
        this.unhighlightTab($tab);
        this.hidePanel($tab);
    };

    /**
     * Show panel for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.showTab = function ($tab) {
        this.highlightTab($tab);
        this.showPanel($tab);
    };

    /**
     * Get tab link by hash
     *
     * @param {string} hash - Hash fragment including #
     * @returns {HTMLAnchorElement | null} Tab link
     */
    Tabs.prototype.getTab = function (hash) {
        return this.$module.querySelector(`.govuk-tabs__tab[href="${hash}"]`);
    };

    /**
     * Set tab link and panel attributes
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.setAttributes = function ($tab) {
        // set tab attributes
        const panelId = this.getHref($tab).slice(1);
        $tab.setAttribute("id", `tab_${panelId}`);
        $tab.setAttribute("role", "tab");
        $tab.setAttribute("aria-controls", panelId);
        $tab.setAttribute("aria-selected", "false");
        $tab.setAttribute("tabindex", "-1");

        // set panel attributes
        const $panel = this.getPanel($tab);
        $panel.setAttribute("role", "tabpanel");
        $panel.setAttribute("aria-labelledby", $tab.id);
        $panel.classList.add(this.jsHiddenClass);
    };

    /**
     * Unset tab link and panel attributes
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.unsetAttributes = function ($tab) {
        // unset tab attributes
        $tab.removeAttribute("id");
        $tab.removeAttribute("role");
        $tab.removeAttribute("aria-controls");
        $tab.removeAttribute("aria-selected");
        $tab.removeAttribute("tabindex");

        // unset panel attributes
        const $panel = this.getPanel($tab);
        $panel.removeAttribute("role");
        $panel.removeAttribute("aria-labelledby");
        $panel.classList.remove(this.jsHiddenClass);
    };

    /**
     * Handle tab link clicks
     *
     * @param {MouseEvent} event - Mouse click event
     * @returns {void | false} Returns void, or false within tab link
     */
    Tabs.prototype.onTabClick = function (event) {
        if (!event.target.classList.contains("govuk-tabs__tab")) {
            // Allow events on child DOM elements to bubble up to tab parent
            return false;
        }
        event.preventDefault();
        const $newTab = event.target;
        const $currentTab = this.getCurrentTab();
        this.hideTab($currentTab);
        this.showTab($newTab);
        this.createHistoryEntry($newTab);
    };

    /**
     * Update browser URL hash fragment for tab
     *
     * - Allows back/forward to navigate tabs
     * - Avoids page jump when hash changes
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.createHistoryEntry = function ($tab) {
        const $panel = this.getPanel($tab);

        // Save and restore the id
        // so the page doesn't jump when a user clicks a tab (which changes the hash)
        const panelId = $panel.id;
        $panel.id = "";
        this.changingHash = true;
        window.location.hash = this.getHref($tab).slice(1);
        $panel.id = panelId;
    };

    /**
     * Handle tab keydown event
     *
     * - Press right/down arrow for next tab
     * - Press left/up arrow for previous tab
     *
     * @param {KeyboardEvent} event - Keydown event
     */
    Tabs.prototype.onTabKeydown = function (event) {
        switch (event.keyCode) {
            case this.keys.left:
            case this.keys.up:
                this.activatePreviousTab();
                event.preventDefault();
                break;
            case this.keys.right:
            case this.keys.down:
                this.activateNextTab();
                event.preventDefault();
                break;
        }
    };

    /**
     * Activate next tab
     */
    Tabs.prototype.activateNextTab = function () {
        const $currentTab = this.getCurrentTab();
        if (!$currentTab) {
            return;
        }

        const $nextTabListItem = $currentTab.parentElement.nextElementSibling;
        if (!$nextTabListItem) {
            return;
        }

        const $nextTab = $nextTabListItem.querySelector(".govuk-tabs__tab");
        if ($nextTab) {
            this.hideTab($currentTab);
            this.showTab($nextTab);
            $nextTab.focus();
            this.createHistoryEntry($nextTab);
        }
    };

    /**
     * Activate previous tab
     */
    Tabs.prototype.activatePreviousTab = function () {
        const $currentTab = this.getCurrentTab();
        if (!$currentTab) {
            return;
        }

        const $previousTabListItem = $currentTab.parentElement.previousElementSibling;
        if (!$previousTabListItem) {
            return;
        }

        const $previousTab = $previousTabListItem.querySelector(".govuk-tabs__tab");
        if ($previousTab) {
            this.hideTab($currentTab);
            this.showTab($previousTab);
            $previousTab.focus();
            this.createHistoryEntry($previousTab);
        }
    };

    /**
     * Get tab panel for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     * @returns {HTMLDivElement} Tab panel
     */
    Tabs.prototype.getPanel = function ($tab) {
        const $panel = this.$module.querySelector(this.getHref($tab));
        return $panel;
    };

    /**
     * Show tab panel for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.showPanel = function ($tab) {
        const $panel = this.getPanel($tab);
        $panel.classList.remove(this.jsHiddenClass);
    };

    /**
     * Hide tab panel for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.hidePanel = function ($tab) {
        const $panel = this.getPanel($tab);
        $panel.classList.add(this.jsHiddenClass);
    };

    /**
     * Unset 'selected' state for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.unhighlightTab = ($tab) => {
        $tab.setAttribute("aria-selected", "false");
        $tab.parentNode.classList.remove("govuk-tabs__list-item--selected");
        $tab.setAttribute("tabindex", "-1");
    };

    /**
     * Set 'selected' state for tab link
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     */
    Tabs.prototype.highlightTab = ($tab) => {
        $tab.setAttribute("aria-selected", "true");
        $tab.parentNode.classList.add("govuk-tabs__list-item--selected");
        $tab.setAttribute("tabindex", "0");
    };

    /**
     * Get current tab link
     *
     * @returns {HTMLAnchorElement | undefined} Tab link
     */
    Tabs.prototype.getCurrentTab = function () {
        return this.$module.querySelector(".govuk-tabs__list-item--selected .govuk-tabs__tab");
    };

    /**
     * Get link hash fragment for href attribute
     *
     * this is because IE doesn't always return the actual value but a relative full path
     * should be a utility function most prob
     * {@link http://labs.thesedays.com/blog/2010/01/08/getting-the-href-value-with-jquery-in-ie/}
     *
     * @param {HTMLAnchorElement} $tab - Tab link
     * @returns {string} Hash fragment including #
     */
    Tabs.prototype.getHref = ($tab) => {
        const href = $tab.getAttribute("href");
        const hash = href.slice(href.indexOf("#"), href.length);
        return hash;
    };

    /**
     * Initialise all components
     *
     * Use the `data-module` attributes to find, instantiate and init all of the
     * components provided as part of GOV.UK Frontend.
     *
     * @param {Config} [config] - Config for all components
     */
    function initAll(config) {
        config = typeof config !== "undefined" ? config : {};

        // Allow the user to initialise GOV.UK Frontend in only certain sections of the page
        // Defaults to the entire document if nothing is set.
        const $scope = typeof config.scope !== "undefined" ? config.scope : document;

        const $accordions = $scope.querySelectorAll('[data-module="govuk-accordion"]');
        nodeListForEach($accordions, ($accordion) => {
            new Accordion($accordion, config.accordion).init();
        });

        const $buttons = $scope.querySelectorAll('[data-module="govuk-button"]');
        nodeListForEach($buttons, ($button) => {
            new Button($button, config.button).init();
        });

        const $characterCounts = $scope.querySelectorAll('[data-module="govuk-character-count"]');
        nodeListForEach($characterCounts, ($characterCount) => {
            new CharacterCount($characterCount, config.characterCount).init();
        });

        const $checkboxes = $scope.querySelectorAll('[data-module="govuk-checkboxes"]');
        nodeListForEach($checkboxes, ($checkbox) => {
            new Checkboxes($checkbox).init();
        });

        const $details = $scope.querySelectorAll('[data-module="govuk-details"]');
        nodeListForEach($details, ($detail) => {
            new Details($detail).init();
        });

        // Find first error summary module to enhance.
        const $errorSummary = $scope.querySelector('[data-module="govuk-error-summary"]');
        if ($errorSummary) {
            new ErrorSummary($errorSummary, config.errorSummary).init();
        }

        // Find first header module to enhance.
        const $header = $scope.querySelector('[data-module="govuk-header"]');
        if ($header) {
            new Header($header).init();
        }

        const $notificationBanners = $scope.querySelectorAll('[data-module="govuk-notification-banner"]');
        nodeListForEach($notificationBanners, ($notificationBanner) => {
            new NotificationBanner($notificationBanner, config.notificationBanner).init();
        });

        const $radios = $scope.querySelectorAll('[data-module="govuk-radios"]');
        nodeListForEach($radios, ($radio) => {
            new Radios($radio).init();
        });

        // Find first skip link module to enhance.
        const $skipLink = $scope.querySelector('[data-module="govuk-skip-link"]');
        new SkipLink($skipLink).init();

        const $tabs = $scope.querySelectorAll('[data-module="govuk-tabs"]');
        nodeListForEach($tabs, ($tabs) => {
            new Tabs($tabs).init();
        });
    }

    /**
     * Config for all components
     *
     * @typedef {object} Config
     * @property {HTMLElement} [scope=document] - Scope to query for components
     * @property {import('./components/accordion/accordion.mjs').AccordionConfig} [accordion] - Accordion config
     * @property {import('./components/button/button.mjs').ButtonConfig} [button] - Button config
     * @property {import('./components/character-count/character-count.mjs').CharacterCountConfig} [characterCount] - Character Count config
     * @property {import('./components/error-summary/error-summary.mjs').ErrorSummaryConfig} [errorSummary] - Error Summary config
     * @property {import('./components/notification-banner/notification-banner.mjs').NotificationBannerConfig} [notificationBanner] - Notification Banner config
     */

    exports.initAll = initAll;
    exports.Accordion = Accordion;
    exports.Button = Button;
    exports.Details = Details;
    exports.CharacterCount = CharacterCount;
    exports.Checkboxes = Checkboxes;
    exports.ErrorSummary = ErrorSummary;
    exports.Header = Header;
    exports.NotificationBanner = NotificationBanner;
    exports.Radios = Radios;
    exports.SkipLink = SkipLink;
    exports.Tabs = Tabs;
});
//# sourceMappingURL=all.js.map
