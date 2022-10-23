import multiprocessing
import yfinance as yf

running = {}
running_info = {}

def track_stock(userid, stock, min_percent_change, interval):
    while(1):
        yf_stock = yf.Ticker(stock)
        response_body = yf_stock.history(period=interval)
        prev_val = response_body['Close'].iloc[0]
        curr_val = response_body['Close'].iloc[len(response_body['Close'])]
        percent_change = (curr_val - prev_val)/prev_val
        if (percent_change >= min_percent_change):
            # alert here!
            pass

def start_thread(userid, stock, min_percent_change, interval, alert_int):
    new_process = multiprocessing.Process(
        target=track_stock, 
        args=(stock, min_percent_change, interval)
    )
    running[(userid, stock)] = new_process
    running_info[(userid, stock)] = {
        "min_percent_change" : min_percent_change,
        "interval" : interval,
        "alert_int" : alert_int
    }
    new_process.start()

def terminate_thread(userid, stock):
    thread = running.pop((userid, stock), None)
    running_info.pop((userid, stock), None)
    if thread != None:
        thread.terminate

def update_thread(userid, stock, **kwargs):
    # if "newFreq" in kwargs:
    #     running_info[(userid, stock)]["interval"] = 
    # if "newPercentChange" in kwargs:

    # if "newAlert" in kwargs:
