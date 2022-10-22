from flask import Flask
import yfinance as yf

api = Flask(__name__)

@api.route('/profile')
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@api.route('/stock')
def stock():
    msft = yf.Ticker("MSFT")
    response_body = msft.info

    return response_body

if __name__ == '__main__':
    api.run(threaded=True, port=5000)