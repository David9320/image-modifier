const maxHeight = 500;
let isImageLoaded = false;
let pixels;
let sixSevenPixels;
let imageData;
const animationTime = 2;
const fps = 30;
let id = -1;
let targets;
let time = animationTime;
let now;
let lastFrame;
let frames = [];
const frameCount = fps * animationTime;
let currentFrame = 0;
let frameIndex = 0;
let settingFramesDone = false;
let timer;
let play = false;

const img = new Image();
img.src = "capibara.png";

const statusText = document.getElementById("statusText");

const slider = document.getElementById("videoSlider");
slider.max = fps * animationTime;

const playButton = document.getElementById("playButton");
playButton.addEventListener("click", function() {
    play = !play;
});

const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", function() {
    play = true;
    setCurrentFrame(0);
    if(id == -1) {
        id = setInterval(animationFrame, 1 / fps * 1000);
    }
});

const sixSevenImg = new Image();
sixSevenImg.src = "fatcat.png";

const testCanvas = document.getElementById("testCanvas");
const context = testCanvas.getContext("2d");

const sixSevenCanvas = document.getElementById("67Canvas");
const sixSevenCtx = sixSevenCanvas.getContext("2d");

const modifyButton = document.getElementById("modifyButton");
modifyButton.addEventListener("click", function() {
    //modifyPixels();
    setTargets();
    index = 0;
    settingFramesDone = false;
    frames = [];
    timer = setInterval(setFrames, 0);
    time = animationTime;
    lastFrame = -1;
    //id = setInterval(frame, 1 / fps);
    currentFrame = 0;
    id = setInterval(animationFrame, 1 / fps * 1000);
});

img.addEventListener("load", function() {
    testCanvas.width = img.width;
    testCanvas.height = img.height;
    testCanvas.style.width = `${img.width / img.height * maxHeight}px`;
    testCanvas.style.height = `${maxHeight}px`;
    context.drawImage(img, 0, 0);
    imageData = context.getImageData(0, 0, img.width, img.height);
    pixels = imageData.data;
    isImageLoaded = true;
    slider.style.width = testCanvas.style.width;
    refreshSixSeven();
});

slider.addEventListener("input", function() {
    setCurrentFrame(parseInt(slider.value));
    if(id == -1) {
        id = setInterval(animationFrame, 1 / fps * 1000);
    }
});



function refreshSixSeven() {
    sixSevenCanvas.width = img.width;
    sixSevenCanvas.height = img.height;
    sixSevenCanvas.style.width = `${img.width / img.height * maxHeight}px`;
    sixSevenCanvas.style.height = `${maxHeight}px`;
    sixSevenCtx.drawImage(sixSevenImg, 0, 0, img.width, img.height);
    sixSevenPixels = sixSevenCtx.getImageData(0, 0, img.width, img.height).data;
}

sixSevenImg.addEventListener("load", function() {
    sixSevenCanvas.width = img.width;
    sixSevenCanvas.height = img.height;
    sixSevenCanvas.style.width = `${img.width / img.height * maxHeight}px`;
    sixSevenCanvas.style.height = `${maxHeight}px`;
    sixSevenCtx.drawImage(sixSevenImg, 0, 0, img.width, img.height);
    sixSevenPixels = sixSevenCtx.getImageData(0, 0, img.width, img.height).data;
    //console.log(getSixSevenPixel(0, 0));
});

const imageInput = document.getElementById("imageFile");
imageInput.addEventListener("change", function(e) {
    isImageLoaded = false;
    img.src = URL.createObjectURL(e.target.files[0]);
    refreshSixSeven();
});

const sixSevenImageInput = document.getElementById("sixSevenImageFile");
sixSevenImageInput.addEventListener("change", function(e) {
    sixSevenImg.src = URL.createObjectURL(e.target.files[0]);
    refreshSixSeven();
});

function getPixel(x, y) {
    let coord = y * img.width + x;
    return [pixels[coord * 4], pixels[coord * 4 + 1], pixels[coord * 4 + 2]]
}

function getSixSevenPixel(x, y) {
    let coord = y * img.width + x;
    return [sixSevenPixels[coord * 4], sixSevenPixels[coord * 4 + 1], sixSevenPixels[coord * 4 + 2]]
}

function setPixel(x, y, color) {
    let coord = y * img.width + x;
    pixels[coord * 4] = color[0];
    pixels[coord * 4 + 1] = color[1];
    pixels[coord * 4 + 2] = color[2];
    pixels[coord * 4 + 3] = 255;
}

