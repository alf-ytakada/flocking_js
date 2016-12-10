const createjs  = require("createjs-easeljs");

class GameManager {
    constructor() {
        this.gameObjects    = [];
        this.fps    = 60;
        this.debug  = false;
        this.mouse_tracking = false;
    }

    init(stage_id) {
        this.stage  = new createjs.Stage(stage_id);
        if (createjs.Touch.isSupported() == true) {
            createjs.Touch.enable(this.stage);
        }
        createjs.Ticker.setFPS(this.fps);
        createjs.Ticker.on("tick", this.stage);
        createjs.Ticker.on("tick", () => { this.onTick() }) ;
    }

    // 動作管理オブジェクト
    addGameObject(obj) {
        this.gameObjects.push(obj);
        this.stage.addChild(obj);
    }

    // main loop
    onTick() {
        for (const obj of this.gameObjects) {
            obj.move();
            if (this.mouse_tracking && obj.near_birds_count == 0) {
                const [mx, my]  = [this.stage.mouseX, this.stage.mouseY];
                if (mx != 0 && my != 0)  {
                    // 動かしちゃったぶんを戻す
                    obj.x   -= obj.velocity.x; obj.y -= obj.velocity.y;
                    obj.moveTo(mx, my);
                    console.log(`mouseX : ${mx}, mouseY : ${my}`);
                }
            }

            // window外時の処理
            const r = this.stage.canvas;
            if (r.width < obj.x) {
                obj.x   = 0;
            }
            if (obj.x < 0) {
                obj.x  = r.width;
            }
            if (r.height < obj.y) {
                obj.y  = 0;
            }
            if (obj.y < 0) {
                obj.y = r.height;
            }

            /////////////
            // for debug
            const name  = obj.name + "circle";
            const old   = this.stage.getChildByName(name);
            if (old) {
                this.stage.removeChild(old);
            }
            if (this.debug) {
                let circle  = new createjs.Shape();
                circle.graphics.beginStroke("#ff0000").drawCircle(0, 0, obj.view_length);
                circle.x    = obj.x;
                circle.y    = obj.y;
                circle.name = name;
                this.stage.addChild(circle);
            }
            /////////////
        }
    }



    
}


module.exports  = GameManager;
