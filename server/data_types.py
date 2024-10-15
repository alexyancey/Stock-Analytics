from abc import ABC, abstractmethod

class StockData(ABC):
    @property
    @abstractmethod
    def low(self):
        pass

    @property
    @abstractmethod
    def high(self):
        pass

    @property
    @abstractmethod
    def open(self):
        pass

    @property
    @abstractmethod
    def close(self):
        pass

    @property
    @abstractmethod
    def volume(self):
        pass

# Yfinance
class YfinanceData(StockData):
    @property
    def low(self):
        return 'Low'
    
    @property
    def high(self):
        return 'High'
    
    @property
    def open(self):
        return 'Open'
    
    @property
    def close(self):
        return 'Adj Close'
    
    @property
    def volume(self):
        return 'Volume'