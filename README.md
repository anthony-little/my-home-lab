# Australian CGT Planner 2026–27

A static, browser-based education tool for Australian resident individual taxpayers who want a retail-level estimate of capital gains tax outcomes for:

- listed shares and ETFs,
- managed fund or trust units,
- investment property, and
- employee share plan shares.

The calculator includes a strategy lens for common retail behaviours such as buy-and-hold, dollar cost averaging, portfolio rebalancing, and ESS vest-and-hold.

## Calculation approach

The tool deliberately shows a calculation trace instead of only a final number. It uses 2026–27 Australian resident individual tax brackets, applies the existing 50% CGT discount for eligible assets held for at least 12 months, and models announced CGT reforms applying from 1 July 2027.

For post-reform sales of pre-reform assets, the tool splits the capital gain into:

1. a grandfathered pre-1 July 2027 component, calculated from cost base to the entered transition market value and assessed under current discount rules where eligible; and
2. a post-1 July 2027 component, calculated from the transition value to sale proceeds after indexing the transition value by the entered CPI factor.

It also models the announced 30% minimum tax rate on post-reform taxable gains and provides a new-build property election that compares the reform calculation with the current 50% discount treatment.

## Source basis

- ATO resident tax rates for the 2026–27 income year: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
- ATO CGT discount guidance: https://www.ato.gov.au/individuals-and-families/investments-and-assets/capital-gains-tax/cgt-discount
- Australian Government Budget 2026–27 tax reform summary: https://budget.gov.au/content/04-tax-reform.htm

## Running locally

Open `index.html` in a modern browser. No build step is required.

## Important limitations

This is not tax advice. It does not cover every CGT event, non-resident rules, main-residence rules, small-business concessions, collectables, personal-use assets, deceased estates, detailed trust attribution mechanics, partial property private-use adjustments, Medicare levy, offsets, HELP repayments, or state duties. Managed fund investors should use adjusted cost-base figures from AMMA or annual tax statements. ESS participants should confirm the ESS taxing point and cost base.
