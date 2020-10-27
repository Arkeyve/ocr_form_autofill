(function() {
    var camHeight = 0;
    var camWidth = 320;

    var streaming = false;

    var camInput = null;
    var camCanvas = null;
    var camImg = null;
    var camCapture = null;
    var camCrop = null;
    var camRotRange = null;

    function loadCam() {
        camInput = document.getElementById("cam-input");
        camCanvas = document.getElementById("cam-canvas");
        camCanvasDiv = document.getElementById("cam-canvas-div");
        camImg = document.getElementById("cam-img");
        camCapture = document.getElementById("cam-capture");
        camCrop = document.getElementById("cam-crop");
        camRotRange = document.getElementById("cam-rot-range");

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream) {
            camInput.srcObject = stream;
            camInput.play();
        })
        .catch(function(err) {
            console.log("error occurred while playing video stream " + err);
        });

        camInput.addEventListener("canplay", function(ev) {
            if(!streaming) {
                camHeight = camInput.videoHeight / (camInput.videoWidth/camWidth);

                camInput.setAttribute("width", camWidth);
                camInput.setAttribute("height", camHeight);
                camCanvas.setAttribute("width", camWidth);
                camCanvas.setAttribute("height", camHeight);
                camCanvasDiv.style.width = camWidth;
                camCanvasDiv.style.height = camHeight;

                streaming = true
            }
        }, false);

        camCapture.addEventListener("click", function(ev) {
            takePicture();
            ev.preventDefault();
        }, false);

        clearPhoto();
    }

    function clearPhoto() {
        var ctx = camCanvas.getContext("2d");
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 0, camCanvas.width, camCanvas.height);

        // var data = camCanvas.toDataURL("image/png");
        // camImg.setAttribute("src", data);
    }

    function takePicture() {
        var ctx = camCanvas.getContext("2d");
        if (camWidth && camHeight) {
            camCanvas.width = camWidth;
            camCanvas.height = camHeight;
            ctx.drawImage(camInput, 0, 0, camWidth, camHeight);

            // var data = camCanvas.toDataURL("image/png");
            // camImg.setAttribute("src", data);

            const cropper = new Cropper(camCanvas, {
              aspectRatio: 8.56 / 5.4,
              viewMode: 0,
              dragMode: 'move',
              crop(event) {
                // console.log(event.detail.x);
                // console.log(event.detail.y);
                // console.log(event.detail.width);
                // console.log(event.detail.height);
                // console.log(event.detail.rotate);
                // console.log(event.detail.scaleX);
                // console.log(event.detail.scaleY);
              },
            });

            camCrop.addEventListener("click", function() {
                var cropped = cropper.getCroppedCanvas();
                var imgData = cropped.toDataURL("image/jpg");
                camImg.setAttribute("src", imgData);
            });

            camRotRange.addEventListener("input", function() {
                cropper.rotateTo(this.value);
            });
        } else {
            clearPhoto();
        }
    }

    window.addEventListener("load", function() {
        loadCam();
    });
})();
