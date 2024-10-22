import yfinance as yf
import data_types
import pandas as pd
import datetime

def load_past_stocks(ticker, trim=False):
    try:
        data = yf.download(tickers=ticker, interval="5m", period='5d', prepost=True)
        if trim:
            data = parse_current_day_data(data)
    except Exception as e:
        print("An unexpected error occurred loading past data:", e)
        return None
    else:
        return data

def parse_overnight_data(data):
    today = pd.to_datetime(datetime.date.today(), format='%Y-%m-%d')
    data['date'] = pd.to_datetime(data.index.date, format='%Y-%m-%d')
    data = data.between_time('04:00:00', '09:25:00')
    data = data[data['date'] == today]
    return data

def parse_previous_day_data(data):
    weekday = datetime.date.today().weekday()
    delta = 1
    if weekday == 0:
        delta = 3

    yesterday = pd.to_datetime(datetime.date.today() - datetime.timedelta(days=delta), format='%Y-%m-%d')
    print(yesterday)
    data['date'] = pd.to_datetime(data.index.date, format='%Y-%m-%d')
    data = data.between_time('09:30:00', '15:55:00')
    data = data[data['date'] == yesterday]
    return data

def parse_current_day_data(data):
    today = pd.to_datetime(datetime.date.today(), format='%Y-%m-%d')
    data['date'] = pd.to_datetime(data.index.date, format='%Y-%m-%d')
    data = data.between_time('09:30:00', '15:55:00')
    data = data[data['date'] == today]
    return data

def load_current_data(ticker):
    try:
        data = yf.download(tickers=ticker, interval="1m", period='1d', prepost=True)
        quote = yf.Ticker(ticker).info
        # Get data from past 4 minutes since we check every 4m
        relevant_data = data.iloc[-4:]
        current = {}
        current['open'] = relevant_data.iloc[0][get_data_type().open]
        current['high'] = relevant_data[get_data_type().high].max()
        current['low'] = relevant_data[get_data_type().low].min()
        current['volume'] = relevant_data[get_data_type().volume].sum()
        current['currentPrice'] = quote['currentPrice']

    except Exception as e:
        print("An unexpected error occurred loading current data:", e)
        return None
    else:
        return current

def get_data_type():
    return data_types.YfinanceData()