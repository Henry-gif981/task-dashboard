"""Arithmetic behind the v2b visuals (derived values and drawn proportions).  python3 tools/check_v2b_math.py"""
ok = True
def chk(label, cond, detail):
    global ok; ok &= cond; print(("PASS " if cond else "FAIL ") + label + ": " + detail)
inst = {"ETS": 2005, "REACH": 2007, "GDPR": 2018, "Green Deal": 2019, "Taxonomy": 2020, "Climate Law": 2021, "Global Gateway": 2021, "CSRD": 2022, "CBAM": 2023, "AI Act": 2024}
n18 = sum(1 for y in inst.values() if y >= 2018)
chk("A4 title", n18 == 8 and len(inst) == 10, f"{n18} of {len(inst)} Table 2.6 instruments dated 2018 or later (CBAM counted from its 2023 transitional phase)")
chk("A5 bars", abs(43.3 / 76.0 * 300 - 170.9) < .1, f"2020 bar = 43.3/76.0 of the 2025 bar = {43.3 / 76.0:.3f} (drawn {43.3 / 76.0 * 300:.1f} of 300 units)")
chk("A1 / A6 EVIPA", 27 - 20 == 7, "20 of 27 ratified → 7 to go")
chk("B1 euro", 27 - 21 == 6, "21 of 27 use the euro → 6 outside (Section 2.1.1 names six)")
chk("A8 share note", round(27.8 / 496.7 * 100, 1) == 5.6, f"27.8 / 496.7 = {27.8 / 496.7 * 100:.2f}% ≈ 5.6%")
chk("A8 inflow", 3.25 > 2.5, f"2.5 → 3.25 = +{(3.25 / 2.5 - 1) * 100:.0f}% (not shown on the page)")
chk("A7b ranges", 84 < 86 < 99 and 65 < 100, "EU 84–86% → ≈99%; Vietnam ≈65% → rest (drawn to 100%)")
chk("B8 Chapter 1", 6 < 28 and 28 - 1 == 27, "6 founders (1951) → 28 (2013) → 27 after Brexit")
print("all checks passed" if ok else "SOME CHECKS FAILED")
