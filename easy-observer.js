/**
 * easy-observer
 * @authors DK
 * @version 1.0
 * @example
 *
 * // 基本
 * var observerA = observer.define('global.mudule.A', ['say', 'do']);
 * observerA.fire('say', 'oops!');
 * var sayFunc = function(data){
 *   console.info(data);
 * };
 * observerA.add('say', sayFunc);
 * observerA.once('do', function(data){
 *   console.info(data);
 * });
 * observerA.fire('do', 'fine!');
 * observerA.remove('say', sayFunc);
 * observerA.empty('say');
 *
 * // 高级(获得jQuery的API)
 * observerA.getCallbacks('say');
 */
;
(function (window, document, jQuery) {
    var $ = jQuery;

    var observer = {
        observerList: {},
        /**
         * 定义信道对应的事件列表
         * @param  {String} sChannel   // 信道名称（按模块、功能划分，推荐使用互斥的命名空间定义多个唯一信道）
         * @param  {Array} aEventList  // 事件列表
         * @return {Object}            // 其它api
         */
        define: function (sChannel, aEventList) {
            var that = this;
            if (that.observerList[sChannel] != null) {
                throw 'easy-observer.define: already had this channel';
            }

            // 创建信道对象
            that.observerList[sChannel] = {};

            $.map(aEventList, function (sEventType) {
                that.observerList[sChannel][sEventType] = $.Callbacks('memory');
            });

            /**
             * 检测事件参数合法性
             * @param  {String} sEventType // 事件名称
             */
            var _checkParam = function (sEventType) {
                if (that.observerList[sChannel][sEventType] == null) {
                    throw 'easy-observer.define: channel\'s eventType is not defined';
                }
            };

            return {
                /**
                 * 获取事件对应的Callbacks对象
                 * 这样就可以使用Callbacks对象的其它API，
                 * 详见 http://api.jquery.com/category/callbacks-object/
                 * 注：通过Callbacks对象添加的事件将失去派发回执的功能
                 * @param  {String} sEventType // 事件名称
                 * @return {Object}            // Callbacks对象
                 */
                'getCallbacks': function (sEventType) {
                    _checkParam(sEventType);
                    return that.observerList[sChannel][sEventType];
                },
                /**
                 * 添加信道事件对应的响应函数
                 * @param  {String} sEventType  // 事件名称
                 * @param  {Function} callbacks // 响应函数（也可以是函数数组）
                 */
                'add': function (sEventType, callbacks) {
                    that.observerList[sChannel][sEventType].add(callbacks);
                },
                /**
                 * 只执行一次
                 * @param  {String} sEventType  // 事件名称
                 * @param  {Function} callbacks // 响应函数（也可以是函数数组）
                 */
                'once': function (sEventType, callbacks) {
                    var _remove = function () {
                        that.observerList[sChannel][sEventType].remove(callbacks).remove(_remove);
                    };
                    that.observerList[sChannel][sEventType].add(callbacks).add(_remove);
                },
                /**
                 * 触发信道事件，派发数据对象
                 * @param  {String} sEventType  // 事件名称
                 * @param  {Object} oData       // 数据对象
                 */
                'fire': function (sEventType, oData) {
                    that.observerList[sChannel][sEventType].fire(oData);
                },
                /**
                 * 删除事件的响应函数
                 * @param  {String} sEventType  // 事件名称
                 * @param  {Function} callbacks // 响应函数（也可以是函数数组）
                 */
                'remove': function (sEventType, callbacks) {
                    _checkParam(sEventType);
                    that.observerList[sChannel][sEventType].remove(callbacks);
                },
                /**
                 * 清空事件的所有响应函数
                 * @param  {String} sEventType // 事件名称
                 */
                'empty': function (sEventType) {
                    _checkParam(sEventType);
                    that.observerList[sChannel][sEventType].empty();
                }
            };
        }
    };

    // adapt
    if (typeof define === "function" && define.amd) {
        // adapt for AMD
        define('easy-observer', [], function () {
            return observer;
        });
    } else {
        // adapt for jQuery
        jQuery.fn.extend({
            observer: observer
        });
    }

})(window, window.document, jQuery);
