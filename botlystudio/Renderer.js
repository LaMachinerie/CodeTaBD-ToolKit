'use strict';

var Renderer = Renderer || {};

Renderer.interpreter = null;
Renderer.numSprites = 0;
Renderer.sprites = [];
Renderer.canvas = null;
Renderer.pidList = [];
Renderer.pause = 10;

Renderer.init = function () {
    Renderer.canvas = document.getElementById("display");
    Renderer.reset();
};

Renderer.renderSprites = function () {
    //Renderer.canvas.getContext("2d").clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);

    for (var i = 0; i < Renderer.sprites.length; i++) {
        Renderer.sprites[i].render();
    }
    return i;
};

Renderer.sprite = function (options) {

    var that = {};
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = 0;
    that.y = 0;
    that.image = options.image;
    that.scaleRatio = 1;

    that.render = function () {

        // Draw the animation
        that.context.drawImage(
            that.image,
            (that.x),
            (that.y),
            that.width * that.scaleRatio,
            that.height * that.scaleRatio);
        return true;
    };

    that.getFrameWidth = function () {
        return that.width;
    };

    return that;
}

Renderer.destroySprite = function (sprite) {

    var i;

    for (i = 0; i < sprites.length; i += 1) {
        if (sprites[i] === sprite) {
            sprites[i] = null;
            sprites.splice(i, 1);
            break;
        }
    }
}


Renderer.spawnSprite = function (path) {

    var spriteIndex,
        spriteImg;

    // Create sprite sheet
    spriteImg = new Image();

    spriteImg.onload = function () {
        console.log("Loaded !");
        Renderer.sprites[spriteIndex].render();
    };


    spriteIndex = Renderer.sprites.length;

    // Create sprite
    Renderer.sprites[spriteIndex] = Renderer.sprite({
        context: Renderer.canvas.getContext("2d"),
        width: 1380,
        height: 1380,
        image: spriteImg,
    });


    Renderer.sprites[spriteIndex].x = 0;
    Renderer.sprites[spriteIndex].y = 0;
    Renderer.sprites[spriteIndex].scaleRatio = 1;

    // Load sprite sheet
    spriteImg.src = path;

    Renderer.sprites[spriteIndex].render();
}



Renderer.setBackGround = function (path) {
    var canvasStyle = document.getElementById("display").style;
    canvasStyle.background = "#ffffff";

    Renderer.canvas.getContext("2d").fillStyle = '#F2F2F2';
    Renderer.canvas.getContext("2d").fill();
	Renderer.canvas.getContext("2d").clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
    Renderer.sprites = [];

    
    var ctx = document.getElementById("display").getContext("2d");
    var background = new Image();
    background.src = path;

    // Make sure the image is loaded first otherwise nothing will draw.
    background.onload = function(){
        ctx.drawImage(background,0,0);   
    }
    Renderer.renderSprites();
};


Renderer.moveSprite = function (id, x, y) {
    Renderer.sprites[id].x = x;
    Renderer.sprites[id].y = y;

    Renderer.renderSprites();
}

Renderer.scaleSprite = function (id, scale) {
    Renderer.sprites[id].scaleRatio = scale;

    Renderer.renderSprites();
}

Renderer.calculateAspectRatio = function (image) {
    canvas = Renderer.canvas;
    var imageAspectRatio = image.width / image.height;
    var canvasAspectRatio = canvas.width / canvas.height;
    var renderableHeight, renderableWidth, xStart, yStart;
    var AspectRatio = new Object();
    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if (imageAspectRatio < canvasAspectRatio) {
        renderableHeight = canvas.height;
        renderableWidth = image.width * (renderableHeight / image.height);
        xStart = (canvas.width - renderableWidth) / 2;
        yStart = 0;
    }

    // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if (imageAspectRatio > canvasAspectRatio) {
        renderableWidth = canvas.width;
        renderableHeight = image.height * (renderableWidth / image.width);
        xStart = 0;
        yStart = (canvas.width - renderableHeight) / 2;
    }

    //keep aspect ratio
    else {
        renderableHeight = canvas.height;
        renderableWidth = canvas.width;
        xStart = 0;
        yStart = 0;
    }
    AspectRatio.renderableHeight = renderableHeight;
    AspectRatio.renderableWidth = renderableWidth;
    AspectRatio.startX = xStart;
    AspectRatio.startY = yStart;
    return AspectRatio;
}

Renderer.reset = function () {
    // Kill all tasks.
    for (var i = 0; i < Renderer.pidList.length; i++) {
        window.clearTimeout(Renderer.pidList[i]);
    }
    Renderer.pidList.length = 0;
    Renderer.interpreter = null;

    var canvasStyle = document.getElementById("display").style;
    canvasStyle.background = "#ffffff";

    Renderer.canvas.getContext("2d").fillStyle = '#F2F2F2';
    Renderer.canvas.getContext("2d").fill();
	Renderer.canvas.getContext("2d").clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height);
    Renderer.sprites = [];
    Renderer.renderSprites();
}


Renderer.execute = function () {
    if (!('Interpreter' in window)) {
        // Interpreter lazy loads and hasn't arrived yet.  Try again later.
        setTimeout(Renderer.execute, 250);
        return;
    }

    Renderer.reset();
    var code = BotlyStudio.generateJavaScript();
    Renderer.interpreter = new Interpreter(code, Renderer.initInterpreter);
    Renderer.pidList.push(setTimeout(Renderer.executeChunk_, 100));
}


Renderer.initInterpreter = function (interpreter, scope) {
    // API
    var wrapper;
    wrapper = function (room, background) {
        Renderer.setBackGround(SpriteManager.getBackgroundPath(room, background))
    };
    interpreter.setProperty(scope, 'room',
        interpreter.createNativeFunction(wrapper));

    wrapper = function (room, character, action) {
        Renderer.spawnSprite(SpriteManager.getCharacterPath(room, character, action));
        Renderer.renderSprites();
    };
    interpreter.setProperty(scope, 'character',
        interpreter.createNativeFunction(wrapper));


    wrapper = function (id) {
        console.log("Not implemented");
    };
    interpreter.setProperty(scope, 'none',
        interpreter.createNativeFunction(wrapper));
};




Renderer.map = function (x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};


Renderer.executeChunk_ = function () {
    // All tasks should be complete now.  Clean up the PID list.
    Renderer.pidList.length = 0;
    var stepSpeed = BotlyStudio.speedSlider.getValue();
    Renderer.pause = Renderer.map(stepSpeed, 0, 1, 40, 0) + 1;
    var go;
    do {
        try {
            go = Renderer.interpreter.step();
        } catch (e) {
            // User error, terminate in shame.
            alert(e);
            go = false;
        }
        if (go && Renderer.pause) {
            // The last executed command requested a pause.
            go = false;
            Renderer.pidList.push(
                setTimeout(Renderer.executeChunk_, Renderer.pause));
        }
    } while (go);
    // Wrap up if complete.
    if (!Renderer.pause) {
        BotlyStudio.workspace.highlightBlock(null);
        // Image complete; allow the user to submit this image to Reddit.
        Renderer.canSubmit = true;
    }
};


Renderer.animate = function (id) {
    Renderer.display();
    if (id) {
        BotlyStudio.workspace.highlightBlock(id);
    }
    // Scale the speed non-linearly, to give better precision at the fast end.
    var stepSpeed = 1000 * Math.pow(1 - Turtle.speedSlider.getValue(), 2);
    Renderer.pause = Math.max(1, stepSpeed);
};
