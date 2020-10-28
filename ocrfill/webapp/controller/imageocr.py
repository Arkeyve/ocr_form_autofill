import cv2
import re
import io
import base64
import pytesseract
import numpy as np
from PIL import Image

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
      "pan": ""
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

def process_img(img):
    pan = binary_to_image(img)
    cleaned = preprocess_image(pan)
    return read_img(cleaned)
