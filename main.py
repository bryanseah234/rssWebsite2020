from flask import Flask, render_template

app = Flask(__name__, template_folder='templates')

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.cache_control.max_age = 0
    return response

@app.route('/', methods=['GET', 'POST'])
def root():
    return render_template('index.html')