function modifyPixels() {
    let sixSevenValues = new Array(img.width * img.height);
    for(let x = 0; x < img.width; x++) {
        for(let y = 0; y < img.height; y++) {
            const color = getSixSevenPixel(x, y, sixSevenPixels);
            const avarage = (color[0] + color[1] + color[2]) / 3;
            sixSevenValues[y * img.width + x] = {
                value: avarage,
                x: x,
                y: y
            };
        }
    }
    sixSevenValues.sort(function(a, b) {
        return a.value - b.value;
    });
    console.log(sixSevenValues);

    let newPixels = new Array(img.width * img.height * 4);
    let values = new Array(img.width * img.height);
    for(let x = 0; x < img.width; x++) {
        for(let y = 0; y < img.height; y++) {
            const color = getPixel(x, y);
            const avarage = (color[0] + color[1] + color[2]) / 3;
            values[y * img.width + x] = {
                value: avarage,
                color: color
            };
        }
    }
    console.log(values);
    values.sort(function(a, b) {
        return a.value - b.value;
    });
    console.log(values);
    for(let i = 0; i < values.length; i++) {
        let color = values[i].color;
        let x = sixSevenValues[i].x;
        let y = sixSevenValues[i].y;
        let coord = y * img.width + x;
        //console.log(coord);
        pixels[coord * 4] = color[0];
        pixels[coord * 4 + 1] = color[1];
        pixels[coord * 4 + 2] = color[2];
        pixels[coord * 4 + 3] = 255;
    }
    console.log(newPixels);
    return newPixels;
}

function setTargets() {
    let sixSevenValues = new Array(img.width * img.height);
    for(let x = 0; x < img.width; x++) {
        for(let y = 0; y < img.height; y++) {
            const color = getSixSevenPixel(x, y, sixSevenPixels);
            const avarage = (color[0] + color[1] + color[2]) / 3;
            sixSevenValues[y * img.width + x] = {
                value: avarage,
                x: x,
                y: y
            };
        }
    }
    sixSevenValues.sort(function(a, b) {
        return a.value - b.value;
    });

    targets = new Array(img.width * img.height);
    let values = new Array(img.width * img.height);
    for(let x = 0; x < img.width; x++) {
        for(let y = 0; y < img.height; y++) {
            const color = getPixel(x, y);
            const avarage = (color[0] + color[1] + color[2]) / 3;
            values[y * img.width + x] = {
                value: avarage,
                color: color,
                x: x,
                y: y
            };
        }
    }
    values.sort(function(a, b) {
        return a.value - b.value;
    });
    for(let i = 0; i < values.length; i++) {
        targets[i] = {
            color: values[i].color,
            startX: values[i].x,
            startY: values[i].y,
            targetX: sixSevenValues[i].x,
            targetY: sixSevenValues[i].y
        };
    }
}

function setFrames() {
    let i = index;
    if(i < frameCount) {
        context.fillStyle = "rgb(0, 0, 0, 255)";
        context.fillRect(0, 0, img.width, img.height);
        for(let j = 0; j < targets.length; j++) {
            let color = targets[j].color; 
            let startX = targets[j].startX;
            let startY = targets[j].startY;
            let targetX = targets[j].targetX;
            let targetY = targets[j].targetY;
            let x = startX + (targetX - startX) * i / (frameCount - 1);
            let y = startY + (targetY - startY) * i / (frameCount - 1);
            context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 255)`;
            context.fillRect(x, y, 1, 1);
        }
        frames.push(context.getImageData(0, 0, img.width, img.height).data);
        //imageData.data = frames[i];
        //context.putImageData(imageData, 0, 0);
        statusText.textContent = `Progress: ${Math.round(i / (frameCount - 1) * 100)}%`;
        index++;
    } else {
        settingFramesDone = true;
        clearInterval(timer);
    }
}

function frame() {
    now = Date.now();
    if(lastFrame == -1) lastFrame = now;
    const deltaTime = (now - lastFrame) / 1000;
    lastFrame = now;
    time -= deltaTime;
    if(time < 0) {
        clearInterval(id)
        for(let i = 0; i < targets.length; i++) {
            let color = targets[i].color;
            context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 255)`;
            context.fillRect(targets[i].targetX, targets[i].targetY, 1, 1);
        }
        lastFrame = -1;
    } else {
        for(let i = 0; i < targets.length; i++) {
            let color = targets[i].color; 
            let startX = targets[i].startX;
            let startY = targets[i].startY;
            let targetX = targets[i].targetX;
            let targetY = targets[i].targetY;
            let x = startX + (targetX - startX) * (animationTime - time) / animationTime;
            let y = startY + (targetY - startY) * (animationTime - time) / animationTime;
            context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 255)`;
            context.fillRect(x, y, 1, 1);
        }
        //imageData.data = pixels;
        //context.putImageData(imageData, 0, 0);
    }
}

function animationFrame() {
    console.log(currentFrame);
    if(currentFrame >= frameCount) {
        clearInterval(id);
        id = -1;
    } else if(settingFramesDone) {
        const imgData = new ImageData(frames[currentFrame], img.width, img.height);
        context.putImageData(imgData, 0, 0);
        if(play) {
            setCurrentFrame(parseInt(currentFrame) + 1);
        }
    }
}

function setCurrentFrame(newCurrentFrame) {
    currentFrame = newCurrentFrame;
    slider.value = newCurrentFrame;
}