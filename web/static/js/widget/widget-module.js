/**
 * Created by RTT.
 * Author: teocci@yandex.com on 2022-6월-10
 */

export default class WidgetModule {
    constructor() {
    }

    static get instance() {
        this._instance = this._instance ?? new WidgetModule()

        return this._instance
    }
}