'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

class Handler {
    constructor(context, handler, count, frequncy) {
        this.context = context;
        this.handler = handler;
        this.count = count <= 0 ? Infinity : count;
        this.frequncy = (frequncy <= 0 ? 1 : frequncy) - 1;
        this.frequncyNow = this.frequncy;
    }

    emit() {
        if (this.frequncyNow < this.frequncy) {
            this.frequncyNow++;

            return;
        }

        this.frequncyNow = 0;

        if (this.count <= 0) {
            return;
        }

        this.handler.call(this.context);
        this.count--;
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = new Map();

    function isInNameSpace(key, event) {
        return key === event || key.startsWith(`${event}.`);
    }

    function getEventsToCall(event) {
        const result = [];

        let current = event;
        while (current.length > 0) {
            result.push(current);

            const lastDotIndex = event.lastIndexOf('.');
            if (lastDotIndex === current.length) {
                break;
            }
            current = current.substring(0, lastDotIndex);
        }

        return result;
    }

    function createHandler(context, handler, count = Infinity, frequency = 1) {
        return new Handler(context, handler, count, frequency);
    }

    function addHandler(event, handler) {
        if (!events.has(event)) {
            events.set(event, []);
        }

        events.get(event).push(handler);
    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            const contextHandler = createHandler(context, handler);
            addHandler(event, contextHandler);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            Array.from(events.keys())
                .filter(key => isInNameSpace(key, event))
                .forEach(function (key) {
                    const handlers = events.get(key);
                    const toDelete = handlers.filter(handler => handler.context === context);

                    toDelete.forEach(handler => handlers.splice(handlers.indexOf(handler), 1));
                });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            getEventsToCall(event).forEach(function (key) {
                if (!events.has(key)) {
                    return;
                }

                events.get(key)
                    .forEach(handler => handler.emit());
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            const contextHandler = new Handler(context, handler, times);
            addHandler(event, contextHandler);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            const contextHandler = new Handler(context, handler, Infinity, frequency);
            addHandler(event, contextHandler);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
