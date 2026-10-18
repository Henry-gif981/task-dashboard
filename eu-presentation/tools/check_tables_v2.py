"""Arithmetic check of Tables 3.5 and 3.6 (and the Table 3.7 / Table 2.3 notes) as printed in the report v5.

Usage: python3 tools/check_tables_v2.py
Prints each sum, difference and percentage change, recomputed from the parts, next to the printed value.
Differences of 0.1 come from rounding of the parts; anything larger is flagged.
"""
T35 = [  # year, EU imports from VN, EU exports to VN, total, EU balance (EUR bn)
    ("2019*", 34.5, 11.1, 45.6, -23.4), ("2020", 34.5, 8.8, 43.3, -25.8), ("2021", 38.5, 10.6, 49.2, -27.9),
    ("2022", 51.4, 12.7, 64.1, -38.7), ("2023", 47.8, 11.5, 59.3, -36.4), ("2024", 55.0, 12.3, 67.4, -42.7),
    ("2025", 63.9, 12.2, 76.0, -51.7)]
T35_CHANGE = {"imports": "+85%", "exports": "+10%", "total": "+67%", "deficit": "+121%"}
T36 = {  # indicator: (2019, 2024, 2025, printed change) in US$ bn
    "exports": (35.8, 51.7, 56.2, "+57%"), "imports": (14.0, 16.7, 17.6, "+26%"),
    "total": (49.8, 68.4, 74.0, "+49%"), "surplus": (21.8, 35.0, 38.6, "+77%")}

flags = 0
def line(label, printed, calc, tol=0.051):
    global flags
    d = round(calc - printed, 2)
    tag = "ok" if abs(d) <= tol else ("rounding (0.1)" if abs(d) <= 0.11 else "CHECK")
    if tag == "CHECK": flags += 1
    print(f"  {label:<34} printed {printed:>8}  recomputed {calc:>8.2f}  diff {d:+.2f}  {tag}")

def pct(a, b): return (b / a - 1) * 100

print("Table 3.5 (EUR bn): total = imports + exports; balance = exports - imports")
for y, im, ex, tot, bal in T35:
    line(f"{y} total", tot, im + ex); line(f"{y} balance", bal, ex - im)
a, z = T35[0], T35[-1]
print("Table 3.5 changes 2019-2025")
for k, i in (("imports", 1), ("exports", 2), ("total", 3)):
    c = pct(a[i], z[i]); print(f"  {k:<10} printed {T35_CHANGE[k]:>6}  recomputed {c:+.1f}%")
print(f"  deficit    printed {T35_CHANGE['deficit']:>6}  recomputed {pct(-a[4], -z[4]):+.1f}%")

print("\nTable 3.6 (US$ bn): total = exports + imports; surplus = exports - imports")
for j, y in enumerate(("2019", "2024", "2025")):
    e, m = T36["exports"][j], T36["imports"][j]
    line(f"{y} total" + (" (printed as ≈74)" if y == "2025" else ""), T36["total"][j], e + m, tol=0.31 if y == "2025" else 0.051)
    line(f"{y} surplus", T36["surplus"][j], e - m)
print("Table 3.6 changes 2019-2025")
for k, v in T36.items():
    c = pct(v[0], v[2]); print(f"  {k:<10} printed {v[3]:>6}  recomputed {c:+.1f}%" + ("  (with the unrounded 73.8: %+.1f%%)" % pct(v[0], 73.8) if k == "total" else ""))

print("\nTable 3.7 note: 27.8 / 496.7 = %.2f%% (printed ≈5.6%%)" % (27.8 / 496.7 * 100))
print("Table 3.7: 24.7 -> 27.8 = +%.1f bn (printed ≈ +US$3 bn)" % (27.8 - 24.7))
imp = 559.4 / 0.223
print("Table 2.3: EU imports implied by China 559.4 = 22.3%% -> %.0f; US 355.5 = %.1f%% (printed 14.1%%); UK 158.6 = %.1f%% (printed 6.3%%)" % (imp, 355.5 / imp * 100, 158.6 / imp * 100))
exp = 345.3 / 0.131
print("Table 2.3: EU exports implied by UK 345.3 = 13.1%% -> %.0f; exports - imports = %.0f (printed surplus 128)" % (exp, exp - imp))
print(f"\n{flags} value(s) flagged beyond rounding")
