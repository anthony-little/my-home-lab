const REFORM_DATE = new Date('2027-07-01T00:00:00Z');
const TAX_RATES_2026_27 = [
  { upTo: 18200, base: 0, rate: 0, over: 0 },
  { upTo: 45000, base: 0, rate: 0.15, over: 18200 },
  { upTo: 135000, base: 4020, rate: 0.30, over: 45000 },
  { upTo: 190000, base: 31020, rate: 0.37, over: 135000 },
  { upTo: Infinity, base: 51370, rate: 0.45, over: 190000 },
];

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
const fields = ['income', 'saleYear', 'investorType', 'strategy', 'assetClass', 'acquired', 'sold', 'costBase', 'proceeds', 'losses', 'transitionValue', 'cpiFactor', 'newBuildElection'];
fields.forEach((id) => document.getElementById(id).addEventListener('input', calculate));

function taxOn(income) {
  const bracket = TAX_RATES_2026_27.find((row) => income <= row.upTo);
  return bracket.base + Math.max(0, income - bracket.over) * bracket.rate;
}

function daysBetween(start, end) {
  return Math.round((end - start) / 86_400_000);
}

function taxableCurrent(gain, losses, heldDays) {
  const afterLosses = Math.max(0, gain - losses);
  const discount = heldDays >= 365 ? 0.5 : 0;
  return { taxableGain: afterLosses * (1 - discount), discount };
}

function calculate() {
  const income = Number(document.getElementById('income').value) || 0;
  const saleYear = document.getElementById('saleYear').value;
  const assetClass = document.getElementById('assetClass').value;
  const strategy = document.getElementById('strategy').value;
  const acquired = new Date(`${document.getElementById('acquired').value}T00:00:00Z`);
  const sold = new Date(`${document.getElementById('sold').value}T00:00:00Z`);
  const costBase = Number(document.getElementById('costBase').value) || 0;
  const proceeds = Number(document.getElementById('proceeds').value) || 0;
  const losses = Number(document.getElementById('losses').value) || 0;
  const transitionValue = Number(document.getElementById('transitionValue').value) || costBase;
  const cpiFactor = Math.max(1, Number(document.getElementById('cpiFactor').value) || 1);
  const heldDays = daysBetween(acquired, sold);
  const nominalGain = proceeds - costBase;
  const trace = [];

  let taxableGain = 0;
  let rule = 'Current CGT rules';
  if (nominalGain <= 0) {
    taxableGain = 0;
    trace.push(`Capital loss of ${money.format(Math.abs(nominalGain))} is not offset against ordinary income; carry forward subject to ATO rules.`);
  } else if (saleYear === 'pre2027' || sold < REFORM_DATE) {
    const current = taxableCurrent(nominalGain, losses, heldDays);
    taxableGain = current.taxableGain;
    trace.push(`Nominal gain ${money.format(nominalGain)} less capital losses ${money.format(losses)}.`);
    trace.push(current.discount ? 'Held for at least 12 months, so the individual 50% CGT discount is applied after losses.' : 'Held for less than 12 months, so no CGT discount is applied.');
  } else {
    rule = 'Post-1 July 2027 reform scenario with grandfathering';
    const preGain = Math.max(0, Math.min(transitionValue, proceeds) - costBase);
    const postGain = Math.max(0, proceeds - Math.max(transitionValue, costBase));
    const currentPre = taxableCurrent(preGain, Math.min(losses, preGain), daysBetween(acquired, REFORM_DATE));
    const remainingLosses = Math.max(0, losses - preGain);
    const indexedTransitionCost = Math.max(transitionValue, costBase) * cpiFactor;
    const realPostGain = Math.max(0, proceeds - indexedTransitionCost - remainingLosses);
    taxableGain = currentPre.taxableGain + realPostGain;
    trace.push(`Grandfathered pre-reform gain: ${money.format(preGain)} using the 1 July 2027 value, with current discount rules where eligible.`);
    trace.push(`Post-reform real gain: sale proceeds less indexed transition cost (${money.format(indexedTransitionCost)}).`);
    trace.push('The calculator estimates income tax on total income, then enforces a 30% minimum tax rate on the post-reform taxable gain component.');
    if (assetClass === 'property' && document.getElementById('newBuildElection').value === 'yes') {
      const oldRules = taxableCurrent(nominalGain, losses, heldDays).taxableGain;
      taxableGain = Math.min(taxableGain, oldRules);
      trace.push('New build election selected: result compares reform treatment with current 50% discount treatment and uses the lower taxable gain.');
    }
  }

  const taxWithout = taxOn(income);
  const taxWith = taxOn(income + taxableGain);
  let estimatedCgt = Math.max(0, taxWith - taxWithout);
  if (saleYear === 'post2027' && sold >= REFORM_DATE && nominalGain > 0) {
    const postTaxable = Math.max(0, taxableGain - taxableCurrent(Math.max(0, Math.min(transitionValue, proceeds) - costBase), 0, daysBetween(acquired, REFORM_DATE)).taxableGain);
    estimatedCgt = Math.max(estimatedCgt, postTaxable * 0.30);
  }

  trace.push(strategyTip(strategy, assetClass));
  renderSummary({ rule, nominalGain, taxableGain, estimatedCgt, afterTaxGain: nominalGain - estimatedCgt });
  renderTrace(trace);
}

function strategyTip(strategy, assetClass) {
  if (strategy === 'Dollar cost averaging') return 'DCA tip: model each purchase parcel separately because acquisition dates, cost bases and grandfathering splits differ.';
  if (assetClass === 'managedFund') return 'Managed fund tip: use the AMMA/tax statement to adjust cost base for tax-deferred and attributed capital gain amounts.';
  if (assetClass === 'ess') return 'ESS tip: the cost base often starts from the ESS taxing point market value plus amounts paid, not just the original employee price.';
  if (assetClass === 'property') return 'Property tip: include buying, selling and eligible ownership costs in the cost base, and keep valuation evidence for 1 July 2027.';
  return 'Planning tip: compare selling across financial years if your marginal rate changes materially.';
}

function renderSummary(values) {
  document.getElementById('summary').innerHTML = Object.entries({
    'Rule set': values.rule,
    'Nominal gain': money.format(values.nominalGain),
    'Taxable net capital gain': money.format(values.taxableGain),
    'Estimated extra tax': money.format(values.estimatedCgt),
    'After-tax gain': money.format(values.afterTaxGain),
  }).map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderTrace(items) {
  document.getElementById('trace').innerHTML = items.map((item) => `<li>${item}</li>`).join('');
}

calculate();
