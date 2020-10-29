import cv2
import re
import io
import base64
import pytesseract
import numpy as np
from PIL import Image
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def binary_to_image(stream):
    data = stream.read()
    image = np.asarray(bytearray(data), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    return image


def preprocess_image(img):
    result = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    result = cv2.GaussianBlur(result, (5, 5), 0)
    filter = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    result = cv2.filter2D(result, -1, filter)
    return result


def read_img(img):
    output = pytesseract.pytesseract.image_to_string(img)

    result = {
        "error": "",
        "name": "",
        "fathername": "",
        "dob": "",
        "pan": "",
        "faceloc": "",
    }

    for i in output.split("\n"):
        if(re.search("[a-z]+", i) or re.search("TAX+", i) or re.search("GOVT+", i) or re.search("INDIA+", i)):
            continue
        elif(re.search("[A-Z]{2,}", i) and not re.search("[0-9]+", i)):
            fnd = re.findall("[A-Z]{2,}", i)
            if(len(result["name"]) > 0):
                result["fathername"] = " ".join(fnd)
            else:
                result["name"] = " ".join(fnd)
        elif(re.search("[A-Z]{2,}", i) and re.search("[0-9]+", i)):
            fnd = re.findall("[A-Z0-9]+", i)
            result["pan"] = fnd[0]
        elif(re.search("\/+", i) and len(i.split("/")) == 3):
            fnd = re.split("\/", i)
            result["dob"] = "/".join(fnd)
        else:
            continue

    return result


def face_detect(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    print(BASE_DIR)
    cascade = cv2.CascadeClassifier(str(BASE_DIR) + "/haarcascade_face.xml")

    faces = cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) > 0:
        faceloc = {
            "x": "", "y": "", "w": "", "h": ""
        }

        (x, y, w, h) = faces[0]

        ex = (w * 0.25).astype(int)
        faceloc["x"] = str(x - ex)
        faceloc["y"] = str(y - ex)
        faceloc["w"] = str(w + ex)
        faceloc["h"] = str(h + ex)

        return faceloc
    else:
        return ""

def process_img(img):
    pan = binary_to_image(img)
    faceloc = face_detect(pan)
    cleaned = preprocess_image(pan)
    result = read_img(cleaned)
    result["faceloc"] = faceloc
    return result
