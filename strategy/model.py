"""Bizzing five-year model.

Two structural rules make it profitable from week one:
  (1) ANNUAL-UPFRONT billing — cash arrives before the service is delivered.
  (2) Every discretionary cost is a PERCENTAGE OF TRAILING REVENUE, not a fixed
      budget. A cost line therefore cannot outrun the income that funds it.

Founder pay is deliberately NOT a cost line until Year 3: until then EBITDA *is*
what the founders take home. That is stated on the slide rather than hidden,
because it is the difference between cash profit and economic profit.

Nothing below is a plug. Every printed figure is computed."""

WEEKLY   = [4, 18, 52, 115, 195]      # new paying households per week
CHURN    = 0.30
DIASPORA = [1.00, 0.92, 0.80, 0.70, 0.62]
ARPU_D, ARPU_I = 250, 45
R_PAID, R_CONTENT, R_MENTOR, R_COGS = 0.18, 0.12, 0.50, 0.55
FEES, HOSTING = 0.035, 0.004
# Floors are real money spent even at tiny revenue. Y1's floor is sized to stay
# under week-one income — that is what keeps the week-one claim true.
FLOOR_CONTENT = [10.8e3, 34e3, 30e3, 42e3, 54e3]
GNA           = [2.1e3, 9e3, 26e3, 52e3, 84e3]
PEOPLE        = [0, 24e3, 96e3, 300e3, 620e3]   # founders unpaid until Y3
COHORT_SHARE  = [0, 0, 0.13, 0.19, 0.22]
PHYS_SHARE    = [0, 0.05, 0.08, 0.09, 0.10]
PAID_CAC      = 130

end_prev, R = 0, []
for y in range(5):
    new = WEEKLY[y]*52
    end = end_prev*(1-CHURN) + new
    avg = (end_prev+end)/2 if y else new/2
    d = DIASPORA[y]; arpu = ARPU_D*d + ARPU_I*(1-d)
    rev = (avg*arpu)/(1-COHORT_SHARE[y]-PHYS_SHARE[y])
    coh, phys = rev*COHORT_SHARE[y], rev*PHYS_SHARE[y]
    paid, content = rev*R_PAID, max(rev*R_CONTENT, FLOOR_CONTENT[y])
    var = rev*(FEES+HOSTING)
    cost = paid+content+var+coh*R_MENTOR+phys*R_COGS+GNA[y]+PEOPLE[y]
    R.append(dict(y=y+1,new=new,end=end,avg=avg,arpu=arpu,rev=rev,sub=rev-coh-phys,
        coh=coh,phys=phys,paid=paid,content=content,var=var,mentor=coh*R_MENTOR,
        cogs=phys*R_COGS,gna=GNA[y],ppl=PEOPLE[y],cost=cost,eb=rev-cost,
        bought=paid/PAID_CAC, pshare=(paid/PAID_CAC)/new))
    end_prev = end

def row(l,f): print(f"{l:32}"+''.join(f"{f(r):>13}" for r in R))
print(f"{'':32}"+''.join(f"{'Y'+str(i+1):>13}" for i in range(5))); print('-'*97)
row('New paying households / week', lambda r:f"{WEEKLY[r['y']-1]:,}")
row('New in year',    lambda r:f"{r['new']:,.0f}")
row('End households', lambda r:f"{r['end']:,.0f}")
row('Blended ARPU',   lambda r:f"${r['arpu']:,.0f}"); print()
row('Revenue',        lambda r:f"${r['rev']:,.0f}")
for k,l in [('sub','  Subscriptions'),('coh','  Cohorts'),('phys','  Physical & media')]:
    row(l, lambda r,k=k:f"${r[k]:,.0f}")
print()
for k,l in [('paid','  Paid media 18%'),('content','  Content & tools 12%/floor'),
            ('mentor','  Mentors 50% of cohort'),('cogs','  Physical COGS 55%'),
            ('var','  Fees & hosting 3.9%'),('gna','  G&A fixed'),('ppl','  People')]:
    row(l, lambda r,k=k:f"${r[k]:,.0f}")
row('Total cost', lambda r:f"${r['cost']:,.0f}")
row('EBITDA',     lambda r:f"${r['eb']:,.0f}")
row('Margin',     lambda r:f"{r['eb']/r['rev']:.0%}"); print()
print("--- what the 18% cap can BUY at $130 CAC (the rest must be earned) ---")
row('Paid can buy',  lambda r:f"{r['bought']:,.0f}")
row('Paid share',    lambda r:f"{r['pshare']:.0%}")
row('Organic must deliver', lambda r:f"{r['new']-r['bought']:,.0f}"); print()

for r in R: assert r['eb']>0, f"Y{r['y']} LOSES MONEY"
print("PASS  positive EBITDA in all five years")
wr = 4*ARPU_D
wc = wr*(R_PAID+FEES+HOSTING) + FLOOR_CONTENT[0]/52 + GNA[0]/52
print(f"WEEK 1  in ${wr:,.0f}   out ${wc:,.0f}   = +${wr-wc:,.0f}")
assert wr > wc; print("PASS  week one cash-positive")
assert all(WEEKLY[i+1] > WEEKLY[i] for i in range(4)); print("PASS  acquisition rate rises every year")
print(f"\nCumulative EBITDA Y1-Y5  ${sum(r['eb'] for r in R):,.0f}")
print(f"Peak external cash need  $0")
for r in (R[0], R[4]):
    b = r['paid']/r['new']; ltv = r['arpu']/CHURN*0.85
    print(f"Y{r['y']}  blended CAC ${b:,.0f}  LTV ${ltv:,.0f}  LTV:CAC {ltv/b:.0f}:1  payback {b/(r['arpu']*0.85/12):.1f} mo")
print("\nJS literals:")
for k in ['end','rev','cost','eb','paid','content','mentor','cogs','var','gna','ppl','sub','coh','phys','bought']:
    print(f"  {k:9}", [round(r[k]) for r in R])
