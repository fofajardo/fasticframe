---
# this is an empty front matter
# needed for jekyll to interpret liquid
---

const Dropzone = require ('dropzone');
const fabric = require('fabric').fabric;
const heic2any = require('heic2any');

Dropzone.autoDiscover = false;

document.addEventListener("DOMContentLoaded", function(){

  // define the canvas
  const canvas = this.__canvas = new fabric.Canvas('c', {
    width: 500,
    height: 500
  });

  // image to be added to the canvas
  var image = new fabric.Image();

  // resize the canvas once it's loaded
  resizeCanvas();

  // declare the dropzone
  var imgUpload = new Dropzone("#upload", {
    url: "UploadImages",
    autoProcessQueue: false,
    createImageThumbnails: false,
    maxFiles: 1,
    acceptedFiles: "image/*",
    addRemoveLinks: true,
    clickable: '#upload, #upload-text'
  });

  // handle the canvas controls and overlay
  (function() {
    fabric.Object.prototype.transparentCorners = false;

    var $ = function(id){return document.getElementById(id)};

    var angleControl = $('angle-control');
    angleControl.oninput = function() {
      image.set('angle', parseInt(this.value, 10)).setCoords();
      canvas.requestRenderAll();
    };

    var scaleControl = $('scale-control');
    scaleControl.oninput = function() {
      image.scale(parseFloat(this.value)).setCoords();
      canvas.requestRenderAll();
    };

    function updateControls() {
      scaleControl.value = image.scaleX;
      angleControl.value = image.angle;
    }

    canvas.on({
      'object:scaling': updateControls,
      'object:resizing': updateControls,
      'object:rotating': updateControls,
    });

    fabric.Image.fromURL('img/frame.png', function(aImage) {
      aImage.set({
        originX: 'left',
        originY: 'top',
        crossOrigin: 'anonymous',
        srcFromAttribute: true,
      });
      canvas.setOverlayImage(aImage, function() {
        canvas.overlayImage.scaleToWidth(canvas.getWidth());
        canvas.renderAll();
      });
    });

  })();

  const updateControlState = function(state) {
    document.getElementById("download").disabled = state;
    document.getElementById("angle-control").disabled = state;
    document.getElementById("scale-control").disabled = state;
  }

  const resetState = function() {
    if (image) {
      canvas.remove(image);
    }
    updateControlState(true);
  }
  resetState();

  var reader = new FileReader();
  reader.onload = function(event) {

    var imgObj = new Image();
    imgObj.src = event.target.result;

    fabric.util.loadImage(imgObj.src, function() {
    image = new fabric.Image(imgObj);
    image.set({
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        selectable: true,
        centeredRotation: true,
        centeredScaling: true,
        cornerColor: "#0d2240",
        cornerSize: 30,
        lockSkewingX: true,
        lockSkewingY: true,
        originX: "center", 
        originY: "center",
        hasControls: false,
      });

      image.scaleToHeight(canvas.getHeight());
      image.scaleToWidth(canvas.getWidth());
      let scaleControl = document.getElementById('scale-control');
      scaleControl.value = image.scaleX;
      canvas.centerObject(image);
      canvas.add(image);
      canvas.renderAll();
      canvas.setActiveObject(image);

      document.getElementById("upload-text").innerHTML = "";
      updateControlState(false);
    });
  };

  // when the image is uplaoded
  // call the reader to add it to the canvas
  // enable the download button and controls
  // remove the upload text
  imgUpload.on("addedfile", async function(file) {
    resetState();
    document.getElementById("upload-text").innerHTML = "Please wait while we're processing your picture.";
    let processedFile = file;
    let wasProcessed = true;
    // Some devices make use of the HEIC format and the browser
    // doesn't support that natively.
    if (file.name.toLowerCase().includes("heic")) {
      await heic2any({ blob: file })
        .then((conversionResult) => {
          processedFile = conversionResult;
        })
        .catch((e) => {
          document.getElementById("upload-text").innerHTML = "Please use a different picture.";
          wasProcessed = false;
        });
    }
    if (!wasProcessed) {
      return;
    }
    reader.readAsDataURL(processedFile);
  });

  // when the image is removed
  // remove it from the canvas
  // disable the download button and controls
  // re-add the upload text
  imgUpload.on("removedfile", function() {
    resetState();
    document.getElementById("upload-text").innerHTML = "Drop files here or click to upload.";
  });

  // handle download
  // create a link and simulate a click to download the file
  var download = document.getElementById("download");
  download.addEventListener('click', function() {
    var e = canvas.toDataURL({ format: "jpeg", quality: 1, multiplier: 4});
    if (window.URL && e) {
        if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(t, "profile-pic.jpeg");
        else {
            var r = document.createElement("a");
            (r.href = e), (r.download = "profile-pic.jpeg"), document.body.appendChild(r), r.click(), document.body.removeChild(r);
        }
    }
  }, false);

  var copyCaptionBtn = document.getElementById('copyCaptionBtn');
  copyCaptionBtn.addEventListener('click', function (aEvent) {
    let range = document.createRange();
    let captionBlock = document.getElementById("caption");
    range.selectNode(captionBlock);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }, false);
});


function resizeCanvas() {
  // fabric.js wraps the canvas in a ".canvas-container" div
  // manually set the container div's height to it's width
  // this will not affect the canvas size for download

  const outerCanvasContainer = document.getElementsByClassName("canvas-container")[0];
  outerCanvasContainer.style.width = "auto";
  outerCanvasContainer.style.height = `${outerCanvasContainer.clientWidth}px`;
}

function changeFrame(canvas, image) {
  canvas.setOverlayImage(image, function() {
        canvas.overlayImage.scaleToWidth(canvas.getWidth())
        canvas.renderAll()
      }, {
        originX: 'left',
        originY: 'top',
        crossOrigin: 'anonymous'
    });
}

window.addEventListener('resize', function() {
  resizeCanvas();
});
