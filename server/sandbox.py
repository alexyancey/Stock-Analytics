import api
import analysis


# data = api.load_recent_data('TSLA')
# print(data)

# last = data.iloc[-1]['close']
# print(last)

df = api.load_past_stocks('TSLA', True)
# current = api.load_current_data('TSLA')
print(df)

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