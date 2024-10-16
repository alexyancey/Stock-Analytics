import pandas_ta as ta
import numpy as np
import api

def calculate_support_resistance(data, window):
    data['Support'] = data[api.get_data_type().close].rolling(window=window).min()
    data['Resistance'] = data[api.get_data_type().close].rolling(window=window).max()
    return data['Support'].iloc[-1], data['Resistance'].iloc[-1]

def detect_trend(index, data, order=1):
    result = np.polyfit(index, list(data), order)
    slope = result[-2]
    return float(slope)

def calculate_macd(data):
    data.ta.macd(close=api.get_data_type().close, fast=12, slow=26, append=True)

def calculate_rsi(data, period=14):
    data['Change'] = data[api.get_data_type().close].diff()
    data['Gain'] = data['Change'].clip(lower=0)
    data['Loss'] = data['Change'].clip(upper=0).abs()
    data['Avg_Gain'] = data['Gain'].rolling(window=period).mean()
    data['Avg_Loss'] = data['Loss'].rolling(window=period).mean()
    data['RSI'] = 100 - (100 / (1 + (data['Avg_Gain'] / data['Avg_Loss'])))


# BRC
# - Upwards
#     - 10 min ago closes above resistance on increasing volume
#     - 5 min ago closes below resistance on decreasing volume
# - Downwards
#     - 10 min ago closes below support on increasing volume
#     - 5 min ago closes above support on decreasing volume
def check_brc(data, info):
    resistance_past_hour = info['resistance_past_hour']
    resistance_past_night = info['resistance_past_night']
    resistance_past_week = info['resistance_past_week']
    support_past_hour = info['support_past_hour']
    support_past_night = info['support_past_night']
    support_past_week = info['support_past_week']

    candle_5_min = data.iloc[-1][api.get_data_type().close]
    candle_10_min = data.iloc[-2][api.get_data_type().close]

    candle_5_min_vol = data.iloc[-1][api.get_data_type().volume]
    candle_10_min_vol = data.iloc[-2][api.get_data_type().volume]
    candle_15_min_vol = data.iloc[-3][api.get_data_type().volume]

    # We need to see increasing volume for the break, followed by decreasing volume
    has_valid_vol_trend = candle_15_min_vol < candle_10_min_vol and candle_5_min_vol < candle_10_min_vol

    result = 0
    key_level = 0
    if has_valid_vol_trend:
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

# Bounce Reject
# - Upwards
#     - Price far below 9ema
#     - 5 min ago closes near support (not below) on decreasing volume
# - Downwards
#     - Price far above 9ema
#     - 5 min ago closes near resistance (not above) on decreasing volume
def check_bounce_reject(data, info):
    resistance_past_hour = info['resistance_past_hour']
    resistance_past_night = info['resistance_past_night']
    resistance_past_week = info['resistance_past_week']
    support_past_hour = info['support_past_hour']
    support_past_night = info['support_past_night']
    support_past_week = info['support_past_week']

    candle_5_min = data.iloc[-1][api.get_data_type().close]
    volume_trend = find_recent_volume_trend(data)

    threshold = 0.75

    result = 0
    key_level = 0

    # Is the price close to the 9ema and is the volume decreasing recently?
    if (extended_from_ema(data, candle_5_min) and volume_trend < 0):
        # Check if we are within the threshold of the key levels
        if resistance_past_hour >= candle_5_min and resistance_past_hour - candle_5_min <= threshold:
            result = -1
            key_level = resistance_past_hour
        elif resistance_past_night >= candle_5_min and resistance_past_night - candle_5_min <= threshold:
            result = -1
            key_level = resistance_past_night
        elif resistance_past_week >= candle_5_min and resistance_past_week - candle_5_min <= threshold:
            result = -1
            key_level = resistance_past_week
        elif support_past_hour <= candle_5_min and candle_5_min - support_past_hour <= threshold:
            result = 1
            key_level = support_past_hour
        elif support_past_night <= candle_5_min and candle_5_min - support_past_night <= threshold:
            result = 1
            key_level = support_past_night
        elif support_past_week <= candle_5_min and candle_5_min - support_past_week <= threshold:
            result = 1
            key_level = support_past_week

    return result, key_level

# !!These below must be tested on current candle since entry is at the close of it potentially!!

