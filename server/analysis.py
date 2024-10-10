import pandas as pd
import pandas_ta as ta
import numpy as np
import yfinance as yf

def calculate_support_resistance(data, window):
    data['Support'] = data['low'].rolling(window=window).min()
    data['Resistance'] = data['high'].rolling(window=window).max()
    return data['Support'].iloc[-1], data['Resistance'].iloc[-1]

def detect_trend(index, data, order=1):
    result = np.polyfit(index, list(data), order)
    slope = result[-2]
    return float(slope)

def calculate_macd(data):
    data.ta.macd(close='close', fast=12, slow=26, append=True)

def calculate_rsi(data, period=14):
    data['Change'] = data['close'].diff()
    data['Gain'] = data['Change'].clip(lower=0)
    data['Loss'] = data['Change'].clip(upper=0).abs()
    data['Avg_Gain'] = data['Gain'].rolling(window=period).mean()
    data['Avg_Loss'] = data['Loss'].rolling(window=period).mean()
    data['RSI'] = 100 - (100 / (1 + (data['Avg_Gain'] / data['Avg_Loss'])))

def check_brc(data, info):
    resistance_past_hour = info['resistance_past_hour']
    resistance_past_night = info['resistance_past_night']
    resistance_past_week = info['resistance_past_week']
    support_past_hour = info['support_past_hour']
    support_past_night = info['support_past_night']
    support_past_week = info['support_past_week']

    candle_5_min = data.iloc[-1]['Close']
    candle_10_min = data.iloc[-2]['Close']

    # candle_5_min = 99
    # candle_10_min = 103

    # Return 1 -> upward brc, 0 -> no brc, -1 -> downward brc
    # Return relevant resistance/support

    result = 0
    key_level = 0
    if candle_10_min > resistance_past_hour and candle_5_min < resistance_past_hour:
        result = 1
        key_level = resistance_past_hour
    elif candle_10_min > resistance_past_night and candle_5_min < resistance_past_night:
        result = 1
        key_level = resistance_past_night
    elif candle_10_min > resistance_past_week and candle_5_min < resistance_past_week:
        result = 1
        key_level = resistance_past_week
    elif candle_10_min < support_past_hour and candle_5_min > support_past_hour:
        result = -1
        key_level = support_past_hour
    elif candle_10_min < support_past_night and candle_5_min > support_past_night:
        result = -1
        key_level = support_past_night
    elif candle_10_min < support_past_week and candle_5_min > support_past_week:
        result = -1
        key_level = support_past_week
    return result, key_level

def check_rbr(data, current):
    candle_5_min_open = data.iloc[-1]['Open']
    candle_5_min_close = data.iloc[-1]['Close']
    candle_5_min_volume = data.iloc[-1]['Volume']

    current_open = current.info['open']
    current_price = current.info['currentPrice']
    current_volume = current.info['volume']

    # candle_5_min_open = 100
    # candle_5_min_close = 101
    # candle_5_min_volume = 20

    # current_open = 101
    # current_price = 101.05
    # current_volume = 12

    result = 0
    if current_volume / candle_5_min_volume <= 0.75:
        if abs(current_price - current_open) <= 0.1:
            if candle_5_min_close - candle_5_min_open >= 0.6:
                result = 1
            elif candle_5_min_open - candle_5_min_close >= 0.6:
                result = -1

    return result

def check_bounce_reject(data, info):
    resistance_past_hour = info['resistance_past_hour']
    resistance_past_night = info['resistance_past_night']
    resistance_past_week = info['resistance_past_week']
    support_past_hour = info['support_past_hour']
    support_past_night = info['support_past_night']
    support_past_week = info['support_past_week']

    # calculate 9ema here
    ema = data.iloc[-1]['9ema']
    candle_5_min = data.iloc[-1]['Close']

    # candle_5_min = 99.5
    threshold = 0.75

    result = 0
    key_level = 0

    # Are we within 0.5 of a key level?
    if resistance_past_hour >= candle_5_min and resistance_past_hour - candle_5_min <= threshold:
        if ((candle_5_min - ema) / ema) * 100 >= 1:
            result = -1
            key_level = resistance_past_hour
    elif resistance_past_night >= candle_5_min and resistance_past_night - candle_5_min <= threshold:
        if ((candle_5_min - ema) / ema) * 100 >= 1:
            result = -1
            key_level = resistance_past_night
    elif resistance_past_week >= candle_5_min and resistance_past_week - candle_5_min <= threshold:
        if ((candle_5_min - ema) / ema) * 100 >= 1:
            result = -1
            key_level = resistance_past_week
    elif support_past_hour <= candle_5_min and candle_5_min - support_past_hour <= threshold:
        if ((candle_5_min - ema) / ema) * 100 <= 1:
            result = 1
            key_level = support_past_hour
    elif support_past_night <= candle_5_min and candle_5_min - support_past_night <= threshold:
        if ((candle_5_min - ema) / ema) * 100 <= 1:
            result = 1
            key_level = support_past_night
    elif support_past_week <= candle_5_min and candle_5_min - support_past_week <= threshold:
        if ((candle_5_min - ema) / ema) * 100 <= 1:
            result = 1
            key_level = support_past_week

    return result, key_level