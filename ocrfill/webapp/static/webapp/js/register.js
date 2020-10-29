(function() {
    var camHeight = 0;
    var camWidth = 500;

    var streaming = false;

    var camInput = null;
    var camCanvas = null;
    var camImg = null;
    var camCapture = null;
    var camCrop = null;
    var camRotRange = null;
    var imgUpload = null;
    var faceCutout = null;

    function loadCam() {
        camInput = document.getElementById("cam-input");
        camCanvas = document.getElementById("cam-canvas");
        camCanvasDiv = document.getElementById("cam-canvas-div");
        camImg = document.getElementById("cam-img");
        camCapture = document.getElementById("cam-capture");
        camCrop = document.getElementById("cam-crop");
        camRotRange = document.getElementById("cam-rot-range");
        imgUpload = document.getElementById("img-upload");
        faceCutout = document.getElementById("face-cutout");

        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(function(stream) {
                camInput.srcObject = stream;
                camInput.play();
            })
            .catch(function(err) {
                console.log("error occurred while playing video stream " + err);
            });

        camInput.addEventListener("canplay", function(ev) {
            if (!streaming) {
                camHeight = camInput.videoHeight / (camInput.videoWidth / camWidth);

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
            takePicture(camInput);
            ev.preventDefault();
        }, false);

        imgUpload.addEventListener("change", function(ev) {
            if (this.files && this.files.length > 0) {
                var file = this.files[0];
                var fr = new FileReader();
                fr.onload = function() {
                    var img = new Image();
                    img.onload = function() {
                        setTimeout(takePicture(img), 10);
                    }
                    img.src = fr.result;
                }
                fr.readAsDataURL(file);
            }
            ev.preventDefault();
        });

        clearPhoto();
    }

    function clearPhoto() {
        var ctx = camCanvas.getContext("2d");
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 0, camCanvas.width, camCanvas.height);
    }

    function processImg(imgData) {
        const csrftoken = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        var file;

        function urltoFile(url, filename, mimeType) {
            return (fetch(url)
                .then(function(res) {
                    return res.arrayBuffer();
                })
                .then(function(buf) {
                    return new File([buf], filename, {
                        type: mimeType
                    });
                })
            );
        }

        urltoFile(imgData, "img", imgData.split(";base64")[0].split(":")[1])
            .then(function(file) {
                var formData = new FormData();
                formData.append("img", file);
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState === 4 && this.status === 200) {
                        var resp = JSON.parse(this.responseText);
                        console.log(resp);
                        var form = document.getElementById("content-form");
                        form.name.value = resp.name;
                        form.father_name.value = resp.fathername;
                        form.dob.value = resp.dob;
                        form.pan.value = resp.pan;

                        if(resp.faceloc.toString().length > 0) {
                            var x, y, w, h;
                            x = Number(resp.faceloc.x);
                            y = Number(resp.faceloc.y);
                            w = Number(resp.faceloc.w);
                            h = Number(resp.faceloc.h);

                            var faceCtx = faceCutout.getContext("2d");
                            faceCtx.fillStyle = "#fff";
                            faceCtx.fillRect(0, 0, faceCutout.width, faceCutout.height);
                            faceCutout.width = w;
                            faceCutout.height = h;
                            faceCtx.drawImage(camImg, x, y, w, h, 0, 0, w, h);
                        }
                    }
                };
                xhttp.open("POST", "read_image", true);
                xhttp.setRequestHeader("X-CSRFToken", csrftoken);
                xhttp.send(formData);
            });
    }

    function takePicture(input) {
        if (camCanvas.classList.contains("cropper-hidden")) {
            clearPhoto();
            camCanvas.cropper.destroy();
        }
        var ctx = camCanvas.getContext("2d");
        if (camWidth && camHeight) {
            camCanvas.width = input.width ? input.width : camWidth;
            camCanvas.height = input.height ? input.height : camHeight;
            ctx.drawImage(input, 0, 0, camCanvas.width, camCanvas.height);

            const cropper = new Cropper(camCanvas, {
                aspectRatio: 8.56 / 5.4,
                viewMode: 2,
                preview: Element,
                dragMode: 'move'
            });

            camCrop.addEventListener("click", function() {
                var cropped = cropper.getCroppedCanvas();
                var imgData = cropped.toDataURL("image/jpg");
                camImg.setAttribute("src", imgData);

                processImg(imgData);
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