# RBR
# - Upwards
#     - Uptrend over past several candles
#     - Close to 9ema
#     - 5 min ago large green candle
#     - Current candle (4m30s) has small close/open and 50% volume
# - Downwards
#     - Downtrend over past several candles
#     - Close to 9ema
#     - 5 min ago large blue candle
#     - Current candle (4m30s) has small close/open and 50% volume
def check_rbr(data, current):
    candle_5_min_open = data.iloc[-1][api.get_data_type().open]
    candle_5_min_close = data.iloc[-1][api.get_data_type().close]
    candle_5_min_volume = data.iloc[-1][api.get_data_type().volume]

    current_open = current.info['open']
    current_price = current.info['currentPrice']
    current_volume = current.info['volume']

    vol_trend = find_recent_volume_trend(data)

    result = 0
    if current_volume / candle_5_min_volume <= 0.5 and close_to_ema(data, candle_5_min_close):
        if abs(current_price - current_open) <= 0.1:
            if candle_5_min_close - candle_5_min_open >= 0.6:
                if vol_trend > 0:
                    result = 1
                else:
                    result = -1
            elif candle_5_min_open - candle_5_min_close >= 0.6:
                if vol_trend > 0:
                    result = 1
                else:
                    result = -1

    return result

# Morning Star
# - Upwards
#     - 5 min ago large blue candle
#     - Current candle (4m30s) has small close/open on decreasing volume
#     - Check RSI < 40
# - Downwards
#     - 5 min ago large green candle
#     - Current candle (4m30s) has small close/open on decreasing volume
#     - Check RSI > 60
def check_morning_star(data, current):
    candle_5_min_open = data.iloc[-1][api.get_data_type().open]
    candle_5_min_close = data.iloc[-1][api.get_data_type().close]

    current_open = current.info['open']
    current_price = current.info['currentPrice']

    vol_trend = find_recent_volume_trend(data)
    rsi = calculate_rsi(data)

    result = 0
    if abs(current_price - current_open) <= 0.1:
        if candle_5_min_close - candle_5_min_open >= 0.6:
            if vol_trend < 0 and rsi <= 40:
                result = 1
        elif candle_5_min_open - candle_5_min_close >= 0.6:
            if vol_trend > 0 and rsi >= 60:
                result = -1

    return result

# Hammer
# - Upwards
#     - Current candle (4m30s) is green and has large high/low diff and current price is near the high
#     - Check RSI < 40
# - Downwards
#     - Current candle (4m30s) is blue and has large high/low diff and current price is near the low
#     - Check RSI > 60
def check_hammer(data, current):
    current_high = current.info['high']
    current_low = current.info['low']
    current_price = current.info['currentPrice']

    rsi = calculate_rsi(data)
    
    result = 0
    # Look for large candle wicks
    if current_high - current_low > 0.6:
        if current_high - current_price < 0.1 and rsi <= 40:
            result = 1
        if current_price - current_low < 0.1 and rsi >= 60:
            result = -1

    return result

# Engulfing
# - Upwards
#     - 5 min ago candle is moderate size blue
#     - Current candle (4m30s) is green with high/current > prev high/open and low < prev low
# - Downwards
#     - 5 min ago candle is moderate size green
#     - Current candle (4m30s) is blue with low/current < prev low/open and high > prev high
def check_engulfing(data, current):
    candle_5_min_high = data.iloc[-1][api.get_data_type().high]
    candle_5_min_low = data.iloc[-1][api.get_data_type().low]
    candle_5_min_open = data.iloc[-1][api.get_data_type().open]
    candle_5_min_close = data.iloc[-1][api.get_data_type().close]

    current_high = current.info['high']
    current_low = current.info['low']
    current_price = current.info['currentPrice']

    result = 0
    if candle_5_min_close - candle_5_min_open >= 0.6:
        if current_high > candle_5_min_high and current_price > candle_5_min_open and current_low < candle_5_min_low:
            result = 1
    elif candle_5_min_open - candle_5_min_close >= 0.6:
        if current_low < candle_5_min_low and current_price < candle_5_min_open and current_high > candle_5_min_high:
            result = -1

    return result

# Utility functions

def close_to_ema(data, prev_close):
    ema = data.iloc[-1]['9ema']
    diff = (abs(prev_close - ema) / ema) * 100
    return diff <= 0.75

def extended_from_ema(data, prev_close):
    ema = data.iloc[-1]['9ema']
    diff = (abs(prev_close - ema) / ema) * 100
    return diff >= 1

def find_recent_volume_trend(data):
    recent_data = data.iloc[-4]
    index = np.arange(len(recent_data))
    recent_data = recent_data[api.get_data_type().volume]
    trend = detect_trend(index, recent_data)
    if trend > 0:
        return 1
    elif trend < 0:
        return -1
    else:
        return 0