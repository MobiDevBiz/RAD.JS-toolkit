function PubSub() {
    var channels = {}, sticky = {}, debug = false, separator = '.';

    function log() {
        if (debug) {
            console.log.apply(null, arguments);
        }
    }

    function generateQuickGuid() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    return {

        printLog: function (flag) {
            debug = flag;
            return this;
        },

        setSeparator: function (sprtr) {
            separator = sprtr;
            return this;
        },

        publish: function (channel, data, type) {
            var index, i, l, length, subscription, receiver, parts = channel.split(separator), currentChannel;

            log(this.radID + " publish:", arguments);

            //attach sticky message
            if (type === "sticky") {
                sticky[channel] = arguments;
            }

            //post message
            for (index = 0, length = parts.length; index < length; index += 1) {
                currentChannel = parts.slice(0, index + 1).join(separator);
                if (channels[currentChannel]) {
                    for (i = 0, l = channels[currentChannel].length; i < l; i += 1) {
                        subscription = channels[currentChannel][i];
                        subscription.callback.apply(subscription.context, arguments);
                        receiver = subscription.context.options || subscription.context;
                        log("receiver:" + receiver.radID + " channel:" + currentChannel, arguments);
                    }
                }
            }

            return this;
        },

        subscribe: function (channel, fn, context) {
            var cntx = context || this, radID, parts = channel.split(separator), index, length, currentChannel;

            radID = cntx.radID = cntx.radID || generateQuickGuid();

            channels[channel] = channels[channel] || [];
            channels[channel].push({ context: cntx, callback: fn, ID: radID});

            log(radID + " subscribe to channel:" + channel, arguments);

            //post sticky messages
            for (index = 0, length = parts.length; index < length; index += 1) {
                currentChannel = parts.slice(0, index + 1).join(separator);
                if (sticky[currentChannel]) {
                    fn.apply(cntx, sticky[currentChannel]);
                }
            }

            return this;
        },

        unsubscribe: function (context, channel) {
            var m, i, length, id;

            if (context && context.radID) {
                id = context.radID;
                for (m in channels) {
                    if (channels.hasOwnProperty(m)) {
                        for (i = channels[m].length - 1, length = 0; i >= length; i -= 1) {
                            if ((channel === null || channel === m) && channels[m][i].ID === id) {
                                log(id + " unsubscribe from channel:" + m, arguments);
                                channels[m].splice(i, 1);
                                if (channel) {
                                    return this;
                                }
                            }
                        }
                    }
                }
            }
            return this;
        }
    }
}