const $ = require("jquery");
const createjs  = require("createjs-easeljs");
const tweenjs   = require("createjs-tweenjs");
const preloadjs = require("createjs-preloadjs");
const Bird      = require("./bird.js");

const GameManager   = require("./game_manager.js");

// global variables
var Assets  = {
    spriteSheets    : {}
};

window.gm  = new GameManager();

$(function() {
    gm.init("canvas");

    let circle  = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    circle.x    = 100;
    circle.y    = 100;
    
    tweenjs.Tween.get(circle, {loop: true})
        .to({x: 400}, 1000, createjs.Ease.getPowInOut(4))
        .to({alpha: 0, y: 175}, 500, createjs.Ease.getPowInOut(2))
        .to({alpha: 0, y: 225}, 100)
        .to({alpha: 1, y: 200}, 500, createjs.Ease.getPowInOut(2))
        .to({x: 100}, 800, createjs.Ease.getPowInOut(2))
        ;
    //gm.stage.addChild(circle);

    //createjs.Ticker.addEventListener("tick", stage);

    // preload
    let queue   = new preloadjs.LoadQueue(false);
    queue.loadFile({id:"bird", src:"asset/tori-new.png"});
    queue.load();
    queue.on("complete", (e) => {
        let image   = queue.getResult("bird");
        let bmp = new createjs.Bitmap(image);
        let meta    = {
            images: [image],
            //images: ["asset/tori.png"],
            //frames: {width: 28, height: 34, count: 3, regX: 0, regY: 102, spacing: 0, margin: 0},
            frames: {width: 28, height: 26},
            animations: {
                fly: [0, 2],
            },
            framerate: 10,
        };
        let spriteSheet = new createjs.SpriteSheet(meta);
        Assets.spriteSheets.tori    = spriteSheet;
        // 初回生成
        for (let i = 0 ; i < 30 ; i++) {
            addBird(gm.stage.canvas.width / 2, gm.stage.canvas.height /2);
        }
    });
    // マウスクリックで追加
    gm.stage.on("stagemousedown", (ev) => {
        console.log(`x:${ev.stageX}, y:${ev.stageY}`);
        addBird(ev.stageX, ev.stageY);
    });
});


function addBird(x = 0, y = 0) {
    let toriSpriteSheet = Assets.spriteSheets.tori;
    if (toriSpriteSheet === undefined) {
        return;
    }

    let toriSprite  = new Bird(toriSpriteSheet, "fly");
    toriSprite.x = x;
    toriSprite.y = y;
    toriSprite.regX = 14;
    toriSprite.regY = 13;
    toriSprite.play();
    gm.addGameObject(toriSprite);
}


// UI
$(() => {
    const modRange = (deg) => {
        $("#range").html(deg);
        for (let bird of gm.gameObjects) {
            bird.view_angle = deg;
        }
    };

    const modDistance   = (distance) => {
        $("#distance").html(distance);
        for (let bird of gm.gameObjects) {
            bird.view_length = distance;
        }
    }
    
    const modSepDistance   = (distance) => {
        $("#sep_distance").html(distance);
        for (let bird of gm.gameObjects) {
            bird.separation_length = distance;
        }
    }

    $("input[name='range']").on("change input", (e) => {
        modRange(parseFloat($(e.target).val()));
    });
    $("input[name='distance']").on("change input", (e) => {
        modDistance(parseFloat($(e.target).val()));
    });
    $("input[name='sep_distance']").on("change input", (e) => {
        modSepDistance(parseFloat($(e.target).val()));
    });

    $("#btn_debug").on("click", () => {
        gm.debug    = !gm.debug;
        $("#btn_debug").removeClass("active");
        if (gm.debug) {
            $("#btn_debug").addClass("active");
        }
    });

    $("#btn_mouse_tracking").on("click", () => {
        gm.mouse_tracking    = !gm.mouse_tracking;
        $("#btn_mouse_tracking").removeClass("active");
        if (gm.mouse_tracking) {
            $("#btn_mouse_tracking").addClass("active");
        }
    });

});
