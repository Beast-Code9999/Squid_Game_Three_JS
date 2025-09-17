// src/config/gameConfig.js
export const GameConfig = {
    field: {
        width: 100,       // new width of playground
        depth: 300        // new depth of playground
    },
    player: {
        startZRatio: 0.5  // relative start position along depth (0 = start edge, 1 = far edge)
    },
    doll: {
        zRatio: 0.225     // relative position along depth
    },
    finishLine: {
        zRatio: 0.175,     // relative position along depth
        width: 20,
        height: 10,
        yOffsetFromTop: 5,       // how far below the wall top
        zOffsetFromWall: 0.6     // how far in front of wall
    },
    timer: {
        zRatio: 0.275,     // relative position along depth

    },
    finishLine: {
        zRatio: 0.175, // relative position along depth
        zOffset: -40
    }
}
