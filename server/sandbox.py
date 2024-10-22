import api
import analysis
from flask import jsonify
import numpy as np
import datetime

def analyze(ticker):
    # Load recent data
    df = api.load_past_stocks(ticker)
    if df is None:
        return None
        #return jsonify({ "error": "Couldn't load past data"}), 500

    # Calculate trends
    index = np.arange(len(df))
    data = df[api.get_data_type().close].tolist()
    trend = analysis.detect_trend(index, data)

    overnight = api.parse_overnight_data(df)
    index = np.arange(len(overnight))
    data = overnight[api.get_data_type().close].tolist()
    overnight_trend = analysis.detect_trend(index, data)
    print(overnight_trend)
    print(datetime.date.today())

    prev_day = api.parse_overnight_data(df)
    #return jsonify(result)

# data = api.load_recent_data('TSLA')
# print(data)

# last = data.iloc[-1]['close']
# print(last)

# df = api.load_past_stocks('TSLA')
# # current = api.load_current_data('TSLA')
# print(df)

# # overnight = api.parse_overnight_data(df)
# # print(overnight)

# prev_day = api.parse_previous_day_data(df)
# print(prev_day)

d = analyze('AAPL')

# trimmed = api.parse_current_day_data(df)
# print(trimmed)

# info = {
#     "resistance_past_hour": 218.18,
#     "resistance_past_night": 225.21,
#     "resistance_past_week": 265.73,
#     "support_past_hour": 217.9,
#     "support_past_night": 212.58,
#     "support_past_week": 212.58
# }
# result = analysis.check_rbr(df, current)
# print(result)