function ServiceLocator() {
    var servicesWrap = {},
        serviceMixin,
        debug = false;

    function log() {
        if (debug) {
            console.log(arguments);
        }
    }

    function mix(object) {
        var mixins = Array.prototype.slice.call(arguments, 1), key, i;
        object.__mixins = [];
        for (i = 0; i < mixins.length; ++i) {
            for (key in mixins[i]) {
                if (typeof object[key] === "undefined") {
                    object[key] = mixins[i][key];
                    object.__mixins.push(key);
                }
            }
        }
    }

    function invoke(Constr, mixin, args) {
        var instance;

        function Temp(mixins) {
            var i, key;
            if (!mixins) return this;
            this.__mixins = [];
            for (i = 0; i < mixins.length; ++i) {
                for (key in mixins[i]) {
                    this[key] = mixin[i][key];
                    this.__mixins.push(key);
                }
            }
        }

        Temp.prototype = Constr.prototype;
        Constr.prototype = new Temp(mixin);
        instance = new Constr(args);
        Constr.prototype = Temp.prototype;

        return instance;
    }

    function deleteProp(object, propList) {
        var j;

        if (!object || propList.recursion > 1000) return;

        propList.recursion += 1;
        if (object.hasOwnProperty('__mixins')) {
            for (j = 0; j < propList.length; j++) {
                delete object[propList[j]];
            }
            delete object.__mixins;
        } else {
            deleteProp(Object.getPrototypeOf(object), propList);
        }
    }

    function unmix(object) {
        object.__mixins.recursion = 0;
        deleteProp(object, object.__mixins);

        return object;
    }

    function createObj(id) {
        log("create: " + id);
        return servicesWrap[id].instance = invoke(servicesWrap[id].creator, [
            {radID: id},
            serviceMixin
        ]);
    }

    return {

        printLog: function (flag) {
            debug = flag;
            return this;
        },

        setMixin: function (obj) {
            serviceMixin = obj;
            return this;
        },

        register: function (value, obj, instantiate) {

            function track(id){
                if (servicesWrap[id] === undefined) {
                    if (typeof obj === "function" && (instantiate === true || instantiate === undefined)) {
                        servicesWrap[id] = {
                            creator: obj
                        };
                    } else {
                        mix(obj, {radID: id}, serviceMixin);
                        servicesWrap[id] = {
                            instance: obj
                        };
                    }
                } else {
                    log('You try register already registered module:' + id + '!');
                }
            }

            if (Object.prototype.toString.call(value) === '[object Array]') {
                for(var i = value.length - 1; i > -1; i--){
                    track(value[i]);
                }
            } else {
                track(value);
            }
            return this;
        },

        regiaterAll: function (arrayOfServices) {
            var i, service, radID, obj;

            for (i = 0; i < arrayOfServices.length; ++i) {
                service = arrayOfServices[i];
                radID = service.radID || service.ID || service.id;
                obj = service.service || service.obj || service.object || service.creator;
                this.register(radID, obj, service.instantiate);
            }
            return this;
        },

        get: function (id) {
            if (servicesWrap[id] === undefined) {
                log('Error - ' + id + ' is unregister!');
                return null;
            }

            return servicesWrap[id].instance || createObj(id);
        },

        instantiateAll: function () {
            var radID, result = [];
            for (radID in servicesWrap) {
                if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].creator && !servicesWrap[radID].instance) {
                    result.push(createObj(radID));
                }
            }
            return result;
        },

        getAllInstantiate: function (withConstructor) {
            var radID, result = [], flag;
            for (radID in servicesWrap) {
                flag = (withConstructor) ? !!servicesWrap[radID].creator : true;
                if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].instance && servicesWrap[radID].creator) {
                    result.push(radID);
                }
            }
            return result;
        },

        unregister: function (value) {
            var result, i;

            function remove(id){
                var serviceData, instance;
                serviceData = servicesWrap[id];
                if (serviceData && serviceData.instance) {
                    instance = serviceData.instance;
                    unmix(instance);
                }
                delete servicesWrap[id];
                return instance;
            }

            if (Object.prototype.toString.call(value) === '[object Array]') {
                result = [];
                for (i = value.length - 1; i > -1; i--) {
                    result.push(remove(value[i]));
                }
            } else {
                result = remove(value);
            }
            return result;
        },

        unregisterAll: function () {
            var id, result = [], instance;

            for (id  in servicesWrap) {
                if ( servicesWrap.hasOwnProperty(id)) {
                    instance = this.unregister(id);
                    if (instance) result.push(instance);
                }
            }
            return result;
        }

    };
}