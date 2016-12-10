"use strict";

const createjs      = require("createjs-easeljs");
const GameObject    = require("./game_object.js");
const Victor        = require("victor");

class Bird extends createjs.Sprite {
    constructor(...args) {
        super(...args);
        // 最大speed
        this.max_velocity   = 2;
        this.velocity       = new Victor(
            (Math.random() - 0.5) * this.max_velocity,
            (Math.random() - 0.5) * this.max_velocity,
        );
        // 視界の広さ
        this.view_length    = 100;
        // 視界の角度
        this.view_angle     = 110;
        // 分離距離
        this.separation_length  = 50;
        this.name   = "bird:" + Math.random().toString();

        // 周囲にいる他の鳥の数
        this.near_birds_count   = 0;
    }

    move() {
        return this.flocking_move();
    }

    flocking_move() {

        // 平均位置 : 結合ルール
        let vec_ave_pos = Victor(0, 0);
        // 平均速度 : 整列ルール
        let vec_ave_vel = Victor(0, 0);
        // 分離ルール
        let vec_sep_vel = Victor(0, 0);
        // 最終操舵力
        let vec_steering_force   = Victor(0, 0);
        // 近いユニット数
        let near_obj_count  = 0;
        // 分離対象のユニット数
        let sep_obj_count   = 0;
        
        // for debug : デバッグ線を消す
        this.removeDebugLines();

        // 自ユニットのglobalでの画像中心座標
        // regX, regY, rotationを考慮した座標が得られる
        const this_g_pos    = this.localToGlobal(0, 0);

        // 他ユニットとの隣接関係チェック
        for (const obj of window.gm.gameObjects) {
            if (this === obj) {
                continue;
            }
            // objのglobalでの画像中心座標
            // regX, regY, rotationを考慮した座標が得られる
            const obj_g_pos     = obj.localToGlobal(0, 0);

            // 他ユニットの、this座標系での座標
            const rel_pos       = obj.localToLocal(0, 0, this);
            const vec_rel_pos   = new Victor(rel_pos.x, rel_pos.y);
            const distance      = vec_rel_pos.length();

            // 自ユニットの見える位置にいる？
            // 視界角度内かを計算する
            let is_in_view  = false;
            const vertical_angle_deg  = vec_rel_pos.horizontalAngleDeg();
            if (Math.abs(vertical_angle_deg) <= this.view_angle) {
                is_in_view  = true;
            }
            // 視界内にいなければ無視
            if (!is_in_view) {
                continue;
            }

            // 視界角度内だが、見える近さ？
            if (distance <= this.view_length) {
                // 位置加算 : 結合ルール
                vec_ave_pos.add(Victor(obj_g_pos.x, obj_g_pos.y));
                // 速度加算 : 整列ルール
                vec_ave_vel.add(obj.velocity);
                // 近いユニット数加算
                near_obj_count++;
    
                //////////////
                // 分離ルール
                // 決まった距離よりも近いユニットから離れる
                if (distance <= this.separation_length) {
                    // 離れる方向のベクトル
                    let vec_separation  = new Victor(this_g_pos.x - obj_g_pos.x, this_g_pos.y - obj_g_pos.y);
                    // 近いほど強く離す
                    const separation_rate = 3 - (vec_separation.length() / this.separation_length);
                    vec_separation.multiply(
                        new Victor(separation_rate, separation_rate)
                    );
                    vec_sep_vel.add(vec_separation);
                    sep_obj_count++;

                    if (window.gm.debug) {
                        // デバッグ線描画
                        this.drawDebugLine({
                            color: "#00f",
                            dest : {x: vec_separation.x, y: vec_separation.y}, 
                        });
                    }
                }
            }
        }

        if (near_obj_count > 0) {
            {
                //////////////
                // 結合ルール
                // 向きを平均的な位置へ、速度を平均な速度へ変更
                let vec_this_pos    = Victor(this_g_pos.x, this_g_pos.y);
                let vec_target_pos  = vec_ave_pos.clone().divide(Victor(near_obj_count, near_obj_count));
                // 自分から平均位置への移動量ベクトル
                let vec_mod_pos     = vec_target_pos.clone().subtract(vec_this_pos);
                // 最終操舵力に加算
                vec_steering_force.add(vec_mod_pos.normalize());
                //////////////
            }
            {
                //////////////
                // 整列ルール
                // 移動方向を平均的な移動方向に近づける
                let vec_target_vel  = vec_ave_vel.clone().divide(Victor(near_obj_count, near_obj_count));
                // 自分の移動方向から平均移動方向へのベクトル
                let vec_mod_vel     = vec_target_vel.clone().subtract(this.velocity);
                // 最終操舵力に加算
                vec_steering_force.add(vec_mod_vel.normalize());
                //////////////
            }
            {
                //////////////
                // 分離ルール
                // 移動方向を近くのユニットから離れる方向へ変更
                // 最終操舵力に加算
                if (sep_obj_count > 0) {
                    vec_steering_force.add(vec_sep_vel.normalize().multiply(Victor(2, 2)));
                }
                //////////////
            }
        }

        // debug
        if (window.gm.debug) {
            // デバッグ線描画
            this.drawDebugLine({
                color: "#0f0",
                dest : {x: vec_steering_force.x * 30, y: vec_steering_force.y * 30},
            });
        }
        //

        // 最終操舵力を適用
        // とりあえず減らす
        this.velocity.add(vec_steering_force.divide(new Victor(40, 40)));
        // 速度制限を掛ける
        this.limitVelocity();
        // 速度適用
        this.applyVelocity();

        this.near_birds_count   = near_obj_count;
    }

