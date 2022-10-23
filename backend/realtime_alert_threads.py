import multiprocessing
import yfinance as yf

running = {}

def track_stock(userid, stock, min_percent_change, interval):
    while(1):
        yf_stock = yf.Ticker(stock)
        response_body = yf_stock.history(period=interval)
        prev_val = response_body['Close'].iloc[0]
        curr_val = response_body['Close'].iloc[len(response_body['Close'])]
        diff = curr_val - prev_val

def start_thread(userid, stock, min_percent_change, interval):
    new_process = multiprocessing.Process(
        target=track_stock, 
        args=(stock, min_percent_change, interval)
    )
    running[(userid, stock)] = True
    new_process.start()
