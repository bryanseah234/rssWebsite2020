from shutil import Error
from PIL import Image
import time
from flask import Flask, render_template, request, redirect, url_for
from flask import *
from flask import send_file, send_from_directory, safe_join, abort
from copy import copy
# from main import app as Application
from werkzeug.utils import secure_filename


app = Flask(__name__, template_folder='templates')


@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.cache_control.max_age = 0
    return response


@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response


@app.route('/', methods=['POST', 'GET'])
def root():
    return render_template('index.html')