    // 指定した位置に向かって飛ぶ
    moveTo(target_x, target_y) {
        const this_g_pos    = this.localToGlobal(0, 0);
        this.velocity.x = target_x - this_g_pos.x;
        this.velocity.y = target_y - this_g_pos.y;
        this.limitVelocity();
        this.applyVelocity();
    }

    // 速度制限
    limitVelocity() {
        if (Math.abs(this.velocity.length()) > this.max_velocity) {
            const len   = this.velocity.length();
            const div   = len / this.max_velocity;
            this.velocity.divide(Victor(div, div));
        }
        else if (this.velocity.length() < 1) {
          this.velocity.normalize();
        }
    }

    // 速度適用
    applyVelocity() {
        this.x    += this.velocity.x;
        this.y    += this.velocity.y;

        // 向きを変える
        const angle_deg = this.velocity.horizontalAngleDeg();
        this.rotation   = angle_deg;
        //// 急激には変えない
        //const abs_angle_diff    = Math.abs(this.rotation - angle_deg);
        //if (abs_angle_diff > 5) {
        //    this.rotation   += (angle_deg - this.rotation > 0) ? 5 : -5;
        //}
        //else {
        //    this.rotation   = angle_deg;
        //}
    }

    ////////////////////////////////
    // デバッグ用関数
    // デバッグ用：デバッグ線を消す
    removeDebugLines() {
        const lineDebug = this.name + "debug";
        const s = window.gm.stage;
        for (const name of [lineDebug]) {
            // 全部消す
            let obj;
            do {
                obj   = s.getChildByName(name);
                if (obj) {
                    s.removeChild(obj);
                }
            } while (obj);
        }
    }
    // デバッグ用：デバッグ線を書く
    drawDebugLine({color, dest}) {
        let g = new createjs.Graphics();
        g.beginStroke(color);
        g.setStrokeStyle(3);
        g.moveTo(this.x, this.y);
        g.lineTo(this.x + dest.x, this.y + dest.y);
        g.endStroke();
        let shape   = new createjs.Shape(g);
        shape.name  = this.name + "debug";
        window.gm.stage.addChild(shape);
    }
    ////////////////////////////////

};

module.exports  = Bird;
