-- SQL Template: High Frequency Small Trades
-- Identifies wallets making more than 10 trades <= $10 USD in a single day.
WITH
  SmallTrades AS (
    -- Filter for trades that are considered 'small' (<= $10 USD).
    -- Assumes 'polymarket.trades' table with 'amount_usd' and 'block_time'.
    SELECT
      user_address,          -- The wallet address of the trader.
      market_id,             -- Identifier for the market.
      amount_usd,            -- The USD value of the trade.
      block_time,            -- Timestamp of the trade.
      DATE(block_time) AS trade_date -- Extract the date for daily grouping.
    FROM
      polymarket.trades
    WHERE
      amount_usd <= 10 -- Define 'small trade' threshold (e.g., $10 USD or less).
  ),
  DailyTradeCounts AS (
    -- Count the number of small trades per user per day.
    SELECT
      user_address,
      trade_date,
      COUNT(market_id) AS daily_small_trade_count -- Total small trades on this date for this user.
    FROM
      SmallTrades
    GROUP BY
      user_address,
      trade_date
  )
SELECT
  user_address,
  trade_date,
  daily_small_trade_count
FROM
  DailyTradeCounts
WHERE
  daily_small_trade_count > 10 -- Define 'high frequency' threshold (e.g., more than 10 trades per day).
ORDER BY
  user_address,
  trade_date DESC; -- Order by user and date.
