const createjs  = require("createjs-easeljs");
// abstruct class

class GameObject extends createjs.Sprite {
    constructor(...args) {
        if (new.target === GameObject) {
            throw new TypeError("Can't instantiate GameObject directly!");
        }
        super(...args);
    }

    move() {
        throw new Error("need override");
    }
}
