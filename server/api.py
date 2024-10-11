import yfinance as yf
from alpha_vantage.timeseries import TimeSeries

api_key = ''

def load_past_stocks(ticker, intervals_per_day=192, max_days=5):
    # Set up the timeseries with key
    ts = TimeSeries(key=api_key, output_format='pandas')

    # Make the API request and get the CSV content
    df = ts.get_intraday(symbol=ticker, interval='5min', outputsize='full', extended_hours=True)
    df = df.iloc[::-1]
    df = df.iloc[-(intervals_per_day * max_days):]
    return df

def load_recent_data(ticker):
    return yf.Ticker(ticker).history(interval="5m", period="1d")

def load_current_data(ticker):
    return yf.Ticker(ticker)