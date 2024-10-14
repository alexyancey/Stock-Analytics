import yfinance as yf

def load_past_stocks(ticker):
    return yf.download(tickers=ticker, interval="5m", period='5d', prepost=True)

def load_current_data(ticker):
    return yf.Ticker(ticker)