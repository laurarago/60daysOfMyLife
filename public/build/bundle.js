
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text$1(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text$1(' ');
    }
    function empty() {
        return text$1('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function tooltip(element) {
    	let div;
    	let title;
    	function mouseOver(event) {
    		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
    		// remember to set it back on `mouseleave`
    		title = element.getAttribute('title');
    		element.removeAttribute('title');
    		
    		div = document.createElement('div');
    		div.textContent = title;
    		div.style = `
			border: 4px solid #212121;
			box-shadow: 1px 1px 1px #212121;
			background: #212121;
			border-radius: 4px;
			padding: 4px;
			position: absolute;
            color: white;
			top: ${event.pageX + 10}px;
			left: ${event.pageY + 10}px;
            z-index: 10;
            font-family: OpenSans, Helvetica;
            font-weight:100;

		`;
    		document.body.appendChild(div);
    	}
    	function mouseMove(event) {
    		div.style.left = `${event.pageX + 10}px`;
    		div.style.top = `${event.pageY + 10}px`;
    	}
    	function mouseLeave() {
    		document.body.removeChild(div);
    		// NOTE: restore the `title` attribute
    		element.setAttribute('title', title);
    	}
    	
    	element.addEventListener('mouseover', mouseOver);
      element.addEventListener('mouseleave', mouseLeave);
    	element.addEventListener('mousemove', mouseMove);
    	
    	return {
    		destroy() {
    			element.removeEventListener('mouseover', mouseOver);
    			element.removeEventListener('mouseleave', mouseLeave);
    			element.removeEventListener('mousemove', mouseMove);
    		}
    	}
    }

    /* src/Menstrual.svelte generated by Svelte v3.35.0 */
    const file$4 = "src/Menstrual.svelte";

    // (41:0) {#if Level == 1 && PeriodCycle === 'Ovulation'}
    function create_if_block_11(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "\n\tM561.214,410.875h125.88v125.88h-125.88V410.875z M687.094,284.785l-52.85-32.53h-125.88l52.85,32.53H687.094z M561.214,284.785\n\tl-52.85-32.53 M561.214,284.785h125.88v125.88h-125.88V284.785z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 42, 0, 1115);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "\n\tM434.954,410.875h125.88v125.88h-125.88V410.875z M307.714,410.875l-52.85-32.53 M307.714,536.755l-52.85-32.54v-125.87l52.85,32.53\n\tV536.755z M307.714,410.875h125.88v125.88h-125.88V410.875z M560.824,284.785l-52.84-32.53h-125.88l52.85,32.53H560.824z\n\t M434.954,284.785l-52.85-32.53 M434.954,284.785h125.88v125.88h-125.88V284.785z M433.594,284.785l-52.85-32.53h-125.88\n\tl52.85,32.53H433.594z M307.714,284.785l-52.85-32.53 M307.714,410.665l-52.85-32.53v-125.88l52.85,32.53V410.665z M307.714,284.785\n\th125.88v125.88h-125.88V284.785z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 45, 0, 1448);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "\n\tM181.834,159.305h125.88v125.88h-125.88V159.305z M181.834,33.425h125.88v125.88h-125.88V33.425z M54.604,159.305h125.88v125.88\n\tH54.604V159.305z M54.604,33.425h125.88v125.88H54.604V33.425z M180.496,33.425l-52.85-32.53H1.766l52.85,32.53H180.496z\n\t M307.714,33.425l-52.85-32.53h-125.88l52.85,32.53H307.714z M54.616,159.305l-52.85-32.53V0.895l52.85,32.53V159.305z\n\t M54.616,284.785l-52.85-32.53v-125.88l52.85,32.53V284.785z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 51, 0, 2119);
    			add_location(g, file$4, 41, 0, 1111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(41:0) {#if Level == 1 && PeriodCycle === 'Ovulation'}",
    		ctx
    	});

    	return block;
    }

    // (59:0) {#if Level == 2 && PeriodCycle === 'Ovulation'}
    function create_if_block_10(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "\n\tM814.986,662.635h125.88v125.88h-125.88V662.635z M940.866,536.545l-52.85-32.53h-125.88l52.85,32.53H940.866z M814.986,536.545\n\tl-52.85-32.53 M814.986,536.545h125.88v125.88h-125.88V536.545z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 60, 0, 2743);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "\n\tM688.726,662.635h125.88v125.88h-125.88L688.726,662.635L688.726,662.635z M561.486,662.635l-52.85-32.53 M561.486,788.515\n\tl-52.85-32.54v-125.87l52.85,32.53V788.515z M561.486,662.635h125.88v125.88h-125.88V662.635z M814.596,536.545l-52.84-32.53\n\th-125.88l52.85,32.53H814.596z M688.726,536.545l-52.85-32.53 M688.726,536.545h125.88v125.88h-125.88L688.726,536.545\n\tL688.726,536.545z M687.366,536.545l-52.85-32.53h-125.88l52.85,32.53H687.366z M561.486,536.545l-52.85-32.53 M561.486,662.425\n\tl-52.85-32.53v-125.88l52.85,32.53V662.425z M561.486,536.545h125.88v125.88h-125.88V536.545z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 63, 0, 3076);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "\n\tM435.606,411.065h125.88v125.88h-125.88V411.065z M435.606,285.185h125.88v125.88h-125.88V285.185z M308.376,411.065h125.88v125.88\n\th-125.88V411.065z M308.376,285.185h125.88v125.88h-125.88V285.185z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 70, 1, 3799);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "\n\tM435.606,159.305h125.88v125.88h-125.88V159.305z M561.486,33.435l-52.85-32.54h-125.88l52.85,32.54H561.486z M435.606,33.435\n\tl-52.85-32.54 M435.606,33.435h125.88v125.88h-125.88V33.435z M308.376,159.305h125.88v125.88h-125.88V159.305z M434.256,33.435\n\tl-52.85-32.54h-125.87l52.84,32.54H434.256z M308.376,33.435l-52.84-32.54 M308.376,33.435h125.88v125.88h-125.88V33.435z\n\t M181.506,411.065h125.88v125.88h-125.88V411.065z M181.506,285.185h125.88v125.88h-125.88V285.185z M181.506,159.305h125.88v125.88\n\th-125.88V159.305z M307.386,33.435l-52.85-32.54h-125.87l52.84,32.54H307.386z M181.506,33.435l-52.84-32.54 M181.506,33.435h125.88\n\tv125.88h-125.88V33.435z M54.616,411.065l-52.85-32.54 M54.616,536.935l-52.85-32.53v-125.88l52.85,32.54V536.935z M54.616,411.065\n\th125.88v125.88H54.616V411.065z M54.616,285.185l-52.85-32.53 M54.616,411.065l-52.85-32.54v-125.87l52.85,32.53V411.065z\n\t M54.616,285.185h125.88v125.88H54.616V285.185z M54.616,159.305l-52.85-32.53 M54.616,285.185l-52.85-32.53v-125.88l52.85,32.53\n\tV285.185z M54.616,159.305h125.88v125.88H54.616V159.305z M180.496,33.435l-52.85-32.54H1.766l52.85,32.54H180.496z M54.616,33.435\n\tL1.766,0.895 M54.616,159.305l-52.85-32.53V0.895l52.85,32.54V159.305z M54.616,33.435h125.88v125.88H54.616V33.435z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 73, 1, 4136);
    			add_location(g0, file$4, 69, 0, 3794);
    			add_location(g1, file$4, 59, 0, 2739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(59:0) {#if Level == 2 && PeriodCycle === 'Ovulation'}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if Level == 3 && PeriodCycle === 'Ovulation'}
    function create_if_block_9(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M1068.895,1040.265h125.88v125.88h-125.88V1040.265z\n\t M1194.775,914.175l-52.85-32.53h-125.88l52.85,32.53H1194.775z M1067.895,914.175l-52.85-32.53 M1068.895,914.175h125.88v125.88\n\th-125.88V914.175z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 89, 0, 5586);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M942.635,1040.265h125.88v125.88h-125.88V1040.265z\n\t M815.395,1040.265l-52.85-32.53 M815.395,1166.145l-52.85-32.54v-125.87l52.85,32.53V1166.145z M815.395,1040.265h125.88v125.88\n\th-125.88V1040.265z M1068.505,914.175l-52.84-32.53h-125.88l52.85,32.53H1068.505z M942.635,914.175l-52.85-32.53 M942.635,914.175\n\th125.88v125.88h-125.88V914.175z M941.275,914.175l-52.85-32.53h-125.88l52.85,32.53H941.275z M815.395,914.175l-52.85-32.53\n\t M815.395,1040.055l-52.85-32.53v-125.88l52.85,32.53V1040.055z M815.395,914.175h125.88v125.88h-125.88V914.175z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 92, 0, 5926);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M689.515,788.695h125.88v125.88h-125.88V788.695z\n\t M689.515,662.815h125.88v125.88h-125.88V662.815z M562.285,788.695h125.88v125.88h-125.88V788.695z M562.285,662.815h125.88v125.88\n\th-125.88V662.815z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 98, 1, 6611);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M689.515,536.935h125.88v125.88h-125.88V536.935z\n\t M689.515,411.065h125.88v125.88h-125.88V411.065z M562.285,536.935h125.88v125.88h-125.88V536.935z M562.285,411.065h125.88v125.88\n\th-125.88V411.065z M435.415,788.695h125.88v125.88h-125.88V788.695z M435.415,662.815h125.88v125.88h-125.88V662.815z\n\t M435.415,536.935h125.88v125.88h-125.88V536.935z M435.415,411.065h125.88v125.88h-125.88V411.065z M308.525,788.695h125.88v125.88\n\th-125.88V788.695z M308.525,662.815h125.88v125.88h-125.88V662.815z M308.525,536.935h125.88v125.88h-125.88V536.935z\n\t M308.525,411.065h125.88v125.88h-125.88V411.065z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 101, 1, 6949);
    			attr_dev(path4, "id", "stage3");
    			attr_dev(path4, "fill", /*Color3*/ ctx[6]);
    			attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path4, "d", "M689.515,285.185h125.88v125.88h-125.88V285.185z\n\t M689.515,159.305h125.88v125.88h-125.88V159.305z M815.395,33.435l-52.85-32.54h-125.88l52.85,32.54H815.395z M689.515,33.435\n\tl-52.85-32.54 M689.515,33.435h125.88v125.88h-125.88V33.435z M562.285,285.185h125.88v125.88h-125.88V285.185z M562.285,159.305\n\th125.88v125.88h-125.88V159.305z M688.165,33.435l-52.85-32.54h-125.87l52.84,32.54H688.165z M562.285,33.435l-52.84-32.54\n\t M562.285,33.435h125.88v125.88h-125.88V33.435z M435.415,285.185h125.88v125.88h-125.88V285.185z M435.415,159.305h125.88v125.88\n\th-125.88V159.305z M561.295,33.435l-52.85-32.54h-125.87l52.84,32.54H561.295z M435.415,33.435l-52.84-32.54 M435.415,33.435h125.88\n\tv125.88h-125.88V33.435z M308.525,285.185h125.88v125.88h-125.88V285.185z M308.525,159.305h125.88v125.88h-125.88V159.305z\n\t M434.405,33.435l-52.85-32.54h-125.88l52.85,32.54H434.405z M308.525,33.435l-52.85-32.54 M308.525,33.435h125.88v125.88h-125.88\n\tV33.435z M181.395,788.695h125.88v125.88h-125.88V788.695z M181.395,662.815h125.88v125.88h-125.88V662.815z M181.395,536.935\n\th125.88v125.88h-125.88V536.935z M181.395,411.065h125.88v125.88h-125.88V411.065z M181.395,285.185h125.88v125.88h-125.88V285.185z\n\t M181.395,159.305h125.88v125.88h-125.88V159.305z M307.275,33.435l-52.85-32.54h-125.88l52.85,32.54H307.275z M181.395,33.435\n\tl-52.85-32.54 M181.395,33.435h125.88v125.88h-125.88V33.435z M54.605,788.695l-52.84-32.54 M54.605,914.565l-52.84-32.53v-125.88\n\tl52.84,32.54V914.565z M54.605,788.695h125.88v125.88H54.605V788.695z M54.605,662.815l-52.84-32.53 M54.605,788.695l-52.84-32.54\n\tv-125.87l52.84,32.53V788.695z M54.605,662.815h125.88v125.88H54.605V662.815z M54.605,536.935l-52.84-32.53 M54.605,662.815\n\tl-52.84-32.53v-125.88l52.84,32.53V662.815z M54.605,536.935h125.88v125.88H54.605V536.935z M54.605,411.065l-52.84-32.54\n\t M54.605,536.935l-52.84-32.53v-125.88l52.84,32.54V536.935z M54.605,285.185l-52.84-32.54 M54.605,411.065l-52.84-32.54v-125.88\n\tl52.84,32.54V411.065z M54.605,285.185h125.88v125.88H54.605V285.185z M54.605,159.305l-52.84-32.53 M54.605,285.185l-52.84-32.54\n\tv-125.87l52.84,32.53V285.185z M54.605,159.305h125.88v125.88H54.605V159.305z M180.485,33.435l-52.85-32.54H1.765l52.84,32.54\n\tH180.485z M54.605,33.435L1.765,0.895 M54.605,159.305l-52.84-32.53V0.895l52.84,32.54V159.305z M54.605,33.435h125.88v125.88\n\tH54.605V33.435z M54.605,411.065h125.88v125.88H54.605V411.065z");
    			attr_dev(path4, "class", "svelte-1vndjk9");
    			add_location(path4, file$4, 107, 2, 7678);
    			add_location(g0, file$4, 97, 0, 6606);
    			add_location(g1, file$4, 88, 0, 5582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path4)),
    					listen_dev(path4, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path4, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color3*/ 64) {
    				attr_dev(path4, "fill", /*Color3*/ ctx[6]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(88:0) {#if Level == 3 && PeriodCycle === 'Ovulation'}",
    		ctx
    	});

    	return block;
    }

    // (130:0) {#if Level == 1 & PeriodCycle === 'Menstruation'}
    function create_if_block_8(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M591.31,503.641h-92.64l-46.32,80.23l46.32,80.23\n\th92.64l46.32-80.23L591.31,503.641z M430.793,583.871h21.557l46.32,80.23l-34.01-21.57L430.793,583.871z M591.31,343.181h-92.64\n\tl-46.32,80.23l46.32,80.23h92.64l46.32-80.23L591.31,343.181z M591.31,343.181l-34.01-21.56h-70.825l12.195,21.56H591.31z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 131, 0, 10244);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M452.77,423.411h-92.64l-46.32,80.23l46.32,80.23\n\th92.64l46.32-80.23L452.77,423.411z M313.81,503.641h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.81,503.641z\n\tM187.16,482.071l34.01,21.57l-46.32,80.23l-34.01-21.57L187.16,482.071z M140.84,562.301l34.01,21.57l46.32,80.23l-34.01-21.57\n\tL140.84,562.301z M452.77,262.951h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L452.77,262.951z M452.77,262.951l-34.01-21.56\n\th-71.05l12.42,21.56H452.77z M313.39,343.181h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.39,343.181z M153.371,424.291l21.059-0.88l46.32,80.23l-34.02-21.57L153.371,424.291z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 134, 0, 10680);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M313.39,182.721h-92.64l-46.32,80.23l46.32,80.23\n\th92.64l46.32-80.23L313.39,182.721z M313.39,22.261h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.39,22.261z\n\tM186.73,0.701l34.02,21.56l-46.32,80.23l-34.02-21.56L186.73,0.701z M313.39,22.261l-34.02-21.56h-92.64l34.02,21.56H313.39z\n\tM174.43,263.831H81.79l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L174.43,263.831z M47.77,242.271l34.02,21.56l-46.33,80.23\n\tl-34.01-21.56L47.77,242.271z M1.45,322.501l34.01,21.56l46.33,80.23l-34.02-21.56L1.45,322.501z M174.43,102.491H81.79\n\tl-46.33,80.23l46.33,80.23h92.64l46.32-80.23L174.43,102.491z M47.77,80.931l34.02,21.56l-46.33,80.23l-34.01-21.56L47.77,80.931z\n\tM174.43,102.491l-34.02-21.56H47.77l34.02,21.56H174.43z M1.45,161.161l34.01,21.56l46.33,80.23l-34.02-21.56L1.45,161.161z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 139, 0, 11423);
    			add_location(g, file$4, 130, 0, 10240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(130:0) {#if Level == 1 & PeriodCycle === 'Menstruation'}",
    		ctx
    	});

    	return block;
    }

    // (149:0) {#if Level == 2 & PeriodCycle === 'Menstruation'}
    function create_if_block_7(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M869.23,904.791h-92.64l-46.32,80.23l46.32,80.23\n      h92.64l46.32-80.23L869.23,904.791z M708.713,985.021h21.557l46.32,80.23l-34.01-21.57L708.713,985.021z M869.23,744.331h-92.64\n      l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.23,744.331z M869.23,744.331l-34.01-21.56h-70.825l12.195,21.56H869.23z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 150, 3, 12405);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M730.69,824.561h-92.64l-46.32,80.23l46.32,80.23\n      h92.64l46.32-80.23L730.69,824.561z M591.73,904.791h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L591.73,904.791z\n       M465.08,883.221l34.01,21.57l-46.32,80.23l-34.01-21.57L465.08,883.221z M418.76,963.451l34.01,21.57l46.32,80.23l-34.01-21.57\n      L418.76,963.451z M730.69,664.101h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L730.69,664.101z M730.69,664.101l-34.01-21.56\n      h-71.497l12.867,21.56H730.69z M591.31,744.331h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L591.31,744.331z\n       M430.783,824.561h21.567l46.32,80.23l-34.02-21.57L430.783,824.561z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 153, 3, 12854);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "d", "M591.31,583.871h-92.64l-46.32,80.23l46.32,80.23\n      h92.64l46.32-80.23L591.31,583.871z M591.31,423.411h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L591.31,423.411z\n       M452.35,664.981h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L452.35,664.981z M291.309,744.331l22.071,0.88l46.33,80.23\n      l-34.02-21.56L291.309,744.331z M452.35,503.641h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L452.35,503.641z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 160, 1, 13630);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M591.31,262.951h-92.64l-46.32,80.23l46.32,80.23\n      h92.64l46.32-80.23L591.31,262.951z M591.31,102.491h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L591.31,102.491z\n       M591.31,102.491l-34.02-21.56h-71.067l12.447,21.56H591.31z M452.35,343.181h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23\n      L452.35,343.181z M452.35,182.721h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L452.35,182.721z M313.38,583.871h-92.64\n      l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L313.38,583.871z M174.42,664.101H81.78l-46.32,80.23l46.32,80.23h92.64l46.32-80.23\n      L174.42,664.101z M47.77,642.541l34.01,21.56l-46.32,80.23l-34.01-21.56L47.77,642.541z M1.45,722.771l34.01,21.56l46.32,80.23\n      l-34.01-21.57L1.45,722.771z M313.38,423.411h-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L313.38,423.411z M313.38,262.951\n      h-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L313.38,262.951z M186.73,241.391l34.01,21.56l-46.32,80.23l-34.01-21.56\n      L186.73,241.391z M174.42,503.641H81.78l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L174.42,503.641z M47.77,482.081l34.01,21.56\n      l-46.32,80.23l-34.01-21.56L47.77,482.081z M1.45,562.311l34.01,21.56l46.32,80.23l-34.01-21.56L1.45,562.311z M174.42,343.181\n      H81.78l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L174.42,343.181z M47.77,321.621l34.01,21.56l-46.32,80.23l-34.01-21.56\n      L47.77,321.621z M174.42,343.181l-34.01-21.56H47.77l34.01,21.56H174.42z M1.45,401.851l34.01,21.56l46.32,80.23l-34.01-21.56\n      L1.45,401.851z M452.35,22.261h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L452.35,22.261z M325.69,0.701l34.02,21.56\n      l-46.33,80.23l-34.01-21.56L325.69,0.701z M452.35,22.261l-34.02-21.56h-92.64l34.02,21.56H452.35z M313.38,102.491h-92.64\n      l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L313.38,102.491z M186.73,80.931l34.01,21.56l-46.32,80.23l-34.01-21.56L186.73,80.931z\n       M313.38,102.491l-34.01-21.56h-92.64l34.01,21.56H313.38z M140.41,161.161l34.01,21.56l46.32,80.23l-34.01-21.56L140.41,161.161z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 164, 1, 14192);
    			add_location(g0, file$4, 159, 3, 13625);
    			add_location(g1, file$4, 149, 0, 12398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(149:0) {#if Level == 2 & PeriodCycle === 'Menstruation'}",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if Level == 3 & PeriodCycle === 'Menstruation'}
    function create_if_block_6(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M1147.57,1145.481h-92.64l-46.32,80.23l46.32,80.23\n\th92.64l46.32-80.23L1147.57,1145.481z M987.053,1225.711h21.557l46.32,80.23l-34.01-21.57L987.053,1225.711z M1147.57,985.021\n\th-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L1147.57,985.021z M1147.57,985.021l-34.01-21.56h-70.825l12.195,21.56H1147.57z\n\t");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 184, 0, 16382);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M1009.03,1065.251h-92.64l-46.32,80.23l46.32,80.23\n\th92.64l46.32-80.23L1009.03,1065.251z M870.07,1145.481h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L870.07,1145.481z\n\t M743.42,1123.911l34.01,21.57l-46.32,80.23l-34.01-21.57L743.42,1123.911z M697.1,1204.141l34.01,21.57l46.32,80.23l-34.01-21.57\n\tL697.1,1204.141z M1009.03,904.791h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L1009.03,904.791z M1009.03,904.791\n\tl-34.01-21.56h-71.497l12.867,21.56H1009.03z M869.65,985.021h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.65,985.021z\n\t M709.123,1065.251h21.567l46.32,80.23l-34.02-21.57L709.123,1065.251z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 188, 0, 16830);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M869.65,824.561h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.65,824.561z M869.65,664.101h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.65,664.101zM730.69,905.671h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L730.69,905.671z M569.649,985.021l22.071,0.88l46.33,80.23l-34.02-21.56L569.649,985.021z M730.69,744.331h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L730.69,744.331z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 195, 1, 17592);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M869.65,503.641h-92.64l-46.32,80.23l46.32,80.23\n\t\th92.64l46.32-80.23L869.65,503.641z M869.65,343.181h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.65,343.181z\n\t\tM730.69,583.871h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L730.69,583.871z M730.69,423.411h-92.64l-46.33,80.23\n\t\tl46.33,80.23h92.64l46.32-80.23L730.69,423.411z M591.72,824.561h-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L591.72,824.561\n\t\tz M452.76,904.791h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L452.76,904.791z M291.3,985.901l22.5-0.88l46.32,80.23\n\t\tl-34.01-21.57L291.3,985.901z M591.72,664.101h-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L591.72,664.101z M591.72,503.641\n\t\th-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L591.72,503.641z M452.76,744.331h-92.64l-46.32,80.23l46.32,80.23h92.64\n\t\tl46.32-80.23L452.76,744.331z M452.76,583.871h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L452.76,583.871z M730.69,262.951\n\t\th-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L730.69,262.951z M591.72,343.181h-92.64l-46.32,80.23l46.32,80.23h92.64\n\t\tl46.33-80.23L591.72,343.181z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 196, 1, 18131);
    			attr_dev(path4, "id", "stage3");
    			attr_dev(path4, "fill", /*Color3*/ ctx[6]);
    			attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path4, "d", "M869.65,182.721h-92.64l-46.32,80.23l46.32,80.23\n\t\th92.64l46.32-80.23L869.65,182.721z M869.65,22.261h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L869.65,22.261z\n\t\tM742.99,0.701l34.02,21.56l-46.32,80.23l-34.02-21.56L742.99,0.701z M869.65,22.261l-34.02-21.56h-92.64l34.02,21.56H869.65z\n\t\tM730.69,102.491h-92.64l-46.33,80.23l46.33,80.23h92.64l46.32-80.23L730.69,102.491z M730.69,102.491l-34.02-21.56h-71.161\n\t\tl12.541,21.56H730.69z M591.72,182.721h-92.64l-46.32,80.23l46.32,80.23h92.64l46.33-80.23L591.72,182.721z M591.72,22.261h-92.64\n\t\tl-46.32,80.23l46.32,80.23h92.64l46.33-80.23L591.72,22.261z M465.07,0.701l34.01,21.56l-46.32,80.23l-34.01-21.56L465.07,0.701z\n\t\tM591.72,22.261l-34.01-21.56h-92.64l34.01,21.56H591.72z M452.76,423.411h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23\n\t\tL452.76,423.411z M452.76,262.951h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L452.76,262.951z M452.76,102.491h-92.64\n\t\tl-46.32,80.23l46.32,80.23h92.64l46.32-80.23L452.76,102.491z M452.76,102.491l-34.01-21.56h-71.077l12.447,21.56H452.76z\n\t\tM313.8,825.441h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.8,825.441z M313.8,664.101h-92.64l-46.32,80.23l46.32,80.23\n\t\th92.64l46.32-80.23L313.8,664.101z M313.8,503.641h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.8,503.641z\n\t\tM313.8,342.291h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.8,342.291z M313.8,182.721h-92.64l-46.32,80.23l46.32,80.23\n\t\th92.64l46.32-80.23L313.8,182.721z M313.8,22.261h-92.64l-46.32,80.23l46.32,80.23h92.64l46.32-80.23L313.8,22.261z M187.15,0.701\n\t\tl34.01,21.56l-46.32,80.23l-34.01-21.56L187.15,0.701z M313.8,22.261l-34.01-21.56h-92.64l34.01,21.56H313.8z M174.43,905.531H81.78\n\t\tl-46.32,80.23l46.32,80.23h92.65l46.32-80.23L174.43,905.531z M47.77,883.971l34.01,21.56l-46.32,80.23l-34.01-21.56L47.77,883.971z\n\t\tM1.45,964.201l34.01,21.56l46.32,80.23l-34.01-21.56L1.45,964.201z M174.43,745.211H81.78l-46.32,80.23l46.32,80.23h92.65\n\t\tl46.32-80.23L174.43,745.211z M47.77,723.651l34.01,21.56l-46.32,80.23l-34.01-21.56L47.77,723.651z M1.45,803.881l34.01,21.56\n\t\tl46.32,80.23l-34.01-21.56L1.45,803.881z M174.43,583.871H81.78l-46.32,80.23l46.32,80.23h92.65l46.32-80.23L174.43,583.871z\n\t\tM47.77,562.311l34.01,21.56l-46.32,80.23l-34.01-21.56L47.77,562.311z M1.45,642.541l34.01,21.56l46.32,80.23l-34.01-21.56\n\t\tL1.45,642.541z M174.43,423.851H81.78l-46.32,80.23l46.32,80.23h92.65l46.32-80.23L174.43,423.851z M47.77,402.291l34.01,21.56\n\t\tl-46.32,80.23l-34.01-21.56L47.77,402.291z M1.45,482.521l34.01,21.56l46.32,80.23l-34.01-21.56L1.45,482.521z M174.43,262.951\n\t\tH81.78l-46.32,80.23l46.32,80.23h92.65l46.32-80.23L174.43,262.951z M47.77,241.391l34.01,21.56l-46.32,80.23l-34.01-21.56\n\t\tL47.77,241.391z M1.45,321.621l34.01,21.56l46.32,80.23l-34.01-21.56L1.45,321.621z M174.43,102.711H81.78l-46.32,80.23l46.32,80.23\n\t\th92.65l46.32-80.23L174.43,102.711z M47.77,81.151l34.01,21.56l-46.32,80.23l-34.01-21.56L47.77,81.151z M174.43,102.711\n\t\tl-34.02-21.56H47.77l34.01,21.56H174.43z M1.45,161.381l34.01,21.56l46.32,80.23l-34.01-21.56L1.45,161.381z");
    			attr_dev(path4, "class", "svelte-1vndjk9");
    			add_location(path4, file$4, 206, 1, 19347);
    			add_location(g0, file$4, 194, 0, 17587);
    			add_location(g1, file$4, 183, 0, 16378);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path4)),
    					listen_dev(path4, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path4, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color3*/ 64) {
    				attr_dev(path4, "fill", /*Color3*/ ctx[6]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(183:0) {#if Level == 3 & PeriodCycle === 'Menstruation'}",
    		ctx
    	});

    	return block;
    }

    // (234:0) {#if Level == 1 & PeriodCycle === 'Premenstrual'}
    function create_if_block_5(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M618.537,341.69l-61.686,113.334h123.372\n\tL618.537,341.69z M618.537,568.357l-61.686-113.334h123.372L618.537,568.357z M681.378,454.079v-16.706l-61.686-96.628\n\t M556.274,227.88l-61.686,113.341H617.96L556.274,227.88z M556.274,454.555l-61.686-113.334H617.96L556.274,454.555z\n\t M619.115,340.27v-16.705l-61.686-96.628");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 235, 0, 22565);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M371.793,341.69l-61.686,113.334h123.372\n\tL371.793,341.69z M371.793,568.357l-61.686-113.334h123.372L371.793,568.357z M494.041,341.69l-61.686,113.334h123.372\n\tL494.041,341.69z M494.041,568.357l-61.686-113.334h123.372L494.041,568.357z M432.922,227.412l-61.686,113.334h123.372\n\tL432.922,227.412z M432.922,454.079l-61.686-113.334h123.372L432.922,454.079z M495.762,339.802v-16.706l-61.686-96.628\n\t M309.53,228.824l-61.686,113.341h123.372L309.53,228.824z M309.53,455.499l-61.686-113.334h123.372L309.53,455.499z\n\t M372.361,341.222v-16.713l-61.686-96.628");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 239, 0, 23020);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M247.814,114.079l-61.686,113.334H309.51\n\tL247.814,114.079z M247.814,340.746l-61.686-113.334H309.51L247.814,340.746z M310.655,226.468v-16.713l-61.686-96.628\n\t M124.621,114.079L62.925,227.412h123.382L124.621,114.079z M124.621,340.746L62.925,227.412h123.382L124.621,340.746z\n\t M125.766,113.127 M62.527,1.213L0.841,114.547h123.372L62.527,1.213z M62.527,227.88L0.841,114.547h123.372L62.527,227.88z\n\t M125.358,113.603V96.897L63.672,0.269 M186.128,1.213l-61.686,113.334h123.372L186.128,1.213z M186.128,227.88l-61.686-113.334\n\th123.372L186.128,227.88z M248.969,113.603V96.897L187.283,0.269");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 245, 0, 23708);
    			add_location(g, file$4, 234, 0, 22561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(234:0) {#if Level == 1 & PeriodCycle === 'Premenstrual'}",
    		ctx
    	});

    	return block;
    }

    // (255:0) {#if Level == 2 & PeriodCycle === 'Premenstrual'}
    function create_if_block_4(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M865.64,567.655l-61.686,113.334h123.372\n\tL865.64,567.655z M865.64,794.322l-61.686-113.334h123.372L865.64,794.322z M928.48,680.044v-16.706l-61.686-96.628\n\t M803.376,453.845L741.69,567.187h123.372L803.376,453.845z M803.376,680.52L741.69,567.187h123.372L803.376,680.52z\n\t M866.217,566.235v-16.705l-61.686-96.628");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 256, 0, 24497);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M618.896,567.655L557.21,680.988h123.372\n\tL618.896,567.655z M618.896,794.322L557.21,680.988h123.372L618.896,794.322z M741.143,567.655l-61.686,113.334h123.372\n\tL741.143,567.655z M741.143,794.322l-61.686-113.334h123.372L741.143,794.322z M680.024,453.377l-61.686,113.334H741.71\n\tL680.024,453.377z M680.024,680.044l-61.686-113.334H741.71L680.024,680.044z M742.865,565.766v-16.706l-61.686-96.628\n\t M556.632,454.789l-61.686,113.341h123.372L556.632,454.789z M556.632,681.464l-61.686-113.334h123.372L556.632,681.464z\n\t M619.463,567.187v-16.713l-61.686-96.628");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 260, 0, 24950);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M494.917,340.043l-61.686,113.334h123.382\n\t\tL494.917,340.043z M494.917,566.711l-61.686-113.334h123.382L494.917,566.711z M557.757,452.433V435.72l-61.686-96.628\n\t \tM371.724,340.043l-61.696,113.334H433.41L371.724,340.043z M371.724,566.711l-61.696-113.334H433.41L371.724,566.711z\n\t \tM372.868,339.092 M309.63,227.178l-61.686,113.334h123.372L309.63,227.178z M309.63,453.845l-61.686-113.334h123.372\n\t\tL309.63,453.845z M433.231,227.178l-61.686,113.334h123.372L433.231,227.178z M433.231,453.845l-61.686-113.334h123.372\n\t\tL433.231,453.845z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 267, 1, 25647);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M248.909,340.754l-61.696,113.334h123.382L248.909,340.754z M248.909,567.421l-61.696-113.334h123.382L248.909,567.421z M125.955,340.754L64.269,454.087h123.372L125.955,340.754z M125.955,567.421L64.269,454.087h123.372L125.955,567.421z M62.906,227.888L1.22,341.222h123.372L62.906,227.888zM62.906,454.555L1.22,341.222h123.372L62.906,454.555z M186.646,227.888L124.96,341.222h123.372L186.646,227.888z M186.646,454.555L124.96,341.222h123.372L186.646,454.555z M494.936,114.079L433.25,227.412h123.372L494.936,114.079z M494.936,340.754L433.25,227.412h123.372L494.936,340.754z M557.777,226.468v-16.706l-61.686-96.628 M371.734,340.754l-61.686-113.341H433.42L371.734,340.754z M371.734,114.079l-61.686,113.334H433.42L371.734,114.079z M248.332,114.079l-61.686,113.334h123.372\n\t\tL248.332,114.079z M248.332,340.754l-61.686-113.341h123.372L248.332,340.754z M125.577,114.079L63.891,227.412h123.372\n\t\tL125.577,114.079z M125.577,340.754L63.891,227.412h123.372L125.577,340.754z M62.527,1.213L0.841,114.555h123.382L62.527,1.213z\n\t\tM62.527,227.888L0.841,114.555h123.382L62.527,227.888z M125.368,113.61V96.897L63.682,0.269 M186.268,1.213l-61.686,113.341\n\t\th123.372L186.268,1.213z M186.268,227.888l-61.686-113.334h123.372L186.268,227.888z M249.108,113.61V96.897L187.422,0.269\n\t\tM309.64,1.213l-61.686,113.341h123.372L309.64,1.213z M309.64,227.888l-61.686-113.334h123.372L309.64,227.888z M372.48,113.61\n\t\tV96.897L310.794,0.269 M433.25,1.213l-61.686,113.341h123.372L433.25,1.213z M433.25,227.888l-61.686-113.334h123.372\n\t\tL433.25,227.888z M496.091,113.61V96.897L434.395,0.269");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 273, 1, 26318);
    			add_location(g0, file$4, 266, 0, 25642);
    			add_location(g1, file$4, 255, 0, 24493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(255:0) {#if Level == 2 & PeriodCycle === 'Premenstrual'}",
    		ctx
    	});

    	return block;
    }

    // (284:0) {#if Level == 3 & PeriodCycle === 'Premenstrual'}
    function create_if_block_3(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M1112.891,794.798l-61.686,113.334h123.372\n\t\tL1112.891,794.798z M1112.891,1021.465l-61.686-113.334h123.372L1112.891,1021.465z M1175.731,907.187v-16.706l-61.686-96.628\n\t\tM1050.628,680.988L988.942,794.33h123.372L1050.628,680.988z M1050.628,907.663L988.942,794.33h123.372L1050.628,907.663z\n\t\tM1113.468,793.378v-16.705l-61.686-96.628");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 285, 1, 28073);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M866.147,794.798l-61.686,113.334h123.372\n\t\tL866.147,794.798z M866.147,1021.465l-61.686-113.334h123.372L866.147,1021.465z M988.395,794.798l-61.686,113.334h123.372\n\t\tL988.395,794.798z M988.395,1021.465l-61.686-113.334h123.372L988.395,1021.465z M927.276,680.52L865.59,793.854h123.372\n\t\tL927.276,680.52z M927.276,907.187L865.59,793.854h123.372L927.276,907.187z M990.116,792.91v-16.706l-61.686-96.628\n\t\tM803.884,681.932l-61.686,113.341H865.57L803.884,681.932z M803.884,908.607l-61.686-113.334H865.57L803.884,908.607z\n\t\tM866.714,794.33v-16.713l-61.686-96.628");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 289, 1, 28547);
    			attr_dev(path2, "id", "stage3");
    			attr_dev(path2, "fill", /*Color3*/ ctx[6]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M248.113,566.953l-61.686,113.334h123.372\n\tL248.113,566.953z M248.113,793.62l-61.686-113.334h123.372L248.113,793.62z M123.587,566.953L61.901,680.286h123.372\n\tL123.587,566.953z M123.587,793.62L61.901,680.286h123.372L123.587,793.62z M186.019,454.087l-61.686,113.334h123.372\n\tL186.019,454.087z M186.019,680.754l-61.686-113.334h123.372L186.019,680.754z M62.896,454.087L1.21,567.421h123.372L62.896,454.087\n\tz M62.896,680.754L1.21,567.421h123.372L62.896,680.754z M247.745,340.278l-61.696,113.334h123.382L247.745,340.278z\n\t M247.745,566.953l-61.696-113.341h123.382L247.745,566.953z M124.542,340.278L62.846,453.611h123.382L124.542,340.278z\n\t M124.542,566.953L62.846,453.611h123.382L124.542,566.953z M185.651,227.412l-61.686,113.341h123.372L185.651,227.412z\n\t M185.651,454.087l-61.686-113.334h123.372L185.651,454.087z M62.527,227.412L0.841,340.754h123.372L62.527,227.412z\n\t M62.527,454.087L0.841,340.754h123.372L62.527,454.087z M741.621,114.079l-61.686,113.334h123.372L741.621,114.079z\n\t M741.621,340.754l-61.686-113.341h123.372L741.621,340.754z M804.461,226.468v-16.705l-61.686-96.628 M618.418,114.079\n\tl-61.686,113.334h123.372L618.418,114.079z M618.418,340.754l-61.686-113.341h123.372L618.418,340.754z M495.215,114.079\n\tl-61.686,113.334h123.372L495.215,114.079z M495.215,340.754l-61.686-113.341h123.372L495.215,340.754z M372.261,114.079\n\tl-61.686,113.334h123.372L372.261,114.079z M372.261,340.754l-61.686-113.341h123.372L372.261,340.754z M247.745,114.079\n\tl-61.696,113.334h123.382L247.745,114.079z M247.745,340.754l-61.696-113.341h123.382L247.745,340.754z M124.542,114.079\n\tL62.846,227.412h123.382L124.542,114.079z M124.542,340.754L62.846,227.412h123.382L124.542,340.754z M185.651,1.221\n\tl-61.686,113.334h123.372L185.651,1.221z M185.651,227.888l-61.686-113.334h123.372L185.651,227.888z M248.481,113.61V96.897\n\tL186.795,0.269 M62.527,1.221L0.841,114.555h123.372L62.527,1.221z M62.527,227.888L0.841,114.555h123.372L62.527,227.888z\n\t M125.358,113.61V96.897L63.672,0.269 M309.212,1.221l-61.686,113.334h123.382L309.212,1.221z M309.212,227.888l-61.686-113.334\n\th123.382L309.212,227.888z M372.052,113.61V96.897L310.366,0.269 M432.952,1.221l-61.686,113.334h123.372L432.952,1.221z\n\t M432.952,227.888l-61.686-113.334h123.372L432.952,227.888z M495.792,113.61V96.897L434.106,0.269 M556.324,1.221l-61.686,113.334\n\tH618.01L556.324,1.221z M556.324,227.888l-61.686-113.334H618.01L556.324,227.888z M619.164,113.61V96.897L557.478,0.269\n\t M679.935,1.221l-61.686,113.334h123.372L679.935,1.221z M679.935,227.888l-61.686-113.334h123.372L679.935,227.888z\n\t M742.775,113.61V96.897L681.079,0.269");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 296, 1, 29247);
    			attr_dev(path3, "id", "stage1");
    			attr_dev(path3, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M742.168,567.187L680.482,680.52h123.382\n\t\tL742.168,567.187z M742.168,793.854L680.482,680.52h123.382L742.168,793.854z M805.008,679.576v-16.713l-61.686-96.628\n\t\tM618.975,567.187L557.279,680.52h123.382L618.975,567.187z M618.975,793.854L557.279,680.52h123.382L618.975,793.854z\n\t\tM620.12,566.235 M556.881,454.321l-61.686,113.334h123.372L556.881,454.321z M556.881,680.988l-61.686-113.334h123.372\n\t\tL556.881,680.988z M680.482,454.321l-61.686,113.334h123.372L680.482,454.321z M680.482,680.988l-61.686-113.334h123.372\n\t\tL680.482,680.988z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 320, 1, 31952);
    			attr_dev(path4, "id", "stage2");
    			attr_dev(path4, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path4, "d", "M496.16,567.897L434.465,681.23h123.382\n\t\tL496.16,567.897z M496.16,794.564L434.465,681.23h123.382L496.16,794.564z M373.206,567.897L311.52,681.23h123.372L373.206,567.897z\n\t\tM373.206,794.564L311.52,681.23h123.372L373.206,794.564z M310.157,455.031l-61.686,113.334h123.372L310.157,455.031z\n\t\tM310.157,681.698l-61.686-113.334h123.372L310.157,681.698z M433.897,455.031l-61.686,113.334h123.372L433.897,455.031z\n\t\tM433.897,681.698l-61.686-113.334h123.372L433.897,681.698z M742.188,341.222l-61.686,113.334h123.372L742.188,341.222z\n\t\tM742.188,567.897l-61.686-113.341h123.372L742.188,567.897z M805.028,453.611v-16.706l-61.686-96.628 M618.985,567.897\n\t\tl-61.686-113.341h123.372L618.985,567.897z M618.985,341.222l-61.686,113.334h123.372L618.985,341.222z M495.583,341.222\n\t\tl-61.686,113.334h123.372L495.583,341.222z M495.583,567.897l-61.686-113.341h123.372L495.583,567.897z M372.828,341.222\n\t\tl-61.686,113.334h123.372L372.828,341.222z M372.828,567.897l-61.686-113.341h123.372L372.828,567.897z M309.779,228.356\n\t\tl-61.686,113.341h123.382L309.779,228.356z M309.779,455.031l-61.686-113.334h123.382L309.779,455.031z M433.519,228.356\n\t\tl-61.686,113.341h123.372L433.519,228.356z M433.519,455.031l-61.686-113.334h123.372L433.519,455.031z M556.891,228.356\n\t\tl-61.686,113.341h123.372L556.891,228.356z M556.891,455.031l-61.686-113.334h123.372L556.891,455.031z M680.502,228.356\n\t\tl-61.686,113.341h123.372L680.502,228.356z M680.502,455.031l-61.686-113.334h123.372L680.502,455.031z");
    			attr_dev(path4, "class", "svelte-1vndjk9");
    			add_location(path4, file$4, 326, 1, 32622);
    			add_location(g0, file$4, 295, 0, 29242);
    			add_location(g1, file$4, 284, 0, 28068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path4)),
    					listen_dev(path4, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path4, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color3*/ 64) {
    				attr_dev(path2, "fill", /*Color3*/ ctx[6]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path3, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path4, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(284:0) {#if Level == 3 & PeriodCycle === 'Premenstrual'}",
    		ctx
    	});

    	return block;
    }

    // (342:0) {#if Level == 1 & PeriodCycle === 'Preovulation'}
    function create_if_block_2(ctx) {
    	let g;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M559.848,464.384l-46.905,4.557l-9.408,42.905\n\tl36.514,37.772l46.792-4.311l9.776-42.792L559.848,464.384z M486.394,462.493l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.335l9.408-42.905L486.394,462.493z M467.579,548.191l36.968,38.225l35.503-36.788l-36.514-37.772L467.579,548.191z\n\t M596.618,502.515l10.674,32.127l-9.663,42.707l-10.779-32.042L596.618,502.515z M504.547,586.416l10.835,32.014l46.121-4.179\n\tl36.117-36.902l-10.779-32.042l-46.792,4.311L504.547,586.416z M515.382,618.43l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L515.382,618.43z M503.542,511.852l9.4-42.91l46.91-4.55l36.76,38.12l-9.77,42.8l-46.79,4.31\n\tL503.542,511.852z M558.354,314.906l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311l9.776-42.792L558.354,314.906z\n\t M511.449,319.463l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L511.449,319.463z M484.9,313.015l-35.465,36.571l-9.53,42.669\n\tl26.18,6.458l35.957-36.334l9.407-42.905L484.9,313.015z M466.085,398.703l36.968,38.225l35.503-36.788l-36.514-37.772\n\tL466.085,398.703z M595.115,353.036l10.674,32.127l-9.663,42.707l-10.778-32.042L595.115,353.036z M503.044,436.928l10.835,32.014\n\tl46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L503.044,436.928z M513.888,468.942l-26.464-6.325l-36.959-38.348\n\tl-10.552-32.023l26.18,6.458l36.968,38.225L513.888,468.942z M502.042,362.372l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8\n\tl-46.79,4.31L502.042,362.372z M511.452,319.462l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77L511.452,319.462z\n\t M513.452,468.941l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77L513.452,468.941z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 343, 0, 34286);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M268.414,457.303l-46.905,4.557l-9.408,42.905\n\tl36.514,37.771l46.792-4.311l9.776-42.792L268.414,457.303z M194.959,455.412l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.408-42.905L194.959,455.412z M176.144,541.1l36.968,38.225l35.503-36.788l-36.514-37.771L176.144,541.1z\n\t M213.103,579.325l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L213.103,579.325z M223.948,611.339\n\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L223.948,611.339z M212.102,504.762l9.4-42.91l46.91-4.55\n\tl36.76,38.13l-9.77,42.79l-46.79,4.31L212.102,504.762z M413.857,460.839l-46.905,4.557l-9.407,42.905l36.514,37.772l46.792-4.311\n\tl9.776-42.792L413.857,460.839z M340.402,458.948l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.335l9.407-42.905\n\tL340.402,458.948z M321.587,544.645l36.968,38.225l35.503-36.788l-36.514-37.772L321.587,544.645z M358.546,582.871l10.835,32.014\n\tl46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L358.546,582.871z M369.381,614.884l-26.464-6.325l-36.959-38.348\n\tl-10.552-32.023l26.18,6.458l36.968,38.225L369.381,614.884z M357.542,508.302l9.4-42.9l46.91-4.56l36.77,38.13l-9.78,42.79\n\tl-46.79,4.31L357.542,508.302z M266.91,307.814l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\tL266.91,307.814z M193.465,305.924L158,342.494l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L193.465,305.924z\n\t M174.641,391.621l36.968,38.225l35.503-36.788l-36.514-37.771L174.641,391.621z M211.609,429.846l10.835,32.014l46.121-4.179\n\tl36.117-36.902l-10.779-32.042l-46.792,4.311L211.609,429.846z M222.444,461.86l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L222.444,461.86z M210.602,355.282l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31\n\tL210.602,355.282z M365.448,315.917l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L365.448,315.917z M338.899,309.469l-35.465,36.571\n\tl-9.53,42.669l26.18,6.458l35.957-36.335l9.407-42.905L338.899,309.469z M320.084,395.157l36.968,38.225l35.503-36.788\n\tl-36.514-37.771L320.084,395.157z M357.052,433.382l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311\n\tL357.052,433.382z M367.887,465.396l-26.464-6.325l-36.959-38.348L293.913,388.7l26.18,6.458l36.968,38.225L367.887,465.396z\n\t M412.353,311.36l-46.905,4.557l-9.407,42.905l36.514,37.772l46.792-4.311l9.776-42.792L412.353,311.36z M414.008,461.217\n\tl36.921,37.847l-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L414.008,461.217z M267.918,457.217l36.921,37.847\n\tl-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L267.918,457.217z M266.918,307.89l36.921,37.847l-9.521,42.669\n\tl-47.356,4.339l-36.51-37.77l10.346-42.906L266.918,307.89z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 357, 0, 36022);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M119.198,156.379l-46.905,4.557l-9.408,42.905L99.4,241.613\n\tl46.792-4.311l9.776-42.792L119.198,156.379z M45.753,154.488l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\tL45.753,154.488z M26.938,240.185l36.968,38.225l35.503-36.788l-36.514-37.771L26.938,240.185z M63.897,278.41l10.835,32.014\n\tl46.121-4.179l36.117-36.902l-10.778-32.042L99.4,241.613L63.897,278.41z M74.732,310.424l-26.464-6.325l-36.959-38.348\n\tL0.758,233.727l26.18,6.458l36.968,38.225L74.732,310.424z M62.892,203.842l9.4-42.9l46.91-4.56l36.77,38.13l-9.78,42.79\n\tl-46.79,4.31L62.892,203.842z M264.641,158.383l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\tL264.641,158.383z M191.187,156.492l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,156.492z\n\tM172.372,242.18l36.968,38.225l35.503-36.788l-36.514-37.771L172.372,242.18z M301.411,196.514l10.674,32.127l-9.663,42.707\n\tl-10.778-32.042L301.411,196.514z M209.34,280.405l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311\n\tL209.34,280.405z M220.175,312.419l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L220.175,312.419z\n\tM208.332,205.842l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31L208.332,205.842z M119.198,6.9l-46.905,4.557\n\tl-9.408,42.905L99.4,92.134l46.792-4.311l9.776-42.792L119.198,6.9z M45.753,5.009L10.288,41.579l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.408-42.905L45.753,5.009z M26.938,90.697l36.968,38.225l35.503-36.788L62.895,54.362L26.938,90.697z\n\tM63.897,128.922l10.835,32.014l46.121-4.179l36.117-36.902l-10.778-32.042L99.4,92.124L63.897,128.922z M74.732,160.936\n\tl-26.464-6.325l-36.959-38.348L0.758,84.239l26.18,6.458l36.968,38.225L74.732,160.936z M62.892,54.362l9.4-42.91l46.91-4.55\n\tl36.77,38.13l-9.78,42.79l-46.79,4.31L62.892,54.362z M264.641,8.904l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\tl9.776-42.792L264.641,8.904z M191.187,7.004l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,7.004z\n\tM172.372,92.701l36.968,38.225l35.503-36.788l-36.514-37.772L172.372,92.701z M301.411,47.025l10.674,32.127l-9.663,42.707\n\tl-10.778-32.042L301.411,47.025z M209.34,130.926l10.835,32.014l46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311\n\tL209.34,130.926z M220.175,162.94l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L220.175,162.94z\n\tM119.202,6.902l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L119.202,6.902z M264.648,8.906l36.766,38.128\n\tl-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L264.648,8.906z M264.642,158.382l36.766,38.128l-9.776,42.792l-46.79,4.31\n\tl-36.51-37.77l9.4-42.91L264.642,158.382z M119.483,156.726l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91\n\tL119.483,156.726z M237.456,2.606l26.908,6.439l-46.905,4.557L190.91,7.153L237.456,2.606z M91.654,0.506l26.908,6.439\n\tl-46.905,4.557L45.108,5.053L91.654,0.506z M217.459,13.601l46.905-4.557l37.05,37.99l-9.776,42.792l-46.79,4.31l-36.51-37.77\n\tL217.459,13.601z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 380, 0, 38801);
    			add_location(g, file$4, 342, 0, 34282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(g, path2);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(342:0) {#if Level == 1 & PeriodCycle === 'Preovulation'}",
    		ctx
    	});

    	return block;
    }

    // (408:0) {#if Level == 2 & PeriodCycle === 'Preovulation'}
    function create_if_block_1(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M851.281,770.119l-46.905,4.557l-9.408,42.905\n\tl36.514,37.771l46.792-4.311l9.776-42.792L851.281,770.119z M777.826,768.228l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.408-42.905L777.826,768.228z M759.011,853.926l36.968,38.225l35.503-36.788l-36.514-37.771L759.011,853.926z\n\t M888.05,808.25l10.674,32.127l-9.663,42.707l-10.779-32.042L888.05,808.25z M795.979,892.151l10.835,32.014l46.121-4.179\n\tl36.117-36.902l-10.779-32.042l-46.792,4.311L795.979,892.151z M806.815,924.165l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L806.815,924.165z M794.974,817.587l9.4-42.91l46.91-4.55l36.76,38.12l-9.77,42.8l-46.79,4.31\n\tL794.974,817.587z M849.787,620.64l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311l9.776-42.792L849.787,620.64z\n\t M802.882,625.198l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L802.882,625.198z M776.332,618.749l-35.465,36.571l-9.53,42.669\n\tl26.18,6.458l35.957-36.334l9.407-42.905L776.332,618.749z M757.517,704.437l36.968,38.225l35.503-36.788l-36.514-37.771\n\tL757.517,704.437z M886.547,658.771l10.674,32.127l-9.663,42.707l-10.779-32.042L886.547,658.771z M794.476,742.663l10.835,32.014\n\tl46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L794.476,742.663z M805.321,774.677l-26.464-6.325l-36.959-38.348\n\tl-10.552-32.023l26.18,6.458l36.968,38.225L805.321,774.677z M793.474,668.107l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8\n\tl-46.79,4.31L793.474,668.107z M802.884,625.197l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77L802.884,625.197z\n\t M804.884,774.676l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77L804.884,774.676z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 409, 0, 41973);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M559.846,763.038l-46.905,4.557l-9.408,42.905\n\tl36.514,37.772l46.792-4.311l9.776-42.792L559.846,763.038z M486.392,761.147l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.408-42.905L486.392,761.147z M467.577,846.835l36.968,38.225l35.503-36.788L503.533,810.5L467.577,846.835z\n\t M504.535,885.06l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L504.535,885.06z M515.38,917.074\n\tl-26.464-6.325L451.957,872.4l-10.552-32.023l26.18,6.458l36.968,38.225L515.38,917.074z M503.534,810.497l9.4-42.91l46.91-4.55\n\tl36.76,38.13l-9.77,42.79l-46.79,4.31L503.534,810.497z M705.289,766.574l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311\n\tl9.776-42.792L705.289,766.574z M631.835,764.683l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.407-42.905\n\tL631.835,764.683z M613.02,850.38l36.968,38.225l35.503-36.788l-36.514-37.771L613.02,850.38z M649.978,888.606l10.835,32.014\n\tl46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L649.978,888.606z M660.814,920.619l-26.464-6.325l-36.959-38.348\n\tl-10.552-32.023l26.18,6.458l36.968,38.225L660.814,920.619z M648.974,814.037l9.4-42.9l46.91-4.56l36.77,38.13l-9.78,42.79\n\tl-46.79,4.31L648.974,814.037z M558.343,613.549l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\tL558.343,613.549z M484.898,611.658l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L484.898,611.658z\n\t M466.073,697.356l36.968,38.225l35.503-36.788l-36.514-37.771L466.073,697.356z M503.042,735.581l10.835,32.014l46.121-4.179\n\tl36.117-36.902l-10.779-32.042l-46.792,4.311L503.042,735.581z M513.877,767.595l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L513.877,767.595z M502.034,661.017l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31\n\tL502.034,661.017z M656.88,621.652l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L656.88,621.652z M630.331,615.204l-35.465,36.571\n\tl-9.53,42.669l26.18,6.458l35.957-36.334l9.407-42.905L630.331,615.204z M611.516,700.892l36.968,38.225l35.503-36.788\n\tl-36.514-37.772L611.516,700.892z M648.485,739.117l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311\n\tL648.485,739.117z M659.32,771.131l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L659.32,771.131z\n\t M703.786,617.095l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311l9.776-42.792L703.786,617.095z M705.44,766.952\n\tl36.921,37.847l-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L705.44,766.952z M559.351,762.952l36.921,37.847\n\tl-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L559.351,762.952z M558.351,613.625l36.921,37.847l-9.521,42.669\n\tl-47.356,4.339l-36.51-37.77l10.346-42.906L558.351,613.625z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 423, 0, 43709);
    			attr_dev(path2, "id", "stage1");
    			attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M410.63,462.113l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.772l46.792-4.311l9.776-42.792L410.63,462.113z M337.185,460.222l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.335\n\t\tl9.408-42.905L337.185,460.222z M318.37,545.92l36.968,38.225l35.503-36.788l-36.514-37.772L318.37,545.92z M355.329,584.145\n\t\tl10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L355.329,584.145z M366.164,616.159l-26.464-6.325\n\t\tl-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L366.164,616.159z M354.324,509.577l9.4-42.9l46.91-4.56l36.77,38.13\n\t\tl-9.78,42.79l-46.79,4.31L354.324,509.577z M556.073,464.118l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792\n\t\tL556.073,464.118z M482.619,462.227l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.335l9.408-42.905L482.619,462.227z\n\t\tM463.804,547.915l36.968,38.225l35.503-36.788l-36.514-37.772L463.804,547.915z M592.843,502.249l10.674,32.127l-9.663,42.707\n\t\tl-10.779-32.042L592.843,502.249z M500.772,586.14l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311\n\t\tL500.772,586.14z M511.608,618.154l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L511.608,618.154z\n\t\tM499.764,511.577l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31L499.764,511.577z M410.63,312.635l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L410.63,312.635z M337.185,310.744l-35.465,36.571l-9.53,42.669l26.18,6.458\n\t\tl35.957-36.334l9.408-42.905L337.185,310.744z M318.37,396.432l36.968,38.225l35.503-36.788l-36.514-37.772L318.37,396.432z\n\t\tM355.329,434.657l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L355.329,434.657z M366.164,466.671\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L366.164,466.671z M354.324,360.097l9.4-42.91l46.91-4.55\n\t\tl36.77,38.13l-9.78,42.79l-46.79,4.31L354.324,360.097z M556.073,314.639l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\t\tl9.776-42.792L556.073,314.639z M482.619,312.739l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL482.619,312.739z M463.804,398.436l36.968,38.225l35.503-36.788l-36.514-37.772L463.804,398.436z M592.843,352.76l10.674,32.127\n\t\tl-9.663,42.707l-10.779-32.042L592.843,352.76z M500.772,436.661l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042\n\t\tl-46.792,4.311L500.772,436.661z M511.608,468.675l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225\n\t\tL511.608,468.675z M410.634,312.637l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L410.634,312.637z\n\t\tM556.081,314.641l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L556.081,314.641z M556.074,464.117\n\t\tl36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L556.074,464.117z M410.916,462.461l36.766,38.128l-9.776,42.792\n\t\tl-46.79,4.31l-36.51-37.77l9.4-42.91L410.916,462.461z M508.892,319.336l46.905-4.557l37.05,37.99l-9.776,42.792l-46.79,4.31\n\t\tl-36.51-37.77L508.892,319.336z");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 447, 1, 46493);
    			attr_dev(path3, "id", "stage2");
    			attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M119.198,455.39l-46.905,4.557l-9.408,42.905L99.4,540.624\n\t\tl46.792-4.311l9.776-42.792L119.198,455.39z M45.744,453.499L10.279,490.07l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL45.744,453.499z M26.929,539.187l36.968,38.225L99.4,540.625l-36.514-37.771L26.929,539.187z M63.887,577.413l10.835,32.014\n\t\tl46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L63.887,577.413z M74.732,609.427l-26.464-6.325l-36.959-38.348\n\t\tL0.758,532.73l26.18,6.458l36.968,38.225L74.732,609.427z M62.884,502.849l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31\n\t\tL62.884,502.849z M264.641,458.388l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792L264.641,458.388z\n\t\tM191.187,456.497l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,456.497z M172.372,542.185\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.771L172.372,542.185z M209.33,580.41l10.835,32.014l46.121-4.179l36.117-36.902\n\t\tl-10.778-32.042l-46.792,4.311L209.33,580.41z M220.175,612.424l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458\n\t\tl36.968,38.225L220.175,612.424z M208.324,505.849l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31L208.324,505.849z\n\t\tM119.198,305.902l-46.905,4.557l-9.408,42.905L99.4,391.136l46.792-4.311l9.776-42.792L119.198,305.902z M45.744,304.011\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.744,304.011z M26.929,389.709l36.968,38.225L99.4,391.146\n\t\tl-36.514-37.772L26.929,389.709z M63.887,427.934l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311\n\t\tL63.887,427.934z M74.732,459.948l-26.464-6.325l-36.959-38.348L0.758,383.251l26.18,6.458l36.968,38.225L74.732,459.948z\n\t\tM62.884,353.369l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31L62.884,353.369z M264.641,308.909l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L264.641,308.909z M191.187,307.018l-35.465,36.571l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L191.187,307.018z M172.372,392.706l36.968,38.225l35.503-36.788l-36.514-37.772\n\t\tL172.372,392.706z M209.33,430.931l10.835,32.014l46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L209.33,430.931z\n\t\tM220.175,462.945l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L220.175,462.945z M208.324,356.369\n\t\tl9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31L208.324,356.369z M119.198,156.423l-46.905,4.557l-9.408,42.905\n\t\tL99.4,241.657l46.792-4.311l9.776-42.792L119.198,156.423z M45.744,154.532l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334\n\t\tl9.408-42.905L45.744,154.532z M26.929,240.22l36.968,38.225L99.4,241.657l-36.514-37.772L26.929,240.22z M63.887,278.446\n\t\tl10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L63.887,278.446z M74.732,310.459l-26.464-6.325\n\t\tl-36.959-38.348L0.758,233.763l26.18,6.458l36.968,38.225L74.732,310.459z M62.884,203.888l9.41-42.91l46.9-4.56l36.77,38.13\n\t\tl-9.78,42.8l-46.79,4.31L62.884,203.888z M264.641,159.42l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792\n\t\tL264.641,159.42z M191.187,157.529L155.722,194.1l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,157.529z\n\t\tM172.372,243.227l36.968,38.225l35.503-36.788l-36.514-37.772L172.372,243.227z M209.33,281.452l10.835,32.014l46.121-4.179\n\t\tl36.117-36.902l-10.778-32.042l-46.792,4.311L209.33,281.452z M220.175,313.466l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L220.175,313.466z M208.324,206.888l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31\n\t\tL208.324,206.888z M409.63,162.427l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L409.63,162.427z\n\t\tM336.185,160.536l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L336.185,160.536z M317.37,246.224\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.772L317.37,246.224z M354.329,284.449l10.835,32.014l46.121-4.179l36.117-36.902\n\t\tl-10.779-32.042l-46.792,4.311L354.329,284.449z M365.164,316.463l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458\n\t\tl36.968,38.225L365.164,316.463z M353.324,209.888l9.4-42.91l46.91-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L353.324,209.888z\n\t\tM555.073,164.422l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L555.073,164.422z M481.619,162.531\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L481.619,162.531z M462.804,248.228l36.968,38.225\n\t\tl35.503-36.788l-36.514-37.772L462.804,248.228z M591.843,202.553l10.674,32.127l-9.663,42.707l-10.779-32.042L591.843,202.553z\n\t\tM499.772,286.444l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L499.772,286.444z M510.608,318.458\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L510.608,318.458z M498.764,211.888l9.41-42.91l46.9-4.56\n\t\tl36.77,38.13l-9.78,42.8l-46.79,4.31L498.764,211.888z M119.198,6.944l-46.905,4.557l-9.408,42.905L99.4,92.179l46.792-4.311\n\t\tl9.776-42.792L119.198,6.944z M45.744,5.053L10.279,41.624l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.744,5.053z\n\t\tM26.929,90.741l36.968,38.225L99.4,92.179L62.885,54.407L26.929,90.741z M63.887,128.967l10.835,32.014l46.12-4.179L156.96,119.9\n\t\tl-10.769-32.033L99.4,92.179L63.887,128.967z M74.732,160.98l-26.464-6.325l-36.959-38.348L0.758,84.284l26.18,6.458l36.968,38.225\n\t\tL74.732,160.98z M62.884,54.409l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L62.884,54.409z M264.641,9.942\n\t\tl-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L264.641,9.942z M191.187,8.051l-35.465,36.571l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L191.187,8.051z M172.372,93.739l36.968,38.225l35.503-36.788l-36.514-37.772\n\t\tL172.372,93.739z M209.33,131.964l10.835,32.014l46.121-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L209.33,131.964z\n\t\tM220.175,163.978l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L220.175,163.978z M208.324,57.409\n\t\tl9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L208.324,57.409z M409.63,12.939l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.772l46.792-4.311l9.776-42.792L409.63,12.939z M336.185,11.048l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334\n\t\tl9.408-42.905L336.185,11.048z M317.37,96.745l36.968,38.225l35.503-36.788l-36.514-37.772L317.37,96.745z M354.329,134.971\n\t\tl10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L354.329,134.971z M365.164,166.975l-26.464-6.325\n\t\tl-36.959-38.348L291.19,90.278l26.18,6.458l36.968,38.225L365.164,166.975z M353.324,60.409l9.4-42.91l46.91-4.56l36.77,38.13\n\t\tl-9.78,42.8l-46.79,4.31L353.324,60.409z M555.073,14.943L508.168,19.5l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792\n\t\tL555.073,14.943z M481.619,13.052l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L481.619,13.052z\n\t\tM462.804,98.74l36.968,38.225l35.503-36.788l-36.514-37.772L462.804,98.74z M591.843,53.074l10.674,32.127l-9.663,42.707\n\t\tl-10.779-32.042L591.843,53.074z M499.772,136.965l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311\n\t\tL499.772,136.965z M510.608,168.979l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L510.608,168.979z\n\t\tM498.764,62.409l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L498.764,62.409z M264.641,458.388l36.763,38.131\n\t\tl-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L264.641,458.388z M119.201,455.392l36.763,38.131l-9.78,42.79l-46.79,4.31\n\t\tl-36.51-37.77l9.412-42.904L119.201,455.392z M119.201,305.908l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904\n\t\tL119.201,305.908z M119.201,156.425l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L119.201,156.425z\n\t\tM119.203,6.943l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77L72.298,11.5L119.203,6.943z M264.647,9.943l36.763,38.131\n\t\tl-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L264.647,9.943z M409.636,12.943l36.763,38.131l-9.78,42.79l-46.79,4.31\n\t\tl-36.51-37.77l9.412-42.904L409.636,12.943z M555.081,14.945l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904\n\t\tL555.081,14.945z M555.081,164.423l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L555.081,164.423z\n\t\tM409.636,162.423l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.636,162.423z M264.647,458.388\n\t\tl36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L264.647,458.388z M264.641,308.91l36.763,38.131l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.412-42.904L264.641,308.91z M119.201,305.904l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.412-42.904L119.201,305.904z M119.203,455.388l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L119.203,455.388\n\t\tz M527.602,8.522l26.908,6.439l-46.905,4.557l-26.549-6.448L527.602,8.522z M382.802,6.404l26.908,6.439l-46.905,4.557\n\t\tl-26.549-6.448L382.802,6.404z M237.617,3.31l26.908,6.439l-46.905,4.557l-26.549-6.448L237.617,3.31z M92.29,0.506l26.908,6.439\n\t\tl-46.905,4.557L45.744,5.053L92.29,0.506z M264.641,159.42l36.079,37.686l-9.53,42.66l-46.356,4.892l-36.51-37.77l9.412-42.911\n\t\tL264.641,159.42z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 472, 1, 49551);
    			add_location(g0, file$4, 446, 0, 46488);
    			add_location(g1, file$4, 408, 0, 41969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path2, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path3, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(408:0) {#if Level == 2 & PeriodCycle === 'Preovulation'}",
    		ctx
    	});

    	return block;
    }

    // (549:0) {#if Level == 3 & PeriodCycle === 'Preovulation'}
    function create_if_block$1(ctx) {
    	let g1;
    	let path0;
    	let path1;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			attr_dev(path0, "id", "pyest");
    			attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			attr_dev(path0, "d", "M1141.673,1075.035l-46.905,4.557l-9.407,42.905\n\tl36.514,37.771l46.792-4.311l9.776-42.792L1141.673,1075.035z M1068.219,1073.144l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.407-42.906L1068.219,1073.144z M1049.403,1158.842l36.968,38.225l35.503-36.788l-36.514-37.771L1049.403,1158.842z\n\t M1178.442,1113.166l10.675,32.127l-9.663,42.707l-10.779-32.042L1178.442,1113.166z M1086.372,1197.067l10.835,32.014l46.12-4.179\n\tl36.117-36.902l-10.778-32.042l-46.792,4.311L1086.372,1197.067z M1097.207,1229.081l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L1097.207,1229.081z M1085.366,1122.503l9.4-42.91l46.91-4.55l36.76,38.12l-9.77,42.8l-46.79,4.31\n\tL1085.366,1122.503z M1140.179,925.556l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311l9.776-42.792L1140.179,925.556z\n\t M1093.274,930.114l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L1093.274,930.114z M1066.724,923.665l-35.465,36.571l-9.53,42.669\n\tl26.18,6.458l35.957-36.334l9.407-42.905L1066.724,923.665z M1047.909,1009.353l36.968,38.225l35.503-36.788l-36.514-37.771\n\tL1047.909,1009.353z M1176.939,963.687l10.674,32.127l-9.663,42.707l-10.779-32.042L1176.939,963.687z M1084.868,1047.579\n\tl10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L1084.868,1047.579z M1095.713,1079.593l-26.464-6.325\n\tl-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L1095.713,1079.593z M1083.866,973.023l9.41-42.91l46.9-4.56l36.77,38.13\n\tl-9.78,42.8l-46.79,4.31L1083.866,973.023z M1093.276,930.113l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77\n\tL1093.276,930.113z M1095.276,1079.592l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31l-36.51-37.77L1095.276,1079.592z");
    			attr_dev(path0, "class", "svelte-1vndjk9");
    			add_location(path0, file$4, 550, 0, 58648);
    			attr_dev(path1, "id", "yest");
    			attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			attr_dev(path1, "d", "M850.238,1067.954l-46.905,4.557l-9.408,42.905\n\tl36.515,37.771l46.792-4.311l9.776-42.792L850.238,1067.954z M776.784,1066.063l-35.465,36.571l-9.53,42.669l26.18,6.458\n\tl35.957-36.334l9.408-42.906L776.784,1066.063z M757.969,1151.751l36.968,38.225l35.503-36.788l-36.514-37.771L757.969,1151.751z\n\t M794.928,1189.976l10.835,32.014l46.12-4.179L888,1180.909l-10.779-32.042l-46.792,4.311L794.928,1189.976z M805.772,1221.99\n\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L805.772,1221.99z M793.926,1115.413l9.4-42.91l46.91-4.55\n\tl36.76,38.13l-9.77,42.79l-46.79,4.31L793.926,1115.413z M995.681,1071.49l-46.905,4.557l-9.407,42.905l36.514,37.772l46.792-4.311\n\tl9.776-42.792L995.681,1071.49z M922.227,1069.599l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.407-42.906\n\tL922.227,1069.599z M903.412,1155.296l36.968,38.225l35.503-36.788l-36.514-37.771L903.412,1155.296z M940.371,1193.522\n\tl10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L940.371,1193.522z M951.206,1225.535l-26.464-6.325\n\tl-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L951.206,1225.535z M939.366,1118.953l9.4-42.9l46.91-4.56l36.77,38.13\n\tl-9.78,42.79l-46.79,4.31L939.366,1118.953z M848.735,918.465l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\tL848.735,918.465z M775.29,916.574l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L775.29,916.574z\n\t M756.465,1002.272l36.968,38.225l35.503-36.788l-36.514-37.772L756.465,1002.272z M793.434,1040.497l10.835,32.014l46.121-4.179\n\tl36.117-36.902l-10.778-32.042l-46.792,4.311L793.434,1040.497z M804.269,1072.511l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\tl26.18,6.458l36.968,38.225L804.269,1072.511z M792.426,965.933l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31\n\tL792.426,965.933z M947.273,926.568l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L947.273,926.568z M920.724,920.12l-35.465,36.571\n\tl-9.53,42.669l26.18,6.458l35.957-36.334l9.407-42.905L920.724,920.12z M901.909,1005.808l36.968,38.225l35.503-36.788\n\tl-36.514-37.771L901.909,1005.808z M938.877,1044.033l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311\n\tL938.877,1044.033z M949.712,1076.047l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L949.712,1076.047z\n\t M994.178,922.011l-46.905,4.557l-9.407,42.905l36.514,37.771l46.792-4.311l9.776-42.792L994.178,922.011z M995.832,1071.868\n\tl36.921,37.847l-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L995.832,1071.868z M849.743,1067.868l36.921,37.847\n\tl-9.521,42.669l-47.356,4.339l-36.51-37.77l10.346-42.906L849.743,1067.868z M848.743,918.541l36.921,37.847l-9.521,42.669\n\tl-47.356,4.339l-36.51-37.77l10.346-42.906L848.743,918.541z");
    			attr_dev(path1, "class", "svelte-1vndjk9");
    			add_location(path1, file$4, 564, 0, 60444);
    			attr_dev(path2, "id", "stage3");
    			attr_dev(path2, "fill", /*Color3*/ ctx[6]);
    			attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path2, "d", "M119.198,754.358l-46.905,4.557l-9.408,42.905\n\t\tL99.4,839.592l46.792-4.311l9.776-42.792L119.198,754.358z M45.753,752.467l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334\n\t\tl9.408-42.905L45.753,752.467z M26.929,838.155l36.968,38.225L99.4,839.592L62.885,801.82L26.929,838.155z M63.897,876.38\n\t\tl10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042L99.4,839.582L63.897,876.38z M74.732,908.394l-26.464-6.325L11.309,863.72\n\t\tL0.758,831.697l26.18,6.458l36.968,38.225L74.732,908.394z M62.888,801.822l9.41-42.91l46.9-4.55l36.77,38.12l-9.78,42.8\n\t\tl-46.79,4.31L62.888,801.822z M264.641,756.362l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\t\tL264.641,756.362z M191.187,754.462l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,754.462z\n\t\tM172.372,840.159l36.968,38.225l35.503-36.788l-36.514-37.771L172.372,840.159z M209.34,878.385l10.835,32.014l46.12-4.179\n\t\tl36.117-36.902l-10.778-32.042l-46.792,4.311L209.34,878.385z M220.175,910.398l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L220.175,910.398z M208.328,803.822l9.41-42.91l46.91-4.55l36.76,38.12l-9.77,42.8l-46.8,4.31\n\t\tL208.328,803.822z M119.198,604.879l-46.905,4.557l-9.408,42.905L99.4,690.113l46.792-4.311l9.776-42.792L119.198,604.879z\n\t\tM45.753,602.988l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.753,602.988z M26.929,688.676\n\t\tl36.968,38.225L99.4,690.113l-36.514-37.772L26.929,688.676z M63.897,726.901l10.835,32.014l46.12-4.179l36.117-36.902\n\t\tl-10.778-32.042L99.4,690.104L63.897,726.901z M74.732,758.915l-26.464-6.325l-36.959-38.348L0.758,682.218l26.18,6.458\n\t\tl36.968,38.225L74.732,758.915z M62.888,652.342l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L62.888,652.342z\n\t\tM264.641,606.874l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L264.641,606.874z M191.187,604.983\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,604.983z M172.372,690.68l36.968,38.225\n\t\tl35.503-36.788l-36.514-37.772L172.372,690.68z M209.34,728.906l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042\n\t\tl-46.792,4.311L209.34,728.906z M220.175,760.91l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225\n\t\tL220.175,760.91z M208.328,654.342l9.41-42.91l46.91-4.56l36.76,38.13l-9.77,42.8l-46.8,4.31L208.328,654.342z M119.198,455.391\n\t\tl-46.905,4.557l-9.408,42.905L99.4,540.625l46.792-4.311l9.776-42.792L119.198,455.391z M45.753,453.5L10.288,490.07l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L45.753,453.5z M26.929,539.197l36.968,38.225L99.4,540.634l-36.514-37.772L26.929,539.197z\n\t\tM63.897,577.422l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042L99.4,540.625L63.897,577.422z M74.732,609.436\n\t\tl-26.464-6.325l-36.959-38.348L0.758,532.74l26.18,6.458l36.968,38.225L74.732,609.436z M62.888,502.852l9.41-42.9l46.9-4.56\n\t\tl36.77,38.13l-9.78,42.79l-46.79,4.31L62.888,502.852z M264.641,457.395l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\t\tl9.776-42.792L264.641,457.395z M191.187,455.504l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL191.187,455.504z M172.372,541.192l36.968,38.225l35.503-36.788l-36.514-37.772L172.372,541.192z M209.34,579.417l10.835,32.014\n\t\tl46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L209.34,579.417z M220.175,611.431l-26.464-6.325l-36.959-38.348\n\t\tl-10.552-32.023l26.18,6.458l36.968,38.225L220.175,611.431z M208.328,504.852l9.41-42.9l46.91-4.56l36.76,38.13l-9.77,42.79\n\t\tl-46.8,4.31L208.328,504.852z M119.198,305.912l-46.905,4.557l-9.408,42.905L99.4,391.146l46.792-4.311l9.776-42.792\n\t\tL119.198,305.912z M45.753,304.021l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.753,304.021z\n\t\tM26.929,389.709l36.968,38.225L99.4,391.146l-36.514-37.772L26.929,389.709z M63.897,427.934l10.835,32.014l46.12-4.179\n\t\tl36.117-36.902l-10.778-32.042L99.4,391.136L63.897,427.934z M74.732,459.948l-26.464-6.325l-36.959-38.348L0.758,383.251\n\t\tl26.18,6.458l36.968,38.225L74.732,459.948z M62.888,353.372l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31\n\t\tL62.888,353.372z M264.641,307.907l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L264.641,307.907z\n\t\tM191.187,306.016l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,306.016z M172.372,391.713\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.772L172.372,391.713z M209.34,429.938l10.835,32.014l46.12-4.179l36.117-36.902\n\t\tl-10.778-32.042l-46.792,4.311L209.34,429.938z M220.175,461.952l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458\n\t\tl36.968,38.225L220.175,461.952z M208.328,355.372l9.41-42.91l46.91-4.55l36.76,38.13l-9.77,42.79l-46.8,4.31L208.328,355.372z\n\t\tM119.198,156.433l-46.905,4.557l-9.408,42.905L99.4,241.667l46.792-4.311l9.776-42.792L119.198,156.433z M45.753,154.532\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.753,154.532z M26.929,240.23l36.968,38.225L99.4,241.667\n\t\tl-36.514-37.772L26.929,240.23z M63.897,278.455l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042L99.4,241.658\n\t\tL63.897,278.455z M74.732,310.469l-26.464-6.325l-36.959-38.348L0.758,233.772l26.18,6.458l36.968,38.225L74.732,310.469z\n\t\tM62.888,203.892l9.41-42.91l46.9-4.55l36.77,38.12l-9.78,42.8l-46.79,4.31L62.888,203.892z M264.641,158.428l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L264.641,158.428z M191.187,156.537l-35.465,36.571l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L191.187,156.537z M172.372,242.225l36.968,38.225l35.503-36.788l-36.514-37.772\n\t\tL172.372,242.225z M209.34,280.45l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L209.34,280.45z\n\t\tM220.175,312.464l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L220.175,312.464z M208.328,205.892\n\t\tl9.41-42.91l46.91-4.55l36.76,38.12l-9.77,42.8l-46.8,4.31L208.328,205.892z M410.642,162.55l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.772l46.792-4.311l9.776-42.792L410.642,162.55z M337.188,160.659l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334\n\t\tl9.408-42.905L337.188,160.659z M318.373,246.356l36.968,38.225l35.503-36.788l-36.514-37.772L318.373,246.356z M355.331,284.582\n\t\tl10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L355.331,284.582z M366.176,316.586l-26.464-6.325\n\t\tl-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L366.176,316.586z M354.328,210.012l9.41-42.9l46.9-4.56l36.77,38.13\n\t\tl-9.78,42.79l-46.79,4.31L354.328,210.012z M556.085,165.557l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792\n\t\tL556.085,165.557z M482.631,163.656l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L482.631,163.656z\n\t\tM463.816,249.354l36.968,38.225l35.503-36.788l-36.514-37.772L463.816,249.354z M500.775,287.579l10.835,32.014l46.12-4.179\n\t\tl36.117-36.902l-10.779-32.042l-46.792,4.311L500.775,287.579z M511.619,319.593l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L511.619,319.593z M499.768,213.012l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31\n\t\tL499.768,213.012z M701.074,168.554l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L701.074,168.554z\n\t\tM627.63,166.663l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L627.63,166.663z M608.815,252.351\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.772L608.815,252.351z M645.773,290.576l10.835,32.014l46.121-4.179l36.117-36.902\n\t\tl-10.779-32.042l-46.792,4.311L645.773,290.576z M656.609,322.59l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458\n\t\tl36.968,38.225L656.609,322.59z M644.768,216.012l9.4-42.9l46.91-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31L644.768,216.012z\n\t\tM846.518,170.549l-46.905,4.557l-9.408,42.905l36.515,37.772l46.792-4.311l9.776-42.792L846.518,170.549z M773.063,168.658\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L773.063,168.658z M754.248,254.355l36.968,38.225\n\t\tl35.503-36.788l-36.514-37.772L754.248,254.355z M883.287,208.679l10.674,32.127l-9.663,42.707l-10.779-32.042L883.287,208.679z\n\t\tM791.217,292.581l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L791.217,292.581z M802.052,324.594\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L802.052,324.594z M790.208,218.012l9.41-42.9l46.9-4.56\n\t\tl36.77,38.13l-9.78,42.79l-46.79,4.31L790.208,218.012z M119.198,6.944l-46.905,4.557l-9.408,42.905L99.4,92.179l46.792-4.311\n\t\tl9.776-42.792L119.198,6.944z M72.293,11.502L45.744,5.053L92.29,0.506l26.908,6.439l0,0L72.293,11.502z M45.753,5.054\n\t\tL10.288,41.624l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L45.753,5.054z M26.929,90.751l36.968,38.225L99.4,92.188\n\t\tL62.885,54.416L26.929,90.751z M63.897,128.967l10.835,32.014l46.12-4.179L156.97,119.9l-10.778-32.042L99.4,92.169L63.897,128.967z\n\t\tM74.732,160.981l-26.464-6.325l-36.959-38.348L0.758,84.284l26.18,6.458l36.968,38.225L74.732,160.981z M62.888,54.412l9.41-42.91\n\t\tl46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L62.888,54.412z M264.641,8.949l-46.905,4.557l-9.408,42.905l36.514,37.772\n\t\tl46.792-4.311l9.776-42.792L264.641,8.949z M217.736,13.506l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L217.736,13.506z\n\t\tM191.187,7.058l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L191.187,7.058z M172.372,92.746l36.968,38.225\n\t\tl35.503-36.788l-36.514-37.772L172.372,92.746z M209.34,130.971l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042\n\t\tl-46.792,4.311L209.34,130.971z M220.175,162.985l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225\n\t\tL220.175,162.985z M208.328,56.412l9.41-42.91l46.91-4.56l36.76,38.13l-9.77,42.8l-46.8,4.31L208.328,56.412z M410.642,13.071\n\t\tl-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L410.642,13.071z M363.737,17.628l-26.549-6.448l46.546-4.548\n\t\tl26.908,6.439l0,0L363.737,17.628z M337.188,11.18l-35.465,36.571l-9.53,42.66l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL337.188,11.18z M318.373,96.868l36.968,38.225l35.503-36.788l-36.514-37.772L318.373,96.868z M355.331,135.094l10.835,32.014\n\t\tl46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L355.331,135.094z M366.176,167.107l-26.464-6.325l-36.959-38.348\n\t\tl-10.561-32.023l26.18,6.458l36.968,38.225L366.176,167.107z M354.328,60.532l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79\n\t\tl-46.79,4.31L354.328,60.532z M556.085,16.068l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L556.085,16.068\n\t\tz M509.18,20.625l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L509.18,20.625z M482.631,14.177l-35.465,36.571l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L482.631,14.177z M463.816,99.875l36.968,38.225l35.503-36.788L499.772,63.54\n\t\tL463.816,99.875z M500.775,138.1l10.835,32.014l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L500.775,138.1z\n\t\tM511.619,170.104l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L511.619,170.104z M499.768,63.532\n\t\tl9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31L499.768,63.532z M701.074,19.075l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.772l46.792-4.311l9.776-42.792L701.074,19.075z M654.169,23.623l-26.549-6.448l46.546-4.548l26.908,6.439l0,0\n\t\tL654.169,23.623z M627.63,17.174l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L627.63,17.174z\n\t\tM608.815,102.872l36.968,38.225l35.503-36.788l-36.514-37.772L608.815,102.872z M645.773,141.097l10.835,32.014l46.121-4.179\n\t\tl36.117-36.902l-10.779-32.042l-46.792,4.311L645.773,141.097z M656.609,173.111l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L656.609,173.111z M644.768,66.532l9.4-42.91l46.91-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31\n\t\tL644.768,66.532z M846.518,21.07l-46.905,4.557l-9.408,42.905l36.515,37.772l46.792-4.311l9.776-42.792L846.518,21.07z\n\t\tM799.612,25.627l-26.549-6.448l46.546-4.548l26.908,6.439l0,0L799.612,25.627z M773.063,19.179L737.598,55.75l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L773.063,19.179z M754.248,104.867l36.968,38.225l35.503-36.788l-36.514-37.772\n\t\tL754.248,104.867z M883.287,59.201l10.674,32.127l-9.663,42.707l-10.779-32.042L883.287,59.201z M791.217,143.092l10.835,32.014\n\t\tl46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L791.217,143.092z M802.052,175.106l-26.464-6.325l-36.959-38.348\n\t\tl-10.552-32.023l26.18,6.458l36.968,38.225L802.052,175.106z M790.208,68.532l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79\n\t\tl-46.79,4.31L790.208,68.532z M846.518,170.549l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L846.518,170.549z\n\t\tM846.516,21.07l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L846.516,21.07z M701.078,19.071l36.771,38.134\n\t\tl-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L701.078,19.071z M556.083,16.068l36.771,38.134l-9.78,42.79l-46.79,4.31\n\t\tl-36.51-37.77l9.404-42.907L556.083,16.068z M410.64,13.071l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907\n\t\tL410.64,13.071z M264.638,8.946l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L264.638,8.946z M119.196,7.29\n\t\tl36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L119.196,7.29z M119.196,156.431l36.771,38.134l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.404-42.907L119.196,156.431z M264.638,158.431l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.404-42.907L264.638,158.431z M410.638,162.55l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L410.638,162.55z\n\t\tM556.078,165.557l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L556.078,165.557z M701.072,168.551\n\t\tl36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L701.072,168.551z M264.638,307.911l36.771,38.134l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.404-42.907L264.638,307.911z M119.196,305.911l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.404-42.907L119.196,305.911z M119.196,455.391l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L119.196,455.391\n\t\tz M264.638,457.391l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L264.638,457.391z M264.638,606.874\n\t\tl36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L264.638,606.874z M119.196,604.879l36.771,38.134l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.404-42.907L119.196,604.879z M119.196,754.358l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.404-42.907L119.196,754.358z M264.639,756.362l36.771,38.134l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.404-42.907L264.639,756.362\n\t\tz");
    			attr_dev(path2, "class", "svelte-1vndjk9");
    			add_location(path2, file$4, 588, 1, 63274);
    			attr_dev(path3, "id", "stage1");
    			attr_dev(path3, "fill", /*Color1*/ ctx[4]);
    			attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path3, "d", "M701.022,767.029l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.771l46.792-4.311l9.776-42.792L701.022,767.029z M627.578,765.138l-35.465,36.571l-9.53,42.669l26.18,6.458\n\t\tl35.957-36.335l9.408-42.905L627.578,765.138z M608.763,850.836l36.968,38.225l35.503-36.788l-36.514-37.772L608.763,850.836z\n\t\tM645.721,889.061l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L645.721,889.061z M656.557,921.075\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L656.557,921.075z M644.716,814.493l9.4-42.9l46.91-4.56\n\t\tl36.77,38.13l-9.78,42.79l-46.79,4.31L644.716,814.493z M846.466,769.034l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311\n\t\tl9.776-42.792L846.466,769.034z M773.011,767.143l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.335l9.408-42.905\n\t\tL773.011,767.143z M754.196,852.831l36.968,38.225l35.503-36.788l-36.514-37.771L754.196,852.831z M883.235,807.165l10.674,32.127\n\t\tl-9.663,42.707l-10.779-32.042L883.235,807.165z M791.165,891.056L802,923.07l46.12-4.179l36.117-36.902l-10.779-32.042\n\t\tl-46.792,4.311L791.165,891.056z M802,923.07l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L802,923.07z\n\t\tM790.156,816.493l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31L790.156,816.493z M701.022,617.551l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L701.022,617.551z M627.578,615.66l-35.465,36.571l-9.53,42.669l26.18,6.458\n\t\tl35.957-36.334l9.408-42.905L627.578,615.66z M608.763,701.348l36.968,38.225l35.503-36.788l-36.514-37.772L608.763,701.348z\n\t\tM645.721,739.573l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L645.721,739.573z M656.557,771.587\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L656.557,771.587z M644.716,665.013l9.4-42.91l46.91-4.55\n\t\tl36.77,38.13l-9.78,42.79l-46.79,4.31L644.716,665.013z M846.466,619.555l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\t\tl9.776-42.792L846.466,619.555z M773.011,617.655l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL773.011,617.655z M754.196,703.352l36.968,38.225l35.503-36.788l-36.514-37.772L754.196,703.352z M883.235,657.676l10.674,32.127\n\t\tl-9.663,42.707l-10.779-32.042L883.235,657.676z M791.165,741.577L802,773.591l46.121-4.179l36.117-36.902l-10.779-32.042\n\t\tl-46.792,4.311L791.165,741.577z M802,773.591l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L802,773.591z\n\t\tM701.026,617.553l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L701.026,617.553z M846.473,619.557\n\t\tl36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77l9.4-42.91L846.473,619.557z M846.466,769.033l36.766,38.128l-9.776,42.792\n\t\tl-46.79,4.31l-36.51-37.77l9.4-42.91L846.466,769.033z M701.308,767.377l36.766,38.128l-9.776,42.792l-46.79,4.31l-36.51-37.77\n\t\tl9.4-42.91L701.308,767.377z M799.284,624.252l46.905-4.557l37.05,37.99l-9.776,42.792l-46.79,4.31l-36.51-37.77L799.284,624.252z");
    			attr_dev(path3, "class", "svelte-1vndjk9");
    			add_location(path3, file$4, 706, 1, 77640);
    			attr_dev(path4, "id", "stage2");
    			attr_dev(path4, "fill", /*Color2*/ ctx[5]);
    			attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			attr_dev(path4, "d", "M409.59,760.306l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.771l46.792-4.311l9.776-42.792L409.59,760.306z M336.136,758.415l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334\n\t\tl9.408-42.905L336.136,758.415z M317.321,844.103l36.968,38.225l35.503-36.788l-36.514-37.771L317.321,844.103z M354.28,882.329\n\t\tl10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311L354.28,882.329z M365.124,914.342l-26.464-6.325\n\t\tl-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L365.124,914.342z M353.276,807.765l9.41-42.9l46.9-4.56l36.77,38.13\n\t\tl-9.78,42.79l-46.79,4.31L353.276,807.765z M555.033,763.304l-46.905,4.557l-9.408,42.905l36.514,37.771l46.792-4.311l9.776-42.792\n\t\tL555.033,763.304z M481.579,761.413l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L481.579,761.413z\n\t\tM462.764,847.101l36.968,38.225l35.503-36.788l-36.514-37.771L462.764,847.101z M499.723,885.326l10.835,32.014l46.121-4.179\n\t\tl36.117-36.902l-10.779-32.042l-46.792,4.311L499.723,885.326z M510.567,917.34l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L510.567,917.34z M498.716,810.765l9.41-42.9l46.9-4.56l36.77,38.13l-9.78,42.79l-46.79,4.31\n\t\tL498.716,810.765z M409.59,610.818l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L409.59,610.818z\n\t\tM336.136,608.927l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L336.136,608.927z M317.321,694.625\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.772L317.321,694.625z M354.28,732.85l10.835,32.014l46.12-4.179l36.117-36.902\n\t\tl-10.778-32.042l-46.792,4.311L354.28,732.85z M365.124,764.864l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458\n\t\tl36.968,38.225L365.124,764.864z M353.276,658.285l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31L353.276,658.285z\n\t\tM555.033,613.825l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L555.033,613.825z M481.579,611.934\n\t\tl-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L481.579,611.934z M462.764,697.622l36.968,38.225\n\t\tl35.503-36.788l-36.514-37.772L462.764,697.622z M499.723,735.847l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042\n\t\tl-46.792,4.311L499.723,735.847z M510.567,767.861l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225\n\t\tL510.567,767.861z M498.716,661.285l9.41-42.91l46.9-4.55l36.77,38.13l-9.78,42.79l-46.79,4.31L498.716,661.285z M409.59,461.339\n\t\tl-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L409.59,461.339z M336.136,459.448l-35.465,36.571\n\t\tl-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L336.136,459.448z M317.321,545.136l36.968,38.225l35.503-36.788\n\t\tl-36.514-37.772L317.321,545.136z M354.28,583.362l10.835,32.014l46.12-4.179l36.117-36.902l-10.778-32.042l-46.792,4.311\n\t\tL354.28,583.362z M365.124,615.375l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L365.124,615.375z\n\t\tM353.276,508.804l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L353.276,508.804z M555.033,464.336l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L555.033,464.336z M481.579,462.445l-35.465,36.571l-9.53,42.669\n\t\tl26.18,6.458l35.957-36.334l9.408-42.905L481.579,462.445z M462.764,548.143l36.968,38.225l35.503-36.788l-36.514-37.772\n\t\tL462.764,548.143z M499.723,586.368l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L499.723,586.368z\n\t\tM510.567,618.382l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L510.567,618.382z M498.716,511.804\n\t\tl9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L498.716,511.804z M700.022,467.343l-46.905,4.557l-9.408,42.905\n\t\tl36.514,37.772l46.792-4.311l9.776-42.792L700.022,467.343z M626.578,465.452l-35.465,36.571l-9.53,42.669l26.18,6.458\n\t\tl35.957-36.334l9.408-42.905L626.578,465.452z M607.763,551.14l36.968,38.225l35.503-36.788l-36.514-37.772L607.763,551.14z\n\t\tM644.721,589.365l10.835,32.014l46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L644.721,589.365z M655.557,621.379\n\t\tl-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L655.557,621.379z M643.716,514.805l9.4-42.91l46.91-4.56\n\t\tl36.77,38.13l-9.78,42.8l-46.79,4.31L643.716,514.805z M845.466,469.338l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\t\tl9.776-42.792L845.466,469.338z M772.011,467.447l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL772.011,467.447z M753.196,553.144l36.968,38.225l35.503-36.788l-36.514-37.772L753.196,553.144z M882.235,507.469l10.674,32.127\n\t\tl-9.663,42.707l-10.779-32.042L882.235,507.469z M790.165,591.36L801,623.374l46.12-4.179l36.117-36.902l-10.779-32.042\n\t\tl-46.792,4.311L790.165,591.36z M801,623.374l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L801,623.374z\n\t\tM789.156,516.805l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L789.156,516.805z M409.59,311.86l-46.905,4.557\n\t\tl-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L409.59,311.86z M336.136,309.969l-35.465,36.571l-9.53,42.669l26.18,6.458\n\t\tl35.957-36.334l9.408-42.905L336.136,309.969z M317.321,395.657l36.968,38.225l35.503-36.788l-36.514-37.772L317.321,395.657z\n\t\tM354.28,433.883l10.835,32.014l46.12-4.179l36.117-36.902l-10.769-32.033l-46.792,4.311L354.28,433.883z M365.124,465.896\n\t\tl-26.464-6.325l-36.959-38.348L291.15,389.2l26.18,6.458l36.968,38.225L365.124,465.896z M353.276,359.324l9.41-42.91l46.9-4.56\n\t\tl36.77,38.13l-9.78,42.8l-46.79,4.31L353.276,359.324z M555.033,314.857l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311\n\t\tl9.776-42.792L555.033,314.857z M481.579,312.967l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905\n\t\tL481.579,312.967z M462.764,398.655l36.968,38.225l35.503-36.788L498.72,362.32L462.764,398.655z M499.723,436.88l10.835,32.014\n\t\tl46.121-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L499.723,436.88z M510.567,468.894l-26.464-6.325l-36.959-38.348\n\t\tl-10.552-32.023l26.18,6.458l36.968,38.225L510.567,468.894z M498.716,362.324l9.41-42.91l46.9-4.56l36.77,38.13l-9.78,42.8\n\t\tl-46.79,4.31L498.716,362.324z M700.022,317.855l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792\n\t\tL700.022,317.855z M626.578,315.964l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L626.578,315.964z\n\t\tM607.763,401.661l36.968,38.225l35.503-36.788l-36.514-37.772L607.763,401.661z M644.721,439.887l10.835,32.014l46.121-4.179\n\t\tl36.117-36.902l-10.779-32.042l-46.792,4.311L644.721,439.887z M655.557,471.891l-26.464-6.325l-36.959-38.348l-10.552-32.023\n\t\tl26.18,6.458l36.968,38.225L655.557,471.891z M643.716,365.324l9.4-42.91l46.91-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31\n\t\tL643.716,365.324z M845.466,319.859l-46.905,4.557l-9.408,42.905l36.514,37.772l46.792-4.311l9.776-42.792L845.466,319.859z\n\t\tM772.011,317.968l-35.465,36.571l-9.53,42.669l26.18,6.458l35.957-36.334l9.408-42.905L772.011,317.968z M753.196,403.656\n\t\tl36.968,38.225l35.503-36.788l-36.514-37.772L753.196,403.656z M882.235,357.99l10.674,32.127l-9.663,42.707l-10.779-32.042\n\t\tL882.235,357.99z M790.165,441.881L801,473.895l46.12-4.179l36.117-36.902l-10.779-32.042l-46.792,4.311L790.165,441.881z\n\t\tM801,473.895l-26.464-6.325l-36.959-38.348l-10.552-32.023l26.18,6.458l36.968,38.225L801,473.895z M789.156,367.324l9.41-42.91\n\t\tl46.9-4.56l36.77,38.13l-9.78,42.8l-46.79,4.31L789.156,367.324z M555.033,763.304l36.763,38.131l-9.78,42.79l-46.79,4.31\n\t\tl-36.51-37.77l9.412-42.904L555.033,763.304z M409.593,760.308l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904\n\t\tL409.593,760.308z M409.593,610.824l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.593,610.824z\n\t\tM409.593,461.341l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.593,461.341z M409.596,311.859\n\t\tl36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.596,311.859z M555.039,314.859l36.763,38.131l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.412-42.904L555.039,314.859z M700.028,317.859l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.412-42.904L700.028,317.859z M845.473,319.861l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L845.473,319.861\n\t\tz M845.473,469.339l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L845.473,469.339z M700.028,467.339\n\t\tl36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L700.028,467.339z M555.039,763.304l36.763,38.131l-9.78,42.79\n\t\tl-46.79,4.31l-36.51-37.77l9.412-42.904L555.039,763.304z M555.033,613.826l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77\n\t\tl9.412-42.904L555.033,613.826z M409.593,610.82l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.593,610.82z\n\t\tM409.596,760.304l36.763,38.131l-9.78,42.79l-46.79,4.31l-36.51-37.77l9.412-42.904L409.596,760.304z M555.033,464.336\n\t\tl36.079,37.686l-9.53,42.66l-46.356,4.892l-36.51-37.77l9.412-42.911L555.033,464.336z");
    			attr_dev(path4, "class", "svelte-1vndjk9");
    			add_location(path4, file$4, 731, 1, 80686);
    			add_location(g0, file$4, 587, 0, 63269);
    			add_location(g1, file$4, 549, 0, 58644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, path0);
    			append_dev(g1, path1);
    			append_dev(g1, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(tooltip.call(null, path0)),
    					listen_dev(path0, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path0, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path1)),
    					listen_dev(path1, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path1, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path2)),
    					listen_dev(path2, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path2, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path3)),
    					listen_dev(path3, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path3, "mouseout", handleMouseOut, false, false, false),
    					action_destroyer(tooltip.call(null, path4)),
    					listen_dev(path4, "mouseover", handleMouseOver, false, false, false),
    					listen_dev(path4, "mouseout", handleMouseOut, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ColorPYest*/ 4) {
    				attr_dev(path0, "fill", /*ColorPYest*/ ctx[2]);
    			}

    			if (dirty & /*Tooltip3Feeling*/ 128) {
    				attr_dev(path0, "title", /*Tooltip3Feeling*/ ctx[7]);
    			}

    			if (dirty & /*ColorYest*/ 8) {
    				attr_dev(path1, "fill", /*ColorYest*/ ctx[3]);
    			}

    			if (dirty & /*Tooltip2Feeling*/ 256) {
    				attr_dev(path1, "title", /*Tooltip2Feeling*/ ctx[8]);
    			}

    			if (dirty & /*Color3*/ 64) {
    				attr_dev(path2, "fill", /*Color3*/ ctx[6]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path2, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color1*/ 16) {
    				attr_dev(path3, "fill", /*Color1*/ ctx[4]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path3, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}

    			if (dirty & /*Color2*/ 32) {
    				attr_dev(path4, "fill", /*Color2*/ ctx[5]);
    			}

    			if (dirty & /*Tooltip1Feeling*/ 512) {
    				attr_dev(path4, "title", /*Tooltip1Feeling*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(549:0) {#if Level == 3 & PeriodCycle === 'Preovulation'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let if_block11_anchor;
    	let if_block0 = /*Level*/ ctx[0] == 1 && /*PeriodCycle*/ ctx[1] === "Ovulation" && create_if_block_11(ctx);
    	let if_block1 = /*Level*/ ctx[0] == 2 && /*PeriodCycle*/ ctx[1] === "Ovulation" && create_if_block_10(ctx);
    	let if_block2 = /*Level*/ ctx[0] == 3 && /*PeriodCycle*/ ctx[1] === "Ovulation" && create_if_block_9(ctx);
    	let if_block3 = /*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Menstruation" && create_if_block_8(ctx);
    	let if_block4 = /*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Menstruation" && create_if_block_7(ctx);
    	let if_block5 = /*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Menstruation" && create_if_block_6(ctx);
    	let if_block6 = /*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Premenstrual" && create_if_block_5(ctx);
    	let if_block7 = /*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Premenstrual" && create_if_block_4(ctx);
    	let if_block8 = /*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Premenstrual" && create_if_block_3(ctx);
    	let if_block9 = /*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Preovulation" && create_if_block_2(ctx);
    	let if_block10 = /*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Preovulation" && create_if_block_1(ctx);
    	let if_block11 = /*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Preovulation" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			if (if_block8) if_block8.c();
    			t8 = space();
    			if (if_block9) if_block9.c();
    			t9 = space();
    			if (if_block10) if_block10.c();
    			t10 = space();
    			if (if_block11) if_block11.c();
    			if_block11_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, if_block11_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*Level*/ ctx[0] == 1 && /*PeriodCycle*/ ctx[1] === "Ovulation") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*Level*/ ctx[0] == 2 && /*PeriodCycle*/ ctx[1] === "Ovulation") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*Level*/ ctx[0] == 3 && /*PeriodCycle*/ ctx[1] === "Ovulation") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_9(ctx);
    					if_block2.c();
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Menstruation") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_8(ctx);
    					if_block3.c();
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Menstruation") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_7(ctx);
    					if_block4.c();
    					if_block4.m(t4.parentNode, t4);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Menstruation") {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_6(ctx);
    					if_block5.c();
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Premenstrual") {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_5(ctx);
    					if_block6.c();
    					if_block6.m(t6.parentNode, t6);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Premenstrual") {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_4(ctx);
    					if_block7.c();
    					if_block7.m(t7.parentNode, t7);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Premenstrual") {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_3(ctx);
    					if_block8.c();
    					if_block8.m(t8.parentNode, t8);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*Level*/ ctx[0] == 1 & /*PeriodCycle*/ ctx[1] === "Preovulation") {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block_2(ctx);
    					if_block9.c();
    					if_block9.m(t9.parentNode, t9);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (/*Level*/ ctx[0] == 2 & /*PeriodCycle*/ ctx[1] === "Preovulation") {
    				if (if_block10) {
    					if_block10.p(ctx, dirty);
    				} else {
    					if_block10 = create_if_block_1(ctx);
    					if_block10.c();
    					if_block10.m(t10.parentNode, t10);
    				}
    			} else if (if_block10) {
    				if_block10.d(1);
    				if_block10 = null;
    			}

    			if (/*Level*/ ctx[0] == 3 & /*PeriodCycle*/ ctx[1] === "Preovulation") {
    				if (if_block11) {
    					if_block11.p(ctx, dirty);
    				} else {
    					if_block11 = create_if_block$1(ctx);
    					if_block11.c();
    					if_block11.m(if_block11_anchor.parentNode, if_block11_anchor);
    				}
    			} else if (if_block11) {
    				if_block11.d(1);
    				if_block11 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block5) if_block5.d(detaching);
    			if (detaching) detach_dev(t5);
    			if (if_block6) if_block6.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (if_block7) if_block7.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block8) if_block8.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block9) if_block9.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block10) if_block10.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block11) if_block11.d(detaching);
    			if (detaching) detach_dev(if_block11_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleMouseOver(e) {
    	e.target.style.stroke = "white";
    	e.target.style.strokeWidth = "4px";
    }

    //create a function to mouse out
    function handleMouseOut(e) {
    	e.target.style.stroke = "#212121";
    	e.target.style.strokeWidth = "2px";
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menstrual", slots, []);
    	let { Level } = $$props;
    	let { PeriodCycle } = $$props;
    	let { ColorPYest } = $$props;
    	let { ColorYest } = $$props;
    	let { Color1 } = $$props;
    	let { Color2 } = $$props;
    	let { Color3 } = $$props;
    	let { Tooltip3Feeling } = $$props;
    	let { Tooltip2Feeling } = $$props;
    	let { Tooltip1Feeling } = $$props;
    	let color;

    	const writable_props = [
    		"Level",
    		"PeriodCycle",
    		"ColorPYest",
    		"ColorYest",
    		"Color1",
    		"Color2",
    		"Color3",
    		"Tooltip3Feeling",
    		"Tooltip2Feeling",
    		"Tooltip1Feeling"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menstrual> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("Level" in $$props) $$invalidate(0, Level = $$props.Level);
    		if ("PeriodCycle" in $$props) $$invalidate(1, PeriodCycle = $$props.PeriodCycle);
    		if ("ColorPYest" in $$props) $$invalidate(2, ColorPYest = $$props.ColorPYest);
    		if ("ColorYest" in $$props) $$invalidate(3, ColorYest = $$props.ColorYest);
    		if ("Color1" in $$props) $$invalidate(4, Color1 = $$props.Color1);
    		if ("Color2" in $$props) $$invalidate(5, Color2 = $$props.Color2);
    		if ("Color3" in $$props) $$invalidate(6, Color3 = $$props.Color3);
    		if ("Tooltip3Feeling" in $$props) $$invalidate(7, Tooltip3Feeling = $$props.Tooltip3Feeling);
    		if ("Tooltip2Feeling" in $$props) $$invalidate(8, Tooltip2Feeling = $$props.Tooltip2Feeling);
    		if ("Tooltip1Feeling" in $$props) $$invalidate(9, Tooltip1Feeling = $$props.Tooltip1Feeling);
    	};

    	$$self.$capture_state = () => ({
    		tooltipv1: tooltip,
    		Level,
    		PeriodCycle,
    		ColorPYest,
    		ColorYest,
    		Color1,
    		Color2,
    		Color3,
    		Tooltip3Feeling,
    		Tooltip2Feeling,
    		Tooltip1Feeling,
    		color,
    		handleMouseOver,
    		handleMouseOut
    	});

    	$$self.$inject_state = $$props => {
    		if ("Level" in $$props) $$invalidate(0, Level = $$props.Level);
    		if ("PeriodCycle" in $$props) $$invalidate(1, PeriodCycle = $$props.PeriodCycle);
    		if ("ColorPYest" in $$props) $$invalidate(2, ColorPYest = $$props.ColorPYest);
    		if ("ColorYest" in $$props) $$invalidate(3, ColorYest = $$props.ColorYest);
    		if ("Color1" in $$props) $$invalidate(4, Color1 = $$props.Color1);
    		if ("Color2" in $$props) $$invalidate(5, Color2 = $$props.Color2);
    		if ("Color3" in $$props) $$invalidate(6, Color3 = $$props.Color3);
    		if ("Tooltip3Feeling" in $$props) $$invalidate(7, Tooltip3Feeling = $$props.Tooltip3Feeling);
    		if ("Tooltip2Feeling" in $$props) $$invalidate(8, Tooltip2Feeling = $$props.Tooltip2Feeling);
    		if ("Tooltip1Feeling" in $$props) $$invalidate(9, Tooltip1Feeling = $$props.Tooltip1Feeling);
    		if ("color" in $$props) color = $$props.color;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		Level,
    		PeriodCycle,
    		ColorPYest,
    		ColorYest,
    		Color1,
    		Color2,
    		Color3,
    		Tooltip3Feeling,
    		Tooltip2Feeling,
    		Tooltip1Feeling
    	];
    }

    class Menstrual extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			Level: 0,
    			PeriodCycle: 1,
    			ColorPYest: 2,
    			ColorYest: 3,
    			Color1: 4,
    			Color2: 5,
    			Color3: 6,
    			Tooltip3Feeling: 7,
    			Tooltip2Feeling: 8,
    			Tooltip1Feeling: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menstrual",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*Level*/ ctx[0] === undefined && !("Level" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Level'");
    		}

    		if (/*PeriodCycle*/ ctx[1] === undefined && !("PeriodCycle" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'PeriodCycle'");
    		}

    		if (/*ColorPYest*/ ctx[2] === undefined && !("ColorPYest" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'ColorPYest'");
    		}

    		if (/*ColorYest*/ ctx[3] === undefined && !("ColorYest" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'ColorYest'");
    		}

    		if (/*Color1*/ ctx[4] === undefined && !("Color1" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Color1'");
    		}

    		if (/*Color2*/ ctx[5] === undefined && !("Color2" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Color2'");
    		}

    		if (/*Color3*/ ctx[6] === undefined && !("Color3" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Color3'");
    		}

    		if (/*Tooltip3Feeling*/ ctx[7] === undefined && !("Tooltip3Feeling" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Tooltip3Feeling'");
    		}

    		if (/*Tooltip2Feeling*/ ctx[8] === undefined && !("Tooltip2Feeling" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Tooltip2Feeling'");
    		}

    		if (/*Tooltip1Feeling*/ ctx[9] === undefined && !("Tooltip1Feeling" in props)) {
    			console.warn("<Menstrual> was created without expected prop 'Tooltip1Feeling'");
    		}
    	}

    	get Level() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Level(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get PeriodCycle() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set PeriodCycle(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ColorPYest() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ColorPYest(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ColorYest() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ColorYest(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Color1() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Color1(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Color2() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Color2(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Color3() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Color3(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Tooltip3Feeling() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Tooltip3Feeling(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Tooltip2Feeling() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Tooltip2Feeling(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Tooltip1Feeling() {
    		throw new Error("<Menstrual>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Tooltip1Feeling(value) {
    		throw new Error("<Menstrual>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Fecha.svelte generated by Svelte v3.35.0 */

    const file$3 = "src/Fecha.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3;
    	let p1;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text$1(/*day*/ ctx[1]);
    			t1 = space();
    			p0 = element("p");
    			t2 = text$1(/*menstruation*/ ctx[2]);
    			t3 = space();
    			p1 = element("p");
    			t4 = text$1(/*data*/ ctx[0]);
    			attr_dev(h1, "class", "svelte-qnggzw");
    			add_location(h1, file$3, 33, 4, 603);
    			attr_dev(p0, "class", "svelte-qnggzw");
    			add_location(p0, file$3, 34, 4, 622);
    			attr_dev(p1, "class", "svelte-qnggzw");
    			add_location(p1, file$3, 36, 4, 649);
    			attr_dev(div, "class", "fecha svelte-qnggzw");
    			add_location(div, file$3, 32, 0, 579);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			append_dev(p1, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*day*/ 2) set_data_dev(t0, /*day*/ ctx[1]);
    			if (dirty & /*menstruation*/ 4) set_data_dev(t2, /*menstruation*/ ctx[2]);
    			if (dirty & /*data*/ 1) set_data_dev(t4, /*data*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fecha", slots, []);
    	let { data } = $$props;
    	let { day } = $$props;
    	let { menstruation } = $$props;
    	const writable_props = ["data", "day", "menstruation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fecha> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("day" in $$props) $$invalidate(1, day = $$props.day);
    		if ("menstruation" in $$props) $$invalidate(2, menstruation = $$props.menstruation);
    	};

    	$$self.$capture_state = () => ({ data, day, menstruation });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("day" in $$props) $$invalidate(1, day = $$props.day);
    		if ("menstruation" in $$props) $$invalidate(2, menstruation = $$props.menstruation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, day, menstruation];
    }

    class Fecha extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0, day: 1, menstruation: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fecha",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Fecha> was created without expected prop 'data'");
    		}

    		if (/*day*/ ctx[1] === undefined && !("day" in props)) {
    			console.warn("<Fecha> was created without expected prop 'day'");
    		}

    		if (/*menstruation*/ ctx[2] === undefined && !("menstruation" in props)) {
    			console.warn("<Fecha> was created without expected prop 'menstruation'");
    		}
    	}

    	get data() {
    		throw new Error("<Fecha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Fecha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get day() {
    		throw new Error("<Fecha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set day(value) {
    		throw new Error("<Fecha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menstruation() {
    		throw new Error("<Fecha>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menstruation(value) {
    		throw new Error("<Fecha>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Fecha2.svelte generated by Svelte v3.35.0 */

    const file$2 = "src/Fecha2.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text$1(/*data*/ ctx[0]);
    			attr_dev(p, "class", "svelte-1qzgjvg");
    			add_location(p, file$2, 17, 4, 352);
    			attr_dev(div, "class", "fecha svelte-1qzgjvg");
    			add_location(div, file$2, 16, 0, 328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1) set_data_dev(t, /*data*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Fecha2", slots, []);
    	let { data } = $$props;
    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fecha2> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data];
    }

    class Fecha2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fecha2",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Fecha2> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Fecha2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Fecha2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/svelte-scroller/Scroller.svelte generated by Svelte v3.35.0 */

    const { window: window_1 } = globals;
    const file$1 = "node_modules/@sveltejs/svelte-scroller/Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment$1(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	const background_slot_template = /*#slots*/ ctx[19].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[18], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[19].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[18], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_background, file$1, 169, 2, 3916);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-xdbafy");
    			set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			add_location(svelte_scroller_background_container, file$1, 168, 1, 3838);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_foreground, file$1, 174, 1, 4078);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_outer, file$1, 167, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[21](svelte_scroller_background);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && dirty[0] & /*$$scope*/ 262144) {
    					update_slot(background_slot, background_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_background_slot_changes, get_background_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*style*/ 16) {
    				set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && dirty[0] & /*$$scope*/ 262144) {
    					update_slot(foreground_slot, foreground_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_foreground_slot_changes, get_foreground_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const handlers = [];
    let manager;

    if (typeof window !== "undefined") {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener("scroll", run_all);
    	window.addEventListener("resize", run_all);
    }

    if (typeof IntersectionObserver !== "undefined") {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: "400px 0px", // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scroller", slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = "section" } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let outer;
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(6, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		$$invalidate(17, width = bcr.right - left);

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(9, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(8, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			$$invalidate(16, offset_top = 0);
    			$$invalidate(15, fixed = false);
    		} else if (progress >= 1) {
    			$$invalidate(16, offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space);

    			$$invalidate(15, fixed = false);
    		} else {
    			$$invalidate(16, offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px);

    			$$invalidate(15, fixed = true);
    		}

    		for ($$invalidate(5, index = 0); index < sections.length; $$invalidate(5, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(7, offset = (threshold_px - top) / (bottom - top));
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		"top",
    		"bottom",
    		"threshold",
    		"query",
    		"parallax",
    		"index",
    		"count",
    		"offset",
    		"progress",
    		"visible"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, wh = window_1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			foreground = $$value;
    			$$invalidate(2, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			outer = $$value;
    			$$invalidate(1, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		outer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		update,
    		top_px,
    		bottom_px,
    		threshold_px,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("outer" in $$props) $$invalidate(1, outer = $$props.outer);
    		if ("foreground" in $$props) $$invalidate(2, foreground = $$props.foreground);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("left" in $$props) left = $$props.left;
    		if ("sections" in $$props) sections = $$props.sections;
    		if ("wh" in $$props) $$invalidate(0, wh = $$props.wh);
    		if ("fixed" in $$props) $$invalidate(15, fixed = $$props.fixed);
    		if ("offset_top" in $$props) $$invalidate(16, offset_top = $$props.offset_top);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) height = $$props.height;
    		if ("inverted" in $$props) $$invalidate(30, inverted = $$props.inverted);
    		if ("top_px" in $$props) top_px = $$props.top_px;
    		if ("bottom_px" in $$props) bottom_px = $$props.bottom_px;
    		if ("threshold_px" in $$props) threshold_px = $$props.threshold_px;
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 1025) {
    			top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 2049) {
    			bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 4097) {
    			threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 23552) {
    			(update());
    		}

    		if ($$self.$$.dirty[0] & /*fixed, offset_top, width*/ 229376) {
    			$$invalidate(4, style = `
		position: ${fixed ? "fixed" : "absolute"};
		top: 0;
		transform: translate(0, ${offset_top}px);
		width: ${width}px;
		z-index: ${inverted ? 3 : 1};
	`);
    		}
    	};

    	return [
    		wh,
    		outer,
    		foreground,
    		background,
    		style,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		fixed,
    		offset_top,
    		width,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				top: 10,
    				bottom: 11,
    				threshold: 12,
    				query: 13,
    				parallax: 14,
    				index: 5,
    				count: 6,
    				offset: 7,
    				progress: 8,
    				visible: 9
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.35.0 */
    const file = "src/App.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (211:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t1;
    	let br0;
    	let br1;
    	let t2;
    	let scroller;
    	let updating_index;
    	let updating_offset;
    	let updating_progress;
    	let current;
    	let mounted;
    	let dispose;

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[11](value);
    	}

    	function scroller_offset_binding(value) {
    		/*scroller_offset_binding*/ ctx[12](value);
    	}

    	function scroller_progress_binding(value) {
    		/*scroller_progress_binding*/ ctx[13](value);
    	}

    	let scroller_props = {
    		top: 0.2,
    		bottom: 0.8,
    		$$slots: {
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[1] !== void 0) {
    		scroller_props.index = /*index*/ ctx[1];
    	}

    	if (/*offset*/ ctx[2] !== void 0) {
    		scroller_props.offset = /*offset*/ ctx[2];
    	}

    	if (/*progress*/ ctx[3] !== void 0) {
    		scroller_props.progress = /*progress*/ ctx[3];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "offset", scroller_offset_binding));
    	binding_callbacks.push(() => bind(scroller, "progress", scroller_progress_binding));

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "DAY BY DAY";
    			t1 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t2 = space();
    			create_component(scroller.$$.fragment);
    			add_location(button, file, 212, 1, 6707);
    			add_location(br0, file, 213, 1, 6754);
    			add_location(br1, file, 213, 5, 6758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(scroller, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, dades, index*/ 524291) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 2) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[1];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_offset && dirty & /*offset*/ 4) {
    				updating_offset = true;
    				scroller_changes.offset = /*offset*/ ctx[2];
    				add_flush_callback(() => updating_offset = false);
    			}

    			if (!updating_progress && dirty & /*progress*/ 8) {
    				updating_progress = true;
    				scroller_changes.progress = /*progress*/ ctx[3];
    				add_flush_callback(() => updating_progress = false);
    			}

    			scroller.$set(scroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t2);
    			destroy_component(scroller, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(211:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (186:0) {#if user.loggedIn}
    function create_if_block(ctx) {
    	let button;
    	let t1;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*dades*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "CALENDAR VIEW";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button, file, 187, 1, 5613);
    			attr_dev(div, "class", "calendarView svelte-b10b9k");
    			add_location(div, file, 188, 1, 5664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dades*/ 1) {
    				each_value = /*dades*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(186:0) {#if user.loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (217:2) 
    function create_background_slot(ctx) {
    	let div;
    	let fecha;
    	let current;

    	fecha = new Fecha({
    			props: {
    				data: /*dades*/ ctx[0][/*index*/ ctx[1]].Fecha,
    				day: /*dades*/ ctx[0][/*index*/ ctx[1]].Day,
    				menstruation: /*dades*/ ctx[0][/*index*/ ctx[1]].PeriodCycle
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fecha.$$.fragment);
    			attr_dev(div, "class", "EachDay svelte-b10b9k");
    			attr_dev(div, "slot", "background");
    			add_location(div, file, 216, 2, 6991);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fecha, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fecha_changes = {};
    			if (dirty & /*dades, index*/ 3) fecha_changes.data = /*dades*/ ctx[0][/*index*/ ctx[1]].Fecha;
    			if (dirty & /*dades, index*/ 3) fecha_changes.day = /*dades*/ ctx[0][/*index*/ ctx[1]].Day;
    			if (dirty & /*dades, index*/ 3) fecha_changes.menstruation = /*dades*/ ctx[0][/*index*/ ctx[1]].PeriodCycle;
    			fecha.$set(fecha_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fecha.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fecha.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fecha);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(217:2) ",
    		ctx
    	});

    	return block;
    }

    // (229:3) {#each dades as d }
    function create_each_block_1(ctx) {
    	let section;
    	let svg;
    	let menstrual;
    	let t;
    	let current;

    	menstrual = new Menstrual({
    			props: {
    				PeriodCycle: /*d*/ ctx[14].PeriodCycle,
    				Level: /*d*/ ctx[14].Level,
    				ColorPYest: /*d*/ ctx[14].PastYestColor,
    				ColorYest: /*d*/ ctx[14].YestColor,
    				Color1: /*d*/ ctx[14].Stage1Color,
    				Color2: /*d*/ ctx[14].Stage2Color,
    				Color3: /*d*/ ctx[14].Stage3Color,
    				Tooltip1Feeling: /*d*/ ctx[14].Tooltip1Feeling,
    				Tooltip2Feeling: /*d*/ ctx[14].Tooltip2Feeling,
    				Tooltip3Feeling: /*d*/ ctx[14].Tooltip3Feeling
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");
    			create_component(menstrual.$$.fragment);
    			t = space();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 1313.56 1346.17");
    			attr_dev(svg, "height", "500px");
    			add_location(svg, file, 231, 3, 7927);
    			attr_dev(section, "height", "80vh");
    			attr_dev(section, "class", "svelte-b10b9k");
    			add_location(section, file, 229, 3, 7794);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);
    			mount_component(menstrual, svg, null);
    			append_dev(section, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menstrual_changes = {};
    			if (dirty & /*dades*/ 1) menstrual_changes.PeriodCycle = /*d*/ ctx[14].PeriodCycle;
    			if (dirty & /*dades*/ 1) menstrual_changes.Level = /*d*/ ctx[14].Level;
    			if (dirty & /*dades*/ 1) menstrual_changes.ColorPYest = /*d*/ ctx[14].PastYestColor;
    			if (dirty & /*dades*/ 1) menstrual_changes.ColorYest = /*d*/ ctx[14].YestColor;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color1 = /*d*/ ctx[14].Stage1Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color2 = /*d*/ ctx[14].Stage2Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color3 = /*d*/ ctx[14].Stage3Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip1Feeling = /*d*/ ctx[14].Tooltip1Feeling;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip2Feeling = /*d*/ ctx[14].Tooltip2Feeling;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip3Feeling = /*d*/ ctx[14].Tooltip3Feeling;
    			menstrual.$set(menstrual_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menstrual.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menstrual.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(menstrual);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(229:3) {#each dades as d }",
    		ctx
    	});

    	return block;
    }

    // (227:2) 
    function create_foreground_slot(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*dades*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "figure svelte-b10b9k");
    			attr_dev(div, "slot", "foreground");
    			add_location(div, file, 226, 2, 7552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dades*/ 1) {
    				each_value_1 = /*dades*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(227:2) ",
    		ctx
    	});

    	return block;
    }

    // (191:2) {#each dades as d }
    function create_each_block(ctx) {
    	let div;
    	let fecha2;
    	let t0;
    	let svg;
    	let menstrual;
    	let t1;
    	let current;

    	fecha2 = new Fecha2({
    			props: { data: /*d*/ ctx[14].Fecha },
    			$$inline: true
    		});

    	menstrual = new Menstrual({
    			props: {
    				PeriodCycle: /*d*/ ctx[14].PeriodCycle,
    				Level: /*d*/ ctx[14].Level,
    				ColorPYest: /*d*/ ctx[14].PastYestColor,
    				ColorYest: /*d*/ ctx[14].YestColor,
    				Color1: /*d*/ ctx[14].Stage1Color,
    				Color2: /*d*/ ctx[14].Stage2Color,
    				Color3: /*d*/ ctx[14].Stage3Color,
    				Tooltip1Feeling: /*d*/ ctx[14].Tooltip1Feeling,
    				Tooltip2Feeling: /*d*/ ctx[14].Tooltip2Feeling,
    				Tooltip3Feeling: /*d*/ ctx[14].Tooltip3Feeling
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fecha2.$$.fragment);
    			t0 = space();
    			svg = svg_element("svg");
    			create_component(menstrual.$$.fragment);
    			t1 = space();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "viewBox", "0 0 1313.56 1346.17");
    			attr_dev(svg, "width", "150px");
    			add_location(svg, file, 194, 3, 6048);
    			attr_dev(div, "class", "fech svelte-b10b9k");
    			add_location(div, file, 191, 3, 5847);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fecha2, div, null);
    			append_dev(div, t0);
    			append_dev(div, svg);
    			mount_component(menstrual, svg, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const fecha2_changes = {};
    			if (dirty & /*dades*/ 1) fecha2_changes.data = /*d*/ ctx[14].Fecha;
    			fecha2.$set(fecha2_changes);
    			const menstrual_changes = {};
    			if (dirty & /*dades*/ 1) menstrual_changes.PeriodCycle = /*d*/ ctx[14].PeriodCycle;
    			if (dirty & /*dades*/ 1) menstrual_changes.Level = /*d*/ ctx[14].Level;
    			if (dirty & /*dades*/ 1) menstrual_changes.ColorPYest = /*d*/ ctx[14].PastYestColor;
    			if (dirty & /*dades*/ 1) menstrual_changes.ColorYest = /*d*/ ctx[14].YestColor;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color1 = /*d*/ ctx[14].Stage1Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color2 = /*d*/ ctx[14].Stage2Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Color3 = /*d*/ ctx[14].Stage3Color;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip1Feeling = /*d*/ ctx[14].Tooltip1Feeling;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip2Feeling = /*d*/ ctx[14].Tooltip2Feeling;
    			if (dirty & /*dades*/ 1) menstrual_changes.Tooltip3Feeling = /*d*/ ctx[14].Tooltip3Feeling;
    			menstrual.$set(menstrual_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fecha2.$$.fragment, local);
    			transition_in(menstrual.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fecha2.$$.fragment, local);
    			transition_out(menstrual.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fecha2);
    			destroy_component(menstrual);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(191:2) {#each dades as d }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div3;
    	let div0;
    	let h1;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let h20;
    	let t4;
    	let p0;
    	let t6;
    	let div1;
    	let h21;
    	let t8;
    	let p1;
    	let t10;
    	let table0;
    	let tbody0;
    	let tr0;
    	let th0;
    	let t12;
    	let th1;
    	let t14;
    	let th2;
    	let t16;
    	let th3;
    	let t18;
    	let tr1;
    	let th4;
    	let img0;
    	let img0_src_value;
    	let t19;
    	let td0;
    	let img1;
    	let img1_src_value;
    	let t20;
    	let td1;
    	let img2;
    	let img2_src_value;
    	let t21;
    	let td2;
    	let img3;
    	let img3_src_value;
    	let t22;
    	let p2;
    	let t24;
    	let table1;
    	let tbody1;
    	let tr2;
    	let th5;
    	let t26;
    	let th6;
    	let t28;
    	let th7;
    	let t30;
    	let th8;
    	let t32;
    	let tr3;
    	let th9;
    	let t34;
    	let td3;
    	let t36;
    	let td4;
    	let t38;
    	let td5;
    	let t40;
    	let tr4;
    	let th10;
    	let t42;
    	let td6;
    	let t44;
    	let td7;
    	let t46;
    	let td8;
    	let t48;
    	let p3;
    	let t50;
    	let img4;
    	let img4_src_value;
    	let t51;
    	let div2;
    	let h3;
    	let t53;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[4].loggedIn) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text$1("Life is a roller ");
    			br = element("br");
    			t1 = text$1(" coaster");
    			t2 = space();
    			h20 = element("h2");
    			h20.textContent = "PUTTING EMOTIONS AT THE CENTER DURING 60 DAYS";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "We live in a society that operates at a very high rate of production, even in the midst of a global pandemic. And eventhough we try to do the same job every day, we are not always an homogeneous version of ourselves. This work is puts the emotional ups and downs at the center to see how we fluctuate between moods. And how these changes are cause and consequence at the same time of the different stages of the menstrual cycle.";
    			t6 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "HOW TO READ THE CHART";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Each shape represents one different stage of the period cycle";
    			t10 = space();
    			table0 = element("table");
    			tbody0 = element("tbody");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "MENSTRUATION";
    			t12 = space();
    			th1 = element("th");
    			th1.textContent = "PREOVULATION";
    			t14 = space();
    			th2 = element("th");
    			th2.textContent = "OVULATION";
    			t16 = space();
    			th3 = element("th");
    			th3.textContent = "PREMENSTRUAL";
    			t18 = space();
    			tr1 = element("tr");
    			th4 = element("th");
    			img0 = element("img");
    			t19 = space();
    			td0 = element("td");
    			img1 = element("img");
    			t20 = space();
    			td1 = element("td");
    			img2 = element("img");
    			t21 = space();
    			td2 = element("td");
    			img3 = element("img");
    			t22 = space();
    			p2 = element("p");
    			p2.textContent = "The colors represent the main feeling of the day";
    			t24 = space();
    			table1 = element("table");
    			tbody1 = element("tbody");
    			tr2 = element("tr");
    			th5 = element("th");
    			th5.textContent = "ECSTACY";
    			t26 = space();
    			th6 = element("th");
    			th6.textContent = "GRIEF";
    			t28 = space();
    			th7 = element("th");
    			th7.textContent = "TERROR";
    			t30 = space();
    			th8 = element("th");
    			th8.textContent = "RAGE";
    			t32 = space();
    			tr3 = element("tr");
    			th9 = element("th");
    			th9.textContent = "JOY";
    			t34 = space();
    			td3 = element("td");
    			td3.textContent = "SADNESS";
    			t36 = space();
    			td4 = element("td");
    			td4.textContent = "FEAR";
    			t38 = space();
    			td5 = element("td");
    			td5.textContent = "ANGER";
    			t40 = space();
    			tr4 = element("tr");
    			th10 = element("th");
    			th10.textContent = "SERENITY";
    			t42 = space();
    			td6 = element("td");
    			td6.textContent = "PENSIVENESS";
    			t44 = space();
    			td7 = element("td");
    			td7.textContent = "APPRENSION";
    			t46 = space();
    			td8 = element("td");
    			td8.textContent = "ANNOYANCE";
    			t48 = space();
    			p3 = element("p");
    			p3.textContent = "The composition represent the current day and feelings of the two last days";
    			t50 = space();
    			img4 = element("img");
    			t51 = space();
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "EXPLORE THE 60 DAYS UPS AND DOWNS";
    			t53 = space();
    			if_block.c();
    			add_location(br, file, 130, 23, 2856);
    			attr_dev(h1, "class", "svelte-b10b9k");
    			add_location(h1, file, 130, 2, 2835);
    			set_style(h20, "margin-bottom", "0px");
    			set_style(h20, "padding-bottom", "0px");
    			attr_dev(h20, "class", "svelte-b10b9k");
    			add_location(h20, file, 131, 2, 2876);
    			attr_dev(p0, "class", "svelte-b10b9k");
    			add_location(p0, file, 132, 2, 2980);
    			attr_dev(div0, "class", "expl svelte-b10b9k");
    			add_location(div0, file, 129, 1, 2814);
    			attr_dev(h21, "class", "svelte-b10b9k");
    			add_location(h21, file, 135, 2, 3450);
    			attr_dev(p1, "class", "svelte-b10b9k");
    			add_location(p1, file, 136, 2, 3483);
    			attr_dev(th0, "class", "svelte-b10b9k");
    			add_location(th0, file, 140, 4, 3601);
    			attr_dev(th1, "class", "svelte-b10b9k");
    			add_location(th1, file, 141, 4, 3627);
    			attr_dev(th2, "class", "svelte-b10b9k");
    			add_location(th2, file, 142, 4, 3653);
    			attr_dev(th3, "class", "svelte-b10b9k");
    			add_location(th3, file, 143, 4, 3676);
    			add_location(tr0, file, 139, 5, 3592);
    			if (img0.src !== (img0_src_value = /*menstruation*/ ctx[5])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "70px;");
    			attr_dev(img0, "alt", "menstruation");
    			add_location(img0, file, 147, 8, 3731);
    			attr_dev(th4, "class", "svelte-b10b9k");
    			add_location(th4, file, 147, 4, 3727);
    			if (img1.src !== (img1_src_value = /*preovulation*/ ctx[6])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "70px;");
    			attr_dev(img1, "alt", "preovulation");
    			add_location(img1, file, 148, 8, 3803);
    			add_location(td0, file, 148, 4, 3799);
    			if (img2.src !== (img2_src_value = /*ovulation*/ ctx[7])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "width", "70px;");
    			attr_dev(img2, "alt", "ovulation");
    			add_location(img2, file, 149, 8, 3875);
    			add_location(td1, file, 149, 4, 3871);
    			if (img3.src !== (img3_src_value = /*premenstruation*/ ctx[8])) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "width", "70px;");
    			attr_dev(img3, "alt", "premenstruation");
    			add_location(img3, file, 150, 8, 3941);
    			add_location(td2, file, 150, 4, 3937);
    			add_location(tr1, file, 146, 5, 3718);
    			add_location(tbody0, file, 138, 3, 3579);
    			attr_dev(table0, "class", "table svelte-b10b9k");
    			add_location(table0, file, 137, 2, 3554);
    			set_style(p2, "padding-top", "4%");
    			attr_dev(p2, "class", "svelte-b10b9k");
    			add_location(p2, file, 154, 2, 4052);
    			attr_dev(th5, "height", "30px;");
    			set_style(th5, "background-color", "#ffce00");
    			attr_dev(th5, "class", "svelte-b10b9k");
    			add_location(th5, file, 158, 4, 4181);
    			attr_dev(th6, "height", "30px;");
    			set_style(th6, "background-color", "#0269b3");
    			attr_dev(th6, "class", "svelte-b10b9k");
    			add_location(th6, file, 159, 4, 4251);
    			attr_dev(th7, "height", "30px;");
    			set_style(th7, "background-color", "#53136d");
    			attr_dev(th7, "class", "svelte-b10b9k");
    			add_location(th7, file, 160, 4, 4318);
    			attr_dev(th8, "height", "30px;");
    			set_style(th8, "background-color", "#cc0000");
    			attr_dev(th8, "class", "svelte-b10b9k");
    			add_location(th8, file, 161, 4, 4386);
    			add_location(tr2, file, 157, 5, 4172);
    			attr_dev(th9, "height", "30px;");
    			set_style(th9, "background-color", "#ffde80");
    			set_style(th9, "color", "#212121");
    			attr_dev(th9, "class", "svelte-b10b9k");
    			add_location(th9, file, 165, 4, 4477);
    			attr_dev(td3, "height", "30px;");
    			set_style(td3, "background-color", "#7ea4d9");
    			set_style(td3, "color", "#212121");
    			add_location(td3, file, 166, 4, 4556);
    			attr_dev(td4, "height", "30px;");
    			set_style(td4, "background-color", "#a375b3");
    			set_style(td4, "color", "#212121");
    			add_location(td4, file, 167, 4, 4639);
    			attr_dev(td5, "height", "30px;");
    			set_style(td5, "background-color", "#ed6464");
    			set_style(td5, "color", "#212121");
    			add_location(td5, file, 168, 4, 4719);
    			add_location(tr3, file, 164, 5, 4468);
    			attr_dev(th10, "height", "30px;");
    			set_style(th10, "background-color", "#f9edb4");
    			set_style(th10, "color", "#212121");
    			attr_dev(th10, "class", "svelte-b10b9k");
    			add_location(th10, file, 171, 4, 4821);
    			attr_dev(td6, "height", "30px;");
    			set_style(td6, "background-color", "#d1e3ff");
    			set_style(td6, "color", "#212121");
    			add_location(td6, file, 172, 4, 4905);
    			attr_dev(td7, "height", "30px;");
    			set_style(td7, "background-color", "#f4dafc");
    			set_style(td7, "color", "#212121");
    			add_location(td7, file, 173, 4, 4992);
    			attr_dev(td8, "height", "30px;");
    			set_style(td8, "background-color", "#ffcccc");
    			set_style(td8, "color", "#212121");
    			add_location(td8, file, 174, 4, 5078);
    			add_location(tr4, file, 170, 5, 4812);
    			add_location(tbody1, file, 156, 3, 4159);
    			attr_dev(table1, "class", "table svelte-b10b9k");
    			add_location(table1, file, 155, 2, 4134);
    			set_style(p3, "padding-top", "4%");
    			attr_dev(p3, "class", "svelte-b10b9k");
    			add_location(p3, file, 178, 2, 5200);
    			if (img4.src !== (img4_src_value = /*legend*/ ctx[9])) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "width", "60%");
    			attr_dev(img4, "alt", "legend");
    			add_location(img4, file, 179, 2, 5309);
    			attr_dev(div1, "class", "legend svelte-b10b9k");
    			add_location(div1, file, 134, 1, 3427);
    			attr_dev(h3, "class", "svelte-b10b9k");
    			add_location(h3, file, 182, 2, 5384);
    			attr_dev(div2, "class", "titulo svelte-b10b9k");
    			add_location(div2, file, 181, 1, 5363);
    			attr_dev(div3, "class", "intro");
    			add_location(div3, file, 128, 0, 2793);
    			attr_dev(main, "class", "svelte-b10b9k");
    			add_location(main, file, 126, 1, 2745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br);
    			append_dev(h1, t1);
    			append_dev(div0, t2);
    			append_dev(div0, h20);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(div3, t6);
    			append_dev(div3, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div1, t10);
    			append_dev(div1, table0);
    			append_dev(table0, tbody0);
    			append_dev(tbody0, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t12);
    			append_dev(tr0, th1);
    			append_dev(tr0, t14);
    			append_dev(tr0, th2);
    			append_dev(tr0, t16);
    			append_dev(tr0, th3);
    			append_dev(tbody0, t18);
    			append_dev(tbody0, tr1);
    			append_dev(tr1, th4);
    			append_dev(th4, img0);
    			append_dev(tr1, t19);
    			append_dev(tr1, td0);
    			append_dev(td0, img1);
    			append_dev(tr1, t20);
    			append_dev(tr1, td1);
    			append_dev(td1, img2);
    			append_dev(tr1, t21);
    			append_dev(tr1, td2);
    			append_dev(td2, img3);
    			append_dev(div1, t22);
    			append_dev(div1, p2);
    			append_dev(div1, t24);
    			append_dev(div1, table1);
    			append_dev(table1, tbody1);
    			append_dev(tbody1, tr2);
    			append_dev(tr2, th5);
    			append_dev(tr2, t26);
    			append_dev(tr2, th6);
    			append_dev(tr2, t28);
    			append_dev(tr2, th7);
    			append_dev(tr2, t30);
    			append_dev(tr2, th8);
    			append_dev(tbody1, t32);
    			append_dev(tbody1, tr3);
    			append_dev(tr3, th9);
    			append_dev(tr3, t34);
    			append_dev(tr3, td3);
    			append_dev(tr3, t36);
    			append_dev(tr3, td4);
    			append_dev(tr3, t38);
    			append_dev(tr3, td5);
    			append_dev(tbody1, t40);
    			append_dev(tbody1, tr4);
    			append_dev(tr4, th10);
    			append_dev(tr4, t42);
    			append_dev(tr4, td6);
    			append_dev(tr4, t44);
    			append_dev(tr4, td7);
    			append_dev(tr4, t46);
    			append_dev(tr4, td8);
    			append_dev(div1, t48);
    			append_dev(div1, p3);
    			append_dev(div1, t50);
    			append_dev(div1, img4);
    			append_dev(div3, t51);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(div3, t53);
    			if_blocks[current_block_type_index].m(div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { dades } = $$props; //call data
    	let index = 0, offset, progress; //create variable index, offset and progress for svelte-scroller to work

    	//import images for the legends
    	let menstruation = "img-02.png";

    	let preovulation = "img-03.png";
    	let ovulation = "img-04.png";
    	let premenstruation = "img-04.png";
    	let legend = "LEGEND-01.png";

    	//required script for toogle button to work
    	let user = { loggedIn: false };

    	function toggle() {
    		$$invalidate(4, user.loggedIn = !user.loggedIn, user);
    	}

    	const writable_props = ["dades"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(1, index);
    	}

    	function scroller_offset_binding(value) {
    		offset = value;
    		$$invalidate(2, offset);
    	}

    	function scroller_progress_binding(value) {
    		progress = value;
    		$$invalidate(3, progress);
    	}

    	$$self.$$set = $$props => {
    		if ("dades" in $$props) $$invalidate(0, dades = $$props.dades);
    	};

    	$$self.$capture_state = () => ({
    		dades,
    		Menstrual,
    		Fecha,
    		Fecha2,
    		Scroller,
    		index,
    		offset,
    		progress,
    		menstruation,
    		preovulation,
    		ovulation,
    		premenstruation,
    		legend,
    		user,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("dades" in $$props) $$invalidate(0, dades = $$props.dades);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("offset" in $$props) $$invalidate(2, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(3, progress = $$props.progress);
    		if ("menstruation" in $$props) $$invalidate(5, menstruation = $$props.menstruation);
    		if ("preovulation" in $$props) $$invalidate(6, preovulation = $$props.preovulation);
    		if ("ovulation" in $$props) $$invalidate(7, ovulation = $$props.ovulation);
    		if ("premenstruation" in $$props) $$invalidate(8, premenstruation = $$props.premenstruation);
    		if ("legend" in $$props) $$invalidate(9, legend = $$props.legend);
    		if ("user" in $$props) $$invalidate(4, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dades,
    		index,
    		offset,
    		progress,
    		user,
    		menstruation,
    		preovulation,
    		ovulation,
    		premenstruation,
    		legend,
    		toggle,
    		scroller_index_binding,
    		scroller_offset_binding,
    		scroller_progress_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { dades: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*dades*/ ctx[0] === undefined && !("dades" in props)) {
    			console.warn("<App> was created without expected prop 'dades'");
    		}
    	}

    	get dades() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dades(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsvFormat(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv$1 = dsvFormat(",");

    var csvParse = csv$1.parse;

    function responseText(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.text();
    }

    function text(input, init) {
      return fetch(input, init).then(responseText);
    }

    function dsvParse(parse) {
      return function(input, init, row) {
        if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
        return text(input, init).then(function(response) {
          return parse(response, row);
        });
      };
    }

    var csv = dsvParse(csvParse);

    csv('data.csv',  {encoding: 'utf8'})
    	.then(data => { console.log(data);
            new App({
                target: document.body,
                props: {
                    dades: data
                    
                }
            });
        });

    var app$1 = app;

    return app$1;

}());
//# sourceMappingURL=bundle.js.map
