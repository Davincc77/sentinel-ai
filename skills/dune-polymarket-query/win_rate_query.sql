-- SQL Template: Polymarket Wallets with Win Rate > 50%
-- Finds wallets that have successfully predicted the outcome of more than 50% of the markets they traded in.
WITH
  UserMarketTrades AS (
    -- Select all trades made by users, associating them with market resolution details.
    -- Assumes 'polymarket.trades' and 'polymarket.markets' tables exist.
    SELECT
      t.user_address,          -- The wallet address of the trader.
      t.market_id,             -- Identifier for the market.
      t.outcome AS user_outcome, -- The outcome the user bet on.
      t.amount_usd,            -- The USD value of the trade.
      t.block_time,            -- Timestamp of the trade.
      m.final_outcome,         -- The final resolved outcome of the market.
      m.resolved_at,           -- Timestamp when the market was resolved.
      CASE
        WHEN t.outcome = m.final_outcome THEN TRUE -- TRUE if user's bet matches the final outcome.
        ELSE FALSE
      END AS bet_on_final_outcome
    FROM
      polymarket.trades AS t
    LEFT JOIN
      polymarket.markets AS m
    ON
      t.market_id = m.market_id
    WHERE m.resolved_at IS NOT NULL -- Only consider markets that have been resolved.
  ),
  UserWinLoss AS (
    -- Calculate win/loss metrics per user.
    SELECT
      user_address,
      COUNT(DISTINCT market_id) AS total_markets_traded, -- Total unique markets traded by the user.
      SUM(CASE WHEN bet_on_final_outcome THEN 1 ELSE 0 END) AS markets_won, -- Count of markets where the user's bet matched the final outcome.
      SUM(amount_usd) AS total_volume_traded, -- Total USD volume traded by the user.
      AVG(amount_usd) AS average_trade_size_usd -- Average USD value per trade.
    FROM
      UserMarketTrades
    GROUP BY
      user_address
  )
SELECT
  user_address,
  total_markets_traded,
  markets_won,
  -- Calculate win rate percentage, handling division by zero if necessary.
  CASE
    WHEN total_markets_traded = 0 THEN 0.0
    ELSE (markets_won * 100.0 / total_markets_traded)
  END AS win_rate_percent,
  total_volume_traded,
  average_trade_size_usd
FROM
  UserWinLoss
WHERE
  win_rate_percent > 50 -- Filter for wallets with a win rate greater than 50%.
ORDER BY
  win_rate_percent DESC; -- Order by win rate descending.
