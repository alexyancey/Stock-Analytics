import api


data = api.load_recent_data('TSLA')
print(data)

last = data.iloc[-1]['close']
print(last)